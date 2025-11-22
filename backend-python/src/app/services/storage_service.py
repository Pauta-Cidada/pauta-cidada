"""Supabase Storage Service for PDF uploads"""

from supabase import create_client, Client
import os
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class StorageService:
    """Service for uploading and managing PDFs in Supabase Storage"""
    
    def __init__(self):
        self.client: Client = create_client(
            os.getenv("SUPABASE_URL", ""),
            os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        )
        self.bucket = os.getenv("SUPABASE_BUCKET_NAME", "proposition-pdfs")
    
    async def upload_pdf(
        self, 
        file_bytes: bytes, 
        proposition_id: int,
        filename: str,
        year: Optional[int] = None
    ) -> str:
        """
        Upload PDF to Supabase Storage and return public URL.
        
        Path structure: propositions/{year}/{id_proposicao}/{filename}.pdf
        """
        try:
            # Build file path
            if year:
                file_path = f"propositions/{year}/{proposition_id}/{filename}.pdf"
            else:
                file_path = f"propositions/{proposition_id}/{filename}.pdf"
            
            # Upload file
            self.client.storage.from_(self.bucket).upload(
                path=file_path,
                file=file_bytes,
                file_options={"content-type": "application/pdf"}
            )
            
            # Get public URL
            public_url = self.get_public_url(file_path)
            
            logger.info(f"PDF uploaded successfully: {file_path}")
            return public_url
            
        except Exception as e:
            logger.error(f"Error uploading PDF: {e}")
            raise
    
    def get_public_url(self, path: str) -> str:
        """Get public URL for a file in storage"""
        url = self.client.storage.from_(self.bucket).get_public_url(path)
        return url
    
    async def delete_pdf(self, file_path: str) -> bool:
        """Delete PDF from storage"""
        try:
            self.client.storage.from_(self.bucket).remove([file_path])
            logger.info(f"PDF deleted: {file_path}")
            return True
        except Exception as e:
            logger.error(f"Error deleting PDF: {e}")
            return False
