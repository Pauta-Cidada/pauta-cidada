# Pauta Cidadã - AI Agent Instructions

## Project Overview
Pauta Cidadã is a civic tech platform that uses AI to translate complex legislative documents into accessible news, connecting abstract laws to people's daily lives. The platform measures popular approval and amplifies community voice on social media when relevance thresholds are reached.

## Architecture

### Multi-Backend Monorepo
- **backend-node** (NestJS): Primary API with TypeORM + PostgreSQL (currently inactive in docker-compose)
- **backend-python** (FastAPI): AI news generation pipeline with Supabase PostgreSQL + Storage, OpenAI GPT-4o-mini, and BigQuery
- **frontend** (React + Vite): User interface with shadcn/ui components

### Active Backend: Python (FastAPI)
**Complete AI News Pipeline:**
1. Fetch propositions from BigQuery (`basedosdados.br_camara_dados_abertos`)
2. Download PDF → Extract text (pdfplumber) → Upload to Supabase Storage
3. Generate news with OpenAI GPT-4o-mini via Pydantic AI
4. Save to Supabase PostgreSQL with voting/engagement tracking

**Key Services:**
- `PropositionService`: BigQuery queries for legislative data
- `PDFProcessorService`: Download + text extraction with retry logic
- `StorageService`: Supabase Storage upload (organized by year)
- `AINewsGeneratorService`: Pydantic AI + OpenAI GPT-4o-mini with structured output
- `NewsOrchestratorService`: Coordinates entire pipeline (individual/batch/background)

### Data Flow
```
BigQuery → [Proposition] → PDF Download → Text Extraction → 
Supabase Storage → AI Generation → Supabase PostgreSQL → REST API
```

## Development Workflow

### Python Backend Setup (CRITICAL)
**This project uses `uv` for Python dependency management, NOT pip/venv:**
```bash
cd backend-python
uv sync                    # Install dependencies from pyproject.toml
uv run uvicorn app.main:app --reload --port 8000
```

**Alembic Migrations:**
```bash
uv run alembic revision --autogenerate -m "description"
uv run alembic upgrade head
```

**Environment Configuration:**
- Python ≥3.13 required
- VS Code: Use `backend-python/.venv/bin/python` interpreter
- **Credentials:** Use `GOOGLE_APPLICATION_CREDENTIALS_JSON` (JSON string) for Docker/Portainer, not file path
- Helper script: `./scripts/convert-credentials.sh credentials.json` to format for .env

### Docker Development
```bash
# Install dependencies first (node_modules are volume-mounted)
cd backend-node && npm install && cd ..
cd frontend && npm install && cd ..
docker compose up --build
```

**Docker Networking:**
- IPv6 disabled by default for Portainer compatibility
- DNS: 1.1.1.1, 8.8.8.8 configured for external connectivity
- If Supabase connection fails in Portainer: Use Connection Pooler (port 6543) instead of direct (port 5432)

### Running Services
- **Backend-Python:** `uv run uvicorn app.main:app --reload` (port 8000)
- **Frontend:** `npm run dev` (port 5173)
- **Database:** Supabase PostgreSQL (external, not local container)

## Code Conventions

### Backend-Python (FastAPI)

**1. Repository Pattern:**
```python
# app/repositories/news_repository.py
class NewsRepository:
    async def create(self, data: dict) -> News:
        news = News(**data)
        self.db.add(news)
        await self.db.flush()
        return news
```

**2. Service Orchestration:**
- Services inject dependencies via `Depends()`
- Use `async with async_session_maker() as session:` for transactions
- Progress logging with emojis: `🚀`, `✓`, `❌`, `[1/6]`, `[2/6]`...

**3. Pydantic AI Integration:**
```python
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel

agent = Agent(
    model=OpenAIModel("gpt-4o-mini"),
    output_type=NewsOutput,  # NOT result_type
    system_prompt=SYSTEM_PROMPT,
    retries=3
)
result = await agent.run(content)
data = result.output  # NOT result.data
```

**4. SQL Queries:**
- Store in `app/queries/*.sql` files
- Load with `Path(__file__).resolve().parent.parent / "queries" / "file.sql"`
- Execute via BigQuery Client with credentials from env

**5. API Endpoints:**
```python
# Specific routes BEFORE parameterized routes
@router.post("/generate/batch")  # Must be before /{id}
@router.post("/generate/background")
@router.post("/generate/{proposition_id}")  # Last
```

### Backend-Node (NestJS/TypeScript)
- **Base Entity Pattern:** All extend `BaseEntity` with UUID, timestamps, soft-delete
- **Config Service:** Inject `ConfigService`, never use `process.env` directly
- **TypeORM Migrations:** `npm run typeorm migration:generate` (auto-builds first)

### Frontend (React/TypeScript)
- **Component Library:** shadcn/ui in `src/components/ui/`
- **Path Aliases:** `@/` → `src/` (configured in tsconfig)
- **Routing:** React Router v6 in `src/routes/index.tsx`
- **State:** Context API pattern (see `CopyContext.tsx`)

## Database & Storage

### Supabase PostgreSQL
- **Connection:** Uses `DATABASE_URL` from `.env`
- **Migrations:** Alembic in `backend-python/alembic/versions/`
- **Schema:** News table with JSONB metadata, pgvector support
- **Session:** `async_session_maker` from `app/db/session.py`

### Supabase Storage
- **Bucket:** `proposition-pdfs` (configured in env)
- **Structure:** `propositions/{year}/{id}/filename.pdf`
- **Access:** Via `StorageService` with `SUPABASE_SERVICE_ROLE_KEY`

## API Endpoints (Backend-Python)

### News Generation
- `POST /api/v1/news/generate/{id}` - Single (sync, 30s)
- `POST /api/v1/news/generate/batch?max_concurrent=3` - Batch sync (max 10)
- `POST /api/v1/news/generate/background` - Async batch (large volumes)

### News Query
- `GET /api/v1/news?limit=20&offset=0` - List with filters
- `GET /api/v1/news/{id}` - Details
- `POST /api/v1/news/{id}/vote` - Upvote/downvote

### Propositions
- `GET /api/v1/propositions?limit=10&sigla=PL&ano=2025` - BigQuery data

## Testing
- **Python:** `pytest` (configured in pyproject.toml)
- **Validation:** `uv run alembic check` for migration issues
- **Manual:** See `backend-python/MANUAL.md` for curl examples

## Common Pitfalls

1. **Pydantic AI API:** Use `output_type` (not `result_type`), access `result.output` (not `.data`)
2. **Route Ordering:** FastAPI matches first, put specific routes (`/generate/batch`) before parameterized (`/generate/{id}`)
3. **Docker Connectivity:** If "Network unreachable" with Supabase, use Connection Pooler (port 6543)
4. **Google Credentials:** Use `GOOGLE_APPLICATION_CREDENTIALS_JSON` (JSON string) for Docker, not file path
5. **Alembic Sessions:** Commit transactions explicitly: `await session.commit()`
6. **Validation Limits:** AI generates longer text than defaults - NewsOutput: title max=500, summary=100-500, full_content=500-3000

## File Locations Reference
- **Python API routes:** `backend-python/src/app/api/v1/`
- **Services:** `backend-python/src/app/services/`
- **Repositories:** `backend-python/src/app/repositories/`
- **Models (Pydantic):** `backend-python/src/app/models/`
- **DB Models (SQLAlchemy):** `backend-python/src/app/db/models/`
- **Alembic migrations:** `backend-python/alembic/versions/`
- **SQL queries:** `backend-python/src/app/queries/`
- **Frontend manual:** `backend-python/MANUAL.md` (integration guide)

## Deployment (Portainer)

**Environment Variables:**
- Use `GOOGLE_APPLICATION_CREDENTIALS_JSON` with full JSON (not file path)
- Convert: `./scripts/convert-credentials.sh credentials.json`
- Supabase: Use Connection Pooler for better Docker compatibility
- Example in `.env.example` with comments

**Docker Compose:**
- IPv6 disabled by default (enable if needed: `enable_ipv6: true`)
- DNS configured for external connectivity (1.1.1.1, 8.8.8.8)
- All Supabase env vars must be explicit (not just `env_file`)
