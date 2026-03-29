from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser
from app.db.session import get_db
from app.models.season import Season
from app.schemas.season import SeasonRead

router = APIRouter()


@router.get("/", response_model=list[SeasonRead])
def list_seasons(_: CurrentUser, db: Session = Depends(get_db)) -> list[Season]:
    return list(db.scalars(select(Season).order_by(Season.season_id)).all())


@router.get("/{season_id}", response_model=SeasonRead)
def get_season(season_id: int, _: CurrentUser, db: Session = Depends(get_db)) -> Season:
    season = db.get(Season, season_id)
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")
    return season
