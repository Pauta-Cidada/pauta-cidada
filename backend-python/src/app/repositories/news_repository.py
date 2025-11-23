"""News repository for database operations"""

from sqlalchemy import select, delete, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.news import News
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class NewsRepository:
    """Repository for News CRUD operations"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create(self, news_data: dict) -> News:
        """Create a new news article"""
        news = News(**news_data)
        self.session.add(news)
        await self.session.commit()
        await self.session.refresh(news)
        return news
    
    async def get_by_id(self, news_id: UUID) -> Optional[News]:
        """Get news by ID"""
        result = await self.session.execute(
            select(News).where(News.id == news_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_proposition_id(self, proposition_id: int) -> Optional[News]:
        """Get news by proposition ID (to avoid duplicates)"""
        result = await self.session.execute(
            select(News).where(News.proposition_id == proposition_id)
        )
        return result.scalar_one_or_none()
    
    async def list_all(
        self,
        page: int = 1,
        limit: int = 20,
        uf: Optional[str] = None,
        news_type: Optional[str] = None,
        keywords: Optional[str] = None,
        order_by: str = "created_at",
        order_direction: str = "desc"
    ) -> tuple[List[News], int]:
        """List news with filters and pagination"""
        
        query = select(News)
        
        # Apply filters
        if uf:
            query = query.where(News.uf_author == uf)
        
        if news_type:
            query = query.where(News.news_type == news_type)
        
        if keywords:
            search_pattern = f"%{keywords}%"
            query = query.where(
                or_(
                    News.title.ilike(search_pattern),
                    News.summary.ilike(search_pattern)
                )
            )
        
        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.session.execute(count_query)
        total = total_result.scalar()
        
        # Ordering
        order_column = getattr(News, order_by, News.created_at)
        if order_direction == "desc":
            query = query.order_by(order_column.desc())
        else:
            query = query.order_by(order_column.asc())
        
        # Pagination
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)
        
        result = await self.session.execute(query)
        items = result.scalars().all()
        
        return list(items), total
    
    async def update_votes(
        self,
        news_id: UUID,
        vote_type: str
    ) -> Optional[News]:
        """Update votes and recalculate engagement score"""
        news = await self.get_by_id(news_id)
        if not news:
            return None
        
        if vote_type == "upvote":
            news.upvotes += 1
        elif vote_type == "downvote":
            news.downvotes += 1
        
        news.engagement_score = news.upvotes - news.downvotes
        news.updated_at = datetime.utcnow()
        
        await self.session.commit()
        await self.session.refresh(news)
        return news
    
    async def mark_published_to_social(self, news_id: UUID) -> Optional[News]:
        """Mark news as published to social media"""
        news = await self.get_by_id(news_id)
        if not news:
            return None
        
        news.published_to_social = True
        news.social_publish_date = datetime.utcnow()
        news.updated_at = datetime.utcnow()
        
        await self.session.commit()
        await self.session.refresh(news)
        return news
    
    async def get_top_engagement(self, limit: int = 10) -> List[News]:
        """Get top news by engagement score"""
        result = await self.session.execute(
            select(News)
            .order_by(News.engagement_score.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def delete(self, news_id: UUID) -> bool:
        """Delete news article"""
        result = await self.session.execute(
            delete(News).where(News.id == news_id)
        )
        await self.session.commit()
        return result.rowcount > 0
