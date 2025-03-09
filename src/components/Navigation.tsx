
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChefHat, Menu, X, User } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const isMobile = useMobile();

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .single();

          setProfile(data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          setProfile(data);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth/signin");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <ChefHat className="h-6 w-6" />
            <span className="font-semibold">ChefHub</span>
          </Link>
        </div>

        {isMobile ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        ) : (
          <nav className="flex items-center gap-4">
            <Link
              to="/explore"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Explore Chefs
            </Link>
            {!loading && user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Dashboard
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={profile?.avatar_url}
                          alt={profile?.first_name || user.email}
                        />
                        <AvatarFallback>
                          {profile?.first_name?.[0]?.toUpperCase() ||
                            user.email?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/onboarding")}>
                      <ChefHat className="mr-2 h-4 w-4" />
                      Chef Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => navigate("/auth/signin")}>
                  Sign In
                </Button>
                <Button onClick={() => navigate("/auth/signup")}>Sign Up</Button>
              </div>
            )}
          </nav>
        )}

        {isMobile && mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 border-b bg-background p-4 shadow-lg">
            <nav className="flex flex-col gap-2">
              <Link
                to="/explore"
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Explore Chefs
              </Link>
              {!loading && user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/onboarding"
                    className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Chef Profile
                  </Link>
                  <Button
                    variant="ghost"
                    className="justify-start px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2 mt-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate("/auth/signin");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => {
                      navigate("/auth/signup");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;
