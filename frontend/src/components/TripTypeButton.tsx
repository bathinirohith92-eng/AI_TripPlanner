import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface TripTypeButtonProps {
  icon: LucideIcon;
  label: string;
  badge?: string;
  onClick?: () => void;
}

const TripTypeButton = ({ icon: Icon, label, badge, onClick }: TripTypeButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative flex flex-col items-center gap-2 p-4 bg-card rounded-2xl shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-all w-24 h-28 min-w-[96px] min-h-[112px]"
    >
      {badge && (
        <span className="absolute -top-2 -right-2 bg-destructive text-white text-xs px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <span className="text-sm font-medium text-center leading-tight">{label}</span>
    </motion.button>
  );
};

export default TripTypeButton;
