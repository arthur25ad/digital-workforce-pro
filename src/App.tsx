import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AppProvider } from "./context/AppContext";
import { AuthProvider, useAuth } from "./hooks/useAuth";
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
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ChooseRolesPage from "./pages/ChooseRolesPage";
import VantaBrainPage from "./pages/VantaBrainPage";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
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
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/get-started" element={<ProtectedRoute><GetStartedPage /></ProtectedRoute>} />
              <Route path="/choose-roles" element={<ProtectedRoute><ChooseRolesPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/veyra" element={<VantaBrainPage />} />
              <Route path="/vantabrain" element={<VantaBrainPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
