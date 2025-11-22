// Tipos para as respostas da API

export interface Proposition {
  id_proposicao: number;
  sigla: string;
  numero: number;
  ano: number;
  ementa: string;
  ementa_detalhada: string;
  palavra_chave: string;
  dataApresentacao: string;
  url_teor_proposicao: string;
  url_principal: string;
  url_posterior: string;
  sigla_uf_autor: string;
  nome_autor: string;
  sigla_partido: string;
  tipo_autor: string;
}

export interface BatchResult {
  success: boolean;
  news_id: string;
  proposition_id: number;
  title: string;
  message: string;
  error: string;
}

export interface BatchResponse {
  total: number;
  successful: number;
  failed: number;
  results: BatchResult[];
}

export interface NewsDetail {
  id: string;
  title: string;
  summary: string;
  full_content: string;
  proposition_number: string;
  proposition_id: number;
  presentation_date: string;
  uf_author: string;
  author_name: string;
  author_type: string;
  party: string;
  news_type: string;
  original_ementa: string;
  pdf_storage_url: string;
  original_pdf_url: string;
  upvotes: number;
  downvotes: number;
  engagement_score: number;
  published_to_social: boolean;
  social_publish_date: string;
  extra_metadata: {
    tags: string[];
    impact_level: string;
    target_audience: string[];
    pdf_pages: number;
    word_count: number;
    has_tables: boolean;
  };
  created_at: string;
  updated_at: string;
}
