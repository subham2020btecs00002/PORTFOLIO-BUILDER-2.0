from fastapi import APIRouter
from app.api.v1.router import api_v1_router

root_router = APIRouter()
root_router.include_router(api_v1_router)
