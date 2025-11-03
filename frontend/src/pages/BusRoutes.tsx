import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  Search,
  MapPin,
  Clock,
  Bus,
  ArrowRight,
  Calendar,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import BusPayment from "@/components/BusPayment";
import BookingChatBot from "@/components/BookingChatBot";

// Bus banner image
import busBanner from "@/assets/bus-banner.jpg";

interface BusRoute {
  id: number;
  routeName: string;
  duration: string;
  type?: string;
  buses: Array<{
    operator: string;
    from: string;
    to?: string;
    trip_time?: string;
  }>;
  price?: number;
  departureTime?: string;
  arrivalTime?: string;
}

const BusRoutes = () => {
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fromCity, setFromCity] = useState("Chennai");
  const [toCity, setToCity] = useState("Bangalore");
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Mock bus routes data
  const mockRoutes: BusRoute[] = [
    {
      id: 1,
      routeName: "Delhi to Mumbai Express",
      duration: "18 hr 30 min",
      buses: [
        { operator: "RedBus Express", from: "Delhi ISBT" },
        { operator: "Volvo AC Sleeper", from: "Gurgaon" },
      ],
      price: 1200,
      departureTime: "08:00 PM",
      arrivalTime: "02:30 PM",
    },
    {
      id: 2,
      routeName: "Bangalore to Chennai Route",
      duration: "6 hr 45 min",
      buses: [
        { operator: "KPN Travels", from: "Bangalore Majestic" },
        { operator: "SRS Travels", from: "Electronic City" },
      ],
      price: 450,
      departureTime: "11:00 PM",
      arrivalTime: "05:45 AM",
    },
    {
      id: 3,
      routeName: "Pune to Goa Coastal",
      duration: "12 hr 15 min",
      buses: [
        { operator: "Neeta Travels", from: "Pune Station" },
        { operator: "Paulo Travels", from: "Shivaji Nagar" },
      ],
      price: 800,
      departureTime: "09:30 PM",
      arrivalTime: "09:45 AM",
    },
  ];

  // Function to transform backend data to frontend format
  const transformBackendData = (backendData: any): BusRoute[] => {
    if (!backendData || typeof backendData !== "object") {
      return [];
    }

    const routes: BusRoute[] = [];

    // Handle the nested object structure from backend
    Object.entries(backendData).forEach(
      ([routeKey, routeData]: [string, any], index) => {
        if (routeData && typeof routeData === "object") {
          const route: BusRoute = {
            id: index + 1,
            routeName: `${routeData.start} to ${routeData.destination}`,
            duration: routeData.time_for_trip || "8 hours",
            departureTime: "08:00 AM", // Default time, can be enhanced
            arrivalTime: "04:00 PM", // Default time, can be enhanced
            price: routeData.type === "Direct Bus" ? 450 : 380, // Different pricing for direct vs connected
            type: routeData.type || "Bus Route",
            buses: [],
          };

          // Handle single bus (direct route)
          if (routeData.BUS1 || routeData["BUS 1"]) {
            const bus1 = routeData.BUS1 || routeData["BUS 1"];
            route.buses.push({
              operator: bus1.name || "Bus Service",
              from: bus1.route?.split(" → ")[0] || routeData.start,
              to: bus1.route?.split(" → ")[1] || routeData.destination,
              trip_time: bus1.bus_trip_time || routeData.time_for_trip,
            });
          }

          // Handle connecting bus (if exists)
          if (routeData.BUS2 || routeData["BUS 2"]) {
            const bus2 = routeData.BUS2 || routeData["BUS 2"];
            route.buses.push({
              operator: bus2.name || "Connecting Bus",
              from: bus2.route?.split(" → ")[0] || "Transfer Point",
              to: bus2.route?.split(" → ")[1] || routeData.destination,
              trip_time: bus2.bus_trip_time || "2 hours",
            });
          }

          // If no buses found, add a default one
          if (route.buses.length === 0) {
            route.buses.push({
              operator: "Bus Service",
              from: routeData.start || fromCity,
              to: routeData.destination || toCity,
              trip_time: routeData.time_for_trip || "8 hours",
            });
          }

          routes.push(route);
        }
      }
    );

    return routes;
  };

  const handleSearch = async () => {
    if (!fromCity.trim() || !toCity.trim()) return;

    setIsLoading(true);
    setBusRoutes([]); // Clear previous results

    try {
      const response = await fetch("http://localhost:5001/api/bus-routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin: fromCity.trim(),
          destination: toCity.trim(),
          departure_date: "2025-11-17", // You can make this dynamic later
        }),
      });

      const data = await response.json();
      console.log(" Raw API Response:", data);

      // Check if data has travel_bookings (from your example)
      if (data.travel_bookings) {
        let bookingsData;
        try {
          // Parse the travel_bookings if it's a string
          bookingsData =
            typeof data.travel_bookings === "string"
              ? JSON.parse(data.travel_bookings)
              : data.travel_bookings;

          console.log(" Parsed Bookings Data:", bookingsData);

          const transformedRoutes = transformBackendData(bookingsData);
          setBusRoutes(transformedRoutes);
          console.log(" Transformed routes:", transformedRoutes);
        } catch (parseError) {
          console.error(" JSON Parse Error:", parseError);
          setBusRoutes(mockRoutes);
        }
      } else if (data.success && data.routes) {
        // Fallback to original structure
        setBusRoutes(data.routes);
        console.log(" Bus routes loaded (original format):", data.routes);
      } else {
        console.error(" API Error:", data.error || "No data found");
        // Fallback to mock data if API fails
        setBusRoutes(mockRoutes);
      }
    } catch (error) {
      console.error(" Network Error:", error);
      // Fallback to mock data if network fails
      setBusRoutes(mockRoutes);
    } finally {
      setIsLoading(false);

      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleBookNow = (route: BusRoute) => {
    setSelectedRoute(route);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setSelectedRoute(null);
    // Could redirect to booking confirmation page
  };

  if (showPayment) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20">
          <BusPayment
            selectedRoute={selectedRoute}
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

      {/* Hero Section with Background */}
      <section
        className="relative h-[40vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${busBanner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center text-white"
        >
          <h1 className="text-5xl font-bold mb-4">Bus Booking</h1>
          <p className="text-xl opacity-90">
            Find and book comfortable bus journeys
          </p>
        </motion.div>
      </section>

      <main className="pb-12">
        <div className="container mx-auto px-4 -mt-20 relative z-10">
          {/* Search Form */}
          <Card className="max-w-4xl mx-auto p-6 mb-8">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <MapPin className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="From City"
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <MapPin className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="To City"
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Input type="date" defaultValue="2025-11-17" />

              <Button onClick={handleSearch} className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Search Buses
              </Button>
            </div>
          </Card>

          {/* Enhanced Loading State */}
          {isLoading && (
            <motion.div
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
                  <Bus className="w-6 h-6 text-primary" />
                </motion.div>
              </motion.div>
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-muted-foreground font-medium"
              >
                Searching for available buses...
              </motion.p>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "200px" }}
                transition={{ duration: 2, ease: "easeInOut" }}
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
          <div ref={resultsRef} className="space-y-4">
            {busRoutes.length > 0 && !isLoading && (
              <>
                <h2 className="text-2xl font-semibold mb-4">
                  Available Buses ({busRoutes.length})
                </h2>
                {busRoutes.map((route, index) => (
                  <motion.div
                    key={route.id}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: index * 0.15,
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                    }}
                    whileHover={{
                      scale: 1.02,
                      y: -8,
                      transition: { duration: 0.3 },
                    }}
                  >
                    <Card className="p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary">
                      <div className="space-y-4">
                        {/* Header Section */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Bus className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">
                                {route.buses[0]?.operator || "Bus Service"}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                  {route.type || "Direct Bus"}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  AC Sleeper
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">
                              ₹{route.price || 450}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              per person
                            </p>
                          </div>
                        </div>

                        {/* Route Information */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-center flex-1">
                              <p className="text-sm text-muted-foreground mb-1">
                                DEPARTURE
                              </p>
                              <p className="font-bold text-lg">
                                {route.departureTime || "08:00 AM"}
                              </p>
                              <p className="text-sm font-medium text-gray-700">
                                {fromCity}
                              </p>
                            </div>

                            <div className="flex-1 flex items-center justify-center">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-primary rounded-full"></div>
                                <div className="flex-1 h-0.5 bg-primary"></div>
                                <div className="text-center px-2">
                                  <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
                                  <p className="text-xs font-medium text-primary">
                                    {route.duration}
                                  </p>
                                </div>
                                <div className="flex-1 h-0.5 bg-primary"></div>
                                <div className="w-3 h-3 bg-primary rounded-full"></div>
                              </div>
                            </div>

                            <div className="text-center flex-1">
                              <p className="text-sm text-muted-foreground mb-1">
                                ARRIVAL
                              </p>
                              <p className="font-bold text-lg">
                                {route.arrivalTime || "02:00 PM"}
                              </p>
                              <p className="text-sm font-medium text-gray-700">
                                {toCity}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Route Details */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium">
                                Boarding Point
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {route.buses[0]?.from || fromCity}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-600" />
                            <div>
                              <p className="text-sm font-medium">
                                Dropping Point
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {route.buses[0]?.to || toCity}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Additional Info */}
                        {route.buses[0]?.trip_time && (
                          <div className="flex items-center gap-4 pt-2 border-t">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Travel Time: {route.buses[0].trip_time}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span className="text-sm text-green-600 font-medium">
                                Available
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Action Button */}
                        <div className="pt-2">
                          <Button
                            onClick={() => handleBookNow(route)}
                            className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
                          >
                            Select Seats & Book Now
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Booking ChatBot */}
      <BookingChatBot pageType="bus" />
    </div>
  );
};

export default BusRoutes;
