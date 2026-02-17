from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
import httpx
import uuid
from typing import Dict
import asyncio

from ..models.schemas import (
    CreateSessionRequest, 
    CreateSessionResponse,
    SpeakRequest,
    SessionResponse
)
from ..config import settings

router = APIRouter(prefix="/api/avatar", tags=["avatar"])

# In-memory session store (use Redis in production)
active_sessions: Dict[str, dict] = {}

async def make_heygen_request(endpoint: str, method: str = "POST", data: dict = None):
    """Make authenticated request to HeyGen API"""
    url = f"{settings.HEYGEN_API_URL}/{endpoint}"
    headers = {
        "X-Api-Key": settings.HEYGEN_API_KEY,
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            if method == "POST":
                response = await client.post(url, json=data, headers=headers)
            elif method == "GET":
                response = await client.get(url, headers=headers)
            elif method == "DELETE":
                response = await client.delete(url, headers=headers)
            
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, 
                              detail=f"HeyGen API error: {e.response.text}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.post("/create-session", response_model=CreateSessionResponse)
async def create_avatar_session(request: CreateSessionRequest):
    """Create a new HeyGen live avatar session"""
    
    # Use defaults if not provided
    avatar_id = request.avatar_id or settings.DEFAULT_AVATAR_ID
    voice_id = request.voice_id or settings.DEFAULT_VOICE_ID
    
    # Prepare request for HeyGen
    heygen_request = {
        "avatar_id": avatar_id,
        "quality": request.quality,
        "voice": {
            "voice_id": voice_id,
            "rate": 1.0,
            "pitch": 1.0
        }
    }
    
    # Call HeyGen API
    response = await make_heygen_request("streaming.create", data=heygen_request)
    
    if response.get("code") != 100:
        raise HTTPException(status_code=400, detail=response.get("message", "Failed to create session"))
    
    data = response.get("data", {})
    session_id = data.get("session_id")
    
    # Store session info
    active_sessions[session_id] = {
        "session_id": session_id,
        "avatar_id": avatar_id,
        "voice_id": voice_id,
        "status": "active"
    }
    
    return CreateSessionResponse(
        session_id=session_id,
        url=data.get("url"),
        streaming_url=data.get("streaming_url")
    )

@router.post("/speak")
async def make_avatar_speak(request: SpeakRequest):
    """Make the avatar speak a given text"""
    
    if request.session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Prepare request for HeyGen
    heygen_request = {
        "session_id": request.session_id,
        "text": request.text,
        "task_type": request.task_type
    }
    
    # Call HeyGen API
    response = await make_heygen_request("streaming.task", data=heygen_request)
    
    return SessionResponse(
        success=True,
        message="Speaking task initiated",
        data=response
    )

@router.post("/stop")
async def stop_session(session_id: str):
    """Stop an active avatar session"""
    
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Call HeyGen API to stop session
    response = await make_heygen_request("streaming.stop", data={"session_id": session_id})
    
    # Remove from active sessions
    del active_sessions[session_id]
    
    return SessionResponse(
        success=True,
        message="Session stopped successfully"
    )

@router.get("/sessions/{session_id}")
async def get_session_status(session_id: str):
    """Get status of a session"""
    
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return SessionResponse(
        success=True,
        message="Session active",
        data=active_sessions[session_id]
    )

@router.get("/list-avatars")
async def list_avatars():
    """List available avatars"""
    
    response = await make_heygen_request("avatars.list", method="GET")
    
    if response.get("code") != 100:
        raise HTTPException(status_code=400, detail=response.get("message"))
    
    return response.get("data", {})