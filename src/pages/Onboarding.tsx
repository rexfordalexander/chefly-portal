
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ChefHat, Utensils } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

// Define the cuisine type to match the database enum
type CuisineType = Database["public"]["Enums"]["cuisine_type"];
type ChefStatus = Database["public"]["Enums"]["chef_status"];

const Onboarding = () => {
  const [isChef, setIsChef] = useState<boolean | null>(null);
  const [paymentInfo, setPaymentInfo] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [location, setLocation] = useState("");
  const [cuisineTypes, setCuisineTypes] = useState<CuisineType[]>([]);
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const cuisineOptions = [
    { value: "italian" as CuisineType, label: "Italian" },
    { value: "french" as CuisineType, label: "French" },
    { value: "indian" as CuisineType, label: "Indian" },
    { value: "chinese" as CuisineType, label: "Chinese" },
    { value: "japanese" as CuisineType, label: "Japanese" },
    { value: "mexican" as CuisineType, label: "Mexican" },
    { value: "mediterranean" as CuisineType, label: "Mediterranean" },
    { value: "american" as CuisineType, label: "American" },
    { value: "other" as CuisineType, label: "Other" }
  ];

  useEffect(() => {
    const checkExistingProfile = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/auth/signin");
          return;
        }

        // Check if user already has a chef profile
        const { data: chefProfile } = await supabase
          .from("chef_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (chefProfile) {
          setHasExistingProfile(true);
          // If they have one, pre-fill the form
          setBio(chefProfile.bio || "");
          setHourlyRate(chefProfile.hourly_rate?.toString() || "");
          setSpecialties(chefProfile.specialties?.join(", ") || "");
          setLocation(chefProfile.location || "");
          setCuisineTypes(chefProfile.cuisine_types || []);
          setYearsOfExperience(chefProfile.years_of_experience?.toString() || "");
          
          // Safely extract payment_info value
          if (chefProfile.payment_info) {
            let paymentValue = "";
            if (typeof chefProfile.payment_info === 'object' && !Array.isArray(chefProfile.payment_info)) {
              // It's a JSON object, try to get the value property
              paymentValue = (chefProfile.payment_info as Record<string, any>)?.value || "";
            }
            setPaymentInfo(paymentValue);
          }
        }
      } catch (error) {
        console.error("Error checking profile:", error);
      }
    };

    checkExistingProfile();
  }, [navigate]);

  const handleCuisineToggle = (cuisine: CuisineType) => {
    setCuisineTypes(prev => 
      prev.includes(cuisine) 
        ? prev.filter(c => c !== cuisine) 
        : [...prev, cuisine]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isChef === null) return;

    setIsLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not found. Please log in again.");
      }

      if (isChef) {
        const profileData = {
          id: user.id,
          payment_info: { type: "upi", value: paymentInfo },
          bio,
          hourly_rate: parseFloat(hourlyRate),
          specialties: specialties.split(",").map(s => s.trim()),
          cuisine_types: cuisineTypes,
          location,
          years_of_experience: parseInt(yearsOfExperience),
          status: "pending" as ChefStatus
        };

        let result;
        
        if (hasExistingProfile) {
          // Update existing profile
          result = await supabase.from("chef_profiles")
            .update(profileData)
            .eq("id", user.id);
        } else {
          // Insert new profile
          result = await supabase.from("chef_profiles")
            .insert(profileData);
        }

        if (result.error) throw result.error;

        toast({
          title: hasExistingProfile ? "Profile updated" : "Profile submitted",
          description: hasExistingProfile 
            ? "Your chef profile has been updated." 
            : "Your chef profile is pending approval.",
        });
      }

      navigate("/profile");
    } catch (error) {
      console.error("Profile submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isChef === null) {
    return (
      <div className="container max-w-lg py-20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Choose Your Path</h1>
          <p className="text-muted-foreground">Are you here to cook or to discover amazing chefs?</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Button
            size="lg"
            variant="outline"
            className="h-32"
            onClick={() => setIsChef(true)}
          >
            <div className="flex flex-col items-center gap-2">
              <ChefHat className="h-8 w-8" />
              <span>I'm a Chef</span>
            </div>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-32"
            onClick={() => {
              setIsChef(false);
              navigate("/explore");
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <Utensils className="h-8 w-8" />
              <span>I'm a Customer</span>
            </div>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-lg py-20">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {hasExistingProfile ? "Update Your Chef Profile" : "Complete Your Chef Profile"}
        </h1>
        <p className="text-muted-foreground">Tell us more about your culinary expertise</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
          <Input
            placeholder="Where are you based?"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Payment Information (UPI ID)</label>
          <Input
            placeholder="Enter your UPI ID"
            value={paymentInfo}
            onChange={(e) => setPaymentInfo(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Bio</label>
          <Textarea
            placeholder="Tell us about your culinary journey..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Years of Experience</label>
          <Input
            type="number"
            min="0"
            placeholder="How many years have you been cooking professionally?"
            value={yearsOfExperience}
            onChange={(e) => setYearsOfExperience(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Hourly Rate ($)</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="Your hourly rate"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Cuisine Types</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {cuisineOptions.map((cuisine) => (
              <Button
                key={cuisine.value}
                type="button"
                variant={cuisineTypes.includes(cuisine.value) ? "default" : "outline"}
                className="text-sm"
                onClick={() => handleCuisineToggle(cuisine.value)}
              >
                {cuisine.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Specialties</label>
          <Input
            placeholder="Enter your specialties (comma-separated)"
            value={specialties}
            onChange={(e) => setSpecialties(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading 
            ? (hasExistingProfile ? "Updating..." : "Submitting...") 
            : (hasExistingProfile ? "Update Profile" : "Complete Profile")}
        </Button>
      </form>
    </div>
  );
};

export default Onboarding;
