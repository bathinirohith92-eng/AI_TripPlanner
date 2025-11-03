import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Sparkles,
  Heart,
  Map,
  Compass,
  PartyPopper,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import DestinationCard from "@/components/DestinationCard";
import TripTypeButton from "@/components/TripTypeButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import heroImage from "@/assets/hero-tropical.jpg";
import jaipurImg from "@/assets/dest-jaipur.jpg";
import lehImg from "@/assets/dest-leh.jpg";
import goaImg from "@/assets/dest-goa.jpg";
import andamanImg from "@/assets/dest-andaman.jpg";
import rishikeshImg from "@/assets/dest-rishikesh.jpg";
import varanasiImg from "@/assets/dest-varanasi.jpg";
import WhyChooseSection from "@/components/WhyChooseSection";

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const destinations = [
    { name: "Goa", image: goaImg },
    { name: "Andaman", image: andamanImg },
    {
      name: "South India",
      image:
        "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
    },
    { name: "Varanasi", image: varanasiImg },
    {
      name: "China",
      image:
        "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80",
    },
    { name: "Leh India", image: lehImg },
  ];

  const tripTypes = [
    { icon: Sparkles, label: "Easy Book", badge: "NEW" },
    { icon: Heart, label: "Honeymoon" },
    { icon: Map, label: "Pilgrimage" },
    { icon: Compass, label: "Luxury" },
    { icon: PartyPopper, label: "Adventure" },
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/chat?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/chat");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section
        className="relative h-[70vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-serif text-5xl md:text-7xl text-white mb-4 drop-shadow-2xl"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            Tour Planner
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-4xl font-bold text-white mb-8 drop-shadow-lg"
          >
            Where Every Experience Counts!
          </motion.h2>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-3 max-w-2xl mx-auto"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Plan your trip with AI..."
                className="pl-12 h-12 md:h-14 rounded-full text-base md:text-lg bg-white/95 backdrop-blur border-0 shadow-[var(--shadow-strong)] focus:shadow-[var(--shadow-glow)]"
              />
            </div>
            <Button
              onClick={handleSearch}
              className="h-12 md:h-14 px-6 md:px-8 rounded-full text-base md:text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-[var(--shadow-medium)] hover:shadow-[var(--shadow-glow)] transition-all"
            >
              Ask AI
            </Button>
          </motion.div>

          {/* Trip Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-4 mt-8 flex-wrap"
          >
            {tripTypes.map((type, index) => (
              <motion.div
                key={type.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                className="scale-[0.8]"
              >
                <TripTypeButton
                  icon={type.icon}
                  label={type.label}
                  badge={type.badge}
                  onClick={() =>
                    navigate(`/chat?type=${type.label.toLowerCase()}`)
                  }
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Trending Destinations */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-4xl font-bold mb-3">
              Trending Indian Destinations
            </h2>
            <p className="text-muted-foreground text-lg">
              Discover the most popular travel spots across incredible India
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {destinations.map((dest, index) => (
              <DestinationCard
                key={dest.name}
                name={dest.name}
                image={dest.image}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <WhyChooseSection />
    </div>
  );
};

export default LandingPage;
