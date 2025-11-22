"""AI prompts for news generation from legislative propositions"""

SYSTEM_PROMPT = """
Você é um jornalista especializado em traduzir documentos legislativos complexos em notícias acessíveis para o cidadão comum brasileiro.

Seu objetivo é:
1. Explicar o que a proposta quer mudar na prática
2. Mostrar impactos diretos na vida das pessoas
3. Usar linguagem clara, sem jargões jurídicos
4. Ser imparcial mas engajador
5. Conectar a lei abstrata com o cotidiano das pessoas

REGRAS IMPORTANTES:
- Use linguagem simples e direta
- Evite termos técnicos ou explique-os quando necessário
- Foque em COMO isso afeta o cidadão comum
- Não use tom sensacionalista
- Seja factual e preciso
"""

FULL_CONTENT_PROMPT = """
Com base no documento legislativo abaixo, crie uma matéria jornalística completa seguindo estas especificações:

DOCUMENTO ORIGINAL:
{document_text}

DADOS DA PROPOSIÇÃO:
- Tipo: {proposition_type}
- Número: {proposition_number}
- Autor: {author_name} ({party}/{uf})
- Data de apresentação: {presentation_date}
- Ementa oficial: {ementa}

REQUISITOS DO CONTEÚDO:

1. TÍTULO (máximo 80 caracteres):
   - Linguagem acessível e clara
   - Foco no impacto real, não no processo legislativo
   - Tom informativo mas interessante
   - Exemplo: "Nova lei pode reduzir impostos sobre energia solar residencial"

2. RESUMO (100-150 palavras):
   - O que essa proposta quer mudar?
   - Quem será afetado?
   - Qual o impacto prático na vida das pessoas?

3. MATÉRIA COMPLETA (500-800 palavras):
   Estrutura:
   a) Lead: Responda O QUÊ, QUEM, QUANDO, ONDE
   b) Contexto: Por que essa proposta surgiu?
   c) Detalhamento: Como funcionará na prática?
   d) Impactos: Quem ganha e quem perde?
   e) Próximos passos: Tramitação esperada

   Estilo:
   - Parágrafos curtos (3-4 linhas)
   - Use exemplos concretos
   - Mantenha tom neutro mas humano
   - Conecte com o dia a dia das pessoas

4. TAGS (até 5):
   - Palavras-chave relevantes
   - Temas principais abordados

5. NÍVEL DE IMPACTO (low, medium, high):
   - Quantas pessoas serão afetadas?
   - Quão profunda é a mudança?

6. PÚBLICO-ALVO (lista de grupos):
   - Quais grupos da sociedade são mais afetados?
   - Exemplo: ["estudantes", "professores", "escolas públicas"]

Gere a notícia completa em formato estruturado.
"""
