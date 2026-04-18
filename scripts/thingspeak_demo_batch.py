import os
import sys
import time

import requests

CHANNEL_ID = os.getenv("THINGSPEAK_CHANNEL_ID", "3313997")
READ_API_KEY = os.getenv("THINGSPEAK_READ_API_KEY", "XLY9SEEHTH8W7VZ4")
WRITE_API_KEY = os.getenv("THINGSPEAK_WRITE_API_KEY", "N14MWJ8WKO8E1URT")
THINGSPEAK_UPDATE_URL = "https://api.thingspeak.com/update"
THINGSPEAK_READ_URL = f"https://api.thingspeak.com/channels/{CHANNEL_ID}/feeds.json"
REQUEST_TIMEOUT_SECONDS = 15
DELAY_SECONDS = 16
REQUEST_RETRY_ATTEMPTS = 3
RETRY_BACKOFF_SECONDS = 5


class ThingSpeakDemoError(RuntimeError):
    """User-friendly error for presentation-time network and channel issues."""

DEMO_ROWS = [
    {
        "field1": 31.80,
        "field2": 18.40,
        "field3": 142.60,
        "field4": 24.30,
        "field5": 1098.00,
        "field6": 10.00,
    },
    {
        "field1": 33.10,
        "field2": 19.10,
        "field3": 145.20,
        "field4": 25.40,
        "field5": 1110.00,
        "field6": 10.00,
    },
    {
        "field1": 34.20,
        "field2": 20.30,
        "field3": 147.80,
        "field4": 26.10,
        "field5": 1124.00,
        "field6": 10.00,
    },
    {
        "field1": 35.40,
        "field2": 21.20,
        "field3": 150.60,
        "field4": 27.00,
        "field5": 1136.00,
        "field6": 10.00,
    },
    {
        "field1": 36.90,
        "field2": 22.40,
        "field3": 153.10,
        "field4": 27.80,
        "field5": 1149.00,
        "field6": 10.00,
    },
]


def describe_request_error(exc: requests.exceptions.RequestException) -> str:
    message = str(exc)
    if "Failed to resolve" in message or "getaddrinfo failed" in message:
        return (
            "DNS lookup failed for api.thingspeak.com. Check Wi-Fi or hotspot, "
            "disable VPN/proxy if it is blocking DNS, and rerun the command."
        )

    if "timed out" in message.lower():
        return (
            "ThingSpeak did not respond before the request timeout. Check the internet "
            "connection and rerun the command after a few seconds."
        )

    return message


def post_with_retry(url: str, **kwargs: object) -> requests.Response:
    last_error: str | None = None
    for attempt in range(1, REQUEST_RETRY_ATTEMPTS + 1):
        try:
            response = requests.post(url, **kwargs)
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as exc:
            last_error = describe_request_error(exc)
            print(f"Attempt {attempt}/{REQUEST_RETRY_ATTEMPTS} failed: {last_error}")
            if attempt < REQUEST_RETRY_ATTEMPTS:
                print(f"Retrying in {RETRY_BACKOFF_SECONDS} seconds...")
                time.sleep(RETRY_BACKOFF_SECONDS)

    raise ThingSpeakDemoError(last_error or "ThingSpeak upload request failed.")


def get_with_retry(url: str, **kwargs: object) -> requests.Response:
    last_error: str | None = None
    for attempt in range(1, REQUEST_RETRY_ATTEMPTS + 1):
        try:
            response = requests.get(url, **kwargs)
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as exc:
            last_error = describe_request_error(exc)
            print(f"Validation attempt {attempt}/{REQUEST_RETRY_ATTEMPTS} failed: {last_error}")
            if attempt < REQUEST_RETRY_ATTEMPTS:
                print(f"Retrying validation in {RETRY_BACKOFF_SECONDS} seconds...")
                time.sleep(RETRY_BACKOFF_SECONDS)

    raise ThingSpeakDemoError(last_error or "ThingSpeak validation request failed.")


def send_row(index: int, row: dict[str, float]) -> None:
    payload = {"api_key": WRITE_API_KEY, **row}
    response = post_with_retry(
        THINGSPEAK_UPDATE_URL,
        data=payload,
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()

    response_value = response.text.strip()
    if response_value == "0":
        raise ThingSpeakDemoError(
            "ThingSpeak rejected the update. Check the write API key and the 15-second "
            "rate limit, then rerun the command."
        )

    print(
        f"Sent row {index + 1}/{len(DEMO_ROWS)} to ThingSpeak. "
        f"Entry ID: {response_value}. Organic_Carbon={row['field5']}, Depth={row['field6']}"
    )


def validate_channel_configuration() -> None:
    params = {"results": 1}
    if READ_API_KEY:
        params["api_key"] = READ_API_KEY

    response = get_with_retry(
        THINGSPEAK_READ_URL,
        params=params,
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()

    payload = response.json()
    feeds = payload.get("feeds", [])
    if not feeds:
        raise ThingSpeakDemoError("ThingSpeak returned no feeds while validating the channel.")

    latest = feeds[0]
    field5 = latest.get("field5")
    field6 = latest.get("field6")

    if field5 in (None, "") or field6 in (None, ""):
        raise ThingSpeakDemoError(
            "ThingSpeak channel is not fully configured yet. "
            "Enable Field 5 as Organic_Carbon and Field 6 as Depth_cm in the channel settings, "
            "save the channel, then rerun this script."
        )


def print_recovery_steps() -> None:
    print()
    print("Presentation recovery steps:")
    print("1. Confirm the laptop is connected to Wi-Fi or mobile hotspot.")
    print("2. Open https://api.thingspeak.com in the browser once to confirm DNS works.")
    print("3. If a VPN/proxy/firewall is active, disable it temporarily.")
    print("4. Rerun: .\\venv\\Scripts\\python.exe .\\scripts\\thingspeak_demo_batch.py")
    print("5. Rows already accepted by ThingSpeak remain in the channel.")


def main() -> int:
    print("Starting demo batch upload to ThingSpeak...")
    print(
        "This script sends 5 demo-ready records with Nitrogen, Phosphorus, Potassium, "
        "Moisture, Organic_Carbon, and Depth."
    )
    print(f"Using ThingSpeak minimum-safe delay of {DELAY_SECONDS} seconds between updates.")

    try:
        for index, row in enumerate(DEMO_ROWS):
            send_row(index, row)
            if index < len(DEMO_ROWS) - 1:
                print(f"Waiting {DELAY_SECONDS} seconds before sending the next row...")
                time.sleep(DELAY_SECONDS)
    except ThingSpeakDemoError as exc:
        print()
        print("ThingSpeak demo upload stopped before all 5 rows were sent.")
        print(f"Reason: {exc}")
        print_recovery_steps()
        return 1

    print("ThingSpeak demo batch upload complete.")
    try:
        validate_channel_configuration()
        print("ThingSpeak channel validation passed. Field 5 and Field 6 are readable.")
    except ThingSpeakDemoError as exc:
        print()
        print("Upload completed, but channel validation could not finish cleanly.")
        print(f"Reason: {exc}")
        print("If the admin import fails, fix the network and rerun the command.")

    print(
        "Next step: open the admin panel and click 'Import ThingSpeak Data', "
        "then trigger carbon calculation for the active season."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
