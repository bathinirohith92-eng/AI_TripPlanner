import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Plane,
  Calendar,
  Users,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FlightPayment from "@/components/FlightPayment";
import BookingChatBot from "@/components/BookingChatBot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

// Assuming flightBanner path is correct
import flightBanner from "@/assets/flight-banner.jpg";

const FlightBooking = () => {
  const navigate = useNavigate();
  const resultsRef = useRef(null); // Ref for the results section
  const [searchData, setSearchData] = useState({
    from: "Delhi", // Pre-fill for demonstration
    to: "Mumbai", // Pre-fill for demonstration
    departure: "2025-11-17",
    return: "2025-11-24",
    passengers: "1",
    class: "economy",
  });
  const [showResults, setShowResults] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [flights, setFlights] = useState([]);

  // Mock flight data as fallback
  const mockFlights = [
    {
      id: 1,
      airline: "Air India",
      logo: "✈️",
      departureTime: "09:30",
      arrivalTime: "12:45",
      duration: "3h 15m",
      price: "4299",
    },
    {
      id: 2,
      airline: "IndiGo",
      logo: "✈️",
      departureTime: "14:20",
      arrivalTime: "17:35",
      duration: "3h 15m",
      price: "3899",
    },
    {
      id: 3,
      airline: "SpiceJet",
      logo: "✈️",
      departureTime: "18:00",
      arrivalTime: "21:15",
      duration: "3h 15m",
      price: "3599",
    },
  ];

  // Use API flights if available, otherwise use mock data
  const displayFlights = flights.length > 0 ? flights : mockFlights;

  // Debug log
  console.log(
    "🔍 Debug - flights.length:",
    flights.length,
    "displayFlights.length:",
    displayFlights.length
  );

  const handleSearch = async () => {
    setIsSearching(true);
    setShowResults(false);
    setFlights([]); // Clear previous flights

    // Scroll to loading section immediately
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);

    try {
      const response = await fetch("http://localhost:5001/api/flights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: searchData.from,
          to: searchData.to,
          departure: searchData.departure,
          passengers: searchData.passengers,
          class: searchData.class,
        }),
      });

      const data = await response.json();

      if (data.success && data.flights) {
        // Update flights state with API data
        setFlights(data.flights);
        setShowResults(true);
        console.log("✅ Flights loaded from API:", data.flights);
        console.log("📊 Total flights received:", data.flights.length);
      } else {
        console.error("❌ Flight API Error:", data.error);
        // Fallback to showing results anyway
        setShowResults(true);
      }
    } catch (error) {
      console.error("❌ Network Error:", error);
      // Fallback to showing mock results
      setShowResults(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBookNow = (flight) => {
    setSelectedFlight(flight);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setSelectedFlight(null);
    // Could redirect to booking confirmation page
  };

  if (showPayment) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20">
          <FlightPayment
            selectedFlight={selectedFlight}
            searchData={searchData}
            onBack={() => setShowPayment(false)}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Banner */}
      <section
        className="relative h-[40vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${flightBanner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center"
        >
          <Plane className="w-16 h-16 text-white mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Book Your Flight
          </h1>
          <p className="text-white/90 text-lg">
            Find the best deals across India
          </p>
        </motion.div>
      </section>

      {/* Search Form */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-6 gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Planner
            </Button>

            <Card className="p-8 shadow-[var(--shadow-strong)] rounded-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">From</label>
                  <Input
                    placeholder="Delhi"
                    value={searchData.from}
                    onChange={(e) =>
                      setSearchData({ ...searchData, from: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">To</label>
                  <Input
                    placeholder="Mumbai"
                    value={searchData.to}
                    onChange={(e) =>
                      setSearchData({ ...searchData, to: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Departure
                  </label>
                  <Input
                    type="date"
                    value={searchData.departure}
                    onChange={(e) =>
                      setSearchData({
                        ...searchData,
                        departure: e.target.value,
                      })
                    }
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Return
                  </label>
                  <Input
                    type="date"
                    value={searchData.return}
                    onChange={(e) =>
                      setSearchData({ ...searchData, return: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <Users className="w-4 h-4 inline mr-1" />
                    Passengers
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={searchData.passengers}
                    onChange={(e) =>
                      setSearchData({
                        ...searchData,
                        passengers: e.target.value,
                      })
                    }
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Class
                  </label>
                  <select
                    value={searchData.class}
                    onChange={(e) =>
                      setSearchData({ ...searchData, class: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background"
                  >
                    <option value="economy">Economy</option>
                    <option value="business">Business</option>
                    <option value="first">First Class</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={handleSearch}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg font-semibold shadow-[var(--shadow-medium)]"
              >
                <Search className="w-5 h-5 mr-2" />
                Search Flights
              </Button>
            </Card>
          </motion.div>

          {/* Enhanced Loading Animation */}
          {isSearching && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="relative mb-6"
              >
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-2 bg-primary/10 rounded-full flex items-center justify-center"
                >
                  <Plane className="w-6 h-6 text-primary" />
                </motion.div>
              </motion.div>
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-muted-foreground font-medium"
              >
                Searching for best flight deals...
              </motion.p>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "200px" }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                className="h-1 bg-primary/30 rounded-full mt-4 overflow-hidden"
              >
                <motion.div
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="h-full w-1/3 bg-primary rounded-full"
                />
              </motion.div>
            </motion.div>
          )}

          {/* Results */}
          {showResults && !isSearching && (
            <motion.div
              ref={resultsRef} // Attach ref here for scrolling
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 space-y-4"
            >
              <h2 className="text-2xl font-bold mb-4">
                Available Flights ({displayFlights.length})
              </h2>
              {displayFlights.map((flight, index) => (
                <motion.div
                  key={flight.id}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 0.2 * index,
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                  }}
                  whileHover={{
                    scale: 1.02,
                    y: -5,
                    transition: { duration: 0.2 },
                  }}
                >
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 rounded-2xl">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <div className="text-2xl">{flight.logo}</div>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">
                              {flight.airline}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                {flight.flight_number || "AI-101"}
                              </span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                {flight.is_direct ? "Non-stop" : "Connecting"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            ₹{flight.price}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            per person
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Flight Route */}
                      <div className="bg-white rounded-lg p-4 border border-gray-100 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="text-center flex-1">
                            <p className="text-sm text-muted-foreground mb-1">
                              DEPARTURE
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                              {flight.departureTime}
                            </p>
                            <p className="text-sm font-medium text-gray-700">
                              {searchData.from || "DEL"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {searchData.departure}
                            </p>
                          </div>

                          <div className="flex-1 flex items-center justify-center px-4">
                            <div className="flex items-center gap-2 w-full">
                              <div className="w-3 h-3 bg-primary rounded-full"></div>
                              <div className="flex-1 h-0.5 bg-primary relative">
                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-center">
                                  <div className="bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
                                    {flight.duration}
                                  </div>
                                </div>
                              </div>
                              <div className="w-3 h-3 bg-primary rounded-full"></div>
                            </div>
                          </div>

                          <div className="text-center flex-1">
                            <p className="text-sm text-muted-foreground mb-1">
                              ARRIVAL
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                              {flight.arrivalTime}
                            </p>
                            <p className="text-sm font-medium text-gray-700">
                              {searchData.to || "BOM"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {searchData.departure}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Flight Details */}
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium">Class</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {searchData.class || "Economy"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium">Passengers</p>
                            <p className="text-sm text-muted-foreground">
                              {searchData.passengers} Adult
                              {parseInt(searchData.passengers) > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium">Baggage</p>
                            <p className="text-sm text-muted-foreground">
                              7kg + 15kg
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          🍽️ Meal Included
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          📺 Entertainment
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          💳 Refundable
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          ✈️ On-time Performance: 85%
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 border-primary text-primary hover:bg-primary hover:text-white"
                        >
                          View Details
                        </Button>
                        <Button
                          onClick={() => handleBookNow(flight)}
                          className="flex-1 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02]"
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Booking ChatBot */}
      <BookingChatBot pageType="flight" />
    </div>
  );
};

export default FlightBooking;
