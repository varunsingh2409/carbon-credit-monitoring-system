from fastapi import APIRouter

from app.api.v1.endpoints import auth, farmers, farms, health, nutrients, seasons, sequestration, users, verification, measurements

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(farmers.router, prefix="/farmers", tags=["farmers"])
api_router.include_router(farms.router, prefix="/farms", tags=["farms"])
api_router.include_router(seasons.router, prefix="/seasons", tags=["seasons"])
api_router.include_router(nutrients.router, prefix="/nutrients", tags=["nutrients"])
api_router.include_router(measurements.router, prefix="/measurements", tags=["measurements"])
api_router.include_router(sequestration.router, prefix="/sequestration", tags=["sequestration"])
api_router.include_router(verification.router, prefix="/verification", tags=["verification"])
