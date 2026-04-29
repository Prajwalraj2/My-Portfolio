from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from src.config import settings
from src.api.routes import health, chat


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"🚀 AI Service starting on port {settings.port}")
    print(f"📦 Environment: {settings.environment}")
    print(f"🤖 Model: {settings.openai_model}")
    yield
    print("👋 AI Service shutting down")


app = FastAPI(
    title="Portfolio AI Service",
    description="AI-powered chat service for Prajwal's portfolio",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=settings.environment == "development",
    )
