
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NoteEditorProps {
  content: string;
  onSave: (content: string) => void;
  subject: string;
  onClose: () => void;
}

export function NoteEditor({ content, onSave, subject, onClose }: NoteEditorProps) {
  const [noteContent, setNoteContent] = useState(content);

  const handleSave = () => {
    onSave(noteContent);
    onClose();
  };

  // TODO: Add Gemini integration for AI enhancement

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className={cn(
        "w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6",
        "animate-scale-in"
      )}>
        <textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          className={cn(
            "w-full h-64 p-4 rounded-xl",
            "focus:outline-none focus:ring-2",
            "resize-none bg-gray-50",
            `focus:ring-${subject}`
          )}
          placeholder="Enter your notes here..."
        />
        <div className="flex gap-4 mt-4">
          <button
            onClick={handleSave}
            className={cn(
              "px-6 py-2 rounded-xl",
              `bg-${subject} text-${subject}-foreground`,
              "hover:opacity-90 transition-opacity"
            )}
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
