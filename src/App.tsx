import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/theme-provider";
import { Layout } from "@/components/layout/layout";
import { LanguageProvider } from "@/context/language-context";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { UserRole } from "@/lib/types";
import { initializeStorage } from "@/lib/storage";

// Pages
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Leader Pages
import LeaderDashboard from "@/pages/leader/LeaderDashboard";
import LeaderCreateProject from "@/pages/leader/LeaderCreateProject";
import LeaderAddProgress from "@/pages/leader/LeaderAddProgress";
import LeaderViewProgress from "@/pages/leader/LeaderViewProgress";
import LeaderRequestPayment from "@/pages/leader/LeaderRequestPayment";
import LeaderViewPayment from "@/pages/leader/LeaderViewPayment";

// Checker Pages
import CheckerDashboard from "./pages/checker/CheckerDashboard";
import CheckerReviewSubmissions from "./pages/checker/CheckerReviewSubmissions";
import CheckerReviewHistory from "@/pages/checker/CheckerReviewHistory";
import CheckerProjects from "@/pages/checker/CheckerProjects";

// Owner Pages
import OwnerDashboard from "@/pages/owner/OwnerDashboard";
import OwnerPaymentQueue from "./pages/owner/OwnerPaymentQueue";
import OwnerProjects from "@/pages/owner/OwnerProjects";
import OwnerStatistics from "@/pages/owner/OwnerStatistics";
import OwnerBackupLinks from "@/pages/owner/OwnerBackupLinks";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminCredentials from "./pages/admin/AdminCredentials";
import AdminVehicles from "@/pages/admin/AdminVehicles";
import AdminDrivers from "@/pages/admin/AdminDrivers";
import AdminStatistics from "@/pages/admin/AdminStatistics";
import AdminBackup from "@/pages/admin/AdminBackup";
import AdminExportData from "@/pages/admin/AdminExportData";

// Initialize storage when the app starts
initializeStorage();

const queryClient = new QueryClient();

// Role-based route protection component
const RoleRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole: UserRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has the required role
  if (user.role !== requiredRole) {
    // Redirect to the appropriate dashboard based on user's role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'checker':
        return <Navigate to="/checker" replace />;
      case 'owner':
        return <Navigate to="/owner" replace />;
      case 'leader':
        return <Navigate to="/leader" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }
  
  return <>{children}</>;
};

// Root route redirection based on auth status
const RootRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect based on user's role
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'checker':
      return <Navigate to="/checker" replace />;
    case 'owner':
      return <Navigate to="/owner" replace />;
    case 'leader':
      return <Navigate to="/leader" replace />;
    default:
      // Fallback to login if role is not recognized
      return <Navigate to="/login" replace />;
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Default route redirects based on auth status */}
              <Route path="/" element={<RootRoute />} />
              
              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Leader Routes */}
              <Route path="/leader" element={
                <RoleRoute requiredRole="leader">
                  <Layout><LeaderDashboard /></Layout>
                </RoleRoute>
              } />
              <Route path="/leader/create-project" element={
                <RoleRoute requiredRole="leader">
                  <Layout><LeaderCreateProject /></Layout>
                </RoleRoute>
              } />
              <Route path="/leader/add-progress" element={
                <RoleRoute requiredRole="leader">
                  <Layout><LeaderAddProgress /></Layout>
                </RoleRoute>
              } />
              <Route path="/leader/view-progress" element={
                <RoleRoute requiredRole="leader">
                  <Layout><LeaderViewProgress /></Layout>
                </RoleRoute>
              } />
              <Route path="/leader/request-payment" element={
                <RoleRoute requiredRole="leader">
                  <Layout><LeaderRequestPayment /></Layout>
                </RoleRoute>
              } />
              <Route path="/leader/view-payment" element={
                <RoleRoute requiredRole="leader">
                  <Layout><LeaderViewPayment /></Layout>
                </RoleRoute>
              } />
              
              {/* Checker Routes */}
              <Route path="/checker" element={
                <RoleRoute requiredRole="checker">
                  <Layout><CheckerDashboard /></Layout>
                </RoleRoute>
              } />
              <Route path="/checker/review-submissions" element={
                <RoleRoute requiredRole="checker">
                  <Layout><CheckerReviewSubmissions /></Layout>
                </RoleRoute>
              } />
              <Route path="/checker/review-history" element={
                <RoleRoute requiredRole="checker">
                  <Layout><CheckerReviewHistory /></Layout>
                </RoleRoute>
              } />
              <Route path="/checker/projects" element={
                <RoleRoute requiredRole="checker">
                  <Layout><CheckerProjects /></Layout>
                </RoleRoute>
              } />
              
              {/* Owner Routes */}
              <Route path="/owner" element={
                <RoleRoute requiredRole="owner">
                  <Layout><OwnerDashboard /></Layout>
                </RoleRoute>
              } />
              <Route path="/owner/payment-queue" element={
                <RoleRoute requiredRole="owner">
                  <Layout><OwnerPaymentQueue /></Layout>
                </RoleRoute>
              } />
              <Route path="/owner/projects" element={
                <RoleRoute requiredRole="owner">
                  <Layout><OwnerProjects /></Layout>
                </RoleRoute>
              } />
              <Route path="/owner/statistics" element={
                <RoleRoute requiredRole="owner">
                  <Layout><OwnerStatistics /></Layout>
                </RoleRoute>
              } />
              <Route path="/owner/backup-links" element={
                <RoleRoute requiredRole="owner">
                  <Layout><OwnerBackupLinks /></Layout>
                </RoleRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <RoleRoute requiredRole="admin">
                  <Layout><AdminDashboard /></Layout>
                </RoleRoute>
              } />
              <Route path="/admin/credentials" element={
                <RoleRoute requiredRole="admin">
                  <Layout><AdminCredentials /></Layout>
                </RoleRoute>
              } />
              <Route path="/admin/vehicles" element={
                <RoleRoute requiredRole="admin">
                  <Layout><AdminVehicles /></Layout>
                </RoleRoute>
              } />
              <Route path="/admin/drivers" element={
                <RoleRoute requiredRole="admin">
                  <Layout><AdminDrivers /></Layout>
                </RoleRoute>
              } />
              <Route path="/admin/statistics" element={
                <RoleRoute requiredRole="admin">
                  <Layout><AdminStatistics /></Layout>
                </RoleRoute>
              } />
              <Route path="/admin/backup" element={
                <RoleRoute requiredRole="admin">
                  <Layout><AdminBackup /></Layout>
                </RoleRoute>
              } />
              <Route path="/admin/export-data" element={
                <RoleRoute requiredRole="admin">
                  <Layout><AdminExportData /></Layout>
                </RoleRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
