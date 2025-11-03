import requests
import json
import random
import os

# ==============================
# CONFIGURATION
# ==============================
from dotenv import load_dotenv
load_dotenv()
API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
# ==============================
# PRICE ESTIMATION LOGIC
# ==============================
def estimate_price(distance_meters, bus_type="Standard"):
    """Estimate price based on distance and bus type."""
    distance_km = distance_meters / 1000.0
    base_fare = 20.0
    per_km_rate = {
        "Standard": 1.8,
        "Semi Sleeper": 2.2,
        "Sleeper AC": 2.8,
        "Volvo AC": 3.2,
        "Luxury": 3.8
    }.get(bus_type, 2.5)

    per_person = base_fare + (per_km_rate * distance_km)
    return f"₹{round(per_person, 2)}"

# ==============================
# ROUTE FETCHER
# ==============================
def get_bus_routes_json(origin, destination):
    """
    Fetch and synthesize multiple bus route options.
    """
    url = (
        f"https://maps.googleapis.com/maps/api/directions/json?"
        f"origin={origin}&destination={destination}&mode=driving&key={API_KEY}"
    )

    response = requests.get(url)
    data = response.json()

    if data["status"] != "OK":
        return {"error": data.get("status", "API_ERROR"), "message": data.get("error_message", "")}

    leg = data["routes"][0]["legs"][0]
    distance_meters = leg["distance"]["value"]
    duration_text = leg["duration"]["text"]
    base_distance = leg["distance"]["text"]

    # Simulate different bus routes
    bus_types = ["Standard", "Semi Sleeper", "Sleeper AC", "Volvo AC", "Luxury"]
    random.shuffle(bus_types)

    routes = []
    for idx, bus_type in enumerate(bus_types, start=1):
        # Randomize small variation
        distance_var = distance_meters * random.uniform(0.95, 1.15)
        time_var = round(random.uniform(0.9, 1.3), 2)
        est_price = estimate_price(distance_var, bus_type)

        route_entry = {
            "route_no": idx,
            "bus_type": bus_type,
            "start_address": leg["start_address"],
            "end_address": leg["end_address"],
            "distance": f"{round(distance_var/1000, 1)} km",
            "duration": f"~{time_var} × {duration_text}",
            "estimated_price": est_price
        }
        routes.append(route_entry)

    return {
        "origin": origin,
        "destination": destination,
        "routes_found": len(routes),
        "routes": routes
    }

# ==============================
# MAIN
# ==============================
# if __name__ == "__main__":
#     origin = "Erode Main Bus Stand, Tamil Nadu"
#     destination = "chennai Bus Stand"
#
#     result = get_bus_routes_json(origin, destination)
#     print(json.dumps(result, indent=2, ensure_ascii=False))
