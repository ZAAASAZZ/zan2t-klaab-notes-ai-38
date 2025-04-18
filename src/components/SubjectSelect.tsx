
import { useState } from "react";
import { cn } from "@/lib/utils";

const subjects = [
  { id: "biology", name: "Biology", color: "bg-biology text-biology-foreground" },
  { id: "chemistry", name: "Chemistry", color: "bg-chemistry text-chemistry-foreground" },
  { id: "ict", name: "ICT", color: "bg-ict text-ict-foreground" },
];

interface SubjectSelectProps {
  onSelect: (subject: string) => void;
  selectedSubject: string | null;
}

export function SubjectSelect({ onSelect, selectedSubject }: SubjectSelectProps) {
  return (
    <div className="flex gap-4 p-6">
      {subjects.map((subject) => (
        <button
          key={subject.id}
          onClick={() => onSelect(subject.id)}
          className={cn(
            "px-6 py-3 rounded-2xl transition-all duration-300 ease-out",
            "hover:scale-105 hover:shadow-lg",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            selectedSubject === subject.id
              ? `${subject.color} shadow-lg scale-105`
              : "bg-white/50 shadow-sm hover:bg-white/80"
          )}
        >
          <span className="font-medium">{subject.name}</span>
        </button>
      ))}
    </div>
  );
}
