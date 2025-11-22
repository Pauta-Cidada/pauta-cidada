from datetime import datetime

from fastapi import FastAPI

from app.api.v1 import propositions, news
from app.core.config import config
from app.core.logging import setup_logging

setup_logging()

app = FastAPI(title=config.app_name)


# Health check route
@app.get("/")
async def health_check():
    return {
        "message": "Estou vivo, e respondendo em Python!",
        "service": config.app_name,
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }


# Register routes
app.include_router(propositions.router, prefix="/api/v1")
app.include_router(news.router, prefix="/api/v1")