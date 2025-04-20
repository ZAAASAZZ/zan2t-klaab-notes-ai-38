
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Loader2, Upload, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FullCurriculumInputProps {
  subject: string;
  onSaveNotes: (blockNotes: { [block: string]: string }) => void;
}

type ImportMode = 'full' | 'single';

export function FullCurriculumInput({ subject, onSaveNotes }: FullCurriculumInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [importMode, setImportMode] = useState<ImportMode>('full');
  const [selectedBlock, setSelectedBlock] = useState("1");

  const handleGenerateNotes = async () => {
    if (!content.trim()) {
      toast.error("Please enter some content first");
      return;
    }

    setIsProcessing(true);

    try {
      let prompt = `You are an expert study notes organizer. `;
      
      if (importMode === 'full') {
        prompt += `Take these full curriculum notes for ${subject} and split them into 6 blocks.`;
      } else {
        prompt += `Take these notes for ${subject} Block ${selectedBlock} and organize them into a well-structured format.`;
      }
      
      prompt += ` Format each block with proper HTML markup including:
                    
      1. Use <h2> for block titles with appropriate emojis, for example: "<h2>📘 Block ${importMode === 'single' ? selectedBlock : '[Number]'}: [Topic]</h2>"
      2. Use <h3> for section headers with relevant emojis, for example: "<h3>🧬 Section Title</h3>"
      3. Use properly formatted HTML tables with <table>, <thead>, <tbody>, <tr>, <th>, <td> elements for tabular data
      4. Use <ul> and <li> for bullet points
      5. Use <strong> tags for important terms and definitions
      6. Use <div class="key-structure"> for key structures or special notes
      7. Each block must have a clear title and be clearly separated from other blocks
      8. Add relevant emojis to sections to make content visually engaging
      
      Important: Make sure to properly close all HTML tags and validate HTML structure.
      All HTML must be properly formatted and safe to insert directly using innerHTML.
      ${importMode === 'full' ? 'Create 6 blocks with logical divisions based on related topics.' : 'Focus on creating one well-organized block of content.'}
      
      Here are the notes to organize:\n\n${content}`;

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
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              topP: 0.8,
              maxOutputTokens: 8000
            }
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

      if (importMode === 'single') {
        // For single block, just save to the selected block
        onSaveNotes({
          [selectedBlock]: enhancedContent
        });
        setIsOpen(false);
        toast.success(`Notes generated for Block ${selectedBlock}!`);
        return;
      }

      // Split the content into blocks based on h2 headers
      const blockRegex = /<h2.*?>.*?Block\s*(\d+).*?<\/h2>([\s\S]*?)(?=<h2|$)/gi;
      let match;
      const blocks: { [key: string]: string } = {};
      
      while ((match = blockRegex.exec(enhancedContent)) !== null) {
        const blockNumber = match[1];
        const blockContent = match[0].trim();
        blocks[blockNumber] = blockContent;
      }

      // If we didn't get all 6 blocks, handle the error
      if (Object.keys(blocks).length < 6) {
        // Check if the content is properly formatted but missing the block headers
        const sections = enhancedContent.split('<h2');
        if (sections.length > 1) {
          // Process each section
          for (let i = 1; i <= Math.min(sections.length - 1, 6); i++) {
            const section = '<h2' + sections[i];
            blocks[i.toString()] = section.trim();
          }
        } else {
          // Fallback: divide content into roughly equal parts
          const dividedContent = enhancedContent.split("\n\n");
          const partsPerBlock = Math.ceil(dividedContent.length / 6);
          
          for (let i = 0; i < 6; i++) {
            const start = i * partsPerBlock;
            const end = Math.min(start + partsPerBlock, dividedContent.length);
            const blockContent = dividedContent.slice(start, end).join("\n\n");
            blocks[(i + 1).toString()] = `<h2>📘 Block ${i + 1}</h2>\n${blockContent}`;
          }
        }
      }

      // Save all blocks
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
            <span className={cn("text-gradient bg-gradient-to-r", 
              `from-${subject} to-${subject}/70`)}>
              Upload {importMode === 'full' ? 'Full Curriculum' : `Block ${selectedBlock}`} for {subject.charAt(0).toUpperCase() + subject.slice(1)}
            </span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <div className="mb-4 space-y-4">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Import Mode</label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={importMode === 'full'}
                    onChange={() => setImportMode('full')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>Full Curriculum</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={importMode === 'single'}
                    onChange={() => setImportMode('single')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>Single Block</span>
                </label>
              </div>
            </div>

            {importMode === 'single' && (
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Select Block</label>
                <select
                  value={selectedBlock}
                  onChange={(e) => setSelectedBlock(e.target.value)}
                  className="w-full max-w-[200px] rounded-md border border-input bg-background px-3 py-1"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num.toString()}>
                      Block {num}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={importMode === 'full' 
              ? `Paste all your ${subject} notes here. The AI will automatically organize them into blocks...`
              : `Paste your ${subject} Block ${selectedBlock} notes here...`
            }
            className="h-[400px] resize-none"
          />
          
          <div className="flex justify-end gap-2">
            <Button
              variant="default"
              className={cn(
                "bg-gradient-to-r",
                `from-${subject} to-${subject}/80`,
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
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Notes
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
