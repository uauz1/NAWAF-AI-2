import importlib.util
import os
import time
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

CREWAI_AVAILABLE = importlib.util.find_spec('crewai') is not None

app = FastAPI(title='NAWAF HQ Agent Runtime', version='1.2.0')

GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini/gemini-2.5-flash').strip()
OPENHANDS_API_URL = os.getenv('OPENHANDS_API_URL', '').strip().rstrip('/')


class OrchestrateRequest(BaseModel):
    action: str = 'orchestrate'
    params: Dict[str, Any] = Field(default_factory=dict)


class ExecuteRequest(BaseModel):
    action: str
    params: Dict[str, Any] = Field(default_factory=dict)


def crew_status(api_key: str = '') -> Dict[str, Any]:
    if not CREWAI_AVAILABLE:
        return {'status': 'ERROR', 'error': 'CrewAI package is not installed'}
    if not api_key:
        return {'status': 'READY', 'auth': 'per-request', 'model': GEMINI_MODEL}
    return {'status': 'CONNECTED', 'auth': 'per-request', 'model': GEMINI_MODEL}


async def openhands_status() -> Dict[str, Any]:
    if not OPENHANDS_API_URL:
        return {'status': 'NOT_CONFIGURED'}
    try:
        import httpx
        async with httpx.AsyncClient(timeout=3.0) as client:
            res = await client.get(f'{OPENHANDS_API_URL}/health')
        return {'status': 'CONNECTED' if res.is_success else 'ERROR', 'httpStatus': res.status_code}
    except Exception as exc:
        return {'status': 'ERROR', 'error': str(exc)}


@app.get('/health')
async def health() -> Dict[str, Any]:
    return {
        'ok': CREWAI_AVAILABLE,
        'service': 'nawaf-hq-agent-runtime',
        'crewai': crew_status(),
        'openhands': await openhands_status(),
        'timestamp': time.time(),
    }


@app.get('/status')
async def status() -> Dict[str, Any]:
    return {
        'crewai': crew_status(),
        'openhands': await openhands_status(),
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
        backstory='You must use the supplied project and company context. Do not invent files, test results, progress, approvals, or completed actions.',
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
            'Analyze the request and verified context below. Produce an execution plan with concrete steps, dependencies, '
            'assigned role, required real tools, and explicit blockers. Do not mark any step complete. '
            f'Context: {context_text}'
        ),
        expected_output='A concise JSON-like execution plan with steps, blockers, required tools, and approval needs. No fabricated results.',
        agent=coordinator,
    )

    review = Task(
        description=(
            'Review the proposed plan for feasibility and truthfulness. Remove claims that require unavailable tools. '
            'Return what can be done now, what needs OpenHands or another real executor, and what requires Nawaf approval.'
        ),
        expected_output='A final truthful execution brief suitable for NAWAF HQ, clearly separating executable-now, blocked, and approval-required work.',
        agent=specialist,
        context=[planning],
    )

    return Crew(agents=[coordinator, specialist], tasks=[planning, review], process=Process.sequential, verbose=False)


@app.post('/api/orchestrate')
async def orchestrate(payload: OrchestrateRequest, x_gemini_key: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    api_key = (x_gemini_key or '').strip()
    if not api_key:
        raise HTTPException(status_code=503, detail='X-Gemini-Key is required for real CrewAI execution')
    state = crew_status(api_key)
    if state['status'] != 'CONNECTED':
        return {'ok': False, 'status': state['status'], 'error': state.get('error'), 'output': None}

    started = time.time()
    try:
        crew = make_crew(payload.params, api_key)
        result = crew.kickoff()
        raw = getattr(result, 'raw', None) or str(result)
        return {
            'ok': True,
            'status': 'SUCCESS',
            'engine': 'crewai',
            'output': {'text': raw},
            'durationMs': round((time.time() - started) * 1000),
        }
    except Exception as exc:
        return {
            'ok': False,
            'status': 'ERROR',
            'engine': 'crewai',
            'error': str(exc),
            'output': None,
            'durationMs': round((time.time() - started) * 1000),
        }


@app.post('/api/execute')
async def execute(payload: ExecuteRequest) -> Dict[str, Any]:
    if not OPENHANDS_API_URL:
        return {
            'ok': False,
            'status': 'NOT_CONFIGURED',
            'engine': 'openhands',
            'error': 'OPENHANDS_API_URL is not configured. No execution was performed.',
            'output': None,
        }

    import httpx
    started = time.time()
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f'{OPENHANDS_API_URL}/api/execute',
                json={'action': payload.action, 'params': payload.params},
            )
        try:
            data: Any = response.json()
        except Exception:
            data = {'text': response.text}
        return {
            'ok': response.is_success,
            'status': 'SUCCESS' if response.is_success else 'ERROR',
            'engine': 'openhands',
            'output': data if response.is_success else None,
            'error': None if response.is_success else data,
            'durationMs': round((time.time() - started) * 1000),
        }
    except Exception as exc:
        return {
            'ok': False,
            'status': 'ERROR',
            'engine': 'openhands',
            'error': str(exc),
            'output': None,
            'durationMs': round((time.time() - started) * 1000),
        }
