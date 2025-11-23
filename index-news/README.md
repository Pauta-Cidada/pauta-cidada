# index-news

Script para indexar e processar proposições legislativas, gerando notícias através de IA.

## O que faz

O script realiza o seguinte fluxo:

1. **Busca proposições brutas** da API do backend em `/api/v1/propositions` com paginação
2. **Filtra duplicatas** verificando quais proposições já foram processadas via `/api/v1/news/proposition/{id}`
3. **Processa em batch** enviando apenas as proposições não processadas para `/api/v1/news/generate/batch`
4. **Coleta métricas** de tempo total e tempo médio por notícia processada

## Instalação

```bash
npm install
```

## Configuração

Edite o arquivo `scripts/fetch-and-generate.js` e ajuste as variáveis no topo:

```javascript
const baseUrl = "http://localhost:8000";  // URL do backend
const perPage = 10;                        // Proposições por página
const pages = 1;                           // Quantidade de páginas a processar
```

## Uso

```bash
npm run fetch-and-generate
```

## Saída

O script exibe no console:
- Progresso de busca e filtragem
- Resultado completo do processamento em batch
- Métricas finais com tempo total e tempo médio por notícia

Exemplo:
```
==================================================
📊 MÉTRICAS DE EXECUÇÃO
==================================================
Tempo total de execução: 2:45
Notícias processadas: 8
Tempo médio por notícia: 0:20
==================================================
```

## Notas

- Apenas proposições com `success: true` são contabilizadas nas métricas
- Proposições duplicadas ou já processadas são automaticamente filtradas
- O tempo de processamento considera apenas o tempo da rota de batch, não inclui buscas e filtros
