
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const subjects = [
  { id: "biology", name: "Biology", color: "bg-biology text-biology-foreground" },
  { id: "chemistry", name: "Chemistry", color: "bg-chemistry text-chemistry-foreground" },
  { id: "ict", name: "ICT", color: "bg-ict text-ict-foreground" },
  { id: "physics", name: "Physics", color: "bg-physics text-physics-foreground" },
  { id: "maths", name: "Maths", color: "bg-maths text-maths-foreground" },
  { id: "english", name: "English", color: "bg-english text-english-foreground" },
  { id: "arabic", name: "Arabic", color: "bg-arabic text-arabic-foreground" },
  { id: "french", name: "French", color: "bg-french text-french-foreground" },
  { id: "social", name: "Social", color: "bg-social text-social-foreground" },
];

interface SubjectSelectProps {
  onSelect: (subject: string) => void;
  selectedSubject: string | null;
}

export function SubjectSelect({ onSelect, selectedSubject }: SubjectSelectProps) {
  return (
    <div className="overflow-x-auto pb-2 no-scrollbar">
      <motion.div 
        className="flex gap-2 p-6 min-w-max"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {subjects.map((subject) => (
          <motion.button
            key={subject.id}
            onClick={() => onSelect(subject.id)}
            className={cn(
              "px-6 py-3 rounded-2xl transition-all duration-300 ease-out",
              "hover:scale-105 hover:shadow-lg",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              selectedSubject === subject.id
                ? `${subject.color} shadow-lg scale-105`
                : "bg-white/50 shadow-sm backdrop-blur-sm hover:bg-white/80 border border-gray-100"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="font-medium whitespace-nowrap">{subject.name}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
