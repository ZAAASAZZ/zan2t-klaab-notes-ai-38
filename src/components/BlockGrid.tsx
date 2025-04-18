
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BlockGridProps {
  subject: string;
  onSelectBlock: (block: number) => void;
  selectedBlock: number | null;
}

export function BlockGrid({ subject, onSelectBlock, selectedBlock }: BlockGridProps) {
  const blocks = Array.from({ length: 6 }, (_, i) => i + 1);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {blocks.map((block) => (
        <motion.button
          key={block}
          onClick={() => onSelectBlock(block)}
          className={cn(
            "p-6 rounded-2xl transition-all duration-300 ease-out",
            "hover:scale-105 hover:shadow-lg",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            selectedBlock === block
              ? `bg-${subject}/20 border-2 border-${subject} shadow-lg scale-105`
              : "bg-white/50 shadow-sm backdrop-blur-sm hover:bg-white/80 border border-gray-100"
          )}
          variants={item}
        >
          <span className="text-lg font-medium">Block {block}</span>
        </motion.button>
      ))}
    </motion.div>
  );
}
