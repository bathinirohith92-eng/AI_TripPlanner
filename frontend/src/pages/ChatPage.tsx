import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Send,
  Loader2,
  ArrowLeft,
  Heart,
  Scale,
  Map,
  Bus,
  MapPin,
  Plane,
  Menu,
  X,
  Sparkles,
  MessageSquare,
  Bot,
  Hotel,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";

import ChatMessage from "@/components/ChatMessage";
import ItineraryCard from "@/components/ItineraryCard";
import ItineraryDetailSheet from "@/components/ItineraryDetailSheet";
import AnimatedMapView from "@/components/AnimatedMapView";
import SuccessModal from "@/components/SuccessModal";
import FlightCard from "@/components/FlightCard";
import AccommodationCard from "@/components/AccommodationCard";
import BusCard from "@/components/BusCard";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getConversations,
  saveConversation,
  type Conversation,
  type Message,
} from "@/lib/localStorage";

// --- START: Define Itinerary Types and Mock Data ---
interface OptimizedSpot {
  spot_name: string;
  lat: number;
  long: number;
  description: string;
  estimated_time_spent: string;
  weather: string;
}

interface OptimizedRoute {
  optimized_order: OptimizedSpot[];
  polyline: string;
}

// Map of "Day X" to its route
type OptimizedRoutes = Record<string, OptimizedRoute>;

interface BackendPlan {
  trip_details: {
    trip_name: string;
    itinerary_name: string;
    start_date: string;
    end_date: string;
    duration_days: number;
    destination: string;
  };
  hotel: {
    name: string;
    lat: number;
    lng: number;
    rating: number;
    types: string[];
    open_now: boolean;
  };
  optimized_routes: OptimizedRoutes;
  itinerary: Record<string, OptimizedSpot[]>;
}

// Simplified Itinerary structure for the UI component
interface Itinerary {
  title: string;
  duration: string; // e.g., "5 Days"
  budget?: string; // Placeholder or derived
  short_desc: string; // Derived from trip_details
  highlights: string[]; // Derived from optimized_routes
  optimized_routes: OptimizedRoutes;
  durationDays: number; // For easy use in cards
  trip_details?: BackendPlan["trip_details"];
  hotel?: BackendPlan["hotel"];
}

interface FlightOption {
  // Added FlightOption interface
  id: string;
  carrier: string;
  flight_number: string;
  departure_time: string;
  arrival_time: string;
  origin_iata: string;
  destination_iata: string;
  duration: string;
  price_inr: number;
  is_direct: boolean;
}

interface BusRoute {
  route_no: number;
  bus_type: string;
  start_address: string;
  end_address: string;
  distance: string;
  duration: string;
  estimated_price: string;
}

interface BusResponse {
  origin: string;
  destination: string;
  routes_found: number;
  routes: BusRoute[];
}

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get("query") || "";
  const [messages, setMessages] = useState<Message[]>([]);
  // Remove separate card states - integrate into message flow
  const [input, setInput] = useState(initialQuery);
  const [showItineraries, setShowItineraries] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [realItineraries, setRealItineraries] = useState<Itinerary[]>([]);
  const [flightOptions, setFlightOptions] = useState<FlightOption[]>([]);
  const [showFlights, setShowFlights] = useState(false);
  const [busResponse, setBusResponse] = useState<BusResponse | null>(null);
  const [showBusRoutes, setShowBusRoutes] = useState(false);
  const [enhancingBusCards, setEnhancingBusCards] = useState<Set<number>>(
    new Set()
  );
  const [accommodations, setAccommodations] = useState<
    Array<{
      Name: string;
      Address: string;
      Rating: number;
      Website: string;
      "Google Maps Link": string;
    }>
  >([]);
  const [showAccommodations, setShowAccommodations] = useState(false);
  const [enhancingAccommodationCards, setEnhancingAccommodationCards] =
    useState<Set<number>>(new Set());
  const [tripData] = useState({
    destination: "",
    duration: "",
    type: "",
    budget: "",
  });
  const [selectedItinerary, setSelectedItinerary] = useState<number | null>(
    null
  );
  const [selectedItineraryData, setSelectedItineraryData] =
    useState<Itinerary | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [mapViewItineraries, setMapViewItineraries] = useState<Itinerary[]>([]);
  const [likedPlans, setLikedPlans] = useState<number[]>([]);
  const [comparePlans, setComparePlans] = useState<number[]>([]);
  const [likedItineraries, setLikedItineraries] = useState<Itinerary[]>([]);
  const [compareItineraries, setCompareItineraries] = useState<Itinerary[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [trendingScores, setTrendingScores] = useState<Record<string, number>>(
    {}
  );
  const [showLikedPopup, setShowLikedPopup] = useState(false);
  const [showComparePopup, setShowComparePopup] = useState(false);
  const [enhancingCards, setEnhancingCards] = useState<Set<number>>(new Set());
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const baseHotQueries = [
    "5-day adventure in Leh Ladakh",
    "Romantic week in Goa beaches",
    "Cultural tour of Rajasthan",
    "Spiritual journey to Varanasi",
    "Beach paradise in Andaman",
  ];

  const hotQueries = [...baseHotQueries].sort(
    (a, b) => (trendingScores[b] || 0) - (trendingScores[a] || 0)
  );

  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([
    "Tell me more about accommodations",
    "What's the best time to visit?",
    "Show transport options",
    "Suggest local foods",
    "Any nearby attractions?",
  ]);

  const loadingMessages = [
    "Translating user language → English",
    "Started planning",
    "Finding the best places",
    "Checking weather",
    "Stitching the plans",
    "Translating back to user language",
    "Perfect plans found!",
  ];

  useEffect(() => {
    setConversations(getConversations().slice(0, 3));

    const destination = searchParams.get("destination");
    const query = searchParams.get("query");
    const type = searchParams.get("type");

    // Only auto-execute for destination and type params, not for query from landing page
    if (destination || type) {
      const initialQuery = destination || `Plan a ${type} trip`;
      handleSendMessage(initialQuery);
    } else {
      // No welcome message - start with clean chat
    }

    if (!currentConversationId) {
      setCurrentConversationId(Date.now().toString());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 1 && currentConversationId) {
      const userMessages = messages.filter((m) => m.role === "user");
      const firstUserMessage = userMessages[0]?.content || "New Trip";

      const conversation: Conversation = {
        id: currentConversationId,
        title: tripData.destination
          ? `${tripData.destination} Trip`
          : firstUserMessage.slice(0, 50),
        messages,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      saveConversation(conversation);
      setConversations(getConversations().slice(0, 3));
    }
  }, [messages, currentConversationId, tripData.destination]);

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const addAssistantMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const handleSendMessage = async (text?: string) => {
    if (isLoading) return;
    const messageText = text || input.trim();
    if (!messageText) return;

    // Check word limit
    const wordCount = messageText
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    if (wordCount > 1200) {
      alert("Message exceeds 1200 word limit. Please shorten your message.");
      return;
    }

    addUserMessage(messageText);
    setInput("");

    const isPlanQuery =
      messageText.toLowerCase().includes("plan") ||
      messageText.toLowerCase().includes("itinerary") ||
      messageText.toLowerCase().includes("trip");

    if (isPlanQuery) {
      setIsLoading(true);
      setLoadingStep(0);
    } else {
      setIsLoading(true);
    }

    // Keep existing cards visible - don't reset them on new messages

    try {
      let loadingInterval: NodeJS.Timeout | undefined;

      if (isPlanQuery) {
        loadingInterval = setInterval(() => {
          setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
        }, 500);
      }

      const response = await fetch("http://127.0.0.1:5001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: messageText }),
      });

      if (loadingInterval) {
        clearInterval(loadingInterval);
      }

      const data = await response.json();
      console.log("Backend Response:", data);

      if (data.follow_up_questions && Array.isArray(data.follow_up_questions)) {
        setFollowUpQuestions(data.follow_up_questions);
      }

      if (data.message) {
        addAssistantMessage(data.message);
      } else {
        addAssistantMessage(
          "⚠️ Sorry, I didn't get a clear message from the server."
        );
      }

      if (
        data.response_type === "plans" &&
        data.plans &&
        Array.isArray(data.plans)
      ) {
        const mappedItineraries: Itinerary[] = data.plans
          .filter((plan: BackendPlan) => plan.optimized_routes)
          .map((plan: BackendPlan, index: number) => {
            const days = Object.keys(plan.optimized_routes);
            const durationDays =
              plan.trip_details?.duration_days || days.length;

            const highlights = days.map((dayKey) => {
              const firstSpot =
                plan.optimized_routes[dayKey].optimized_order[0];
              return firstSpot ? `${dayKey}: ${firstSpot.spot_name}` : dayKey;
            });

            return {
              title:
                plan.trip_details?.itinerary_name ||
                `Plan ${index + 1}: ${
                  plan.trip_details?.destination || "Trip"
                }`,
              duration: durationDays
                ? `${durationDays} Days`
                : `${days.length} Days`,
              durationDays: durationDays,
              budget: "Custom",
              short_desc:
                plan.trip_details?.trip_name || "Generated Custom Trip Plan",
              highlights: highlights.slice(0, 4) || [],
              optimized_routes: plan.optimized_routes,
            };
          });

        // Add itinerary cards to the last assistant message
        setRealItineraries(mappedItineraries);
        setShowItineraries(true);

        // Update the last assistant message to include cards
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.role === "assistant") {
            const updatedMessage = {
              ...lastMessage,
              content: `📋 Here are ${mappedItineraries.length} itinerary options for you:`,
              cards: {
                type: "itinerary" as const,
                data: mappedItineraries,
              },
            };
            return [...prev.slice(0, -1), updatedMessage];
          }
          return prev;
        });
      } else if (data.response_type === "flights" && data.flight_options) {
        console.log("Flight Data Received:", data.flight_options);

        // Sort flights by duration (shortest first)
        const sortedFlights = [...data.flight_options].sort((a, b) => {
          // Extract hours and minutes from duration string (e.g., "2h 30m")
          const parseTime = (duration: string) => {
            const hours = duration.match(/(\d+)h/)?.[1] || "0";
            const minutes = duration.match(/(\d+)m/)?.[1] || "0";
            return parseInt(hours) * 60 + parseInt(minutes);
          };

          return parseTime(a.duration) - parseTime(b.duration);
        });

        setFlightOptions(sortedFlights);
        setShowFlights(true);

        // Update the last assistant message to include flight cards
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.role === "assistant") {
            const updatedMessage = {
              ...lastMessage,
              content: `✈️ Here are ${data.flight_options.length} flight options for you:`,
              cards: {
                type: "flight" as const,
                data: data.flight_options,
              },
            };
            return [...prev.slice(0, -1), updatedMessage];
          }
          return prev;
        });
      } else if (data.response_type === "bookings" && data.travel_bookings) {
        console.log("Bus Routes Data Received:", data.travel_bookings);

        try {
          // Parse travel_bookings if it's a string
          let busData;
          try {
            busData =
              typeof data.travel_bookings === "string"
                ? JSON.parse(data.travel_bookings)
                : data.travel_bookings;
          } catch (parseError) {
            console.error("Error parsing travel_bookings:", parseError);
            addAssistantMessage("⚠️ Error parsing bus data. Please try again.");
            return;
          }

          // Transform the bus data to match BusCard component interface
          const transformedBusData = {
            routes: Object.entries(busData).map(
              ([routeKey, routeData]: [string, any], index) => ({
                // Properties expected by BusCard
                route_no: index + 1,
                bus_type: routeData.type || "Direct Bus",
                start_address:
                  routeData["BUS 1"]?.route?.split(" → ")[0] || routeData.start,
                end_address:
                  routeData["BUS 1"]?.route?.split(" → ")[1] ||
                  routeData.destination,
                distance: "N/A", // Not provided in backend data
                duration: routeData.time_for_trip || "8 hours",
                estimated_price:
                  routeData.type === "Direct Bus" ? "₹450" : "₹380",

                // Additional properties for compatibility
                id: index + 1,
                routeName: `${routeData.start} to ${routeData.destination}`,
                start: routeData.start,
                destination: routeData.destination,
                time_for_trip: routeData.time_for_trip,
                type: routeData.type || "Bus Route",
                buses: [
                  {
                    operator:
                      routeData["BUS 1"]?.name ||
                      routeData.BUS1?.name ||
                      "Bus Service",
                    from:
                      routeData["BUS 1"]?.route?.split(" → ")[0] ||
                      routeData.start,
                    to:
                      routeData["BUS 1"]?.route?.split(" → ")[1] ||
                      routeData.destination,
                    trip_time:
                      routeData["BUS 1"]?.bus_trip_time ||
                      routeData.time_for_trip,
                  },
                  ...(routeData["BUS 2"] || routeData.BUS2
                    ? [
                        {
                          operator:
                            routeData["BUS 2"]?.name ||
                            routeData.BUS2?.name ||
                            "Connecting Bus",
                          from:
                            routeData["BUS 2"]?.route?.split(" → ")[0] ||
                            "Transfer Point",
                          to:
                            routeData["BUS 2"]?.route?.split(" → ")[1] ||
                            routeData.destination,
                          trip_time:
                            routeData["BUS 2"]?.bus_trip_time || "2 hours",
                        },
                      ]
                    : []),
                ],
              })
            ),
          };

          console.log("Transformed Bus Data:", transformedBusData);
          console.log("Number of routes:", transformedBusData.routes.length);

          // Debug each route's buses
          transformedBusData.routes.forEach((route, index) => {
            console.log(`Route ${index + 1} buses:`, route.buses);
            console.log(`Route ${index + 1} type:`, route.bus_type);
          });

          // Validate the transformed data
          if (
            !transformedBusData.routes ||
            transformedBusData.routes.length === 0
          ) {
            console.error("No bus routes found after transformation");
            addAssistantMessage(
              "Sorry, no bus routes were found for your search."
            );
            return;
          }

          setBusResponse(transformedBusData);
          setShowBusRoutes(true);

          // Add bus cards to the last assistant message
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.role === "assistant") {
              const updatedMessage = {
                ...lastMessage,
                content: `🚌 Here are ${transformedBusData.routes.length} bus route options:`,
                cards: {
                  type: "bus" as const,
                  data: transformedBusData.routes,
                },
              };
              return [...prev.slice(0, -1), updatedMessage];
            }
            return prev;
          });
        } catch (transformError) {
          console.error("Error transforming bus data:", transformError);
          addAssistantMessage(
            "⚠️ Error processing bus data. Please try again."
          );
        }
      } else if (data.response_type === "acomdation" && data.acomdation) {
        console.log("Accommodation Data Received:", data.acomdation);
        setAccommodations(data.acomdation);
        setShowAccommodations(true);

        // Add cards to the last assistant message instead of creating a new one
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.role === "assistant") {
            // Update the last assistant message to include cards
            const updatedMessage = {
              ...lastMessage,
              content: `🏨 Here are ${data.acomdation.length} accommodation options for you:`,
              cards: {
                type: "accommodation" as const,
                data: data.acomdation,
              },
            };
            return [...prev.slice(0, -1), updatedMessage];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("Chat API Error:", error);
      addAssistantMessage(
        "⚠️ Connection error. Please ensure Flask server is running on http://127.0.0.1:5001."
      );
    } finally {
      setIsLoading(false);
      setLoadingStep(0);
    }
  };

  const handleEnhancePlan = async (cardIndex: number, customInput: string) => {
    const planToEnhance = realItineraries[cardIndex];
    if (!planToEnhance) return;

    // Set loading state for this specific card
    setEnhancingCards((prev) => new Set([...prev, cardIndex]));

    try {
      // Convert our itinerary structure to backend expected format
      const planDetails = {
        trip_details: planToEnhance.trip_details || {
          trip_name: planToEnhance.short_desc || planToEnhance.title,
          itinerary_name: planToEnhance.title,
          start_date: new Date().toISOString().split("T")[0],
          end_date: new Date(
            Date.now() + (planToEnhance.durationDays || 1) * 24 * 60 * 60 * 1000
          )
            .toISOString()
            .split("T")[0],
          duration_days: planToEnhance.durationDays || 1,
          destination: planToEnhance.title,
        },
        hotel: planToEnhance.hotel || null,
        optimized_routes: planToEnhance.optimized_routes || {},
        itinerary: planToEnhance.optimized_routes
          ? Object.fromEntries(
              Object.entries(planToEnhance.optimized_routes).map(
                ([day, route]) => [day, route.optimized_order || []]
              )
            )
          : {},
      };

      const requestBody = {
        plan_details: planDetails,
        query_en: messages.find((m) => m.role === "user")?.content || "",
        user_enhance: customInput,
        card_index: cardIndex,
      };

      console.log("Enhancement Request:", requestBody);

      const response = await fetch("http://127.0.0.1:5001/api/enhance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("Enhancement Response:", data);

      // Handle different response formats
      let enhancedPlan;
      if (data && Array.isArray(data) && data.length > 0) {
        // Response is an array
        enhancedPlan = data[0];
      } else if (data && typeof data === "object" && !Array.isArray(data)) {
        // Response is a single object
        enhancedPlan = data;
      } else {
        console.error("Unexpected response format:", data);
        throw new Error("Invalid response format");
      }

      console.log("Enhanced Plan Structure:", enhancedPlan);

      // Process the enhanced plan if we have valid data
      if (enhancedPlan) {
        // Update the specific card with enhanced data
        setRealItineraries((prev) => {
          const updated = [...prev];
          console.log("Updating card at index:", cardIndex);
          console.log("Previous itineraries:", prev);

          // Convert itinerary back to optimized_routes format
          const optimizedRoutes: Record<string, OptimizedRoute> = {};
          if (enhancedPlan.itinerary) {
            Object.entries(enhancedPlan.itinerary).forEach(
              ([day, spots]: [string, OptimizedSpot[]]) => {
                optimizedRoutes[day] = {
                  optimized_order: spots || [],
                  polyline: "",
                };
              }
            );
          } else if (enhancedPlan.optimized_routes) {
            // Handle case where response already has optimized_routes
            Object.assign(optimizedRoutes, enhancedPlan.optimized_routes);
          } else {
            // Keep existing routes if no new ones provided
            Object.assign(
              optimizedRoutes,
              planToEnhance.optimized_routes || {}
            );
          }

          // Map the enhanced plan to our Itinerary structure
          const days = Object.keys(optimizedRoutes);
          const durationDays =
            enhancedPlan.trip_details?.duration_days ||
            days.length ||
            planToEnhance.durationDays;

          const highlights = days.map((dayKey) => {
            const firstSpot = optimizedRoutes[dayKey]?.optimized_order?.[0];
            return firstSpot ? `${dayKey}: ${firstSpot.spot_name}` : dayKey;
          });

          const updatedCard = {
            title:
              enhancedPlan.trip_details?.itinerary_name || planToEnhance.title,
            duration: durationDays
              ? `${durationDays} Days`
              : `${days.length} Days`,
            durationDays: durationDays,
            budget: planToEnhance.budget || "Custom",
            short_desc:
              enhancedPlan.trip_details?.trip_name ||
              "Enhanced Custom Trip Plan",
            highlights:
              highlights.slice(0, 4) || planToEnhance.highlights || [],
            optimized_routes: optimizedRoutes,
            trip_details:
              enhancedPlan.trip_details || planToEnhance.trip_details,
            hotel: enhancedPlan.hotel || planToEnhance.hotel,
          };

          updated[cardIndex] = updatedCard;
          console.log("Updated card:", updatedCard);
          console.log("Updated itineraries:", updated);

          return updated;
        });

        // Force a re-render by updating a timestamp
        setTimeout(() => {
          console.log("Force re-render triggered");
        }, 100);

        // Add success message
        addAssistantMessage(
          `✨ Your plan "${planToEnhance.title}" has been enhanced with your preferences! Check the updated card above.`
        );

        console.log("Enhancement completed successfully");
      } else {
        console.error("No valid enhanced plan data received:", data);
        addAssistantMessage(
          `⚠️ Sorry, I couldn't enhance the plan. ${
            data.message || "Please try again."
          }`
        );
      }
    } catch (error) {
      console.error("Enhancement API Error:", error);
      addAssistantMessage(
        "⚠️ Connection error during enhancement. Please ensure Flask server is running on http://127.0.0.1:5001."
      );
    } finally {
      // Remove loading state for this card
      setEnhancingCards((prev) => {
        const updated = new Set(prev);
        updated.delete(cardIndex);
        return updated;
      });
    }
  };

  const handleEnhanceBusRoute = async (
    cardIndex: number,
    customInput: string
  ) => {
    if (!busResponse || !busResponse.routes) return;

    const routeToEnhance = busResponse.routes[cardIndex];
    if (!routeToEnhance) return;

    // Set loading state for this specific bus card
    setEnhancingBusCards((prev) => new Set([...prev, cardIndex]));

    try {
      const requestBody = {
        route_details: routeToEnhance,
        user_enhance: customInput,
        card_index: cardIndex,
      };

      console.log("Bus Enhancement Request:", requestBody);

      const response = await fetch("http://127.0.0.1:5001/api/enhance-bus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("Bus Enhancement Response:", data);

      if (data && data.enhanced_bus_data) {
        // Update the bus response with enhanced data
        setBusResponse(data.enhanced_bus_data);

        // Add success message
        addAssistantMessage(
          `✨ Your bus route has been enhanced with your preferences!`
        );
      } else {
        addAssistantMessage(
          `⚠️ Sorry, I couldn't enhance the bus route. ${
            data.message || "Please try again."
          }`
        );
      }
    } catch (error) {
      console.error("Bus Enhancement API Error:", error);
      addAssistantMessage(
        "⚠️ Connection error during bus route enhancement. Please ensure Flask server is running on http://127.0.0.1:5001."
      );
    } finally {
      // Remove loading state for this card
      setEnhancingBusCards((prev) => {
        const updated = new Set(prev);
        updated.delete(cardIndex);
        return updated;
      });
    }
  };

  const handleEnhanceAccommodation = async (
    cardIndex: number,
    customInput: string
  ) => {
    const accommodationToEnhance = accommodations[cardIndex];

    if (!accommodationToEnhance) return;

    // Add to enhancing set
    setEnhancingAccommodationCards((prev) => new Set(prev).add(cardIndex));

    try {
      const enhancePrompt = `Find better hotel accommodations with these preferences: "${customInput}". 
      Current hotel: ${accommodationToEnhance.Name} at ${accommodationToEnhance.Address} 
      with rating ${accommodationToEnhance.Rating}. Please provide better alternatives.`;

      const response = await fetch("http://127.0.0.1:5001/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: enhancePrompt,
          conversation_id: currentConversationId,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.response_type === "acomdation" && data.acomdation) {
          setAccommodations(data.acomdation);
          addAssistantMessage(
            `✨ Your accommodation options have been enhanced with your preferences!`
          );
        }
      }
    } catch (error) {
      console.error("Enhancement error:", error);
      addAssistantMessage(
        "⚠️ Connection error during accommodation enhancement. Please try again."
      );
    } finally {
      // Remove from enhancing set after delay
      setTimeout(() => {
        setEnhancingAccommodationCards((prev) => {
          const newSet = new Set(prev);
          newSet.delete(cardIndex);
          return newSet;
        });
      }, 2000);
    }
  };

  const handleClearAllCards = () => {
    setRealItineraries([]);
    setShowItineraries(false);
    setFlightOptions([]);
    setShowBusRoutes(false);
    setBusResponse(null);
    setShowBusRoutes(false);
    setAccommodations([]);
    setShowAccommodations(false);
    addAssistantMessage(
      "✨ All cards have been cleared. You can start fresh with new queries!"
    );
  };

  const handleFinalizePlan = (cardIndex: number) => {
    const finalizedPlan = realItineraries[cardIndex];
    if (!finalizedPlan) return;

    const conversation: Conversation = {
      id: currentConversationId || Date.now().toString(),
      title: `${finalizedPlan.title} Finalized Trip`,
      messages,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveConversation(conversation);

    setConversations(getConversations().slice(0, 3));

    addAssistantMessage(
      `✅ Your **${finalizedPlan.title}** has been finalized and saved! The next step is to process bookings. How would you like to proceed?`
    );
    setShowSuccess(true);
  };

  const handleTrendingClick = (query: string) => {
    setInput(query);
    setTrendingScores((prev) => ({
      ...prev,
      [query]: (prev[query] || 0) + 1,
    }));
  };

  const handleFollowUpClick = (question: string) => {
    if (isLoading) return;
    setInput(question);
  };

  const handleLikePlan = (index: number, itinerary?: Itinerary) => {
    setLikedPlans((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );

    if (itinerary) {
      setLikedItineraries((prev) => {
        const exists = prev.some((item) => item.title === itinerary.title);
        if (exists) {
          return prev.filter((item) => item.title !== itinerary.title);
        } else {
          return [...prev, itinerary];
        }
      });
    }
  };

  const handleComparePlan = (index: number, itinerary?: Itinerary) => {
    setComparePlans((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else if (prev.length < 2) {
        return [...prev, index];
      }
      return prev;
    });

    if (itinerary) {
      setCompareItineraries((prev) => {
        const exists = prev.some((item) => item.title === itinerary.title);
        if (exists) {
          return prev.filter((item) => item.title !== itinerary.title);
        } else if (prev.length < 2) {
          return [...prev, itinerary];
        }
        return prev;
      });
    }
  };

  const handleEnhanceItinerary = async (
    cardIndex: number,
    customInput: string
  ) => {
    // Add card to enhancing set to show loading state
    setEnhancingCards((prev) => new Set(prev).add(cardIndex));

    try {
      // Find the itinerary data from messages
      let itineraryToEnhance = null;
      let messageIndex = -1;

      // Search through messages to find the itinerary
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        if (
          message.cards?.type === "itinerary" &&
          message.cards.data[cardIndex]
        ) {
          itineraryToEnhance = message.cards.data[cardIndex];
          messageIndex = i;
          break;
        }
      }

      if (!itineraryToEnhance) {
        console.error("Itinerary not found for enhancement");
        return;
      }

      const requestBody = {
        plan_details: itineraryToEnhance,
        query_en: input || "Enhance this itinerary", // Use current input or default
        user_enhance: customInput,
        card_index: cardIndex,
      };

      console.log("Itinerary Enhancement Request:", requestBody);

      const response = await fetch("http://0.0.0.0:5001/api/enhance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("Itinerary Enhancement Response:", data);

      if (data && Array.isArray(data) && data.length > 0) {
        // Extract the enhanced plan from the array response
        const enhancedPlan = data[0];
        const responseCardIndex = enhancedPlan.card_index;

        // Transform the backend itinerary to optimized_routes format
        const transformedOptimizedRoutes = {};
        if (enhancedPlan.itinerary) {
          Object.keys(enhancedPlan.itinerary).forEach((dayKey) => {
            const daySpots = enhancedPlan.itinerary[dayKey];
            transformedOptimizedRoutes[dayKey] = {
              optimized_order: daySpots.map((spot) => ({
                spot_name: spot.spot_name,
                lat: parseFloat(spot.lat),
                lng: parseFloat(spot.long),
                description: spot.description,
                estimated_time_spent: spot.estimated_time_spent,
                weather: spot.weather,
              })),
            };
          });
        }

        // Transform the backend response to match our itinerary format
        const transformedItinerary = {
          title:
            enhancedPlan.trip_details?.itinerary_name ||
            enhancedPlan.trip_details?.trip_name ||
            itineraryToEnhance.title,
          durationDays:
            enhancedPlan.trip_details?.duration_days ||
            itineraryToEnhance.durationDays,
          budget: itineraryToEnhance.budget || "Custom",
          short_desc: `Enhanced ${
            enhancedPlan.trip_details?.destination || "trip"
          } experience`,
          highlights: itineraryToEnhance.highlights || [],
          trip_details: enhancedPlan.trip_details,
          hotel: enhancedPlan.hotel,
          optimized_routes: transformedOptimizedRoutes,
          itinerary: enhancedPlan.itinerary,
        };

        // Update the specific message with enhanced itinerary using the card_index from response
        setMessages((prev) => {
          const newMessages = [...prev];
          if (messageIndex >= 0 && newMessages[messageIndex].cards) {
            const updatedCards = { ...newMessages[messageIndex].cards };
            updatedCards.data = [...updatedCards.data];
            // Use the card_index from the response to update the correct card
            updatedCards.data[responseCardIndex] = transformedItinerary;
            newMessages[messageIndex] = {
              ...newMessages[messageIndex],
              cards: updatedCards,
            };
          }
          return newMessages;
        });

        addAssistantMessage(
          `✨ Your itinerary "${transformedItinerary.title}" has been enhanced with your preferences!`
        );
      } else {
        addAssistantMessage(
          `⚠️ Sorry, I couldn't enhance the itinerary. ${
            data?.message || "Please try again."
          }`
        );
      }
    } catch (error) {
      console.error("Itinerary Enhancement API Error:", error);
      addAssistantMessage(
        "⚠️ Connection error during itinerary enhancement. Please ensure Flask server is running on http://0.0.0.0:5001."
      );
    } finally {
      // Remove from enhancing set after delay to show completion
      setTimeout(() => {
        setEnhancingCards((prev) => {
          const newSet = new Set(prev);
          newSet.delete(cardIndex);
          return newSet;
        });
      }, 2000);
    }
  };

  const openMapView = () => {
    window.open("/map", "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 h-screen flex overflow-hidden relative">
        {/* Back Arrow - Fixed Top Right */}
        <div className="lg:hidden fixed top-24 right-4 z-50">
          {/* Back Arrow Button */}
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="w-10 h-10 bg-background rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex items-center justify-center border border-border hover:bg-muted/50"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Main Chat Area - Responsive */}
        <div className="w-full lg:w-[75%] flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="w-full px-4">
              {messages.length === 0 ? (
                /* Sample Questions - Only show when chat is empty */
                <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                      <Bot className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                      How can I help you today?
                    </h2>
                    <p className="text-muted-foreground">
                      Choose from these popular travel plans or ask me anything!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full">
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        handleSendMessage(
                          "Book me a trip to Dubai for 2 days on 26 Dec"
                        )
                      }
                      className="p-6 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100 rounded-2xl border-2 border-orange-200/60 hover:border-orange-300 transition-all duration-300 text-left group shadow-lg hover:shadow-xl hover:shadow-orange-200/50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center flex-shrink-0 shadow-md">
                          <Plane className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-orange-700 mb-2 group-hover:text-orange-800">
                            Dubai Weekend Getaway
                          </h3>
                          <p className="text-sm text-orange-600/80 mb-3">
                            Book me a trip to Dubai for 2 days on 26 Dec
                          </p>
                          <div className="flex items-center gap-2 text-xs text-orange-600">
                            <span className="bg-orange-100 px-2 py-1 rounded-full font-medium">
                              2 Days
                            </span>
                            <span className="bg-amber-100 px-2 py-1 rounded-full font-medium">
                              Dec 26
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>

                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        handleSendMessage(
                          "Give me 4 days holiday plan for Kerala on 1st week of Jan"
                        )
                      }
                      className="p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 rounded-2xl border-2 border-green-200/60 hover:border-green-300 transition-all duration-300 text-left group shadow-lg hover:shadow-xl hover:shadow-green-200/50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-md">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-green-700 mb-2 group-hover:text-green-800">
                            Kerala Backwaters
                          </h3>
                          <p className="text-sm text-green-600/80 mb-3">
                            Give me 4 days holiday plan for Kerala on 1st week
                            of Jan
                          </p>
                          <div className="flex items-center gap-2 text-xs text-green-600">
                            <span className="bg-green-100 px-2 py-1 rounded-full font-medium">
                              4 Days
                            </span>
                            <span className="bg-emerald-100 px-2 py-1 rounded-full font-medium">
                              Jan Week 1
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>

                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        handleSendMessage(
                          "Generate trip plan for 8 days to Pattaya"
                        )
                      }
                      className="p-6 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100 dark:from-cyan-950/40 dark:via-blue-950/30 dark:to-indigo-900/20 rounded-2xl border-2 border-cyan-200/60 hover:border-cyan-300 transition-all duration-300 text-left group shadow-lg hover:shadow-xl hover:shadow-cyan-200/50 md:col-span-2 lg:col-span-1"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md">
                          <Hotel className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-cyan-700 dark:text-cyan-300 mb-2 group-hover:text-cyan-800 dark:group-hover:text-cyan-200">
                            Pattaya Beach Holiday
                          </h3>
                          <p className="text-sm text-cyan-600/80 dark:text-cyan-400/80 mb-3">
                            Generate trip plan for 8 days to Pattaya
                          </p>
                          <div className="flex items-center gap-2 text-xs text-cyan-600">
                            <span className="bg-cyan-100 dark:bg-cyan-900/50 px-2 py-1 rounded-full font-medium">
                              8 Days
                            </span>
                            <span className="bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-full font-medium">
                              Beach
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  </div>

                  <div className="mt-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      Or type your own travel question below 👇
                    </p>
                  </div>
                </div>
              ) : (
                /* Regular Messages */
                messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    cards={message.cards}
                    onLike={handleLikePlan}
                    onCompare={handleComparePlan}
                    onViewDetails={(index, itinerary) => {
                      const dataToUse = realItineraries[index] || itinerary;
                      setSelectedItinerary(index);
                      setSelectedItineraryData(dataToUse);
                      setShowDetailSheet(true);
                    }}
                    onViewJourneyFlow={(index, itinerary) => {
                      console.log(
                        "🗺️ View Journey Flow clicked for:",
                        index,
                        itinerary
                      );
                      // Use the itinerary data from the message cards or realItineraries
                      const dataToUse = message.cards?.data || realItineraries;
                      if (dataToUse && dataToUse.length > 0) {
                        console.log(
                          "🗺️ Setting map view with itineraries:",
                          dataToUse
                        );
                        console.log("🗺️ showMapView before:", showMapView);
                        setMapViewItineraries(dataToUse);
                        setShowMapView(true);
                        console.log(
                          "🗺️ showMapView after setShowMapView(true)"
                        );
                      } else {
                        console.error(
                          "🗺️ No itinerary data available for map view"
                        );
                      }
                    }}
                    onEnhance={(index, customInput) => {
                      handleEnhanceItinerary(index, customInput);
                    }}
                    onFinalize={handleFinalizePlan}
                    likedPlans={likedPlans}
                    comparePlans={comparePlans}
                    enhancingCards={enhancingCards}
                  />
                ))
              )}

              {/* Loading Animation with Steps */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 text-primary my-4"
                >
                  <div className="flex items-center gap-2">
                    {/* Bot Icon */}
                    <div className="bg-green-500 rounded-full p-1.5">
                      <Bot className="w-5 h-5 text-white animate-pulse" />
                    </div>

                    {/* Faster Loader */}
                    <Loader2
                      className="w-5 h-5 text-primary animate-spin"
                      style={{ animationDuration: "0.5s" }}
                    />
                  </div>

                  {loadingStep > 0 && loadingMessages[loadingStep] ? (
                    <motion.span
                      key={loadingStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm font-medium"
                    >
                      {loadingMessages[loadingStep]}
                    </motion.span>
                  ) : (
                    <span className="text-sm font-medium">Thinking...</span>
                  )}
                </motion.div>
              )}

              {/* Cards are now rendered as part of messages */}

              {/* All cards are now rendered as part of the message flow */}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Follow-up Questions - Always visible, Horizontal Scroll */}
          {messages.length > 0 && (
            <div className="border-t border-border px-4 py-2 bg-muted/10">
              <div className="max-w-4xl mx-auto overflow-x-auto hide-scrollbar">
                <div className="flex gap-2 min-w-max">
                  {followUpQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleFollowUpClick(question)}
                      className="rounded-full text-xs px-3 py-1 h-7 whitespace-nowrap border-primary/30 hover:bg-primary/5"
                      disabled={isLoading}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="flex gap-3 p-4 border-t border-border bg-background/95 backdrop-blur-sm">
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => {
                  const newValue = e.target.value;
                  const wordCount = newValue
                    .split(/\s+/)
                    .filter((word) => word.length > 0).length;
                  if (wordCount <= 1200) {
                    setInput(newValue);
                  }
                }}
                placeholder={
                  isLoading
                    ? "Processing your request..."
                    : "Ask me anything about your travel plans..."
                }
                className="flex-1 min-h-[80px] max-h-[200px] resize-none rounded-xl border-2 focus:border-primary pr-20"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {input.split(/\s+/).filter((word) => word.length > 0).length}
                /1200 words
              </div>
            </div>
            {/* Clear Cards Button - only show if there are cards */}
            {(showItineraries ||
              showFlights ||
              showBusRoutes ||
              showAccommodations) && (
              <Button
                onClick={handleClearAllCards}
                variant="outline"
                className="rounded-xl px-3 h-10 text-xs hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                title="Clear all cards"
                disabled={isLoading}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            <Button
              onClick={() => handleSendMessage()}
              className="rounded-xl px-5 h-10 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              disabled={isLoading || input.trim().length === 0}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Sidebar Backdrop */}
        <div
          className={`lg:hidden fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 ease-in-out ${
            isMobileSidebarOpen
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsMobileSidebarOpen(false)}
        />

        {/* Right Sidebar - Responsive */}
        <div
          className={`
            ${isMobileSidebarOpen ? "translate-x-0" : "translate-x-full"}
            lg:translate-x-0 lg:relative lg:w-[25%] lg:min-w-[320px]
            fixed top-0 right-0 w-80 h-full z-40 
            bg-background shadow-2xl border-l border-border
            transition-transform duration-300 ease-in-out
            flex flex-col overflow-y-auto
          `}
        >
          {/* Mobile Close Button */}
          {isMobileSidebarOpen && (
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden absolute top-4 right-4 z-50 p-2 bg-primary rounded-full shadow-lg hover:bg-primary/90 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          )}

          {/* Quick Actions Section */}
          <div className="p-4 pt-24 lg:pt-6 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
              Quick Actions
            </h3>

            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start rounded-lg text-xs h-9 hover:bg-primary/5 transition-all duration-200"
                  onClick={() => setShowLikedPopup(true)}
                >
                  <motion.div
                    animate={{
                      scale: likedItineraries.length > 0 ? [1, 1.2, 1] : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 mr-2 ${
                        likedItineraries.length > 0 ? "text-red-500" : ""
                      }`}
                    />
                  </motion.div>
                  Liked Plans ({likedItineraries.length})
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start rounded-lg text-xs h-9 hover:bg-primary/5 transition-all duration-200"
                  onClick={() => setShowComparePopup(true)}
                  disabled={compareItineraries.length === 0}
                >
                  <motion.div
                    animate={{
                      rotate:
                        compareItineraries.length > 0 ? [0, 10, -10, 0] : 0,
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <Scale
                      className={`w-3.5 h-3.5 mr-2 ${
                        compareItineraries.length > 0 ? "text-blue-500" : ""
                      }`}
                    />
                  </motion.div>
                  Compare Plans ({compareItineraries.length})
                </Button>
              </motion.div>
            </div>

            {/* Chat History - Only 2 */}
            {/* Mobile Menu Toggle - Below Profile */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="md:hidden mt-4"
            >
              <Button
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                variant="outline"
                size="sm"
                className="w-full justify-center rounded-lg text-sm h-12 hover:bg-primary/5 transition-all duration-200 border-2"
              >
                <Menu className="w-6 h-6 mr-2" />
                <span className="font-medium">
                  {isMobileSidebarOpen ? "Hide Menu" : "Show Menu"}
                </span>
              </Button>
            </motion.div>

            {conversations.length > 0 && (
              <>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center mt-4">
                  <MessageSquare className="w-4 h-4 mr-2 text-green-500" />
                  Recent Chats
                </h4>
                <div className="space-y-1.5">
                  {conversations.slice(0, 3).map((conv, index) => (
                    <motion.button
                      key={conv.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      whileHover={{
                        scale: 1.02,
                        x: 5,
                        backgroundColor: "hsl(var(--primary) / 0.05)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full text-left p-2 bg-card rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-xs truncate border border-border/50"
                      onClick={() => {
                        setMessages(conv.messages);
                        setShowItineraries(false);
                      }}
                    >
                      {conv.title}
                    </motion.button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Trending Trips Section */}
          <div className="flex-1 p-4 bg-muted/30">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
              <Map className="w-4 h-4 mr-2 text-purple-500" />
              Trending Trips
            </h3>
            <div className="space-y-1.5">
              {hotQueries.map((query, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                  whileHover={{
                    scale: 1.02,
                    x: 8,
                    backgroundColor: "hsl(var(--primary) / 0.05)",
                    boxShadow: "0 4px 12px hsl(var(--primary) / 0.15)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTrendingClick(query)}
                  className="w-full text-left p-2 bg-card rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-xs border border-border/50"
                >
                  <div className="flex items-center justify-between">
                    <span>{query}</span>
                    {trendingScores[query] && (
                      <motion.span
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3,
                        }}
                        className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full"
                      >
                        {trendingScores[query]}
                      </motion.span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />

      {/* Itinerary Detail Sheet - Re-enabled */}
      {showDetailSheet && (
        <>
          {console.log("Rendering ItineraryDetailSheet with:", {
            showDetailSheet,
            selectedItineraryData,
            selectedItinerary,
            realItinerariesLength: realItineraries.length,
            selectedRealItinerary:
              selectedItinerary !== null
                ? realItineraries[selectedItinerary]
                : null,
          })}
          <ItineraryDetailSheet
            isOpen={showDetailSheet}
            onClose={() => {
              console.log("Closing detail sheet");
              setShowDetailSheet(false);
              setSelectedItinerary(null);
              setSelectedItineraryData(null);
            }}
            title={
              selectedItineraryData?.title ||
              (selectedItinerary !== null && realItineraries[selectedItinerary]
                ? realItineraries[selectedItinerary].title
                : "Trip Plan")
            }
            days={
              selectedItineraryData?.durationDays ||
              (selectedItinerary !== null && realItineraries[selectedItinerary]
                ? realItineraries[selectedItinerary].durationDays
                : 1)
            }
            budget={
              selectedItineraryData?.budget ||
              (selectedItinerary !== null && realItineraries[selectedItinerary]
                ? realItineraries[selectedItinerary].budget || "Not specified"
                : "Not specified")
            }
            trip_details={
              selectedItineraryData?.trip_details ||
              (selectedItinerary !== null && realItineraries[selectedItinerary]
                ? realItineraries[selectedItinerary].trip_details
                : undefined)
            }
            hotel={
              selectedItineraryData?.hotel ||
              (selectedItinerary !== null && realItineraries[selectedItinerary]
                ? realItineraries[selectedItinerary].hotel
                : undefined)
            }
            optimized_routes={
              selectedItineraryData?.optimized_routes ||
              (selectedItinerary !== null && realItineraries[selectedItinerary]
                ? realItineraries[selectedItinerary].optimized_routes
                : undefined)
            }
          />
        </>
      )}

      {/* Liked Plans Popup (No change needed) */}
      {showLikedPopup && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Liked Plans
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLikedPopup(false)}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </div>
            <div className="p-4">
              {likedItineraries.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No liked plans yet
                </p>
              ) : (
                <div className="space-y-4">
                  {likedItineraries.map((itinerary, index) => (
                    <div
                      key={index}
                      className="p-4 border border-border rounded-lg"
                    >
                      <h3 className="font-semibold mb-2">{itinerary.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {itinerary.duration} •{" "}
                        {itinerary.budget || "Custom Budget"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Enhanced Compare Plans Popup */}
      {showComparePopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-gradient-to-br from-background to-muted/20 rounded-2xl shadow-2xl border border-border/50 max-w-6xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Enhanced Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-lg border-b border-border/50 p-6">
              <div className="flex items-center justify-between">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                    <Scale className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Compare Plans
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Side-by-side comparison of your selected itineraries
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowComparePopup(false)}
                    className="rounded-xl border-2 hover:bg-primary/5 transition-all duration-200"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Plans
                  </Button>
                </motion.div>
              </div>
            </div>
            {/* Enhanced Content Area */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {compareItineraries.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/30 flex items-center justify-center">
                    <Scale className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    No Plans Selected
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Click the <strong>Scale</strong> icon on any itinerary card
                    to add it to comparison. You can compare up to 2 plans
                    side-by-side.
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {compareItineraries.map((itinerary, index) => {
                    if (!itinerary) return null;

                    const days = itinerary.optimized_routes
                      ? Object.keys(itinerary.optimized_routes)
                      : [];
                    const sortedDays = days.sort((a, b) => {
                      const numA = parseInt(a.replace("Day ", ""));
                      const numB = parseInt(b.replace("Day ", ""));
                      return numA - numB;
                    });

                    // Color schemes for different cards
                    const colorSchemes = [
                      {
                        gradient: "from-blue-50 to-indigo-100",
                        titleGradient: "from-blue-600 to-indigo-600",
                        badgeGradient: "from-blue-500 to-indigo-500",
                        accent: "text-blue-600",
                      },
                      {
                        gradient: "from-emerald-50 to-teal-100",
                        titleGradient: "from-emerald-600 to-teal-600",
                        badgeGradient: "from-emerald-500 to-teal-500",
                        accent: "text-emerald-600",
                      },
                    ];

                    const scheme = colorSchemes[index % colorSchemes.length];

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative p-6 border-2 border-border/50 rounded-3xl bg-gradient-to-br ${scheme.gradient} shadow-lg hover:shadow-xl transition-all duration-300`}
                      >
                        {/* Plan Header */}
                        <div className="flex items-center justify-between mb-4">
                          <h3
                            className={`font-bold text-xl bg-gradient-to-r ${scheme.titleGradient} bg-clip-text text-transparent`}
                          >
                            {itinerary.title}
                          </h3>
                          <div
                            className={`w-8 h-8 rounded-full bg-gradient-to-r ${scheme.badgeGradient} flex items-center justify-center text-white font-bold text-sm shadow-md`}
                          >
                            {index + 1}
                          </div>
                        </div>

                        {/* Plan Info */}
                        <div className="flex items-center gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>
                              {itinerary.durationDays || days.length} Days
                            </span>
                          </div>
                          <div
                            className={`flex items-center gap-1 font-semibold ${scheme.accent}`}
                          >
                            <span>{itinerary.budget || "Custom"}</span>
                          </div>
                        </div>

                        {/* Plan Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-4 p-4 bg-muted/50 rounded-xl border border-border/30">
                          <div className="text-center">
                            <div
                              className={`text-2xl font-bold ${scheme.accent}`}
                            >
                              {sortedDays.length}
                            </div>
                            <div className="text-xs text-muted-foreground font-medium">
                              Days
                            </div>
                          </div>
                          <div className="text-center">
                            <div
                              className={`text-2xl font-bold ${scheme.accent}`}
                            >
                              {itinerary.optimized_routes
                                ? Object.values(
                                    itinerary.optimized_routes
                                  ).reduce(
                                    (total, day: any) =>
                                      total +
                                      (day.optimized_order?.length || 0),
                                    0
                                  )
                                : 0}
                            </div>
                            <div className="text-xs text-muted-foreground font-medium">
                              Places
                            </div>
                          </div>
                        </div>

                        {/* Day-by-Day Itinerary */}
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                          {sortedDays.map((dayKey, dayIndex) => {
                            const dayRoute =
                              itinerary.optimized_routes?.[dayKey];
                            if (!dayRoute) return null;

                            return (
                              <div
                                key={dayIndex}
                                className="bg-muted/30 rounded-xl p-3 border border-border/20"
                              >
                                <div
                                  className={`font-semibold text-sm ${scheme.accent} mb-2 flex items-center gap-2`}
                                >
                                  <div
                                    className={`w-6 h-6 rounded-full bg-gradient-to-r ${scheme.badgeGradient} flex items-center justify-center text-white text-xs font-bold`}
                                  >
                                    {dayIndex + 1}
                                  </div>
                                  {dayKey}
                                </div>

                                <div className="space-y-2 text-xs">
                                  {dayRoute.optimized_order
                                    ?.slice(0, 3)
                                    .map((spot: any, activityIndex: number) => (
                                      <div
                                        key={activityIndex}
                                        className="bg-card rounded-lg p-2 border border-border/50"
                                      >
                                        <div className="flex items-start gap-2">
                                          <span
                                            className={`font-medium ${scheme.accent}`}
                                          >
                                            {activityIndex + 1}.
                                          </span>
                                          <div className="flex-1">
                                            <div className="font-medium text-foreground">
                                              {spot.spot_name}
                                            </div>
                                            <div className="text-muted-foreground mt-1 line-clamp-2">
                                              {spot.description}
                                            </div>
                                            <div
                                              className={`text-xs ${scheme.accent} font-medium mt-1`}
                                            >
                                              ⏱️ {spot.estimated_time_spent}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  {dayRoute.optimized_order &&
                                    dayRoute.optimized_order.length > 3 && (
                                      <div className="text-center py-2">
                                        <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                                          +{dayRoute.optimized_order.length - 3}{" "}
                                          more places
                                        </span>
                                      </div>
                                    )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Animated Map View Component */}
      <AnimatedMapView
        isOpen={showMapView}
        onClose={() => {
          console.log("🗺️ Closing map view");
          setShowMapView(false);
          setMapViewItineraries([]);
        }}
        itineraries={mapViewItineraries}
      />
    </div>
  );
};

export default ChatPage;
