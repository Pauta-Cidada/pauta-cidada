SELECT 
  prop.id_proposicao ,
  prop.sigla,
  prop.numero,
  prop.ano,
  prop.ementa,
  prop.ementa_detalhada,
  prop.palavra_chave,
  DATETIME(data, prop.horario) AS dataApresentacao,
  prop.url_teor_proposicao,
  prop.url_principal,
  prop.url_posterior,
  autor.sigla_uf_autor,
  autor.nome_autor,
  autor.sigla_partido,
  autor.tipo_autor
FROM basedosdados.br_camara_dados_abertos.proposicao_microdados prop
join basedosdados.br_camara_dados_abertos.proposicao_autor autor on prop.id_proposicao = autor.id_proposicao
WHERE 1=1
