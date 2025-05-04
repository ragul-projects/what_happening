import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { useEffect, useState } from "react";
import CodeBlock from "@/components/CodeBlock";
import { 
  Eye, 
  Calendar, 
  Code,
  Download, 
  Share,
  Printer,
  FileText,
  Maximize,
  Flag,
  Check,
  Copy
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Paste } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const ViewPaste = () => {
  const { pasteId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [copying, setCopying] = useState(false);
  
  const { data: paste, isLoading, error } = useQuery<Paste>({
    queryKey: [`/api/pastes/${pasteId}`],
  });
  
  const { data: relatedPastes } = useQuery({
    queryKey: [`/api/pastes/${pasteId}/related`],
    enabled: !!paste,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "This paste doesn't exist or has expired",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [error, navigate, toast]);

  const copyToClipboard = async () => {
    if (!paste) return;
    
    try {
      await navigator.clipboard.writeText(paste.content);
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

  const downloadPaste = () => {
    if (!paste) return;
    
    const element = document.createElement('a');
    
    // Determine file extension based on language
    let extension = '.txt';
    switch (paste.language) {
      case 'javascript': extension = '.js'; break;
      case 'typescript': extension = '.ts'; break;
      case 'html': extension = '.html'; break;
      case 'css': extension = '.css'; break;
      case 'python': extension = '.py'; break;
      case 'java': extension = '.java'; break;
      case 'csharp': extension = '.cs'; break;
      default: extension = '.txt';
    }
    
    const file = new Blob([paste.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${paste.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}${extension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const sharePaste = () => {
    if (!paste) return;
    
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied to clipboard",
      description: "Share this link with others to view this paste",
      duration: 2000,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 order-2 lg:order-1">
            <Skeleton className="h-16 w-full mb-2 bg-gray-800" />
            <Skeleton className="h-8 w-full mb-4 bg-gray-800" />
            <Skeleton className="h-[400px] w-full bg-gray-800" />
          </div>
          <div className="lg:col-span-1 order-1 lg:order-2">
            <Skeleton className="h-32 w-full mb-6 bg-gray-800" />
            <Skeleton className="h-64 w-full mb-6 bg-gray-800" />
            <Skeleton className="h-32 w-full bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  if (!paste) return null;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          {/* Snippet Header */}
          <div className="bg-gray-800 border border-gray-700 rounded-t-lg p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <h1 className="text-xl font-semibold text-white mb-2 md:mb-0">
                {paste.title}
              </h1>
              <div className="flex items-center space-x-2">
                <div className="bg-gray-800 text-gray-400 py-1 px-2 rounded-md text-xs flex items-center">
                  <Eye className="h-3 w-3 mr-2" />
                  <span>{paste.views}</span>
                </div>
                <div className="bg-gray-800 text-gray-400 py-1 px-2 rounded-md text-xs flex items-center">
                  <Calendar className="h-3 w-3 mr-2" />
                  <span>{format(new Date(paste.createdAt), "MMM dd, yyyy")}</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-gray-800 rounded-l-md py-1 px-2 text-gray-400 text-xs border-r border-gray-700">
                    <Code className="h-3 w-3 mr-1 inline-block" /> {paste.language}
                  </div>
                  <div className="bg-gray-800 rounded-r-md py-1 px-2 text-gray-400 text-xs flex items-center">
                    <Calendar className="h-3 w-3 mr-1" /> 
                    {paste.expiresAt ? format(new Date(paste.expiresAt), "MMM dd, yyyy") : 'Never expires'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Snippet Actions */}
          <div className="bg-gray-700 border-x border-gray-700 py-2 px-4">
            <div className="flex items-center space-x-3 overflow-x-auto whitespace-nowrap">
              <Button
                variant="ghost" 
                size="sm"
                className="text-gray-200 hover:text-white transition text-sm flex items-center"
                onClick={copyToClipboard}
              >
                {copying ? (
                  <><Check className="h-4 w-4 mr-1" /> Copied</>
                ) : (
                  <><Copy className="h-4 w-4 mr-1" /> Copy</>
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-200 hover:text-white transition text-sm flex items-center"
                onClick={downloadPaste}
              >
                <Download className="h-4 w-4 mr-1" /> Download
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-200 hover:text-white transition text-sm flex items-center"
                onClick={sharePaste}
              >
                <Share className="h-4 w-4 mr-1" /> Share
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-200 hover:text-white transition text-sm flex items-center"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-200 hover:text-white transition text-sm flex items-center"
                as={Link}
                href={`/raw/${pasteId}`}
              >
                <FileText className="h-4 w-4 mr-1" /> Raw
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-200 hover:text-white transition text-sm flex items-center"
              >
                <Maximize className="h-4 w-4 mr-1" /> Embed
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-200 hover:text-white transition text-sm flex items-center ml-auto"
              >
                <Flag className="h-4 w-4 mr-1" /> Report
              </Button>
            </div>
          </div>
          
          {/* Code Snippet */}
          <CodeBlock
            code={paste.content}
            language={paste.language}
            showLineNumbers={true}
            showCopyButton={false}
            showLineActions={true}
          />
          
          {/* Comments Section */}
          <div className="mt-6 bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Comments (0)</h3>
            <div className="mb-4">
              <Textarea 
                placeholder="Add a comment..."
                className="w-full bg-gray-700 text-gray-200 border border-gray-700 rounded p-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="flex justify-end">
              <Button className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-500/90 transition">
                Post Comment
              </Button>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          {/* Author Info */}
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <Avatar className="w-10 h-10 rounded-full bg-blue-500 mr-3">
                  <AvatarFallback className="text-white font-bold">
                    {paste.authorName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-white">{paste.authorName}</h3>
                  <p className="text-gray-400 text-xs">
                    {paste.authorName === "Anonymous" ? "Guest user" : "Member"}
                  </p>
                </div>
              </div>
              {paste.title !== "Untitled" && (
                <div className="border-t border-gray-700 pt-3">
                  <p className="text-gray-300 text-sm">
                    {paste.title}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Related Pastes */}
          {relatedPastes && relatedPastes.length > 0 && (
            <Card className="bg-gray-800 border-gray-700 mb-6">
              <CardContent className="p-4">
                <h3 className="font-medium text-white mb-3">Related Snippets</h3>
                <ul className="space-y-3">
                  {relatedPastes.map((related: Paste) => (
                    <li key={related.pasteId}>
                      <Link href={`/paste/${related.pasteId}`}>
                        <a className="block p-2 hover:bg-gray-700 rounded transition">
                          <div className="flex items-center mb-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                            <h4 className="text-gray-200 font-medium text-sm truncate">{related.title}</h4>
                          </div>
                          <div className="flex text-xs text-gray-500">
                            <span className="mr-3">
                              <Eye className="h-3 w-3 inline mr-1" /> {related.views}
                            </span>
                            <span>
                              <Calendar className="h-3 w-3 inline mr-1" /> 
                              {format(new Date(related.createdAt), "MMM dd, yyyy")}
                            </span>
                          </div>
                        </a>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 text-center">
                  <Link href={`/language/${paste.language}`}>
                    <a className="text-blue-500 text-sm hover:text-blue-400 transition">View More</a>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Tags */}
          {paste.tags && paste.tags.length > 0 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <h3 className="font-medium text-white mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {paste.tags.map((tag, index) => (
                    <Badge 
                      key={index}
                      variant="secondary" 
                      className="bg-gray-700 text-gray-300 hover:bg-gray-600 transition"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewPaste;
