
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ChefHat, Utensils } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Onboarding = () => {
  const [isChef, setIsChef] = useState<boolean | null>(null);
  const [paymentInfo, setPaymentInfo] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isChef === null) return;

    setIsLoading(true);

    try {
      if (isChef) {
        const { error } = await supabase.from("chef_profiles").insert({
          id: (await supabase.auth.getUser()).data.user?.id,
          payment_info: { type: "upi", value: paymentInfo },
          bio,
          hourly_rate: parseFloat(hourlyRate),
          specialties: specialties.split(",").map(s => s.trim()),
          status: "pending"
        });

        if (error) throw error;

        toast({
          title: "Profile submitted",
          description: "Your chef profile is pending approval.",
        });
      }

      navigate("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
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
            onClick={() => navigate("/explore")}
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
        <h1 className="text-4xl font-bold mb-4">Complete Your Chef Profile</h1>
        <p className="text-muted-foreground">Tell us more about your culinary expertise</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
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
          <label className="text-sm font-medium">Specialties</label>
          <Input
            placeholder="Enter your specialties (comma-separated)"
            value={specialties}
            onChange={(e) => setSpecialties(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Complete Profile"}
        </Button>
      </form>
    </div>
  );
};

export default Onboarding;
