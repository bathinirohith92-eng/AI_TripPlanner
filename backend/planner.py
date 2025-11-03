from pydantic import BaseModel
from typing import List, Optional, Dict
import random
from google import genai
from google.genai import types
import aiohttp
from aiohttp import ClientTimeout
from google.oauth2 import service_account
import json
import time
import math
import asyncio
import httpx
from typing import Dict, List, Tuple
import os
from dotenv import load_dotenv
load_dotenv()

# -------------------------
# CONFIG
# -------------------------
PER_KM_COST = 15  # ₹ per km (shared cab)
MAX_TRAVEL_DISTANCE_PER_SPOT = 150  # km from hotel
MAX_DAILY_TRAVEL_MIN = 480  # 8 hours/day


GOOGLE_MAPS_API_KEY = "GOOGLE_MAPS_API_KEY"
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
OUTPUT_FILE = "fast_output.json"
SERVICE_ACCOUNT_PATH = os.getenv("SERVICE_ACCOUNT_PATH")
VERTEX_PROJECT = os.getenv("VERTEX_PROJECT")
VERTEX_LOCATION = os.getenv("VERTEX_LOCATION")
MODEL_ID = os.getenv("MODEL_ID_PLANNER")
SCOPES = os.getenv("SCOPES").split(",") if os.getenv("SCOPES") else []
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

# MODEL_ID = "gemini-2.5-pro"
# MODEL_ID= "gemini-2.5-flash"
MODEL_ID = "gemini-2.5-flash-lite"



_credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_PATH, scopes=SCOPES
)

_client = genai.Client(
    vertexai=True,
    project=VERTEX_PROJECT,
    location=VERTEX_LOCATION,
    credentials=_credentials
)



# --- Pydantic Model ---
class TripDetails(BaseModel):
    origin: Optional[str] = None
    destination: str
    # destination_city: Optional[str] = None
    duration_days: Optional[int] = None
    start_date: Optional[str] = None
    travelers: Optional[int] = 1
    budget: Optional[int] = None
    place_category: Optional[str] = None
    interests: List[str]
    search_keywords: Dict[str, str] = {
        "primary": "",
        "secondary": "",
        "extra": ""
    }
    search_radius_km: int = 75
    max_spots: int = 1


# --- Vertex AI Structured Extraction ---
def get_structured_trip_details(user_prompt: str) -> Optional[TripDetails]:
    if not os.path.exists(SERVICE_ACCOUNT_PATH):
        print(f"Error: Service account not found: {SERVICE_ACCOUNT_PATH}")
        return None

    try:
        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_PATH, scopes=SCOPES
        )

        client = genai.Client(
            vertexai=True,
            project=VERTEX_PROJECT,
            location=VERTEX_LOCATION,
            credentials=credentials
        )

        system_instruction = (
            "You are an expert travel planner assistant. Convert the user's text into structured JSON only. "
            "Follow these rules:\n"
            "• origin: extract city where user is traveling from. If absent, keep null.\n"
            "• destination: main state or country.\n"
            "• duration_days: number of days. If missing, infer 7.\n"
            "• start_date: if any date appears, extract ISO YYYY-MM-DD or only month name given then start from 1st date of the month , Else null.\n"
            "• travelers: number of people. If absent, default 1.\n"
            "• budget: extract numeric amount only, INR assumed. If absent, null.\n"
            "• place_category: convert interests into a category such as 'mountain', 'beach', 'nature', water falls etc.\n"
            "• interests: extract interest nouns.\n"
             "• search_keywords: generate a list of keyword groups that capture from the user query about trip’s essence focus majory .\n"
            "  - The number of keyword groups = min(duration_days, 10). (e.g., 3 days → 3 keywords, 30 days → 10 keywords)\n"
            "  - Keywords must be reliable and diverse, covering aspects such as:\n"
            "    Cultural Explorer, Adventure Seeker, Relaxation Retreat, Food & Nightlife, Nature Lover, "
            "    History Buff, Wildlife Explorer, or Spiritual Journey.\n"
            "  - Arrange them under keys: primary, secondary, extra1, extra2, ... depending on count.\n\n"

            "• search_radius_km: always set default 75 if not mentioned.\n"
            "• max_spots: 21  \n"
            "Do not add any extra fields or text.\n"
            "STRICT JSON ONLY.\n\n"
            "Return JSON with this structure:\n"
            "{\n"
            '  "origin": "string|null",\n'
            '  "destination": "string",\n'
            '  "duration_days": number,\n'
            '  "start_date": "string|null",\n'
            '  "travelers": number,\n'
            '  "budget": number|null,\n'
            '  "place_category": "string|null",\n'
            '  "interests": [string],\n'
            '  "search_keywords": {\n'
            '      "primary": "string",\n'
            '      "secondary": "string",\n'
            '      "extra": "string"\n'
            '  },\n'
            '  "search_radius_km": number,\n'
            '  "max_spots": number\n'
            "}"
        )

        response = client.models.generate_content(
            model=MODEL_ID,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_schema=TripDetails,
                response_mime_type="application/json",
            ),
        )

        parsed_data = json.loads(response.text)


        return TripDetails.model_validate(parsed_data)

    except Exception as e:
        print(f"Error: {e}")
        return None



MIN_RATING = 3.5

async def fetch_json(session, url, params):
    async with session.get(url, params=params) as response:
        return await response.json()

async def places_text_search(session, query, location):
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {"query": f"{query} in {location}", "key": GOOGLE_API_KEY}
    data = await fetch_json(session, url, params)
    return data.get("results", [])

async def place_details(session, place_id):
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": place_id,
        "fields": "place_id,name,geometry,rating,opening_hours,types",
        "key": GOOGLE_API_KEY,
    }
    data = await fetch_json(session, url, params)
    return data.get("result")

def fetch_spot_data(place):
    return {
        "id": place.get("place_id"),
        "name": place.get("name"),
        "lat": place.get("geometry", {}).get("location", {}).get("lat"),
        "lng": place.get("geometry", {}).get("location", {}).get("lng"),
        "rating": place.get("rating", None),
        "types": place.get("types", []),
        "open_now": place.get("opening_hours", {}).get("open_now", None)
    }

def select_central_hotel_location(spots):
    if not spots:
        return {"lat": None, "lng": None}
    return random.choice(spots)

async def run_step2(input_data):
    destination = input_data.get("destination")
    max_spots = input_data.get("max_spots") + 3
    keywords = input_data.get("search_keywords", {})

    # Dynamically collect all keyword values from search_keywords dict
    search_queries = [
                         f"{kw} tourist places" for kw in keywords.values() if kw
                     ] + [
                         f"{kw} attractions" for kw in keywords.values() if kw
                     ] + [
                         f"{kw} activities" for kw in keywords.values() if kw
                     ]

    all_spots = []
    async with aiohttp.ClientSession() as session:
        # Step 1: Run all text searches concurrently
        search_tasks = [places_text_search(session, q, destination) for q in search_queries]
        search_results = await asyncio.gather(*search_tasks)
        search_results = [r for results in search_results for r in results]

        # Step 2: Filter & fetch details concurrently
        detail_tasks = [
            place_details(session, r["place_id"])
            for r in search_results if r.get("rating", 0) >= MIN_RATING
        ]
        details_list = await asyncio.gather(*detail_tasks)

    for d in details_list:
        if d and d.get("geometry", {}).get("location"):
            all_spots.append(fetch_spot_data(d))

    unique_spots = {spot["id"]: spot for spot in all_spots}.values()
    final_spots = list(unique_spots)[:max_spots]

    return {
        "spots": final_spots,
        "hotel_location": select_central_hotel_location(final_spots)
    }



# -------------------------
# HELPER FUNCTIONS
# -------------------------
async def build_distance_matrix_async(
    origins: List[Tuple[float, float]], destinations: List[Tuple[float, float]]
) -> Dict:
    """Asynchronous Google Distance Matrix API call."""
    url = "https://maps.googleapis.com/maps/api/distancematrix/json"
    origin_str = "|".join([f"{lat},{lng}" for lat, lng in origins])
    dest_str = "|".join([f"{lat},{lng}" for lat, lng in destinations])
    params = {
        "origins": origin_str,
        "destinations": dest_str,
        "key": GOOGLE_MAPS_API_KEY,
        "units": "metric",
    }

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()


def estimate_travel_cost(distance_km: float) -> int:
    """Estimate travel cost (₹) based on distance."""
    return int(distance_km * PER_KM_COST)


# -------------------------
# MAIN PROCESS
# -------------------------
async def process_spots(step2_data: Dict) -> Dict:
    """Processes hotel–spot and spot–spot distance features asynchronously."""
    start_total = time.time()

    hotel = step2_data["hotel_location"]
    spots = step2_data["spots"]

    origins = [(hotel["lat"], hotel["lng"])]
    destinations = [(s["lat"], s["lng"]) for s in spots]

    # -------------------------
    # STEP 3.1 — HOTEL ➜ SPOTS
    # -------------------------
    print("\n🚀 STEP 3.1: Calling Distance Matrix API for Hotel ➜ Spots...")
    start_hotel_to_spots = time.time()

    dm_response = await build_distance_matrix_async(origins, destinations)



    hotel_to_spots_time = round(time.time() - start_hotel_to_spots, 2)

    results = []
    budget_used = 0

    for i, row in enumerate(dm_response["rows"][0]["elements"]):
        spot = spots[i]
        if row["status"] != "OK":
            continue

        dist_km = round(row["distance"]["value"] / 1000, 2)
        time_min = round(row["duration"]["value"] / 60, 1)

        if dist_km > MAX_TRAVEL_DISTANCE_PER_SPOT:
            continue

        travel_cost = estimate_travel_cost(dist_km)
        budget_used += travel_cost

        results.append({
            "name": spot["name"],
            "distance_from_hotel_km": dist_km,
            "travel_time_min": time_min,
            "travel_cost": travel_cost,
            "entry_fee": spot.get("entry_fee", 0),
            "lat": spot["lat"],
            "lng": spot["lng"]
        })

    print(f"✅ Hotel ➜ Spots completed in {hotel_to_spots_time}s")

    # -------------------------
    # STEP 3.2 — SPOT ➜ SPOT (PARALLEL)
    # -------------------------
    print("\n🌍 STEP 3.2: Calling Distance Matrix API for Spot ➜ Spot (parallel)...")
    start_spot_to_spot = time.time()

    async def spot_to_spot_matrix(s1):
        o = [(s1["lat"], s1["lng"])]
        d = [(s2["lat"], s2["lng"]) for s2 in spots if s2["name"] != s1["name"]]
        try:
            dm_pair = await build_distance_matrix_async(o, d)
            matrix = {}
            j = 0
            for s2 in spots:
                if s2["name"] == s1["name"]:
                    continue
                el = dm_pair["rows"][0]["elements"][j]
                j += 1
                if el["status"] != "OK":
                    continue
                matrix[s2["name"]] = {
                    "distance_km": round(el["distance"]["value"] / 1000, 1),
                    "time_min": round(el["duration"]["value"] / 60, 1)
                }
            return s1["name"], matrix
        except Exception as e:
            print(f"❌ Error for {s1['name']}: {e}")
            return s1["name"], {}

    pair_tasks = [spot_to_spot_matrix(s) for s in spots]
    pair_results = await asyncio.gather(*pair_tasks)
    pair_matrix = dict(pair_results)

    spot_to_spot_time = round(time.time() - start_spot_to_spot, 2)
    total_time = round(time.time() - start_total, 2)

    print(f"✅ Spot ➜ Spot completed in {spot_to_spot_time}s")
    print(f"\n⏱️ TOTAL Step 3 processing time: {total_time}s")

    # -------------------------
    # FINAL OUTPUT
    # -------------------------
    return {
        "spots_distance_features": results,
        "distance_matrix": pair_matrix,
        "budget_used_so_far": budget_used,
        "travel_constraints": {
            "max_daily_travel_min": MAX_DAILY_TRAVEL_MIN
        },
        "time_taken": {
            "hotel_to_spots_sec": hotel_to_spots_time,
            "spot_to_spot_sec": spot_to_spot_time,
            "total_step3_sec": total_time
        }
    }


# ===========================
# 🧩 Helper — JSON Auto Fixer
# ===========================
def fix_broken_json(bad_json: str) -> dict:
    """Repair malformed or truncated JSON using Gemini safely."""
    print("⚙️ Attempting to auto-fix malformed JSON...")
    repair_prompt = f"""
    The following JSON is invalid or incomplete.
    Your job is to **only repair** structural issues (missing commas, brackets, quotes)
    without changing or rewording any field values.
    Return strictly valid JSON. Do not add comments or text.

    JSON to fix:
    {bad_json}
    """

    repair_config = types.GenerateContentConfig(
        # max_output_tokens=1024,
        max_output_tokens= 24000,
        response_mime_type="application/json",
        temperature=0.0,
    )
    repair_response = _client.models.generate_content(
        model=MODEL_ID,
        contents=repair_prompt,
        config=repair_config,
    )
    fixed_text = repair_response.text.strip()

    try:
        return json.loads(fixed_text)
    except Exception:
        print("❌ Auto-fix attempt failed. Returning raw output.")
        return {"error": "Invalid JSON even after fix", "raw_text": fixed_text}


# ===========================
# 🧭 Optimize Day Plan
# ===========================
def optimize_day_plan(step2_data, step3_data):
    start_time = time.time()

    hotel = step2_data["hotel_location"]
    spots = step3_data["spots_distance_features"]
    distance_matrix = step3_data["distance_matrix"]
    max_daily_travel_min = step3_data["travel_constraints"]["max_daily_travel_min"]

    spots.sort(key=lambda x: x["distance_from_hotel_km"])
    days_output = {}
    current_day = 1
    remaining_spots = spots[:]
    precomputed = {loc: distance_matrix.get(loc, {}) for loc in distance_matrix}

    while remaining_spots:
        day_key = f"Day {current_day}"
        days_output[day_key] = []
        travel_used = 0
        current_loc = "hotel"

        while remaining_spots:
            if current_loc == "hotel":
                next_spot = remaining_spots[0]
                travel_time = next_spot["travel_time_min"]
            else:
                lookup = precomputed.get(current_loc, {})
                next_spot = min(
                    remaining_spots,
                    key=lambda s: lookup.get(s["name"], {}).get("time_min", 999999)
                )
                travel_time = lookup.get(next_spot["name"], {}).get("time_min", 0)

            if travel_used + travel_time > max_daily_travel_min:
                break

            travel_used += travel_time
            days_output[day_key].append({
                "name": next_spot["name"],
                "lat": next_spot["lat"],
                "lng": next_spot["lng"]
            })
            current_loc = next_spot["name"]
            remaining_spots.remove(next_spot)

        current_day += 1

    days_output["hotel_location"] = hotel
    print(f"⏱ optimize_day_plan done in {time.time() - start_time:.2f} sec")
    return days_output



def format_itinerary_with_llm(itinerary_data, user_query):
    start_time = time.time()

    prompt = f"""
    You are a professional travel planner.

    TASK: Create **three unique trip plans** for the user's query below.
    Each plan must include a different set of places (no repeated spot across plans).

    Follow these steps strictly:
    1️⃣ Group nearby spots on the same day to minimize travel.
    2️⃣ Start each day near the hotel and pick user-requested or nearby places.
    3️⃣ Allocate realistic durations (1–2h for small spots, 3–5h for beaches, etc).
    4️⃣ Each plan must be a **valid JSON object** matching the schema below.
    5️⃣ Output an array containing 3 such plans — `[plan1, plan2, plan3]`.

    ⚙️ SCHEMA for each plan:
    {{
                "date":"YYYY-MM-DD",
                "duration_days":int,
                "itinerary_name": "2-3 catchy itinerary name that should be cool, attractive",
                "hotel":{{
                    "name": "Uv Bar",
                    "lat": 15.5793064,
                    "lng": 73.7388843,
                    "rating": 3.9,
                    "types": [
                      "bar",
                      "establishment",
                      "night_club",
                      "point_of_interest"
                    ],
                    "open_now": true
                  }},
                "itinerary":{{
                "Day 1":[{{
                "spot_name": "Dream Beach",
                "lat": "latitude",
                "long": "longitude",
                "description": "very crisp description",
                "estimated_time_spent": 2 hrs
              }},
              {{
                "spot_name": "Goosebumps Virtual Escape",
                "lat": "latitude",
                "long": "longitude",
                "description": "very crisp description",
                "estimated_time_spent": "1.5 hours"
              }},
              {{
                "spot_name": "Curlies beach shack",
                "lat": "latitude",
                "long": "longitude",
                "description": "very crisp description",
                "estimated_time_spent": "4-5 hours"
              }}],
                "Day 2":[{{
                "spot_name": "Fort Aguada",
                "lat": "latitude",
                "long": "longitude",
                "description": "very crisp description",
                "estimated_time_spent": "2 hours"
              }},
              {{
                "spot_name": "Sinq Night Club",
                "lat": "latitude",
                "long": "longitude",
                "description": "very crisp description",
                "estimated_time_spent": "3 hours"
              }},
              {{
                "spot_name": "Club Cubana",
                "lat": "latitude",
                "long": "longitude",
                "description": "very crisp description",
                "estimated_time_spent": "4-5 hours"
              }}],
                "Day 4":[],
                "Day 5":[]
                like that to till
                "Day n":[]
                }}
            }}
    #

    📏 RULES:
    - If the user mentions a number of days, plan **exactly that many days** (Day 1 … Day N).
    - If not mentioned, default to **3 days**.
    - Each day must have **at least 3 activities** (morning, afternoon, evening).
    - Each description should be **short (7–8 words max)**.
    - Each plan should have **unique spots**, no overlap between plans.
    - If specific required spots are provided for itinerary generation, ensure you include and prioritize them use at least two of the given places whenever possible. For the remaining spots, then use your internal knowledge to find suitable nearby locations and provide accurate latitude and longitude coordinates for each place.
    - And the `estimated_time_spent` in day in total of that day do not exceed 9 hrs.
    - Output **pure JSON only**, no explanations or comments.

    User request: {user_query}
    Spots JSON: {json.dumps(itinerary_data, separators=(',', ':'))}
    Now think carefully and output only the final JSON — no explanations.
    """

    config = types.GenerateContentConfig(
        temperature=0.6,
        top_p=0.8,
        max_output_tokens=24000,
        response_mime_type="application/json",
    )

    response = _client.models.generate_content(
        model=MODEL_ID,
        contents=prompt,
        config=config,
    )

    refined_output = response.text.strip()
    print(f"⏱ format_itinerary_with_llm done in {time.time() - start_time:.2f} sec")

    # ✅ Return list of itineraries safely
    try:
        data = json.loads(refined_output)
        if isinstance(data, dict):
            return [data]
        elif isinstance(data, list):
            return data
        else:
            return [{"error": "Unexpected format", "raw": data}]
    except json.JSONDecodeError:
        print("⚠️ JSON parsing failed, trying auto-fix")
        fixed = fix_broken_json(refined_output)
        if isinstance(fixed, dict):
            return [fixed]
        return fixed



# ------------------------
def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


async def fetch_with_retry(session, url, params, retries=2):
    for attempt in range(retries + 1):
        try:
            async with session.get(url, params=params, timeout=ClientTimeout(total=10)) as resp:
                if resp.status == 200:
                    return await resp.json()
        except Exception:
            pass
        await asyncio.sleep(1 * (2 ** attempt))
    return {}


# -------------------------
# STEP 4: Google Directions Optimization
# -------------------------
async def fetch_directions(session, hotel, activities):
    """Optimize route order for the day using Google Directions API."""
    if not activities:
        return {"optimized_order": [], "polyline": None}

    origin = f"{hotel['lat']},{hotel['lng']}"
    waypoints = "|".join([f"{a['lat']},{a['long']}" for a in activities])
    url = "https://maps.googleapis.com/maps/api/directions/json"
    params = {
        "origin": origin,
        "destination": origin,
        "waypoints": f"optimize:true|{waypoints}",
        "mode": "driving",
        "key": GOOGLE_MAPS_API_KEY,
    }

    data = await fetch_with_retry(session, url, params)
    if data.get("status") == "OK":
        route = data["routes"][0]
        order = route.get("waypoint_order", [])
        reordered = [activities[i] for i in order]
        return {"optimized_order": reordered, "polyline": route["overview_polyline"]["points"]}
    return {"optimized_order": activities, "polyline": None, "note": "fallback"}


# -------------------------
# STEP 5: Weather Fetch
# -------------------------
async def fetch_weather(session, lat, lon):
    """Fetch compact current weather (fast version)."""
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {"lat": lat, "lon": lon, "appid": OPENWEATHER_API_KEY, "units": "metric"}

    data = await fetch_with_retry(session, url, params)
    if not data or "weather" not in data:
        return "unknown"

    cond = data["weather"][0]["main"].lower()
    if "rain" in cond:
        return "rainy"
    elif "cloud" in cond:
        return "cloudy"
    elif "clear" in cond:
        return "clear"
    else:
        return cond


# -------------------------
# CORE ASYNC PROCESSOR
# -------------------------
async def process_single_trip(step3):
    """Process one trip dict and enrich with route + weather."""
    hotel = step3.get("hotel", {"lat": 0, "lng": 0, "name": "Unknown"})
    itinerary_name = step3.get("itinerary_name")
    days = step3.get("itinerary", {})
    from datetime import date

    start_date = date.fromisoformat(step3.get("date", date.today().isoformat()))

    async with aiohttp.ClientSession() as session:
        async with asyncio.TaskGroup() as tg:
            route_tasks, weather_tasks = [], []

            for i, (day_name, activities) in enumerate(days.items()):
                route_tasks.append(tg.create_task(fetch_directions(session, hotel, activities)))
                for act in activities:
                    weather_tasks.append(tg.create_task(fetch_weather(session, act["lat"], act["long"])))

        routes = [t.result() for t in route_tasks]
        weathers = [t.result() for t in weather_tasks]

    # Attach weather info
    wi = 0
    for _, acts in days.items():
        for a in acts:
            a["weather"] = weathers[wi]
            wi += 1

    # Build final output
    from datetime import date, timedelta
    return {
        "trip_details": {
            "trip_name": f"Trip to {hotel.get('name', 'Destination')}",
            "itinerary_name" : itinerary_name,
            "start_date": start_date.isoformat(),
            "end_date": (start_date + timedelta(days=len(days) - 1)).isoformat(),
            "duration_days": len(days),
            "destination": hotel.get("name", "Unknown"),
        },
        "hotel": hotel,
        "optimized_routes": {f"Day {i+1}": routes[i] for i in range(len(routes))},
        "itinerary": days,
    }


# -------------------------
# PUBLIC ENTRY FUNCTION
# -------------------------
async def run_itinerary_pipeline(step3_data):
    """
    Accepts either:
      - a single itinerary dict, or
      - a list of itinerary dicts
    Runs async optimization + weather and returns final structured output.
    """
    t0 = time.time()

    async def runner():
        if isinstance(step3_data, list):
            results = []
            for trip in step3_data:
                results.append(await process_single_trip(trip))
            return results
        else:
            return await process_single_trip(step3_data)

    final_output = await runner()


    # Save file (optional)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(final_output, f, indent=2, ensure_ascii=False)

    print(f"✅ Done! Route + Weather enriched. Took {time.time() - t0:.2f}s")
    return final_output





# if __name__ == "__main__":
#     import json
#     from colorama import Fore, Style
#     import asyncio
#     from datetime import datetime
#     import json
#
#     # Example user query
#     prompt_1 = (
#         "tripplan to afericaa for 3 days for 7 members 25k budget"
#     )
#
#     print(f"user query is : {prompt_1}\n\n")
#
#
#     # Helper function to log time difference
#     def log_time(step_name, start_time, end_time):
#         duration = (end_time - start_time).total_seconds()
#         print(f"{Fore.MAGENTA}⏱️  {step_name} took {duration:.2f} seconds{Style.RESET_ALL}\n")
#         return duration
#
#
#     # Start overall timer
#     overall_start = datetime.now()
#     print(f"{Fore.YELLOW}🚀 Process started at: {overall_start.strftime('%Y-%m-%d %H:%M:%S')}{Style.RESET_ALL}\n")
#
#     # STEP 1: Understanding User Intent
#     print(f"{Fore.CYAN}{'-' * 50}\n🎯 STEP 1: Understanding User Intent\n{'-' * 50}{Style.RESET_ALL}")
#     start_step1 = datetime.now()
#     trip1 = get_structured_trip_details(prompt_1)
#
#     end_step1 = datetime.now()
#     print("\nStructured Intent Response:\n")
#     print(trip1.model_dump_json(indent=2))
#     step1_time = log_time("STEP 1 (Understanding User Intent)", start_step1, end_step1)
#     # log_process("STEP 1 - Understanding User Intent", step1_time)
#
#     # STEP 2: Destination + Spots + Hotels
#     print(f"\n{Fore.CYAN}{'-' * 50}\n📍 STEP 2: Destination + Spots Search + Hotel Search\n{'-' * 50}{Style.RESET_ALL}")
#     start_step2 = datetime.now()
#     # step2 = run_step2(trip1.model_dump())
#     step2 = asyncio.run(run_step2(trip1.model_dump()))
#     end_step2 = datetime.now()
#     print(json.dumps(step2, indent=2))
#     step2_time = log_time("STEP 2 (Destination + Spots + Hotels)", start_step2, end_step2)
#     # log_process("STEP 2 - Destination + Spots Search + Hotel Search", step1_time)
#
#     # STEP 3: Distance + Cost Estimation
#     print(f"\n{Fore.GREEN}{'-' * 50}\n🛣️ STEP 3: Distance + Cost Estimation\n{'-' * 50}{Style.RESET_ALL}")
#     start_step3 = datetime.now()
#     step3 = asyncio.run(process_spots(step2))
#     end_step3 = datetime.now()
#     print(json.dumps(step3, indent=2))
#     step3_time = log_time("STEP 3 (Distance + Cost Estimation)", start_step3, end_step3)
#
#     # STEP 3: Bridge Conversion + LLM Formatting
#     print(f"\n{Fore.YELLOW}{'-' * 50}\n🧩 Bridge: Step 3 → Step 4 Conversion\n{'-' * 50}{Style.RESET_ALL}")
#     start_step4 = datetime.now()
#     python_output = optimize_day_plan(step2, step3)
#     final_itinerary = format_itinerary_with_llm(python_output, prompt_1)
#     end_step4 = datetime.now()
#     print("\nLLM Formatted Itinerary:\n")
#     print(json.dumps(final_itinerary, indent=2))
#     step4_time = log_time("STEP 3 to 4 (Itinerary Optimization + LLM Formatting)", start_step4, end_step4)
#
#     # STEP 5–6: Weather + Enhancements + Final Itinerary
#     print(
#         f"\n{Fore.MAGENTA}{'=' * 50}\n🌦️ STEP 4 & 5 & STEP 6: Weather ✓ Final Itinerary ✓ Enhancements ✓\n{'=' * 50}{Style.RESET_ALL}"
#     )
#     start_step5 = datetime.now()
#     result = asyncio.run(run_itinerary_pipeline(final_itinerary))
#
#     end_step5 = datetime.now()
#     print("\n📌 FINAL RESULT:\n")
#     print(json.dumps(result, indent=2))
#     step5_time = log_time("STEP 5–6 (Weather + Final Enhancements)", start_step5, end_step5)
#
#     # END — Calculate total duration
#     overall_end = datetime.now()
#     overall_duration = (overall_end - overall_start).total_seconds()
#
#     print(f"{Fore.GREEN}✅ DONE! Your trip plan has been successfully generated 🥳✨{Style.RESET_ALL}")
#     print(f"{Fore.CYAN}📆 Process finished at: {overall_end.strftime('%Y-%m-%d %H:%M:%S')}{Style.RESET_ALL}")
#     print(f"{Fore.BLUE}🕒 TOTAL EXECUTION TIME: {overall_duration:.2f} seconds{Style.RESET_ALL}")
#
#     # Summary of all step durations
#     print(f"\n{Fore.WHITE}{'=' * 50}")
#     print(f"⏱️  Execution Time Summary:")
#     print(f"  Step 1: {step1_time:.2f}s")
#     print(f"  Step 2: {step2_time:.2f}s")
#     print(f"  Step 3: {step3_time:.2f}s")
#     print(f"  Step 3-4 convertor: {step4_time:.2f}s")
#     print(f"  Step 4-5–6: {step5_time:.2f}s")
#     print(f"{'-' * 50}")
#     print(f"  🕒 Total Time: {overall_duration:.2f}s")
#     print(f"{'=' * 50}{Style.RESET_ALL}")
