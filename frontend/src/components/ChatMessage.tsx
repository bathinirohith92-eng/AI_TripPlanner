import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import ItineraryCard from "./ItineraryCard";
import FlightCard from "./FlightCard";
import BusCard from "./BusCard";
import AccommodationCard from "./AccommodationCard";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  cards?: {
    type: "itinerary" | "flight" | "bus" | "accommodation";
    data: any[];
  };
  onLike?: (index: number, itinerary?: any) => void;
  onCompare?: (index: number, itinerary?: any) => void;
  onViewDetails?: (index: number, itinerary?: any) => void;
  onViewJourneyFlow?: (index: number, itinerary?: any) => void;
  onEnhance?: (index: number, customInput: string) => void;
  onFinalize?: (index: number) => void;
  likedPlans?: number[];
  comparePlans?: number[];
  enhancingCards?: Set<number>;
}

const ChatMessage = ({
  role,
  content,
  cards,
  onLike,
  onCompare,
  onViewDetails,
  onViewJourneyFlow,
  onEnhance,
  onFinalize,
  likedPlans = [],
  comparePlans = [],
  enhancingCards = new Set(),
}: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div className="mb-4">
      {/* Message Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-end gap-2 ${
          isUser ? "justify-end" : "justify-start"
        }`}
      >
        {/* Bot Avatar */}
        {!isUser && (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`${
            isUser ? "max-w-[85%]" : "max-w-[90%]"
          } px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-md ${
            isUser
              ? "bg-gradient-to-br from-green-100 to-green-50 text-gray-900 rounded-br-none"
              : "bg-gradient-to-br from-white to-gray-50 text-gray-900 rounded-bl-none"
          }`}
          style={{
            backgroundImage: isUser
              ? "linear-gradient(135deg, #dcf8c6 0%, #ffffff 100%)" // WhatsApp user-like greenish bubble
              : "linear-gradient(135deg, #ffffff 0%, #f1f1f1 100%)", // assistant bubble
          }}
        >
          <p>{content}</p>
        </div>

        {/* User Avatar */}
        {isUser && (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
      </motion.div>

      {/* Cards Section - Only for assistant messages */}
      {!isUser && cards && (
        <div className="mt-3 ml-11">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            {cards.type === "itinerary" &&
              cards.data.map((itinerary, index) => (
                <ItineraryCard
                  key={index}
                  title={itinerary.title}
                  totalDays={itinerary.durationDays}
                  budget={itinerary.budget || "Custom"}
                  short_desc={itinerary.short_desc}
                  highlights={itinerary.highlights || []}
                  {...itinerary}
                  cardIndex={index}
                  isLiked={likedPlans.includes(index)}
                  isCompared={comparePlans.includes(index)}
                  onLike={() => onLike?.(index, itinerary)}
                  onCompare={() => onCompare?.(index, itinerary)}
                  onViewDetails={() => onViewDetails?.(index, itinerary)}
                  onViewJourneyFlow={() =>
                    onViewJourneyFlow?.(index, itinerary)
                  }
                  onEnhance={(cardIndex, customInput) =>
                    onEnhance?.(cardIndex, customInput)
                  }
                  onFinalize={() => onFinalize?.(index)}
                  isEnhancing={enhancingCards.has(index)}
                />
              ))}

            {cards.type === "flight" &&
              cards.data.map((flight, index) => (
                <FlightCard
                  key={index}
                  flight={flight}
                  index={index}
                  total={cards.data.length}
                />
              ))}

            {cards.type === "bus" &&
              cards.data.map((busRoute, index) => (
                <BusCard
                  key={index}
                  route={busRoute}
                  routeName={busRoute.routeName || `Route ${index + 1}`}
                  index={index}
                  total={cards.data.length}
                  isEnhancing={false}
                  onEnhance={() => console.log("Enhance bus route:", index)}
                />
              ))}

            {cards.type === "accommodation" &&
              cards.data.map((accommodation, index) => (
                <AccommodationCard
                  key={index}
                  accommodation={accommodation}
                  index={index}
                  total={cards.data.length}
                  isEnhancing={false}
                  onEnhance={() => console.log("Enhance accommodation:", index)}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
