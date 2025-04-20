import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Save, X, Code, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NoteEditorProps {
  content: string;
  onSave: (content: string) => void;
  subject: string;
  onClose: () => void;
}

export function NoteEditor({ content, onSave, subject, onClose }: NoteEditorProps) {
  const [noteContent, setNoteContent] = useState(content);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [htmlMode, setHtmlMode] = useState(false);
  const [previewContent, setPreviewContent] = useState(content);
  const [activeTab, setActiveTab] = useState("edit");

  const handleSave = () => {
    onSave(noteContent);
    toast.success("Note saved successfully!");
    onClose();
  };

  const toggleHtmlMode = () => {
    setHtmlMode(!htmlMode);
  };

  const updatePreview = () => {
    setPreviewContent(noteContent);
    setActiveTab("preview");
    toast.success("Preview updated");
  };

  const enhanceWithGemini = async () => {
    if (!noteContent.trim()) {
      toast.error("Please add some content before enhancing");
      return;
    }

    setIsEnhancing(true);
    
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBifBlQrTA5TAEQVCuTMJ1egnKSZ1vhiHA",
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
                    text: `Transform these study notes into well-structured HTML format with beautiful styling for ${subject} notes.
                    
                    1. Use <h2> for main section titles with appropriate emojis (e.g., "<h2>📘 Main Topic</h2>")
                    2. Use <h3> for subsections with relevant emojis (e.g., "<h3>🧬 Subsection</h3>")
                    3. Create properly formatted HTML tables with <table>, <thead>, <tbody>, <tr>, <th>, <td> elements for any tabular data
                    4. Use <ul> and <li> for bullet points
                    5. Use <strong> for important terms/definitions
                    6. Use <div class="key-structure"> for key points or special notes
                    7. Apply proper section headings, clean formatting, and clear structure
                    8. Add relevant emojis to make content visually engaging
                    9. Use proper HTML markup to ensure it renders correctly when inserted with innerHTML
                    10. Ensure all HTML tags are properly closed and the structure is valid

                    Format the content to look like a professionally designed study note that's visually clear and well-organized.
                    
                    Here are the notes to enhance:\n\n${noteContent}`
                  }
                ]
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
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const enhancedContent = data.candidates[0].content.parts[0].text;
        setNoteContent(enhancedContent);
        setPreviewContent(enhancedContent);
        setActiveTab("preview");
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className={cn(
        "w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6",
        "dark:bg-gray-800 dark:border dark:border-gray-700",
        "animate-scale-in"
      )}>
        <div className="mb-4 flex justify-between items-center">
          <h3 className={cn(
            "text-lg font-medium flex items-center gap-2",
            `text-${subject}`
          )}>
            <Sparkles className="h-5 w-5" />
            Editing {subject.charAt(0).toUpperCase() + subject.slice(1)} Notes
          </h3>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleHtmlMode}
              className={cn(
                "text-xs",
                htmlMode && "bg-gray-100 dark:bg-gray-700"
              )}
            >
              <Code className="h-3 w-3 mr-1" />
              HTML Mode
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="edit" className="mt-0">
            <Textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className={cn(
                "w-full h-[50vh] p-4 font-mono text-sm",
                "rounded-xl mb-4 resize-none",
                "focus:ring-2 focus:ring-offset-0",
                `focus:ring-${subject}`,
                htmlMode && "font-mono"
              )}
              placeholder="Enter your notes here..."
            />
          </TabsContent>
          
          <TabsContent value="preview" className="mt-0">
            <div className={cn(
              "w-full h-[50vh] p-4 overflow-auto rounded-xl border",
              "bg-white dark:bg-gray-900",
              "notes-container prose max-w-none dark:prose-invert",
              `prose-headings:text-${subject}`
            )}>
              <div dangerouslySetInnerHTML={{ __html: previewContent }} />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex flex-wrap gap-3 mt-4">
          <Button
            onClick={handleSave}
            className={cn(
              "bg-gradient-to-r",
              `from-${subject} to-${subject}/80`,
              "text-white hover:opacity-90"
            )}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          
          <Button
            onClick={enhanceWithGemini}
            variant="outline"
            disabled={isEnhancing}
            className="border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isEnhancing ? "Enhancing..." : "Enhance with AI"}
          </Button>
          
          {activeTab === "edit" && (
            <Button
              onClick={updatePreview}
              variant="secondary"
              className="dark:bg-gray-700"
            >
              <Check className="mr-2 h-4 w-4" />
              Update Preview
            </Button>
          )}
          
          <Button
            onClick={onClose}
            variant="ghost"
            className="ml-auto hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
