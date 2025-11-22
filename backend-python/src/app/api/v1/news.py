"""News API endpoints"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID
import logging

from app.db.session import get_db
from app.services.news_orchestrator_service import NewsOrchestratorService
from app.repositories.news_repository import NewsRepository
from app.models.news_responses import (
    NewsResponse,
    NewsListResponse,
    PaginatedNewsResponse,
    PaginationMetadata,
    VoteRequest,
    ProcessingResultResponse,
    BatchProcessingResponse,
    SocialPublishCheckResponse
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/news", tags=["news"])

# Engagement threshold for social media publishing
SOCIAL_ENGAGEMENT_THRESHOLD = 100


async def get_news_repo(db: AsyncSession = Depends(get_db)) -> NewsRepository:
    """Dependency to get news repository"""
    return NewsRepository(db)


async def get_orchestrator(db: AsyncSession = Depends(get_db)) -> NewsOrchestratorService:
    """Dependency to get orchestrator service"""
    return NewsOrchestratorService(db)


# Note: More specific routes MUST come before parameterized routes
# /generate/batch must be before /generate/{proposition_id}

@router.post("/generate/batch", response_model=BatchProcessingResponse)
async def generate_news_batch(
    propositions: list[dict],
    max_concurrent: int = Query(default=3, ge=1, le=10),
    orchestrator: NewsOrchestratorService = Depends(get_orchestrator)
):
    """
    Generate news for multiple propositions in batch (sync endpoint).
    
    Args:
        propositions: List of proposition data from BigQuery
        max_concurrent: Maximum concurrent processing (1-10)
        
    Returns:
        Batch processing results
    """
    logger.info(f"Starting batch generation for {len(propositions)} propositions")
    results = await orchestrator.batch_process(propositions, max_concurrent)
    
    successful = sum(1 for r in results if r.get("success"))
    failed = len(results) - successful
    
    return BatchProcessingResponse(
        total=len(results),
        successful=successful,
        failed=failed,
        results=results
    )


@router.post("/generate/background")
async def generate_news_background(
    background_tasks: BackgroundTasks,
    propositions: list[dict],
    max_concurrent: int = Query(default=3, ge=1, le=10)
):
    """
    Generate news in background task (async, returns immediately).
    
    Args:
        propositions: List of proposition data
        max_concurrent: Maximum concurrent processing
        
    Returns:
        Acknowledgment message
    """
    logger.info(f"Queuing {len(propositions)} propositions for background processing")
    
    async def process_task():
        # Create new DB session for background task
        from app.db.session import async_session_maker
        async with async_session_maker() as session:
            orchestrator = NewsOrchestratorService(session)
            await orchestrator.batch_process(propositions, max_concurrent)
    
    background_tasks.add_task(process_task)
    
    return {
        "message": f"Background processing started for {len(propositions)} propositions",
        "status": "queued"
    }


@router.post("/generate/{proposition_id}", response_model=ProcessingResultResponse)
async def generate_news_for_proposition(
    proposition_id: int,
    proposition_data: dict,
    orchestrator: NewsOrchestratorService = Depends(get_orchestrator)
):
    """
    Generate news for a specific proposition (sync endpoint).
    
    Args:
        proposition_id: The proposition ID
        proposition_data: Full proposition data from BigQuery
        
    Returns:
        Processing result with news_id if successful
    """
    logger.info(f"Generating news for proposition {proposition_id}")
    result = await orchestrator.process_proposition(proposition_data)
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error", "Processing failed"))
    
    return result


@router.get("", response_model=PaginatedNewsResponse)
async def list_news(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    uf: Optional[str] = Query(default=None, max_length=2),
    news_type: Optional[str] = Query(default=None),
    keywords: Optional[str] = Query(default=None),
    order_by: str = Query(default="created_at"),
    order_direction: str = Query(default="desc", pattern="^(asc|desc)$"),
    news_repo: NewsRepository = Depends(get_news_repo)
):
    """
    List news with filters and pagination.
    
    Args:
        page: Page number (1-indexed)
        limit: Items per page (1-100)
        uf: Filter by UF (state)
        news_type: Filter by news type (PL, PEC, etc.)
        keywords: Search in title/summary
        order_by: Field to order by
        order_direction: asc or desc
        
    Returns:
        Paginated news list
    """
    result = await news_repo.list_all(
        page=page,
        limit=limit,
        uf=uf,
        news_type=news_type,
        keywords=keywords,
        order_by=order_by,
        order_direction=order_direction
    )
    
    # Unpack the tuple returned by list_all
    news_list, total = result
    
    pages = (total + limit - 1) // limit if total > 0 else 1
    
    pagination = PaginationMetadata(
        page=page,
        limit=limit,
        total=total,
        pages=pages,
        has_next=page < pages,
        has_prev=page > 1
    )
    
    # Convert to response models
    items = [NewsListResponse.model_validate(news) for news in news_list]
    
    return PaginatedNewsResponse(
        items=items,
        pagination=pagination
    )


@router.get("/{news_id}", response_model=NewsResponse)
async def get_news_detail(
    news_id: UUID,
    news_repo: NewsRepository = Depends(get_news_repo)
):
    """
    Get detailed information about a specific news.
    
    Args:
        news_id: UUID of the news
        
    Returns:
        Full news details
    """
    news = await news_repo.get_by_id(news_id)
    
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    
    return NewsResponse.model_validate(news)


@router.patch("/{news_id}/vote", response_model=NewsResponse)
async def vote_on_news(
    news_id: UUID,
    vote: VoteRequest,
    news_repo: NewsRepository = Depends(get_news_repo)
):
    """
    Vote on a news (upvote or downvote).
    
    Args:
        news_id: UUID of the news
        vote: Vote request with vote_type
        
    Returns:
        Updated news with new vote counts
    """
    news = await news_repo.get_by_id(news_id)
    
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    
    updated_news = await news_repo.update_votes(news_id, vote.vote_type)
    
    return NewsResponse.model_validate(updated_news)


@router.get("/top/engagement", response_model=list[NewsListResponse])
async def get_top_engagement(
    limit: int = Query(default=10, ge=1, le=50),
    news_repo: NewsRepository = Depends(get_news_repo)
):
    """
    Get top news by engagement score.
    
    Args:
        limit: Number of news to return (1-50)
        
    Returns:
        List of news ordered by engagement
    """
    news_list = await news_repo.get_top_engagement(limit)
    
    return [NewsListResponse.model_validate(news) for news in news_list]


@router.post("/{news_id}/check-social-publish", response_model=SocialPublishCheckResponse)
async def check_social_publish(
    news_id: UUID,
    news_repo: NewsRepository = Depends(get_news_repo)
):
    """
    Check if news should be published to social media based on engagement.
    If threshold met and not yet published, marks as published.
    
    Args:
        news_id: UUID of the news
        
    Returns:
        Publish decision with details
    """
    news = await news_repo.get_by_id(news_id)
    
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    
    should_publish = (
        news.engagement_score >= SOCIAL_ENGAGEMENT_THRESHOLD 
        and not news.published_to_social
    )
    
    if should_publish:
        await news_repo.mark_published_to_social(news_id)
        message = f"News marked for social publishing (engagement: {news.engagement_score})"
    elif news.published_to_social:
        message = f"Already published on {news.social_publish_date}"
    else:
        message = f"Engagement too low ({news.engagement_score}/{SOCIAL_ENGAGEMENT_THRESHOLD})"
    
    return SocialPublishCheckResponse(
        should_publish=should_publish and not news.published_to_social,
        engagement_score=news.engagement_score,
        engagement_threshold=SOCIAL_ENGAGEMENT_THRESHOLD,
        message=message
    )


@router.delete("/{news_id}")
async def delete_news(
    news_id: UUID,
    news_repo: NewsRepository = Depends(get_news_repo)
):
    """
    Delete a news (soft delete).
    
    Args:
        news_id: UUID of the news
        
    Returns:
        Success message
    """
    news = await news_repo.get_by_id(news_id)
    
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    
    await news_repo.delete(news_id)
    
    return {"message": "News deleted successfully", "id": str(news_id)}
