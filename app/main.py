from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.routers.admin import router as admin_router
from app.routers.auth import router as auth_router
from app.routers.farmer import router as farmer_router
from app.routers.implementation import router as implementation_router
from app.routers.measurements import router as measurements_router
from app.routers.verifier import router as verifier_router

app = FastAPI(title="Carbon Credit API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["root"])
def root() -> dict[str, str]:
    return {"message": "Carbon Credit API", "version": "1.0"}


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(api_router, prefix="/api/v1")
app.include_router(implementation_router, prefix="/api/implementation", tags=["implementation"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(farmer_router, prefix="/api/farmer", tags=["farmer"])
app.include_router(measurements_router, prefix="/api", tags=["measurements"])
app.include_router(verifier_router, prefix="/api/verifier", tags=["verifier"])
