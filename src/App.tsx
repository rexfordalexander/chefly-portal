
import { Route, Routes } from "react-router-dom";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import SignUp from "@/pages/auth/SignUp";
import SignIn from "@/pages/auth/SignIn";
import NotFound from "@/pages/NotFound";
import ChefExplore from "@/pages/ChefExplore";
import Onboarding from "@/pages/Onboarding";
import ChefProfile from "@/pages/ChefProfile";
import { Navigation } from "@/components/Navigation";
import { Toaster } from "@/components/ui/toaster";
import "./App.css";

function App() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-16">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explore" element={<ChefExplore />} />
          <Route path="/chef/:id" element={<ChefProfile />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Toaster />
    </>
  );
}

export default App;
