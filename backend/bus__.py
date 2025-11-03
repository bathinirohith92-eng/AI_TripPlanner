import requests
import json
from datetime import datetime

import os
from dotenv import load_dotenv
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
GOOGLE_DIRECTIONS_URL = "https://maps.googleapis.com/maps/api/directions/json"


def geocode(address):
    """Return (lat, lng) tuple for an address."""
    params = {"address": address, "key": GOOGLE_API_KEY}
    r = requests.get("https://maps.googleapis.com/maps/api/geocode/json", params=params)
    j = r.json()
    if j.get("status") == "OK" and j["results"]:
        loc = j["results"][0]["geometry"]["location"]
        return (loc["lat"], loc["lng"])
    return None


def secs_to_human(seconds):
    """Convert seconds to human-readable time format."""
    m = seconds // 60
    if m < 60:
        return f"{m} min"
    h = m // 60
    rem = m % 60
    return f"{h} hr {rem} min" if rem else f"{h} hr"


def get_bus_routes_json(origin, destination, departure_time=None):
    """
    Return all bus routes between origin and destination in JSON format.
    """
    if not departure_time:
        departure_time = int(datetime.now().timestamp())

    origin_coords = geocode(origin)
    dest_coords = geocode(destination)

    if not origin_coords or not dest_coords:
        return {"error": "Invalid origin or destination"}

    params = {
        "origin": f"{origin_coords[0]},{origin_coords[1]}",
        "destination": f"{dest_coords[0]},{dest_coords[1]}",
        "mode": "transit",
        "key": GOOGLE_API_KEY,
        "departure_time": departure_time,
        "alternatives": "true"
    }

    r = requests.get(GOOGLE_DIRECTIONS_URL, params=params)
    data = r.json()

    if data.get("status") != "OK" or not data.get("routes"):
        return {"error": f"No available bus routes found. Status: {data.get('status')}"}

    routes_json = {}
    route_num = 1

    for route in data["routes"]:
        total_duration = secs_to_human(route["legs"][0]["duration"]["value"])
        steps = []
        for step in route["legs"][0]["steps"]:
            if "transit_details" in step and step["transit_details"]["line"]["vehicle"]["type"].upper() == "BUS":
                td = step["transit_details"]
                steps.append({
                    "name": td["line"].get("short_name") or td["line"].get("name"),
                    "route": f"{td['departure_stop']['name']} → {td['arrival_stop']['name']}",
                    "bus_trip_time": secs_to_human(step["duration"]["value"])
                })

        if not steps:
            continue

        route_key = f"Route {route_num}"
        route_entry = {
            "start": origin,
            "destination": destination,
            "time_for_trip": total_duration,
            "type": "Direct Bus" if len(steps) == 1 else "Connected Buses"
        }

        for i, step in enumerate(steps, 1):
            route_entry[f"BUS {i}"] = step

        routes_json[route_key] = route_entry
        route_num += 1

    return json.dumps(routes_json, indent=2)


# if __name__ == "__main__":
#     origin = "Erode Main Bus Stand, Tamil Nadu"
#     destination = "Kilambakkam New Bus Stand, Tamil Nadu"
#
#     final_json = get_bus_routes_json(origin, destination)
#
#     if "error" in final_json:
#         print(json.dumps(final_json, indent=2))
#     else:
#         print(f"🚌 Found {len(final_json)} Bus Route(s):\n")
#         print(json.dumps(final_json, indent=2))
