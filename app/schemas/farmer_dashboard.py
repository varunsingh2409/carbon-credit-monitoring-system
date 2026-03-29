from datetime import date, datetime

from pydantic import BaseModel


class FarmerDashboardStats(BaseModel):
    totalFarms: int
    activeSeasons: int
    pendingVerifications: int
    totalCredits: float


class FarmerSeasonCarbonData(BaseModel):
    baseline_carbon: float
    current_carbon: float
    net_increase: float
    estimated_credit: float
    verification_status: str


class FarmerSeasonDashboard(BaseModel):
    season_id: int
    season_name: str
    start_date: date
    end_date: date
    crop_type: str | None = None
    status: str
    carbon_data: FarmerSeasonCarbonData | None = None


class FarmerFarmDashboard(BaseModel):
    farm_id: int
    farm_name: str
    location: str
    total_area_hectares: float
    soil_type: str | None = None
    baseline_carbon: float
    seasons: list[FarmerSeasonDashboard]


class RecentMeasurementItem(BaseModel):
    date: datetime
    farm: str
    depth: float
    organicCarbon: float | None = None
    nitrogen: float | None = None


class FarmerDashboardResponse(BaseModel):
    farmer_id: int
    stats: FarmerDashboardStats
    farms: list[FarmerFarmDashboard]
    recentMeasurements: list[RecentMeasurementItem]
