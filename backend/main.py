from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from config import settings
from services import openrouter, search, auth, storage
from database import get_db, engine, Base
from models import User, ChatMessage, UserPreferences

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fimum AI Backend",
    description="Backend API for Fimum - Your Personal AI Assistant",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://fimum.ai"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class MessageRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    image_url: Optional[str] = None

class MessageResponse(BaseModel):
    response: str
    conversation_id: str
    model_used: str
    timestamp: datetime

class UserPreferencesRequest(BaseModel):
    tone: Optional[str] = None
    language_preference: Optional[str] = None
    goals: Optional[str] = None

class ChatHistoryResponse(BaseModel):
    id: str
    title: str
    timestamp: datetime

# Authentication endpoints
@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = auth.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/signup")
async def signup(email: str = Form(...), password: str = Form(...)):
    try:
        user = auth.create_user(email, password)
        access_token = auth.create_access_token(
            data={"sub": user.email}, expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

# Chat endpoints
@app.post("/chat", response_model=MessageResponse)
async def chat(
    request: MessageRequest,
    # current_user: User = Depends(auth.get_current_user),
    # db: Session = Depends(get_db)
):
    """
    Main chat endpoint that processes user messages and returns AI responses
    """
    # Mock user and preferences for demonstration
    current_user = User(id=1, email="demo@example.com", name="Demo User")
    user_preferences = {
        "tone": "professional",
        "language_preference": "en",
        "goals": "Learn AI development"
    }
    
    # Mock conversation history
    chat_history = [
        {"query": "Hello", "response": "Hi there! I'm Fimum, your personal AI assistant."},
        {"query": "What can you do?", "response": "I can help with a wide range of tasks including answering questions, coding, analysis, and more!"}
    ]
    
    # Process the query
    try:
        # For web research tasks, perform search first
        needs_research = any(keyword in request.message.lower() for keyword in ["latest", "recent", "news", "search", "find"])
        search_results = []
        
        if needs_research:
            search_results = search.perform_web_search(request.message)
            search_context = search.format_search_results_for_prompt(search_results)
            # Prepend search context to the message
            full_message = f"{search_context}\n\nUser query: {request.message}"
        else:
            full_message = request.message
        
        # Get AI response
        ai_response = openrouter.process_query(
            full_message,
            chat_history,
            user_preferences,
            request.image_url
        )
        
        # In a real implementation, you would save to database here
        # For demonstration, we'll just return the response
        
        return MessageResponse(
            response=ai_response.get("response", "No response generated"),
            conversation_id=request.conversation_id or str(uuid.uuid4()),
            model_used=ai_response.get("model_used", "unknown"),
            timestamp=datetime.utcnow()
        )
        
    except Exception as e:
        print(f"Error processing query: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing your request"
        )

# File upload endpoint
@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    # current_user: User = Depends(auth.get_current_user)
):
    """
    Handle file uploads (images/documents)
    """
    try:
        # Save to Supabase storage
        file_url = await storage.upload_file(file, 1)  # Mock user ID
        
        return {
            "filename": file.filename,
            "url": file_url,
            "content_type": file.content_type,
            "size": file.size
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"File upload failed: {str(e)}"
        )

# User preferences endpoint
@app.get("/preferences")
async def get_preferences():
    # Mock preferences for demonstration
    return {
        "tone": "professional",
        "language_preference": "en",
        "goals": "Learn AI development"
    }

@app.post("/preferences")
async def update_preferences(
    preferences: UserPreferencesRequest,
):
    # In a real implementation, you would update the database
    return {"status": "success"}

# Chat history endpoints
@app.get("/history")
async def get_history():
    """Get all conversation histories for the user"""
    # Mock history for demonstration
    return [
        ChatHistoryResponse(
            id="conv_1",
            title="Getting started with AI",
            timestamp=datetime(2024, 5, 10)
        ),
        ChatHistoryResponse(
            id="conv_2",
            title="Analyze this image",
            timestamp=datetime(2024, 5, 9)
        ),
        ChatHistoryResponse(
            id="conv_3",
            title="Build a simple app",
            timestamp=datetime(2024, 5, 8)
        )
    ]

@app.get("/history/{conversation_id}")
async def get_conversation(
    conversation_id: str,
):
    """Get a specific conversation history"""
    # Mock conversation for demonstration
    return [
        {
            "id": "1",
            "query": "Hello Fimum!",
            "response": "Hi there! I'm Fimum, your personal AI assistant created by STN-AI. How can I help you today? 😊",
            "timestamp": datetime(2024, 5, 10, 10, 30)
        },
        {
            "id": "2",
            "query": "What can you do?",
            "response": "I can help with a wide range of tasks including answering questions, coding, analysis, and more! Just let me know what you need.",
            "timestamp": datetime(2024, 5, 10, 10, 32)
        }
    ]

@app.delete("/history/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
):
    """Delete a specific conversation"""
    # In a real implementation, you would delete from the database
    return {"status": "success"}

@app.delete("/history/{conversation_id}/message/{message_id}")
async def delete_single_message(
    conversation_id: str,
    message_id: int,
):
    """Delete a single message from a conversation"""
    # In a real implementation, you would delete from the database
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)