import csv
import io
import os
import random
from typing import Any

import requests

WRITE_API_KEY = os.getenv("THINGSPEAK_WRITE_API_KEY", "N14MWJ8WKO8E1URT")
THINGSPEAK_UPDATE_URL = "https://api.thingspeak.com/update"
GITHUB_RAW_URL = os.getenv(
    "THINGSPEAK_GITHUB_RAW_URL",
    "https://raw.githubusercontent.com/Eggyak/dataset/refs/heads/main/soil_health_data.csv",
)
REQUEST_TIMEOUT_SECONDS = 15


def _get_numeric_value(row: dict[str, Any], *keys: str, required: bool = True) -> str | None:
    for key in keys:
        if key in row and str(row[key]).strip():
            return str(row[key]).strip()

    if required:
        raise ValueError(f"Missing required column. Expected one of: {', '.join(keys)}")
    return None


def send_to_thingspeak(
    nitrogen: str,
    phosphorus: str,
    potassium: str,
    moisture: str,
    organic_carbon: str | None,
    depth_cm: str | None,
) -> None:
    payload = {
        "api_key": WRITE_API_KEY,
        "field1": nitrogen,
        "field2": phosphorus,
        "field3": potassium,
        "field4": moisture,
    }

    if organic_carbon is not None:
        payload["field5"] = organic_carbon
    if depth_cm is not None:
        payload["field6"] = depth_cm

    response = requests.post(
        THINGSPEAK_UPDATE_URL,
        data=payload,
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()

    if response.text.strip() == "0":
        raise RuntimeError(
            "ThingSpeak did not accept the update. Check rate limits and write API key."
        )

    print("Data sent to ThingSpeak successfully.")


def send_from_github() -> None:
    response = requests.get(GITHUB_RAW_URL, timeout=REQUEST_TIMEOUT_SECONDS)
    response.raise_for_status()

    csvfile = io.StringIO(response.text)
    reader = list(csv.DictReader(csvfile))
    if not reader:
        raise RuntimeError("GitHub CSV did not contain any data rows")

    chosen_row = random.choice(reader)
    print("Selected CSV row:", chosen_row)

    nitrogen = _get_numeric_value(chosen_row, "Nitrogen", "nitrogen")
    phosphorus = _get_numeric_value(chosen_row, "Phosphorus", "phosphorus")
    potassium = _get_numeric_value(chosen_row, "Potassium", "potassium")
    moisture = _get_numeric_value(chosen_row, "Moisture", "moisture")
    organic_carbon = _get_numeric_value(
        chosen_row,
        "Organic_Carbon",
        "organic_carbon",
        "OrganicCarbon",
        required=False,
    )
    depth_cm = _get_numeric_value(
        chosen_row,
        "Depth_cm",
        "depth_cm",
        "Depth",
        required=False,
    )

    if organic_carbon is None:
        print(
            "CSV does not include Organic_Carbon. Field 5 will be skipped, so carbon calculation will not run from this row alone."
        )
    if depth_cm is None:
        print("CSV does not include Depth. Field 6 will be skipped.")

    send_to_thingspeak(nitrogen, phosphorus, potassium, moisture, organic_carbon, depth_cm)


def send_manual() -> None:
    nitrogen = input("Enter Nitrogen (ppm): ").strip()
    phosphorus = input("Enter Phosphorus (ppm): ").strip()
    potassium = input("Enter Potassium (ppm): ").strip()
    moisture = input("Enter Moisture (%): ").strip()
    organic_carbon = input(
        "Enter Organic Carbon (kg/ha) or leave blank if unavailable: "
    ).strip() or None
    depth_cm = input("Enter Depth (cm) or leave blank if unavailable: ").strip() or None

    send_to_thingspeak(nitrogen, phosphorus, potassium, moisture, organic_carbon, depth_cm)


def main() -> None:
    while True:
        print("\nChoose data input method:")
        print("1. Send random data from GitHub CSV")
        print("2. Enter data manually")
        choice = input("Enter choice (1/2): ").strip()

        try:
            if choice == "1":
                send_from_github()
            elif choice == "2":
                send_manual()
            else:
                print("Invalid choice. Please select 1 or 2.")
                continue
        except Exception as exc:
            print(f"ThingSpeak send failed: {exc}")

        again = input("Do you want to add more data? (y/n): ").strip().lower()
        if again != "y":
            print("Exiting sender.")
            break


if __name__ == "__main__":
    main()
