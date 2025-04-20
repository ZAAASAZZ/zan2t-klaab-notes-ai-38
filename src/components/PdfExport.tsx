
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download, Settings, Check, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import html2pdf from "html2pdf.js";
import { jsPDF } from "jspdf";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

interface PdfExportProps {
  content: string;
  subject: string;
  block: number;
  isDarkMode: boolean;
}

export function PdfExport({ content, subject, block, isDarkMode }: PdfExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [settings, setSettings] = useState({
    // General
    filename: `${subject}_Block${block}.pdf`,
    title: `${subject.charAt(0).toUpperCase() + subject.slice(1)} - Block ${block} Notes`,
    author: "Zan2t Klaab Notes",
    subject: subject.charAt(0).toUpperCase() + subject.slice(1),
    keywords: `${subject}, notes, block ${block}, study, education`,
    creationDate: new Date().toISOString().split('T')[0],
    
    // Layout
    margins: {
      top: 10,
      bottom: 10,
      left: 10,
      right: 10
    },
    pageSize: "a4",
    orientation: "portrait",
    
    // Appearance
    font: "Helvetica",
    fontSize: 12,
    includeHeader: true,
    includeFooter: true,
    watermark: "",
    exportTheme: isDarkMode ? "dark" : "light",
  });

  const updateSettings = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateMargins = (margin: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      margins: {
        ...prev.margins,
        [margin]: value
      }
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      
      // Create a temporary container for PDF content
      const element = document.createElement('div');
      const contentClone = document.createElement('div');
      
      // Add styles for watermark and header/footer
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        @media print {
          body {
            font-family: ${settings.font}, sans-serif;
            font-size: ${settings.fontSize}pt;
            ${settings.exportTheme === 'dark' ? 
              'background-color: #121212; color: #ffffff;' : 
              'background-color: #ffffff; color: #000000;'}
          }
          
          .pdf-watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 60px;
            opacity: 0.15;
            z-index: -1;
            color: #000;
            pointer-events: none;
          }
          
          .pdf-header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eaeaea;
          }
          
          .pdf-footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #eaeaea;
            font-size: 9pt;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          
          table, th, td {
            border: 1px solid ${settings.exportTheme === 'dark' ? '#555' : '#eaeaea'};
          }
          
          th, td {
            padding: 8px;
            text-align: left;
          }
          
          th {
            background-color: ${settings.exportTheme === 'dark' ? '#333' : '#f8f9fa'};
          }
          
          h2, h3 {
            color: ${settings.exportTheme === 'dark' ? '#90caf9' : '#1976d2'};
          }
          
          .key-structure {
            background-color: ${settings.exportTheme === 'dark' ? '#333' : '#f8f9fa'};
            border-left: 4px solid ${settings.exportTheme === 'dark' ? '#90caf9' : '#1976d2'};
            padding: 10px;
            margin: 15px 0;
          }
        }
      `;
      
      element.appendChild(styleElement);
      
      // Add header if enabled
      if (settings.includeHeader) {
        const header = document.createElement('div');
        header.className = 'pdf-header';
        header.innerHTML = `
          <h1>${settings.title}</h1>
          <p>Created on ${formatDate(settings.creationDate)}</p>
        `;
        element.appendChild(header);
      }
      
      // Add watermark if provided
      if (settings.watermark) {
        const watermark = document.createElement('div');
        watermark.className = 'pdf-watermark';
        watermark.textContent = settings.watermark;
        element.appendChild(watermark);
      }
      
      // Add main content
      contentClone.className = `notes-container ${settings.exportTheme === 'dark' ? 'dark' : 'light'}`;
      contentClone.innerHTML = content;
      element.appendChild(contentClone);
      
      // Add footer if enabled
      if (settings.includeFooter) {
        const footer = document.createElement('div');
        footer.className = 'pdf-footer';
        footer.innerHTML = `
          <p>
            ${settings.author} | ${settings.subject} | Page <span class="pageNumber"></span> of <span class="totalPages"></span>
          </p>
        `;
        element.appendChild(footer);
      }
      
      // Configure html2pdf options
      const opt = {
        margin: [
          settings.margins.top, 
          settings.margins.right, 
          settings.margins.bottom, 
          settings.margins.left
        ],
        filename: settings.filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false,
        },
        jsPDF: {
          unit: 'mm',
          format: settings.pageSize,
          orientation: settings.orientation
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      
      // Set document metadata
      const pdf = await html2pdf()
        .from(element)
        .set(opt)
        .toPdf()
        .get('pdf');
      
      pdf.setProperties({
        title: settings.title,
        subject: settings.subject,
        author: settings.author,
        keywords: settings.keywords,
        creator: 'Zan2t Klaab Notes',
        creationDate: new Date()
      });
      
      // Set metadata properties
      pdf.setProperties({
        title: settings.title,
        subject: settings.subject,
        author: settings.author,
        keywords: settings.keywords,
        creator: 'Zan2t Klaab Notes',
        creationDate: new Date()
      });
      
      // Save the PDF
      pdf.save(settings.filename);
      
      toast.success("PDF exported successfully!");
      setIsOpen(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreviewPdf = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={cn(
          "rounded-full transition-all duration-300",
          `hover:bg-${subject}/10 hover:text-${subject} hover:shadow-md`,
          "border border-gray-200 dark:border-gray-700",
          "flex items-center gap-2"
        )}
      >
        <FileText className={cn("h-4 w-4", `text-${subject}/80`)} />
        Export PDF
      </Button>
      
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className={cn("h-5 w-5", `text-${subject}`)} />
            <span className={cn(
              "text-gradient bg-gradient-to-r", 
              `from-${subject} to-${subject}/70`
            )}>
              Export {subject.charAt(0).toUpperCase() + subject.slice(1)} Notes as PDF
            </span>
          </DialogTitle>
          <DialogDescription>
            Customize how your notes will appear in the exported PDF
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          
          {/* General Settings */}
          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filename">Filename</Label>
                <Input
                  id="filename"
                  value={settings.filename}
                  onChange={(e) => updateSettings('filename', e.target.value)}
                  placeholder="Enter filename"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={settings.title}
                  onChange={(e) => updateSettings('title', e.target.value)}
                  placeholder="Enter document title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={settings.author}
                  onChange={(e) => updateSettings('author', e.target.value)}
                  placeholder="Enter author name"
                />
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="metadata">
                  <AccordionTrigger>Additional Metadata</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={settings.subject}
                        onChange={(e) => updateSettings('subject', e.target.value)}
                        placeholder="Enter subject"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                      <Input
                        id="keywords"
                        value={settings.keywords}
                        onChange={(e) => updateSettings('keywords', e.target.value)}
                        placeholder="Enter keywords"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="creationDate">Date Created</Label>
                      <Input
                        id="creationDate"
                        type="date"
                        value={settings.creationDate}
                        onChange={(e) => updateSettings('creationDate', e.target.value)}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
          
          {/* Layout Settings */}
          <TabsContent value="layout" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Page Size</Label>
                <Select
                  value={settings.pageSize}
                  onValueChange={(value) => updateSettings('pageSize', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select page size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a4">A4</SelectItem>
                    <SelectItem value="letter">Letter</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Orientation</Label>
                <Select
                  value={settings.orientation}
                  onValueChange={(value) => updateSettings('orientation', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select orientation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="margins">
                  <AccordionTrigger>Margins (mm)</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6 mt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="marginTop">Top: {settings.margins.top}mm</Label>
                        </div>
                        <Slider
                          id="marginTop"
                          min={0}
                          max={50}
                          step={1}
                          value={[settings.margins.top]}
                          onValueChange={(value) => updateMargins('top', value[0])}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="marginBottom">Bottom: {settings.margins.bottom}mm</Label>
                        </div>
                        <Slider
                          id="marginBottom"
                          min={0}
                          max={50}
                          step={1}
                          value={[settings.margins.bottom]}
                          onValueChange={(value) => updateMargins('bottom', value[0])}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="marginLeft">Left: {settings.margins.left}mm</Label>
                        </div>
                        <Slider
                          id="marginLeft"
                          min={0}
                          max={50}
                          step={1}
                          value={[settings.margins.left]}
                          onValueChange={(value) => updateMargins('left', value[0])}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="marginRight">Right: {settings.margins.right}mm</Label>
                        </div>
                        <Slider
                          id="marginRight"
                          min={0}
                          max={50}
                          step={1}
                          value={[settings.margins.right]}
                          onValueChange={(value) => updateMargins('right', value[0])}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
          
          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select
                  value={settings.font}
                  onValueChange={(value) => updateSettings('font', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Times">Times New Roman</SelectItem>
                    <SelectItem value="Courier">Courier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="fontSize">Font Size: {settings.fontSize}pt</Label>
                </div>
                <Slider
                  id="fontSize"
                  min={8}
                  max={16}
                  step={1}
                  value={[settings.fontSize]}
                  onValueChange={(value) => updateSettings('fontSize', value[0])}
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="header-toggle"
                    checked={settings.includeHeader}
                    onCheckedChange={(checked) => updateSettings('includeHeader', checked)}
                  />
                  <Label htmlFor="header-toggle">Include Header</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="footer-toggle"
                    checked={settings.includeFooter}
                    onCheckedChange={(checked) => updateSettings('includeFooter', checked)}
                  />
                  <Label htmlFor="footer-toggle">Include Footer</Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="watermark">Watermark Text (optional)</Label>
                <Input
                  id="watermark"
                  value={settings.watermark}
                  onChange={(e) => updateSettings('watermark', e.target.value)}
                  placeholder="Enter watermark text"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Export Theme</Label>
                <Select
                  value={settings.exportTheme}
                  onValueChange={(value) => updateSettings('exportTheme', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="match">Match App Theme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handlePreviewPdf}
            className="gap-2"
            disabled={isExporting}
          >
            <Eye className="h-4 w-4" />
            {isPreviewMode ? "Hide Preview" : "Show Preview"}
          </Button>
          
          <Button
            variant="default"
            onClick={handleExportPdf}
            className={cn(
              "gap-2 bg-gradient-to-r",
              `from-${subject} to-${subject}/80`,
              "hover:opacity-90"
            )}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <span className="animate-pulse">Processing...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
        
        {isPreviewMode && (
          <div className="mt-6 border rounded-lg p-4 max-h-[400px] overflow-y-auto">
            <h4 className="text-sm font-medium mb-2">Preview (Simplified)</h4>
            <div className={cn(
              "notes-container prose max-w-none p-4 rounded border", 
              settings.exportTheme === "dark" 
                ? "bg-gray-900 text-gray-100 border-gray-700 prose-invert" 
                : "bg-white text-gray-900 border-gray-200",
              `prose-headings:text-${subject}`
            )}>
              <div dangerouslySetInnerHTML={{ __html: content }} />
              {settings.includeFooter && (
                <div className="mt-8 pt-4 text-center text-sm border-t border-gray-200 dark:border-gray-700">
                  <p>{settings.author} | {settings.subject} | Page 1 of 1</p>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
