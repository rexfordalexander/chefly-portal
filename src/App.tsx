
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import ChefExplore from "@/pages/ChefExplore";
import ChefProfile from "@/pages/ChefProfile";
import Onboarding from "@/pages/Onboarding";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import { Toaster } from "@/components/ui/toaster";
import ProfilePage from "@/pages/ProfilePage";
import "./App.css";

// Create a client
const queryClient = new QueryClient();

function App() {
  console.log("App rendering");
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/explore" element={<ChefExplore />} />
              <Route path="/chef/:id" element={<ChefProfile />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/auth/signin" element={<SignIn />} />
              <Route path="/auth/signup" element={<SignUp />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
