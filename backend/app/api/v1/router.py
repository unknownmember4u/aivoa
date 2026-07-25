from fastapi import APIRouter
from app.api.v1 import auth, complaints, upload

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(complaints.router, prefix="/complaints", tags=["Complaints"])
api_router.include_router(upload.router, prefix="/upload", tags=["Document Upload"])
# api_router.include_router(assistant.router, prefix="/assistant", tags=["AI Assistant"])



