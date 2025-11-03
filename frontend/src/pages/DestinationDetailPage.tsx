import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles, Plane, Car, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const destinationData: Record<string, any> = {
  singapore: {
    name: "Singapore",
    subtitle: "Southeast Asia, Singapore",
    description: "Singapore is known for its modern skyline, diverse food scene, and vibrant culture, making it a popular destination for both business and leisure travelers.",
    temperature: "30°c",
    aqi: "34",
    images: [
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80",
      "https://images.unsplash.com/photo-1508964942454-1a56651d54ac?w=1200&q=80",
      "https://images.unsplash.com/photo-1496939376851-89342e90adcd?w=1200&q=80",
    ],
    popularFor: [
      { icon: "💎", label: "Luxurious Hotels" },
      { icon: "🍜", label: "Hawker Centers" },
      { icon: "🌳", label: "Orchard Road" },
      { icon: "🏖️", label: "Marina Bay Sands" },
      { icon: "🏮", label: "Chinatown" },
      { icon: "🌺", label: "Gardens by the Bay" },
    ],
    tripDuration: "3-4 days",
    tripDescription: "A 3-4 day trip to Singapore allows you to explore the iconic Marina Bay Sands, visit the beautiful Gardens by the Bay, experience the vibrant culture in Chinatown, and indulge in the delicious street food at hawker centers.",
    costLevel: "Moderately expensive",
    bestTime: "November - March",
    weather: [
      { month: "Jan", temp: "23/31°c", icon: "⛅", aqi: 19 },
      { month: "Feb", temp: "23/30°c", icon: "🌧️", aqi: 23 },
      { month: "Mar", temp: "22/30°c", icon: "⛅", aqi: 22 },
      { month: "Apr", temp: "23/31°c", icon: "⛅", aqi: 27 },
      { month: "May", temp: "25/32°c", icon: "🌧️", aqi: 21 },
      { month: "Jun", temp: "24/31°c", icon: "⛅", aqi: 20 },
      { month: "Jul", temp: "24/32°c", icon: "🌧️", aqi: 21 },
      { month: "Aug", temp: "24/32°c", icon: "⛅", aqi: 25 },
      { month: "Sep", temp: "24/33°c", icon: "🌧️", aqi: 30 },
      { month: "Oct", temp: "24/33°c", icon: "🌧️", aqi: 40 },
      { month: "Nov", temp: "24/31°c", icon: "⛅", aqi: 23 },
      { month: "Dec", temp: "24/28°c", icon: "⛅", aqi: 16 },
    ],
    thingsToDo: [
      {
        id: 1,
        title: "Night Safari Exploration: Discover nocturnal wildlife 🌙",
        image: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=600&q=80",
      },
      {
        id: 2,
        title: "Gardens by the Bay: Marvel at futuristic gardens 🌿",
        image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=600&q=80",
      },
      {
        id: 3,
        title: "Hawker Centre Dining: Indulge in local flavors 🥘",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
      },
      {
        id: 4,
        title: "Chinatown Exploration: Immerse in cultural charm 🏮",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80",
      },
    ],
    howToReach: [
      {
        type: "flight",
        label: "Fastest",
        title: "Fly to Singapore Changi Airport",
        from: "Chennai International Airport (MAA)",
        to: "Singapore Changi Airport (SIN)",
        duration: "7h 7m",
        price: "₹9,136 - 19,327",
      },
      {
        type: "car",
        label: "",
        title: "Drive 6231 km",
        from: "Chennai",
        to: "Singapore",
        duration: "3d 13h 35m",
        price: "₹99,713",
      },
      {
        type: "flight",
        label: "Cheapest",
        title: "Fly to Senai International Airport",
        from: "Chennai International Airport (MAA)",
        to: "Senai International Airport (JHB)",
        duration: "10h 54m",
        price: "₹9,217 - 20,236",
      },
    ],
  },
  bangkok: {
    name: "Bangkok",
    subtitle: "Bangkok, Thailand",
    description: "Bangkok is Thailand's vibrant capital known for its ornate temples, bustling street markets, incredible street food, and rich cultural heritage mixed with modern attractions.",
    temperature: "32°c",
    aqi: "45",
    images: [
      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
      "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200&q=80",
    ],
    popularFor: [
      { icon: "🏛️", label: "Grand Palace" },
      { icon: "🍜", label: "Street Food" },
      { icon: "🛍️", label: "Chatuchak Market" },
      { icon: "🏮", label: "Wat Pho Temple" },
      { icon: "🚤", label: "Chao Phraya River" },
      { icon: "🌃", label: "Khao San Road" },
    ],
    tripDuration: "4-5 days",
    tripDescription: "A 4-5 day trip to Bangkok lets you explore the magnificent Grand Palace, visit sacred temples like Wat Pho, enjoy world-famous street food, shop at floating markets, and experience the vibrant nightlife.",
    costLevel: "Budget-friendly",
    bestTime: "November - February",
    weather: [
      { month: "Jan", temp: "21/32°c", icon: "☀️", aqi: 35 },
      { month: "Feb", temp: "24/33°c", icon: "☀️", aqi: 40 },
      { month: "Mar", temp: "26/34°c", icon: "☀️", aqi: 45 },
      { month: "Apr", temp: "27/35°c", icon: "🌤️", aqi: 50 },
      { month: "May", temp: "26/34°c", icon: "🌧️", aqi: 45 },
      { month: "Jun", temp: "26/33°c", icon: "🌧️", aqi: 40 },
      { month: "Jul", temp: "25/33°c", icon: "🌧️", aqi: 38 },
      { month: "Aug", temp: "25/33°c", icon: "🌧️", aqi: 42 },
      { month: "Sep", temp: "25/32°c", icon: "🌧️", aqi: 48 },
      { month: "Oct", temp: "24/32°c", icon: "🌧️", aqi: 55 },
      { month: "Nov", temp: "23/31°c", icon: "⛅", aqi: 45 },
      { month: "Dec", temp: "20/31°c", icon: "☀️", aqi: 38 },
    ],
    thingsToDo: [
      {
        id: 1,
        title: "Grand Palace: Explore Thailand's royal heritage 👑",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
      },
      {
        id: 2,
        title: "Floating Markets: Experience traditional commerce 🚤",
        image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80",
      },
      {
        id: 3,
        title: "Street Food Tours: Taste authentic Thai cuisine 🍜",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
      },
      {
        id: 4,
        title: "Wat Pho Temple: Marvel at the reclining Buddha 🏛️",
        image: "https://images.unsplash.com/photo-1563492065-1a5a6e0d8a6b?w=600&q=80",
      },
    ],
    howToReach: [
      {
        type: "flight",
        label: "Fastest",
        title: "Fly to Suvarnabhumi Airport",
        from: "Chennai International Airport (MAA)",
        to: "Suvarnabhumi Airport (BKK)",
        duration: "3h 45m",
        price: "₹12,000 - 25,000",
      },
      {
        type: "flight",
        label: "Cheapest",
        title: "Fly to Don Mueang Airport",
        from: "Chennai International Airport (MAA)",
        to: "Don Mueang International Airport (DMK)",
        duration: "4h 15m",
        price: "₹8,500 - 18,000",
      },
    ],
  },
  dubai: {
    name: "Dubai",
    subtitle: "Dubai, United Arab Emirates",
    description: "Dubai is a futuristic city known for its ultramodern architecture, luxury shopping, vibrant nightlife, and world-class attractions including the tallest building in the world.",
    temperature: "28°c",
    aqi: "42",
    images: [
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80",
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&q=80",
      "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=1200&q=80",
    ],
    popularFor: [
      { icon: "🏗️", label: "Burj Khalifa" },
      { icon: "🛍️", label: "Dubai Mall" },
      { icon: "🏖️", label: "Jumeirah Beach" },
      { icon: "🏝️", label: "Palm Jumeirah" },
      { icon: "🎢", label: "Theme Parks" },
      { icon: "🏜️", label: "Desert Safari" },
    ],
    tripDuration: "4-6 days",
    tripDescription: "A 4-6 day trip to Dubai offers experiences from the world's tallest building Burj Khalifa, luxury shopping at Dubai Mall, relaxing at pristine beaches, thrilling desert safaris, and exploring traditional souks.",
    costLevel: "Expensive",
    bestTime: "November - March",
    weather: [
      { month: "Jan", temp: "14/24°c", icon: "☀️", aqi: 35 },
      { month: "Feb", temp: "16/26°c", icon: "☀️", aqi: 38 },
      { month: "Mar", temp: "19/30°c", icon: "☀️", aqi: 42 },
      { month: "Apr", temp: "23/35°c", icon: "☀️", aqi: 45 },
      { month: "May", temp: "27/39°c", icon: "☀️", aqi: 48 },
      { month: "Jun", temp: "30/42°c", icon: "☀️", aqi: 52 },
      { month: "Jul", temp: "32/44°c", icon: "☀️", aqi: 55 },
      { month: "Aug", temp: "32/44°c", icon: "☀️", aqi: 58 },
      { month: "Sep", temp: "29/40°c", icon: "☀️", aqi: 50 },
      { month: "Oct", temp: "25/36°c", icon: "☀️", aqi: 45 },
      { month: "Nov", temp: "20/31°c", icon: "☀️", aqi: 40 },
      { month: "Dec", temp: "16/26°c", icon: "☀️", aqi: 35 },
    ],
    thingsToDo: [
      {
        id: 1,
        title: "Burj Khalifa: Visit the world's tallest building 🏗️",
        image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80",
      },
      {
        id: 2,
        title: "Desert Safari: Experience Arabian adventure 🏜️",
        image: "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=600&q=80",
      },
      {
        id: 3,
        title: "Dubai Mall: Shop at the world's largest mall 🛍️",
        image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600&q=80",
      },
      {
        id: 4,
        title: "Palm Jumeirah: Relax at luxury resorts 🏝️",
        image: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=600&q=80",
      },
    ],
    howToReach: [
      {
        type: "flight",
        label: "Fastest",
        title: "Fly to Dubai International Airport",
        from: "Chennai International Airport (MAA)",
        to: "Dubai International Airport (DXB)",
        duration: "4h 30m",
        price: "₹15,000 - 35,000",
      },
      {
        type: "flight",
        label: "Cheapest",
        title: "Fly to Al Maktoum International Airport",
        from: "Chennai International Airport (MAA)",
        to: "Al Maktoum International Airport (DWC)",
        duration: "5h 15m",
        price: "₹12,000 - 28,000",
      },
    ],
  },
  phuket: {
    name: "Phuket",
    subtitle: "Phuket Province, Thailand",
    description: "Phuket is Thailand's largest island known for its stunning beaches, crystal-clear waters, vibrant nightlife, water sports, and beautiful tropical landscapes perfect for relaxation and adventure.",
    temperature: "29°c",
    aqi: "28",
    images: [
      "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1200&q=80",
      "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
    ],
    popularFor: [
      { icon: "🏖️", label: "Patong Beach" },
      { icon: "🤿", label: "Diving & Snorkeling" },
      { icon: "🌅", label: "Phi Phi Islands" },
      { icon: "🍹", label: "Beach Bars" },
      { icon: "🛥️", label: "Island Hopping" },
      { icon: "🌺", label: "Thai Massage" },
    ],
    tripDuration: "5-7 days",
    tripDescription: "A 5-7 day trip to Phuket offers pristine beaches like Patong and Kata, island hopping to Phi Phi Islands, water activities like diving and snorkeling, vibrant nightlife, and relaxing spa treatments.",
    costLevel: "Moderate",
    bestTime: "November - April",
    weather: [
      { month: "Jan", temp: "23/32°c", icon: "☀️", aqi: 25 },
      { month: "Feb", temp: "24/33°c", icon: "☀️", aqi: 28 },
      { month: "Mar", temp: "25/33°c", icon: "☀️", aqi: 30 },
      { month: "Apr", temp: "26/34°c", icon: "🌤️", aqi: 32 },
      { month: "May", temp: "25/32°c", icon: "🌧️", aqi: 35 },
      { month: "Jun", temp: "25/32°c", icon: "🌧️", aqi: 38 },
      { month: "Jul", temp: "25/31°c", icon: "🌧️", aqi: 40 },
      { month: "Aug", temp: "25/31°c", icon: "🌧️", aqi: 42 },
      { month: "Sep", temp: "24/31°c", icon: "🌧️", aqi: 45 },
      { month: "Oct", temp: "24/31°c", icon: "🌧️", aqi: 40 },
      { month: "Nov", temp: "24/31°c", icon: "⛅", aqi: 32 },
      { month: "Dec", temp: "23/31°c", icon: "☀️", aqi: 28 },
    ],
    thingsToDo: [
      {
        id: 1,
        title: "Phi Phi Islands: Explore paradise islands 🏝️",
        image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=80",
      },
      {
        id: 2,
        title: "Patong Beach: Enjoy vibrant beach life 🏖️",
        image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80",
      },
      {
        id: 3,
        title: "Scuba Diving: Discover underwater wonders 🤿",
        image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80",
      },
      {
        id: 4,
        title: "Big Buddha: Visit iconic landmark 🏛️",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
      },
    ],
    howToReach: [
      {
        type: "flight",
        label: "Fastest",
        title: "Fly to Phuket International Airport",
        from: "Chennai International Airport (MAA)",
        to: "Phuket International Airport (HKT)",
        duration: "4h 15m",
        price: "₹14,000 - 28,000",
      },
      {
        type: "flight",
        label: "Cheapest",
        title: "Fly via Bangkok to Phuket",
        from: "Chennai International Airport (MAA)",
        to: "Phuket International Airport (HKT)",
        duration: "7h 30m",
        price: "₹10,000 - 22,000",
      },
    ],
  },
  pattaya: {
    name: "Pattaya",
    subtitle: "Chonburi, Thailand",
    description: "Pattaya is a vibrant beach resort city known for its stunning beaches, exciting nightlife, water sports, cultural shows, and family-friendly attractions along Thailand's eastern coast.",
    temperature: "31°c",
    aqi: "38",
    images: [
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80",
      "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
    ],
    popularFor: [
      { icon: "🏖️", label: "Pattaya Beach" },
      { icon: "🌃", label: "Walking Street" },
      { icon: "🎭", label: "Cabaret Shows" },
      { icon: "🏝️", label: "Coral Island" },
      { icon: "🎢", label: "Theme Parks" },
      { icon: "🚤", label: "Water Sports" },
    ],
    tripDuration: "3-5 days",
    tripDescription: "A 3-5 day trip to Pattaya offers beautiful beaches, exciting water sports, vibrant nightlife on Walking Street, cultural shows, island hopping to Coral Island, and family attractions.",
    costLevel: "Budget-friendly",
    bestTime: "November - March",
    weather: [
      { month: "Jan", temp: "21/31°c", icon: "☀️", aqi: 32 },
      { month: "Feb", temp: "23/32°c", icon: "☀️", aqi: 35 },
      { month: "Mar", temp: "25/33°c", icon: "☀️", aqi: 38 },
      { month: "Apr", temp: "27/34°c", icon: "🌤️", aqi: 42 },
      { month: "May", temp: "26/33°c", icon: "🌧️", aqi: 40 },
      { month: "Jun", temp: "26/32°c", icon: "🌧️", aqi: 38 },
      { month: "Jul", temp: "25/32°c", icon: "🌧️", aqi: 36 },
      { month: "Aug", temp: "25/32°c", icon: "🌧️", aqi: 38 },
      { month: "Sep", temp: "25/32°c", icon: "🌧️", aqi: 42 },
      { month: "Oct", temp: "24/32°c", icon: "🌧️", aqi: 45 },
      { month: "Nov", temp: "23/31°c", icon: "⛅", aqi: 38 },
      { month: "Dec", temp: "21/30°c", icon: "☀️", aqi: 32 },
    ],
    thingsToDo: [
      {
        id: 1,
        title: "Walking Street: Experience vibrant nightlife 🌃",
        image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80",
      },
      {
        id: 2,
        title: "Coral Island: Enjoy pristine beaches 🏝️",
        image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80",
      },
      {
        id: 3,
        title: "Sanctuary of Truth: Marvel at wooden temple 🏛️",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
      },
      {
        id: 4,
        title: "Water Sports: Thrilling beach activities 🚤",
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
      },
    ],
    howToReach: [
      {
        type: "flight",
        label: "Fastest",
        title: "Fly to U-Tapao Airport",
        from: "Chennai International Airport (MAA)",
        to: "U-Tapao Rayong-Pattaya Airport (UTP)",
        duration: "4h 30m",
        price: "₹13,000 - 26,000",
      },
      {
        type: "flight",
        label: "Cheapest",
        title: "Fly via Bangkok to Pattaya",
        from: "Chennai International Airport (MAA)",
        to: "Suvarnabhumi Airport (BKK) + Bus",
        duration: "6h 30m",
        price: "₹9,500 - 20,000",
      },
    ],
  },
  doha: {
    name: "Doha",
    subtitle: "Doha, Qatar",
    description: "Doha is Qatar's modern capital known for its futuristic skyline, world-class museums, traditional souks, luxury shopping, and rich Arabian culture blended with contemporary attractions.",
    temperature: "26°c",
    aqi: "35",
    images: [
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80",
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80",
    ],
    popularFor: [
      { icon: "🏛️", label: "Museum of Islamic Art" },
      { icon: "🛍️", label: "Souq Waqif" },
      { icon: "🏖️", label: "The Pearl Qatar" },
      { icon: "🏗️", label: "West Bay Skyline" },
      { icon: "🏜️", label: "Desert Safari" },
      { icon: "🎨", label: "Katara Cultural Village" },
    ],
    tripDuration: "3-4 days",
    tripDescription: "A 3-4 day trip to Doha offers exploration of world-class museums, traditional souks, modern architecture, desert adventures, cultural villages, and luxury shopping experiences.",
    costLevel: "Expensive",
    bestTime: "November - April",
    weather: [
      { month: "Jan", temp: "14/22°c", icon: "☀️", aqi: 30 },
      { month: "Feb", temp: "16/24°c", icon: "☀️", aqi: 32 },
      { month: "Mar", temp: "20/28°c", icon: "☀️", aqi: 35 },
      { month: "Apr", temp: "25/33°c", icon: "☀️", aqi: 38 },
      { month: "May", temp: "30/39°c", icon: "☀️", aqi: 42 },
      { month: "Jun", temp: "33/42°c", icon: "☀️", aqi: 45 },
      { month: "Jul", temp: "35/44°c", icon: "☀️", aqi: 48 },
      { month: "Aug", temp: "35/44°c", icon: "☀️", aqi: 50 },
      { month: "Sep", temp: "32/40°c", icon: "☀️", aqi: 45 },
      { month: "Oct", temp: "28/36°c", icon: "☀️", aqi: 40 },
      { month: "Nov", temp: "22/30°c", icon: "☀️", aqi: 35 },
      { month: "Dec", temp: "17/25°c", icon: "☀️", aqi: 30 },
    ],
    thingsToDo: [
      {
        id: 1,
        title: "Museum of Islamic Art: Explore cultural treasures 🏛️",
        image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&q=80",
      },
      {
        id: 2,
        title: "Souq Waqif: Experience traditional marketplace 🛍️",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80",
      },
      {
        id: 3,
        title: "The Pearl Qatar: Luxury island living 🏖️",
        image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80",
      },
      {
        id: 4,
        title: "Desert Safari: Arabian adventure experience 🏜️",
        image: "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=600&q=80",
      },
    ],
    howToReach: [
      {
        type: "flight",
        label: "Fastest",
        title: "Fly to Hamad International Airport",
        from: "Chennai International Airport (MAA)",
        to: "Hamad International Airport (DOH)",
        duration: "4h 45m",
        price: "₹16,000 - 38,000",
      },
      {
        type: "flight",
        label: "Cheapest",
        title: "Fly with connecting flights",
        from: "Chennai International Airport (MAA)",
        to: "Hamad International Airport (DOH)",
        duration: "8h 30m",
        price: "₹12,000 - 28,000",
      },
    ],
  },
};

const DestinationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const destination = destinationData[id || "singapore"];

  if (!destination) {
    return <div>Destination not found</div>;
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "places", label: "Places to Stay" },
    { id: "things", label: "Things to do" },
    { id: "reach", label: "How to Reach" },
    { id: "more", label: "More" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border h-14 flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/holiday")}
          className="mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </header>

      <main className="pt-14">
        {/* Hero Carousel */}
        <div className="relative h-[500px] bg-black">
          <div className="relative h-full">
            <img
              src={destination.images[currentImageIndex]}
              alt={destination.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="container mx-auto">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-white text-5xl font-bold mb-2">
                      {destination.name}, <span className="font-normal">{destination.subtitle}</span>
                    </h1>
                    <p className="text-white/90 text-lg max-w-2xl">{destination.description}</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 text-white">
                      <div className="text-2xl font-bold">{destination.temperature}</div>
                    </div>
                    <div className="bg-green-500/90 backdrop-blur-md rounded-2xl px-4 py-2 text-white">
                      <div className="text-xs">AQI</div>
                      <div className="text-xl font-bold">{destination.aqi}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Carousel Controls */}
            <button
              onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? destination.images.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentImageIndex((prev) => (prev === destination.images.length - 1 ? 0 : prev + 1))}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-24 left-8 flex gap-2">
              {destination.images.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-1 rounded-full transition-all ${
                    index === currentImageIndex ? "w-8 bg-white" : "w-6 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-14 z-40 bg-background border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 text-sm font-medium transition-colors relative ${
                      activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      />
                    )}
                  </button>
                ))}
              </div>
              <Button className="gap-2">
                <Sparkles className="w-4 h-4" />
                Create trip with AI
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Weather Section */}
          <div className="mb-12 bg-card rounded-3xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Weather in {destination.name}</h2>
              <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                💡 Best time to visit {destination.bestTime}
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4">
              {destination.weather.map((month: any) => (
                <div key={month.month} className="flex flex-col items-center">
                  <div className="text-sm font-medium mb-2">{month.month}</div>
                  <div className="text-2xl mb-2">{month.icon}</div>
                  <div className="text-xs text-muted-foreground mb-1">{month.temp}</div>
                  <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    AQI {month.aqi}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular For & Trip Duration */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-card rounded-3xl border border-border p-6">
              <h3 className="text-xl font-bold mb-4">{destination.name} is popular for</h3>
              <div className="grid grid-cols-3 gap-4">
                {destination.popularFor.map((item: any, index: number) => (
                  <div key={index} className="flex flex-col items-center text-center gap-2">
                    <div className="text-3xl">{item.icon}</div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-3xl border border-border p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Usual trip duration</h3>
                  <p className="text-3xl font-bold text-primary mb-3">{destination.tripDuration}</p>
                  <p className="text-sm text-muted-foreground">{destination.tripDescription}</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4 text-center">
                  <div className="text-3xl mb-2">💰</div>
                  <p className="text-xs text-amber-800 font-medium">{destination.costLevel}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Things To Do */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-6">Things To Do</h2>
            <h3 className="text-xl text-muted-foreground mb-6">Ideas To Plan Your Trip</h3>
            <Carousel className="w-full">
              <CarouselContent className="-ml-4">
                {destination.thingsToDo.map((activity: any) => (
                  <CarouselItem key={activity.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <div className="relative overflow-hidden rounded-3xl h-80 group cursor-pointer">
                      <img
                        src={activity.image}
                        alt={activity.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h4 className="text-white text-xl font-bold">{activity.title}</h4>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>
          </div>

          {/* How To Reach */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-4xl font-bold">How To Reach {destination.name}</h2>
              <button className="text-sm font-medium text-muted-foreground">
                From <span className="text-foreground font-semibold">Chennai</span> ▼
              </button>
            </div>
            <div className="space-y-4">
              {destination.howToReach.map((option: any, index: number) => (
                <div
                  key={index}
                  className="bg-card rounded-2xl border border-border p-6 hover:shadow-[var(--shadow-medium)] transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        option.type === "flight" ? "bg-blue-100" : "bg-gray-100"
                      }`}>
                        {option.type === "flight" ? (
                          <Plane className="w-6 h-6 text-blue-600" />
                        ) : (
                          <Car className="w-6 h-6 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {option.label && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              option.label === "Fastest" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                            }`}>
                              {option.label}
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-lg mb-1">{option.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {option.from} • {option.to} • {option.duration}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary mb-1">{option.price}</div>
                      <Button variant="secondary" className="bg-primary text-white hover:bg-primary/90">
                        {option.type === "flight" ? "Book now" : "View details"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DestinationDetailPage;
