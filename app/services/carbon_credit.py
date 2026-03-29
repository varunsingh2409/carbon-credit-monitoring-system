from decimal import Decimal, ROUND_HALF_UP

CONVERSION_FACTOR = Decimal("3.67")
KILOGRAMS_PER_METRIC_TON = Decimal("1000")
DECIMAL_PRECISION = Decimal("0.01")


def calculate_net_carbon_increase(
    baseline_carbon: Decimal,
    current_carbon: Decimal,
) -> Decimal:
    return current_carbon - baseline_carbon


def estimate_carbon_credit(
    net_carbon_increase: Decimal,
    farm_area_hectares: Decimal,
    conversion_factor: Decimal = CONVERSION_FACTOR,
) -> Decimal:
    if net_carbon_increase <= Decimal("0"):
        return Decimal("0.00")

    return (
        (net_carbon_increase * farm_area_hectares * conversion_factor)
        / KILOGRAMS_PER_METRIC_TON
    ).quantize(DECIMAL_PRECISION, rounding=ROUND_HALF_UP)
