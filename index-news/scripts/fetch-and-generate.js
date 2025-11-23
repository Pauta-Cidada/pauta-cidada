import axios from "axios";

const baseUrl = "http://localhost:8000";
const perPage = 10;
const pages = 1;

const api = axios.create({
  baseURL: baseUrl,
});

// Busca proposições brutas da API com paginação
async function fetchPropositions(page) {
  try {
    const response = await api.get("/api/v1/propositions", {
      params: { page, perPage },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Erro ao buscar proposições (página ${page}):`,
      error.message
    );
    throw error;
  }
}

// Verifica se uma proposição já foi processada consultando a API
async function isPropositionProcessed(propositionId) {
  try {
    await api.get(`/api/v1/news/proposition/${propositionId}`);
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      return false;
    }
    throw error;
  }
}

// Filtra apenas as proposições que ainda não foram processadas
async function filterUnprocessedPropositions(propositions) {
  const unprocessed = [];
  for (const prop of propositions) {
    const isProcessed = await isPropositionProcessed(prop.id_proposicao);
    if (!isProcessed) {
      unprocessed.push(prop);
    }
  }
  return unprocessed;
}

// Formata tempo em milissegundos para formato mm:ss
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Envia proposições para a rota de processamento em batch
async function generateNews(propositions) {
  try {
    const response = await api.post(
      "/api/v1/news/generate/batch",
      propositions
    );

    return response.data;
  } catch (error) {
    console.error("Erro ao gerar notícias:", error.message);
    throw error;
  }
}

// Orquestra o fluxo completo: busca, filtra e processa proposições por página
async function main() {
  const startTime = Date.now();
  let totalProcessed = 0;
  let totalProcessingTime = 0;

  console.log(`Iniciando script fetch-and-generate`);
  console.log(`URL Base: ${baseUrl}`);
  console.log(`Por Página: ${perPage}`);
  console.log(`Páginas: ${pages}\n`);

  for (let page = 1; page <= pages; page++) {
    try {
      console.log(`Buscando proposições (página ${page}/${pages})...`);

      const propositions = await fetchPropositions(page);

      if (!Array.isArray(propositions) || propositions.length === 0) {
        console.log(`Nenhuma proposição encontrada na página ${page}`);
        continue;
      }

      console.log(`${propositions.length} proposições encontradas`);
      console.log(`Filtrando proposições já processadas...`);

      const unprocessed = await filterUnprocessedPropositions(propositions);

      if (unprocessed.length === 0) {
        console.log(`Todas as proposições já foram processadas`);
        continue;
      }

      console.log(`${unprocessed.length} proposições para processar`);
      console.log(`Gerando notícias para página ${page}...`);

      const pageStartTime = Date.now();
      const news = await generateNews(unprocessed);
      const pageProcessingTime = Date.now() - pageStartTime;

      const successfulCount = news.results.filter((r) => r.success).length;
      totalProcessed += successfulCount;
      totalProcessingTime += pageProcessingTime;

      console.log(`Notícias geradas com sucesso para página ${page}`);
      console.log(`Resultado:`, JSON.stringify(news, null, 2));
      console.log("---\n");
    } catch (error) {
      console.error(`Falha ao processar página ${page}`);
      process.exit(1);
    }
  }

  const totalTime = Date.now() - startTime;
  const averageTimePerNews =
    totalProcessed > 0 ? totalProcessingTime / totalProcessed : 0;

  console.log("\n" + "=".repeat(50));
  console.log("📊 MÉTRICAS DE EXECUÇÃO");
  console.log("=".repeat(50));
  console.log(`Tempo total de execução: ${formatTime(totalTime)}`);
  console.log(`Notícias processadas: ${totalProcessed}`);
  console.log(`Tempo médio por notícia: ${formatTime(averageTimePerNews)}`);
  console.log("=".repeat(50));
  console.log("Script concluído com sucesso");
}

main();
