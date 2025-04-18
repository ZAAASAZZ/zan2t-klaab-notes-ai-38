
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Lamp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TutorialStep {
  title: string;
  description: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Select a Subject",
    description: "Start by choosing your subject from the dropdown menu at the top.",
  },
  {
    title: "Choose a Block",
    description: "Click on a block number to organize your notes by topics or chapters.",
  },
  {
    title: "Take Notes",
    description: "Use the editor to write your notes. You can format them using the AI enhancement feature.",
  },
  {
    title: "AI Study Assistant",
    description: "Click the chat icon in the bottom right to get help with your studies and ask questions about your notes.",
  },
  {
    title: "Save and Review",
    description: "Your notes are automatically saved to your device. You can access them anytime, even offline.",
  },
  {
    title: "Enhance with AI",
    description: "Use the 'Enhance with AI' button while editing to improve your notes' structure and formatting.",
  }
];

export function TutorialGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-yellow-100 hover:text-yellow-600 dark:hover:bg-yellow-900/20"
        >
          <Lamp className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lamp className="h-5 w-5 text-yellow-500" />
            How to Use Zan2t Klaab Notes
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          {tutorialSteps.map((step, index) => (
            <div
              key={index}
              className={cn(
                "p-4 rounded-lg border",
                "transition-all duration-200",
                "hover:shadow-md hover:border-yellow-200",
                "dark:hover:border-yellow-900"
              )}
            >
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 w-6 h-6 flex items-center justify-center rounded-full text-sm">
                  {index + 1}
                </span>
                {step.title}
              </h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
