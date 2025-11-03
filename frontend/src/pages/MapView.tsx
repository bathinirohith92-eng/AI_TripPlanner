import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock destination data with coordinates
const destinations = [
  { name: "Goa", lat: 15.2993, lng: 74.1240 },
  { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
  { name: "Leh", lat: 34.1526, lng: 77.5771 },
  { name: "Kerala", lat: 10.8505, lng: 76.2711 },
  { name: "Andaman", lat: 11.7401, lng: 92.6586 },
];

const MapView = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Draw world map background (simplified)
    ctx.fillStyle = "#0a0f1e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Convert lat/lng to canvas coordinates
    const toCanvasCoords = (lat: number, lng: number) => {
      const x = ((lng + 180) * canvas.width) / 360;
      const y = ((90 - lat) * canvas.height) / 180;
      return { x, y };
    };

    // Draw connections between destinations
    ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);

    for (let i = 0; i < destinations.length - 1; i++) {
      const start = toCanvasCoords(destinations[i].lat, destinations[i].lng);
      const end = toCanvasCoords(destinations[i + 1].lat, destinations[i + 1].lng);

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }

    // Draw destination points
    destinations.forEach((dest, index) => {
      const coords = toCanvasCoords(dest.lat, dest.lng);

      // Outer glow
      const gradient = ctx.createRadialGradient(coords.x, coords.y, 0, coords.x, coords.y, 30);
      gradient.addColorStop(0, "rgba(59, 130, 246, 0.6)");
      gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, 30, 0, Math.PI * 2);
      ctx.fill();

      // Main point
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Inner point
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(dest.name, coords.x, coords.y + 25);
    });

    // Animate pulsing effect
    let pulse = 0;
    const animate = () => {
      pulse += 0.05;

      destinations.forEach((dest) => {
        const coords = toCanvasCoords(dest.lat, dest.lng);
        const radius = 8 + Math.sin(pulse) * 2;

        ctx.fillStyle = "rgba(59, 130, 246, 0.8)";
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  const handleClose = () => {
    window.close();
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-slate-900/90 to-transparent p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Button
            onClick={handleClose}
            variant="outline"
            className="rounded-full bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Close Map
          </Button>

          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            Journey Map
          </h1>

          <div className="w-24" />
        </div>
      </div>

      {/* Canvas Map */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />

      {/* Destination Cards */}
      <div className="absolute bottom-8 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
            {destinations.map((dest, index) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                onHoverStart={() => setHoveredPoint(dest.name)}
                onHoverEnd={() => setHoveredPoint(null)}
                className={`flex-shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-4 border transition-all ${
                  hoveredPoint === dest.name ? 'border-primary shadow-lg shadow-primary/50' : 'border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{dest.name}</h3>
                    <p className="text-xs text-white/60">
                      {dest.lat.toFixed(4)}, {dest.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-24 right-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
        <h3 className="text-sm font-semibold text-white mb-3">Legend</h3>
        <div className="space-y-2 text-xs text-white/80">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span>Destinations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 border-t-2 border-dashed border-primary/50"></div>
            <span>Route</span>
          </div>
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default MapView;
