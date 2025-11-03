import { motion, AnimatePresence } from "framer-motion";
import { Bus, Clock, MapPin, ArrowRight, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import BusPayment from "@/components/BusPayment";

interface BusDetails {
  operator?: string;
  name?: string;
  route?: string;
  from?: string;
  to?: string;
  bus_trip_time?: string;
  trip_time?: string;
}

interface BusRoute {
  route_no: number;
  bus_type?: string;
  start_address?: string;
  end_address?: string;
  start?: string;
  destination?: string;
  distance?: string;
  duration?: string;
  time_for_trip?: string;
  estimated_price?: string;
  type?: string;
  buses?: BusDetails[];
}

interface BusCardProps {
  route: BusRoute;
  routeName?: string;
  index: number;
  total: number;
  isEnhancing?: boolean;
  onEnhance?: (cardIndex: number, customInput: string) => void;
  onBook?: () => void;
}

const BusCard = ({
  route,
  routeName,
  index,
  total,
  isEnhancing = false,
  onEnhance,
  onBook,
}: BusCardProps) => {
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);
  const [showEnhanceInput, setShowEnhanceInput] = useState(false);
  const [enhanceText, setEnhanceText] = useState("");

  // Gradient sets
  const bgColors = [
    "bg-gradient-to-br from-emerald-50 to-emerald-100",
    "bg-gradient-to-br from-amber-50 to-amber-100",
    "bg-gradient-to-br from-cyan-50 to-cyan-100",
    "bg-gradient-to-br from-rose-50 to-rose-100",
  ];
  const accentColors = [
    "text-emerald-600",
    "text-amber-600",
    "text-cyan-600",
    "text-rose-600",
  ];

  const bgColor = bgColors[index % bgColors.length];
  const accentColor = accentColors[index % accentColors.length];

  const handleBookNow = () => {
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    if (onBook) {
      onBook();
    }
  };

  // Convert route data to match BusPayment component interface
  const selectedRoute = {
    id: index + 1,
    routeName: routeName || route.routeName || `Route ${index + 1}`,
    duration: route.duration || route.time_for_trip || "8 hours",
    buses: (route.buses || []).map((bus) => ({
      operator: bus.operator || bus.name || "Bus Service",
      from: bus.from || route.start_address || route.start || "Origin",
    })),
    price:
      parseInt((route.estimated_price || "450").replace(/[^0-9]/g, "")) || 450,
    departureTime: "08:00 AM", // Default departure time
    arrivalTime: "04:00 PM", // Default arrival time
  };

  const handleEnhance = () => {
    if (enhanceText.trim() && onEnhance) {
      setShowEnhanceInput(false);
      onEnhance(index, enhanceText.trim());
      setEnhanceText("");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{
          opacity: isEnhancing ? [1, 0.6, 1] : 1,
          x: 0,
        }}
        transition={{
          delay: index * 0.1,
          opacity: isEnhancing
            ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            : {},
        }}
        className="flex-shrink-0 w-[360px]"
      >
        <div className="flex flex-col h-full space-y-3">
          <Card
            className={`${bgColor} border-2 hover:shadow-lg transition-all p-4 sm:p-5 relative flex flex-col justify-between h-[420px] ${
              isEnhancing ? "border-primary animate-pulse" : ""
            }`}
          >
            {/* HEADER */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center">
                  <Bus className={`w-6 h-6 ${accentColor}`} />
                </div>
                <div>
                  <div className="font-bold text-lg">
                    {routeName || route.routeName || `Route ${index + 1}`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {route.bus_type || route.type || "Bus Route"}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1 text-sm mb-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">
                    {route.duration ||
                      route.time_for_trip ||
                      "Duration not available"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span className="font-semibold">
                    {route.start_address || route.start || "Origin"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                  <span className="font-semibold">
                    {route.end_address || route.destination || "Destination"}
                  </span>
                </div>
              </div>
            </div>

            {/* BUSES SECTION */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 mb-4">
              <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
                {route.bus_type === "Direct Bus"
                  ? "Direct Route"
                  : "Connected Buses"}
              </div>
              {(route.buses ?? []).map((bus, idx) => (
                <div
                  key={idx}
                  className="bg-white/60 rounded-lg p-3 border border-border/50 mb-2"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">
                        {bus.operator || bus.name || "Bus Service"}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">
                          {bus.route ||
                            `${bus.from || "Start"} → ${bus.to || "End"}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {bus.bus_trip_time || bus.trip_time || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PRICE + BUTTON */}
            <div className="border-t pt-3 mt-auto flex items-end justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Starting at
                </div>
                <div className="text-2xl font-bold text-primary">
                  {route.estimated_price || "₹450"}
                  <span className="text-sm font-normal text-muted-foreground">
                    /seat
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                className="rounded-full px-4 bg-primary hover:bg-primary/90"
                onClick={handleBookNow}
              >
                Book Now
              </Button>
            </div>

            {/* CARD INDEX */}
            <div className="absolute top-3 right-3">
              <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                {index + 1}/{total}
              </div>
            </div>
          </Card>

          {/* ENHANCE INPUT */}
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
                  onKeyPress={(e) => e.key === "Enter" && handleEnhance()}
                />
                <Button onClick={handleEnhance} className="rounded-xl">
                  Add
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* LOADING STATE */}
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
                  Enhancing your route...
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPayment(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10"
                onClick={() => setShowPayment(false)}
              >
                <X className="w-4 h-4" />
              </Button>
              <BusPayment
                selectedRoute={selectedRoute}
                onBack={() => setShowPayment(false)}
                onPaymentSuccess={handlePaymentSuccess}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BusCard;
