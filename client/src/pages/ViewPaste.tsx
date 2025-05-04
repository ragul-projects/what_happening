import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { useState, useRef } from "react";
import { apiRequest } from "@/lib/queryClient";
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
  Copy,
  Trash,
  Edit
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
import { useAdmin } from "@/hooks/use-admin";

// Completely rewritten component to avoid React hooks order issues
export default function ViewPaste() {
  // Basic hooks
  const { pasteId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { verifyAdmin, isAdmin } = useAdmin();
  const queryClient = useQueryClient();
  
  // State
  const [copying, setCopying] = useState(false);
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const commentRef = useRef<HTMLTextAreaElement>(null);

  // Queries
  const { 
    data: paste, 
    isLoading, 
    error 
  } = useQuery<Paste>({
    queryKey: [`/api/pastes/${pasteId}`],
    onError: () => {
      toast({
        title: "Error",
        description: "This paste doesn't exist or has expired",
        variant: "destructive",
      });
      navigate("/");
    }
  });
  
  const { data: relatedPastes = [] } = useQuery<Paste[]>({
    queryKey: [`/api/pastes/${pasteId}/related`],
    enabled: !!paste,
  });
  
  // Mutations
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!pasteId) return;
      const adminPasswordInput = prompt("Enter admin password to confirm deletion:");
      if (!adminPasswordInput) return; // User canceled
      
      return apiRequest('DELETE', `/api/pastes/${pasteId}`, {
        adminPassword: adminPasswordInput
      });
    },
    onSuccess: () => {
      toast({
        title: "Paste deleted",
        description: "The paste has been successfully deleted",
        duration: 3000,
      });
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete the paste. Check your admin password.",
        variant: "destructive",
      });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!pasteId) return;
      const adminPasswordInput = prompt("Enter admin password to confirm update:");
      if (!adminPasswordInput) return; // User canceled
      
      console.log("Sending update:", {
        pasteId,
        contentLength: editedContent.length,
        contentPreview: editedContent.substring(0, 30)
      });
      
      return apiRequest('PUT', `/api/pastes/${pasteId}`, {
        content: editedContent,
        adminPassword: adminPasswordInput
      });
    },
    onSuccess: (response) => {
      console.log("Update success response:", response);
      toast({
        title: "Paste updated",
        description: "The paste has been successfully updated",
        duration: 3000,
      });
      setIsEditing(false);
      
      // Force a complete refetch by refetching the paste directly
      console.log("Force refetching paste data");
      queryClient.removeQueries({ queryKey: [`/api/pastes/${pasteId}`] });
      
      // Reload the page to ensure we get fresh data
      window.location.reload();
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update the paste. Check your admin password.",
        variant: "destructive",
      });
    }
  });
  
  // Handler functions
  function handleDeletePaste() {
    if (window.confirm("Are you sure you want to delete this paste? This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  }

  async function handleCopyToClipboard() {
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
  }

  function handleDownloadPaste() {
    if (!paste) return;
    
    const element = document.createElement('a');
    
    // Check if this is a file (particularly CSV)
    if (paste.isFile && paste.fileName && paste.fileType === 'csv') {
      // For CSV files, use the original filename if available
      const file = new Blob([paste.content], { type: 'text/csv' });
      element.href = URL.createObjectURL(file);
      element.download = paste.fileName;
    } else {
      // For regular code pastes, determine file extension based on language
      let extension = '.txt';
      switch (paste.language) {
        case 'javascript': extension = '.js'; break;
        case 'typescript': extension = '.ts'; break;
        case 'html': extension = '.html'; break;
        case 'css': extension = '.css'; break;
        case 'python': extension = '.py'; break;
        case 'java': extension = '.java'; break;
        case 'csharp': extension = '.cs'; break;
        case 'xml': extension = '.xml'; break;
        default: extension = '.txt';
      }
      
      const file = new Blob([paste.content], { 
        type: paste.language === 'xml' ? 'application/xml' : 'text/plain' 
      });
      element.href = URL.createObjectURL(file);
      // Handle null title case
      const fileName = paste.title 
        ? `${paste.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}${extension}`
        : `paste_${paste.pasteId}${extension}`;
      element.download = fileName;
    }
    
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  function handleSharePaste() {
    if (!paste) return;
    
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied to clipboard",
      description: "Share this link with others to view this paste",
      duration: 2000,
    });
  }

  function handleEditMode() {
    if (paste) {
      console.log("Setting edit mode, content:", paste.content);
      setEditedContent(paste.content);
      setIsEditing(true);
    }
  }

  async function handleCommentFocus(e: React.FocusEvent<HTMLTextAreaElement>) {
    // Check for admin status when the textarea is focused
    if (!comment) {
      // Allow initial input (first-time focus)
      return;
    }
    
    const adminStatus = await verifyAdmin();
    if (!adminStatus) {
      // If not admin, blur the field and show message
      e.target.blur();
      toast({
        title: "Access Denied",
        description: "Only admins can modify text in comment boxes",
        variant: "destructive",
      });
    }
  }
  
  async function handlePostComment() {
    if (comment) {
      // Comments are not currently implemented
      toast({
        title: "Coming Soon",
        description: "Comments feature is not yet implemented",
      });
    }
  }

  // Loading state
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
                {paste.isFile && paste.fileName && paste.fileType === 'csv' && (
                  <Badge className="ml-2 bg-blue-600 text-white">CSV File</Badge>
                )}
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
                onClick={handleCopyToClipboard}
                disabled={isEditing}
              >
                {copying ? (
                  <><Check className="h-4 w-4 mr-1" /> Copied</>
                ) : (
                  <><Copy className="h-4 w-4 mr-1" /> Copy</>
                )}
              </Button>
              <Button 
                variant={paste.isFile && paste.fileType === 'csv' ? "default" : "ghost"}
                size="sm"
                className={paste.isFile && paste.fileType === 'csv' 
                  ? "bg-blue-600 hover:bg-blue-700 text-white transition text-sm flex items-center"
                  : "text-gray-200 hover:text-white transition text-sm flex items-center"
                }
                onClick={handleDownloadPaste}
                disabled={isEditing}
              >
                <Download className="h-4 w-4 mr-1" /> 
                {paste.isFile && paste.fileType === 'csv' ? 'Download CSV' : 'Download'}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-200 hover:text-white transition text-sm flex items-center"
                onClick={handleSharePaste}
                disabled={isEditing}
              >
                <Share className="h-4 w-4 mr-1" /> Share
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-200 hover:text-white transition text-sm flex items-center"
                onClick={() => window.print()}
                disabled={isEditing}
              >
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
              <Link to={`/raw/${pasteId}`}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-200 hover:text-white transition text-sm flex items-center"
                  disabled={isEditing}
                >
                  <FileText className="h-4 w-4 mr-1" /> Raw
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-200 hover:text-white transition text-sm flex items-center"
                disabled={isEditing}
              >
                <Maximize className="h-4 w-4 mr-1" /> Embed
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-200 hover:text-white transition text-sm flex items-center"
                disabled={isEditing}
              >
                <Flag className="h-4 w-4 mr-1" /> Report
              </Button>
              
              {/* Edit Button - Only show if user is admin and not editing */}
              {isAdmin && !isEditing && !paste.isFile && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-blue-400 hover:text-blue-300 transition text-sm flex items-center"
                  onClick={handleEditMode}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              )}
              
              {/* Delete Button - Only show if user is admin */}
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-red-400 hover:text-red-300 transition text-sm flex items-center ml-auto"
                  onClick={handleDeletePaste}
                  disabled={deleteMutation.isPending || isEditing}
                >
                  <Trash className="h-4 w-4 mr-1" /> 
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              )}
            </div>
          </div>
          
          {/* Editing Interface */}
          {isEditing ? (
            <div className="bg-gray-800 border-x border-b border-gray-700 p-4">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full bg-gray-700 text-gray-200 border border-gray-700 rounded p-3 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                rows={15}
              />
              <div className="flex justify-end mt-4 space-x-3">
                <Button
                  variant="outline"
                  className="text-gray-200 border-gray-600"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => updateMutation.mutate()}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          ) : (
            /* Code Snippet - Only show when not editing */
            <CodeBlock
              code={paste.content}
              language={paste.language || "plaintext"}
              title={paste.isFile && paste.fileType === 'csv' && paste.fileName ? (paste.fileName as string) : undefined}
              showLineNumbers={true}
              showCopyButton={false}
              showLineActions={true}
            />
          )}
          
          {/* Comments Section */}
          <div className="mt-6 bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Comments (0)</h3>
            <div className="mb-4">
              <Textarea 
                ref={commentRef}
                value={comment}
                placeholder="Add a comment..."
                className="w-full bg-gray-700 text-gray-200 border border-gray-700 rounded p-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={3}
                onFocus={handleCommentFocus}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button 
                className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-500/90 transition"
                onClick={handlePostComment}
              >
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
                    {(paste.authorName || "A").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-white">{paste.authorName || "Anonymous"}</h3>
                  <p className="text-gray-400 text-xs">
                    {paste.authorName === "Anonymous" || !paste.authorName ? "Guest user" : "Member"}
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
                      <Link to={`/paste/${related.pasteId}`} className="block p-2 hover:bg-gray-700 rounded transition">
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
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 text-center">
                  <Link to={`/language/${paste.language || "plaintext"}`} className="text-blue-500 text-sm hover:text-blue-400 transition">
                    View More
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
}