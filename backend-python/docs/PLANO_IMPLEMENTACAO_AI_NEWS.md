# Plano de Implementação - Sistema de Notícias Geradas por IA

## 📋 Visão Geral

Implementar um sistema completo de geração automatizada de notícias a partir de proposições legislativas, transformando PDFs técnicos em conteúdo jornalístico acessível ao cidadão comum.

## 🎯 Objetivos

1. **Processar PDFs das proposições**: Download e extração de conteúdo dos documentos legislativos
2. **Gerar notícias com IA**: Criar título, resumo curto e matéria completa usando LLMs
3. **Armazenar PDFs**: Hospedar documentos originais no Supabase Storage
4. **Persistir dados**: Salvar notícias geradas no PostgreSQL
5. **Servir via API**: Endpoints para listar notícias e exibir conteúdo completo
6. **Integrar frontend**: Conectar interface existente com dados reais

---

## 🏗️ Arquitetura Proposta

```
┌─────────────────────────────────────────────────────────────────┐
│                         FLUXO COMPLETO                          │
└─────────────────────────────────────────────────────────────────┘

1. BigQuery API (Python Backend)
   └─> Retorna proposições com url_teor_proposicao

2. PDF Processing Service (Python)
   ├─> Download PDF via HTTP
   ├─> Extração de texto (PyPDF2/pdfplumber)
   └─> Upload para Supabase Storage

3. AI Content Generation (LangChain/Pydantic AI)
   ├─> Processa texto extraído
   ├─> Gera: título, resumo curto, matéria completa
   └─> Classifica impacto e relevância

4. Database Layer (Supabase PostgreSQL via Python Backend)
   ├─> SQLAlchemy ORM para models
   ├─> Alembic para migrations
   └─> Persiste notícias geradas + metadata

5. API Layer (FastAPI - Python Backend)
   ├─> POST /news/generate - Gera notícias em batch
   ├─> GET /news - Lista com título + resumo
   ├─> GET /news/:id - Notícia completa + link PDF
   └─> PATCH /news/:id/vote - Sistema de votação

6. Frontend React (Responsabilidade de outro integrante)
   ├─> Dashboard: Cards com resumo
   └─> News Detail: Matéria completa + PDF embedado
```

> **⚠️ IMPORTANTE**: Este plano foca no **backend Python**. A integração frontend será feita por outro membro da equipe.

---

## 📊 Modelo de Dados

### Tabela: `news` (Supabase PostgreSQL via SQLAlchemy)

```python
# backend-python/src/app/db/models/news.py

from sqlalchemy import Column, String, Text, Integer, Date, Boolean, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.db.schema import Base

class News(Base):
    __tablename__ = "news"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Conteúdo gerado pela IA
    title = Column(String(500), nullable=False, index=True)
    summary = Column(Text, nullable=False)  # 100-150 palavras
    full_content = Column(Text, nullable=False)  # 500-800 palavras
    
    # Dados da proposição original
    proposition_number = Column(String(20), nullable=False, index=True)  # Ex: "PL 1234/2025"
    proposition_id = Column(Integer, nullable=False, unique=True, index=True)  # id_proposicao BigQuery
    presentation_date = Column(Date, nullable=False)
    
    # Autor da proposição
    uf_author = Column(String(2), nullable=True, index=True)
    author_name = Column(String(100), nullable=True)
    party = Column(String(50), nullable=True)
    
    # Classificação
    news_type = Column(String(10), nullable=False, index=True)  # PL, PEC, EMP, etc
    original_ementa = Column(Text, nullable=False)
    
    # Armazenamento de PDF
    pdf_storage_url = Column(String(500), nullable=False)  # URL Supabase Storage
    original_pdf_url = Column(String(500), nullable=False)  # url_teor_proposicao (backup)
    
    # Engajamento e votação
    upvotes = Column(Integer, default=0, nullable=False)
    downvotes = Column(Integer, default=0, nullable=False)
    engagement_score = Column(Integer, default=0, nullable=False, index=True)
    
    # Publicação em redes sociais
    published_to_social = Column(Boolean, default=False, nullable=False)
    social_publish_date = Column(DateTime, nullable=True)
    
    # Metadata adicional (tags, categorias, métricas de IA)
    metadata = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<News(id={self.id}, title='{self.title[:50]}...', proposition_id={self.proposition_id})>"
```

### Migration com Alembic

```python
# Será gerada via: alembic revision --autogenerate -m "create news table"

"""create news table

Revision ID: 001
Revises: 
Create Date: 2025-11-22

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('news',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('full_content', sa.Text(), nullable=False),
        sa.Column('proposition_number', sa.String(length=20), nullable=False),
        sa.Column('proposition_id', sa.Integer(), nullable=False),
        sa.Column('presentation_date', sa.Date(), nullable=False),
        sa.Column('uf_author', sa.String(length=2), nullable=True),
        sa.Column('author_name', sa.String(length=100), nullable=True),
        sa.Column('party', sa.String(length=50), nullable=True),
        sa.Column('news_type', sa.String(length=10), nullable=False),
        sa.Column('original_ementa', sa.Text(), nullable=False),
        sa.Column('pdf_storage_url', sa.String(length=500), nullable=False),
        sa.Column('original_pdf_url', sa.String(length=500), nullable=False),
        sa.Column('upvotes', sa.Integer(), nullable=False),
        sa.Column('downvotes', sa.Integer(), nullable=False),
        sa.Column('engagement_score', sa.Integer(), nullable=False),
        sa.Column('published_to_social', sa.Boolean(), nullable=False),
        sa.Column('social_publish_date', sa.DateTime(), nullable=True),
        sa.Column('metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_news_title'), 'news', ['title'], unique=False)
    op.create_index(op.f('ix_news_proposition_number'), 'news', ['proposition_number'], unique=False)
    op.create_index(op.f('ix_news_proposition_id'), 'news', ['proposition_id'], unique=True)
    op.create_index(op.f('ix_news_uf_author'), 'news', ['uf_author'], unique=False)
    op.create_index(op.f('ix_news_news_type'), 'news', ['news_type'], unique=False)
    op.create_index(op.f('ix_news_engagement_score'), 'news', ['engagement_score'], unique=False)

def downgrade():
    op.drop_index(op.f('ix_news_engagement_score'), table_name='news')
    op.drop_index(op.f('ix_news_news_type'), table_name='news')
    op.drop_index(op.f('ix_news_uf_author'), table_name='news')
    op.drop_index(op.f('ix_news_proposition_id'), table_name='news')
    op.drop_index(op.f('ix_news_proposition_number'), table_name='news')
    op.drop_index(op.f('ix_news_title'), table_name='news')
    op.drop_table('news')
```

---

## 🔧 Stack Tecnológica

### Backend Python (Componentes Completos)

```toml
# Adicionar ao pyproject.toml

dependencies = [
    # ... existentes ...
    "fastapi>=0.120.2",
    "sqlalchemy>=2.0.44",
    "pydantic>=2.12.3",
    
    # Database & ORM
    "alembic>=1.13.0",           # Migrations
    "psycopg2-binary>=2.9.0",    # PostgreSQL driver
    "asyncpg>=0.29.0",           # Async PostgreSQL
    
    # PDF Processing
    "pypdf2>=3.0.0",
    "pdfplumber>=0.11.0",
    
    # AI/LLM
    "langchain>=0.3.0",
    "langchain-openai>=0.2.0",
    "langchain-community>=0.3.0",
    "pydantic-ai>=1.9.0",        # Já existe no projeto
    "openai>=2.6.1",             # Já existe no projeto
    
    # Supabase Integration
    "supabase>=2.0.0",
    
    # HTTP Client
    "httpx>=0.27.0",
    
    # Content Processing
    "beautifulsoup4>=4.12.0",
    "markdownify>=0.12.0",
    
    # Utilities
    "python-slugify>=8.0.0",
    "python-multipart>=0.0.6",
]
```

### Configuração Supabase

**Arquivo**: `.env` (adicionar)
```bash
# Supabase Configuration
SUPABASE_URL=https://[your-project].supabase.co
SUPABASE_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
SUPABASE_BUCKET_NAME=proposition-pdfs

# Database URL para SQLAlchemy
DATABASE_URL=postgresql+asyncpg://postgres:[password]@db.[project].supabase.co:5432/postgres
```

### Supabase Setup

```sql
-- Bucket para PDFs das proposições
-- Criar via Dashboard Supabase > Storage > New Bucket

Bucket Name: proposition-pdfs
Public: true
File size limit: 10MB
Allowed MIME types: application/pdf

-- Storage Policy (RLS)
-- Permitir leitura pública, escrita autenticada

CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'proposition-pdfs');

CREATE POLICY "Authenticated upload access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'proposition-pdfs');
```

---

## 📝 Implementação Detalhada

### FASE 1: Setup e Infraestrutura (2-3 horas)

#### 1.1 Configuração Supabase

**Passo 1**: Criar projeto no Supabase Dashboard
- URL: `https://supabase.com/dashboard`
- Copiar credenciais: URL, anon key, service role key

**Passo 2**: Criar bucket de storage
```sql
-- Via Dashboard: Storage > New Bucket
Name: proposition-pdfs
Public: true
File size limit: 10MB
```

**Passo 3**: Adicionar variáveis de ambiente
```bash
# .env
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
SUPABASE_BUCKET_NAME=proposition-pdfs
DATABASE_URL=postgresql+asyncpg://postgres:[password]@db.[project].supabase.co:5432/postgres
```

#### 1.2 Configuração SQLAlchemy + Alembic

**Estrutura de arquivos**:
```
backend-python/
├── alembic.ini                    # Config Alembic
├── alembic/
│   ├── env.py                     # Setup migrations
│   ├── script.py.mako
│   └── versions/
│       └── 001_create_news_table.py
├── src/app/
│   ├── db/
│   │   ├── __init__.py
│   │   ├── schema.py              # Base declarative
│   │   ├── session.py             # Database session
│   │   └── models/
│   │       ├── __init__.py
│   │       └── news.py            # Model News
│   └── core/
│       └── database.py            # Config conexão
```

**Arquivo**: `src/app/db/schema.py`
```python
from sqlalchemy.orm import declarative_base

Base = declarative_base()
```

**Arquivo**: `src/app/db/session.py`
```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import Config
import os

config = Config()

# Engine assíncrono
engine = create_async_engine(
    os.getenv("DATABASE_URL"),
    echo=True,  # Log SQL queries (desabilitar em produção)
    future=True
)

# Session factory
async_session = sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

async def get_db():
    """Dependency injection para FastAPI"""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
```

**Arquivo**: `alembic.ini` (criar na raiz do backend-python)
```ini
[alembic]
script_location = alembic
prepend_sys_path = .
sqlalchemy.url = postgresql+asyncpg://postgres:[password]@db.[project].supabase.co:5432/postgres

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

**Arquivo**: `alembic/env.py`
```python
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context
import asyncio
import os
import sys

# Adicionar path do projeto
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.schema import Base
from app.db.models.news import News  # Importar todos os models aqui

# this is the Alembic Config object
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Usar DATABASE_URL do .env
config.set_main_option("sqlalchemy.url", os.getenv("DATABASE_URL"))

# add your model's MetaData object here
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

**Comandos Alembic**:
```bash
# Inicializar Alembic (já feito com estrutura acima)
cd backend-python
uv run alembic init alembic

# Gerar migration automática
uv run alembic revision --autogenerate -m "create news table"

# Aplicar migrations
uv run alembic upgrade head

# Rollback última migration
uv run alembic downgrade -1

# Ver histórico
uv run alembic history

# Ver SQL sem aplicar
uv run alembic upgrade head --sql
```

#### 1.3 Backend-Python: Estrutura de Serviços

```
backend-python/src/app/
├── api/v1/
│   ├── __init__.py
│   ├── propositions.py            # Já existe
│   ├── user.py                    # Já existe
│   └── news.py                    # NOVO - Endpoints geração
├── services/
│   ├── __init__.py
│   ├── proposition_service.py     # Já existe
│   ├── user_service.py            # Já existe
│   ├── pdf_processor_service.py   # NOVO - Download + extração
│   ├── storage_service.py         # NOVO - Upload Supabase
│   ├── ai_news_generator_service.py  # NOVO - LangChain/Pydantic AI
│   └── news_orchestrator_service.py  # NOVO - Coordena fluxo
├── repositories/
│   ├── __init__.py
│   └── news_repository.py         # NOVO - CRUD database
├── models/
│   ├── __init__.py
│   ├── proposition.py             # Já existe
│   ├── user.py                    # Já existe
│   └── ai_prompts.py              # NOVO - Templates prompts
├── db/
│   ├── __init__.py
│   ├── schema.py                  # Base declarative
│   ├── session.py                 # Database session
│   └── models/
│       ├── __init__.py
│       └── news.py                # NOVO - SQLAlchemy model
└── core/
    ├── config.py                  # Já existe
    ├── logging.py                 # Já existe
    └── supabase_client.py         # NOVO - Cliente Supabase
```

---

### FASE 2: Serviços de Processamento (4-6 horas)

#### 2.1 PDF Processor Service

**Responsabilidades**:
- Download do PDF via `url_teor_proposicao`
- Extração de texto estruturado
- Validação e limpeza do conteúdo

**Pseudocódigo**:
```python
class PDFProcessorService:
    async def download_pdf(self, url: str) -> bytes:
        """Download PDF usando httpx com retry"""
        
    async def extract_text(self, pdf_bytes: bytes) -> dict:
        """
        Retorna:
        {
            'full_text': str,
            'metadata': {
                'pages': int,
                'has_tables': bool,
                'word_count': int
            }
        }
        """
        # Tentar pdfplumber primeiro (melhor com tabelas)
        # Fallback para PyPDF2 se falhar
```

**Desafios**:
- PDFs podem estar corrompidos → try/except robusto
- Alguns PDFs são imagens escaneadas → OCR (Tesseract) como fallback
- Limite de tamanho → rejeitar PDFs > 10MB

#### 2.2 Storage Service (Supabase)

```python
class StorageService:
    def __init__(self):
        self.client = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        )
        self.bucket = os.getenv("SUPABASE_BUCKET_NAME")
    
    async def upload_pdf(
        self, 
        file_bytes: bytes, 
        proposition_id: int,
        filename: str
    ) -> str:
        """
        Upload e retorna URL pública
        Caminho: propositions/{ano}/{id_proposicao}/{filename}.pdf
        """
        
    async def get_public_url(self, path: str) -> str:
        """Retorna URL pública do arquivo"""
```

#### 2.3 AI News Generator Service

**Arquitetura de Prompts**:

```python
# models/ai_prompts.py

SYSTEM_PROMPT = """
Você é um jornalista especializado em traduzir documentos legislativos 
complexos em notícias acessíveis para o cidadão comum brasileiro.

Seu objetivo é:
1. Explicar o que a proposta quer mudar na prática
2. Mostrar impactos diretos na vida das pessoas
3. Usar linguagem clara, sem jargões jurídicos
4. Ser imparcial mas engajador
"""

TITLE_PROMPT = """
Com base no documento legislativo abaixo, crie um título jornalístico:

REQUISITOS:
- Máximo 80 caracteres
- Linguagem acessível
- Foco no impacto real (não no processo legislativo)
- Tom informativo mas interessante

DOCUMENTO:
{document_text}

EMENTA OFICIAL:
{ementa}

TÍTULO:
"""

SUMMARY_PROMPT = """
Crie um resumo de 100-150 palavras respondendo:

1. O que essa proposta quer mudar?
2. Quem será afetado?
3. Qual o impacto prático na vida das pessoas?

DOCUMENTO:
{document_text}

RESUMO:
"""

FULL_ARTICLE_PROMPT = """
Escreva uma matéria jornalística completa (500-800 palavras) com:

ESTRUTURA:
1. Lead: Responda O QUÊ, QUEM, QUANDO, ONDE
2. Contexto: Por que essa proposta surgiu?
3. Detalhamento: Como funcionará na prática?
4. Impactos: Quem ganha e quem perde?
5. Próximos passos: Tramitação esperada

ESTILO:
- Parágrafos curtos (3-4 linhas)
- Evite termos técnicos ou explique-os
- Use exemplos concretos
- Mantenha tom neutro mas humano

DOCUMENTO:
{document_text}

AUTOR: {author_name} ({party}/{uf})
DATA: {presentation_date}
TIPO: {proposition_type}

MATÉRIA:
"""
```

**Implementação do Gerador**:

```python
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

class NewsOutput(BaseModel):
    title: str = Field(max_length=80)
    summary: str = Field(min_length=100, max_length=200)
    full_content: str = Field(min_length=500, max_length=1000)
    tags: list[str] = Field(max_items=5)
    impact_level: Literal["low", "medium", "high"]
    target_audience: list[str]

class AINewsGeneratorService:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",  # Custo-benefício
            temperature=0.7
        )
    
    async def generate_news(
        self,
        pdf_text: str,
        proposition_data: dict
    ) -> NewsOutput:
        """
        Gera conteúdo completo da notícia em uma única chamada
        usando structured output do OpenAI
        """
        
        parser = PydanticOutputParser(pydantic_object=NewsOutput)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            ("user", self._build_full_prompt(pdf_text, proposition_data))
        ])
        
        chain = prompt | self.llm | parser
        result = await chain.ainvoke({
            "document_text": pdf_text[:8000],  # Limitar tokens
            "ementa": proposition_data["ementa"],
            "author_name": proposition_data["nome_autor"],
            "party": proposition_data["sigla_partido"],
            "uf": proposition_data["sigla_uf_autor"],
            "presentation_date": proposition_data["dataApresentacao"],
            "proposition_type": proposition_data["sigla"]
        })
        
        return result
```

**Alternativa com Pydantic AI** (mais recente):

```python
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel

class AINewsGeneratorService:
    def __init__(self):
        self.agent = Agent(
            OpenAIModel('gpt-4o-mini'),
            result_type=NewsOutput,
            system_prompt=SYSTEM_PROMPT
        )
    
    async def generate_news(
        self,
        pdf_text: str,
        proposition_data: dict
    ) -> NewsOutput:
        result = await self.agent.run(
            self._build_full_prompt(pdf_text, proposition_data)
        )
        return result.data
```

#### 2.4 News Repository (SQLAlchemy)

```python
# repositories/news_repository.py

from sqlalchemy import select, update, delete, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.news import News
from typing import Optional, List
from uuid import UUID

class NewsRepository:
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create(self, news_data: dict) -> News:
        """Cria nova notícia"""
        news = News(**news_data)
        self.session.add(news)
        await self.session.commit()
        await self.session.refresh(news)
        return news
    
    async def get_by_id(self, news_id: UUID) -> Optional[News]:
        """Busca notícia por ID"""
        result = await self.session.execute(
            select(News).where(News.id == news_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_proposition_id(self, proposition_id: int) -> Optional[News]:
        """Busca notícia por ID da proposição (evitar duplicatas)"""
        result = await self.session.execute(
            select(News).where(News.proposition_id == proposition_id)
        )
        return result.scalar_one_or_none()
    
    async def list_all(
        self,
        page: int = 1,
        limit: int = 20,
        uf: Optional[str] = None,
        news_type: Optional[str] = None,
        keywords: Optional[str] = None,
        order_by: str = "created_at",
        order_direction: str = "desc"
    ) -> tuple[List[News], int]:
        """Lista notícias com filtros e paginação"""
        
        query = select(News)
        
        # Filtros
        if uf:
            query = query.where(News.uf_author == uf)
        
        if news_type:
            query = query.where(News.news_type == news_type)
        
        if keywords:
            search_pattern = f"%{keywords}%"
            query = query.where(
                or_(
                    News.title.ilike(search_pattern),
                    News.summary.ilike(search_pattern)
                )
            )
        
        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.session.execute(count_query)
        total = total_result.scalar()
        
        # Ordenação
        order_column = getattr(News, order_by, News.created_at)
        if order_direction == "desc":
            query = query.order_by(order_column.desc())
        else:
            query = query.order_by(order_column.asc())
        
        # Paginação
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)
        
        result = await self.session.execute(query)
        items = result.scalars().all()
        
        return items, total
    
    async def update_votes(
        self,
        news_id: UUID,
        vote_type: str
    ) -> Optional[News]:
        """Atualiza votos e recalcula engagement score"""
        news = await self.get_by_id(news_id)
        if not news:
            return None
        
        if vote_type == "upvote":
            news.upvotes += 1
        elif vote_type == "downvote":
            news.downvotes += 1
        
        news.engagement_score = news.upvotes - news.downvotes
        
        await self.session.commit()
        await self.session.refresh(news)
        return news
    
    async def mark_published_to_social(self, news_id: UUID) -> Optional[News]:
        """Marca notícia como publicada nas redes sociais"""
        from datetime import datetime
        
        news = await self.get_by_id(news_id)
        if not news:
            return None
        
        news.published_to_social = True
        news.social_publish_date = datetime.utcnow()
        
        await self.session.commit()
        await self.session.refresh(news)
        return news
    
    async def get_top_engagement(self, limit: int = 10) -> List[News]:
        """Retorna notícias com maior engagement score"""
        result = await self.session.execute(
            select(News)
            .order_by(News.engagement_score.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def delete(self, news_id: UUID) -> bool:
        """Deleta notícia"""
        result = await self.session.execute(
            delete(News).where(News.id == news_id)
        )
        await self.session.commit()
        return result.rowcount > 0
```

#### 2.5 News Orchestrator Service

**Coordena todo o fluxo**:

```python
# services/news_orchestrator_service.py

from app.services.pdf_processor_service import PDFProcessorService
from app.services.storage_service import StorageService
from app.services.ai_news_generator_service import AINewsGeneratorService
from app.repositories.news_repository import NewsRepository
from app.db.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession
import asyncio
import logging

logger = logging.getLogger(__name__)

class NewsOrchestratorService:
    def __init__(self, db_session: AsyncSession):
        self.pdf_processor = PDFProcessorService()
        self.storage = StorageService()
        self.ai_generator = AINewsGeneratorService()
        self.news_repo = NewsRepository(db_session)
        self.db_session = db_session
    
    async def process_proposition(
        self, 
        proposition: dict
    ) -> dict:
        """
        Pipeline completo:
        1. Verificar se já existe notícia para esta proposição
        2. Download PDF
        3. Extração texto
        4. Upload Supabase
        5. Geração IA
        6. Persistência Supabase PostgreSQL
        """
        
        try:
            # 1. Verificar duplicata
            existing = await self.news_repo.get_by_proposition_id(
                proposition["id_proposicao"]
            )
            if existing:
                logger.info(f"News already exists for proposition {proposition['id_proposicao']}")
                return {
                    "success": True,
                    "news_id": str(existing.id),
                    "proposition_id": proposition["id_proposicao"],
                    "message": "Already processed"
                }
            
            # 2. Download PDF
            logger.info(f"Downloading PDF for proposition {proposition['id_proposicao']}")
            pdf_bytes = await self.pdf_processor.download_pdf(
                proposition["url_teor_proposicao"]
            )
            
            # 3. Extração texto
            logger.info(f"Extracting text from PDF {proposition['id_proposicao']}")
            extracted = await self.pdf_processor.extract_text(pdf_bytes)
            
            # 4. Upload Supabase Storage
            logger.info(f"Uploading PDF to Supabase {proposition['id_proposicao']}")
            pdf_url = await self.storage.upload_pdf(
                pdf_bytes,
                proposition["id_proposicao"],
                f"{proposition['sigla']}_{proposition['numero']}_{proposition['ano']}"
            )
            
            # 5. Geração IA
            logger.info(f"Generating news content with AI {proposition['id_proposicao']}")
            news_content = await self.ai_generator.generate_news(
                extracted["full_text"],
                proposition
            )
            
            # 6. Persistir no Supabase PostgreSQL
            from datetime import datetime
            
            news_data = {
                "title": news_content.title,
                "summary": news_content.summary,
                "full_content": news_content.full_content,
                "proposition_id": proposition["id_proposicao"],
                "proposition_number": f"{proposition['sigla']} {proposition['numero']}/{proposition['ano']}",
                "presentation_date": datetime.fromisoformat(proposition["dataApresentacao"]).date(),
                "uf_author": proposition.get("sigla_uf_autor"),
                "author_name": proposition.get("nome_autor"),
                "party": proposition.get("sigla_partido"),
                "news_type": proposition["sigla"],
                "original_ementa": proposition["ementa"] or "",
                "pdf_storage_url": pdf_url,
                "original_pdf_url": proposition["url_teor_proposicao"],
                "upvotes": 0,
                "downvotes": 0,
                "engagement_score": 0,
                "published_to_social": False,
                "metadata": {
                    "tags": news_content.tags,
                    "impact_level": news_content.impact_level,
                    "target_audience": news_content.target_audience,
                    "pdf_pages": extracted["metadata"]["pages"],
                    "word_count": extracted["metadata"]["word_count"]
                }
            }
            
            logger.info(f"Saving news to database {proposition['id_proposicao']}")
            created_news = await self.news_repo.create(news_data)
            
            return {
                "success": True,
                "news_id": str(created_news.id),
                "proposition_id": proposition["id_proposicao"],
                "title": created_news.title
            }
            
        except Exception as e:
            logger.error(f"Error processing {proposition['id_proposicao']}: {e}", exc_info=True)
            return {
                "success": False,
                "error": str(e),
                "proposition_id": proposition["id_proposicao"]
            }
    
    async def batch_process(
        self, 
        propositions: list[dict],
        max_concurrent: int = 3
    ) -> list[dict]:
        """Processa múltiplas proposições em paralelo"""
        
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def process_with_limit(prop):
            async with semaphore:
                return await self.process_proposition(prop)
        
        results = await asyncio.gather(*[
            process_with_limit(prop) for prop in propositions
        ], return_exceptions=True)
        
        # Converter exceptions em dicts
        final_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                final_results.append({
                    "success": False,
                    "error": str(result),
                    "proposition_id": propositions[i].get("id_proposicao")
                })
            else:
                final_results.append(result)
        
        return final_results
```

---

### FASE 3: API Endpoints (2-3 horas)

#### 3.1 Backend-Python: Trigger de Geração

```python
# api/v1/news.py

from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends
from app.services.news_orchestrator_service import NewsOrchestratorService
from app.services.proposition_service import PropositionService

router = APIRouter()

@router.post("/news/generate")
async def generate_news_from_propositions(
    background_tasks: BackgroundTasks,
    keywords: Optional[str] = None,
    uf: Optional[str] = None,
    type: Optional[str] = None,
    max_items: int = 10,
    orchestrator: NewsOrchestratorService = Depends()
):
    """
    Busca proposições no BigQuery e gera notícias em background
    
    Response: Job ID para acompanhar progresso
    """
    
    # Buscar proposições
    prop_service = PropositionService()
    propositions = prop_service.list_propositions(
        keywords=keywords,
        uf=uf,
        type=type
    )[:max_items]
    
    if not propositions:
        raise HTTPException(404, "No propositions found")
    
    # Job ID para tracking
    job_id = str(uuid.uuid4())
    
    # Processar em background
    background_tasks.add_task(
        orchestrator.batch_process,
        propositions,
        max_concurrent=3
    )
    
    return {
        "job_id": job_id,
        "total_propositions": len(propositions),
        "status": "processing",
        "message": "News generation started in background"
    }

@router.post("/news/generate/{proposition_id}")
async def generate_single_news(
    proposition_id: int,
    orchestrator: NewsOrchestratorService = Depends()
):
    """Gera notícia para uma proposição específica (síncrono)"""
    
    # Buscar proposição no BigQuery
    prop_service = PropositionService()
    propositions = prop_service.list_propositions()
    
    proposition = next(
        (p for p in propositions if p["id_proposicao"] == proposition_id),
        None
    )
    
    if not proposition:
        raise HTTPException(404, f"Proposition {proposition_id} not found")
    
    result = await orchestrator.process_proposition(proposition)
    
    if not result["success"]:
        raise HTTPException(500, result["error"])
    
    return result
```

#### 3.2 Backend-Node: CRUD de Notícias

```typescript
// news/news.controller.ts

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  async listNews(
    @Query() paginationDto: ListPaginationDto,
    @Query('uf') uf?: string,
    @Query('type') type?: string,
    @Query('keywords') keywords?: string,
  ) {
    return this.newsService.findAll({
      ...paginationDto,
      uf,
      type,
      keywords,
    });
  }

  @Get(':id')
  async getNewsDetail(@Param('id') id: string) {
    const news = await this.newsService.findOne(id);
    if (!news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }
    return news;
  }

  @Post()
  async createNews(@Body() createNewsDto: CreateNewsDto) {
    return this.newsService.create(createNewsDto);
  }

  @Patch(':id/vote')
  async voteNews(
    @Param('id') id: string,
    @Body() voteDto: { type: 'upvote' | 'downvote' },
  ) {
    return this.newsService.updateVotes(id, voteDto.type);
  }

  @Get(':id/check-social-publish')
  async checkSocialPublish(@Param('id') id: string) {
    return this.newsService.checkAndPublishToSocial(id);
  }
}
```

```typescript
// news/news.service.ts

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
  ) {}

  async findAll(filters: any): Promise<PaginatedReturn<News>> {
    const queryBuilder = this.newsRepository
      .createQueryBuilder('news')
      .orderBy('news.createdAt', 'DESC');

    if (filters.uf) {
      queryBuilder.andWhere('news.ufAuthor = :uf', { uf: filters.uf });
    }

    if (filters.type) {
      queryBuilder.andWhere('news.newsType = :type', { type: filters.type });
    }

    if (filters.keywords) {
      queryBuilder.andWhere(
        '(news.title ILIKE :keywords OR news.summary ILIKE :keywords)',
        { keywords: `%${filters.keywords}%` },
      );
    }

    const [items, total] = await queryBuilder
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getManyAndCount();

    return {
      items,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async findOne(id: string): Promise<News> {
    return this.newsRepository.findOne({ where: { id } });
  }

  async create(createNewsDto: CreateNewsDto): Promise<News> {
    const news = this.newsRepository.create(createNewsDto);
    return this.newsRepository.save(news);
  }

  async updateVotes(id: string, voteType: 'upvote' | 'downvote'): Promise<News> {
    const news = await this.findOne(id);
    
    if (voteType === 'upvote') {
      news.upvotes++;
    } else {
      news.downvotes++;
    }

    // Calcular engagement score
    news.engagementScore = news.upvotes - news.downvotes;

    return this.newsRepository.save(news);
  }

  async checkAndPublishToSocial(id: string): Promise<{ shouldPublish: boolean }> {
    const news = await this.findOne(id);
    
    // Threshold de 100 votos positivos líquidos
    const threshold = 100;
    
    if (
      news.engagementScore >= threshold &&
      !news.publishedToSocial
    ) {
      // TODO: Integrar com API de redes sociais
      news.publishedToSocial = true;
      news.socialPublishDate = new Date();
      await this.newsRepository.save(news);
      
      return { shouldPublish: true };
    }

    return { shouldPublish: false };
  }
}
```

---

### FASE 4: Documentação da API para Frontend (1 hora)

> **⚠️ IMPORTANTE**: A implementação frontend será feita por outro integrante da equipe. Esta fase foca apenas em documentar a API.

#### 4.1 Documentação OpenAPI/Swagger

O FastAPI gera documentação automática. Após implementação, estará disponível em:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

#### 4.2 Contrato da API para o Frontend

**Endpoints principais**:

| Método | Endpoint | Descrição | Response |
|--------|----------|-----------|----------|
| `GET` | `/api/v1/news` | Lista notícias com filtros | `PaginatedNewsResponse` |
| `GET` | `/api/v1/news/{id}` | Detalhes de uma notícia | `NewsResponse` |
| `PATCH` | `/api/v1/news/{id}/vote` | Registra voto | `NewsResponse` |
| `GET` | `/api/v1/news/top/engagement` | Top notícias por engajamento | `List[NewsResponse]` |
| `POST` | `/api/v1/news/generate` | Gera notícias em batch (admin) | Job ID |
| `POST` | `/api/v1/news/generate/{proposition_id}` | Gera notícia única (admin) | Result dict |

#### 4.3 Atualizar Dashboard para consumir API (Frontend Team)

```typescript
// frontend/src/pages/Dashboard/index.tsx

const loadData = useCallback(async () => {
  try {
    setLoading(true);

    const params = new URLSearchParams();
    if (filters.keywords) params.append('keywords', filters.keywords);
    if (filters.uf) params.append('uf', filters.uf);
    if (filters.type) params.append('type', filters.type);
    params.append('page', '1');
    params.append('limit', '20');

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/news?${params}`
    );
    
    const data = await response.json();
    
    // Transformar para formato do frontend
    const transformedNews = data.items.map((item: any) => ({
      id: item.id,
      number: item.propositionNumber,
      presentationDate: new Date(item.presentationDate).toLocaleDateString('pt-BR'),
      description: item.summary,
      uf: item.ufAuthor,
      newsType: item.newsType.toLowerCase(),
      title: item.title,
      upvotes: item.upvotes,
      downvotes: item.downvotes,
    }));

    setNews(transformedNews);
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    setLoading(false);
  }
}, [filters]);
```

#### 4.2 Página de Notícia Completa

```typescript
// frontend/src/pages/News/index.tsx

import { useParams } from 'react-router-dom';
import { PageLayout } from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Share2, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function News() {
  const { id } = useParams();
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/news/${id}`
        );
        const data = await response.json();
        setNews(data);
      } catch (error) {
        console.error('Error loading news:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [id]);

  const handleVote = async (type: 'upvote' | 'downvote') => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/news/${id}/vote`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      
      // Recarregar notícia
      window.location.reload();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (!news) return <div>Notícia não encontrada</div>;

  return (
    <PageLayout>
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex gap-2 mb-4">
            <Badge>{news.newsType}</Badge>
            <Badge variant="outline">{news.ufAuthor}</Badge>
            <Badge variant="secondary">{news.propositionNumber}</Badge>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">{news.title}</h1>
          
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>Por: {news.authorName} ({news.party})</span>
            <span>•</span>
            <span>{new Date(news.presentationDate).toLocaleDateString('pt-BR')}</span>
          </div>
        </header>

        {/* Resumo */}
        <div className="bg-muted p-6 rounded-lg mb-8">
          <h2 className="font-semibold mb-2">Em resumo:</h2>
          <p className="text-lg leading-relaxed">{news.summary}</p>
        </div>

        {/* Conteúdo completo */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
          {news.fullContent.split('\n\n').map((paragraph: string, idx: number) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        {/* PDF Embed */}
        <div className="bg-card border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="size-5" />
              Documento Original
            </h3>
            <Button variant="outline" asChild>
              <a href={news.pdfStorageUrl} target="_blank" rel="noopener noreferrer">
                Abrir PDF
              </a>
            </Button>
          </div>
          
          <iframe
            src={`${news.pdfStorageUrl}#view=FitH`}
            className="w-full h-[600px] rounded border"
            title="PDF da Proposição"
          />
        </div>

        {/* Votação e Engajamento */}
        <div className="flex items-center justify-between border-t pt-6">
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => handleVote('upvote')}
              className="flex items-center gap-2"
            >
              <ThumbsUp className="size-4" />
              Relevante ({news.upvotes})
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleVote('downvote')}
              className="flex items-center gap-2"
            >
              <ThumbsDown className="size-4" />
              Não relevante ({news.downvotes})
            </Button>
          </div>

          <Button variant="default" className="flex items-center gap-2">
            <Share2 className="size-4" />
            Compartilhar
          </Button>
        </div>

        {/* Score de Engajamento */}
        {news.engagementScore >= 50 && (
          <div className="mt-6 bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <p className="text-center font-semibold">
              🔥 Esta notícia está ganhando tração! 
              ({news.engagementScore} votos líquidos)
            </p>
            {news.publishedToSocial && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                Publicado nas redes sociais em {new Date(news.socialPublishDate).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
        )}
      </article>
    </PageLayout>
  );
}
```

---

## 🚀 Cronograma de Implementação

### Sprint 1: Fundações (1 semana) - Backend Python
- [ ] Setup Supabase (bucket + credenciais + DATABASE_URL)
- [ ] Configuração SQLAlchemy + Alembic
- [ ] Migration: Criar tabela `news`
- [ ] Model SQLAlchemy: `News`
- [ ] Repository: `NewsRepository` com CRUD completo
- [ ] Testes unitários: Repository operations

### Sprint 2: Pipeline de Processamento (1 semana) - Backend Python
- [ ] PDF Processor Service completo (download + extração)
- [ ] Storage Service com Supabase
- [ ] AI Generator com prompts otimizados (LangChain/Pydantic AI)
- [ ] Orchestrator com tratamento de erros
- [ ] Testes: PDF download, extração, upload, geração IA

### Sprint 3: APIs e Integração (1 semana) - Backend Python
- [ ] Endpoints FastAPI completos (`/news/*`)
- [ ] Pydantic models para responses
- [ ] Sistema de votação funcional
- [ ] Check de publicação social
- [ ] Testes E2E do pipeline completo
- [ ] Documentação Swagger automática

### Sprint 4: Frontend Integration (1 semana) - Frontend Team
- [ ] Dashboard com dados reais da API
- [ ] Página de detalhes com PDF embed
- [ ] Sistema de votação UI
- [ ] Testes de usabilidade
- [ ] Responsividade mobile

### Sprint 5: Features Avançadas (1 semana) - Full Team
- [ ] Publicação automática redes sociais (Backend)
- [ ] Dashboard admin/métricas (Frontend + Backend)
- [ ] Sistema de tags/categorias avançado
- [ ] Otimizações de performance (caching, CDN)
- [ ] Monitoramento e logging (Sentry, Datadog)

---

## 📊 Estimativa de Custos (OpenAI API)

### Por Notícia Gerada

**Modelo**: GPT-4o-mini
- Input: ~8.000 tokens (PDF + contexto) × $0.150/1M = $0.0012
- Output: ~1.000 tokens (título + resumo + artigo) × $0.600/1M = $0.0006
- **Total por notícia**: ~$0.002 (R$ 0.01)

**Volume estimado**:
- 1.000 notícias/mês = $2 (R$ 10)
- 10.000 notícias/mês = $20 (R$ 100)

**Otimizações**:
- Usar cache do OpenAI para PDFs similares
- Batch processing para reduzir chamadas
- Fallback para modelos open-source (Llama 3.3 via Groq)

---

## 🔒 Considerações de Segurança

1. **Rate Limiting**: Limitar geração de notícias por IP/usuário
2. **Validação de PDFs**: Scan antivírus antes de processar
3. **Sanitização de Input**: Validar URLs de PDFs (domínio camara.leg.br)
4. **Secrets Management**: Usar variáveis de ambiente, nunca hardcode
5. **CORS**: Configurar whitelist de origens

---

## 📈 Métricas de Sucesso

### Técnicas
- Tempo médio de processamento < 30s por notícia
- Taxa de sucesso na extração de PDF > 95%
- Qualidade da notícia (avaliação manual) > 8/10

### Produto
- Engagement médio (votos/visualizações) > 10%
- Taxa de compartilhamento > 5%
- Notícias que atingem threshold de publicação social > 2%

---

## 🔄 Próximos Passos Após Implementação

1. **Machine Learning**: 
   - Treinar modelo para classificar relevância automática
   - Prever impacto social da proposição

2. **Análise de Sentimento**:
   - Analisar comentários dos usuários
   - Ajustar prompts da IA com base no feedback

3. **Notificações Push**:
   - Alertar usuários sobre proposições relevantes
   - Notificar quando notícia atinge threshold

4. **Integração Parlamentares**:
   - Dashboard para deputados verem engajamento
   - Sistema de respostas oficiais

5. **Blockchain/Web3**:
   - Registrar votos em blockchain para transparência
   - NFTs de proposições com alto engajamento

---

## 📚 Referências Técnicas

### Documentação
- [LangChain Python](https://python.langchain.com/docs/introduction/)
- [Pydantic AI](https://ai.pydantic.dev/)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [OpenAI Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- [TypeORM Migrations](https://typeorm.io/migrations)

### Bibliotecas Chave
- `pdfplumber`: Extração avançada de PDFs
- `langchain-openai`: Integração OpenAI com LangChain
- `supabase-py`: Cliente Python para Supabase
- `httpx`: HTTP client assíncrono
- `BeautifulSoup4`: Parsing HTML (se necessário)

---

## ❓ Decisões Pendentes

1. **Modelo de IA**:
   - GPT-4o-mini (recomendado, custo-benefício)
   - GPT-4o (melhor qualidade, +caro)
   - Claude 3.5 Sonnet (alternativa)
   - Llama 3.3 70B via Groq (open-source, grátis)

2. **Estratégia de Processamento**:
   - Batch job noturno (todas as novas proposições)
   - On-demand (usuário seleciona)
   - Híbrido (automático + manual)

3. **Publicação Social**:
   - Threshold fixo (100 votos)
   - Threshold dinâmico (top 10%)
   - Aprovação manual antes de publicar

4. **Idioma**:
   - Apenas português
   - Suporte multilíngue futuro

---

## 🎨 Mockups/Wireframes Sugeridos

### Dashboard - Lista de Notícias
```
┌─────────────────────────────────────────────┐
│  [Filtros: Keywords | UF | Tipo]            │
├─────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐  │
│  │ 🔥 Proteção de Dados no Ambiente...   │  │
│  │ PL 123/2025 | SP | 01/12/2025         │  │
│  │ Proposta estabelece novas diretrizes  │  │
│  │ para proteção de dados pessoais...    │  │
│  │ [👍 245] [👎 12] [Compartilhar]        │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ Incentivos para Energias Renováveis   │  │
│  │ ...                                    │  │
└─────────────────────────────────────────────┘
```

### Página de Notícia Completa
```
┌─────────────────────────────────────────────┐
│  [PL] [SP] [PL 123/2025]                    │
│                                             │
│  TÍTULO DA NOTÍCIA                          │
│  Por: Deputado X (PARTIDO) • 01/12/2025    │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 📌 EM RESUMO:                        │   │
│  │ Texto do resumo curto...             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Matéria completa em parágrafos]          │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 📄 DOCUMENTO ORIGINAL                │   │
│  │ [Abrir PDF]                          │   │
│  │ [Iframe com PDF embedado]            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [👍 Relevante (245)] [👎 Não relevante]   │
│  [🔗 Compartilhar]                         │
└─────────────────────────────────────────────┘
```

---

## 🏁 Conclusão

Este plano estabelece uma arquitetura robusta e escalável para transformar documentos legislativos técnicos em notícias acessíveis usando IA de ponta. 

### Responsabilidades Claras

**Backend Python (Você)**:
- Pipeline completo de processamento (PDF → IA → Database)
- API REST com FastAPI
- Persistência com SQLAlchemy + Alembic em Supabase PostgreSQL
- Storage de PDFs em Supabase Storage
- Sistema de votação e engajamento
- Documentação OpenAPI/Swagger

**Frontend React (Outro Integrante)**:
- Consumo da API REST
- Interface de usuário (Dashboard + Detalhes)
- Sistema de votação UI
- Integração com redes sociais (UI)

### Próximo Passo Imediato

1. **Revisar este documento**
2. **Criar projeto Supabase** e configurar credenciais
3. **Ajustar prioridades** conforme necessidade da equipe
4. **Iniciar Sprint 1**: Setup de infraestrutura (SQLAlchemy + Alembic + Models)

**Tempo estimado total**: ~5 semanas (backend) + ~2 semanas (frontend) = **7 semanas para MVP completo**
