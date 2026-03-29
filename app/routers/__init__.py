from app.routers.admin import router as admin_router
from app.routers.auth import router as auth_router
from app.routers.farmer import router as farmer_router
from app.routers.measurements import router as measurements_router
from app.routers.verifier import router as verifier_router

__all__ = [
    "admin_router",
    "auth_router",
    "measurements_router",
    "farmer_router",
    "verifier_router",
]
