import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface TripDetails {
  trip_name: string;
  itinerary_name: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  destination: string;
}

interface Hotel {
  name: string;
  lat: number;
  lng: number;
  rating: number;
  types: string[];
  open_now: boolean;
}

interface ItineraryDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  days?: number;
  budget?: string;
  trip_details?: TripDetails;
  hotel?: Hotel;
  optimized_routes?: Record<string, OptimizedRoute>;
}

const ItineraryDetailSheet = ({
  isOpen,
  onClose,
  title,
  days,
  budget,
  trip_details,
  hotel,
  optimized_routes,
}: ItineraryDetailSheetProps) => {
  // Add safety checks and fallbacks
  const totalDays =
    days ||
    trip_details?.duration_days ||
    (optimized_routes ? Object.keys(optimized_routes).length : 0) ||
    1;
  const displayBudget = budget || "Not specified";
  const displayTitle =
    title ||
    trip_details?.itinerary_name ||
    trip_details?.trip_name ||
    "Trip Plan";

  // Check for data availability with better fallbacks
  const hasOptimizedRoutes =
    optimized_routes && Object.keys(optimized_routes).length > 0;
  const hasBasicInfo = title || trip_details || hotel || budget;
  const hasData = hasOptimizedRoutes || hasBasicInfo;

  // Debug logging
  console.log("ItineraryDetailSheet render:", {
    isOpen,
    title,
    days,
    budget,
    trip_details,
    hotel,
    optimized_routes: optimized_routes ? Object.keys(optimized_routes) : "null",
    hasOptimizedRoutes,
    hasBasicInfo,
    hasData,
    displayTitle,
    displayBudget,
    totalDays,
  });
  // Force render when isOpen is true
  if (!isOpen) {
    console.log("ItineraryDetailSheet not rendering - isOpen is false");
    return null;
  }

  console.log("ItineraryDetailSheet IS RENDERING - isOpen is true");

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Sheet */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-background shadow-2xl z-[9999] overflow-y-auto border-l-4 border-primary"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary to-secondary p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{displayTitle}</h2>

                  {trip_details && (
                    <div className="text-sm mb-3 space-y-1">
                      <div>📍 {trip_details.destination}</div>
                      <div>
                        📅 {trip_details.start_date} to {trip_details.end_date}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{totalDays} Days</span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold">
                      <span>Budget: {displayBudget}</span>
                    </div>
                  </div>

                  {hotel && (
                    <div className="mt-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <div className="font-semibold">🏨 {hotel.name}</div>
                      <div className="text-xs mt-1">
                        ⭐ {hotel.rating.toFixed(1)} •{" "}
                        {hotel.types.slice(0, 2).join(", ")}
                      </div>
                      <div className="text-xs">
                        {hotel.open_now ? "✅ Open Now" : "❌ Closed"}
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Day-wise Plans */}
            <div className="p-6 space-y-6">
              {hasOptimizedRoutes ? (
                Object.keys(optimized_routes)
                  .sort((a, b) => {
                    const numA = parseInt(a.replace("Day ", ""));
                    const numB = parseInt(b.replace("Day ", ""));
                    return numA - numB;
                  })
                  .map((dayKey) => {
                    const dayRoute = optimized_routes[dayKey];
                    if (!dayRoute || !dayRoute.optimized_order) {
                      return null;
                    }
                    return (
                      <div
                        key={dayKey}
                        className="bg-card rounded-2xl p-5 shadow-[var(--shadow-medium)] border border-border"
                      >
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                          <Calendar className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-bold">{dayKey}</h3>
                        </div>

                        <div className="space-y-3">
                          {dayRoute.optimized_order.map((spot, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/10 border border-border hover:shadow-md transition-all"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    {idx + 1}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <h4 className="font-semibold text-base">
                                      {spot.spot_name || "Unknown Location"}
                                    </h4>
                                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                                  </div>

                                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                                    {spot.description ||
                                      "No description available"}
                                  </p>

                                  <div className="flex flex-wrap items-center gap-3 text-xs">
                                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-md">
                                      <Clock className="w-3 h-3" />
                                      <span>
                                        {spot.estimated_time_spent || "N/A"}
                                      </span>
                                    </div>

                                    {spot.weather && (
                                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md">
                                        <span>🌤️ {spot.weather}</span>
                                      </div>
                                    )}

                                    {spot.lat && spot.long && (
                                      <div className="flex items-center gap-1 text-muted-foreground">
                                        <MapPin className="w-3 h-3" />
                                        <span>
                                          {typeof spot.lat === "number"
                                            ? spot.lat.toFixed(4)
                                            : spot.lat}
                                          ,{" "}
                                          {typeof spot.long === "number"
                                            ? spot.long.toFixed(4)
                                            : spot.long}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
              ) : hasBasicInfo ? (
                <div className="space-y-6">
                  <div className="bg-card rounded-2xl p-6 shadow-[var(--shadow-medium)] border border-border">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Trip Overview
                    </h3>

                    {trip_details && (
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="font-medium">Destination:</span>
                          <span>{trip_details.destination}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="font-medium">Duration:</span>
                          <span>{trip_details.duration_days} days</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="font-medium">Dates:</span>
                          <span>
                            {trip_details.start_date} to {trip_details.end_date}
                          </span>
                        </div>
                      </div>
                    )}

                    {hotel && (
                      <div className="bg-muted/30 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold mb-2">
                          🏨 Recommended Hotel
                        </h4>
                        <div className="text-sm space-y-1">
                          <div className="font-medium">{hotel.name}</div>
                          <div className="text-muted-foreground">
                            Rating: {hotel.rating}/5
                          </div>
                          <div className="text-muted-foreground">
                            Status: {hotel.open_now ? "Open" : "Closed"}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-primary/10 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        💡 This is a basic trip overview. For detailed
                        day-by-day itinerary, try enhancing this plan or
                        generating a new one with more specific requirements.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/30 flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    No Trip Data Available
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    This plan doesn't have any information available. Please try
                    generating a new plan or check back later.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ItineraryDetailSheet;
