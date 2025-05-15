# This file makes the routes directory a Python package
from fastapi import APIRouter
from app.api.routes.integrated_data import router as integrated_data_router

# Create a router that will be imported in main.py
router = APIRouter()

# Include other routers
router.include_router(integrated_data_router, prefix="/integrated", tags=["integrated"])
