import importlib.util
import os
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

CREWAI_AVAILABLE = importlib.util.find_spec('crewai') is not None
OPENHANDS_AVAILABLE = importlib.util.find_spec('openhands.sdk') is not None and importlib.util.find_spec('openhands.tools') is not None

app = FastAPI(title='NAWAF HQ Agent Runtime', version='1.4.0')

GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini/gemini-2.5-flash').strip()
DEFAULT_REPO_URL = os.getenv('DEFAULT_REPO_URL', 'https://github.com/uauz1/NAWAF-AI-2').strip()
ALLOWED_GITHUB_OWNER = os.getenv('ALLOWED_GITHUB_OWNER', 'uauz1').strip()


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
        return {'status': 'READY', 'auth': 'per-request', 'model': GEMINI_MODEL, 'mode': 'official-sdk-local-workspace'}
    return {'status': 'CONNECTED', 'auth': 'per-request', 'model': GEMINI_MODEL, 'mode': 'official-sdk-local-workspace'}


@app.get('/health')
async def health() -> Dict[str, Any]:
    return {
        'ok': CREWAI_AVAILABLE and OPENHANDS_AVAILABLE,
        'service': 'nawaf-hq-agent-runtime',
        'crewai': crew_status(),
        'openhands': openhands_status(),
        'githubWrite': {'status': 'READY_FOR_TOKEN'},
        'timestamp': time.time(),
    }


@app.get('/status')
async def status() -> Dict[str, Any]:
    return {
        'crewai': crew_status(),
        'openhands': openhands_status(),
        'githubWrite': {'status': 'READY_FOR_TOKEN'},
    }


def make_crew(params: Dict[str, Any], api_key: str):
    from crewai import Agent, Crew, LLM, Process, Task

    goal = str(params.get('goal') or params.get('instruction') or params.get('objective') or '').strip()
    if not goal:
        raise ValueError('A goal/instruction is required')

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
    started = time.time()
    try:
        result = make_crew(payload.params, api_key).kickoff()
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


def run(cmd: List[str], cwd: str, timeout: int = 120) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, cwd=cwd, timeout=timeout, text=True, capture_output=True, check=False)


def execute_openhands(params: Dict[str, Any], api_key: str) -> Dict[str, Any]:
    from openhands.sdk import Agent, Conversation, LLM, Tool
    from openhands.tools.file_editor import FileEditorTool
    from openhands.tools.task_tracker import TaskTrackerTool
    from openhands.tools.terminal import TerminalTool

    instruction = str(params.get('instruction') or params.get('objective') or params.get('taskTitle') or params.get('goal') or '').strip()
    if not instruction:
        raise ValueError('An instruction/objective is required for OpenHands execution')

    repo_url = validate_repo_url(str(params.get('repoUrl') or DEFAULT_REPO_URL))
    temp_root = tempfile.mkdtemp(prefix='nawaf-openhands-')
    workspace = str(Path(temp_root) / 'repo')
    try:
        clone = run(['git', 'clone', '--depth', '1', f'{repo_url}.git', workspace], temp_root, 120)
        if clone.returncode != 0:
            raise RuntimeError(f'git clone failed: {clone.stderr.strip()}')
        base = run(['git', 'rev-parse', 'HEAD'], workspace, 20)
        if base.returncode != 0:
            raise RuntimeError('Could not resolve repository HEAD')
        base_commit = base.stdout.strip()

        llm = LLM(model=GEMINI_MODEL, api_key=api_key)
        agent = Agent(
            llm=llm,
            tools=[
                Tool(name=TerminalTool.name),
                Tool(name=FileEditorTool.name),
                Tool(name=TaskTrackerTool.name),
            ],
        )
        conversation = Conversation(agent=agent, workspace=workspace)
        message = (
            'You are the real technical executor for NAWAF HQ. Work only inside the provided repository. '
            'Perform the requested task for real using terminal/file tools. Run relevant tests or checks before finishing. '
            'Do not fabricate success. Do not commit or push. If blocked, stop and explain the exact blocker.\n\nTASK:\n' + instruction
        )
        conversation.send_message(message)
        conversation.run()

        diff = run(['git', 'diff', '--no-ext-diff', '--binary'], workspace, 30)
        changed = run(['git', 'status', '--short'], workspace, 30)
        changed_files = [line for line in changed.stdout.splitlines() if line.strip()]
        return {
            'repository': repo_url,
            'baseCommit': base_commit,
            'workspaceMode': 'ephemeral-clone',
            'changedFiles': changed_files,
            'diff': diff.stdout[:180000],
            'diffTruncated': len(diff.stdout) > 180000,
            'hasChanges': bool(changed_files and diff.stdout.strip()),
            'instruction': instruction,
            'note': 'OpenHands executed in a real isolated clone. Any repository change requires CEO approval before GitHub write.',
        }
    finally:
        shutil.rmtree(temp_root, ignore_errors=True)


@app.post('/api/execute')
async def execute(payload: ExecuteRequest, x_gemini_key: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    api_key = (x_gemini_key or '').strip()
    if not api_key:
        raise HTTPException(status_code=503, detail='X-Gemini-Key is required for real OpenHands execution')
    state = openhands_status(api_key)
    if state['status'] != 'CONNECTED':
        return {'ok': False, 'status': state['status'], 'engine': 'openhands', 'output': None, 'error': state.get('error')}

    started = time.time()
    try:
        output = execute_openhands(payload.params, api_key)
        return {'ok': True, 'status': 'SUCCESS', 'engine': 'openhands-sdk', 'action': payload.action, 'output': output, 'durationMs': round((time.time() - started) * 1000)}
    except Exception as exc:
        return {'ok': False, 'status': 'ERROR', 'engine': 'openhands-sdk', 'action': payload.action, 'error': str(exc), 'output': None, 'durationMs': round((time.time() - started) * 1000)}


def sanitized_error(text: str, token: str) -> str:
    safe = text or ''
    if token:
        safe = safe.replace(token, '[REDACTED]')
    return safe[-5000:]


def apply_approved_change(payload: ApplyRequest, github_token: str) -> Dict[str, Any]:
    repo_url = validate_repo_url(payload.repository)
    if not payload.baseCommit or not payload.diff.strip():
        raise ValueError('baseCommit and non-empty diff are required')
    if len(payload.diff) > 250000:
        raise ValueError('Diff is too large to apply safely')

    temp_root = tempfile.mkdtemp(prefix='nawaf-apply-')
    workspace = str(Path(temp_root) / 'repo')
    try:
        clone = run(['git', 'clone', '--depth', '1', f'{repo_url}.git', workspace], temp_root, 120)
        if clone.returncode != 0:
            raise RuntimeError(f'git clone failed: {clone.stderr.strip()}')
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

        checks: List[Dict[str, Any]] = [{'name': 'git diff --check', 'ok': True}]
        package_json = Path(workspace) / 'package.json'
        if package_json.exists():
            install = run(['npm', 'install', '--no-audit', '--no-fund'], workspace, 180)
            checks.append({'name': 'npm install', 'ok': install.returncode == 0})
            if install.returncode != 0:
                raise RuntimeError(f'npm install failed: {install.stderr.strip()}')
            for script in ('lint', 'build'):
                has_script = run(['npm', 'run', script, '--if-present'], workspace, 180)
                checks.append({'name': f'npm run {script}', 'ok': has_script.returncode == 0})
                if has_script.returncode != 0:
                    raise RuntimeError(f'npm run {script} failed: {(has_script.stderr or has_script.stdout).strip()}')

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

        parsed = urlparse(repo_url)
        authed = f'https://x-access-token:{github_token}@github.com{parsed.path}.git'
        push = run(['git', 'push', authed, 'HEAD:main'], workspace, 120)
        if push.returncode != 0:
            raise RuntimeError(f'git push failed: {sanitized_error(push.stderr, github_token)}')

        changed = [line for line in status.stdout.splitlines() if line.strip()]
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
    started = time.time()
    try:
        result = apply_approved_change(payload, token)
        result['durationMs'] = round((time.time() - started) * 1000)
        return result
    except Exception as exc:
        return {
            'ok': False,
            'status': 'ERROR',
            'error': sanitized_error(str(exc), token),
            'durationMs': round((time.time() - started) * 1000),
        }
