import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import FilterDropdown, { FilterState } from "@/components/FilterDropdown";
import BookingChatBot from "@/components/BookingChatBot";
import {
  Search,
  Filter,
  Plane,
  Building,
  Church,
  Mountain,
  Utensils,
  Calendar,
  ShoppingBag,
  Waves,
  TreePine,
  Camera,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const destinations = [
  {
    id: "singapore",
    name: "Singapore",
    subtitle: "SOUTHEAST ASIA · SINGAPORE",
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80",
    flightPrice: "₹15K",
    hotelPrice: "₹4,000/night",
  },
  {
    id: "bangkok",
    name: "Bangkok",
    subtitle: "BANGKOK · THAILAND",
    image:
      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80",
    flightPrice: "₹22K",
    hotelPrice: "₹5,200/night",
  },
  {
    id: "dubai",
    name: "Dubai",
    subtitle: "DUBAI · UNITED ARAB EMIRATES",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    flightPrice: "₹21K",
    hotelPrice: "₹5,000/night",
  },
  {
    id: "doha",
    name: "Doha",
    subtitle: "DOHA · QATAR",
    image:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80",
    flightPrice: "₹18K",
    hotelPrice: "₹4,500/night",
  },
  {
    id: "phuket",
    name: "Phuket",
    subtitle: "PHUKET PROVINCE · THAILAND",
    image:
      "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80",
    flightPrice: "₹24K",
    hotelPrice: "₹3,800/night",
  },
  {
    id: "pattaya",
    name: "Pattaya",
    subtitle: "CHONBURI · THAILAND",
    image:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
    flightPrice: "₹23K",
    hotelPrice: "₹4,200/night",
  },
];

const categories = [
  {
    icon: Church,
    label: "Religious",
    color: "text-purple-600",
    destinations: [
      {
        name: "Varanasi",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&q=80",
        price: "₹8K",
      },
      {
        name: "Jerusalem",
        country: "Israel",
        image:
          "https://images.unsplash.com/photo-1544966503-7cc5ac882d5d?w=800&q=80",
        price: "₹45K",
      },
      {
        name: "Vatican City",
        country: "Italy",
        image:
          "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800&q=80",
        price: "₹65K",
      },
      {
        name: "Mecca",
        country: "Saudi Arabia",
        image:
          "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80",
        price: "₹35K",
      },
    ],
  },
  {
    icon: Mountain,
    label: "Cultural",
    color: "text-blue-600",
    destinations: [
      {
        name: "Kyoto",
        country: "Japan",
        image:
          "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
        price: "₹55K",
      },
      {
        name: "Paris",
        country: "France",
        image:
          "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&q=80",
        price: "₹70K",
      },
      {
        name: "Istanbul",
        country: "Turkey",
        image:
          "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&q=80",
        price: "₹40K",
      },
      {
        name: "Rajasthan",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80",
        price: "₹12K",
      },
    ],
  },
  {
    icon: TreePine,
    label: "Nature",
    color: "text-green-600",
    destinations: [
      {
        name: "Costa Rica",
        country: "Central America",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        price: "₹85K",
      },
      {
        name: "New Zealand",
        country: "Oceania",
        image:
          "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&q=80",
        price: "₹95K",
      },
      {
        name: "Kerala",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80",
        price: "₹15K",
      },
      {
        name: "Iceland",
        country: "Europe",
        image:
          "https://images.unsplash.com/photo-1539066834862-2e0c2e2c9c2c?w=800&q=80",
        price: "₹80K",
      },
    ],
  },
  {
    icon: Utensils,
    label: "Food",
    color: "text-orange-600",
    destinations: [
      {
        name: "Bangkok",
        country: "Thailand",
        image:
          "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80",
        price: "₹22K",
      },
      {
        name: "Tokyo",
        country: "Japan",
        image:
          "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
        price: "₹60K",
      },
      {
        name: "Mumbai",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80",
        price: "₹8K",
      },
      {
        name: "Istanbul",
        country: "Turkey",
        image:
          "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80",
        price: "₹40K",
      },
    ],
  },
  {
    icon: Calendar,
    label: "Festivals",
    color: "text-pink-600",
    destinations: [
      {
        name: "Rio de Janeiro",
        country: "Brazil",
        image:
          "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80",
        price: "₹90K",
      },
      {
        name: "Munich",
        country: "Germany",
        image:
          "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80",
        price: "₹65K",
      },
      {
        name: "Goa",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
        price: "₹12K",
      },
      {
        name: "Edinburgh",
        country: "Scotland",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        price: "₹70K",
      },
    ],
  },
  {
    icon: Camera,
    label: "Historical",
    color: "text-amber-600",
    destinations: [
      {
        name: "Rome",
        country: "Italy",
        image:
          "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&q=80",
        price: "₹60K",
      },
      {
        name: "Cairo",
        country: "Egypt",
        image:
          "https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=800&q=80",
        price: "₹45K",
      },
      {
        name: "Agra",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80",
        price: "₹8K",
      },
      {
        name: "Athens",
        country: "Greece",
        image:
          "https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80",
        price: "₹50K",
      },
    ],
  },
  {
    icon: ShoppingBag,
    label: "Shopping",
    color: "text-indigo-600",
    destinations: [
      {
        name: "Dubai",
        country: "UAE",
        image:
          "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
        price: "₹21K",
      },
      {
        name: "Singapore",
        country: "Southeast Asia",
        image:
          "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80",
        price: "₹15K",
      },
      {
        name: "New York",
        country: "USA",
        image:
          "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
        price: "₹85K",
      },
      {
        name: "Milan",
        country: "Italy",
        image:
          "https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=800&q=80",
        price: "₹65K",
      },
    ],
  },
  {
    icon: Waves,
    label: "Beaches",
    color: "text-cyan-600",
    destinations: [
      {
        name: "Maldives",
        country: "Indian Ocean",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        price: "₹75K",
      },
      {
        name: "Phuket",
        country: "Thailand",
        image:
          "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80",
        price: "₹24K",
      },
      {
        name: "Goa",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
        price: "₹12K",
      },
      {
        name: "Bali",
        country: "Indonesia",
        image:
          "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&q=80",
        price: "₹30K",
      },
    ],
  },
  {
    icon: Mountain,
    label: "Mountains",
    color: "text-gray-600",
    destinations: [
      {
        name: "Swiss Alps",
        country: "Switzerland",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        price: "₹90K",
      },
      {
        name: "Himalayas",
        country: "Nepal",
        image:
          "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        price: "₹25K",
      },
      {
        name: "Manali",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        price: "₹10K",
      },
      {
        name: "Patagonia",
        country: "Argentina",
        image:
          "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        price: "₹95K",
      },
    ],
  },
  {
    icon: TreePine,
    label: "Outdoors",
    color: "text-emerald-600",
    destinations: [
      {
        name: "Banff",
        country: "Canada",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        price: "₹80K",
      },
      {
        name: "Queenstown",
        country: "New Zealand",
        image:
          "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&q=80",
        price: "₹95K",
      },
      {
        name: "Rishikesh",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        price: "₹8K",
      },
      {
        name: "Patagonia",
        country: "Chile",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        price: "₹90K",
      },
    ],
  },
  {
    icon: Sparkles,
    label: "Nightlife",
    color: "text-violet-600",
    destinations: [
      {
        name: "Las Vegas",
        country: "USA",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        price: "₹85K",
      },
      {
        name: "Bangkok",
        country: "Thailand",
        image:
          "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80",
        price: "₹22K",
      },
      {
        name: "Mumbai",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80",
        price: "₹8K",
      },
      {
        name: "Berlin",
        country: "Germany",
        image:
          "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80",
        price: "₹65K",
      },
    ],
  },
  {
    icon: Building,
    label: "Luxury",
    color: "text-yellow-600",
    destinations: [
      {
        name: "Dubai",
        country: "UAE",
        image:
          "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
        price: "₹21K",
      },
      {
        name: "Monaco",
        country: "Europe",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        price: "₹120K",
      },
      {
        name: "Udaipur",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80",
        price: "₹18K",
      },
      {
        name: "Singapore",
        country: "Southeast Asia",
        image:
          "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80",
        price: "₹15K",
      },
    ],
  },
];

const HolidayPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    categories: [],
    budget: "",
    travelTime: "",
    weather: [],
  });
  const navigate = useNavigate();

  const handleApplyFilters = (filters: FilterState) => {
    setAppliedFilters(filters);
    // Filter logic would be implemented here
  };

  const handleDestinationClick = (destinationId: string) => {
    navigate(`/destination/${destinationId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Category Icons */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-6 overflow-x-auto pb-4">
              {categories.map((category, index) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.label;
                return (
                  <motion.button
                    key={category.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() =>
                      setSelectedCategory(isSelected ? null : category.label)
                    }
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all min-w-[80px] ${
                      isSelected
                        ? "bg-primary/10 border-2 border-primary shadow-lg scale-105"
                        : "hover:bg-muted/50 border-2 border-transparent"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center ${
                        isSelected ? "shadow-lg" : ""
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${category.color}`} />
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isSelected ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {category.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Search Bar - Smaller and Cuter */}
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="✈️ Where do you want to go?"
                  className="w-full pr-12 h-12 rounded-full border-2 border-muted-foreground/20 focus:border-primary bg-white/80 backdrop-blur-sm shadow-lg text-center placeholder:text-muted-foreground/60"
                />
                <Search className="w-5 h-5 text-muted-foreground absolute right-4 top-1/2 -translate-y-1/2" />
              </div>
              <Button
                onClick={() => setIsFilterOpen(true)}
                variant="outline"
                size="lg"
                className="h-12 px-6 rounded-full border-2 border-primary/30 hover:bg-primary/10 hover:border-primary shadow-lg"
              >
                <Filter className="w-5 h-5 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          {/* Destination Cards - Better Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {destinations.map((destination, index) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleDestinationClick(destination.id)}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="aspect-[4/5] relative overflow-hidden rounded-3xl">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 rounded-3xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                    {/* Floating Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1">
                        <span className="text-white text-xs font-semibold">
                          Popular
                        </span>
                      </div>
                    </div>

                    {/* Destination Info Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <h3 className="text-white text-xl font-bold mb-2">
                        {destination.name}
                      </h3>
                      <p className="text-white/80 text-sm tracking-wide mb-4">
                        {destination.subtitle}
                      </p>

                      {/* Price Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-3 py-1">
                            <Plane className="w-4 h-4 text-white" />
                            <span className="text-white font-semibold text-sm">
                              {destination.flightPrice}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-3 py-1">
                            <Building className="w-4 h-4 text-white" />
                            <span className="text-white font-semibold text-sm">
                              {destination.hotelPrice}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Filter Dropdown */}
      <FilterDropdown
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApplyFilters={handleApplyFilters}
      />

      {/* Booking ChatBot */}
      <BookingChatBot pageType="holiday" />
    </div>
  );
};

export default HolidayPage;
