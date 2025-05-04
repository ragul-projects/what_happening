import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ViewPaste from "@/pages/ViewPaste";
import CreatePaste from "@/pages/CreatePaste";
import Explore from "@/pages/Explore";
import LanguagePage from "@/pages/LanguagePage";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import { AdminProvider } from "@/hooks/use-admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/paste/:pasteId" component={ViewPaste} />
      <Route path="/create" component={CreatePaste} />
      <Route path="/explore" component={Explore} />
      <Route path="/language/:language" component={LanguagePage} />
      <Route path="/raw/:pasteId" component={ViewPaste} /> {/* For now, reuse ViewPaste */}
      <Route path="/:rest*" component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <AdminProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
          <CookieConsent />
        </div>
        <Toaster />
      </AdminProvider>
    </TooltipProvider>
  );
}

export default App;
