import axios from "axios";

const baseUrl = "http://localhost:8000";
const perPage = 2;
const pages = 1;

const api = axios.create({
  baseURL: baseUrl,
});

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

async function main() {
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
      console.log(`Gerando notícias para página ${page}...`);
      const news = await generateNews(propositions);

      console.log(`Notícias geradas com sucesso para página ${page}`);
      console.log(`Resultado:`, JSON.stringify(news, null, 2));
      console.log("---\n");
    } catch (error) {
      console.error(`Falha ao processar página ${page}`);
      process.exit(1);
    }
  }

  console.log("Script concluído com sucesso");
}

main();
