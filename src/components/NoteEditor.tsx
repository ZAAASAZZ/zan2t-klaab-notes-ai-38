
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NoteEditorProps {
  content: string;
  onSave: (content: string) => void;
  subject: string;
  onClose: () => void;
}

export function NoteEditor({ content, onSave, subject, onClose }: NoteEditorProps) {
  const [noteContent, setNoteContent] = useState(content);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleSave = () => {
    onSave(noteContent);
    toast.success("Note saved successfully!");
    onClose();
  };

  const enhanceWithGemini = async () => {
    if (!noteContent.trim()) {
      toast.error("Please add some content before enhancing");
      return;
    }

    setIsEnhancing(true);
    
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyC014GbaKqQEtiyNX6rk2JTgwNyxm_89IU",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Summarize and format these study notes for ${subject} Block. Keep the tone clear, student-friendly, concise, and well-structured:
                    ${noteContent}`
                  }
                ]
              }
            ]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const enhancedContent = data.candidates[0].content.parts[0].text;
        setNoteContent(enhancedContent);
        toast.success("Notes enhanced with AI!");
      } else {
        throw new Error("Unexpected response format from Gemini API");
      }
    } catch (error) {
      console.error("Error enhancing with Gemini:", error);
      toast.error("Failed to enhance notes. Please try again.");
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className={cn(
        "w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6",
        "dark:bg-gray-800 dark:border dark:border-gray-700",
        "animate-scale-in"
      )}>
        <div className="mb-4">
          <h3 className="text-lg font-medium">
            Editing {subject}
          </h3>
        </div>
        
        <Textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          className={cn(
            "w-full h-64 p-4 rounded-xl mb-4 resize-none",
            "focus:ring-2 focus:ring-offset-0",
            `focus:ring-${subject}`
          )}
          placeholder="Enter your notes here..."
        />
        
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleSave}
            className={`bg-${subject} text-${subject}-foreground hover:opacity-90`}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          
          <Button
            onClick={enhanceWithGemini}
            variant="outline"
            disabled={isEnhancing}
            className="border border-gray-200 hover:bg-gray-50"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isEnhancing ? "Enhancing..." : "Enhance with AI"}
          </Button>
          
          <Button
            onClick={onClose}
            variant="ghost"
            className="ml-auto"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
