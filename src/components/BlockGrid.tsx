
import { useState } from "react";
import { cn } from "@/lib/utils";

interface BlockGridProps {
  subject: string;
  onSelectBlock: (block: number) => void;
  selectedBlock: number | null;
}

export function BlockGrid({ subject, onSelectBlock, selectedBlock }: BlockGridProps) {
  const blocks = Array.from({ length: 6 }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6 animate-fade-in">
      {blocks.map((block) => (
        <button
          key={block}
          onClick={() => onSelectBlock(block)}
          className={cn(
            "p-6 rounded-2xl transition-all duration-300 ease-out",
            "hover:scale-105 hover:shadow-lg",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            selectedBlock === block
              ? `bg-${subject} text-${subject}-foreground shadow-lg scale-105`
              : "bg-white/50 shadow-sm hover:bg-white/80"
          )}
        >
          <span className="text-lg font-medium">Block {block}</span>
        </button>
      ))}
    </div>
  );
}
