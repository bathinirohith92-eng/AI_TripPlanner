import { motion } from "framer-motion";
// import { Sparkles, CloudSun, Utensils, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Sparkles,
  Sliders,
  CloudSun,
  Calendar,
  Wallet,
  Globe2,
  MapPinned,
} from "lucide-react";

const WhyChooseSection = () => {
  const benefits = [
    {
      icon: Sparkles,
      title: "Intelligent Plan Validation",
      description:
        "We create and validate every itinerary across multiple factors — budget, distance, timing, and preferences — ensuring a perfectly optimized experience for each traveler.",
      color: "from-primary/20 to-primary/5",
      animation: "animate-fade-up",
    },
    {
      icon: Sliders,
      title: "AI-Powered Customization",
      description:
        "Get hyper-personalized itineraries tuned to your interests, mood, and travel style — powered by adaptive AI models that learn your preferences.",
      color: "from-accent/20 to-accent/5",
      animation: "animate-float",
    },
    {
      icon: CloudSun,
      title: "Real-Time Sync",
      description:
        "Stay updated with live weather forecasts, hotel availability, and activity slots — so your plans always stay relevant and accurate.",
      color: "from-secondary/20 to-secondary/5",
      animation: "animate-pulse",
    },
    {
      icon: Calendar,
      title: "Automated Smart Booking",
      description:
        "Once your perfect plan is ready, our system automatically manages flights, hotels, and activities — ensuring a fully coordinated travel experience.",
      color: "from-primary/20 to-primary/5",
      animation: "animate-fade-up",
    },
    {
      icon: MapPinned,
      title: "View & Compare Across Plans",
      description:
        "Compare multiple itineraries side by side — explore routes, destinations, and experiences to find the plan that truly fits your vibe.",
      color: "from-accent/20 to-accent/5",
      animation: "animate-float",
    },
    {
      icon: Wallet,
      title: "Smart Budget Planning",
      description:
        "Discover travel options perfectly aligned with your budget — we balance cost, comfort, and convenience so you get the best of all worlds.",
      color: "from-secondary/20 to-secondary/5",
      animation: "animate-pulse",
    },
    {
      icon: Globe2,
      title: "Explore Like Ancient Travelers",
      description:
        "See your entire adventure visualized on an interactive map — uncovering hidden paths and legendary routes like the explorers of old.",
      color: "from-primary/20 to-primary/5",
      animation: "animate-float",
    },
  ];
  
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-3">
            Why Choose ItineraAI Tour Planner?
          </h2>
          <p className="text-muted-foreground text-lg">
            Your intelligent companion for discovering incredible India
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`p-6 h-full rounded-3xl shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-all hover:scale-105 bg-gradient-to-br ${benefit.color}`}
              >
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
