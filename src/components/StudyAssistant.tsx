
import { useState } from "react";
import { Bot, X, Send, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface StudyAssistantProps {
  notes: Record<string, Record<string, string>>;
  selectedSubject: string | null;
}

export function StudyAssistant({ notes, selectedSubject }: StudyAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    
    // Simulate AI response - In a real app, this would call an AI service
    setIsLoading(true);
    setTimeout(() => {
      let response = "I'm analyzing your notes. This is a placeholder response - in a real implementation, I would use an AI service to provide accurate answers and fact-checking based on your notes.";
      
      if (selectedSubject && notes[selectedSubject]) {
        response += "\n\nI can see you're studying " + selectedSubject + ". Would you like me to focus on that subject?";
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsLoading(false);
    }, 1000);

    setMessage("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className={cn(
            "rounded-full fixed bottom-6 right-6 shadow-lg",
            "hover:shadow-xl transition-all duration-300",
            selectedSubject ? `hover:bg-${selectedSubject}/10 hover:text-${selectedSubject}` : ""
          )}
        >
          <Bot className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px] h-[600px] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Study Assistant
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 pt-2">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "mb-4 p-3 rounded-lg max-w-[80%]",
                  msg.role === 'user' 
                    ? "ml-auto bg-primary text-primary-foreground" 
                    : "bg-muted"
                )}
              >
                {msg.content}
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2 items-center text-sm text-muted-foreground"
              >
                <div className="animate-pulse">Thinking...</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about your notes..."
              className="flex-1 bg-muted p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button type="submit" size="icon" className="rounded-lg">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
