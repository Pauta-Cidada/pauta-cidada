"""AI News Generator Service using Pydantic AI"""

from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel
from pydantic import BaseModel, Field
from typing import List, Literal
import logging
from app.models.ai_prompts import SYSTEM_PROMPT, FULL_CONTENT_PROMPT

logger = logging.getLogger(__name__)


class NewsOutput(BaseModel):
    """Output structure for AI-generated news"""
    title: str = Field(max_length=500, description="News title")
    summary: str = Field(min_length=100, max_length=500, description="Brief summary (100-500 words)")
    full_content: str = Field(min_length=500, max_length=3000, description="Full article (500-3000 words)")
    tags: List[str] = Field(max_items=5, description="Keywords/tags")
    impact_level: Literal["low", "medium", "high"] = Field(description="Impact level")
    target_audience: List[str] = Field(description="Target audience groups")


class AINewsGeneratorService:
    """Service for generating news articles using Pydantic AI"""
    
    def __init__(self):
        self.agent = Agent(
            model=OpenAIModel('gpt-4o-mini'),
            output_type=NewsOutput,
            system_prompt=SYSTEM_PROMPT,
            output_retries=3  # Allow 3 retries for validation
        )
    
    async def generate_news(
        self,
        pdf_text: str,
        proposition_data: dict
    ) -> NewsOutput:
        """
        Generate news article from proposition PDF text.
        
        Args:
            pdf_text: Extracted text from PDF
            proposition_data: Dict with proposition metadata from BigQuery
            
        Returns:
            NewsOutput with title, summary, full_content, tags, etc.
        """
        try:
            # Limit text to avoid token limits
            truncated_text = pdf_text[:8000] if len(pdf_text) > 8000 else pdf_text
            
            # Build prompt
            prompt = FULL_CONTENT_PROMPT.format(
                document_text=truncated_text,
                proposition_type=proposition_data.get("sigla", ""),
                proposition_number=f"{proposition_data.get('sigla', '')} {proposition_data.get('numero', '')}/{proposition_data.get('ano', '')}",
                author_name=proposition_data.get("nome_autor", ""),
                party=proposition_data.get("sigla_partido", ""),
                uf=proposition_data.get("sigla_uf_autor", ""),
                presentation_date=proposition_data.get("dataApresentacao", ""),
                ementa=proposition_data.get("ementa", "")
            )
            
            logger.info(f"Generating news for proposition {proposition_data.get('id_proposicao')}")
            
            # Generate with Pydantic AI
            result = await self.agent.run(prompt)
            
            logger.info(f"News generated successfully: {result.output.title[:50]}...")
            
            return result.output
            
        except Exception as e:
            logger.error(f"Error generating news: {e}")
            raise
