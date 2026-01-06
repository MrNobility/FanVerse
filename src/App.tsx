import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";

import { CreatorRoute } from "./components/auth/CreatorRoute";
import { AdminRoute } from "./components/auth/AdminRoute";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Feed from "./pages/Feed";
import Discover from "./pages/Discover";
import CreatorProfile from "./pages/CreatorProfile";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import CreatePost from "./pages/CreatePost";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
      <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
      <Route path="/creator/:username" element={<ProtectedRoute><CreatorProfile /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/create" element={<CreatorRoute><CreatePost /></CreatorRoute>} />
      <Route path="/dashboard" element={<CreatorRoute><Dashboard /></CreatorRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
