from fastapi import APIRouter

router = APIRouter(prefix="/acessibilidade", tags=["acessibilidade"])


@router.get("/health")
def health_check():
    return {"status": "ok"}
