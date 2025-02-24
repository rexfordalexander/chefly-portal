
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Index from "./pages/Index";
import ChefExplore from "./pages/ChefExplore";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Onboarding from "./pages/Onboarding";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen">
            <Navigation />
            <div className="pt-16">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route 
                  path="/explore" 
                  element={<ChefExplore />} 
                />
                <Route
                  path="/dashboard"
                  element={
                    user ? <Dashboard /> : <Navigate to="/auth/signin" />
                  }
                />
                <Route
                  path="/onboarding"
                  element={
                    user ? <Onboarding /> : <Navigate to="/auth/signin" />
                  }
                />
                <Route
                  path="/auth/signin"
                  element={
                    !user ? <SignIn /> : <Navigate to="/dashboard" />
                  }
                />
                <Route
                  path="/auth/signup"
                  element={
                    !user ? <SignUp /> : <Navigate to="/dashboard" />
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
