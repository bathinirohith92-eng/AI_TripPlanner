import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Bot, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BookingChatBotProps {
  pageType: "flight" | "bus" | "hotel" | "holiday";
}

const BookingChatBot = ({ pageType }: BookingChatBotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  // Auto-open chatbot after 2 seconds
  useEffect(() => {
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1000); // Show button after 1 second

    const openTimer = setTimeout(() => {
      setIsOpen(true);
      setShowFollowUp(true);
    }, 2000); // Auto-open after 2 seconds

    return () => {
      clearTimeout(showTimer);
      clearTimeout(openTimer);
    };
  }, []);

  const getPageContent = () => {
    switch (pageType) {
      case "flight":
        return {
          title: "Flight Booking Assistant",
          message: "Don't need to book manually! I can help you find and book the perfect flight based on your preferences.",
          icon: "✈️"
        };
      case "bus":
        return {
          title: "Bus Booking Assistant", 
          message: "Don't need to book manually! I can help you find and book the best bus routes for your journey.",
          icon: "🚌"
        };
      case "hotel":
        return {
          title: "Hotel Booking Assistant",
          message: "Don't need to book manually! I can help you find and book the perfect hotel for your stay.",
          icon: "🏨"
        };
      case "holiday":
        return {
          title: "Holiday Planning Assistant",
          message: "Don't need to plan manually! I can help you create the perfect holiday itinerary with flights, hotels, and activities.",
          icon: "🏖️"
        };
      default:
        return {
          title: "Travel Assistant",
          message: "How can I help you with your travel plans?",
          icon: "🤖"
        };
    }
  };

  const content = getPageContent();

  const handleOpen = () => {
    setIsOpen(true);
    setShowFollowUp(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowFollowUp(false);
  };

  const handleProceed = () => {
    navigate("/chat");
  };

  const handleMaybeLater = () => {
    setIsOpen(false);
    setShowFollowUp(false);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              x: [0, -3, 3, -2, 2, 0], // Cute vibration animation
              rotate: [0, -2, 2, -1, 1, 0]
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              scale: { type: "spring", stiffness: 200, damping: 15 },
              opacity: { duration: 0.3 },
              x: { 
                duration: 0.6, 
                repeat: Infinity, 
                repeatDelay: 3,
                ease: "easeInOut"
              },
              rotate: { 
                duration: 0.6, 
                repeat: Infinity, 
                repeatDelay: 3,
                ease: "easeInOut"
              }
            }}
            className="fixed bottom-6 right-6 z-50"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleOpen}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-secondary shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                size="icon"
              >
                {/* Pulse effect */}
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-white rounded-full"
                />
                <MessageCircle className="w-6 h-6 text-white relative z-10" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-80 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{content.title}</h3>
                    <p className="text-xs text-white/80">AI Assistant</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="text-white hover:bg-white/20 w-8 h-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Chat Content */}
            <div className="p-4 space-y-4">
              {/* Bot Message */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">{content.icon}</span>
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm p-3 max-w-[240px]">
                  <p className="text-sm text-foreground">{content.message}</p>
                </div>
              </motion.div>

              {/* Follow-up Options */}
              {showFollowUp && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  <p className="text-xs text-muted-foreground text-center">
                    Would you like me to help you?
                  </p>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleProceed}
                      className="flex-1 bg-gradient-to-r from-primary to-secondary text-white text-sm h-9"
                    >
                      <ArrowRight className="w-4 h-4 mr-1" />
                      Proceed
                    </Button>
                    <Button
                      onClick={handleMaybeLater}
                      variant="outline"
                      className="flex-1 text-sm h-9"
                    >
                      Maybe Later
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Typing Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: showFollowUp ? 0 : 1 }}
              className="px-4 pb-4"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bot className="w-3 h-3" />
                </div>
                <div className="flex gap-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    className="w-1 h-1 bg-muted-foreground/50 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    className="w-1 h-1 bg-muted-foreground/50 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    className="w-1 h-1 bg-muted-foreground/50 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BookingChatBot;
