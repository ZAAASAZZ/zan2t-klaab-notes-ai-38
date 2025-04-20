
import { useState } from "react";
import { Check, Calendar, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Progress } from "./ui/progress";
import { cn } from "@/lib/utils";

const subjects = [
  { name: "Biology", color: "text-green-500" },
  { name: "Physics", color: "text-purple-500" },
  { name: "Chemistry", color: "text-red-500" },
  { name: "Maths", color: "text-yellow-500" },
  { name: "ICT", color: "text-blue-500" },
  { name: "Social", color: "text-sky-500" },
  { name: "French", color: "text-pink-500" },
  { name: "Arabic", color: "text-orange-500" },
  { name: "English", color: "text-emerald-500" }
];

export function StudyPlan() {
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem("studyProgress");
    return saved ? JSON.parse(saved) : {};
  });

  const toggleBlock = (subject: string, block: number) => {
    setProgress(prev => {
      const key = `${subject}-${block}`;
      const newProgress = {
        ...prev,
        [key]: !prev[key]
      };
      localStorage.setItem("studyProgress", JSON.stringify(newProgress));
      return newProgress;
    });
  };

  const calculateProgress = () => {
    const totalBlocks = subjects.length * 6;
    const completedBlocks = Object.values(progress).filter(Boolean).length;
    return Math.round((completedBlocks / totalBlocks) * 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Calendar className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[850px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Study Plan
          </DialogTitle>
          <DialogDescription>
            Track your exam preparation progress
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-xl text-white shadow-lg mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Your Progress</h3>
              <span className="text-3xl font-bold">{calculateProgress()}%</span>
            </div>
            <p className="mb-4 text-white/90">
              Keep going! You're making great progress tracking your study blocks.
            </p>
            <Progress value={calculateProgress()} className="h-4 bg-white/20 rounded-full" />
            <div className="flex justify-between mt-3 text-sm text-white/80">
              <span>0%</span>
              <span>Target: 100%</span>
            </div>
          </div>

          <div className="rounded-lg border shadow-sm overflow-hidden bg-white dark:bg-gray-800/90">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 bg-muted/50 dark:bg-gray-700/60 font-medium">Blocks</th>
                    {subjects.map(subject => (
                      <th key={subject.name} className={cn("px-4 py-3 text-center", subject.color, "dark:opacity-90")}>
                        {subject.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 6 }, (_, i) => i + 1).map(block => (
                    <tr key={block} className="border-t hover:bg-muted/30 dark:hover:bg-gray-700/20 transition-colors">
                      <td className="py-3 px-4 font-medium bg-muted/30 dark:bg-gray-700/30">Block {block}</td>
                      {subjects.map(subject => {
                        const isComplete = progress[`${subject.name}-${block}`];
                        return (
                          <td key={`${subject.name}-${block}`} className="px-4 py-3 text-center">
                            <Button
                              variant={isComplete ? "default" : "outline"}
                              size="icon"
                              className={cn(
                                "h-9 w-9 p-0 rounded-full transition-all duration-300", 
                                isComplete ? 
                                  "bg-green-500 text-white hover:bg-green-600 shadow-md" : 
                                  "hover:scale-110 hover:shadow-md dark:border-gray-600"
                              )}
                              onClick={() => toggleBlock(subject.name, block)}
                            >
                              {isComplete ? (
                                <Check className="h-4 w-4" />
                              ) : null}
                            </Button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Your progress is automatically saved on your device</p>
            <p className="text-xs">All your data is stored securely on your device and works offline</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
