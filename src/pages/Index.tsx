
import { useState, useEffect } from "react";
import { SubjectSelect } from "@/components/SubjectSelect";
import { BlockGrid } from "@/components/BlockGrid";
import { NoteEditor } from "@/components/NoteEditor";
import { loadNotes, saveNotes } from "@/utils/storage";

export default function Index() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(loadNotes());

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
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="py-8 px-6 bg-white shadow-sm">
        <h1 className="text-2xl font-semibold text-center">Zan2t Klaab Notes</h1>
      </header>
      
      <main className="container mx-auto py-8">
        <SubjectSelect 
          onSelect={setSelectedSubject}
          selectedSubject={selectedSubject}
        />
        
        {selectedSubject && (
          <BlockGrid
            subject={selectedSubject}
            onSelectBlock={setSelectedBlock}
            selectedBlock={selectedBlock}
          />
        )}

        {selectedSubject && selectedBlock && (
          <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">
                {selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)} - Block {selectedBlock}
              </h2>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Edit
              </button>
            </div>
            
            <div className="prose max-w-none">
              {notes[selectedSubject]?.[selectedBlock] || 
                "No notes yet. Click Edit to add some!"}
            </div>
          </div>
        )}

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
