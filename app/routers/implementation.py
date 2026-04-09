from mimetypes import guess_type

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.admin import AdminImplementationSummaryResponse
from app.services.implementation_service import (
    build_implementation_summary,
    get_implementation_artifact_blueprint,
    get_implementation_artifact_path,
)

router = APIRouter()


@router.get("/evidence", response_model=AdminImplementationSummaryResponse)
def get_implementation_evidence(
    db: Session = Depends(get_db),
) -> AdminImplementationSummaryResponse:
    return build_implementation_summary(db)


@router.get("/artifacts/{artifact_id}")
def get_implementation_artifact(artifact_id: str) -> FileResponse:
    artifact = get_implementation_artifact_blueprint(artifact_id)
    artifact_path = get_implementation_artifact_path(artifact_id)

    if artifact is None or artifact_path is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requested implementation artifact was not found",
        )

    media_type, _ = guess_type(artifact_path.name)
    response = FileResponse(path=artifact_path, media_type=media_type or "text/plain")
    response.headers["Content-Disposition"] = f'inline; filename="{artifact_path.name}"'
    response.headers["X-Artifact-Title"] = artifact.title
    return response
