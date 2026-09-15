import asyncio
import base64
import importlib.util
import os
import shutil
import subprocess
import tempfile
import time
from collections import deque
from pathlib import Path
from typing import Any, Deque, Dict, List, Optional
from urllib.parse import urlparse

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

CREWAI_AVAILABLE = importlib.util.find_spec('crewai') is not None
OPENHANDS_AVAILABLE = importlib.util.find_spec('openhands.sdk') is not None and importlib.util.find_spec('openhands.tools') is not None

app = FastAPI(title='NAWAF HQ Agent Runtime', version='1.6.1')

GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini/gemini-3.6-flash').strip()
DEFAULT_REPO_URL = os.getenv('DEFAULT_REPO_URL', 'https://github.com/uauz1/NAWAF-AI-2').strip()
ALLOWED_GITHUB_OWNER = os.getenv('ALLOWED_GITHUB_OWNER', 'uauz1').strip()
MAX_INSTRUCTION_CHARS = 12000
MAX_EXECUTIONS_PER_MINUTE = 8
MAX_OPENHANDS_ITERATIONS = max(6, min(20, int(os.getenv('OPENHANDS_MAX_ITERATIONS', '12'))))
EXECUTION_SEMAPHORE = asyncio.Semaphore(1)
RECENT_EXECUTIONS: Deque[float] = deque()


class OrchestrateRequest(BaseModel):
    action: str = 'orchestrate'
    params: Dict[str, Any] = Field(default_factory=dict)


class ExecuteRequest(BaseModel):
    action: str
    params: Dict[str, Any] = Field(default_factory=dict)


class ApplyRequest(BaseModel):
    repository: str
    baseCommit: str
    diff: str
    commitMessage: str = 'Apply approved NAWAF HQ change'


def enforce_rate_limit() -> None:
    now = time.monotonic()
    while RECENT_EXECUTIONS and now - RECENT_EXECUTIONS[0] > 60:
        RECENT_EXECUTIONS.popleft()
    if len(RECENT_EXECUTIONS) >= MAX_EXECUTIONS_PER_MINUTE:
        raise HTTPException(status_code=429, detail='Runtime execution rate limit reached. Try again shortly.')
    RECENT_EXECUTIONS.append(now)


def crew_status(api_key: str = '') -> Dict[str, Any]:
    if not CREWAI_AVAILABLE:
        return {'status': 'ERROR', 'error': 'CrewAI package is not installed'}
    if not api_key:
        return {'status': 'READY', 'auth': 'per-request', 'model': GEMINI_MODEL}
    return {'status': 'CONNECTED', 'auth': 'per-request', 'model': GEMINI_MODEL}


def openhands_status(api_key: str = '') -> Dict[str, Any]:
    if not OPENHANDS_AVAILABLE:
        return {'status': 'ERROR', 'error': 'Official OpenHands SDK/tools packages are not installed'}
    if not api_key:
        return {'status': 'READY', 'auth': 'per-request', 'model': GEMINI_MODEL, 'mode': 'official-sdk-file-workspace'}
    return {'status': 'CONNECTED', 'auth': 'per-request', 'model': GEMINI_MODEL, 'mode': 'official-sdk-file-workspace'}


@app.get('/health')
async def health() -> Dict[str, Any]:
    return {
        'ok': CREWAI_AVAILABLE and OPENHANDS_AVAILABLE,
        'service': 'nawaf-hq-agent-runtime',
        'version': app.version,
        'crewai': crew_status(),
        'openhands': openhands_status(),
        'githubPrivateRepo': {'status': 'READY_FOR_TOKEN'},
        'githubWrite': {'status': 'READY_FOR_TOKEN'},
        'executionConcurrency': 1,
        'executionRateLimitPerMinute': MAX_EXECUTIONS_PER_MINUTE,
        'maxOpenHandsIterations': MAX_OPENHANDS_ITERATIONS,
        'timestamp': time.time(),
    }


@app.get('/status')
async def status() -> Dict[str, Any]:
    return {
        'crewai': crew_status(),
        'openhands': openhands_status(),
        'githubPrivateRepo': {'status': 'READY_FOR_TOKEN'},
        'githubWrite': {'status': 'READY_FOR_TOKEN'},
        'maxOpenHandsIterations': MAX_OPENHANDS_ITERATIONS,
    }


def make_crew(params: Dict[str, Any], api_key: str):
    from crewai import Agent, Crew, LLM, Process, Task

    goal = str(params.get('goal') or params.get('instruction') or params.get('objective') or '').strip()
    if not goal:
        raise ValueError('A goal/instruction is required')
    if len(goal) > MAX_INSTRUCTION_CHARS:
        raise ValueError('Instruction is too long')

    employee = params.get('employee') or {}
    company = params.get('companyState') or {}
    project = params.get('project') or {}
    available_tools: List[str] = list(params.get('availableTools') or [])

    llm = LLM(model=GEMINI_MODEL, api_key=api_key, temperature=0.2)
    coordinator = Agent(
        role='NAWAF HQ Operations Coordinator',
        goal='Turn Nawaf directives into truthful, executable work plans using only verified context and available tools.',
        backstory='You are the orchestration layer for NAWAF HQ. Never claim execution without a real tool result.',
        allow_delegation=False,
        verbose=False,
        llm=llm,
    )
    specialist_role = str(employee.get('position') or employee.get('role') or 'Company Specialist')
    specialist_name = str(employee.get('name') or 'Assigned Specialist')
    specialist = Agent(
        role=f'{specialist_name} — {specialist_role}',
        goal=f'Handle the request strictly within the responsibilities of {specialist_role}.',
        backstory='Use supplied project/company context only. Never invent files, tests, progress, approvals, or completed actions.',
        allow_delegation=False,
        verbose=False,
        llm=llm,
    )
    context_text = {
        'goal': goal,
        'project': project,
        'companyState': company,
        'availableTools': available_tools,
        'employee': employee,
    }
    planning = Task(
        description=(
            'Analyze the request and verified context. Produce concrete executable steps, dependencies, assigned role, '
            'required real tools, blockers and approval needs. Never mark a step complete without tool evidence. '
            f'Context: {context_text}'
        ),
        expected_output='A concise execution plan separating executable-now, blocked, and approval-required work.',
        agent=coordinator,
    )
    review = Task(
        description='Review the plan for feasibility and truthfulness. Remove unsupported claims and identify required execution tools.',
        expected_output='A final truthful execution brief for NAWAF HQ.',
        agent=specialist,
        context=[planning],
    )
    return Crew(agents=[coordinator, specialist], tasks=[planning, review], process=Process.sequential, verbose=False)


@app.post('/api/orchestrate')
async def orchestrate(payload: OrchestrateRequest, x_gemini_key: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    api_key = (x_gemini_key or '').strip()
    if not api_key:
        raise HTTPException(status_code=503, detail='X-Gemini-Key is required for real CrewAI execution')
    if crew_status(api_key)['status'] != 'CONNECTED':
        return {'ok': False, 'status': 'ERROR', 'engine': 'crewai', 'output': None, 'error': 'CrewAI unavailable'}
    enforce_rate_limit()
    started = time.time()
    try:
        async with EXECUTION_SEMAPHORE:
            result = await asyncio.to_thread(lambda: make_crew(payload.params, api_key).kickoff())
        raw = getattr(result, 'raw', None) or str(result)
        return {'ok': True, 'status': 'SUCCESS', 'engine': 'crewai', 'output': {'text': raw}, 'durationMs': round((time.time() - started) * 1000)}
    except Exception as exc:
        return {'ok': False, 'status': 'ERROR', 'engine': 'crewai', 'error': str(exc), 'output': None, 'durationMs': round((time.time() - started) * 1000)}


def validate_repo_url(repo_url: str) -> str:
    repo_url = repo_url.strip().removesuffix('.git')
    parsed = urlparse(repo_url)
    if parsed.scheme != 'https' or parsed.netloc != 'github.com':
        raise ValueError('Only https://github.com repositories are allowed')
    parts = parsed.path.strip('/').split('/')
    if len(parts) != 2 or parts[0] != ALLOWED_GITHUB_OWNER:
        raise ValueError(f'Repository must be under github.com/{ALLOWED_GITHUB_OWNER}/')
    return f'https://github.com/{parts[0]}/{parts[1]}'


def run(cmd: List[str], cwd: str, timeout: int = 120, env: Optional[Dict[str, str]] = None) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, cwd=cwd, timeout=timeout, text=True, capture_output=True, check=False, env=env)


def sanitized_error(text: str, token: str) -> str:
    safe = text or ''
    if token:
        safe = safe.replace(token, '[REDACTED]')
    return safe[-5000:]


def github_auth_env(token: str) -> Optional[Dict[str, str]]:
    if not token:
        return None
    env = os.environ.copy()
    basic = base64.b64encode(f'x-access-token:{token}'.encode('utf-8')).decode('ascii')
    env['GIT_CONFIG_COUNT'] = '1'
    env['GIT_CONFIG_KEY_0'] = 'http.extraHeader'
    env['GIT_CONFIG_VALUE_0'] = f'Authorization: Basic {basic}'
    env['GIT_TERMINAL_PROMPT'] = '0'
    return env


def clone_repository(repo_url: str, workspace: str, temp_root: str, github_token: str = '') -> subprocess.CompletedProcess[str]:
    return run(['git', 'clone', '--depth', '1', f'{repo_url}.git', workspace], temp_root, 120, github_auth_env(github_token))


def compact_output(process: subprocess.CompletedProcess[str], limit: int = 4000) -> str:
    text = (process.stdout or process.stderr or '').strip()
    return text[-limit:]


def verify_workspace(workspace: str, include_build: bool = True) -> List[Dict[str, Any]]:
    checks: List[Dict[str, Any]] = []
    package_json = Path(workspace) / 'package.json'
    if not package_json.exists():
        return checks

    install = run(['npm', 'install', '--no-audit', '--no-fund', '--package-lock=false'], workspace, 180)
    checks.append({'name': 'npm install', 'ok': install.returncode == 0, 'output': compact_output(install)})
    if install.returncode != 0:
        return checks

    scripts = ['lint', 'test'] + (['build'] if include_build else [])
    for script in scripts:
        check = run(['npm', 'run', script, '--if-present'], workspace, 180)
        checks.append({'name': f'npm run {script}', 'ok': check.returncode == 0, 'output': compact_output(check)})
    return checks


def execute_openhands(params: Dict[str, Any], api_key: str, github_token: str = '') -> Dict[str, Any]:
    from openhands.sdk import Agent, Conversation, LLM, Tool
    from openhands.tools.file_editor import FileEditorTool
    from openhands.tools.task_tracker import TaskTrackerTool

    instruction = str(params.get('instruction') or params.get('objective') or params.get('taskTitle') or params.get('goal') or '').strip()
    if not instruction:
        raise ValueError('An instruction/objective is required for OpenHands execution')
    if len(instruction) > MAX_INSTRUCTION_CHARS:
        raise ValueError('Instruction is too long')

    repo_url = validate_repo_url(str(params.get('repoUrl') or DEFAULT_REPO_URL))
    temp_root = tempfile.mkdtemp(prefix='nawaf-openhands-')
    workspace = str(Path(temp_root) / 'repo')
    try:
        clone = clone_repository(repo_url, workspace, temp_root, github_token)
        if clone.returncode != 0:
            detail = sanitized_error(clone.stderr.strip(), github_token)
            if not github_token and ('Authentication failed' in detail or 'could not read Username' in detail or 'not found' in detail.lower()):
                raise RuntimeError('Private repository access requires a GitHub token in the backend.')
            raise RuntimeError(f'git clone failed: {detail}')
        base = run(['git', 'rev-parse', 'HEAD'], workspace, 20)
        if base.returncode != 0:
            raise RuntimeError('Could not resolve repository HEAD')
        base_commit = base.stdout.strip()

        llm = LLM(model=GEMINI_MODEL, api_key=api_key)
        agent = Agent(
            llm=llm,
            tools=[
                Tool(name=FileEditorTool.name),
                Tool(name=TaskTrackerTool.name),
            ],
        )
        conversation = Conversation(agent=agent, workspace=workspace, max_iteration_per_run=MAX_OPENHANDS_ITERATIONS)
        message = (
            'You are the real technical file executor for NAWAF HQ. Work only inside the provided repository workspace. '
            'Inspect and edit repository files as needed using the available file tools. Do not use or request shell access. '
            'Do not fabricate success. Do not commit or push. Verification commands are executed separately by the trusted runtime after you finish. '
            f'You have a strict {MAX_OPENHANDS_ITERATIONS}-step execution budget because this runs behind a synchronous production gateway. '
            'Prioritize the requested file edits immediately; avoid unnecessary exploration or narration. If the task cannot be completed with the available file tools, stop and explain the exact blocker.\n\nTASK:\n' + instruction
        )
        conversation.send_message(message)
        conversation.run()

        checks = verify_workspace(workspace, include_build=True)
        verification_passed = bool(checks) and all(check['ok'] for check in checks)
        diff = run(['git', 'diff', '--no-ext-diff', '--binary'], workspace, 30)
        changed = run(['git', 'status', '--short'], workspace, 30)
        changed_files = [line[3:].strip() if len(line) > 3 else line.strip() for line in changed.stdout.splitlines() if line.strip()]
        has_changes = bool(changed_files and diff.stdout.strip())
        return {
            'repository': repo_url,
            'baseCommit': base_commit,
            'workspaceMode': 'ephemeral-clone-file-tools-only',
            'changedFiles': changed_files,
            'diff': diff.stdout[:180000],
            'diffTruncated': len(diff.stdout) > 180000,
            'hasChanges': has_changes,
            'verificationPassed': verification_passed,
            'checks': checks,
            'instruction': instruction,
            'summary': (
                'OpenHands produced repository changes and all configured verification checks passed.'
                if has_changes and verification_passed
                else 'OpenHands produced repository changes, but one or more verification checks failed or were unavailable.'
                if has_changes
                else 'OpenHands completed without producing a repository diff.'
            ),
            'note': 'OpenHands used real file tools in an isolated clone. Shell verification is run only by trusted runtime code. Any GitHub write still requires explicit approval and write credentials.',
        }
    finally:
        shutil.rmtree(temp_root, ignore_errors=True)


@app.post('/api/execute')
async def execute(payload: ExecuteRequest, x_gemini_key: Optional[str] = Header(default=None), x_github_token: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    api_key = (x_gemini_key or '').strip()
    github_token = (x_github_token or '').strip()
    if not api_key:
        raise HTTPException(status_code=503, detail='X-Gemini-Key is required for real OpenHands execution')
    state = openhands_status(api_key)
    if state['status'] != 'CONNECTED':
        return {'ok': False, 'status': state['status'], 'engine': 'openhands', 'output': None, 'error': state.get('error')}

    enforce_rate_limit()
    started = time.time()
    try:
        async with EXECUTION_SEMAPHORE:
            output = await asyncio.to_thread(execute_openhands, payload.params, api_key, github_token)
        status = 'SUCCESS' if output.get('verificationPassed') else 'REVIEW_REQUIRED'
        return {'ok': True, 'status': status, 'engine': 'openhands-sdk', 'action': payload.action, 'output': output, 'durationMs': round((time.time() - started) * 1000)}
    except Exception as exc:
        return {'ok': False, 'status': 'ERROR', 'engine': 'openhands-sdk', 'action': payload.action, 'error': sanitized_error(str(exc), github_token), 'output': None, 'durationMs': round((time.time() - started) * 1000)}


def apply_approved_change(payload: ApplyRequest, github_token: str) -> Dict[str, Any]:
    repo_url = validate_repo_url(payload.repository)
    if not payload.baseCommit or not payload.diff.strip():
        raise ValueError('baseCommit and non-empty diff are required')
    if len(payload.diff) > 250000:
        raise ValueError('Diff is too large to apply safely')

    temp_root = tempfile.mkdtemp(prefix='nawaf-apply-')
    workspace = str(Path(temp_root) / 'repo')
    try:
        clone = clone_repository(repo_url, workspace, temp_root, github_token)
        if clone.returncode != 0:
            raise RuntimeError(f'git clone failed: {sanitized_error(clone.stderr.strip(), github_token)}')
        head = run(['git', 'rev-parse', 'HEAD'], workspace, 20)
        current_head = head.stdout.strip()
        if current_head != payload.baseCommit:
            return {
                'ok': False,
                'status': 'CONFLICT',
                'error': 'Repository changed after OpenHands produced this proposal. Re-run the task before approval.',
                'expectedBaseCommit': payload.baseCommit,
                'currentCommit': current_head,
            }

        patch_path = Path(temp_root) / 'approved.patch'
        patch_path.write_text(payload.diff, encoding='utf-8')
        check = run(['git', 'apply', '--check', '--binary', str(patch_path)], workspace, 30)
        if check.returncode != 0:
            raise RuntimeError(f'git apply --check failed: {check.stderr.strip()}')
        applied = run(['git', 'apply', '--binary', str(patch_path)], workspace, 30)
        if applied.returncode != 0:
            raise RuntimeError(f'git apply failed: {applied.stderr.strip()}')

        diff_check = run(['git', 'diff', '--check'], workspace, 30)
        if diff_check.returncode != 0:
            raise RuntimeError(f'git diff --check failed: {diff_check.stderr.strip()}')

        checks: List[Dict[str, Any]] = [{'name': 'git diff --check', 'ok': True, 'output': compact_output(diff_check)}]
        project_checks = verify_workspace(workspace, include_build=True)
        checks.extend(project_checks)
        failed_checks = [entry for entry in checks if not entry.get('ok')]
        if failed_checks:
            names = ', '.join(str(entry.get('name')) for entry in failed_checks)
            raise RuntimeError(f'Approved change failed verification: {names}')

        run(['git', 'config', 'user.name', 'NAWAF HQ Automation'], workspace, 20)
        run(['git', 'config', 'user.email', 'nawaf-hq@users.noreply.github.com'], workspace, 20)
        added = run(['git', 'add', '-A'], workspace, 20)
        if added.returncode != 0:
            raise RuntimeError('git add failed')
        status = run(['git', 'status', '--porcelain'], workspace, 20)
        if not status.stdout.strip():
            return {'ok': False, 'status': 'NO_CHANGES', 'error': 'Approved proposal produced no repository changes.'}

        message = (payload.commitMessage or 'Apply approved NAWAF HQ change').strip().replace('\n', ' ')[:180]
        commit = run(['git', 'commit', '-m', message], workspace, 60)
        if commit.returncode != 0:
            raise RuntimeError(f'git commit failed: {commit.stderr.strip()}')
        sha = run(['git', 'rev-parse', 'HEAD'], workspace, 20).stdout.strip()

        push = run(['git', 'push', f'{repo_url}.git', 'HEAD:main'], workspace, 120, github_auth_env(github_token))
        if push.returncode != 0:
            raise RuntimeError(f'git push failed: {sanitized_error(push.stderr, github_token)}')

        changed = [line[3:].strip() if len(line) > 3 else line.strip() for line in status.stdout.splitlines() if line.strip()]
        return {
            'ok': True,
            'status': 'APPLIED',
            'repository': repo_url,
            'commitSha': sha,
            'changedFiles': changed,
            'checks': checks,
        }
    finally:
        shutil.rmtree(temp_root, ignore_errors=True)


@app.post('/api/apply')
async def apply_change(payload: ApplyRequest, x_github_token: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    token = (x_github_token or '').strip()
    if not token:
        raise HTTPException(status_code=503, detail='X-GitHub-Token is required to write an approved change to GitHub')
    enforce_rate_limit()
    started = time.time()
    try:
        async with EXECUTION_SEMAPHORE:
            result = await asyncio.to_thread(apply_approved_change, payload, token)
        result['durationMs'] = round((time.time() - started) * 1000)
        return result
    except Exception as exc:
        return {
            'ok': False,
            'status': 'ERROR',
            'error': sanitized_error(str(exc), token),
            'durationMs': round((time.time() - started) * 1000),
        }
