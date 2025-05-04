import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setShowConsent(false);
  };

  const customizeCookies = () => {
    // In a real app, this would lead to more cookie settings
    localStorage.setItem("cookieConsent", "customized");
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <Card className="fixed bottom-4 right-4 z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-w-sm">
      <CardContent className="p-4">
        <p className="text-gray-300 text-sm mb-3">
          We use cookies for various purposes including analytics. By continuing to use CodeSnap, you agree to our use of cookies and our Privacy Policy.
        </p>
        <div className="flex space-x-2">
          <Button 
            size="sm"
            onClick={acceptCookies}
            className="py-1.5 px-3 bg-blue-500 text-white rounded text-sm hover:bg-blue-500/90 transition"
          >
            Accept
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={customizeCookies}
            className="py-1.5 px-3 border border-gray-700 text-gray-400 rounded text-sm hover:bg-gray-700 transition"
          >
            Customize
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CookieConsent;
