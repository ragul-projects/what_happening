import { Code } from "lucide-react";
import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-700 py-4 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-3 md:mb-0">
            <Link href="/" className="flex items-center">
              <div className="bg-blue-500 text-white p-1 rounded">
                <Code className="h-4 w-4" />
              </div>
              <span className="ml-2 font-bold text-white">CodeSnap</span>
            </Link>
            <p className="text-gray-500 text-xs mt-1">Share code snippets with anyone, anywhere</p>
          </div>
          <div className="flex space-x-4 text-sm">
            <a href="#" className="text-gray-400 hover:text-white transition">Terms</a>
            <a href="#" className="text-gray-400 hover:text-white transition">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-white transition">Help</a>
            <a href="#" className="text-gray-400 hover:text-white transition">Contact</a>
            <a href="#" className="text-gray-400 hover:text-white transition">API</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
