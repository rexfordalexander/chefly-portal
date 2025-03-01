
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { User, ChefHat, Settings, FileEdit, LogOut } from "lucide-react";

interface UserProfile {
  id: string;
  avatar_url: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string | null;
}

interface ChefProfile {
  id: string;
  bio: string | null;
  hourly_rate: number | null;
  location: string | null;
  rating: number | null;
  specialties: string[] | null;
  cuisine_types: string[] | null;
  years_of_experience: number | null;
  status: string | null;
}

const ProfilePage = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [chefProfile, setChefProfile] = useState<ChefProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Get current authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/auth/signin");
          return;
        }
        
        // Fetch user profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }
        
        setUserProfile(profileData);
        
        // Check if user has a chef profile
        const { data: chefData, error: chefError } = await supabase
          .from("chef_profiles")
          .select("*")
          .eq("id", user.id)
          .single();
          
        if (!chefError) {
          setChefProfile(chefData);
        }
      } catch (error) {
        console.error("Error:", error);
        toast({
          variant: "destructive",
          title: "Error fetching profile",
          description: "There was a problem loading your profile data."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate, toast]);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth/signin");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was a problem logging out. Please try again."
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="container py-20">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-32 bg-muted rounded-lg mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="md:col-span-2 h-64 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-20">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {userProfile?.avatar_url ? (
                  <img src={userProfile.avatar_url} alt={`${userProfile.first_name} ${userProfile.last_name}`} />
                ) : (
                  <User className="h-10 w-10" />
                )}
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  {userProfile?.first_name} {userProfile?.last_name}
                </CardTitle>
                <p className="text-muted-foreground">Member since {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : "N/A"}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardHeader>
        </Card>
        
        {chefProfile ? (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <ChefHat className="mr-2 h-5 w-5" />
                  Chef Profile
                </CardTitle>
                <div className="flex items-center">
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    chefProfile.status === "approved" ? "bg-green-100 text-green-800" :
                    chefProfile.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {chefProfile.status?.toUpperCase()}
                  </span>
                  <Button variant="ghost" size="sm" className="ml-2" onClick={() => navigate("/onboarding")}>
                    <FileEdit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Bio</h3>
                <p className="text-muted-foreground">{chefProfile.bio || "No bio provided"}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-1">Location</h3>
                  <p>{chefProfile.location || "Not specified"}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Hourly Rate</h3>
                  <p>${chefProfile.hourly_rate?.toFixed(2) || "0.00"}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Experience</h3>
                  <p>{chefProfile.years_of_experience || 0} years</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Rating</h3>
                  <p>{chefProfile.rating?.toFixed(1) || "No ratings yet"}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-1">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {chefProfile.specialties && chefProfile.specialties.length > 0 ? (
                    chefProfile.specialties.map((specialty, index) => (
                      <span key={index} className="px-3 py-1 bg-muted rounded-full text-sm">
                        {specialty}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground">No specialties listed</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-1">Cuisines</h3>
                <div className="flex flex-wrap gap-2">
                  {chefProfile.cuisine_types && chefProfile.cuisine_types.length > 0 ? (
                    chefProfile.cuisine_types.map((cuisine, index) => (
                      <span key={index} className="px-3 py-1 bg-primary/10 rounded-full text-sm">
                        {typeof cuisine === 'string' ? 
                          cuisine.charAt(0).toUpperCase() + cuisine.slice(1) : cuisine}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground">No cuisines listed</span>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate(`/chef/${chefProfile.id}`)}>View Public Profile</Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <ChefHat className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Become a Chef</h3>
              <p className="text-center text-muted-foreground mb-4">
                Share your culinary skills with others by creating a chef profile
              </p>
              <Button onClick={() => navigate("/onboarding")}>Create Chef Profile</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
