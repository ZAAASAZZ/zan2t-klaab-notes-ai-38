
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BookOpen, Sparkles } from "lucide-react";

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
        staggerChildren: 0.08
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Subject-specific emoji for each block
  const getBlockEmoji = (subject: string, blockNumber: number) => {
    const emojiMap: Record<string, string[]> = {
      biology: ["🧬", "🫁", "🌱", "🌍", "👪", "🧠"],
      chemistry: ["⚗️", "🧪", "🔥", "⚛️", "🧫", "💊"],
      physics: ["🔋", "🔭", "🌌", "🚀", "🌊", "⚙️"],
      maths: ["📐", "📏", "📊", "🧮", "📉", "📈"],
      english: ["📚", "✒️", "📝", "🗣️", "📖", "🎭"],
      arabic: ["🌙", "🕌", "📜", "🏜️", "🧿", "🪔"],
      french: ["🥖", "🇫🇷", "🗼", "🍷", "🎭", "🥐"],
      social: ["🌎", "🏛️", "👥", "🏙️", "🗿", "🌉"],
      ict: ["💻", "📱", "🖥️", "🌐", "📊", "🤖"],
    };
    
    return emojiMap[subject]?.[blockNumber - 1] || "📔";
  };

  // Helper function to safely generate dynamic classes
  const getSubjectGradient = (selected: boolean) => {
    if (selected) {
      return `bg-${subject} text-${subject}-foreground`;
    }
    return `text-${subject} dark:text-${subject}/90`;
  };

  return (
    <motion.div 
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 p-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {blocks.map((block) => (
        <motion.button
          key={block}
          onClick={() => onSelectBlock(block)}
          className={cn(
            "p-4 md:p-6 rounded-2xl transition-all duration-300 ease-out",
            "flex flex-col items-center justify-center gap-2",
            "hover:scale-105 hover:shadow-lg focus:outline-none",
            selectedBlock === block
              ? cn(
                  "shadow-lg scale-105",
                  subject === "biology" ? "bg-biology text-biology-foreground" :
                  subject === "chemistry" ? "bg-chemistry text-chemistry-foreground" :
                  subject === "physics" ? "bg-physics text-physics-foreground" :
                  subject === "maths" ? "bg-maths text-maths-foreground" :
                  subject === "english" ? "bg-english text-english-foreground" :
                  subject === "arabic" ? "bg-arabic text-arabic-foreground" :
                  subject === "french" ? "bg-french text-french-foreground" :
                  subject === "social" ? "bg-social text-social-foreground" :
                  subject === "ict" ? "bg-ict text-ict-foreground" :
                  "bg-blue-500 text-white"
                )
              : cn(
                  "bg-white/50 shadow-sm backdrop-blur-sm border border-gray-100",
                  "hover:bg-white/80 dark:bg-gray-800/50 dark:border-gray-700",
                  "dark:hover:bg-gray-700/50"
                )
          )}
          variants={item}
        >
          <span className="text-2xl mb-1">
            {getBlockEmoji(subject, block)}
          </span>
          <span className={cn(
            "text-sm font-medium",
            selectedBlock === block 
              ? "" 
              : subject === "biology" ? "text-biology dark:text-biology/90" :
                subject === "chemistry" ? "text-chemistry dark:text-chemistry/90" :
                subject === "physics" ? "text-physics dark:text-physics/90" :
                subject === "maths" ? "text-maths dark:text-maths/90" :
                subject === "english" ? "text-english dark:text-english/90" :
                subject === "arabic" ? "text-arabic dark:text-arabic/90" :
                subject === "french" ? "text-french dark:text-french/90" :
                subject === "social" ? "text-social dark:text-social/90" :
                subject === "ict" ? "text-ict dark:text-ict/90" :
                "text-blue-500 dark:text-blue-400"
          )}>
            Block {block}
          </span>
          
          {/* Subtle indicator if notes exist */}
          <motion.div 
            className={cn(
              "w-2 h-2 rounded-full mt-2",
              selectedBlock === block ? "bg-white/70" : 
                subject === "biology" ? "bg-biology/40" :
                subject === "chemistry" ? "bg-chemistry/40" :
                subject === "physics" ? "bg-physics/40" :
                subject === "maths" ? "bg-maths/40" :
                subject === "english" ? "bg-english/40" :
                subject === "arabic" ? "bg-arabic/40" :
                subject === "french" ? "bg-french/40" :
                subject === "social" ? "bg-social/40" :
                subject === "ict" ? "bg-ict/40" :
                "bg-blue-500/40"
            )}
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>
      ))}
    </motion.div>
  );
}
