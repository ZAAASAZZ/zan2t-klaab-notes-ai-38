
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FullCurriculumInputProps {
  subject: string;
  onSaveNotes: (blockNotes: { [block: string]: string }) => void;
}

export function FullCurriculumInput({ subject, onSaveNotes }: FullCurriculumInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerateNotes = async () => {
    if (!content.trim()) {
      toast.error("Please enter some content first");
      return;
    }

    setIsProcessing(true);

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
                    text: `You are an expert study notes organizer. Take these full curriculum notes for ${subject} and split them into 6 blocks. Format each block beautifully with emojis, tables, and clear sections. Keep the structure consistent. Here are the notes to organize:\n\n${content}`
                  }
                ]
              }
            ]
          })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate notes");
      }

      const data = await response.json();
      const enhancedContent = data.candidates[0]?.content?.parts?.[0]?.text;

      if (!enhancedContent) {
        throw new Error("No content generated");
      }

      // Split the content into blocks based on markdown headers
      const blocks = enhancedContent.split(/^## Block \d+:/m)
        .filter(block => block.trim())
        .reduce((acc, block, index) => {
          acc[`${index + 1}`] = block.trim();
          return acc;
        }, {} as { [key: string]: string });

      onSaveNotes(blocks);
      setIsOpen(false);
      toast.success("Notes generated and organized into blocks!");
    } catch (error) {
      console.error("Error generating notes:", error);
      toast.error("Failed to generate notes. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "gap-2 transition-all hover:shadow-md",
            `hover:bg-${subject}/10 hover:text-${subject}`
          )}
        >
          <Upload className="h-4 w-4" />
          Upload Full Curriculum
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[90vw] max-w-2xl sm:w-[600px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Upload Full Curriculum for {subject}
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Paste all your ${subject} notes here. The AI will automatically organize them into blocks...`}
            className="h-[400px] resize-none"
          />
          
          <div className="flex justify-end gap-2">
            <Button
              variant="default"
              className={cn(
                `bg-${subject}`,
                "transition-all hover:opacity-90"
              )}
              onClick={handleGenerateNotes}
              disabled={isProcessing || !content.trim()}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Generate Structured Notes"
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
