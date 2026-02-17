from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class CreateSessionRequest(BaseModel):
    avatar_id: Optional[str] = None
    voice_id: Optional[str] = None
    quality: str = "high"
    
class CreateSessionResponse(BaseModel):
    session_id: str
    url: str
    streaming_url: str
    
class SpeakRequest(BaseModel):
    session_id: str
    text: str
    task_type: str = "talk"  # talk, pause, stop
    
class SessionResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    
class AvatarListResponse(BaseModel):
    avatars: list
    total: int