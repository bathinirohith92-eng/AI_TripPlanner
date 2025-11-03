import os
import googlemaps
from googlemaps.exceptions import ApiError
from dotenv import load_dotenv

# --- CONFIGURATION AND INITIALIZATION ---

load_dotenv()
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

if not GOOGLE_MAPS_API_KEY:
    print("Error: GOOGLE_MAPS_API_KEY environment variable not set. Please set it in your .env file.")
    exit()

DEFAULT_SEARCH_RADIUS_METERS = 3000  # Search radius set to 3 km

# Initialize Google Maps client
try:
    gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)
except ValueError:
    print("Error: Invalid API key format provided.")
    exit()

print("Google Maps Client initialized successfully.")


def find_best_nearby_hotels(address: str, radius: int = DEFAULT_SEARCH_RADIUS_METERS, limit: int = 5) -> list:
    """
    Finds and returns a list of highly-rated hotels near a specified address.

    Args:
        address: The physical address or place name to search around.
        radius: The search radius in meters (default is 3000m or 3km).
        limit: Maximum number of top-rated hotels to return (default: 5).

    Returns:
        A list of dictionaries with hotel details sorted by rating (desc).
    """
    print(f"\n--- Searching for hotels near: '{address}' ---")

    # 1. Geocode the Address
    try:
        geocode_result = gmaps.geocode(address)
        if not geocode_result:
            print(f"❌ Could not find coordinates for the address: {address}")
            return []

        location = geocode_result[0]['geometry']['location']
        lat, lng = location['lat'], location['lng']
        print(f"✅ Coordinates found at: {lat}, {lng}")

    except ApiError as e:
        print(f"❌ API ERROR during geocoding: {e}")
        return []

    # 2. Search for Nearby Lodging
    try:
        places_result = gmaps.places_nearby(
            location=(lat, lng),
            radius=radius,
            type='lodging'
        )

        place_results = places_result.get('results', [])
        print(f"✅ Found {len(place_results)} lodging places within {radius}m.")

        if not place_results:
            return []

        hotels_list = []
        for place in place_results:
            place_id = place['place_id']
            place_details = gmaps.place(
                place_id=place_id,
                fields=['name', 'formatted_address', 'rating', 'website', 'url']
            )

            if place_details.get('status') == 'OK':
                result = place_details['result']
                hotels_list.append({
                    "Name": result.get('name', 'N/A'),
                    "Address": result.get('formatted_address', 'N/A'),
                    "Rating": result.get('rating', 0.0),
                    "Website": result.get('website', 'N/A'),
                    "Google Maps Link": result.get('url', 'N/A')
                })

        # 3. Sort by rating and return only top N results
        sorted_hotels = sorted(hotels_list, key=lambda x: x.get('Rating', 0.0), reverse=True)
        top_hotels = sorted_hotels[:limit]

        print(f"✅ Returning top {len(top_hotels)} hotels.")
        return top_hotels

    except ApiError as e:
        print(f"❌ API ERROR during places search: {e}")
        return []












# --- Example of Agent Interaction ---
# if __name__ == "__main__":
#     def accommodation_agent_mock_call(place_address: str, search_radius: int):
#         print(f"\n[ACCOMMODATION AGENT] Requesting accommodation data for: {place_address}")
#         hotel_data = find_best_nearby_hotels(place_address, search_radius)
#         print(f"[ACCOMMODATION AGENT] Processing {len(hotel_data)} hotel results.")
#         return hotel_data
#
#     address_from_agent = "THE MARINA MALL CHENNAI, 13/1A, Old Mahabalipuram Road, Egattur, Tamil Nadu 600130"
#     top_hotels = accommodation_agent_mock_call(address_from_agent, search_radius=5000)
#
#     if top_hotels:
#         print("\n============= TOP 5 RATED HOTELS =============")
#         for i, hotel in enumerate(top_hotels, start=1):
#             print(f"--- #{i} ---")
#             print(f"Name: {hotel['Name']}")
#             print(f"Rating: {hotel['Rating']}")
#             print(f"Address: {hotel['Address']}")
#             print(f"Website: {hotel['Website']}")
#             print(f"Maps: {hotel['Google Maps Link']}")
#             print("-" * 30)
#     else:
#         print("\n[ACCOMMODATION AGENT] No hotels were found or an error occurred.")
