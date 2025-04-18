import { useState, useEffect } from "react";
import { SubjectSelect } from "@/components/SubjectSelect";
import { BlockGrid } from "@/components/BlockGrid";
import { NoteEditor } from "@/components/NoteEditor";
import { FullCurriculumInput } from "@/components/FullCurriculumInput";
import { ResourceUploader } from "@/components/ResourceUploader";
import { loadNotes, saveNotes } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Edit3, Moon, Sun, Search, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { StudyAssistant } from "@/components/StudyAssistant";
import { TutorialGuide } from "@/components/TutorialGuide";

export default function Index() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(loadNotes());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode === "true") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    setNotes(loadNotes());
  }, []);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  const handleSaveNote = (content: string) => {
    if (selectedSubject && selectedBlock) {
      setNotes(prev => ({
        ...prev,
        [selectedSubject]: {
          ...prev[selectedSubject],
          [selectedBlock]: content
        }
      }));
      toast.success("Notes saved!");
    }
  };

  const handleSaveFullCurriculum = (blockNotes: {
    [block: string]: string;
  }) => {
    if (selectedSubject) {
      setNotes(prev => ({
        ...prev,
        [selectedSubject]: {
          ...prev[selectedSubject],
          ...blockNotes
        }
      }));
      toast.success("Full curriculum processed and saved across all blocks!");
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

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => {
        document.getElementById('searchInput')?.focus();
      }, 100);
    }
  };

  const subjectIconMap: Record<string, string> = {
    biology: "🧬",
    chemistry: "🧪",
    physics: "⚛️",
    maths: "📐",
    english: "📚",
    arabic: "🌙",
    french: "🥖",
    social: "🌎",
    ict: "💻"
  };

  return <div className={cn("min-h-screen bg-gradient-to-br", "from-gray-50 to-white", "transition-colors duration-300", isDarkMode && "dark bg-gradient-to-br from-gray-900 to-gray-800")}>
      <header className={cn("py-6 px-6", "bg-white/90 backdrop-blur-md shadow-sm", "dark:bg-gray-800/90 dark:border-b dark:border-gray-700", "sticky top-0 z-10")}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen className={cn(
              "h-7 w-7 transition-colors duration-300",
              selectedSubject ? `text-${selectedSubject}` : "text-blue-500"
            )} />
            <h1 className={cn(
              "text-2xl font-semibold transition-colors duration-300",
              selectedSubject ? `text-${selectedSubject}` : "text-blue-500"
            )}>
              Zan2t Klaab Notes - Grade 9 - NEIS Sadat
            </h1>
          </div>
          
          <div className="flex gap-2 relative">
            <TutorialGuide />
            <AnimatePresence>
              {isSearchOpen && <motion.div initial={{
              width: 0,
              opacity: 0
            }} animate={{
              width: "240px",
              opacity: 1
            }} exit={{
              width: 0,
              opacity: 0
            }} transition={{
              duration: 0.3
            }} className="mr-2">
                  <input id="searchInput" type="text" placeholder="Search notes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={cn("w-full px-4 py-2", "border border-gray-200 rounded-full", "focus:outline-none focus:ring-2", selectedSubject ? `focus:ring-${selectedSubject}` : "focus:ring-blue-500", "dark:bg-gray-700 dark:border-gray-600 dark:text-white")} />
                </motion.div>}
            </AnimatePresence>
            
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="rounded-full bg-gray-100 dark:bg-gray-700">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <Button variant="outline" size="icon" className="rounded-full" onClick={toggleSearch}>
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <SubjectSelect onSelect={setSelectedSubject} selectedSubject={selectedSubject} />
          
          <div className="flex space-x-2">
            {selectedSubject && <ResourceUploader subject={selectedSubject} onGenerateNotes={handleSaveFullCurriculum} />}
            {selectedSubject && <FullCurriculumInput subject={selectedSubject} onSaveNotes={handleSaveFullCurriculum} />}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedSubject && <motion.div key={`blocks-${selectedSubject}`} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -20
        }} transition={{
          duration: 0.3
        }}>
              <BlockGrid subject={selectedSubject} onSelectBlock={setSelectedBlock} selectedBlock={selectedBlock} />
            </motion.div>}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {selectedSubject && selectedBlock && <motion.div key={`note-${selectedSubject}-${selectedBlock}`} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -20
        }} transition={{
          duration: 0.3
        }} className="mt-8">
              <Card className={cn("bg-white/80 backdrop-blur-sm", "dark:bg-gray-800/80 dark:border-gray-700", "transition-all duration-300 hover:shadow-xl", `hover:border-${selectedSubject}/50`)}>
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle className={cn("text-xl flex items-center gap-2", `text-${selectedSubject}`)}>
                    <span className="opacity-90 text-2xl">
                      {subjectIconMap[selectedSubject] || '📔'}
                    </span>
                    {selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)} - Block {selectedBlock}
                  </CardTitle>
                  <Button onClick={() => setIsEditing(true)} variant="ghost" size="sm" className={cn("rounded-full", `hover:bg-${selectedSubject}/10 hover:text-${selectedSubject}`)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </CardHeader>
                
                <CardContent className={cn("notes-container prose max-w-none dark:prose-invert px-6 pb-8", `prose-headings:text-${selectedSubject}`)}>
                  {notes[selectedSubject]?.[selectedBlock] ? <div dangerouslySetInnerHTML={{
                __html: notes[selectedSubject][selectedBlock]
              }} /> : <div className="py-8 text-center">
                      <p className="text-gray-500 dark:text-gray-400 italic">No notes yet. Click Edit to add some!</p>
                    </div>}
                </CardContent>
              </Card>
            </motion.div>}
        </AnimatePresence>

        {isEditing && selectedSubject && selectedBlock && <NoteEditor content={notes[selectedSubject]?.[selectedBlock] || ""} onSave={handleSaveNote} subject={selectedSubject} onClose={() => setIsEditing(false)} />}
      </main>

      <StudyAssistant notes={notes} selectedSubject={selectedSubject} />
    </div>;
}
