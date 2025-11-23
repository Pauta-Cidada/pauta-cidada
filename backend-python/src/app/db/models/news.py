"""News SQLAlchemy model for storing AI-generated news articles from propositions"""

from sqlalchemy import Column, String, Text, Integer, Date, Boolean, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.db.schema import Base


class News(Base):
    """
    Model for news articles generated from legislative propositions.
    Stores AI-generated content, engagement metrics, and metadata.
    """
    __tablename__ = "news"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # AI-generated content
    title = Column(String(500), nullable=False, index=True)
    summary = Column(Text, nullable=False)  # 100-150 words
    full_content = Column(Text, nullable=False)  # 500-800 words
    
    # Original proposition data
    proposition_number = Column(String(20), nullable=False, index=True)  # e.g., "PL 1234/2025"
    proposition_id = Column(Integer, nullable=False, unique=True, index=True)  # from BigQuery
    presentation_date = Column(Date, nullable=False)
    
    # Proposition author
    uf_author = Column(String(2), nullable=True, index=True)
    author_name = Column(String(100), nullable=True)
    party = Column(String(50), nullable=True)
    author_type = Column(String(50), nullable=True)
    
    # Classification
    news_type = Column(String(10), nullable=False, index=True)  # PL, PEC, EMP, etc
    original_ementa = Column(Text, nullable=False)
    
    # PDF storage
    pdf_storage_url = Column(String(500), nullable=False)  # Supabase Storage URL
    original_pdf_url = Column(String(500), nullable=False)  # url_teor_proposicao (backup)
    
    # Engagement and voting
    upvotes = Column(Integer, default=0, nullable=False)
    downvotes = Column(Integer, default=0, nullable=False)
    engagement_score = Column(Integer, default=0, nullable=False, index=True)
    
    # Social media publication
    published_to_social = Column(Boolean, default=False, nullable=False)
    social_publish_date = Column(DateTime, nullable=True)
    
    # Additional metadata (tags, categories, AI metrics) - renamed from 'metadata' (reserved word)
    extra_metadata = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<News(id={self.id}, title='{self.title[:50]}...', proposition_id={self.proposition_id})>"
