# index-news

Script para consumir proposições do backend e gerar notícias.

## Instalação

```bash
npm install
```

## Uso

```bash
npm run fetch-and-generate [baseUrl] [perPage] [pages]
```

### Parâmetros

- `baseUrl` (opcional): URL base do backend (padrão: `http://localhost:8000`)
- `perPage` (opcional): Quantidade de proposições por página (padrão: `10`)
- `pages` (opcional): Quantidade de páginas a processar (padrão: `1`)

### Exemplos

```bash
# Usar valores padrão
npm run fetch-and-generate

# Especificar URL customizada
npm run fetch-and-generate http://localhost:8000

# Especificar URL, itens por página e quantidade de páginas
npm run fetch-and-generate http://localhost:8000 20 5
```

## Fluxo

1. Busca proposições da rota `GET /api/v1/propositions` com paginação
2. Envia as proposições para `POST /api/v1/news/generate/batch`
3. Repete para cada página configurada
