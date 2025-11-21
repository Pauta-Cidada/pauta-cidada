from datetime import datetime

from fastapi import FastAPI

from app.api.v1 import user
from app.core.config import config
from app.core.logging import setup_logging
from app.db.schema import Base, engine

setup_logging()
Base.metadata.create_all(bind=engine)

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
app.include_router(user.router, prefix="/api/v1")