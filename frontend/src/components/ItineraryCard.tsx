import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Sparkles,
  Eye,
  Heart,
  Scale,
  Loader2,
  MapPin,
  Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

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

interface ItineraryCardProps {
  title: string;
  totalDays: number | string;
  budget?: string;
  short_desc: string;
  optimized_routes?: Record<string, OptimizedRoute>;
  trip_details?: any;
  onViewDetails?: () => void;
  onViewJourneyFlow?: () => void;
  onFinalize?: () => void;
  onEnhance: (cardIndex: number, customInput: string) => void;
  cardIndex: number;
  isLiked?: boolean;
  isCompared?: boolean;
  onLike?: () => void;
  onCompare?: () => void;
  isEnhancing?: boolean;
  hotel?: any;
}

const ItineraryCard = ({
  title,
  totalDays,
  budget,
  short_desc,
  optimized_routes,
  trip_details,
  onViewDetails,
  onViewJourneyFlow,
  onFinalize,
  onEnhance,
  cardIndex,
  isLiked,
  isCompared,
  onLike,
  onCompare,
  isEnhancing,
  hotel,
}: ItineraryCardProps) => {
  const [showEnhanceInput, setShowEnhanceInput] = useState(false);
  const [enhanceText, setEnhanceText] = useState("");

  // Use the totalDays prop or calculate from optimized_routes if not provided
  const displayDays =
    totalDays ||
    trip_details?.duration_days ||
    (optimized_routes ? Object.keys(optimized_routes).length : 0);
  const displayBudget = budget || "Custom";
  const displayTitle =
    title ||
    trip_details?.itinerary_name ||
    trip_details?.trip_name ||
    "Trip Plan";

  const handleEnhance = () => {
    if (enhanceText.trim()) {
      // Hide input immediately and trigger enhancement
      setShowEnhanceInput(false);
      onEnhance(cardIndex, enhanceText);
      setEnhanceText("");
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: isEnhancing ? [1, 0.6, 1] : 1,
        scale: 1,
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{
        type: "spring",
        stiffness: 300,
        opacity: isEnhancing
          ? {
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }
          : {},
      }}
      className="flex-shrink-0 w-[380px] h-[600px]"
    >
      <div className="space-y-3">
        <Card
          className={`h-[500px] flex flex-col p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-xl transition-all border-2 rounded-3xl bg-gradient-to-br from-card to-card/50 relative ${
            isEnhancing
              ? "border-primary animate-pulse"
              : "hover:border-primary/30"
          }`}
        >
          {/* Action Icons - Top Right */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onLike}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isLiked
                  ? "bg-red-500 text-white"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onCompare}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isCompared
                  ? "bg-primary text-white"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              <Scale className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Header */}
          <div className="mb-4 pb-4 border-b border-border">
            <h3 className="text-xl font-bold line-clamp-2 mb-3 pr-20">
              {displayTitle}
            </h3>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{displayDays} Days</span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-primary">
                <span>{displayBudget}</span>
              </div>
            </div>
          </div>

          {/* Day Plans - Scrollable */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2 custom-scrollbar">
            {optimized_routes &&
              Object.keys(optimized_routes)
                .sort((a, b) => {
                  const numA = parseInt(a.replace("Day ", ""));
                  const numB = parseInt(b.replace("Day ", ""));
                  return numA - numB;
                })
                .map((dayKey) => {
                  const dayRoute = optimized_routes[dayKey];
                  return (
                    <div
                      key={dayKey}
                      className="bg-muted/30 rounded-xl p-3 space-y-2"
                    >
                      <div className="font-semibold text-sm text-primary mb-2">
                        {dayKey}
                      </div>

                      <div className="space-y-2 text-xs">
                        {dayRoute.optimized_order.map((spot, idx) => (
                          <div
                            key={idx}
                            className="bg-card rounded-lg p-2 border border-border/50"
                          >
                            <div className="flex items-start gap-2">
                              <span className="font-medium text-primary">
                                {idx + 1}.
                              </span>
                              <div className="flex-1">
                                <div className="font-semibold">
                                  {spot.spot_name}
                                </div>
                                <div className="text-muted-foreground text-[10px] mt-0.5">
                                  {spot.description}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-[10px]">
                                  <span className="text-yellow-600">
                                    ⏱️ {spot.estimated_time_spent}
                                  </span>
                                  {spot.weather && (
                                    <span className="text-blue-600">
                                      🌤️ {spot.weather}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {/* View Journey Flow Button */}
            <Button
              onClick={() => {
                console.log("🗺️ BUTTON CLICKED - View Journey Flow");
                console.log(
                  "🗺️ onViewJourneyFlow exists:",
                  !!onViewJourneyFlow
                );

                if (onViewJourneyFlow) {
                  console.log("🗺️ Calling onViewJourneyFlow...");
                  try {
                    onViewJourneyFlow();
                    console.log("🗺️ onViewJourneyFlow called successfully");
                  } catch (error) {
                    console.error("🗺️ Error calling onViewJourneyFlow:", error);
                  }
                } else {
                  console.error("🗺️ onViewJourneyFlow is not defined!");
                }
              }}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-all text-white"
            >
              <Map className="w-4 h-4 mr-2" />
              View Journey Flow
            </Button>

            {/* View Detailed Plan Button */}
            <Button
              onClick={() => {
                console.log("🔥 BUTTON CLICKED - View Detailed Plan");
                console.log("🔥 onViewDetails exists:", !!onViewDetails);
                console.log("🔥 onViewDetails type:", typeof onViewDetails);

                if (onViewDetails) {
                  console.log("🔥 Calling onViewDetails...");
                  try {
                    onViewDetails();
                    console.log("🔥 onViewDetails called successfully");
                  } catch (error) {
                    console.error("🔥 Error calling onViewDetails:", error);
                  }
                } else {
                  console.error("🔥 onViewDetails is not defined!");
                }
              }}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-all"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Detailed Plan
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => setShowEnhanceInput(!showEnhanceInput)}
                variant="outline"
                className="rounded-xl border-primary/30 hover:bg-primary/10"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Enhance
              </Button>
              <Button
                onClick={onFinalize}
                variant="outline"
                className="rounded-xl border-secondary/30 hover:bg-secondary/10"
              >
                Finalize Plan
              </Button>
            </div>
          </div>
        </Card>

        {/* Enhance Input - Shows below card, hides when enhancing */}
        <AnimatePresence>
          {showEnhanceInput && !isEnhancing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2"
            >
              <Input
                value={enhanceText}
                onChange={(e) => setEnhanceText(e.target.value)}
                placeholder="Add custom places or preferences..."
                className="rounded-xl"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleEnhance();
                  }
                }}
              />
              <Button onClick={handleEnhance} className="rounded-xl">
                Add
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State - Shows when enhancing */}
        <AnimatePresence>
          {isEnhancing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-center gap-2 p-3 bg-primary/10 rounded-xl border-2 border-primary/30"
            >
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="text-sm font-medium text-primary">
                Enhancing your plan...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: hsl(var(--muted));
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--primary));
          border-radius: 10px;
        }
      `}</style>
    </motion.div>
  );
};

export default ItineraryCard;
