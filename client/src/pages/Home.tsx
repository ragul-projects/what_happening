import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import CodeBlock from "@/components/CodeBlock";
import { Paste } from "@shared/schema";

const Home = () => {
  const { data: recentPastes, isLoading } = useQuery({
    queryKey: ["/api/pastes"],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-4xl font-bold mb-4 text-white">Share Code Snippets Instantly</h1>
          <p className="text-xl text-gray-300 mb-6">
            CodeSnap lets you share code snippets with syntax highlighting, line numbers, and more.
          </p>
          <Link to="/create">
            <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white">
              Create New Snippet
            </Button>
          </Link>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Recent Snippets</h2>
          <Link to="/explore">
            <Button variant="ghost" className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPastes?.map((paste: Paste) => (
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
      </section>

      <section className="mt-16 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Why Use CodeSnap?</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="bg-blue-500 p-1 rounded text-white mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">Syntax Highlighting</h3>
                  <p className="text-sm text-gray-400">Support for over 15 popular programming languages</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-500 p-1 rounded text-white mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">Easy Sharing</h3>
                  <p className="text-sm text-gray-400">Share code with a simple link, no account required</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-500 p-1 rounded text-white mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">Line Numbers & Copying</h3>
                  <p className="text-sm text-gray-400">Copy entire snippets or individual lines with ease</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-500 p-1 rounded text-white mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">Expiration Control</h3>
                  <p className="text-sm text-gray-400">Set expiration times or keep your pastes forever</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="bg-gray-900 p-8 flex items-center justify-center">
            <div className="w-full max-w-md">
              <CodeBlock 
                code={`function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate first 10 Fibonacci numbers
const results = [];
for (let i = 0; i < 10; i++) {
  results.push(fibonacci(i));
}

console.log("Fibonacci sequence:", results);`}
                language="javascript"
                title="Example: JavaScript Fibonacci"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
