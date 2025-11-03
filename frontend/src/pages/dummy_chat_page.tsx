import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, Sparkles, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import ChatMessage from "@/components/ChatMessage";
import ItineraryCard from "@/components/ItineraryCard";
import ItineraryDetailSheet from "@/components/ItineraryDetailSheet";
import SuccessModal from "@/components/SuccessModal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getConversations,
  saveConversation,
  type Conversation,
  type Message,
} from "@/lib/localStorage";

// --- INTERFACES BASED ON BACKEND RESPONSE ---
export interface ItineraryDayDetail {
  time: "Morning" | "Afternoon" | "Evening" | "Full Day" | string;
  activity: string;
  location: string;
}

export interface ItineraryPlanFromServer {
  id: string;
  title: string;
  short_desc: string;
  highlights: string[];
  days: ItineraryDayDetail[];
  duration?: string;
  budget?: string;
}

// --- INTERFACE FOR BACKEND RESPONSE ---
interface BackendResponse {
  response_type: "plans" | "flights" | "chat" | "error";
  message: string;
  plans?: ItineraryPlanFromServer[];
  flight_options?: any[];
  follow_up_questions?: string[];
}

// --- INTERFACE REQUIRED BY ItineraryDetailSheet ---
interface DayPlan {
  day: number;
  date: string;
  morning: string;
  afternoon: string;
  evening: string;
}

// --- MOCK INTERFACE FOR CARD DISPLAY ---
interface SimplifiedDayPlan {
  day: number;
  morning: string;
  afternoon: string;
  evening: string;
}

const API_URL = "http://127.0.0.1:5004/api/chat";

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showItineraries, setShowItineraries] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [itineraries, setItineraries] = useState<ItineraryPlanFromServer[]>([]);
  const [selectedItinerary, setSelectedItinerary] = useState<number | null>(
    null
  );
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hot queries - Indian destinations
  const hotQueries = [
    "5-day adventure in Leh Ladakh",
    "Romantic week in Goa beaches",
    "Cultural tour of Rajasthan",
    "Spiritual journey to Varanasi",
    "Beach paradise in Andaman",
  ];

  useEffect(() => {
    console.log("ChatPage component mounted");

    // Load conversations
    try {
      const loadedConversations = getConversations().slice(0, 2);
      setConversations(loadedConversations);
      console.log("Loaded conversations:", loadedConversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
      setConversations([]);
    }

    // Check for query params
    const destination = searchParams.get("destination");
    const query = searchParams.get("query");
    const type = searchParams.get("type");

    if (destination || query || type) {
      const initialQuery = destination || query || `Plan a ${type} trip`;
      console.log("Initial query from params:", initialQuery);
      handleSendMessage(initialQuery);
    } else {
      // Add welcome message
      console.log("Adding welcome message");
      addAssistantMessage(
        "Hello! 👋 I'm your AI travel assistant. Tell me where you'd like to go and I'll generate some custom plans!"
      );
    }
  }, [searchParams]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showItineraries]);

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

  // --- UPDATED API CALL FUNCTION ---
  const fetchTravelPlans = async (query: string) => {
    console.log("Fetching travel plans for query:", query);
    setIsLoading(true);
    addAssistantMessage("✨ Planning your perfect itinerary...");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BackendResponse = await response.json();
      console.log("Backend response:", data);

      setIsLoading(false);

      // Update follow-up questions from backend
      if (data.follow_up_questions && data.follow_up_questions.length > 0) {
        setFollowUpQuestions(data.follow_up_questions);
      } else {
        // Fallback follow-up questions
        setFollowUpQuestions([
          "Can you add more cultural experiences?",
          "What about food recommendations?",
          "Are there any adventure activities?",
        ]);
      }

      // Handle different response types
      if (data.response_type === "plans" && data.plans) {
        const plansFromServer = data.plans;
        setItineraries(plansFromServer);
        setShowItineraries(true);
        addAssistantMessage(
          data.message ||
            "Here are 3 personalized itineraries I've created for you!"
        );
      } else {
        addAssistantMessage(data.message || "I've received your request.");
        setShowItineraries(false);
      }
    } catch (error) {
      console.error("API Error:", error);
      setIsLoading(false);
      addAssistantMessage(
        "I encountered a connection issue. Please check if the backend server is running on port 5004."
      );
    }
  };

  const handleSendMessage = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    console.log("Sending message:", messageText);
    addUserMessage(messageText);
    setInput("");

    fetchTravelPlans(messageText);
  };

  const handleEnhancePlan = (cardIndex: number, customInput: string) => {
    if (!itineraries[cardIndex]) {
      console.error("Invalid card index:", cardIndex);
      return;
    }

    addUserMessage(
      `Enhance plan ${itineraries[cardIndex].title}: ${customInput}`
    );

    // Send enhancement request to backend
    fetchTravelPlans(`Enhance my itinerary: ${customInput}`);
  };

  const handleFinalizePlan = (cardIndex: number) => {
    if (!itineraries[cardIndex]) {
      console.error("Invalid card index:", cardIndex);
      return;
    }

    const planToFinalize = itineraries[cardIndex];
    const conversation: Conversation = {
      id: Date.now().toString(),
      title: `${planToFinalize.title} Plan`,
      messages,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      saveConversation(conversation);
      addAssistantMessage(
        `✅ Your **${planToFinalize.title}** plan has been finalized and saved!`
      );
      setShowSuccess(true);
    } catch (error) {
      console.error("Error saving conversation:", error);
      addAssistantMessage(
        "❌ There was an error saving your plan. Please try again."
      );
    }
  };

  // Helper function to convert the detailed plan for the summary card view
  const getSimplifiedCardPlans = (
    plan: ItineraryPlanFromServer
  ): SimplifiedDayPlan[] => {
    if (!plan.days || !Array.isArray(plan.days)) {
      console.warn("Invalid plan days:", plan);
      return [];
    }

    const daysMap = new Map<number, SimplifiedDayPlan>();

    plan.days.forEach((item, index) => {
      const dayNumber = Math.floor(index / 3) + 1;

      if (!daysMap.has(dayNumber)) {
        daysMap.set(dayNumber, {
          day: dayNumber,
          morning: "",
          afternoon: "",
          evening: "",
        });
      }

      const dayPlan = daysMap.get(dayNumber)!;
      const time = item.time?.toLowerCase() || "";

      if (time.includes("morning")) {
        dayPlan.morning = item.activity || "";
      } else if (time.includes("afternoon")) {
        dayPlan.afternoon = item.activity || "";
      } else if (time.includes("evening")) {
        dayPlan.evening = item.activity || "";
      } else if (time.includes("full day")) {
        dayPlan.morning = item.activity || "";
      }
    });

    return Array.from(daysMap.values()).slice(0, 2);
  };

  // Helper function for detail sheet mapping
  const mapPlanForDetailSheet = (plan: ItineraryPlanFromServer): DayPlan[] => {
    if (!plan.days || !Array.isArray(plan.days)) {
      console.warn("Invalid plan days for detail sheet:", plan);
      return [];
    }

    const dayPlansMap = new Map<number, DayPlan>();
    let dayCounter = 1;

    plan.days.forEach((item) => {
      const roughDayNumber = dayCounter;

      if (!dayPlansMap.has(roughDayNumber)) {
        dayPlansMap.set(roughDayNumber, {
          day: roughDayNumber,
          date: `Day ${roughDayNumber}`,
          morning: "",
          afternoon: "",
          evening: "",
        });
      }

      const dayPlan = dayPlansMap.get(roughDayNumber)!;
      const activityContent = `${item.activity || ""} ${
        item.location ? `(${item.location})` : ""
      }`.trim();
      const time = item.time?.toLowerCase() || "";

      if (time.includes("morning")) {
        dayPlan.morning = activityContent;
      } else if (time.includes("afternoon")) {
        dayPlan.afternoon = activityContent;
      } else if (time.includes("evening")) {
        dayPlan.evening = activityContent;
      } else if (time.includes("full day")) {
        if (!dayPlan.morning) {
          dayPlan.morning = activityContent;
        } else if (!dayPlan.afternoon) {
          dayPlan.afternoon = activityContent;
        } else {
          dayPlan.evening = activityContent;
        }
      }

      if (time.includes("evening") || time.includes("full day")) {
        dayCounter++;
      }
    });

    const finalPlans = Array.from(dayPlansMap.values()).map((plan) => ({
      ...plan,
      morning: plan.morning || "Leisure time / Breakfast",
      afternoon: plan.afternoon || "Leisure time / Lunch",
      evening: plan.evening || "Leisure time / Dinner",
    }));

    return finalPlans;
  };

  console.log("Rendering ChatPage with:", {
    messagesCount: messages.length,
    itinerariesCount: itineraries.length,
    isLoading,
    showItineraries,
    followUpQuestionsCount: followUpQuestions.length,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-16 h-screen flex">
        {/* Main Chat Area - 70% */}
        <div className="flex-1 flex flex-col">
          {/* Recent Conversations - Top Center */}
          {conversations.length > 0 && (
            <div className="border-b border-border bg-muted/30 px-6 py-4">
              <div className="flex items-center gap-3 justify-center flex-wrap">
                <span className="text-sm text-muted-foreground font-medium">
                  Recent:
                </span>
                {conversations.map((conv) => (
                  <motion.button
                    key={conv.id}
                    whileHover={{ scale: 1.02 }}
                    className="px-4 py-2 bg-card rounded-xl shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-all text-sm max-w-xs truncate"
                    onClick={() => {
                      setMessages(conv.messages);
                      setShowItineraries(false);
                    }}
                  >
                    {conv.title}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                />
              ))}

              {/* Loading Animation */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 text-primary my-4"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">
                    Planning your perfect itinerary...
                  </span>
                </motion.div>
              )}

              {/* Itinerary Cards */}
              {showItineraries && itineraries.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="my-8"
                >
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                    {itineraries.map((itinerary, index) => (
                      <ItineraryCard
                        key={index}
                        title={itinerary.title}
                        days={mapPlanForDetailSheet(itinerary).length}
                        budget={itinerary.budget || "TBD"}
                        // highlights={itinerary.highlights || []}
                        dayPlans={getSimplifiedCardPlans(itinerary)}
                        cardIndex={index}
                        onViewDetails={() => {
                          setSelectedItinerary(index);
                          setShowDetailSheet(true);
                        }}
                        onEnhance={handleEnhancePlan}
                        onFinalize={() => handleFinalizePlan(index)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Follow-up Questions */}
          {followUpQuestions.length > 0 && (
            <div className="border-t border-border px-6 py-3 bg-muted/30">
              <div className="max-w-4xl mx-auto flex gap-2 flex-wrap">
                {followUpQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendMessage(question)}
                    className="rounded-full shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)]"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-border p-6 bg-card">
            <div className="max-w-4xl mx-auto flex gap-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message..."
                className="resize-none rounded-2xl"
                rows={2}
              />
              <Button
                onClick={() => handleSendMessage()}
                className="rounded-2xl px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-[var(--shadow-medium)]"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Hot Queries Sidebar - 30% */}
        <div className="w-[30%] border-l border-border bg-muted/30 p-6 overflow-y-auto h-full">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Trending Queries
          </h3>
          <div className="space-y-3">
            {hotQueries.map((query, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02, x: 4 }}
                onClick={() => {
                  setInput(query);
                  setTimeout(() => handleSendMessage(query), 100);
                }}
                className="w-full text-left p-3 bg-card rounded-xl shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-all text-sm"
              >
                {query}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />

      {/* Detail Sheet */}
      {selectedItinerary !== null && itineraries[selectedItinerary] && (
        <ItineraryDetailSheet
          isOpen={showDetailSheet}
          onClose={() => setShowDetailSheet(false)}
          title={itineraries[selectedItinerary].title}
          days={mapPlanForDetailSheet(itineraries[selectedItinerary]).length}
          budget={itineraries[selectedItinerary].budget || "Negotiable"}
          dayPlans={mapPlanForDetailSheet(itineraries[selectedItinerary])}
        />
      )}
    </div>
  );
};

export default ChatPage;
