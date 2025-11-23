# Manual de Integração Frontend - API Pauta Cidadã

## Visão Geral

Este manual orienta desenvolvedores frontend sobre quando e como consumir cada endpoint da API. O sistema possui dois fluxos principais: **gestão de proposições** e **geração/visualização de notícias**.

---

## Base URL

```
http://localhost:8000/api/v1
```

---

## 1. Fluxo de Descoberta de Proposições

### 1.1 Listar Proposições Disponíveis

**Endpoint:** `GET /propositions`

**Quando usar:**
- Tela inicial/dashboard para mostrar proposições recentes
- Página de busca/filtros de proposições
- Quando precisar listar proposições que ainda não têm notícias geradas

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição | Exemplo |
|-----------|------|-------------|-----------|---------|
| `limit` | int | Não | Limite de resultados (padrão: 10, máx: 100) | `20` |
| `offset` | int | Não | Offset para paginação (padrão: 0) | `40` |
| `sigla` | string | Não | Filtrar por tipo (PL, PEC, EMR, etc.) | `PL` |
| `ano` | int | Não | Filtrar por ano | `2025` |
| `numero` | int | Não | Filtrar por número | `1234` |
| `id_proposicao` | int | Não | Buscar proposição específica | `2486022` |
| `sigla_uf_autor` | string | Não | Filtrar por UF do autor | `SP` |
| `sigla_partido` | string | Não | Filtrar por partido | `PT` |

**Exemplo de Requisição:**

```javascript
// Buscar primeiras 20 proposições de 2025
const response = await fetch(
  'http://localhost:8000/api/v1/propositions?limit=20&ano=2025'
);
const propositions = await response.json();
```

**Exemplo de Resposta:**

```json
[
  {
    "id_proposicao": 2497383,
    "sigla": "EMR",
    "numero": 3,
    "ano": 2025,
    "ementa": "Dispõe sobre...",
    "ementa_detalhada": "Texto completo da ementa...",
    "palavra_chave": "energia elétrica; acesso",
    "dataApresentacao": "2025-04-11T18:59:00",
    "url_teor_proposicao": "https://www.camara.leg.br/...",
    "url_principal": "https://dadosabertos.camara.leg.br/...",
    "sigla_uf_autor": "MG",
    "nome_autor": "Lafayette De Andrada",
    "sigla_partido": "REPUBLIC",
    "tipo_autor": "Deputado(A)"
  }
]
```

**Casos de Uso no Frontend:**

```javascript
// 1. Dashboard - Proposições recentes
async function loadRecentPropositions() {
  const response = await fetch('/api/v1/propositions?limit=10&ano=2025');
  return await response.json();
}

// 2. Busca com filtros
async function searchPropositions(filters) {
  const params = new URLSearchParams({
    limit: 50,
    ...filters // { sigla: 'PL', sigla_uf_autor: 'SP' }
  });
  const response = await fetch(`/api/v1/propositions?${params}`);
  return await response.json();
}

// 3. Paginação
async function loadPage(page, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  const response = await fetch(
    `/api/v1/propositions?limit=${pageSize}&offset=${offset}`
  );
  return await response.json();
}
```

---

## 2. Fluxo de Notícias

### 2.1 Listar Notícias Publicadas

**Endpoint:** `GET /news`

**Quando usar:**
- Feed principal de notícias para usuários finais
- Lista de notícias já processadas e prontas para exibição
- Página de notícias por categoria/tipo

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição | Exemplo |
|-----------|------|-------------|-----------|---------|
| `limit` | int | Não | Limite de resultados (padrão: 20, máx: 100) | `20` |
| `offset` | int | Não | Offset para paginação | `0` |
| `news_type` | string | Não | Filtrar por tipo (PL, PEC, EMR, etc.) | `PL` |
| `uf_author` | string | Não | Filtrar por UF do autor | `SP` |
| `published_to_social` | bool | Não | Filtrar se foi publicado nas redes | `true` |

**Exemplo de Requisição:**

```javascript
// Feed de notícias paginado
const response = await fetch(
  'http://localhost:8000/api/v1/news?limit=20&offset=0'
);
const news = await response.json();
```

**Exemplo de Resposta:**

```json
{
  "items": [
    {
      "id": "ffaf7f68-2de8-4553-b074-50138e1fa376",
      "title": "Mudança na Rádio de Icaraíma amplia opções de comunicação local",
      "summary": "Um novo projeto propõe...",
      "full_content": "A Câmara dos Deputados está discutindo...",
      "proposition_number": "EMR 3/2025",
      "proposition_id": 2486022,
      "presentation_date": "2025-04-09",
      "uf_author": "PR",
      "author_name": "João Silva",
      "party": "PT",
      "news_type": "EMR",
      "original_ementa": "Dispõe sobre...",
      "pdf_storage_url": "https://supabase.co/storage/.../EMR_3_2025.pdf",
      "original_pdf_url": "https://www.camara.leg.br/...",
      "upvotes": 150,
      "downvotes": 20,
      "engagement_score": 130,
      "published_to_social": false,
      "social_publish_date": null,
      "extra_metadata": {
        "tags": ["energia", "acesso"],
        "impact_level": "high",
        "target_audience": ["Famílias de baixa renda"],
        "pdf_pages": 6,
        "word_count": 1460
      },
      "created_at": "2025-11-22T17:40:28",
      "updated_at": "2025-11-22T17:40:28"
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

**Casos de Uso no Frontend:**

```javascript
// 1. Feed principal
async function loadNewsFeed(page = 1) {
  const limit = 20;
  const offset = (page - 1) * limit;
  const response = await fetch(`/api/v1/news?limit=${limit}&offset=${offset}`);
  return await response.json();
}

// 2. Filtrar por tipo de proposição
async function loadNewsByType(newsType) {
  const response = await fetch(`/api/v1/news?news_type=${newsType}&limit=50`);
  return await response.json();
}

// 3. Notícias por estado
async function loadNewsByState(uf) {
  const response = await fetch(`/api/v1/news?uf_author=${uf}`);
  return await response.json();
}
```

---

### 2.2 Buscar Notícia por ID

**Endpoint:** `GET /news/{news_id}`

**Quando usar:**
- Página de detalhes de uma notícia específica
- Ao clicar em uma notícia na lista

**Exemplo de Requisição:**

```javascript
async function loadNewsDetails(newsId) {
  const response = await fetch(`/api/v1/news/${newsId}`);
  if (!response.ok) {
    throw new Error('Notícia não encontrada');
  }
  return await response.json();
}
```

**Exemplo de Resposta:** (mesmo formato do item individual do endpoint de listagem)

---

### 2.3 Votar em Notícia

**Endpoint:** `POST /news/{news_id}/vote`

**Quando usar:**
- Quando usuário clicar em "👍 Curtir" ou "👎 Não curtir"
- Sistema de engajamento/relevância

**Body:**

```json
{
  "vote_type": "upvote"  // ou "downvote"
}
```

**Exemplo de Requisição:**

```javascript
async function voteOnNews(newsId, voteType) {
  const response = await fetch(`/api/v1/news/${newsId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vote_type: voteType })
  });
  
  if (!response.ok) {
    throw new Error('Erro ao votar');
  }
  
  return await response.json();
}

// Uso no componente
<button onClick={() => voteOnNews(newsId, 'upvote')}>👍</button>
<button onClick={() => voteOnNews(newsId, 'downvote')}>👎</button>
```

**Exemplo de Resposta:**

```json
{
  "news_id": "ffaf7f68-2de8-4553-b074-50138e1fa376",
  "upvotes": 151,
  "downvotes": 20,
  "engagement_score": 131
}
```

---

## 3. Fluxo de Geração de Notícias (Admin/Background)

### 3.1 Gerar Notícia para Proposição Específica

**Endpoint:** `POST /news/generate/{proposition_id}`

**Quando usar:**
- Painel administrativo quando admin seleciona uma proposição específica
- Botão "Gerar notícia" na página de detalhes de uma proposição
- **Atenção:** Este endpoint é **síncrono** (espera a geração completa, ~30s)

**Body:**

```json
{
  "id_proposicao": 2497383,
  "sigla": "EMR",
  "numero": 3,
  "ano": 2025,
  "ementa": "Dispõe sobre...",
  "url_teor_proposicao": "https://www.camara.leg.br/...",
  "sigla_uf_autor": "MG",
  "nome_autor": "Lafayette De Andrada",
  "sigla_partido": "REPUBLIC"
}
```

**Exemplo de Requisição:**

```javascript
async function generateNewsForProposition(proposition) {
  // Mostrar loading durante ~30 segundos
  const response = await fetch(
    `/api/v1/news/generate/${proposition.id_proposicao}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proposition)
    }
  );
  
  return await response.json();
}

// Uso no componente
async function handleGenerateNews(proposition) {
  setLoading(true);
  setProgress('Processando... isso pode levar 30 segundos');
  
  try {
    const result = await generateNewsForProposition(proposition);
    if (result.success) {
      alert(`Notícia gerada: ${result.title}`);
      // Redirecionar para /news/{result.news_id}
    }
  } catch (error) {
    alert('Erro ao gerar notícia');
  } finally {
    setLoading(false);
  }
}
```

**Exemplo de Resposta (Sucesso):**

```json
{
  "success": true,
  "news_id": "ae40edb7-aaaf-4552-8285-3654aa586b9c",
  "proposition_id": 2497383,
  "title": "Projeto de lei busca universalizar o acesso à energia elétrica"
}
```

**Exemplo de Resposta (Erro):**

```json
{
  "success": false,
  "error": "PDF inválido ou inacessível",
  "proposition_id": 2497383
}
```

---

### 3.2 Gerar Notícias em Lote (Batch)

**Endpoint:** `POST /news/generate/batch`

**Quando usar:**
- Painel administrativo para processar múltiplas proposições de uma vez
- Seleção em massa na lista de proposições
- **Atenção:** Este endpoint é **síncrono** e pode demorar vários minutos

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição | Padrão |
|-----------|------|-------------|-----------|--------|
| `max_concurrent` | int | Não | Máx de processamentos simultâneos (1-10) | 3 |

**Body:** Array de proposições

```json
[
  {
    "id_proposicao": 2497383,
    "sigla": "EMR",
    "numero": 3,
    "ano": 2025,
    "ementa": "...",
    "url_teor_proposicao": "...",
    "nome_autor": "...",
    "sigla_partido": "..."
  },
  {
    "id_proposicao": 2496612,
    "sigla": "EMP",
    "numero": 2,
    "ano": 2025,
    "ementa": "...",
    "url_teor_proposicao": "...",
    "nome_autor": "...",
    "sigla_partido": "..."
  }
]
```

**Exemplo de Requisição:**

```javascript
async function generateBatchNews(propositions, maxConcurrent = 3) {
  const response = await fetch(
    `/api/v1/news/generate/batch?max_concurrent=${maxConcurrent}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propositions)
    }
  );
  
  return await response.json();
}

// Uso no painel admin
async function handleBatchGenerate(selectedPropositions) {
  if (selectedPropositions.length > 10) {
    alert('Máximo de 10 proposições por vez para evitar timeout');
    return;
  }
  
  setProcessing(true);
  setProgress(`Processando ${selectedPropositions.length} proposições...`);
  
  try {
    const result = await generateBatchNews(selectedPropositions, 2);
    alert(`Sucesso: ${result.successful}/${result.total} notícias geradas`);
    
    // Mostrar detalhes dos erros
    result.results.forEach(r => {
      if (!r.success) {
        console.error(`Erro na proposição ${r.proposition_id}: ${r.error}`);
      }
    });
  } finally {
    setProcessing(false);
  }
}
```

**Exemplo de Resposta:**

```json
{
  "total": 2,
  "successful": 1,
  "failed": 1,
  "results": [
    {
      "success": true,
      "news_id": "ae40edb7-aaaf-4552-8285-3654aa586b9c",
      "proposition_id": 2497383,
      "title": "Projeto de lei busca universalizar..."
    },
    {
      "success": false,
      "proposition_id": 2496612,
      "error": "PDF download failed after 3 attempts"
    }
  ]
}
```

---

### 3.3 Gerar Notícias em Background (Assíncrono)

**Endpoint:** `POST /news/generate/background`

**Quando usar:**
- Processar grandes quantidades de proposições (>10)
- Geração agendada/automática
- Quando não precisa esperar o resultado imediato
- **Recomendado para lotes grandes**

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição | Padrão |
|-----------|------|-------------|-----------|--------|
| `max_concurrent` | int | Não | Máx de processamentos simultâneos (1-10) | 3 |

**Body:** Array de proposições (mesmo formato do batch)

**Exemplo de Requisição:**

```javascript
async function queueNewsGeneration(propositions, maxConcurrent = 3) {
  const response = await fetch(
    `/api/v1/news/generate/background?max_concurrent=${maxConcurrent}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propositions)
    }
  );
  
  return await response.json();
}

// Uso recomendado para grandes volumes
async function handleBulkGenerate(propositions) {
  const result = await queueNewsGeneration(propositions);
  
  alert(`${result.message}\n\nAs notícias aparecerão no feed em alguns minutos.`);
  
  // Opcional: polling para verificar se as notícias foram geradas
  setTimeout(() => checkForNewNews(propositions), 60000); // Checar após 1 min
}
```

**Exemplo de Resposta:**

```json
{
  "message": "Background processing started for 50 propositions",
  "status": "queued"
}
```

**Nota:** Este endpoint retorna imediatamente. As notícias aparecerão no endpoint `GET /news` conforme forem processadas.

---

## 4. Fluxo Recomendado por Cenário

### 4.1 Usuário Final (Feed de Notícias)

```mermaid
graph LR
A[Usuário acessa app] --> B[GET /news]
B --> C[Lista de notícias]
C --> D[Clica em notícia]
D --> E[GET /news/{id}]
E --> F[Detalhes da notícia]
F --> G[Vota 👍/👎]
G --> H[POST /news/{id}/vote]
```

**Implementação:**

```javascript
// Página inicial
function NewsFeed() {
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(1);
  
  useEffect(() => {
    async function load() {
      const data = await fetch(`/api/v1/news?limit=20&offset=${(page-1)*20}`);
      setNews(await data.json());
    }
    load();
  }, [page]);
  
  return (
    <div>
      {news.items.map(item => (
        <NewsCard 
          key={item.id} 
          news={item}
          onVote={(voteType) => voteOnNews(item.id, voteType)}
        />
      ))}
    </div>
  );
}
```

---

### 4.2 Admin - Geração Individual

```mermaid
graph LR
A[Admin busca proposições] --> B[GET /propositions]
B --> C[Lista de proposições]
C --> D[Seleciona uma]
D --> E[POST /news/generate/{id}]
E --> F[Aguarda 30s]
F --> G[Notícia gerada]
```

**Implementação:**

```javascript
function AdminPropositionList() {
  const [propositions, setPropositions] = useState([]);
  const [generating, setGenerating] = useState(null);
  
  async function handleGenerate(prop) {
    setGenerating(prop.id_proposicao);
    
    try {
      const result = await fetch(
        `/api/v1/news/generate/${prop.id_proposicao}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prop)
        }
      );
      
      const data = await result.json();
      
      if (data.success) {
        alert(`✅ Notícia gerada: ${data.title}`);
        // Navegar para /news/${data.news_id}
      } else {
        alert(`❌ Erro: ${data.error}`);
      }
    } finally {
      setGenerating(null);
    }
  }
  
  return (
    <div>
      {propositions.map(prop => (
        <PropositionCard 
          key={prop.id_proposicao}
          proposition={prop}
          onGenerate={() => handleGenerate(prop)}
          isGenerating={generating === prop.id_proposicao}
        />
      ))}
    </div>
  );
}
```

---

### 4.3 Admin - Geração em Lote

```mermaid
graph LR
A[Admin seleciona múltiplas] --> B[GET /propositions]
B --> C[Checkbox selection]
C --> D{Quantidade}
D -->|≤10| E[POST /news/generate/batch]
D -->|>10| F[POST /news/generate/background]
E --> G[Aguarda resultado]
F --> H[Retorna imediatamente]
H --> I[Polling em /news]
```

**Implementação:**

```javascript
function AdminBatchGeneration() {
  const [selected, setSelected] = useState([]);
  const [processing, setProcessing] = useState(false);
  
  async function handleBatchGenerate() {
    setProcessing(true);
    
    const useBackground = selected.length > 10;
    const endpoint = useBackground 
      ? '/api/v1/news/generate/background'
      : '/api/v1/news/generate/batch';
    
    try {
      const response = await fetch(
        `${endpoint}?max_concurrent=3`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selected)
        }
      );
      
      const result = await response.json();
      
      if (useBackground) {
        alert(`✅ ${result.message}\n\nAs notícias aparecerão no feed em breve.`);
      } else {
        alert(`✅ ${result.successful}/${result.total} notícias geradas`);
        
        // Mostrar erros
        result.results
          .filter(r => !r.success)
          .forEach(r => {
            console.error(`Proposição ${r.proposition_id}: ${r.error}`);
          });
      }
    } finally {
      setProcessing(false);
      setSelected([]);
    }
  }
  
  return (
    <div>
      <button 
        onClick={handleBatchGenerate}
        disabled={selected.length === 0 || processing}
      >
        {processing 
          ? 'Processando...' 
          : `Gerar ${selected.length} notícias`
        }
      </button>
    </div>
  );
}
```

---

## 5. Tratamento de Erros

### Códigos HTTP

| Código | Significado | Ação no Frontend |
|--------|-------------|------------------|
| 200 | Sucesso | Processar resposta normalmente |
| 404 | Não encontrado | Mostrar "Notícia não encontrada" |
| 422 | Validação falhou | Mostrar erros de validação ao usuário |
| 500 | Erro interno | Mostrar "Erro no servidor, tente novamente" |

### Exemplo de Tratamento:

```javascript
async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Recurso não encontrado');
      }
      if (response.status === 422) {
        const error = await response.json();
        throw new Error(`Validação: ${error.detail}`);
      }
      throw new Error('Erro no servidor');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    toast.error(error.message);
    throw error;
  }
}
```

---

## 6. Limites e Restrições

### Rate Limits
- **Geração de notícias:** Máximo 10 requisições simultâneas por IP
- **Listagem:** Sem limite
- **Votação:** Máximo 100 votos por IP por hora

### Timeouts
- **GET /news, /propositions:** 30s
- **POST /news/generate/{id}:** 120s (2 minutos)
- **POST /news/generate/batch:** 300s (5 minutos) - recomendado max 10 proposições
- **POST /news/generate/background:** 30s (retorna imediatamente)

### Paginação
- **Máximo por página:** 100 itens
- **Recomendado:** 20-50 itens por página

---

## 7. Considerações de Performance

### Cache
- Implementar cache client-side para listagem de notícias (5 minutos)
- Cache de proposições (10 minutos)
- Invalidar cache após gerar nova notícia

### Loading States
- **Listagens:** Skeleton loader
- **Geração individual:** Progress bar com estimativa (30s)
- **Geração batch:** Progress bar com contador
- **Background:** Toast notification

### Otimizações

```javascript
// 1. Cache com React Query
import { useQuery } from '@tanstack/react-query';

function useNews(page = 1) {
  return useQuery({
    queryKey: ['news', page],
    queryFn: () => fetch(`/api/v1/news?limit=20&offset=${(page-1)*20}`).then(r => r.json()),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// 2. Infinite scroll
import { useInfiniteQuery } from '@tanstack/react-query';

function useInfiniteNews() {
  return useInfiniteQuery({
    queryKey: ['news'],
    queryFn: ({ pageParam = 0 }) => 
      fetch(`/api/v1/news?limit=20&offset=${pageParam}`).then(r => r.json()),
    getNextPageParam: (lastPage, pages) => 
      lastPage.items.length === 20 ? pages.length * 20 : undefined,
  });
}

// 3. Prefetch na navegação
const queryClient = useQueryClient();

function handleNewsHover(newsId) {
  queryClient.prefetchQuery({
    queryKey: ['news', newsId],
    queryFn: () => fetch(`/api/v1/news/${newsId}`).then(r => r.json()),
  });
}
```

---

## 8. Exemplos Completos

### Exemplo: Página de Feed

```javascript
import { useState, useEffect } from 'react';

function NewsFeedPage() {
  const [news, setNews] = useState([]);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadNews();
  }, [page, filters]);
  
  async function loadNews() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: 20,
        offset: (page - 1) * 20,
        ...filters
      });
      
      const response = await fetch(`/api/v1/news?${params}`);
      const data = await response.json();
      
      setNews(data.items);
    } catch (error) {
      console.error('Erro ao carregar notícias:', error);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleVote(newsId, voteType) {
    try {
      await fetch(`/api/v1/news/${newsId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote_type: voteType })
      });
      
      // Atualizar contadores localmente
      setNews(prevNews => 
        prevNews.map(item => 
          item.id === newsId
            ? { 
                ...item, 
                [voteType === 'upvote' ? 'upvotes' : 'downvotes']: 
                  item[voteType === 'upvote' ? 'upvotes' : 'downvotes'] + 1 
              }
            : item
        )
      );
    } catch (error) {
      alert('Erro ao votar');
    }
  }
  
  return (
    <div>
      <Filters onChange={setFilters} />
      
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div>
          {news.map(item => (
            <NewsCard 
              key={item.id}
              news={item}
              onVote={(voteType) => handleVote(item.id, voteType)}
            />
          ))}
        </div>
      )}
      
      <Pagination 
        currentPage={page}
        onPageChange={setPage}
      />
    </div>
  );
}
```

### Exemplo: Painel Admin

```javascript
function AdminPanel() {
  const [propositions, setPropositions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  
  async function loadPropositions() {
    const response = await fetch('/api/v1/propositions?limit=50&ano=2025');
    const data = await response.json();
    
    // Filtrar apenas as que não têm notícia ainda
    const withoutNews = await Promise.all(
      data.map(async prop => {
        const news = await fetch(`/api/v1/news?proposition_id=${prop.id_proposicao}`);
        const newsData = await news.json();
        return newsData.items.length === 0 ? prop : null;
      })
    );
    
    setPropositions(withoutNews.filter(Boolean));
  }
  
  async function handleBatchGenerate() {
    setGenerating(true);
    setProgress(`Gerando notícias para ${selected.length} proposições...`);
    
    try {
      // Usar background para lotes grandes
      const endpoint = selected.length > 10
        ? '/api/v1/news/generate/background'
        : '/api/v1/news/generate/batch';
      
      const response = await fetch(`${endpoint}?max_concurrent=3`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selected)
      });
      
      const result = await response.json();
      
      if (selected.length > 10) {
        setProgress(`✅ ${result.message}`);
      } else {
        setProgress(`✅ ${result.successful}/${result.total} notícias geradas com sucesso`);
      }
      
      // Recarregar lista
      await loadPropositions();
      setSelected([]);
    } catch (error) {
      setProgress(`❌ Erro: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  }
  
  return (
    <div>
      <h1>Painel Administrativo</h1>
      
      <div>
        <button 
          onClick={handleBatchGenerate}
          disabled={selected.length === 0 || generating}
        >
          {generating 
            ? progress
            : `Gerar ${selected.length} notícias`
          }
        </button>
      </div>
      
      <PropositionList
        propositions={propositions}
        selected={selected}
        onSelectionChange={setSelected}
      />
    </div>
  );
}
```

---

## 9. Checklist de Integração

- [ ] Implementar listagem de notícias com paginação
- [ ] Implementar filtros (tipo, UF, etc.)
- [ ] Página de detalhes de notícia
- [ ] Sistema de votação (upvote/downvote)
- [ ] Painel admin para listar proposições
- [ ] Geração individual de notícia com loading (30s)
- [ ] Geração em lote (máx 10) com progress
- [ ] Geração background para lotes grandes
- [ ] Tratamento de erros e timeouts
- [ ] Cache client-side
- [ ] Loading states e skeletons
- [ ] Toasts/notifications
- [ ] Tratamento de duplicatas (proposição já processada)

---

## 10. Deploy e Configuração (Portainer/Docker)

### Variáveis de Ambiente para Produção

Ao fazer deploy no Portainer ou qualquer ambiente Docker, configure as seguintes variáveis:

#### Obrigatórias

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/database

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_BUCKET_NAME=proposition-pdfs

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Google Cloud (BigQuery)
GOOGLE_CLOUD_PROJECT=seu-projeto-id
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n..."}
```

#### Credenciais do Google Cloud

**Importante:** Use `GOOGLE_APPLICATION_CREDENTIALS_JSON` com o JSON completo em uma única linha.

**Como obter o JSON:**

1. Baixe o arquivo `credentials.json` do Google Cloud Console
2. Minifique em uma linha:

```bash
# Linux/Mac
cat credentials.json | jq -c '.' | sed "s/'/\\\\'/g"

# Ou manualmente
cat credentials.json | tr -d '\n' | tr -d ' '
```

3. Cole o resultado na variável `GOOGLE_APPLICATION_CREDENTIALS_JSON`

**Exemplo no Portainer:**

```
Nome: GOOGLE_APPLICATION_CREDENTIALS_JSON
Valor: {"type":"service_account","project_id":"hackathon-tdc",...}
```

### Health Check

Configure health check no Portainer:

```
HTTP: GET http://localhost:8000/docs
Interval: 30s
Timeout: 10s
Retries: 3
```

### Recursos Recomendados

```yaml
resources:
  limits:
    memory: 2GB
    cpu: "1.0"
  reservations:
    memory: 512MB
    cpu: "0.5"
```

### Volumes Persistentes

Não são necessários volumes para este serviço, pois:
- PDFs são armazenados no Supabase Storage
- Database está no Supabase PostgreSQL
- Não há estado local a persistir

---

## 11. Suporte

Para dúvidas ou problemas:
- Consultar logs do servidor em `/tmp/server.log`
- Verificar documentação completa em `backend-python/README.md`
- Conferir estrutura de dados em `backend-python/src/app/models/`
