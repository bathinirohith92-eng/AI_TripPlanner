import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Star,
  ExternalLink,
  Navigation,
  Loader2,
  Building2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import HotelPayment from "@/components/HotelPayment";
import BookingChatBot from "@/components/BookingChatBot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Hotel banner image - using a luxury hotel image
const hotelBanner =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80";

// Mock hotel data - defined outside component
const mockHotels: Hotel[] = [
  {
    id: 1,
    name: "The Leela Palace Bangalore",
    rating: 4.8,
    address: "23, Airport Road, Kodihalli, Bangalore, Karnataka 560008",
    price: 12500,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    amenities: ["Free WiFi", "Pool", "Spa", "Gym", "Restaurant", "Room Service"],
    website: "https://www.theleela.com/en_us/hotels-in-bangalore/",
    mapLink: "https://maps.google.com/?q=The+Leela+Palace+Bangalore",
    description: "Luxury hotel with world-class amenities and exceptional service",
    reviews: 2847,
  },
  {
    id: 2,
    name: "ITC Gardenia Bangalore",
    rating: 4.6,
    address: "Residency Road, Bangalore, Karnataka 560025",
    price: 8900,
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    amenities: ["Free WiFi", "Pool", "Business Center", "Restaurant", "Bar"],
    website: "https://www.itchotels.com/in/en/itcgardenia-bengaluru",
    mapLink: "https://maps.google.com/?q=ITC+Gardenia+Bangalore",
    description: "Premium business hotel in the heart of the city",
    reviews: 1923,
  },
  {
    id: 3,
    name: "Taj West End Bangalore",
    rating: 4.7,
    address: "Race Course Road, Bangalore, Karnataka 560001",
    price: 11200,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
    amenities: ["Free WiFi", "Pool", "Spa", "Garden", "Restaurant", "Heritage"],
    website: "https://www.tajhotels.com/en-in/taj/taj-west-end-bengaluru/",
    mapLink: "https://maps.google.com/?q=Taj+West+End+Bangalore",
    description: "Heritage luxury hotel with beautiful gardens and colonial charm",
    reviews: 3156,
  }
];

interface Hotel {
  id: number;
  name: string;
  rating: number;
  address: string;
  price: number;
  image: string;
  amenities: string[];
  website: string;
  mapLink: string;
  description: string;
  reviews: number;
}

const HotelBooking = () => {
  const [searchData, setSearchData] = useState({
    city: "Bangalore",
    checkIn: "2025-11-17",
    checkOut: "2025-11-20",
    guests: "2",
    rooms: "1",
  });
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [apiHotels, setApiHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load featured hotels on component mount
  useEffect(() => {
    setHotels(mockHotels);
    setShowResults(true);
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    setShowResults(false);
    setHotels([]);
    setApiHotels([]);

    try {
      const response = await fetch("http://localhost:5001/api/hotels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city: searchData.city,
          checkIn: searchData.checkIn,
          checkOut: searchData.checkOut,
          guests: searchData.guests,
          rooms: searchData.rooms,
        }),
      });

      const data = await response.json();

      if (data.success && data.hotels) {
        setApiHotels(data.hotels);
        setHotels(data.hotels);
        setShowResults(true);
        console.log("✅ Hotels loaded from API:", data.hotels);
      } else {
        console.error("❌ Hotel API Error:", data.error);
        setHotels(mockHotels);
        setShowResults(true);
      }
    } catch (error) {
      console.error("❌ Network Error:", error);
      setHotels(mockHotels);
      setShowResults(true);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleBookNow = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setSelectedHotel(null);
  };

  if (showPayment) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20">
          <HotelPayment
            selectedHotel={selectedHotel}
            searchData={searchData}
            onBack={() => setShowPayment(false)}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section
        className="relative h-[40vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${hotelBanner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center text-white"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="w-12 h-12 text-white" />
            <h1 className="text-5xl font-bold">Hotel Booking</h1>
          </div>
          <p className="text-xl opacity-90">
            Find and book the perfect stay for your trip
          </p>
        </motion.div>
      </section>

      <main className="pb-12">
        <div className="container mx-auto px-4 -mt-20 relative z-10">
          {/* Search Form */}
          <Card className="max-w-5xl mx-auto p-6 mb-8">
            <div className="grid md:grid-cols-5 gap-4">
              <div className="relative">
                <MapPin className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="City or Hotel"
                  value={searchData.city}
                  onChange={(e) =>
                    setSearchData((prev) => ({ ...prev, city: e.target.value }))
                  }
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <Calendar className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="date"
                  value={searchData.checkIn}
                  onChange={(e) =>
                    setSearchData((prev) => ({ ...prev, checkIn: e.target.value }))
                  }
                  className="pl-10"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="relative">
                <Calendar className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="date"
                  value={searchData.checkOut}
                  onChange={(e) =>
                    setSearchData((prev) => ({ ...prev, checkOut: e.target.value }))
                  }
                  className="pl-10"
                  min={searchData.checkIn}
                />
              </div>

              <div className="relative">
                <Users className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={searchData.guests}
                  onChange={(e) =>
                    setSearchData((prev) => ({ ...prev, guests: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background"
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="5">5+ Guests</option>
                </select>
              </div>

              <Button onClick={handleSearch} className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Search Hotels
              </Button>
            </div>
          </Card>

          {/* Loading Animation */}
          {isLoading && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="relative mb-6"
              >
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-2 bg-primary/10 rounded-full flex items-center justify-center"
                >
                  <Building2 className="w-6 h-6 text-primary" />
                </motion.div>
              </motion.div>
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-muted-foreground font-medium"
              >
                Searching for best hotel deals...
              </motion.p>
            </motion.div>
          )}

          {/* Results */}
          <div ref={!isLoading ? resultsRef : undefined} className="space-y-6">
            {showResults && !isLoading && (
              <>
                <h2 className="text-2xl font-semibold mb-6">
                  {hotels.length === mockHotels.length ? 'Featured Hotels' : `Hotels in ${searchData.city}`} ({hotels.length} found)
                </h2>
                <div className="grid gap-6">
                  {hotels.map((hotel, index) => (
                    <motion.div
                      key={hotel.id}
                      initial={{ opacity: 0, y: 60, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        delay: index * 0.2,
                        type: "spring",
                        stiffness: 80,
                        damping: 20,
                      }}
                      whileHover={{
                        scale: 1.01,
                        y: -10,
                        transition: { duration: 0.3 },
                      }}
                    >
                      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                        <div className="grid md:grid-cols-3 gap-0 h-full">
                          {/* Hotel Image */}
                          <div className="relative h-64 md:h-80">
                            <img
                              src={hotel.image}
                              alt={hotel.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 left-4">
                              <Badge className="bg-green-500 text-white">
                                {hotel.rating} ⭐
                              </Badge>
                            </div>
                          </div>

                          {/* Hotel Details */}
                          <div className="md:col-span-2 p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-xl font-bold mb-2">
                                  {hotel.name}
                                </h3>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < Math.floor(hotel.rating)
                                            ? "text-yellow-400 fill-current"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    ({hotel.reviews} reviews)
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                  <MapPin className="w-4 h-4 inline mr-1" />
                                  {hotel.address}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-primary">
                                  ₹{hotel.price.toLocaleString()}
                                </p>
                                <p className="text-sm text-muted-foreground">per night</p>
                              </div>
                            </div>

                            <div className="mb-4">
                              <p className="text-sm text-muted-foreground mb-2">
                                {hotel.description}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {hotel.amenities.slice(0, 4).map((amenity, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {amenity}
                                  </Badge>
                                ))}
                                {hotel.amenities.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{hotel.amenities.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2 mt-auto">
                              <Button
                                onClick={() => handleBookNow(hotel)}
                                className="flex-1"
                              >
                                Book Now
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => window.open(hotel.mapLink, '_blank')}
                              >
                                <Navigation className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => window.open(hotel.website, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <BookingChatBot pageType="hotel" />
    </div>
  );
};

export default HotelBooking;
//       reviews: 3156,
//     },
//     {
//       id: 4,
//       name: "The Oberoi Bangalore",
//       rating: 4.9,
//       address: "37-39, Mahatma Gandhi Road, Bangalore, Karnataka 560001",
//       price: 15800,
//       image:
//         "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
//       amenities: [
//         "Free WiFi",
//         "Pool",
//         "Spa",
//         "Fine Dining",
//         "Butler Service",
//         "Luxury",
//       ],
//       website: "https://www.oberoihotels.com/hotels-in-bengaluru/",
//       mapLink: "https://maps.google.com/?q=The+Oberoi+Bangalore",
//       description:
//         "Ultra-luxury hotel offering personalized service and elegant accommodations",
//       reviews: 1654,
//     },
//     {
//       id: 5,
//       name: "Sheraton Grand Bangalore",
//       rating: 4.5,
//       address: "26/1, Dr. Rajkumar Road, Bangalore, Karnataka 560055",
//       price: 7200,
//       image:
//         "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
//       amenities: ["Free WiFi", "Pool", "Gym", "Restaurant", "Business Center"],
//       website:
//         "https://www.marriott.com/en-us/hotels/blrgs-sheraton-grand-bengaluru-whitefield-hotel/",
//       mapLink: "https://maps.google.com/?q=Sheraton+Grand+Bangalore",
//       description:
//         "Modern hotel with excellent facilities and convenient location",
//       reviews: 2341,
//     },
//     {
//       id: 6,
//       name: "Radisson Blu Atria Bangalore",
//       rating: 4.4,
//       address: "Palace Road, Bangalore, Karnataka 560001",
//       price: 6500,
//       image:
//         "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
//       amenities: ["Free WiFi", "Pool", "Gym", "Restaurant", "Conference Rooms"],
//       website:
//         "https://www.radissonhotels.com/en-us/hotels/radisson-blu-bengaluru-atria",
//       mapLink: "https://maps.google.com/?q=Radisson+Blu+Atria+Bangalore",
//       description:
//         "Contemporary hotel with modern amenities and central location",
//       reviews: 1876,
//     },
//   ];

//   const handleSearch = async () => {
//     setIsLoading(true);
//     setHotels([]);
//     setApiHotels([]);

//     try {
//       const response = await fetch("http://localhost:5001/api/hotels", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           city: searchData.city,
//           checkIn: searchData.checkIn,
//           checkOut: searchData.checkOut,
//           guests: searchData.guests,
//           rooms: searchData.rooms,
//         }),
//       });

//       const data = await response.json();

//       if (data.success && data.hotels) {
//         // Update hotels state with API data
//         setApiHotels(data.hotels);
//         setHotels(data.hotels);
//         console.log("✅ Hotels loaded from API:", data.hotels);
//       } else {
//         console.error("❌ Hotel API Error:", data.error);
//         // Fallback to mock data
//         setHotels(mockHotels);
//       }
//     } catch (error) {
//       console.error("❌ Network Error:", error);
//       // Fallback to mock data
//       setHotels(mockHotels);
//     } finally {
//       setIsLoading(false);

//       // Scroll to results after a brief delay
//       setTimeout(() => {
//         resultsRef.current?.scrollIntoView({ behavior: "smooth" });
//       }, 100);
//     }
//   };

//   // Load featured hotels on component mount
//   useEffect(() => {
//     // Show featured hotels immediately
//     setHotels(mockHotels);
//     setShowResults(true);
//   }, []);

//   const handleBookNow = (hotel: Hotel) => {
//     setSelectedHotel(hotel);
//     setShowPayment(true);
//   };

//   const handlePaymentSuccess = () => {
//     setShowPayment(false);
//     setSelectedHotel(null);
//   };

//   if (showPayment) {
//     return (
//       <div className="min-h-screen bg-background">
//         <Navbar />
//         <div className="pt-20">
//           <HotelPayment
//             selectedHotel={selectedHotel}
//             searchData={searchData}
//             onBack={() => setShowPayment(false)}
//             onPaymentSuccess={handlePaymentSuccess}
//           />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <Navbar />

//       {/* Hero Section with Background */}
//       <section
//         className="relative h-[40vh] flex items-center justify-center overflow-hidden"
//         style={{
//           backgroundImage: `url(${hotelBanner})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//         }}
//       >
//         <div className="absolute inset-0 bg-black/40" />
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="relative z-10 text-center text-white"
//         >
//           <div className="flex items-center justify-center gap-3 mb-4">
//             <Building2 className="w-12 h-12 text-white" />
//             <h1 className="text-5xl font-bold">Hotel Booking</h1>
//           </div>
//           <p className="text-xl opacity-90">
//             Find and book the perfect stay for your trip
//           </p>
//         </motion.div>
//       </section>

//       <main className="pb-12">
//         <div className="container mx-auto px-4 -mt-20 relative z-10">
//           {/* Search Form */}
//           <Card className="max-w-5xl mx-auto p-6 mb-8">
//             <div className="grid md:grid-cols-5 gap-4">
//               <div className="relative">
//                 <MapPin className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
//                 <Input
//                   placeholder="City or Hotel"
//                   value={searchData.city}
//                   onChange={(e) =>
//                     setSearchData((prev) => ({ ...prev, city: e.target.value }))
//                   }
//                   className="pl-10"
//                 />
//               </div>

//               <div className="relative">
//                 <Calendar className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
//                 <Input
//                   type="date"
//                   value={searchData.checkIn}
//                   onChange={(e) =>
//                     setSearchData((prev) => ({
//                       ...prev,
//                       checkIn: e.target.value,
//                     }))
//                   }
//                   className="pl-10"
//                   min={new Date().toISOString().split("T")[0]}
//                 />
//               </div>

//               <div className="relative">
//                 <Calendar className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
//                 <Input
//                   type="date"
//                   value={searchData.checkOut}
//                   onChange={(e) =>
//                     setSearchData((prev) => ({
//                       ...prev,
//                       checkOut: e.target.value,
//                     }))
//                   }
//                   className="pl-10"
//                   min={searchData.checkIn}
//                 />
//               </div>

//               <div className="relative">
//                 <Users className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
//                 <select
//                   value={searchData.guests}
//                   onChange={(e) =>
//                     setSearchData((prev) => ({
//                       ...prev,
//                       guests: e.target.value,
//                     }))
//                   }
//                   className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background"
//                 >
//                   <option value="1">1 Guest</option>
//                   <option value="2">2 Guests</option>
//                   <option value="3">3 Guests</option>
//                   <option value="4">4 Guests</option>
//                   <option value="5">5+ Guests</option>
//                 </select>
//               </div>

//               <Button onClick={handleSearch} className="w-full">
//                 <Search className="w-4 h-4 mr-2" />
//                 Search Hotels
//               </Button>
//             </div>
//           </Card>

//           {/* Loading Animation */}
//           {isLoading && (
//             <motion.div
//               ref={resultsRef}
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="flex flex-col items-center justify-center py-12"
//             >
//               <motion.div
//                 animate={{ rotate: 360 }}
//                 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
//                 className="relative mb-6"
//               >
//                 <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full" />
//                 <motion.div
//                   animate={{ scale: [1, 1.2, 1] }}
//                   transition={{ duration: 1.5, repeat: Infinity }}
//                   className="absolute inset-2 bg-primary/10 rounded-full flex items-center justify-center"
//                 >
//                   <Building2 className="w-6 h-6 text-primary" />
//                 </motion.div>
//               </motion.div>
//               <motion.p
//                 animate={{ opacity: [0.5, 1, 0.5] }}
//                 transition={{ duration: 2, repeat: Infinity }}
//                 className="text-muted-foreground font-medium"
//               >
//                 Searching for best hotel deals...
//               </motion.p>
//               <motion.div
//                 initial={{ width: 0 }}
//                 animate={{ width: "200px" }}
//                 transition={{ duration: 2.5, ease: "easeInOut" }}
//                 className="h-1 bg-primary/30 rounded-full mt-4 overflow-hidden"
//               >
//                 <motion.div
//                   animate={{ x: ["-100%", "100%"] }}
//                   transition={{
//                     duration: 1.5,
//                     repeat: Infinity,
//                     ease: "easeInOut",
//                   }}
//                   className="h-full w-1/3 bg-primary rounded-full"
//                 />
//               </motion.div>
//             </motion.div>
//           )}

//           {/* Results */}
//           <div ref={!isLoading ? resultsRef : undefined} className="space-y-6">
//             {showResults && !isLoading && (
//               <>
//                 <h2 className="text-2xl font-semibold mb-6">
//                   {hotels.length === mockHotels.length
//                     ? "Featured Hotels"
//                     : `Hotels in ${searchData.city}`}{" "}
//                   ({hotels.length} found)
//                 </h2>
//                 <div className="grid gap-6">
//                   {hotels.map((hotel, index) => (
//                     <motion.div
//                       key={hotel.id}
//                       initial={{ opacity: 0, y: 60, scale: 0.9 }}
//                       animate={{ opacity: 1, y: 0, scale: 1 }}
//                       transition={{
//                         delay: index * 0.2,
//                         type: "spring",
//                         stiffness: 80,
//                         damping: 20,
//                       }}
//                       whileHover={{
//                         scale: 1.01,
//                         y: -10,
//                         transition: { duration: 0.3 },
//                       }}
//                     >
//                       <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
//                         <div className="grid md:grid-cols-3 gap-0 h-full">
//                           {/* Hotel Image */}
//                           <div className="relative h-64 md:h-80">
//                             <img
//                               src={hotel.image}
//                               alt={hotel.name}
//                               className="w-full h-full object-cover"
//                             />
//                             <div className="absolute top-4 left-4">
//                               <Badge className="bg-green-500 text-white">
//                                 {hotel.rating} ★
//                               </Badge>
//                             </div>
//                           </div>

//                           {/* Hotel Details */}
//                           <div className="md:col-span-2 p-6">
//                             <div className="flex justify-between items-start mb-4">
//                               <div>
//                                 <h3 className="text-xl font-bold mb-2">
//                                   {hotel.name}
//                                 </h3>
//                                 <div className="flex items-center gap-2 mb-2">
//                                   <div className="flex items-center">
//                                     {[...Array(5)].map((_, i) => (
//                                       <Star
//                                         key={i}
//                                         className={`w-4 h-4 ${
//                                           i < Math.floor(hotel.rating)
//                                             ? "text-yellow-400 fill-current"
//                                             : "text-gray-300"
//                                         }`}
//                                       />
//                                     ))}
//                                   </div>
//                                   <span className="text-sm text-muted-foreground">
//                                     ({hotel.reviews} reviews)
//                                   </span>
//                                 </div>
//                                 <p className="text-sm text-muted-foreground mb-4">
//                                   <MapPin className="w-4 h-4 inline mr-1" />
//                                   {hotel.address}
//                                 </p>
//                               </div>
//                               <div className="text-right">
//                                 <p className="text-2xl font-bold text-primary">
//                                   ₹{hotel.price.toLocaleString()}
//                                 </p>
//                                 <p className="text-sm text-muted-foreground">
//                                   per night
//                                 </p>
//                               </div>
//                             </div>

//                             <div className="mb-4">
//                               <p className="text-sm text-muted-foreground mb-2">
//                                 {hotel.description}
//                               </p>
//                               <div className="flex flex-wrap gap-2">
//                                 {hotel.amenities.slice(0, 4).map((amenity, i) => (
//                                   <Badge
//                                     key={i}
//                                     variant="secondary"
//                                     className="text-xs"
//                                   >
//                                     {amenity}
//                                   </Badge>
//                                 ))}
//                                 {hotel.amenities.length > 4 && (
//                                   <Badge
//                                     variant="outline"
//                                     className="text-xs"
//                                   >
//                                     +{hotel.amenities.length - 4} more
//                                   </Badge>
//                                 )}
//                               </div>
//                             </div>

//                             <div className="flex gap-2 mt-auto">
//                               <Button
//                                 onClick={() => handleBookNow(hotel)}
//                                 className="flex-1"
//                               >
//                                 Book Now
//                               </Button>
//                               <Button
//                                 variant="outline"
//                                 size="icon"
//                                 onClick={() =>
//                                   window.open(hotel.mapLink, "_blank")
//                                 }
//                               >
//                                 <Navigation className="w-4 h-4" />
//                               </Button>
//                               <Button
//                                 variant="outline"
//                                 size="icon"
//                                 onClick={() =>
//                                   window.open(hotel.website, "_blank")
//                                 }
//                               >
//                                 <ExternalLink className="w-4 h-4" />
//                               </Button>
//                             </div>
//                           </div>
//                         </div>
//                       </Card>
//                     </motion.div>
//                   ))}
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </main>

//       {/* Booking ChatBot */}
//       <BookingChatBot pageType="hotel" />
//     </div>
//   );
// };

// export default HotelBooking;
