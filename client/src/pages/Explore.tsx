import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import CodeBlock from "@/components/CodeBlock";
import { Paste, supportedLanguages } from "@shared/schema";

const Explore = () => {
  const { data: pastesData, isLoading } = useQuery({
    queryKey: ["/api/pastes"],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Explore Pastes</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-2 lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pastesData?.map((paste: Paste) => (
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
          )}
        </div>

        <div>
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardContent className="p-4">
              <h3 className="font-medium text-white mb-3">Languages</h3>
              <div className="space-y-1">
                {supportedLanguages.map((language) => (
                  <Link 
                    key={language.value} 
                    to={`/language/${language.value}`}
                    className="block p-2 hover:bg-gray-700 rounded transition text-gray-300 hover:text-white text-sm"
                  >
                    {language.name}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <h3 className="font-medium text-white mb-3">Create New Paste</h3>
              <p className="text-gray-400 text-sm mb-3">
                Share your code snippets, notes or any text with syntax highlighting and more.
              </p>
              <Link to="/create">
                <Button className="w-full bg-blue-500 hover:bg-blue-600">
                  Create Paste
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Explore;