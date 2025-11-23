"""Pydantic models for News API responses"""

from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional
from uuid import UUID


class NewsMetadata(BaseModel):
    """Metadata structure embedded in news"""
    tags: list[str] = []
    impact_level: str = ""
    target_audience: list[str] = []
    pdf_pages: int = 0
    word_count: int = 0
    has_tables: bool = False


class NewsListResponse(BaseModel):
    """Simplified news model for list views"""
    id: UUID
    title: str
    summary: str
    proposition_number: str
    proposition_id: int
    presentation_date: date
    uf_author: Optional[str] = None
    author_name: Optional[str] = None
    party: Optional[str] = None
    author_type: Optional[str] = None
    news_type: str
    upvotes: int = 0
    downvotes: int = 0
    engagement_score: int = 0
    published_to_social: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True


class NewsResponse(BaseModel):
    """Full news model with all details"""
    id: UUID
    title: str
    summary: str
    full_content: str
    proposition_number: str
    proposition_id: int
    presentation_date: date
    uf_author: Optional[str] = None
    author_name: Optional[str] = None
    party: Optional[str] = None
    author_type: Optional[str] = None
    news_type: str
    original_ementa: str
    pdf_storage_url: str
    original_pdf_url: str
    upvotes: int = 0
    downvotes: int = 0
    engagement_score: int = 0
    published_to_social: bool = False
    social_publish_date: Optional[datetime] = None
    extra_metadata: NewsMetadata
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PaginationMetadata(BaseModel):
    """Pagination information"""
    page: int
    limit: int
    total: int
    pages: int
    has_next: bool
    has_prev: bool


class PaginatedNewsResponse(BaseModel):
    """Paginated list of news with metadata"""
    items: list[NewsListResponse]
    pagination: PaginationMetadata


class VoteRequest(BaseModel):
    """Request model for voting"""
    vote_type: str = Field(..., pattern="^(upvote|downvote)$")


class ProcessingResultResponse(BaseModel):
    """Result of news generation processing"""
    success: bool
    news_id: Optional[str] = None
    proposition_id: Optional[int] = None
    title: Optional[str] = None
    message: Optional[str] = None
    error: Optional[str] = None


class BatchProcessingResponse(BaseModel):
    """Result of batch news generation"""
    total: int
    successful: int
    failed: int
    results: list[ProcessingResultResponse]


class SocialPublishCheckResponse(BaseModel):
    """Response for social media publish check"""
    should_publish: bool
    engagement_score: int
    engagement_threshold: int
    message: str
