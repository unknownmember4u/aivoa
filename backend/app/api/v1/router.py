from fastapi import APIRouter
from app.api.v1 import auth, complaints, upload, extraction, complaint_review, chat

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(extraction.router, prefix="/complaints", tags=["Complaint AI Extraction"])
api_router.include_router(complaint_review.router, prefix="/complaints", tags=["Complaint Review & Submission"])
api_router.include_router(chat.router, prefix="/complaints", tags=["Complaint AI Assistant"])
api_router.include_router(complaints.router, prefix="/complaints", tags=["Complaints"])
api_router.include_router(upload.router, prefix="/upload", tags=["Document Upload"])





