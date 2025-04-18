
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

  const generateContextFromNotes = () => {
    if (!selectedSubject || !notes[selectedSubject]) return "";
    
    let context = `Here are the relevant notes for ${selectedSubject}:\n\n`;
    Object.entries(notes[selectedSubject]).forEach(([block, content]) => {
      context += `Block ${block}:\n${content}\n\n`;
    });
    return context;
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setIsLoading(true);
    setMessage("");

    try {
      const context = generateContextFromNotes();
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
                    text: `You are an AI study assistant helping a student with their ${selectedSubject || "studies"}. 
                    Use the following context from their notes to provide accurate and helpful answers:\n\n${context}\n\n
                    Based on these notes and your knowledge, please answer the following question: ${message}
                    
                    If the question is not directly related to the notes, use your knowledge to provide a helpful response while encouraging the student to refer to their notes.
                    Keep responses concise, friendly, and focused on helping the student understand the material better.`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.3,
              topP: 0.8,
              maxOutputTokens: 800
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      const aiResponse = data.candidates[0]?.content?.parts?.[0]?.text || "I apologize, but I couldn't generate a response. Please try asking your question in a different way.";

      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I apologize, but I encountered an error. Please try again in a moment." 
      }]);
    } finally {
      setIsLoading(false);
    }
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
            Study Assistant AI
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 pt-2">
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-muted-foreground p-4"
              >
                Ask me anything about your {selectedSubject || "studies"}!
              </motion.div>
            )}
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
              className={cn(
                "flex-1 bg-muted p-2 rounded-lg",
                "focus:outline-none focus:ring-2",
                selectedSubject ? `focus:ring-${selectedSubject}` : "focus:ring-primary"
              )}
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="rounded-lg"
              disabled={isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
