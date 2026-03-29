import os
import time

import requests

CHANNEL_ID = os.getenv("THINGSPEAK_CHANNEL_ID", "3313997")
READ_API_KEY = os.getenv("THINGSPEAK_READ_API_KEY", "XLY9SEEHTH8W7VZ4")
URL = f"https://api.thingspeak.com/channels/{CHANNEL_ID}/feeds.json"
REQUEST_TIMEOUT_SECONDS = 15


def fetch_latest(last_entry_id: int | None = None) -> int | None:
    params = {
        "api_key": READ_API_KEY,
        "results": 1,
    }
    response = requests.get(URL, params=params, timeout=REQUEST_TIMEOUT_SECONDS)
    response.raise_for_status()

    data = response.json()
    feeds = data.get("feeds", [])
    if not feeds:
        print("No data found in the ThingSpeak channel.")
        return last_entry_id

    entry = feeds[0]
    entry_id = int(entry["entry_id"])

    if last_entry_id is None or entry_id > last_entry_id:
        print("\nNew Data from ThingSpeak:")
        print(f"Time: {entry.get('created_at')}")
        print(f"Nitrogen: {entry.get('field1')}")
        print(f"Phosphorus: {entry.get('field2')}")
        print(f"Potassium: {entry.get('field3')}")
        print(f"Moisture: {entry.get('field4')}")
        print(f"Organic Carbon: {entry.get('field5')}")
        print(f"Depth (cm): {entry.get('field6')}")
        print("-" * 40)
        return entry_id

    return last_entry_id


def main() -> None:
    print("Starting ThingSpeak monitor...")
    last_entry_id: int | None = None
    while True:
        try:
            last_entry_id = fetch_latest(last_entry_id)
        except Exception as exc:
            print(f"ThingSpeak read failed: {exc}")
        time.sleep(15)


if __name__ == "__main__":
    main()
