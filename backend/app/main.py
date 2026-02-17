from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from .routes import avatar
from .config import settings

app = FastAPI(
    title="HeyGen Avatar API",
    description="Backend for HeyGen Live Avatar Integration",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(avatar.router)

@app.get("/")
async def root():
    return {
        "message": "HeyGen Avatar API",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.ENV == "development"
    )