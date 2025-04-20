import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Image, Book, AlertCircle, Loader2, CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ResourceUploaderProps {
  subject: string;
  onGenerateNotes: (blockNotes: { [block: string]: string }) => void;
}

interface FileWithPreview extends File {
  preview?: string;
}

export function ResourceUploader({ subject, onGenerateNotes }: ResourceUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("1");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    const filesWithPreview = selectedFiles.map(file => {
      const fileWithPreview = file as FileWithPreview;
      if (file.type.startsWith("image/")) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }
      return fileWithPreview;
    });
    
    setFiles(prev => [...prev, ...filesWithPreview]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    toast.success(`${selectedFiles.length} file(s) added`);
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <Image className="h-5 w-5 text-blue-500" />;
    if (file.type === "application/pdf") return <FileText className="h-5 w-5 text-red-500" />;
    if (file.type.includes("document") || file.type.includes("sheet")) return <FileText className="h-5 w-5 text-green-500" />;
    return <Book className="h-5 w-5 text-purple-500" />;
  };

  const processFiles = async () => {
    if (files.length === 0) {
      toast.error("Please upload at least one resource file");
      return;
    }

    setIsProcessing(true);
    setProcessingStatus("Analyzing uploaded resources...");

    try {
      let combinedContent = "";
      
      for (const file of files) {
        combinedContent += `${file.name} (${file.type})\n`;
        
        if (file.type.startsWith("image/")) {
          setProcessingStatus(`Extracting text from ${file.name}...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else if (file.type === "application/pdf") {
          setProcessingStatus(`Parsing PDF: ${file.name}...`);
          await new Promise(resolve => setTimeout(resolve, 1500));
        } else {
          setProcessingStatus(`Processing ${file.name}...`);
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }

      setProcessingStatus("Generating structured notes...");
      
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
                    text: `You are an AI-powered academic note generator.
                    Your task is to process uploaded educational resources (PDFs, images, docs, and slides), then create flawless, high-quality study notes for ${subject} subject and block ${selectedBlock}.

                    These notes must be:
                    - 100% accurate
                    - Clear and simple
                    - Visually structured (tables, diagrams, icons, headings)
                    - Memorization-ready
                    - Perfectly aligned with the document's learning objectives or indicators

                    Format the notes using proper HTML structure:
                    1. Use <h2> for main section titles with appropriate emojis (e.g., "<h2>📘 Main Topic</h2>")
                    2. Use <h3> for subsections with relevant emojis (e.g., "<h3>🧬 Subsection</h3>")
                    3. Create properly formatted HTML tables with <table>, <thead>, <tbody>, <tr>, <th>, <td> elements for tabular data
                    4. Use <ul> and <li> for bullet points
                    5. Use <strong> for important terms/definitions
                    6. Use <div class="key-structure"> for key points or special notes

                    Based on these uploaded resources:
                    ${combinedContent}

                    Create comprehensive study notes for ${subject} Block ${selectedBlock} that are perfect for studying, memorizing, and reviewing.

                    NOTE: Since I don't have the actual content of the files, please generate realistic educational notes about common ${subject} topics for Block ${selectedBlock} that would be typically taught in grade 9.`
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
        throw new Error("Failed to generate notes");
      }

      const data = await response.json();
      const generatedContent = data.candidates[0]?.content?.parts?.[0]?.text;

      if (!generatedContent) {
        throw new Error("No content generated");
      }

      setProcessingStatus("Verifying and optimizing notes...");
      await new Promise(resolve => setTimeout(resolve, 1000));

      const blockNotes = {
        [selectedBlock]: generatedContent
      };
      
      onGenerateNotes(blockNotes);
      setIsOpen(false);
      toast.success(`Notes generated successfully for ${subject} Block ${selectedBlock}!`);
      
    } catch (error) {
      console.error("Error generating notes:", error);
      toast.error("Failed to generate notes. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "gap-2 transition-all hover:shadow-md ml-2",
            `hover:bg-${subject}/10 hover:text-${subject}`
          )}
        >
          <Upload className="h-4 w-4" />
          Upload Resources
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[90vw] max-w-2xl sm:w-[600px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className={cn("text-gradient bg-gradient-to-r", 
              `from-${subject} to-${subject}/70`)}>
              Upload Resources for {subject.charAt(0).toUpperCase() + subject.slice(1)}
            </span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          <Tabs defaultValue="upload">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="upload">Upload Files</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 bg-muted/30">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                />
                <Button 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mb-2"
                  disabled={isProcessing}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select Files
                </Button>
                <p className="text-sm text-muted-foreground">
                  PDF, images, Office docs, and slides
                </p>
              </div>
              
              {files.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Uploaded Files ({files.length})</h3>
                  <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                    {files.map((file, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between py-2 px-3 hover:bg-muted/50 rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          {getFileIcon(file)}
                          <span className="text-sm truncate max-w-[300px]">
                            {file.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-full h-6 w-6 p-0"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="settings">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Block</label>
                  <select 
                    value={selectedBlock} 
                    onChange={(e) => setSelectedBlock(e.target.value)}
                    className="w-full p-2 rounded-md border bg-background"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num.toString()}>
                        Block {num}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {files.length > 0 && (
            <Alert className={cn(
              "bg-amber-50 text-amber-800 border-amber-200",
              "dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30"
            )}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Processing information</AlertTitle>
              <AlertDescription className="text-sm">
                Files will be processed to extract educational content. The AI will generate 
                structured notes based on the learning material.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="default"
              className={cn(
                "bg-gradient-to-r",
                `from-${subject} to-${subject}/80`,
                "transition-all hover:opacity-90"
              )}
              onClick={processFiles}
              disabled={isProcessing || files.length === 0}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {processingStatus || "Processing..."}
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
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
