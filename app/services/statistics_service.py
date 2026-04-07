from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime
from decimal import Decimal
from itertools import combinations
from math import sqrt
from random import Random
from statistics import mean

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.carbon import CarbonSequestration
from app.models.farm import Farm
from app.models.measurement import MeasurementResult, Nutrient, SoilMeasurement
from app.models.season import Season
from app.schemas.admin import (
    AdminCertificationReportSummary,
    AdminConfidenceIntervalSummary,
    AdminDeliverableStatus,
    AdminHypothesisTestSummary,
    AdminInferentialCorrelation,
    AdminInferentialSummary,
    AdminRegressionSummary,
)
from app.services.carbon_calculator import CONVERSION_FACTOR, KILOGRAMS_PER_METRIC_TON

TARGET_NUTRIENT = "organic_carbon"
DISPLAY_NAMES = {
    "nitrogen": "Nitrogen",
    "phosphorus": "Phosphorus",
    "potassium": "Potassium",
    "moisture": "Moisture",
    "organic_carbon": "Organic Carbon",
    "ph": "pH",
}
PREDICTOR_NUTRIENTS = ("nitrogen", "phosphorus", "potassium", "moisture", "ph")
BOOTSTRAP_SAMPLES = 1200
CONFIDENCE_LEVEL = 0.95


@dataclass
class _MeasurementObservation:
    measurement_id: int
    measurement_date: datetime
    season_id: int
    season_name: str
    start_date: date
    farm_name: str
    baseline_carbon: float
    area_hectares: float
    estimated_carbon_credit: float | None
    nutrients: dict[str, float] = field(default_factory=dict)


@dataclass
class _SeasonCarbonSeries:
    season_id: int
    season_name: str
    start_date: date
    farm_name: str
    baseline_carbon: float
    area_hectares: float
    estimated_carbon_credit: float | None
    organic_carbon_values: list[float] = field(default_factory=list)


def _normalize_nutrient_name(name: str) -> str:
    return name.strip().lower().replace(" ", "_")


def _display_name(name: str) -> str:
    return DISPLAY_NAMES.get(name, name.replace("_", " ").title())


def _to_float(value: Decimal | float | int | None) -> float | None:
    if value is None:
        return None
    return float(value)


def _pearson(xs: list[float], ys: list[float]) -> float | None:
    if len(xs) != len(ys) or len(xs) < 2:
        return None

    mean_x = mean(xs)
    mean_y = mean(ys)
    numerator = sum((x - mean_x) * (y - mean_y) for x, y in zip(xs, ys, strict=False))
    denominator = sqrt(
        sum((x - mean_x) ** 2 for x in xs) * sum((y - mean_y) ** 2 for y in ys)
    )
    if denominator == 0:
        return None
    return numerator / denominator


def _regression(xs: list[float], ys: list[float]) -> tuple[float, float, float] | None:
    if len(xs) != len(ys) or len(xs) < 2:
        return None

    mean_x = mean(xs)
    mean_y = mean(ys)
    denominator = sum((x - mean_x) ** 2 for x in xs)
    if denominator == 0:
        return None

    numerator = sum((x - mean_x) * (y - mean_y) for x, y in zip(xs, ys, strict=False))
    slope = numerator / denominator
    intercept = mean_y - slope * mean_x
    correlation = _pearson(xs, ys)
    r_squared = (correlation or 0.0) ** 2
    return intercept, slope, r_squared


def _correlation_interpretation(coefficient: float) -> tuple[str, str]:
    strength = abs(coefficient)
    if coefficient > 0:
        direction = "positive"
    elif coefficient < 0:
        direction = "negative"
    else:
        direction = "neutral"

    if strength >= 0.7:
        descriptor = "strong"
    elif strength >= 0.4:
        descriptor = "moderate"
    elif strength >= 0.2:
        descriptor = "weak"
    else:
        descriptor = "very weak"

    return direction, f"{descriptor.title()} {direction} association with organic carbon."


def _permutation_p_value(group_a: list[float], group_b: list[float]) -> float | None:
    if len(group_a) < 2 or len(group_b) < 2:
        return None

    all_values = group_a + group_b
    size_a = len(group_a)
    observed = abs(mean(group_a) - mean(group_b))
    indices = range(len(all_values))
    total = 0
    extreme = 0

    for chosen in combinations(indices, size_a):
        chosen_set = set(chosen)
        candidate_a = [all_values[index] for index in chosen]
        candidate_b = [all_values[index] for index in indices if index not in chosen_set]
        difference = abs(mean(candidate_a) - mean(candidate_b))
        total += 1
        if difference >= observed - 1e-12:
            extreme += 1

    if total == 0:
        return None

    return extreme / total


def _credit_estimate(current_carbon_mean: float, baseline_carbon: float, area_hectares: float) -> float:
    net_increase = max(current_carbon_mean - baseline_carbon, 0.0)
    estimate = (
        net_increase
        * area_hectares
        * float(CONVERSION_FACTOR)
        / float(KILOGRAMS_PER_METRIC_TON)
    )
    return round(estimate, 2)


def _bootstrap_credit_interval(
    series: _SeasonCarbonSeries,
    confidence_level: float = CONFIDENCE_LEVEL,
) -> AdminConfidenceIntervalSummary | None:
    if len(series.organic_carbon_values) < 3:
        return None

    rng = Random(42)
    samples: list[float] = []
    values = series.organic_carbon_values
    for _ in range(BOOTSTRAP_SAMPLES):
        sample_mean = mean(rng.choice(values) for _ in range(len(values)))
        samples.append(
            _credit_estimate(sample_mean, series.baseline_carbon, series.area_hectares)
        )

    samples.sort()
    lower_index = int(((1 - confidence_level) / 2) * (len(samples) - 1))
    upper_index = int((confidence_level + (1 - confidence_level) / 2) * (len(samples) - 1))
    point_estimate = (
        series.estimated_carbon_credit
        if series.estimated_carbon_credit is not None
        else _credit_estimate(mean(values), series.baseline_carbon, series.area_hectares)
    )

    return AdminConfidenceIntervalSummary(
        metric=f"Estimated credit for {series.season_name}",
        confidence_level=confidence_level,
        estimate=round(point_estimate, 2),
        lower_bound=round(samples[lower_index], 2),
        upper_bound=round(samples[upper_index], 2),
        interpretation=(
            "Bootstrap interval based on the season's organic-carbon measurements and the "
            "same sequestration formula used by the platform."
        ),
    )


def _load_observations(db: Session) -> list[_MeasurementObservation]:
    rows = db.execute(
        select(
            SoilMeasurement.measurement_id,
            SoilMeasurement.measurement_date,
            SoilMeasurement.season_id,
            Season.season_name,
            Season.start_date,
            Farm.farm_name,
            Farm.baseline_carbon,
            Farm.total_area_hectares,
            CarbonSequestration.estimated_carbon_credit,
            Nutrient.nutrient_name,
            MeasurementResult.measured_value,
        )
        .join(
            MeasurementResult,
            MeasurementResult.measurement_id == SoilMeasurement.measurement_id,
        )
        .join(Nutrient, Nutrient.nutrient_id == MeasurementResult.nutrient_id)
        .join(Season, Season.season_id == SoilMeasurement.season_id)
        .join(Farm, Farm.farm_id == SoilMeasurement.farm_id)
        .outerjoin(
            CarbonSequestration,
            CarbonSequestration.season_id == SoilMeasurement.season_id,
        )
        .order_by(Season.start_date.asc(), SoilMeasurement.measurement_date.asc())
    ).all()

    by_measurement: dict[int, _MeasurementObservation] = {}
    for row in rows:
        observation = by_measurement.setdefault(
            row.measurement_id,
            _MeasurementObservation(
                measurement_id=row.measurement_id,
                measurement_date=row.measurement_date,
                season_id=row.season_id,
                season_name=row.season_name,
                start_date=row.start_date,
                farm_name=row.farm_name,
                baseline_carbon=float(row.baseline_carbon),
                area_hectares=float(row.total_area_hectares),
                estimated_carbon_credit=_to_float(row.estimated_carbon_credit),
            ),
        )
        observation.nutrients[_normalize_nutrient_name(row.nutrient_name)] = float(
            row.measured_value
        )

    return [
        observation
        for observation in by_measurement.values()
        if TARGET_NUTRIENT in observation.nutrients
    ]


def build_inferential_summary(db: Session) -> AdminInferentialSummary:
    observations = _load_observations(db)
    limitations: list[str] = []

    if not observations:
        return AdminInferentialSummary(
            dataset_rows=0,
            season_count=0,
            correlations=[],
            regression=None,
            hypothesis_test=None,
            confidence_interval=None,
            limitations=[
                "No organic-carbon measurements are available yet for inferential analysis."
            ],
        )

    correlations: list[AdminInferentialCorrelation] = []
    best_regression: AdminRegressionSummary | None = None
    best_abs_correlation = -1.0

    for nutrient_name in PREDICTOR_NUTRIENTS:
        paired = [
            (observation.nutrients[nutrient_name], observation.nutrients[TARGET_NUTRIENT])
            for observation in observations
            if nutrient_name in observation.nutrients
        ]
        if len(paired) < 2:
            continue

        predictor_values = [predictor for predictor, _ in paired]
        response_values = [response for _, response in paired]
        coefficient = _pearson(predictor_values, response_values)
        if coefficient is None:
            continue

        direction, interpretation = _correlation_interpretation(coefficient)
        correlations.append(
            AdminInferentialCorrelation(
                nutrient_name=_display_name(nutrient_name),
                sample_size=len(paired),
                coefficient=round(coefficient, 4),
                direction=direction,
                interpretation=interpretation,
            )
        )

        regression_values = _regression(predictor_values, response_values)
        if regression_values and abs(coefficient) > best_abs_correlation:
            intercept, slope, r_squared = regression_values
            best_abs_correlation = abs(coefficient)
            best_regression = AdminRegressionSummary(
                predictor=_display_name(nutrient_name),
                response="Organic Carbon",
                sample_size=len(paired),
                intercept=round(intercept, 4),
                slope=round(slope, 4),
                r_squared=round(r_squared, 4),
                interpretation=(
                    f"Each one-unit increase in {_display_name(nutrient_name)} is associated "
                    f"with a {round(slope, 4)} unit change in organic carbon in this dataset."
                ),
            )

    correlations.sort(key=lambda item: abs(item.coefficient), reverse=True)

    season_series: dict[int, _SeasonCarbonSeries] = {}
    for observation in observations:
        series = season_series.setdefault(
            observation.season_id,
            _SeasonCarbonSeries(
                season_id=observation.season_id,
                season_name=observation.season_name,
                start_date=observation.start_date,
                farm_name=observation.farm_name,
                baseline_carbon=observation.baseline_carbon,
                area_hectares=observation.area_hectares,
                estimated_carbon_credit=observation.estimated_carbon_credit,
            ),
        )
        series.organic_carbon_values.append(observation.nutrients[TARGET_NUTRIENT])

    sorted_series = sorted(
        season_series.values(),
        key=lambda item: (item.start_date, item.season_id),
    )

    hypothesis_test: AdminHypothesisTestSummary | None = None
    confidence_interval: AdminConfidenceIntervalSummary | None = None

    if len(sorted_series) >= 2:
        baseline_series = sorted_series[0]
        comparison_series = sorted_series[-1]
        p_value = _permutation_p_value(
            baseline_series.organic_carbon_values,
            comparison_series.organic_carbon_values,
        )
        if p_value is not None:
            baseline_mean = mean(baseline_series.organic_carbon_values)
            comparison_mean = mean(comparison_series.organic_carbon_values)
            significance = "statistically significant" if p_value <= 0.05 else "not statistically significant"
            hypothesis_test = AdminHypothesisTestSummary(
                test_name="Exact permutation test on seasonal organic-carbon means",
                null_hypothesis=(
                    "There is no difference in mean organic carbon between the baseline and comparison season."
                ),
                alternative_hypothesis=(
                    "The comparison season has a different mean organic carbon than the baseline season."
                ),
                baseline_label=baseline_series.season_name,
                comparison_label=comparison_series.season_name,
                baseline_mean=round(baseline_mean, 4),
                comparison_mean=round(comparison_mean, 4),
                p_value=round(p_value, 4),
                conclusion=(
                    f"The comparison season mean is {round(comparison_mean - baseline_mean, 4)} "
                    f"units above the baseline mean, and the result is {significance} at the 5% level."
                ),
            )
            if p_value > 0.05:
                limitations.append(
                    "The current sample is still small, so the seasonal difference does not cross the 5% significance threshold."
                )

        confidence_interval = _bootstrap_credit_interval(comparison_series)
    else:
        limitations.append(
            "At least two seasons with organic-carbon measurements are needed for the seasonal hypothesis test."
        )

    if len(observations) < 10:
        limitations.append(
            "This is still an academic demo-sized dataset; confidence improves as more long-term measurements arrive."
        )

    return AdminInferentialSummary(
        dataset_rows=len(observations),
        season_count=len(sorted_series),
        correlations=correlations[:3],
        regression=best_regression,
        hypothesis_test=hypothesis_test,
        confidence_interval=confidence_interval,
        limitations=limitations,
    )


def build_certification_report(
    summary: AdminInferentialSummary,
) -> AdminCertificationReportSummary:
    top_correlation = summary.correlations[0] if summary.correlations else None
    regression = summary.regression
    hypothesis = summary.hypothesis_test
    confidence_interval = summary.confidence_interval

    lower_bound_positive = (
        confidence_interval is not None and confidence_interval.lower_bound > 0
    )
    statistically_supported = hypothesis is not None and hypothesis.p_value <= 0.1

    readiness = (
        "Ready for verifier review"
        if lower_bound_positive
        else "Provisional analytical report"
    )

    key_findings = [
        f"{summary.dataset_rows} measurement events across {summary.season_count} seasons are included in the inferential layer.",
    ]

    if top_correlation is not None:
        key_findings.append(
            f"{top_correlation.nutrient_name} shows a {top_correlation.direction} correlation of {top_correlation.coefficient} with organic carbon."
        )
    if regression is not None:
        key_findings.append(
            f"The strongest single-variable regression explains {round(regression.r_squared * 100, 2)}% of the observed organic-carbon variance."
        )
    if hypothesis is not None:
        key_findings.append(
            f"The seasonal hypothesis test produced p = {hypothesis.p_value}, with mean organic carbon rising from {hypothesis.baseline_mean} to {hypothesis.comparison_mean}."
        )
    if confidence_interval is not None:
        key_findings.append(
            f"The {int(confidence_interval.confidence_level * 100)}% bootstrap interval for the credit estimate is {confidence_interval.lower_bound} to {confidence_interval.upper_bound}."
        )

    summary_text = (
        "The platform combines secure CNDC ingestion, relational auditability, inferential "
        "statistics, and a verifier-facing workflow to support carbon-credit reporting. "
        "Current analytical confidence is strong enough for reviewer inspection"
        if statistically_supported or lower_bound_positive
        else "The platform combines secure CNDC ingestion, relational auditability, "
        "and inferential statistics, but more field observations will improve the "
        "statistical confidence of the certification narrative."
    )

    return AdminCertificationReportSummary(
        title="Carbon Credit Readiness Report",
        readiness=readiness,
        summary=summary_text,
        report_sections=[
            "Secure sensor-network and CNDC authenticity design",
            "DBMS audit trail and certification-ready schema",
            "Inferential statistics on nutrients and organic carbon",
            "Carbon credit estimate with confidence interval",
            "Verifier decision and certification note",
        ],
        key_findings=key_findings,
    )


def build_deliverable_statuses() -> list[AdminDeliverableStatus]:
    return [
        AdminDeliverableStatus(
            title="Secure sensor-network and data transmission design",
            status="Implemented",
            evidence="ThingSpeak ingestion, authenticated REST import, and visible CNDC transport/security flow are built into the app.",
        ),
        AdminDeliverableStatus(
            title="CNDC security and data authenticity note",
            status="Implemented",
            evidence="JWT-protected routes, ThingSpeak channel authorization, and auditable network steps are documented and surfaced in the interface.",
        ),
        AdminDeliverableStatus(
            title="ER diagram for soil, land, carbon, and certification data",
            status="Implemented",
            evidence="The relational design is documented as a faculty-facing ER deliverable and mirrored by the live PostgreSQL schema.",
        ),
        AdminDeliverableStatus(
            title="SQL database with long-term data handling",
            status="Implemented",
            evidence="Normalized PostgreSQL tables, constraints, indexes, and season-linked measurement history support long-term storage and traceability.",
        ),
        AdminDeliverableStatus(
            title="R analysis correlating nutrients and carbon sequestration",
            status="Implemented",
            evidence="A deliverable-ready R script and dataset snapshot accompany the live inferential-statistics section in the app.",
        ),
        AdminDeliverableStatus(
            title="Carbon credit-ready analytical report",
            status="Implemented",
            evidence="The platform includes an integrated certification-readiness summary and a faculty-facing analytical report artifact.",
        ),
    ]
