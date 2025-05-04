import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Calendar, ChevronRight, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import CodeBlock from "@/components/CodeBlock";
import { Paste, supportedLanguages } from "@shared/schema";

const LanguagePage = () => {
  const { language } = useParams();
  
  // Here you would typically have an API endpoint to get pastes by language.
  // For now, we'll just filter the results from all pastes
  const { data: allPastes, isLoading } = useQuery({
    queryKey: ["/api/pastes"],
  });
  
  const filteredPastes = allPastes?.filter((paste: Paste) => 
    paste.language === language
  );
  
  // Format language for display
  const languageInfo = supportedLanguages.find(lang => lang.value === language);
  const formattedLanguage = languageInfo ? languageInfo.name : 
    (language ? language.charAt(0).toUpperCase() + language.slice(1) : "Unknown");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Code className="h-5 w-5 mr-2 text-blue-500" />
          <h1 className="text-3xl font-bold text-white">{formattedLanguage} Pastes</h1>
        </div>
        <Link to="/explore">
          <Button variant="ghost" className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
            Back to Explore <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2 opacity-70 animate-pulse">
                <div className="h-6 bg-gray-700 rounded-md w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded-md w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-700 rounded-md w-full animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPastes?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPastes.map((paste: Paste) => (
            <Link key={paste.pasteId} to={`/paste/${paste.pasteId}`}>
              <Card className="bg-gray-800 border-gray-700 h-full hover:border-gray-600 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-white truncate">
                    {paste.title}
                  </CardTitle>
                  <div className="flex text-xs text-gray-400 mt-1 space-x-3">
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" /> {paste.views}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" /> 
                      {format(new Date(paste.createdAt), "MMM dd, yyyy")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-32 overflow-hidden">
                    <CodeBlock 
                      code={paste.content.length > 200 
                        ? paste.content.substring(0, 200) + "..." 
                        : paste.content}
                      language={paste.language || "plaintext"}
                      showLineNumbers={true}
                      showCopyButton={false}
                      showLineActions={false}
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl text-gray-400 mb-4">No {formattedLanguage} pastes found</h2>
          <p className="text-gray-500 mb-6">Be the first to create a {formattedLanguage} paste!</p>
          <Link to="/create">
            <Button className="bg-blue-500 hover:bg-blue-600">
              Create New Paste
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default LanguagePage;