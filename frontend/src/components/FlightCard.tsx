import { motion, AnimatePresence } from "framer-motion";
import { Plane, MapPin, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FlightPayment from "@/components/FlightPayment";

interface FlightOption {
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

interface FlightCardProps {
  flight: FlightOption;
  index: number;
  total: number;
  onBook?: () => void;
}

const FlightCard = ({ flight, index, total, onBook }: FlightCardProps) => {
  // Removed isSaved state since bookmark functionality was removed
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);

  // Alternate gradient color sets for variety
  const bgColors = [
    "bg-gradient-to-br from-blue-50 to-blue-100",
    "bg-gradient-to-br from-purple-50 to-purple-100",
    "bg-gradient-to-br from-green-50 to-green-100",
    "bg-gradient-to-br from-orange-50 to-orange-100",
  ];

  const accentColors = [
    "text-blue-600",
    "text-purple-600",
    "text-green-600",
    "text-orange-600",
  ];

  const bgColor = bgColors[index % bgColors.length];
  const accentColor = accentColors[index % accentColors.length];

  // ✅ Handle Book Now
  const handleBookNow = () => {
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    if (onBook) {
      onBook();
    }
  };

  // Convert flight data for payment
  // Convert flight data to match FlightPayment interface
  const flightData = {
    id: parseInt(flight.id.replace(/[^0-9]/g, "")) || index + 1, // Convert UUID to number
    airline:
      flight.carrier === "AI"
        ? "Air India"
        : flight.carrier === "6E"
        ? "IndiGo"
        : flight.carrier === "SG"
        ? "SpiceJet"
        : flight.carrier === "UK"
        ? "Vistara"
        : flight.carrier === "G8"
        ? "Go First"
        : flight.carrier,
    logo: "", // FlightPayment expects this field
    departureTime: flight.departure_time,
    arrivalTime: flight.arrival_time,
    duration: flight.duration,
    price: Math.round(flight.price_inr).toString(), // Convert to string as expected
  };

  const searchData = {
    from: flight.origin_iata,
    to: flight.destination_iata,
    departure: new Date().toISOString().split("T")[0],
    passengers: "1", // Convert to string as expected
    class: "Economy",
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="flex-shrink-0 w-[360px] min-h-[440px] h-auto"
      >
        <Card
          className={`${bgColor} border-2 hover:shadow-lg transition-all p-4 sm:p-5 relative h-full flex flex-col overflow-hidden`}
        >
          {/* Bookmark removed as requested */}

          {/* Header with Carrier & Flight Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center">
                <Plane className={`w-6 h-6 ${accentColor}`} />
              </div>
              <div>
                <div className="font-bold text-lg">
                  {flight.carrier === "AI"
                    ? "Air India"
                    : flight.carrier === "6E"
                    ? "IndiGo"
                    : flight.carrier === "SG"
                    ? "SpiceJet"
                    : flight.carrier === "UK"
                    ? "Vistara"
                    : flight.carrier === "G8"
                    ? "Go First"
                    : flight.carrier}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  {flight.flight_number} •{" "}
                  {flight.is_direct ? "Non-stop" : "Connecting"}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">
                Flight {index + 1}/{total}
              </div>
              <div className="text-xs font-medium text-primary">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* Flight Route with Enhanced Info */}
          <div className="bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl p-4 mb-4">
            <div className="space-y-3">
              {/* Departure */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className={`font-bold text-xl ${accentColor}`}>
                      {flight.departure_time}
                    </div>
                    <div className="text-sm font-medium">
                      {flight.origin_iata === "MAA"
                        ? "Chennai (MAA)"
                        : flight.origin_iata === "DEL"
                        ? "Delhi (DEL)"
                        : flight.origin_iata === "BOM"
                        ? "Mumbai (BOM)"
                        : flight.origin_iata === "BLR"
                        ? "Bangalore (BLR)"
                        : `${flight.origin_iata}`}
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>Departure</div>
                  <div className="font-medium">Terminal 1</div>
                </div>
              </div>

              {/* Flight Path with Duration */}
              <div className="flex items-center gap-2 px-4">
                <div className="flex-1 border-t-2 border-dashed border-primary/30"></div>
                <div className="bg-primary/10 px-3 py-1 rounded-full">
                  <div className="text-xs font-bold text-primary">
                    {flight.duration}
                  </div>
                </div>
                <div className="flex-1 border-t-2 border-dashed border-primary/30"></div>
              </div>

              {/* Arrival */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <div className={`font-bold text-xl ${accentColor}`}>
                      {flight.arrival_time}
                    </div>
                    <div className="text-sm font-medium">
                      {flight.destination_iata === "MAA"
                        ? "Chennai (MAA)"
                        : flight.destination_iata === "DEL"
                        ? "Delhi (DEL)"
                        : flight.destination_iata === "BOM"
                        ? "Mumbai (BOM)"
                        : flight.destination_iata === "BLR"
                        ? "Bangalore (BLR)"
                        : `${flight.destination_iata}`}
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>Arrival</div>
                  <div className="font-medium">Terminal 3</div>
                </div>
              </div>
            </div>
          </div>

          {/* Flight Details & Amenities */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                  flight.is_direct
                    ? "bg-green-500/20 text-green-700"
                    : "bg-orange-500/20 text-orange-700"
                }`}
              >
                {flight.is_direct ? "✈️ Non-stop" : "🔄 1 Stop"}
              </span>
              <span className="text-xs bg-blue-500/20 text-blue-700 px-2 py-1 rounded-full font-medium">
                Economy Class
              </span>
            </div>

            {/* Amenities */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Baggage: 15kg</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Meals Included</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>Free Cancellation</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span>Seat Selection</span>
              </div>
            </div>
          </div>

          {/* Price + Button */}
          <div className="border-t pt-3 mt-auto">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Price per adult
                </div>
                <div className="text-2xl font-bold text-primary">
                  ₹{flight.price_inr.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  Incl. taxes & fees • Refundable
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
          </div>

          {/* Card Index removed as requested */}
        </Card>
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
              <FlightPayment
                selectedFlight={flightData}
                searchData={searchData}
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

export default FlightCard;
