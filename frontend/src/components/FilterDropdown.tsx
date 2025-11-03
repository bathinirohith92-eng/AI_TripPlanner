import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
}

export interface FilterState {
  categories: string[];
  budget: string;
  travelTime: string;
  weather: string[];
}

const FilterDropdown = ({ isOpen, onClose, onApplyFilters }: FilterDropdownProps) => {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    budget: "",
    travelTime: "",
    weather: [],
  });

  const categories = ["Popular", "International", "Visa-free", "Budget", "Domestic"];
  const budgets = ["₹0", "₹1K", "₹5K", "₹10K", "₹20K", "₹50K", "₹1L+"];
  const travelTimes = ["<6hr", "6-12hr", "12hr+"];
  const weatherOptions = ["No Rain", "Rain", "Pollution Free", "Warmer", "Colder", "Snow"];

  const toggleCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const toggleWeather = (weather: string) => {
    setFilters(prev => ({
      ...prev,
      weather: prev.weather.includes(weather)
        ? prev.weather.filter(w => w !== weather)
        : [...prev.weather, weather]
    }));
  };

  const resetFilters = () => {
    setFilters({
      categories: [],
      budget: "",
      travelTime: "",
      weather: [],
    });
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-4 w-[400px] bg-background border border-border rounded-2xl shadow-[var(--shadow-strong)] z-50 p-6 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Filters */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filters.categories.includes(category)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">Budget</h4>
              <div className="flex flex-wrap gap-2">
                {budgets.map(budget => (
                  <button
                    key={budget}
                    onClick={() => setFilters(prev => ({ ...prev, budget }))}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filters.budget === budget
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {budget}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Time Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">Travel Time</h4>
              <div className="flex gap-2">
                {travelTimes.map(time => (
                  <button
                    key={time}
                    onClick={() => setFilters(prev => ({ ...prev, travelTime: time }))}
                    className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filters.travelTime === time
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Weather & AQI Filters */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">Weather & AQI</h4>
              <div className="flex flex-wrap gap-2">
                {weatherOptions.map(weather => (
                  <button
                    key={weather}
                    onClick={() => toggleWeather(weather)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filters.weather.includes(weather)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {weather}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={resetFilters}
                className="flex-1 gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              <Button
                onClick={applyFilters}
                className="flex-1"
              >
                Apply Filters
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterDropdown;
