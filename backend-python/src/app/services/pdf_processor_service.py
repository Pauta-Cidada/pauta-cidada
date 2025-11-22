"""PDF Processor Service for downloading and extracting text from PDFs"""

import httpx
import PyPDF2
import pdfplumber
from io import BytesIO
import logging
from typing import Dict

logger = logging.getLogger(__name__)


class PDFProcessorService:
    """Service for downloading and extracting text from PDF documents"""
    
    def __init__(self):
        self.timeout = httpx.Timeout(30.0, connect=10.0)
        self.max_retries = 3
    
    async def download_pdf(self, url: str) -> bytes:
        """
        Download PDF from URL with retry logic.
        
        Args:
            url: URL of the PDF document
            
        Returns:
            PDF content as bytes
            
        Raises:
            httpx.HTTPError: If download fails after retries
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            for attempt in range(self.max_retries):
                try:
                    logger.info(f"Downloading PDF from {url} (attempt {attempt + 1})")
                    response = await client.get(url, follow_redirects=True)
                    response.raise_for_status()
                    
                    # Validate content type
                    content_type = response.headers.get("content-type", "")
                    if "pdf" not in content_type.lower() and len(response.content) < 100:
                        raise ValueError(f"Invalid PDF content type: {content_type}")
                    
                    logger.info(f"PDF downloaded successfully ({len(response.content)} bytes)")
                    return response.content
                    
                except (httpx.HTTPError, ValueError) as e:
                    logger.warning(f"Download attempt {attempt + 1} failed: {e}")
                    if attempt == self.max_retries - 1:
                        raise
                    continue
    
    async def extract_text(self, pdf_bytes: bytes) -> Dict:
        """
        Extract text from PDF using pdfplumber (primary) or PyPDF2 (fallback).
        
        Args:
            pdf_bytes: PDF content as bytes
            
        Returns:
            Dict with:
                - full_text: Extracted text content
                - metadata: {pages, has_tables, word_count}
        """
        try:
            # Try pdfplumber first (better for tables)
            return await self._extract_with_pdfplumber(pdf_bytes)
        except Exception as e:
            logger.warning(f"pdfplumber extraction failed: {e}, trying PyPDF2")
            return await self._extract_with_pypdf2(pdf_bytes)
    
    async def _extract_with_pdfplumber(self, pdf_bytes: bytes) -> Dict:
        """Extract text using pdfplumber"""
        pdf_file = BytesIO(pdf_bytes)
        full_text = []
        has_tables = False
        
        with pdfplumber.open(pdf_file) as pdf:
            num_pages = len(pdf.pages)
            
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    full_text.append(text)
                
                # Check for tables
                if page.extract_tables():
                    has_tables = True
            
            combined_text = "\n\n".join(full_text)
            word_count = len(combined_text.split())
            
            logger.info(f"Extracted {word_count} words from {num_pages} pages using pdfplumber")
            
            return {
                "full_text": combined_text,
                "metadata": {
                    "pages": num_pages,
                    "has_tables": has_tables,
                    "word_count": word_count
                }
            }
    
    async def _extract_with_pypdf2(self, pdf_bytes: bytes) -> Dict:
        """Extract text using PyPDF2 as fallback"""
        pdf_file = BytesIO(pdf_bytes)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        num_pages = len(pdf_reader.pages)
        full_text = []
        
        for page in pdf_reader.pages:
            text = page.extract_text()
            if text:
                full_text.append(text)
        
        combined_text = "\n\n".join(full_text)
        word_count = len(combined_text.split())
        
        logger.info(f"Extracted {word_count} words from {num_pages} pages using PyPDF2")
        
        return {
            "full_text": combined_text,
            "metadata": {
                "pages": num_pages,
                "has_tables": False,
                "word_count": word_count
            }
        }
