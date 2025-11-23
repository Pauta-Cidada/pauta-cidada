# Backend Python - Pauta Cidadã

Sistema de geração automática de notícias a partir de proposições legislativas usando IA.

## 📦 Build e Deploy

### Build e Push para GitHub Container Registry

**1. Autenticar no GitHub Container Registry:**

```bash
# Criar um Personal Access Token (PAT) no GitHub com permissão 'write:packages'
# Settings > Developer settings > Personal access tokens > Tokens (classic)

echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

**2. Build da imagem:**

```bash
# Da raiz do projeto
docker build -t ghcr.io/pauta-cidada/backend-python:latest -f backend-python/Dockerfile backend-python/

# Ou com tag de versão específica
docker build -t ghcr.io/pauta-cidada/backend-python:v1.0.0 -f backend-python/Dockerfile backend-python/
```

**3. Push para o registry:**

```bash
# Push da tag latest
docker push ghcr.io/pauta-cidada/backend-python:latest

# Push de versão específica
docker push ghcr.io/pauta-cidada/backend-python:v1.0.0
```

**4. Tornar a imagem pública (opcional):**

1. Acesse https://github.com/orgs/Pauta-Cidada/packages
2. Selecione o package `backend-python`
3. Package settings > Change visibility > Public

### Deploy no Portainer

**1. Configurar variáveis de ambiente no Portainer:**

No stack do Portainer, adicione as seguintes variáveis de ambiente:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
SUPABASE_BUCKET_NAME=proposition-pdfs
DATABASE_URL=postgresql+asyncpg://postgres:senha@db.seu-projeto.supabase.co:6543/postgres
OPENAI_API_KEY=sk-proj-...
GOOGLE_CLOUD_PROJECT=seu-projeto-id
GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account",...}'
```

**Nota:** Use a porta 6543 (Connection Pooler) do Supabase para melhor compatibilidade com Docker.

**2. Deploy via docker-compose.swarm.yml:**

O arquivo `docker-compose.swarm.yml` na raiz do projeto já está configurado. No Portainer:

1. Stacks > Add stack
2. Cole o conteúdo de `docker-compose.swarm.yml`
3. Configure as variáveis de ambiente
4. Deploy the stack

## 🏗️ Arquitetura

- **FastAPI**: Framework web assíncrono
- **SQLAlchemy + asyncpg**: ORM assíncrono com PostgreSQL
- **Alembic**: Gerenciamento de migrations
- **Supabase**: PostgreSQL + Storage para PDFs
- **Pydantic AI + OpenAI GPT-4o-mini**: Geração de conteúdo
- **PyPDF2 + pdfplumber**: Extração de texto de PDFs

## 🚀 Setup

### 1. Instalar dependências

```bash
uv sync
```

### 2. Configurar variáveis de ambiente

Edite o arquivo `.env` na raiz do projeto:

```env
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
SUPABASE_BUCKET_NAME=proposition-pdfs

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql+asyncpg://postgres:senha@db.seu-projeto.supabase.co:5432/postgres

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Google Cloud BigQuery - OPÇÃO 1 (Recomendado para Portainer/Docker)
GOOGLE_CLOUD_PROJECT=seu-projeto-id
GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account","project_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...","client_email":"...@....iam.gserviceaccount.com",...}'

# Google Cloud BigQuery - OPÇÃO 2 (Desenvolvimento local)
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

**Nota sobre credenciais BigQuery:**
- **Para Portainer/Docker**: Use `GOOGLE_APPLICATION_CREDENTIALS_JSON` com o JSON completo em uma linha
- **Para desenvolvimento local**: Use `GOOGLE_APPLICATION_CREDENTIALS` apontando para o arquivo
- O sistema prioriza `GOOGLE_APPLICATION_CREDENTIALS_JSON` quando disponível

**Script helper para converter credenciais:**

Se você tem um arquivo `credentials.json`, use o script na raiz do projeto:

```bash
# Da raiz do projeto
./scripts/convert-credentials.sh backend-python/credentials.json
```

O script irá gerar a variável `GOOGLE_APPLICATION_CREDENTIALS_JSON` formatada. Copie e cole no `.env`.

**Alternativa manual:**
```bash
cat credentials.json | jq -c '.'
```


### 3. Executar migrations

```bash
# Criar nova migration (se necessário)
uv run alembic revision --autogenerate -m "descricao"

# Aplicar migrations
uv run alembic upgrade head
```

### 4. Iniciar servidor

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📚 API Documentation

Acesse a documentação interativa em:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔌 Endpoints

### News Generation

#### Gerar notícia para uma proposição
```bash
curl -X POST "http://localhost:8000/api/v1/news/generate/12345" \
  -H "Content-Type: application/json" \
  -d '{
    "id_proposicao": 12345,
    "sigla": "PL",
    "numero": 1234,
    "ano": 2025,
    "ementa": "Dispõe sobre...",
    "url_teor_proposicao": "https://...",
    "sigla_uf_autor": "SP",
    "nome_autor": "João Silva",
    "sigla_partido": "PARTIDO",
    "dataApresentacao": "2025-01-15T00:00:00Z"
  }'
```

#### Gerar notícias em batch
```bash
curl -X POST "http://localhost:8000/api/v1/news/generate/batch?max_concurrent=3" \
  -H "Content-Type: application/json" \
  -d '[
    {"id_proposicao": 123, "sigla": "PL", ...},
    {"id_proposicao": 456, "sigla": "PEC", ...}
  ]'
```

#### Processar em background
```bash
curl -X POST "http://localhost:8000/api/v1/news/generate/background?max_concurrent=3" \
  -H "Content-Type: application/json" \
  -d '[...]'
```

### News Management

#### Listar notícias (com filtros)
```bash
# Listar todas
curl "http://localhost:8000/api/v1/news"

# Filtrar por UF
curl "http://localhost:8000/api/v1/news?uf=SP"

# Filtrar por tipo
curl "http://localhost:8000/api/v1/news?news_type=PL"

# Buscar por palavras-chave
curl "http://localhost:8000/api/v1/news?keywords=educação"

# Paginação e ordenação
curl "http://localhost:8000/api/v1/news?page=2&limit=10&order_by=engagement_score&order_direction=desc"
```

#### Obter detalhes de uma notícia
```bash
curl "http://localhost:8000/api/v1/news/{news_id}"
```

#### Votar em notícia
```bash
# Upvote
curl -X PATCH "http://localhost:8000/api/v1/news/{news_id}/vote" \
  -H "Content-Type: application/json" \
  -d '{"vote_type": "upvote"}'

# Downvote
curl -X PATCH "http://localhost:8000/api/v1/news/{news_id}/vote" \
  -H "Content-Type: application/json" \
  -d '{"vote_type": "downvote"}'
```

#### Top notícias por engajamento
```bash
curl "http://localhost:8000/api/v1/news/top/engagement?limit=10"
```

#### Verificar se deve publicar nas redes sociais
```bash
curl -X POST "http://localhost:8000/api/v1/news/{news_id}/check-social-publish"
```

#### Deletar notícia
```bash
curl -X DELETE "http://localhost:8000/api/v1/news/{news_id}"
```

### Propositions (BigQuery)

#### Listar proposições
```bash
curl "http://localhost:8000/api/v1/propositions?limit=10"
```

## 🔄 Pipeline de Geração

1. **Download**: PDF baixado da URL da proposição
2. **Extração**: Texto extraído com pdfplumber (fallback: PyPDF2)
3. **Upload**: PDF armazenado no Supabase Storage
4. **IA**: GPT-4o-mini gera notícia jornalística estruturada
5. **Persistência**: Notícia salva no PostgreSQL
6. **API**: Conteúdo disponível via REST

## 📊 Modelo de Dados

### News
- **id**: UUID (primary key)
- **title**: Título da notícia (500 chars)
- **summary**: Resumo (100-150 palavras)
- **full_content**: Conteúdo completo (500-800 palavras)
- **proposition_id**: ID da proposição (unique)
- **proposition_number**: Ex: "PL 1234/2025"
- **uf_author**: UF do autor
- **author_name**: Nome do autor
- **party**: Partido
- **news_type**: Tipo (PL, PEC, EMP, etc.)
- **upvotes/downvotes**: Sistema de votação
- **engagement_score**: upvotes - downvotes
- **published_to_social**: Flag de publicação
- **extra_metadata**: JSON (tags, impact_level, target_audience)
- **timestamps**: created_at, updated_at

## 💰 Custos

- **Modelo**: GPT-4o-mini
- **Custo estimado**: ~R$0.01 por notícia
- **1000 notícias**: ~R$10

## 🧪 Desenvolvimento

### Comandos úteis

```bash
# Migrations
uv run alembic revision --autogenerate -m "mensagem"
uv run alembic upgrade head
uv run alembic downgrade -1

# Testes
uv run pytest

# Verificar tipos
uv run mypy src/

# Servidor de desenvolvimento
uv run uvicorn app.main:app --reload
```

## 📁 Estrutura

```
src/app/
├── main.py                     # FastAPI app
├── api/v1/
│   ├── news.py                # Endpoints de notícias
│   └── propositions.py        # Endpoints de proposições
├── db/
│   ├── schema.py              # Base declarativa
│   ├── session.py             # Session factory
│   └── models/
│       └── news.py            # Modelo News
├── repositories/
│   └── news_repository.py     # CRUD operations
├── services/
│   ├── storage_service.py     # Supabase Storage
│   ├── pdf_processor_service.py
│   ├── ai_news_generator_service.py
│   └── news_orchestrator_service.py
└── models/
    ├── ai_prompts.py          # Prompts de IA
    └── news_responses.py      # Response models
```
