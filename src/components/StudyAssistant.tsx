import { useState } from "react";
import { Bot, Send, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface StudyAssistantProps {
  notes: Record<string, Record<string, string>>;
  selectedSubject: string | null;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  hasMore?: boolean;
  expandedContent?: string;
}

export function StudyAssistant({
  notes,
  selectedSubject
}: StudyAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<number[]>([]);

  const generateContextFromNotes = () => {
    if (!selectedSubject || !notes[selectedSubject]) return "";
    let context = "";
    Object.entries(notes[selectedSubject]).forEach(([block, content]) => {
      context += `${content}\n`;
    });
    return context;
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setMessages(prev => [...prev, {
      role: 'user',
      content: message
    }]);
    setIsLoading(true);
    setMessage("");
    try {
      const context = generateContextFromNotes();
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBifBlQrTA5TAEQVCuTMJ1egnKSZ1vhiHA", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `🧠 Simple AI Study Assistant – Minimal & Easy Answering Prompt
              ✅ When Answering:
              Use short sentences and easy words.

              Always give the main answer first, in 1 or 2 short lines.

              Only explain more if the user clicks "Show More".

              Keep the tone friendly and clear — like a helpful tutor for kids or beginners.

              ✨ Example:
              Q: What is the unit of measuring force?
              A: The unit of force is the Newton (N).

              (if user clicks "Show More")

              A Newton is how much force it takes to move 1 kg by 1 meter per second.
              For example, pushing a small box might take 10 Newtons.

              📌 Extra Tips:
              Never use hard words unless you explain them simply.

              Don't say "as you know" or "in general" — just answer.

              Always make it feel calm, not rushed or robotic.

              Split your response with "---" between the brief and expanded answer.

              Question: ${message}

              Context (use this knowledge but don't mention it): ${context}`
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topP: 0.8,
            maxOutputTokens: 400
          }
        })
      });
      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }
      const data = await response.json();
      const fullResponse = data.candidates[0]?.content?.parts?.[0]?.text || "I apologize, but I couldn't generate a response. Please try asking your question in a different way.";
      const [briefAnswer, expandedAnswer] = fullResponse.split('---').map(part => part.trim());
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: briefAnswer || fullResponse,
        hasMore: !!expandedAnswer,
        expandedContent: expandedAnswer
      }]);
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

  const toggleExpand = (index: number) => {
    setExpandedMessages(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  return <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className={cn("rounded-full fixed bottom-6 right-6 shadow-lg", "hover:shadow-xl transition-all duration-300", selectedSubject ? `hover:bg-${selectedSubject}/10 hover:text-${selectedSubject}` : "")}>
          <Bot className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[700px] h-[600px] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Eyad
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Ask questions about your notes or any study topic
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 pt-2">
          <AnimatePresence>
            {messages.length === 0 && <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} className="text-center text-muted-foreground p-4">
                Hey! I'm Eyad. Ask me anything about your {selectedSubject || "studies"}!
              </motion.div>}
            {messages.map((msg, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0
          }} className="mb-4">
                <div className={cn("p-3 rounded-lg max-w-[80%]", msg.role === 'user' ? "ml-auto bg-primary text-primary-foreground" : "bg-muted")}>
                  {msg.content}
                  {msg.hasMore && <Button variant="ghost" size="sm" className="mt-2 w-full flex items-center gap-2 text-xs" onClick={() => toggleExpand(index)}>
                      {expandedMessages.includes(index) ? "Show Less" : "Show More"}
                      <ChevronDown className={cn("h-4 w-4 transition-transform", expandedMessages.includes(index) && "rotate-180")} />
                    </Button>}
                </div>
                {msg.hasMore && expandedMessages.includes(index) && <motion.div initial={{
              opacity: 0,
              height: 0
            }} animate={{
              opacity: 1,
              height: "auto"
            }} exit={{
              opacity: 0,
              height: 0
            }} className={cn("mt-2 p-3 rounded-lg bg-muted/50 text-sm", "max-w-[80%]")}>
                    {msg.expandedContent}
                  </motion.div>}
              </motion.div>)}
            {isLoading && <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} className="flex gap-2 items-center text-sm text-muted-foreground">
                <div className="animate-pulse">Thinking...</div>
              </motion.div>}
          </AnimatePresence>
        </div>

        <div className="p-4 border-t">
          <form onSubmit={e => {
          e.preventDefault();
          handleSendMessage();
        }} className="flex gap-2">
            <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder="Ask about your notes..." className={cn("flex-1 bg-muted p-2 rounded-lg", "focus:outline-none focus:ring-2", selectedSubject ? `focus:ring-${selectedSubject}` : "focus:ring-primary")} disabled={isLoading} />
            <Button type="submit" size="icon" className="rounded-lg" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>;
}
