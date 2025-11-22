"""News Orchestrator Service - coordinates the entire news generation pipeline"""

from app.services.pdf_processor_service import PDFProcessorService
from app.services.storage_service import StorageService
from app.services.ai_news_generator_service import AINewsGeneratorService
from app.repositories.news_repository import NewsRepository
from sqlalchemy.ext.asyncio import AsyncSession
import asyncio
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class NewsOrchestratorService:
    """Orchestrates the complete news generation pipeline"""
    
    def __init__(self, db_session: AsyncSession):
        self.pdf_processor = PDFProcessorService()
        self.storage = StorageService()
        self.ai_generator = AINewsGeneratorService()
        self.news_repo = NewsRepository(db_session)
        self.db_session = db_session
    
    async def process_proposition(self, proposition: dict) -> dict:
        """
        Complete pipeline for a single proposition:
        1. Check for duplicates
        2. Download PDF
        3. Extract text
        4. Upload to Supabase Storage
        5. Generate news with AI
        6. Save to database
        
        Args:
            proposition: Dict from BigQuery with proposition data
            
        Returns:
            Dict with success status and news_id
        """
        try:
            prop_id = proposition["id_proposicao"]
            print(f"\n{'='*60}")
            print(f"🚀 Starting processing for proposition {prop_id}")
            print(f"{'='*60}")
            
            # 1. Check if news already exists
            print(f"[1/6] 🔍 Checking if news already exists...")
            existing = await self.news_repo.get_by_proposition_id(prop_id)
            if existing:
                print(f"✅ News already exists for proposition {prop_id}")
                logger.info(f"News already exists for proposition {prop_id}")
                return {
                    "success": True,
                    "news_id": str(existing.id),
                    "proposition_id": prop_id,
                    "message": "Already processed"
                }
            print(f"   ✓ No existing news found, proceeding...")
            
            # 2. Download PDF
            print(f"[2/6] 📥 Downloading PDF from {proposition['url_teor_proposicao'][:50]}...")
            logger.info(f"Downloading PDF for proposition {prop_id}")
            pdf_bytes = await self.pdf_processor.download_pdf(
                proposition["url_teor_proposicao"]
            )
            print(f"   ✓ PDF downloaded successfully ({len(pdf_bytes)} bytes)")
            
            # 3. Extract text
            print(f"[3/6] 📄 Extracting text from PDF...")
            logger.info(f"Extracting text from PDF {prop_id}")
            extracted = await self.pdf_processor.extract_text(pdf_bytes)
            print(f"   ✓ Extracted {extracted['metadata']['word_count']} words from {extracted['metadata']['pages']} pages")
            
            # 4. Upload to Supabase Storage
            print(f"[4/6] ☁️  Uploading PDF to Supabase Storage...")
            logger.info(f"Uploading PDF to Supabase {prop_id}")
            filename = f"{proposition['sigla']}_{proposition['numero']}_{proposition['ano']}"
            pdf_url = await self.storage.upload_pdf(
                pdf_bytes,
                proposition["id_proposicao"],
                filename,
                year=proposition.get("ano")
            )
            
            print(f"   ✓ PDF uploaded to: {pdf_url[:60]}...")
            
            # 5. Generate news with AI
            print(f"[5/6] 🤖 Generating news content with AI (this may take 20-30s)...")
            logger.info(f"Generating news content with AI {prop_id}")
            news_content = await self.ai_generator.generate_news(
                extracted["full_text"],
                proposition
            )
            print(f"   ✓ AI generated: {news_content.title[:50]}...")
            
            # 6. Save to database
            print(f"[6/6] 💾 Saving news to database...")
            logger.info(f"Saving news to database {prop_id}")
            
            # Parse presentation date
            presentation_date = None
            if proposition.get("dataApresentacao"):
                try:
                    presentation_date = datetime.fromisoformat(
                        proposition["dataApresentacao"].replace("Z", "+00:00")
                    ).date()
                except:
                    presentation_date = datetime.utcnow().date()
            else:
                presentation_date = datetime.utcnow().date()
            
            news_data = {
                "title": news_content.title,
                "summary": news_content.summary,
                "full_content": news_content.full_content,
                "proposition_id": proposition["id_proposicao"],
                "proposition_number": f"{proposition['sigla']} {proposition['numero']}/{proposition['ano']}",
                "presentation_date": presentation_date,
                "uf_author": proposition.get("sigla_uf_autor"),
                "author_name": proposition.get("nome_autor"),
                "party": proposition.get("sigla_partido"),
                "news_type": proposition["sigla"],
                "original_ementa": proposition.get("ementa") or "",
                "pdf_storage_url": pdf_url,
                "original_pdf_url": proposition["url_teor_proposicao"],
                "upvotes": 0,
                "downvotes": 0,
                "engagement_score": 0,
                "published_to_social": False,
                "extra_metadata": {
                    "tags": news_content.tags,
                    "impact_level": news_content.impact_level,
                    "target_audience": news_content.target_audience,
                    "pdf_pages": extracted["metadata"]["pages"],
                    "word_count": extracted["metadata"]["word_count"],
                    "has_tables": extracted["metadata"].get("has_tables", False)
                }
            }
            
            created_news = await self.news_repo.create(news_data)
            
            await self.db_session.commit()
            
            print(f"   ✓ News saved with ID: {created_news.id}")
            print(f"\n✅ SUCCESS! News generated for proposition {prop_id}")
            print(f"{'='*60}\n")
            logger.info(f"News created successfully: {created_news.id}")
            
            return {
                "success": True,
                "news_id": str(created_news.id),
                "proposition_id": proposition["id_proposicao"],
                "title": created_news.title
            }
            
        except Exception as e:
            prop_id = proposition.get("id_proposicao", "unknown")
            print(f"\n❌ ERROR processing proposition {prop_id}: {str(e)}")
            print(f"{'='*60}\n")
            logger.error(f"Error processing proposition {prop_id}: {e}", exc_info=True)
            return {
                "success": False,
                "error": str(e),
                "proposition_id": proposition.get("id_proposicao")
            }
    
    async def batch_process(
        self, 
        propositions: list[dict],
        max_concurrent: int = 3
    ) -> list[dict]:
        """
        Process multiple propositions in parallel with concurrency control.
        
        Args:
            propositions: List of proposition dicts from BigQuery
            max_concurrent: Maximum number of concurrent processing tasks
            
        Returns:
            List of result dicts for each proposition
        """
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def process_with_limit(prop):
            async with semaphore:
                return await self.process_proposition(prop)
        
        logger.info(f"Starting batch processing of {len(propositions)} propositions")
        
        results = await asyncio.gather(*[
            process_with_limit(prop) for prop in propositions
        ], return_exceptions=True)
        
        # Convert exceptions to error dicts
        final_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                final_results.append({
                    "success": False,
                    "error": str(result),
                    "proposition_id": propositions[i].get("id_proposicao")
                })
            else:
                final_results.append(result)
        
        # Log summary
        successful = sum(1 for r in final_results if r.get("success"))
        logger.info(f"Batch processing complete: {successful}/{len(propositions)} successful")
        
        return final_results
