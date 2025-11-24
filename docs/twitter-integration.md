# Integração com Twitter/X - Guia de Uso

## Visão Geral

O Pauta Cidadã possui integração automática com o Twitter/X que publica notícias quando atingem um threshold de votos configurável.

## Como Funciona

1. Usuários votam em notícias através do endpoint `/api/v1/news/{news_id}/vote`
2. Quando o total de votos (upvotes + downvotes) atinge o threshold configurado
3. O sistema automaticamente:
   - Posta a notícia no Twitter/X
   - Salva a URL do tweet no banco de dados
   - Adiciona um rodapé no `full_content` com link para o tweet
   - Marca a notícia como `published_to_social = true`

## Configuração

### 1. Obter Credenciais do Twitter

Acesse o [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard) e crie um App com permissões de **Read and Write**.

Você precisará de:
- API Key (Consumer Key)
- API Secret (Consumer Secret)
- Access Token
- Access Token Secret
- Bearer Token

### 2. Configurar Variáveis de Ambiente

Adicione no seu `.env`:

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

### 3. Ajustar Threshold (Opcional)

O threshold padrão é **10 votos**. Para alterar:

```env
# Para testes (1 voto)
TWITTER_VOTE_THRESHOLD=1

# Para produção (100 votos)
TWITTER_VOTE_THRESHOLD=100
```

## Formato do Tweet

O tweet gerado segue este formato:

```
🗳️ [Título da Notícia]

[Resumo da notícia]

Participe da discussão e vote!

👉 https://pautacidada.com.br/noticia/{news_id}

#PautaCidadã #Política
```

**Nota:** O texto é automaticamente truncado para respeitar o limite de 280 caracteres do Twitter.

## Rodapé Adicionado à Notícia

Após a postagem bem-sucedida, o seguinte rodapé é adicionado ao `full_content`:

```
---
📱 Acompanhe a discussão no X: https://x.com/PautaCidada/status/1234567890
```

## Testando Localmente

### 1. Instalar Dependências

```bash
cd backend-python
uv pip install tweepy
```

### 2. Configurar Threshold Baixo

```env
TWITTER_VOTE_THRESHOLD=1
```

### 3. Votar em uma Notícia

```bash
curl -X PATCH "http://localhost:8000/api/v1/news/{news_id}/vote" \
  -H "Content-Type: application/json" \
  -d '{"vote_type": "upvote"}'
```

### 4. Verificar Tweet

Acesse o perfil do Twitter configurado e verifique se o tweet foi publicado.

## Tratamento de Erros

- Se as credenciais do Twitter não estiverem configuradas, o serviço registra um warning mas não falha
- Se a postagem no Twitter falhar, o voto ainda é registrado normalmente
- Erros são logados mas não interrompem o fluxo de votação

## Limitações da API do Twitter

- **Rate Limit:** 300 tweets por 3 horas (API v2)
- **Caracteres:** Máximo de 280 caracteres por tweet
- **Duplicatas:** O Twitter pode rejeitar tweets idênticos em sequência

## Monitoramento

Verifique os logs para acompanhar as postagens:

```bash
# Ver logs do container
docker compose logs -f backend-python

# Buscar por postagens no Twitter
docker compose logs backend-python | grep "Twitter"
```

## Troubleshooting

### Tweet não foi publicado

1. Verifique se as credenciais estão corretas no `.env`
2. Confirme que o threshold foi atingido
3. Verifique se `twitter_post_url` já está preenchido (não posta duplicado)
4. Consulte os logs para erros específicos

### Erro de autenticação

```
Failed to initialize Twitter client: 401 Unauthorized
```

**Solução:** Verifique se as credenciais estão corretas e se o App tem permissões de escrita.

### Rate limit excedido

```
Twitter posting failed: 429 Too Many Requests
```

**Solução:** Aguarde o reset do rate limit (3 horas) ou reduza a frequência de postagens aumentando o threshold.

## Segurança

- ✅ Nunca commite o arquivo `.env` com credenciais reais
- ✅ Use variáveis de ambiente em produção
- ✅ Rotacione as credenciais periodicamente
- ✅ Monitore o uso da API no Twitter Developer Portal

## Próximos Passos

- [ ] Implementar fila de processamento (Celery/Redis)
- [ ] Adicionar retry automático em caso de falha
- [ ] Criar dashboard de monitoramento
- [ ] Suporte para threads (tweets longos)
- [ ] Permitir customização do template do tweet
