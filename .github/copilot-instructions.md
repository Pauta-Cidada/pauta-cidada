# Pauta Cidadã - AI Agent Instructions

## Project Overview
Pauta Cidadã is a civic tech platform that uses AI to translate complex legislative documents into accessible news, connecting abstract laws to people's daily lives. The platform measures popular approval and amplifies community voice on social media when relevance thresholds are reached.

## Architecture

### Multi-Backend Monorepo
- **backend-node** (NestJS): Primary API with TypeORM + PostgreSQL (pgvector enabled)
- **backend-python** (FastAPI): AI/data processing service with Google BigQuery integration
- **frontend** (React + Vite): User interface with shadcn/ui components

All services run in Docker containers with shared network `pauta-cidada-network`.

### Key Integration Points
- Backend-Node uses PostgreSQL at `localhost:5432` (configured via `PostgresConfigService`)
- Backend-Python queries Brazilian legislative data from BigQuery (`basedosdados.br_camara_dados_abertos`)
- Frontend communicates with backends (ports not yet standardized - check docker-compose.yml)
- All services share `.env` at project root

## Development Workflow

### Python Backend Setup (CRITICAL)
**This project uses `uv` for Python dependency management, NOT pip/venv:**
```bash
cd backend-python
uv sync                    # Install dependencies from pyproject.toml
uv run uvicorn app.main:app --reload  # Run server
```

**Environment Configuration:**
- Python ≥3.13 required (declared in `pyproject.toml`)
- VS Code must use `.venv/bin/python` interpreter (not system Python)
- If imports not resolving: Update Pylance to use `backend-python/.venv/bin/python`

### Docker Development
```bash
# From project root - installs dependencies first!
cd backend-node && npm install && cd ..
cd frontend && npm install && cd ..
docker compose up --build
```

**Critical:** `node_modules` are volume-mounted from host. Install dependencies locally before `docker compose up`.

### Running Individual Services
- **Backend-Node:** `npm run start:dev` (port from .env `PORT` variable)
- **Backend-Python:** `uv run uvicorn app.main:app --reload` (default 8000)
- **Frontend:** `npm run dev` (port 5173, accessible via `--host` flag)

## Code Conventions

### Backend-Node (NestJS/TypeScript)
- **Base Entity Pattern:** All entities extend `BaseEntity` (`database/base-entities/base-entity.entity.ts`) with UUID primary keys, timestamps, and soft-delete via `@DeleteDateColumn`
- **Config Service:** Environment variables accessed through injected `ConfigService`, never directly (see `PostgresConfigService`)
- **TypeORM Migrations:** Use `npm run typeorm` commands (builds first, then runs TypeORM CLI)
- **Module Structure:** Feature modules use controller → service → repository pattern

### Backend-Python (FastAPI)
- **SQL-First Approach:** Complex queries stored in `app/queries/*.sql` files, loaded at runtime (see `PropositionService.list_propositions`)
- **BigQuery Integration:** Queries execute via `google.cloud.bigquery.Client` with project ID from `GOOGLE_CLOUD_PROJECT` env var
- **Dependency Injection:** Use FastAPI's `Depends()` for service injection (example: `get_proposition_service`)
- **Path Resolution:** SQL files located using `Path(__file__).resolve().parent.parent / "queries"`
- **Config via Pydantic:** `Config` class in `app/core/config.py` uses `pydantic_settings.BaseSettings`

### Frontend (React/TypeScript)
- **Component Library:** shadcn/ui components in `src/components/ui/` (Badge, Button, Card, Form, etc.)
- **Path Aliases:** Use `@/` prefix for imports (`@/components/ui/button` → `src/components/ui/button`)
- **Routing:** React Router v6 configured in `src/routes/index.tsx`
- **State Management:** Context API pattern (see `CopyContext.tsx`)
- **Form Handling:** react-hook-form + @hookform/resolvers for validation

## Database Considerations
- **PostgreSQL Extensions:** pgvector enabled in `init-db.sql` for vector similarity searches
- **Initialization:** Database initializes with `init-db.sql` on first container start
- **Backend-Node Entities:** Auto-discovered via glob pattern `**/entities/*.entity{.ts,.js}`

## Testing
- **Backend-Node:** `npm run test` (Jest), `npm run test:e2e` for integration tests
- **Backend-Python:** `pytest` (configured with `pythonpath = "."` in pyproject.toml)
- **Frontend:** No test configuration visible yet

## Common Pitfalls
1. **Python imports not resolving:** Verify VS Code uses `.venv/bin/python`, not system Python. Run `uv sync` if dependencies missing.
2. **Docker build failures:** Ensure `npm install` run in frontend/backend-node before `docker compose up`.
3. **BigQuery authentication:** Requires Google Cloud credentials via Application Default Credentials or service account key.
4. **TypeORM migrations:** Must `npm run build` before running typeorm commands (wrapped in `npm run typeorm` script).

## File Locations Reference
- Python API routes: `backend-python/src/app/api/v1/`
- BigQuery queries: `backend-python/src/app/queries/`
- NestJS entities: `backend-node/src/**/entities/`
- Frontend pages: `frontend/src/pages/`
- shadcn/ui components: `frontend/src/components/ui/`
