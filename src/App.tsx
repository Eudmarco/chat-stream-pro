import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import Docs from "./pages/Docs";
import Dashboard from "./pages/Dashboard";
import Instances from "./pages/Instances";
import InstanceDetail from "./pages/InstanceDetail";
import Webhooks from "./pages/Webhooks";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/" element={<Index />} />
              <Route path="/precos" element={<Pricing />} />
              <Route path="/documentacao" element={<Docs />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/instancias" element={<ProtectedRoute><Instances /></ProtectedRoute>} />
              <Route path="/instancias/:id" element={<ProtectedRoute><InstanceDetail /></ProtectedRoute>} />
              <Route path="/webhooks" element={<ProtectedRoute><Webhooks /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

