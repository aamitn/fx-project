import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import TwoFAManagement from "./pages/TwoFAManagement";
import ConfirmEmail from "./pages/ConfirmEmail";
import ResendConfirmation from "./pages/ResendConfirmation";
import ProfileDetails from "./components/auth/ProfileDetails";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import GoogleCallback from "./pages/GoogleCallback";
import StatusPage from "./pages/StatusPage";
import ConnectionStatusModal from '@/components/ConnectionStatusModal';

const queryClient = new QueryClient();

const App = () => {
  // Define your backend health check URL here.
  // Make sure this matches the actual URL of your .NET Web API's health endpoint.
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5227';
  const backendHealthUrl = `${baseUrl}/health`;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {/*
            Wrap the entire BrowserRouter with ConnectionStatusModal.
            This ensures that any route rendered within the application
            will be covered by the connection status monitoring.
            AUTO-BACKEND STATUS MONITORING MODAL
          */}
              <ConnectionStatusModal
                backendHealthCheckUrl={backendHealthUrl}
                pollingIntervalMs={5000}
                isEnabled={true} // Set to false to disable the modal for development
              >
              <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/google/callback" element={<GoogleCallback />} />
                <Route path="/confirm-email" element={<ConfirmEmail />} />
                <Route path="/resend-confirmation" element={<ResendConfirmation />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/status" element={<StatusPage />} /> {/* Status page can be public */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/2fa-management"
                  element={
                    <ProtectedRoute>
                      <TwoFAManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfileDetails />
                    </ProtectedRoute>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ConnectionStatusModal>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;