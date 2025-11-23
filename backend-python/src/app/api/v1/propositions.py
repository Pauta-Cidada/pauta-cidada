from typing import Optional, List
from fastapi import APIRouter, Query, HTTPException, Depends
from app.models.proposition import Proposition
from app.services.proposition_service import PropositionService

router = APIRouter()

def get_proposition_service() -> PropositionService:
    return PropositionService()

@router.get("/propositions", response_model=List[Proposition])
async def get_propositions(
    keywords: Optional[str] = Query(None, description="Keywords to filter by"),
    uf: Optional[str] = Query(None, description="UF to filter by"),
    type: Optional[str] = Query(None, description="Proposition type to filter by"),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    perPage: int = Query(20, ge=1, description="Number of items per page"),
    service: PropositionService = Depends(get_proposition_service)
):
    try:
        return service.list_propositions(keywords=keywords, uf=uf, type=type, page=page, per_page=perPage)
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        print(f"Error executing query: {e}")
        raise HTTPException(status_code=500, detail=str(e))
