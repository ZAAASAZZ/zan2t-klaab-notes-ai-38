
import { useState, useEffect } from "react";
import { SubjectSelect } from "@/components/SubjectSelect";
import { BlockGrid } from "@/components/BlockGrid";
import { NoteEditor } from "@/components/NoteEditor";
import { loadNotes, saveNotes } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Edit3, Moon, Sun, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Index() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(loadNotes());
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Check for dark mode preference
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode === "true") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    
    // Load notes from storage
    setNotes(loadNotes());
  }, []);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  const handleSaveNote = (content: string) => {
    if (selectedSubject && selectedBlock) {
      setNotes((prev) => ({
        ...prev,
        [selectedSubject]: {
          ...prev[selectedSubject],
          [selectedBlock]: content,
        },
      }));
      
      toast.success("Notes saved!");
    }
  };
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  };

  return (
    <div className={cn(
      "min-h-screen bg-gray-50",
      "transition-colors duration-300",
      isDarkMode && "dark bg-gray-900"
    )}>
      <header className="py-6 px-6 bg-white shadow-sm dark:bg-gray-800 dark:border-b dark:border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Zan2t Klaab Notes</h1>
          
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleDarkMode}
              className="rounded-full"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <Button variant="outline" size="sm" className="rounded-full">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        <SubjectSelect 
          onSelect={setSelectedSubject}
          selectedSubject={selectedSubject}
        />
        
        <AnimatePresence mode="wait">
          {selectedSubject && (
            <motion.div
              key={`blocks-${selectedSubject}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <BlockGrid
                subject={selectedSubject}
                onSelectBlock={setSelectedBlock}
                selectedBlock={selectedBlock}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {selectedSubject && selectedBlock && (
            <motion.div 
              key={`note-${selectedSubject}-${selectedBlock}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-8"
            >
              <Card className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle className="text-xl">
                    {selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)} - Block {selectedBlock}
                  </CardTitle>
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </CardHeader>
                
                <CardContent className="prose dark:prose-invert max-w-none">
                  {notes[selectedSubject]?.[selectedBlock] ? (
                    <div dangerouslySetInnerHTML={{ 
                      __html: notes[selectedSubject][selectedBlock]
                        .replace(/\n/g, '<br>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    }} />
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No notes yet. Click Edit to add some!</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {isEditing && selectedSubject && selectedBlock && (
          <NoteEditor
            content={notes[selectedSubject]?.[selectedBlock] || ""}
            onSave={handleSaveNote}
            subject={selectedSubject}
            onClose={() => setIsEditing(false)}
          />
        )}
      </main>
    </div>
  );
}
