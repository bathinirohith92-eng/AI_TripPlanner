from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_core.messages import HumanMessage
import json
import os
from dotenv import load_dotenv
from google.cloud import translate
from langchain_google_genai import ChatGoogleGenerativeAI
from re_planner import get_structured_trip_details, run_step2, process_spots,optimize_day_plan, format_itinerary_with_llm, run_itinerary_pipeline
from bus__ import get_bus_routes_json
from accomdation import find_best_nearby_hotels
import requests
from datetime import datetime, date, timedelta
import uuid


# --- Import LangGraph ---
try:
    from langraph3 import langgraph_app
except ImportError as e:
    print(f"Error importing LangGraph: {e}")
    print("Please ensure 'langgraph2.py' (or travel_planner_graph.py) is present.")
    exit()

# --- Google Cloud Translation Setup (WORKING VERSION) ---
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r"/Users/anish/Downloads/pythonProject/graphic-armor-475316-m7-c43535915000.json"
os.environ["GOOGLE_CLOUD_PROJECT"] = "graphic-armor-475316-m7"

project_id = "graphic-armor-475316-m7"
location = "global"

try:
    client = translate.TranslationServiceClient()
    parent = f"projects/{project_id}/locations/{location}"
    print("✅ Google Translation Client initialized successfully.")
except Exception as e:
    print(f"❌ Failed to initialize Google Translation Client: {e}")
    client = None

# --- Translation Functions (WORKING) ---

def translate_auto_to_english(text: str):
    """Detect language automatically and translate to English."""
    if not client:
        return "en", text  # fallback
    response = client.translate_text(
        request={
            "parent": parent,
            "contents": [text],
            "mime_type": "text/plain",
            "target_language_code": "en",
        }
    )
    translation = response.translations[0]
    return translation.detected_language_code, translation.translated_text


def translate_to_language(text: str, target_language: str):
    """Translate English text back to user's target language."""
    if not client or target_language == "en":
        return text
    response = client.translate_text(
        request={
            "parent": parent,
            "contents": [text],
            "mime_type": "text/plain",
            "target_language_code": target_language,
        }
    )
    return response.translations[0].translated_text


# --- Initialize LLM for follow-up generation ---
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7)


# --- Generate Follow-Up Questions ---
def generate_contextual_follow_ups(user_query: str, langgraph_response: dict, detected_lang: str) -> list:
    """Generate intelligent follow-up questions using LLM."""
    try:
        response_type = "general"
        context_info = ""

        if langgraph_response.get("itinerary_plans"):
            response_type = "itinerary"
            plans = langgraph_response["itinerary_plans"]
            if plans:
                first_plan = plans[0]
                context_info = f"Generated itinerary: {first_plan.get('title', 'Travel Plan')}"

        elif langgraph_response.get("flight_data"):
            response_type = "flights"
            context_info = f"Found {len(langgraph_response['flight_data'])} flight options"

        elif langgraph_response.get("travel_bookings"):
            response_type = "bookings"
            context_info = "Travel bookings processed"

        # Extract last assistant message (LLM response)
        assistant_message = ""
        for msg in reversed(langgraph_response.get("messages", [])):
            if hasattr(msg, "content") and not msg.content.strip().startswith("{"):
                assistant_message = msg.content
                break

        prompt = f"""
        You are a travel assistant AI. Based on the user's query and assistant response,
        generate 3–5 follow-up questions that would be natural next steps.

        USER QUERY: "{user_query}"
        ASSISTANT RESPONSE: "{assistant_message}"
        CONTEXT: {context_info}
        RESPONSE TYPE: {response_type}

        Return ONLY a JSON array of strings like:
        ["Find hotels nearby", "Add more adventure activities"]
        """

        response = llm.invoke(prompt)
        text = response.content.strip()

        if text.startswith("[") and text.endswith("]"):
            follow_ups = json.loads(text)
        else:
            follow_ups = [
                "Tell me more about accommodations",
                "What's the best time to visit?",
                "Show transport options",
                "Suggest local foods",
                "Any nearby attractions?"
            ]

        if detected_lang != "en":
            translated = []
            for q in follow_ups[:5]:
                try:
                    translated.append(translate_to_language(q, detected_lang))
                except:
                    translated.append(q)
            return translated

        return follow_ups[:5]

    except Exception as e:
        print(f"⚠️ Follow-up generation error: {e}")
        fallback = [
            "Tell me more about this place",
            "What are the top attractions?",
            "Show food recommendations",
            "When is the best time to visit?",
            "Transportation options available?"
        ]
        if detected_lang != "en":
            try:
                return [translate_to_language(q, detected_lang) for q in fallback]
            except:
                return fallback
        return fallback



# --- Flask Application ---
app = Flask(__name__)
CORS(app)


@app.route("/api/chat", methods=["POST"])
def chat_endpoint():
    try:
        data = request.get_json()
        user_query = data.get("query", "")

        if not user_query:
            return jsonify({"response_type": "chat", "message": "Please provide a query."}), 400

        print(f"\n🆕 New Request: {user_query}")

        # Step 1: Translate user query → English
        detected_lang, query_en = translate_auto_to_english(user_query)
        print(f"🌐 Detected: {detected_lang} | English Query: {query_en}")

        # Step 2: Run LangGraph pipeline
        final_state = langgraph_app.invoke({
            "messages": [HumanMessage(content=query_en)],
            "user_query": query_en
        })
        print("✅ LangGraph execution complete.")

        # Step 3: Extract actual LLM-generated assistant message
        assistant_message = ""
        for msg in reversed(final_state.get("messages", [])):
            if hasattr(msg, "content") and not msg.content.strip().startswith("{"):
                assistant_message = msg.content
                break

        if not assistant_message:
            assistant_message = "I’ve processed your travel request successfully!"

        # Step 4: Generate follow-ups dynamically
        follow_ups = generate_contextual_follow_ups(user_query, final_state, detected_lang)

        # Step 5: Detect response type
        response_type = "chat"
        if final_state.get("itinerary_plans"):
            response_type = "plans"
        elif final_state.get("flight_data"):
            response_type = "flights"
        elif final_state.get("travel_bookings"):
            response_type = "bookings"
        elif final_state.get("acomdation"):
            response_type = "acomdation"

        # Step 6: Translate LLM message back to user’s language
        translated_message = translate_to_language(assistant_message, detected_lang)

        # Step 7: Build final response JSON
        response_data = {
            "response_type": response_type,
            "message": translated_message,
            "follow_up_questions": follow_ups
        }

        # Optional: include structured data (plans, flights, etc.)
        if final_state.get("itinerary_plans"):
            response_data["plans"] = final_state["itinerary_plans"]
        elif final_state.get("flight_data"):
            response_data["flight_options"] = final_state["flight_data"]
        elif final_state.get("acomdation"):
            response_data["acomdation"] = final_state["acomdation"]
        elif final_state.get("travel_bookings"):
            response_data["travel_bookings"] = final_state["travel_bookings"]

        print(f"✅ Final Response Sent: {response_data}")
        return jsonify(response_data)

    except Exception as e:
        print(f"🔥 Global Error: {e}")
        return jsonify({
            "response_type": "error",
            "message": "Unexpected server error occurred. Please try again.",
            "follow_up_questions": [
                "Plan a trip",
                "Find flight options",
                "Get hotel recommendations",
                "Explore destinations",
                "Suggest weekend getaways"
            ]
        }), 500


@app.route('/api/enhance', methods=['POST', 'OPTIONS'])
def enhance():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight passed'}), 200

    data = request.get_json(silent=True) or {}
    print("\n📩 Incoming Enhance Request Data:")
    print(json.dumps(data, indent=2))
    import asyncio

    try:
        # --- Extract fields from request ---
        plan_details = data.get("plan_details")
        user_query = data.get("query_en")  # from /api/chat
        user_enhance_query = data.get("user_enhance")  # user’s custom text input
        card_index = data.get("card_index")

        if not all([plan_details, user_query, user_enhance_query]):
            return jsonify({"error": "Missing one or more required fields (plan_details, query_en, user_enhance)"}), 400

        # --- Merge enhance query + user query ---
        new_enhance_query = f"{user_enhance_query} {user_query}"
        print(f"\n🧠 Combined Enhance Query:\n{new_enhance_query}\n")

        # --- Step 1: Get structured trip intent ---
        trip1 = get_structured_trip_details(new_enhance_query)
        print("\n✅ Step 1: Structured Trip Intent Extracted\n")
        print(trip1.model_dump_json(indent=2))

        # --- Step 2: Destination + Spots + Hotels ---
        step2 = asyncio.run(run_step2(trip1.model_dump()))
        print("\n✅ Step 2 Output (Spots & Hotels):\n")
        print(json.dumps(step2, indent=2))

        # --- Step 3: Distance + Cost Estimation ---
        step3 = asyncio.run(process_spots(step2))
        print("\n✅ Step 3 Output (Processed Spots):\n")
        print(json.dumps(step3, indent=2))

        # --- Step 4: Optimize Itinerary with LLM ---
        python_output = optimize_day_plan(step2, step3)
        final_itinerary = format_itinerary_with_llm(
            python_output, new_enhance_query, plan_details
        )

        # ✅ Handle both dict and list outputs safely
        if isinstance(final_itinerary, dict):
            final_itinerary["card_index"] = card_index
        elif isinstance(final_itinerary, list):
            for item in final_itinerary:
                if isinstance(item, dict):
                    item["card_index"] = card_index

        print("\n✅ Step 3-4 Complete\n")

        print("✅ step 4-5-6 weather added ✅")
        value = asyncio.run(run_itinerary_pipeline(final_itinerary))

        # Also safely attach card index to the returned value
        if isinstance(value, dict):
            value["card_index"] = card_index
        elif isinstance(value, list):
            for item in value:
                if isinstance(item, dict):
                    item["card_index"] = card_index

        print(json.dumps(value, indent=2))
        return jsonify(value), 200

    except Exception as e:
        print("\n❌ ERROR in Enhance Pipeline:", str(e))
        return jsonify({"error": str(e)}), 500  




@app.route('/api/bus-routes', methods=['POST', 'OPTIONS'])
def get_bus_routes():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight passed'}), 200
    
    try:
        data = request.get_json(silent=True) or {}
        print("\n📩 Incoming Bus Routes Request:")
        print(json.dumps(data, indent=2))
        
        # Extract required fields
        origin = data.get('origin', '').strip()
        destination = data.get('destination', '').strip()
        departure_date = data.get('departure_date')  # Optional
        
        if not origin or not destination:
            return jsonify({
                "error": "Both origin and destination are required",
                "success": False
            }), 400
        
        print(f"🚌 Searching bus routes from {origin} to {destination}")
        
        # Convert departure_date to timestamp if provided
        departure_time = None
        if departure_date:
            try:
                from datetime import datetime
                # Assuming date format is YYYY-MM-DD
                date_obj = datetime.strptime(departure_date, '%Y-%m-%d')
                departure_time = int(date_obj.timestamp())
            except ValueError:
                print(f"⚠️ Invalid date format: {departure_date}")
        
        # Call the bus routes function
        routes_result = get_bus_routes_json(origin, destination, departure_time)
        
        # Check if result is an error
        if isinstance(routes_result, dict) and "error" in routes_result:
            return jsonify({
                "success": False,
                "error": routes_result["error"],
                "routes": []
            }), 200
        
        # Parse the JSON string result
        if isinstance(routes_result, str):
            try:
                routes_data = json.loads(routes_result)
            except json.JSONDecodeError:
                return jsonify({
                    "success": False,
                    "error": "Failed to parse bus routes data",
                    "routes": []
                }), 500
        else:
            routes_data = routes_result
        
        # Transform the data to match frontend expectations
        transformed_routes = []
        route_id = 1
        
        for route_key, route_info in routes_data.items():
            # Extract bus information
            buses = []
            bus_count = 1
            while f"BUS {bus_count}" in route_info:
                bus_data = route_info[f"BUS {bus_count}"]
                buses.append({
                    "operator": bus_data.get("name", f"Bus {bus_count}"),
                    "from": bus_data.get("route", "").split(" → ")[0] if " → " in bus_data.get("route", "") else route_info.get("start", ""),
                    "to": bus_data.get("route", "").split(" → ")[1] if " → " in bus_data.get("route", "") else route_info.get("destination", ""),
                    "trip_time": bus_data.get("bus_trip_time", "")
                })
                bus_count += 1
            
            # If no buses found, create a default one
            if not buses:
                buses.append({
                    "operator": "Bus Service",
                    "from": route_info.get("start", origin),
                    "to": route_info.get("destination", destination),
                    "trip_time": route_info.get("time_for_trip", "")
                })
            
            transformed_route = {
                "id": route_id,
                "routeName": f"{route_info.get('start', origin)} to {route_info.get('destination', destination)}",
                "duration": route_info.get("time_for_trip", "N/A"),
                "type": route_info.get("type", "Bus Route"),
                "buses": buses,
                "price": 450 + (route_id * 50),  # Mock pricing
                "departureTime": "08:00 AM",  # Mock time
                "arrivalTime": "02:00 PM"  # Mock time
            }
            
            transformed_routes.append(transformed_route)
            route_id += 1
        
        response_data = {
            "success": True,
            "routes": transformed_routes,
            "total_routes": len(transformed_routes),
            "search_params": {
                "origin": origin,
                "destination": destination,
                "departure_date": departure_date
            }
        }
        
        print(f"✅ Found {len(transformed_routes)} bus routes")
        return jsonify(response_data), 200
        
    except Exception as e:
        print(f"❌ Error in bus routes endpoint: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Internal server error: {str(e)}",
            "routes": []
        }), 500


# --- AMADEUS API HELPER FUNCTIONS ---
def get_amadeus_token(client_id, client_secret):
    """Obtains the OAuth2 access token from Amadeus."""
    try:
        token_headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        token_data = {'grant_type': 'client_credentials', 'client_id': client_id, 'client_secret': client_secret}
        token_url = 'https://test.api.amadeus.com/v1/security/oauth2/token'
        token_response = requests.post(token_url, headers=token_headers, data=token_data)
        token_response.raise_for_status()
        return token_response.json().get('access_token')
    except requests.exceptions.RequestException as e:
        print(f"❌ Error getting access token: {e}")
        return None

def get_iata_code_for_city(access_token, city_name):
    """Uses the Amadeus Location API to find the IATA code for a given city name."""
    if not access_token: return None
    iata_headers = {'Authorization': f'Bearer {access_token}'}
    iata_params = {
        'keyword': city_name,
        'subType': 'CITY,AIRPORT',
        'page[limit]': 1,
        'view': 'FULL'
    }
    location_search_url = 'https://test.api.amadeus.com/v1/reference-data/locations'
    try:
        iata_response = requests.get(location_search_url, headers=iata_headers, params=iata_params)
        iata_response.raise_for_status()
        data = iata_response.json().get('data')
        return data[0].get('iataCode') if data and len(data) > 0 else None
    except requests.exceptions.RequestException as e:
        print(f"❌ Error during IATA code lookup for {city_name}: {e}")
        return None

@app.route('/api/flights', methods=['POST', 'OPTIONS'])
def search_flights():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight passed'}), 200
    
    try:
        data = request.get_json(silent=True) or {}
        print("\n✈️ Incoming Flight Search Request:")
        print(json.dumps(data, indent=2))
        
        # Extract required fields
        origin = data.get('from', '').strip()
        destination = data.get('to', '').strip()
        departure_date = data.get('departure', '').strip()
        passengers = data.get('passengers', '1')
        travel_class = data.get('class', 'economy')
        
        if not all([origin, destination, departure_date]):
            return jsonify({
                "success": False,
                "error": "Origin, destination, and departure date are required",
                "flights": []
            }), 400
        
        print(f"✈️ Searching flights from {origin} to {destination} on {departure_date}")
        
        # Amadeus API credentials (you should store these in environment variables)
        client_id = '7ft36WGf3banF9BF1MvojU1NdEirPB6e'
        client_secret = 'jdKIeW9Mt0KXOCTr'
        usd_to_inr_rate = 88.23
        
        try:
            # 1. Get Token
            token = get_amadeus_token(client_id, client_secret)
            if not token:
                raise Exception("Failed to get Amadeus access token.")
            
            # 2. Get IATA codes
            origin_iata = get_iata_code_for_city(token, origin)
            destination_iata = get_iata_code_for_city(token, destination)
            if not (origin_iata and destination_iata):
                raise Exception("Failed to find IATA codes for the cities.")
            
            # 3. Search for Flights
            flight_params = {
                'originLocationCode': origin_iata,
                'destinationLocationCode': destination_iata,
                'departureDate': departure_date,
                'adults': int(passengers),
                'currencyCode': 'USD',
                'max': 10
            }
            
            flight_headers = {'Authorization': f'Bearer {token}'}
            flight_search_url = 'https://test.api.amadeus.com/v2/shopping/flight-offers'
            flight_response = requests.get(flight_search_url, headers=flight_headers, params=flight_params)
            flight_response.raise_for_status()
            flight_data = flight_response.json().get('data', [])
            
            if not flight_data:
                # Return mock data if no real flights found
                mock_flights = [
                    {
                        "id": 1,
                        "airline": "Air India",
                        "logo": "✈️",
                        "departureTime": "09:30",
                        "arrivalTime": "12:45",
                        "duration": "3h 15m",
                        "price": "4299",
                        "from": origin,
                        "to": destination
                    },
                    {
                        "id": 2,
                        "airline": "IndiGo",
                        "logo": "✈️",
                        "departureTime": "14:20",
                        "arrivalTime": "17:35",
                        "duration": "3h 15m",
                        "price": "3899",
                        "from": origin,
                        "to": destination
                    }
                ]
                return jsonify({
                    "success": True,
                    "flights": mock_flights,
                    "total_flights": len(mock_flights),
                    "search_params": {
                        "from": origin,
                        "to": destination,
                        "departure": departure_date,
                        "passengers": passengers,
                        "class": travel_class
                    }
                }), 200
            
            # 4. Process and Structure Results
            structured_flights = []
            for i, offer in enumerate(flight_data[:10]):
                try:
                    price_usd = float(offer['price']['grandTotal'])
                    price_inr = price_usd * usd_to_inr_rate
                    
                    itinerary = offer['itineraries'][0]
                    segments = itinerary['segments']
                    first_segment = segments[0]
                    last_segment = segments[-1]
                    
                    # Extract airline name (you might want to create a mapping)
                    carrier_code = first_segment['carrierCode']
                    airline_names = {
                        'AI': 'Air India', '6E': 'IndiGo', 'SG': 'SpiceJet',
                        'UK': 'Vistara', 'I5': 'AirAsia India', 'G8': 'GoAir'
                    }
                    airline_name = airline_names.get(carrier_code, f'{carrier_code} Airlines')
                    
                    structured_flight = {
                        "id": i + 1,
                        "airline": airline_name,
                        "logo": "✈️",
                        "departureTime": first_segment['departure']['at'].split('T')[1][:5],
                        "arrivalTime": last_segment['arrival']['at'].split('T')[1][:5],
                        "duration": itinerary['duration'].replace('PT', '').replace('H', 'h ').replace('M', 'm'),
                        "price": str(int(price_inr)),
                        "from": origin,
                        "to": destination,
                        "flight_number": f"{carrier_code}{first_segment['number']}",
                        "is_direct": len(segments) == 1
                    }
                    
                    structured_flights.append(structured_flight)
                except Exception as e:
                    print(f"Error processing flight offer {i}: {e}")
                    continue
            
            response_data = {
                "success": True,
                "flights": structured_flights,
                "total_flights": len(structured_flights),
                "search_params": {
                    "from": origin,
                    "to": destination,
                    "departure": departure_date,
                    "passengers": passengers,
                    "class": travel_class
                }
            }
            
            print(f"✅ Found {len(structured_flights)} flights")
            return jsonify(response_data), 200
            
        except Exception as api_error:
            print(f"❌ Amadeus API Error: {str(api_error)}")
            # Fallback to mock data
            mock_flights = [
                {
                    "id": 1,
                    "airline": "Air India",
                    "logo": "✈️",
                    "departureTime": "09:30",
                    "arrivalTime": "12:45",
                    "duration": "3h 15m",
                    "price": "4299",
                    "from": origin,
                    "to": destination
                },
                {
                    "id": 2,
                    "airline": "IndiGo",
                    "logo": "✈️",
                    "departureTime": "14:20",
                    "arrivalTime": "17:35",
                    "duration": "3h 15m",
                    "price": "3899",
                    "from": origin,
                    "to": destination
                }
            ]

            ans = {
                "success": True,
                "flights": mock_flights,
                "total_flights": len(mock_flights),
                "search_params": {
                    "from": origin,
                    "to": destination,
                    "departure": departure_date,
                    "passengers": passengers,
                    "class": travel_class
                },
                "note": "Using fallback data due to API limitations"
            }

            print(ans)
            return jsonify(ans), 200
        
    except Exception as e:
        print(f"❌ Error in flight search endpoint: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Internal server error: {str(e)}",
            "flights": []
        }), 500

@app.route('/api/hotels', methods=['POST', 'OPTIONS'])
def search_hotels():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight passed'}), 200
    
    try:
        data = request.get_json(silent=True) or {}
        print("\n🏨 Incoming Hotel Search Request:")
        print(json.dumps(data, indent=2))
        
        # Extract required fields
        city = data.get('city', '').strip()
        check_in = data.get('checkIn', '').strip()
        check_out = data.get('checkOut', '').strip()
        guests = data.get('guests', '2')
        rooms = data.get('rooms', '1')
        
        if not city:
            return jsonify({
                "success": False,
                "error": "City is required for hotel search",
                "hotels": []
            }), 400
        
        print(f"🏨 Searching hotels in {city}")
        
        try:
            # Use the existing hotel search function
            hotels_data = find_best_nearby_hotels(city, radius=5000, limit=10)
            
            if not hotels_data:
                # Fallback to mock data
                mock_hotels = [
                    {
                        "id": 1,
                        "name": f"Grand Hotel {city}",
                        "rating": 4.5,
                        "address": f"Central {city}, Near Railway Station",
                        "price": 3500,
                        "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
                        "amenities": ["Free WiFi", "Swimming Pool", "Restaurant", "Gym"],
                        "website": "https://example.com",
                        "mapLink": "https://maps.google.com",
                        "description": "Luxury hotel in the heart of the city",
                        "reviews": 1250
                    },
                    {
                        "id": 2,
                        "name": f"Comfort Inn {city}",
                        "rating": 4.2,
                        "address": f"Business District, {city}",
                        "price": 2800,
                        "image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400",
                        "amenities": ["Free WiFi", "Breakfast", "Parking", "AC"],
                        "website": "https://example.com",
                        "mapLink": "https://maps.google.com",
                        "description": "Comfortable stay with modern amenities",
                        "reviews": 890
                    }
                ]
                
                return jsonify({
                    "success": True,
                    "hotels": mock_hotels,
                    "total_hotels": len(mock_hotels),
                    "search_params": {
                        "city": city,
                        "checkIn": check_in,
                        "checkOut": check_out,
                        "guests": guests,
                        "rooms": rooms
                    },
                    "note": "Using fallback data"
                }), 200
            
            # Transform Google Places data to match frontend expectations
            structured_hotels = []
            for i, hotel in enumerate(hotels_data):
                # Generate mock pricing based on rating
                base_price = 2000
                rating_multiplier = hotel.get('Rating', 3.0) / 3.0
                price = int(base_price * rating_multiplier) + (i * 200)
                
                structured_hotel = {
                    "id": i + 1,
                    "name": hotel.get('Name', f'Hotel {i+1}'),
                    "rating": hotel.get('Rating', 4.0),
                    "address": hotel.get('Address', f'{city}, India'),
                    "price": price,
                    "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
                    "amenities": ["Free WiFi", "Restaurant", "Room Service", "AC"],
                    "website": hotel.get('Website', 'N/A'),
                    "mapLink": hotel.get('Google Maps Link', 'N/A'),
                    "description": f"Quality accommodation in {city}",
                    "reviews": 500 + (i * 100)
                }
                
                structured_hotels.append(structured_hotel)
            
            response_data = {
                "success": True,
                "hotels": structured_hotels,
                "total_hotels": len(structured_hotels),
                "search_params": {
                    "city": city,
                    "checkIn": check_in,
                    "checkOut": check_out,
                    "guests": guests,
                    "rooms": rooms
                }
            }
            
            print(f"✅ Found {len(structured_hotels)} hotels")
            return jsonify(response_data), 200
            
        except Exception as api_error:
            print(f"❌ Hotel API Error: {str(api_error)}")
            # Fallback to mock data
            mock_hotels = [
                {
                    "id": 1,
                    "name": f"Grand Hotel {city}",
                    "rating": 4.5,
                    "address": f"Central {city}, Near Railway Station",
                    "price": 3500,
                    "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
                    "amenities": ["Free WiFi", "Swimming Pool", "Restaurant", "Gym"],
                    "website": "https://example.com",
                    "mapLink": "https://maps.google.com",
                    "description": "Luxury hotel in the heart of the city",
                    "reviews": 1250
                }
            ]
            return jsonify({
                "success": True,
                "hotels": mock_hotels,
                "total_hotels": len(mock_hotels),
                "search_params": {
                    "city": city,
                    "checkIn": check_in,
                    "checkOut": check_out,
                    "guests": guests,
                    "rooms": rooms
                },
                "note": "Using fallback data due to API limitations"
            }), 200
        
    except Exception as e:
        print(f"❌ Error in hotel search endpoint: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Internal server error: {str(e)}",
            "hotels": []
        }), 500

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "service": "Travel Planner API"})


if __name__ == "__main__":
    print("\n🚀 Starting Travel Planner Backend (Translation + LLM Message Enabled)")
    print("➡ Listening at: http://0.0.0.0:5001/api/chat")
    app.run(host="0.0.0.0", port=5001, debug=True)
