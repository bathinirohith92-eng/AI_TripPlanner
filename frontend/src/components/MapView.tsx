import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
// @ts-ignore
import { useJsApiLoader, GoogleMap } from "@react-google-maps/api";
import { X, MapPin, Clock, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface OptimizedSpot {
  spot_name: string;
  lat: number;
  long: number;
  description: string;
  estimated_time_spent: string;
  weather: string;
}

interface OptimizedRoute {
  optimized_order: OptimizedSpot[];
  polyline: string;
}

interface TripDetails {
  trip_name: string;
  itinerary_name: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  destination: string;
}

interface Itinerary {
  title: string;
  duration: string;
  durationDays: number;
  budget?: string;
  short_desc: string;
  highlights: string[];
  optimized_routes?: Record<string, OptimizedRoute>;
  trip_details?: TripDetails;
}

interface MapViewProps {
  isOpen: boolean;
  onClose: () => void;
  itineraries: Itinerary[];
}

const LIBRARIES = ["places", "geometry"] as const;
const containerStyle = { width: "100%", height: "100%" };

const MapView: React.FC<MapViewProps> = ({ isOpen, onClose, itineraries }) => {
  const [selectedPlan, setSelectedPlan] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // @ts-ignore
  const mapRef = useRef<any>(null);
  // @ts-ignore
  const markersRef = useRef<any[]>([]);
  // @ts-ignore
  const polylineRef = useRef<any>(null);
  const animationRef = useRef<number>();

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env?.VITE_REACT_APP_GOOGLE_MAPS_API_KEY || "",
    libraries: [...LIBRARIES],
  });

  // Extract locations from selected plan
  const currentPlanLocations = useMemo(() => {
    if (!itineraries[selectedPlan]?.optimized_routes) return [];

    const locations: Array<OptimizedSpot & { day: string }> = [];
    const routes = itineraries[selectedPlan].optimized_routes!;

    Object.keys(routes)
      .sort((a, b) => {
        const numA = parseInt(a.replace("Day ", ""));
        const numB = parseInt(b.replace("Day ", ""));
        return numA - numB;
      })
      .forEach((dayKey) => {
        routes[dayKey].optimized_order.forEach((spot) => {
          locations.push({ ...spot, day: dayKey });
        });
      });

    return locations;
  }, [itineraries, selectedPlan]);

  // Create path points for animation
  const pathPoints = useMemo(() => {
    if (currentPlanLocations.length < 2) return [];

    const points: Array<{
      lat: number;
      lng: number;
      day: string;
      spot: OptimizedSpot;
    }> = [];

    // Create curved path between consecutive locations
    const createCurvedPath = (
      start: OptimizedSpot & { day: string },
      end: OptimizedSpot & { day: string },
      steps = 30
    ) => {
      const midLat = (start.lat + end.lat) / 2;
      const midLng = (start.long + end.long) / 2;
      const curveOffset = 10;
      const curveLat = midLat + (end.long - start.long) / curveOffset;
      const curveLng = midLng - (end.lat - start.lat) / curveOffset;

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const lat =
          (1 - t) * (1 - t) * start.lat +
          2 * (1 - t) * t * curveLat +
          t * t * end.lat;
        const lng =
          (1 - t) * (1 - t) * start.long +
          2 * (1 - t) * t * curveLng +
          t * t * end.long;

        points.push({
          lat,
          lng,
          day: i === steps ? end.day : start.day,
          spot: i === steps ? end : start,
        });
      }
    };

    for (let i = 0; i < currentPlanLocations.length - 1; i++) {
      createCurvedPath(currentPlanLocations[i], currentPlanLocations[i + 1]);
    }

    return points;
  }, [currentPlanLocations]);

  // @ts-ignore
  const onMapLoad = useCallback(
    (map: any) => {
      mapRef.current = map;

      if (currentPlanLocations.length > 0) {
        // @ts-ignore
        const bounds = new google.maps.LatLngBounds();
        currentPlanLocations.forEach((location) => {
          bounds.extend({ lat: location.lat, lng: location.long });
        });
        map.fitBounds(bounds);
      }
    },
    [currentPlanLocations]
  );

  // Clear existing markers and polylines
  const clearMapElements = useCallback(() => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
  }, []);

  // Add markers for current plan
  const addMarkers = useCallback(() => {
    if (!mapRef.current || currentPlanLocations.length === 0) return;

    clearMapElements();

    currentPlanLocations.forEach((location, index) => {
      // @ts-ignore
      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.long },
        map: mapRef.current,
        title: location.spot_name,
        label: {
          text: (index + 1).toString(),
          color: "white",
          fontWeight: "bold",
        },
        icon: {
          // @ts-ignore
          path: google.maps.SymbolPath.CIRCLE,
          scale: 20,
          fillColor:
            index === 0
              ? "#22c55e"
              : index === currentPlanLocations.length - 1
              ? "#ef4444"
              : "#3b82f6",
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 2,
        },
      });

      // @ts-ignore
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${location.spot_name}</h3>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${location.description}</p>
            <div style="font-size: 11px; color: #888;">
              <div>${location.day} • ${location.estimated_time_spent}</div>
              <div>Weather: ${location.weather}</div>
            </div>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(mapRef.current, marker);
      });

      markersRef.current.push(marker);
    });
  }, [currentPlanLocations, clearMapElements]);

  // Add polyline for route
  const addPolyline = useCallback(() => {
    if (!mapRef.current || pathPoints.length === 0) return;

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // @ts-ignore
    const polyline = new google.maps.Polyline({
      path: pathPoints.map((p) => ({ lat: p.lat, lng: p.lng })),
      geodesic: true,
      strokeColor: "#3b82f6",
      strokeOpacity: 1.0,
      strokeWeight: 3,
    });

    polyline.setMap(mapRef.current);
    polylineRef.current = polyline;
  }, [pathPoints]);

  // Animation logic
  const startAnimation = useCallback(() => {
    if (pathPoints.length === 0) return;

    setIsAnimating(true);
    setAnimationProgress(0);

    const animate = () => {
      setAnimationProgress((prev) => {
        const next = prev + 0.5; // Animation speed
        if (next >= pathPoints.length - 1) {
          setIsAnimating(false);
          return pathPoints.length - 1;
        }
        return next;
      });

      if (animationProgress < pathPoints.length - 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [pathPoints, animationProgress]);

  const stopAnimation = useCallback(() => {
    setIsAnimating(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  // Update map when plan changes
  useEffect(() => {
    if (isLoaded && mapRef.current) {
      addMarkers();
      addPolyline();
    }
  }, [isLoaded, selectedPlan, addMarkers, addPolyline]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (loadError) return <div>Map failed to load</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Map Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-4 bg-white rounded-2xl shadow-2xl z-[60] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary to-secondary text-white">
              <h2 className="text-xl font-bold">Travel Route Visualization</h2>
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex h-[calc(100%-4rem)]">
              {/* Sidebar */}
              <div className="w-80 bg-gray-50 border-r overflow-y-auto">
                <div className="p-4">
                  <h3 className="font-semibold mb-4">Select Plan</h3>

                  {/* Plan Selection */}
                  <div className="space-y-3 mb-6">
                    {itineraries.map((itinerary, index) => (
                      <Card
                        key={index}
                        className={`p-3 cursor-pointer transition-all ${
                          selectedPlan === index
                            ? "border-primary bg-primary/5"
                            : "hover:border-primary/30"
                        }`}
                        onClick={() => setSelectedPlan(index)}
                      >
                        <div className="font-medium text-sm">
                          Plan {index + 1}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {itinerary.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {itinerary.durationDays} Days • {itinerary.budget}
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Animation Controls */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Route Animation</h4>
                    <div className="flex gap-2">
                      <Button
                        onClick={startAnimation}
                        disabled={isAnimating || pathPoints.length === 0}
                        size="sm"
                        className="flex-1"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Play Route
                      </Button>
                      <Button
                        onClick={stopAnimation}
                        disabled={!isAnimating}
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        <Pause className="w-4 h-4 mr-1" />
                        Stop
                      </Button>
                    </div>
                  </div>

                  {/* Day-wise Breakdown */}
                  {itineraries[selectedPlan]?.optimized_routes && (
                    <div>
                      <h4 className="font-medium mb-2">Day-wise Itinerary</h4>
                      <div className="space-y-2">
                        {Object.keys(
                          itineraries[selectedPlan].optimized_routes!
                        )
                          .sort((a, b) => {
                            const numA = parseInt(a.replace("Day ", ""));
                            const numB = parseInt(b.replace("Day ", ""));
                            return numA - numB;
                          })
                          .map((dayKey) => {
                            const dayRoute =
                              itineraries[selectedPlan].optimized_routes![
                                dayKey
                              ];
                            return (
                              <Card
                                key={dayKey}
                                className={`p-2 cursor-pointer transition-all ${
                                  selectedDay === dayKey
                                    ? "border-blue-500 bg-blue-50"
                                    : "hover:border-gray-300"
                                }`}
                                onClick={() =>
                                  setSelectedDay(
                                    selectedDay === dayKey ? null : dayKey
                                  )
                                }
                              >
                                <div className="font-medium text-sm flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                  {dayKey}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {dayRoute.optimized_order.length} locations
                                </div>

                                {selectedDay === dayKey && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    className="mt-2 space-y-1"
                                  >
                                    {dayRoute.optimized_order.map(
                                      (spot, idx) => (
                                        <div
                                          key={idx}
                                          className="text-xs p-2 bg-white rounded border"
                                        >
                                          <div className="font-medium">
                                            {spot.spot_name}
                                          </div>
                                          <div className="text-gray-500">
                                            {spot.estimated_time_spent}
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </motion.div>
                                )}
                              </Card>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Map */}
              <div className="flex-1 relative">
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  onLoad={onMapLoad}
                  options={{
                    streetViewControl: false,
                    fullscreenControl: true,
                    zoomControl: true,
                    mapTypeControl: true,
                  }}
                />

                {/* Animation Progress Indicator */}
                {isAnimating && (
                  <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">
                        Animating Route...{" "}
                        {Math.round(
                          (animationProgress / pathPoints.length) * 100
                        )}
                        %
                      </span>
                    </div>
                  </div>
                )}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
                  <div className="text-sm font-medium mb-2">Legend</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Start Point</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Waypoints</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>End Point</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MapView;
