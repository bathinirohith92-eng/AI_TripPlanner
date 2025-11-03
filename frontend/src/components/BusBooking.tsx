import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Bus, Calendar, ChevronLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

import busBanner from "@/assets/bus-banner.jpg";

const BusBooking = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    from: "",
    to: "",
    date: "",
  });
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef(null);

  const mockBuses = [
    {
      id: 1,
      operator: "Volvo Travels",
      type: "AC Sleeper",
      departure: "22:00",
      arrival: "06:30",
      duration: "8h 30m",
      price: "₹1,299",
    },
    {
      id: 2,
      operator: "RedBus Express",
      type: "AC Semi-Sleeper",
      departure: "23:30",
      arrival: "08:00",
      duration: "8h 30m",
      price: "₹999",
    },
    {
      id: 3,
      operator: "VRL Travels",
      type: "Non-AC Seater",
      departure: "20:00",
      arrival: "04:30",
      duration: "8h 30m",
      price: "₹699",
    },
  ];

  const handleSearch = () => {
    setShowResults(true);
  };

  // ✅ Smooth scroll when results appear
  useEffect(() => {
    if (showResults && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    }
  }, [showResults]);

  // ✅ Navigate to payment page (fixed)
  const handleBookNow = (bus) => {
    navigate("/payment", {
      state: {
        bus: {
          ...bus,
          from: searchData.from,
          to: searchData.to,
          date: searchData.date,
        },
        bookingDetails: {
          passengers: 1,
          class: "Standard",
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Banner */}
      <section
        className="relative h-[40vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${busBanner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center"
        >
          <Bus className="w-16 h-16 text-white mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Book Your Bus
          </h1>
          <p className="text-white/90 text-lg">
            Comfortable journeys across India
          </p>
        </motion.div>
      </section>

      {/* Search Form */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-6 gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Planner
            </Button>

            <Card className="p-8 shadow-[var(--shadow-strong)] rounded-3xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">From</label>
                  <Input
                    placeholder="Bangalore"
                    value={searchData.from}
                    onChange={(e) =>
                      setSearchData({ ...searchData, from: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">To</label>
                  <Input
                    placeholder="Goa"
                    value={searchData.to}
                    onChange={(e) =>
                      setSearchData({ ...searchData, to: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date of Travel
                  </label>
                  <Input
                    type="date"
                    value={searchData.date}
                    onChange={(e) =>
                      setSearchData({ ...searchData, date: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>

              <Button
                onClick={handleSearch}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg font-semibold shadow-[var(--shadow-medium)]"
              >
                <Search className="w-5 h-5 mr-2" />
                Search Buses
              </Button>
            </Card>
          </motion.div>

          {/* Results */}
          {showResults && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 space-y-4"
            >
              <h2 className="text-2xl font-bold mb-4">Available Buses</h2>
              {mockBuses.map((bus, index) => (
                <motion.div
                  key={bus.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="p-6 hover:shadow-[var(--shadow-strong)] transition-all rounded-2xl">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Bus className="w-10 h-10 text-primary" />
                        <div>
                          <h3 className="font-bold text-lg">{bus.operator}</h3>
                          <p className="text-sm text-muted-foreground">
                            {bus.type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {bus.duration}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{bus.departure}</p>
                          <p className="text-sm text-muted-foreground">
                            {searchData.from || "BLR"}
                          </p>
                        </div>
                        <div className="text-muted-foreground">→</div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{bus.arrival}</p>
                          <p className="text-sm text-muted-foreground">
                            {searchData.to || "GOA"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {bus.price}
                        </p>
                        <Button
                          onClick={() => handleBookNow(bus)}
                          className="mt-2 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BusBooking;
