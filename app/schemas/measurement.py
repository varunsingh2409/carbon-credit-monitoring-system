from datetime import datetime
from typing import List

from pydantic import BaseModel, Field, field_validator, model_validator

THING_SPEAK_SPECIAL_TARGETS = {"depth_cm", "latitude", "longitude"}


class NutrientMeasurement(BaseModel):
    nutrient_name: str = Field(min_length=1, max_length=50)
    measured_value: float

    @field_validator("nutrient_name")
    @classmethod
    def normalize_nutrient_name(cls, value: str) -> str:
        nutrient_name = value.strip()
        if not nutrient_name:
            raise ValueError("nutrient_name cannot be empty")
        return nutrient_name


class MeasurementCreate(BaseModel):
    farm_id: int = Field(gt=0)
    season_id: int = Field(gt=0)
    depth_cm: float = Field(gt=0)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    sensor_id: str = Field(min_length=1, max_length=50)
    measurement_date: datetime | None = None
    nutrients: List[NutrientMeasurement] = Field(min_length=1)

    @field_validator("sensor_id")
    @classmethod
    def normalize_sensor_id(cls, value: str) -> str:
        sensor_id = value.strip()
        if not sensor_id:
            raise ValueError("sensor_id cannot be empty")
        return sensor_id

    @model_validator(mode="after")
    def validate_unique_nutrients(self) -> "MeasurementCreate":
        seen: set[str] = set()
        duplicates: set[str] = set()

        for nutrient in self.nutrients:
            key = nutrient.nutrient_name.lower()
            if key in seen:
                duplicates.add(nutrient.nutrient_name)
            seen.add(key)

        if duplicates:
            duplicate_list = ", ".join(sorted(duplicates))
            raise ValueError(f"Duplicate nutrient names are not allowed: {duplicate_list}")

        return self


class MeasurementResponse(BaseModel):
    measurement_id: int
    status: str
    message: str


class ThingSpeakFieldMapping(BaseModel):
    field_id: int = Field(ge=1, le=8)
    target: str = Field(min_length=1, max_length=50)

    @field_validator("target")
    @classmethod
    def normalize_target(cls, value: str) -> str:
        target = value.strip()
        if not target:
            raise ValueError("target cannot be empty")
        return target


class ThingSpeakIngestionRequest(BaseModel):
    farm_id: int = Field(gt=0)
    season_id: int = Field(gt=0)
    sensor_id: str = Field(min_length=1, max_length=50)
    channel_id: int | None = Field(default=None, gt=0)
    read_api_key: str | None = Field(default=None, min_length=1)
    results: int = Field(default=1, ge=1, le=100)
    default_depth_cm: float | None = Field(default=None, gt=0)
    default_latitude: float | None = Field(default=None, ge=-90, le=90)
    default_longitude: float | None = Field(default=None, ge=-180, le=180)
    skip_duplicates: bool = True
    field_mappings: List[ThingSpeakFieldMapping] = Field(min_length=1)

    @field_validator("sensor_id")
    @classmethod
    def normalize_sensor_id(cls, value: str) -> str:
        sensor_id = value.strip()
        if not sensor_id:
            raise ValueError("sensor_id cannot be empty")
        return sensor_id

    @field_validator("read_api_key")
    @classmethod
    def normalize_read_api_key(cls, value: str | None) -> str | None:
        if value is None:
            return None

        api_key = value.strip()
        if not api_key:
            raise ValueError("read_api_key cannot be empty")
        return api_key

    @model_validator(mode="after")
    def validate_field_mappings(self) -> "ThingSpeakIngestionRequest":
        field_ids: set[int] = set()
        targets: set[str] = set()
        duplicate_field_ids: set[int] = set()
        duplicate_targets: set[str] = set()
        nutrient_targets = 0
        has_depth_mapping = False

        for mapping in self.field_mappings:
            normalized_target = mapping.target.lower()

            if mapping.field_id in field_ids:
                duplicate_field_ids.add(mapping.field_id)
            field_ids.add(mapping.field_id)

            if normalized_target in targets:
                duplicate_targets.add(mapping.target)
            targets.add(normalized_target)

            if normalized_target == "depth_cm":
                has_depth_mapping = True
            elif normalized_target not in THING_SPEAK_SPECIAL_TARGETS:
                nutrient_targets += 1

        if duplicate_field_ids:
            duplicate_values = ", ".join(str(value) for value in sorted(duplicate_field_ids))
            raise ValueError(
                f"Duplicate ThingSpeak field mappings are not allowed: {duplicate_values}"
            )

        if duplicate_targets:
            duplicate_values = ", ".join(sorted(duplicate_targets))
            raise ValueError(
                f"Duplicate ThingSpeak targets are not allowed: {duplicate_values}"
            )

        if nutrient_targets == 0:
            raise ValueError("At least one ThingSpeak mapping must target a nutrient name")

        if not has_depth_mapping and self.default_depth_cm is None:
            raise ValueError(
                "A depth_cm ThingSpeak mapping or default_depth_cm value is required"
            )

        return self


class ThingSpeakSkippedEntry(BaseModel):
    entry_id: int | None = None
    reason: str


class ThingSpeakIngestionResponse(BaseModel):
    channel_id: int
    imported_count: int
    skipped_count: int
    imported_measurement_ids: list[int]
    skipped_entries: list[ThingSpeakSkippedEntry]
    message: str
