# Plano de Implementação: Integração com X (Twitter)

## Objetivo
Implementar postagem automática no X quando uma notícia atingir 10 votos, salvando a URL do post no banco e atualizando o rodapé da descrição completa.

## 1. Alterações no Banco de Dados

### 1.1 Nova Migration
**Arquivo:** `backend-python/src/app/db/migrations/versions/XXXX_add_twitter_post_url.py`

- Adicionar coluna `twitter_post_url` (String(500), nullable=True)
- Adicionar índice na coluna para consultas rápidas

### 1.2 Atualizar Model SQLAlchemy
**Arquivo:** `backend-python/src/app/db/models/news.py`

- Adicionar campo: `twitter_post_url = Column(String(500), nullable=True)`
- Posicionar após o campo `social_publish_date` (linha ~48)

## 2. Variáveis de Ambiente

### 2.1 Adicionar em `.env.example` e `.env`
```env
# Twitter/X API Configuration
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here
TWITTER_BEARER_TOKEN=your_bearer_token_here

# Twitter Auto-Post Configuration
TWITTER_VOTE_THRESHOLD=10
```

### 2.2 Atualizar Settings
**Arquivo:** `backend-python/src/app/core/config.py`

- Adicionar campos de configuração do Twitter no Pydantic Settings
- Adicionar `twitter_vote_threshold: int = Field(default=10)` para threshold configurável

## 3. Serviço de Integração com X

### 3.1 Criar Service
**Arquivo:** `backend-python/src/app/services/twitter_service.py`

**Funcionalidades:**
- Classe `TwitterService` com método `post_news_to_twitter(news: News) -> str`
- Usar biblioteca `tweepy` (adicionar em `pyproject.toml`)
- Gerar texto do tweet:
  - Título da notícia (`news.title`)
  - Resumo da notícia (`news.summary`) - truncado se necessário
  - Chamada para engajamento
  - Link para a notícia no site: `https://pautacidada.com.br/noticia/{news_id}`
  - Hashtags relevantes (#PautaCidadã #Política #Democracia)
- Respeitar limite de 280 caracteres do Twitter
- Retornar URL do tweet publicado
- Tratamento de erros (rate limit, autenticação, etc.)

**Exemplo de tweet:**
```
🗳️ {news.title}

{news.summary}

Participe da discussão e vote!

👉 https://pautacidada.com.br/noticia/{news.id}

#PautaCidadã #Política
```

**Nota:** Se o texto ultrapassar 280 caracteres, truncar o summary e adicionar "..."

## 4. Atualizar Endpoint de Votação

### 4.1 Modificar Vote Endpoint
**Arquivo:** `backend-python/src/app/api/v1/endpoints/news.py`

**Lógica no endpoint `/api/v1/news/{news_id}/vote`:**

1. Registrar o voto (lógica atual)
2. Buscar notícia atualizada do banco
3. Calcular total de votos: `total_votes = news.upvotes + news.downvotes`
4. **Verificar threshold:**
   ```python
   threshold = settings.twitter_vote_threshold  # Default: 10
   if total_votes >= threshold and not news.twitter_post_url:
       # Postar no Twitter
       twitter_url = await twitter_service.post_news_to_twitter(news)
       
       # Atualizar banco
       news.twitter_post_url = twitter_url
       news.published_to_social = True
       news.social_publish_date = datetime.utcnow()
       
       # Atualizar rodapé do full_content
       footer = f"\n\n---\n📱 Acompanhe a discussão no X: {twitter_url}"
       news.full_content = news.full_content + footer
       
       await db.commit()
   ```

## 5. Dependências

### 5.1 Adicionar ao `pyproject.toml`
```toml
tweepy = "^4.14.0"
```

### 5.2 Instalar
```bash
cd backend-python
uv pip install tweepy
```

## 6. Estrutura de Arquivos

```
backend-python/
├── src/app/
│   ├── api/v1/endpoints/
│   │   └── news.py (modificar)
│   ├── core/
│   │   └── config.py (modificar)
│   ├── db/
│   │   ├── models/
│   │   │   └── news.py (modificar)
│   │   └── migrations/versions/
│   │       └── XXXX_add_twitter_post_url.py (criar)
│   └── services/
│       └── twitter_service.py (criar)
├── pyproject.toml (modificar)
├── .env.example (modificar)
└── .env (modificar)
```

## 7. Testes Recomendados

1. **Teste unitário:** `TwitterService.post_news_to_twitter()`
2. **Teste de integração:** Endpoint de votação com mock do Twitter
3. **Teste manual:** Votar 10 vezes em uma notícia e verificar:
   - Post criado no X
   - URL salva no banco
   - Rodapé atualizado no `full_content`
   - Campos `published_to_social` e `social_publish_date` atualizados

## 8. Considerações de Segurança

- ✅ Credenciais do Twitter apenas em variáveis de ambiente
- ✅ Nunca commitar `.env` com credenciais reais
- ✅ Rate limiting do Twitter (300 tweets/3h para API v2)
- ✅ Tratamento de erros para não quebrar o fluxo de votação

## 9. Melhorias Futuras (Opcional)

- [ ] Fila de processamento (Celery/Redis) para não bloquear o endpoint
- [ ] Retry automático em caso de falha
- [ ] Dashboard para monitorar posts no X
- [ ] Permitir customização do template do tweet
- [ ] Suporte para threads (tweets longos)

## 10. Ordem de Implementação

1. ✅ Criar migration e atualizar model
2. ✅ Adicionar variáveis de ambiente
3. ✅ Criar `TwitterService`
4. ✅ Atualizar endpoint de votação
5. ✅ Testar localmente
6. ✅ Atualizar documentação
7. ✅ Deploy

---

**Estimativa de tempo:** 3-4 horas
**Complexidade:** Média
**Prioridade:** Alta
