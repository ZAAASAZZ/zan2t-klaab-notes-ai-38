
import { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";

interface SearchNotesProps {
  notes: Record<string, Record<string, string>>;
  onSelectNote: (subject: string, block: number) => void;
}

export function SearchNotes({ notes, onSelectNote }: SearchNotesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = Object.entries(notes).flatMap(([subject, blocks]) =>
    Object.entries(blocks).map(([block, content]) => ({
      subject,
      block: parseInt(block),
      content,
      match: content.toLowerCase().includes(searchQuery.toLowerCase())
    }))
  ).filter(result => result.match);

  const handleSelectResult = (subject: string, block: number) => {
    onSelectNote(subject, block);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Search className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Search Notes</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {searchResults.map((result, index) => (
              <Button
                key={`${result.subject}-${result.block}-${index}`}
                variant="ghost"
                className="w-full justify-start text-left"
                onClick={() => handleSelectResult(result.subject, result.block)}
              >
                <div>
                  <div className="font-medium">
                    {result.subject.charAt(0).toUpperCase() + result.subject.slice(1)} - Block {result.block}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {result.content.replace(/<[^>]*>/g, '').slice(0, 100)}...
                  </div>
                </div>
              </Button>
            ))}
            {searchQuery && searchResults.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No results found
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
