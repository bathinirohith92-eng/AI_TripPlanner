import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface DestinationCardProps {
  name: string;
  image: string;
  delay?: number;
}

const DestinationCard = ({ name, image, delay = 0 }: DestinationCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Generate a complete trip planning query
    const tripQuery = `Plan a 3-day trip to ${name} for 2 people next week. Include local attractions, hidden sites.`;
    navigate(`/chat?query=${encodeURIComponent(tripQuery)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={handleClick}
      className="group cursor-pointer relative overflow-hidden rounded-3xl shadow-[var(--shadow-medium)] hover:shadow-[var(--shadow-strong)] transition-all duration-300"
    >
      <div className="aspect-square relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-white text-2xl font-bold">{name}</h3>
        </div>
      </div>
    </motion.div>
  );
};

export default DestinationCard;
