import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, Copy, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/use-admin";
import hljs from "highlight.js";

interface CodeBlockProps {
  code: string;
  language: string;
  title?: string;
  showLineNumbers?: boolean;
  showCopyButton?: boolean;
  showLineActions?: boolean;
}

const CodeBlock = ({
  code,
  language,
  title,
  showLineNumbers = true,
  showCopyButton = true,
  showLineActions = true,
}: CodeBlockProps) => {
  const { toast } = useToast();
  const { verifyAdmin } = useAdmin();
  const codeRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copying, setCopying] = useState(false);
  const [copyingLine, setCopyingLine] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableCode, setEditableCode] = useState(code);

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
    // Initialize editable code with the provided code
    setEditableCode(code);
  }, [code, language]);

  const requestEdit = async () => {
    const isAdmin = await verifyAdmin();
    if (isAdmin) {
      setIsEditing(true);
    } else {
      toast({
        title: "Access Denied",
        description: "Only admins can edit code snippets",
        variant: "destructive",
      });
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    // Since this is only accessible after admin verification, directly update the value
    setEditableCode(newValue);
  };

  const saveChanges = () => {
    // In a real application, this would save changes to the server
    toast({
      title: "Changes Saved",
      description: "In a real implementation, this would update the database",
    });
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditableCode(code);
    setIsEditing(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopying(true);
      toast({
        title: "Copied to clipboard",
        description: "Code snippet has been copied to clipboard",
        duration: 2000,
      });
      setTimeout(() => setCopying(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy code to clipboard",
        variant: "destructive",
      });
    }
  };

  const copyLineToClipboard = async (line: string, lineNumber: number) => {
    try {
      await navigator.clipboard.writeText(line.trim());
      setCopyingLine(lineNumber);
      setTimeout(() => setCopyingLine(null), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy line to clipboard",
        variant: "destructive",
      });
    }
  };

  const renderCodeLines = () => {
    const lines = code.split("\n");
    
    return lines.map((line, index) => (
      <div className="code-line flex" key={index}>
        {showLineNumbers && (
          <div className="line-number">{index + 1}</div>
        )}
        <div className="line-content flex-grow relative py-0.5">
          {line || " "}
          {showLineActions && (
            <button
              className="line-copy absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white focus:outline-none"
              onClick={() => copyLineToClipboard(line, index)}
              aria-label="Copy line"
            >
              {copyingLine === index ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      {title && (
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-200">{title}</span>
          {showCopyButton && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-gray-300 hover:text-white"
                    onClick={copyToClipboard}
                  >
                    {copying ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy code</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        {isEditing ? (
          <div className="p-4">
            <textarea
              ref={textareaRef}
              value={editableCode}
              onChange={handleTextareaChange}
              className="w-full h-64 bg-gray-800 text-gray-200 border border-gray-700 p-3 font-mono text-sm resize-y focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex justify-end mt-4 space-x-2">
              <Button 
                variant="outline" 
                className="border-gray-700 text-gray-300 hover:bg-gray-800" 
                onClick={cancelEdit}
              >
                Cancel
              </Button>
              <Button 
                className="bg-blue-500 hover:bg-blue-600 text-white" 
                onClick={saveChanges}
              >
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-1 code-container font-mono text-sm leading-relaxed">
            <div className="hidden">
              <pre className={`language-${language}`}>
                <code ref={codeRef}>{code}</code>
              </pre>
            </div>
            <div className="flex justify-end px-2 pt-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-gray-400 hover:text-white"
                      onClick={requestEdit}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit code (admin only)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {renderCodeLines()}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeBlock;
