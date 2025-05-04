import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Code, Menu, Search } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMobile } from "@/hooks/use-mobile";

const Header = () => {
  const isMobile = useMobile();
  const [, navigate] = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center">
              <div className="bg-blue-500 text-white p-1 rounded">
                <Code className="h-5 w-5" />
              </div>
              <span className="ml-2 text-xl font-bold text-white">CodeSnap</span>
            </Link>
            {!isMobile && (
              <div className="hidden md:flex space-x-4">
                <Link href="/" className="text-gray-200 hover:text-white transition">Home</Link>
                <Link href="/create" className="text-gray-200 hover:text-white transition">Create</Link>
                <Link href="/" className="text-gray-200 hover:text-white transition">Explore</Link>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {!isMobile && (
              <div className="hidden md:block">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="bg-gray-800 text-gray-200 py-1 px-3 pr-8 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-60"
                  />
                  <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                </div>
              </div>
            )}
            <Button 
              size="sm"
              onClick={() => navigate("/create")}
              className="py-1.5 px-4 bg-blue-500 text-white rounded hover:bg-blue-500/90 transition text-sm font-medium"
            >
              New Paste
            </Button>
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden text-gray-200">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-gray-900 text-gray-200 border-gray-700">
                  <div className="flex flex-col space-y-4 mt-8">
                    <Link href="/" className="text-gray-200 hover:text-white transition px-2 py-2">Home</Link>
                    <Link href="/create" className="text-gray-200 hover:text-white transition px-2 py-2">Create</Link>
                    <Link href="/" className="text-gray-200 hover:text-white transition px-2 py-2">Explore</Link>
                    <div className="relative mt-4">
                      <Input
                        type="text"
                        placeholder="Search..."
                        className="bg-gray-800 text-gray-200 py-1 px-3 pr-8 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                      />
                      <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
