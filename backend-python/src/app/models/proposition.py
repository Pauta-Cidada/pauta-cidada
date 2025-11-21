from pydantic import BaseModel
from typing import Optional

class Proposition(BaseModel):
    id_proposicao: Optional[int] = None
    sigla: Optional[str] = None
    numero: Optional[int] = None
    ano: Optional[int] = None
    ementa: Optional[str] = None
    ementa_detalhada: Optional[str] = None
    palavra_chave: Optional[str] = None
    dataApresentacao: Optional[str] = None
    url_teor_proposicao: Optional[str] = None
    url_principal: Optional[str] = None
    url_posterior: Optional[str] = None
    sigla_uf_autor: Optional[str] = None
    nome_autor: Optional[str] = None
    sigla_partido: Optional[str] = None
    tipo_autor: Optional[str] = None
