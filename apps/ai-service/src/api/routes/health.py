from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

# Health check endpoint
@router.get("/health")
async def health_check():
    """Liveness probe - is the service running?"""
    return {
        "status": "healthy",
        "service": "ai-service",
        "timestamp": datetime.utcnow().isoformat(),
    }


# Readiness check endpoint
@router.get("/ready")
async def readiness_check():
    """Readiness probe - is the service ready to accept requests?"""
    return {
        "status": "ready",
        "service": "ai-service",
        "timestamp": datetime.utcnow().isoformat(),
    }
