import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FeaturesPage from "./pages/FeaturesPage";
import AIEmployeesPage from "./pages/AIEmployeesPage";
import AIEmployeeDetailPage from "./pages/AIEmployeeDetailPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import IndustriesPage from "./pages/IndustriesPage";
import PricingPage from "./pages/PricingPage";
import FAQPage from "./pages/FAQPage";
import GetStartedPage from "./pages/GetStartedPage";
import DashboardPage from "./pages/DashboardPage";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/ai-employees" element={<AIEmployeesPage />} />
            <Route path="/ai-employees/:slug" element={<AIEmployeeDetailPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/industries" element={<IndustriesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/get-started" element={<GetStartedPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
