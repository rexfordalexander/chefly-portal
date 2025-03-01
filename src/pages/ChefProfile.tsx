
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Star, MapPin, Clock, ChefHat, Calendar, Phone, Mail } from "lucide-react";

interface ChefProfile {
  id: string;
  bio: string;
  hourly_rate: number;
  location: string;
  rating: number;
  specialties: string[];
  cuisine_types: string[];
  years_of_experience: number;
  status: string;
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

const ChefProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [duration, setDuration] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: chef, isLoading, error } = useQuery<ChefProfile>({
    queryKey: ['chef', id],
    queryFn: async () => {
      if (!id) throw new Error("Chef ID is required");

      const { data, error } = await supabase
        .from('chef_profiles')
        .select(`
          id,
          bio,
          hourly_rate,
          location,
          rating,
          specialties,
          cuisine_types,
          years_of_experience,
          status,
          profiles (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('id', id)
        .eq('status', 'approved')
        .single();

      if (error) throw error;
      if (!data) throw new Error("Chef not found");
      
      console.log("Fetched chef:", data);
      return data;
    },
    enabled: !!id
  });

  const handleBooking = async () => {
    if (!chef || !bookingDate || !bookingTime) return;
    
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please sign in to book a chef",
        });
        navigate("/auth/signin");
        return;
      }
      
      const totalAmount = chef.hourly_rate * duration;
      
      const { error } = await supabase.from("bookings").insert({
        chef_id: chef.id,
        customer_id: user.id,
        booking_date: bookingDate,
        start_time: bookingTime,
        duration_hours: duration,
        number_of_guests: guestCount,
        total_amount: totalAmount,
        status: "pending"
      });
      
      if (error) throw error;
      
      toast({
        title: "Booking requested",
        description: "Your booking request has been sent to the chef.",
      });
      
      setBookingDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Booking failed",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container py-20">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-64 bg-muted rounded-lg mb-8"></div>
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
          <div className="h-32 bg-muted rounded mb-8"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !chef) {
    return (
      <div className="container py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Chef not found</h1>
          <p className="text-muted-foreground mb-8">We couldn't find the chef you're looking for.</p>
          <Button onClick={() => navigate("/explore")}>Explore Other Chefs</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="md:w-1/3">
            <img 
              src={chef.profiles.avatar_url || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80'} 
              alt={`${chef.profiles.first_name} ${chef.profiles.last_name}`}
              className="w-full h-auto aspect-square object-cover rounded-lg shadow-md"
            />
          </div>
          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold mb-2">
              {chef.profiles.first_name} {chef.profiles.last_name}
            </h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star}
                    className={`h-5 w-5 ${star <= Math.round(chef.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="text-muted-foreground">({chef.rating.toFixed(1)})</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground mb-2">
              <MapPin className="h-4 w-4" />
              <span>{chef.location}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground mb-4">
              <Clock className="h-4 w-4" />
              <span>{chef.years_of_experience} years of experience</span>
            </div>
            <div className="mb-6">
              <h2 className="font-semibold mb-2">Specialties</h2>
              <div className="flex flex-wrap gap-2">
                {chef.specialties.map((specialty, index) => (
                  <span key={index} className="px-3 py-1 bg-muted rounded-full text-sm">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <h2 className="font-semibold mb-2">Cuisines</h2>
              <div className="flex flex-wrap gap-2">
                {chef.cuisine_types.map((cuisine, index) => (
                  <span key={index} className="px-3 py-1 bg-primary/10 rounded-full text-sm">
                    {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-xl font-bold">${chef.hourly_rate}/hour</div>
              <Button onClick={() => setBookingDialogOpen(true)}>Book Now</Button>
            </div>
          </div>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About {chef.profiles.first_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{chef.bio}</p>
          </CardContent>
        </Card>
        
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Get in touch with {chef.profiles.first_name} for any questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span>Contact through booking system</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <span>Available after booking confirmation</span>
            </div>
          </CardContent>
        </Card>
        
        <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Book {chef.profiles.first_name} {chef.profiles.last_name}</DialogTitle>
              <DialogDescription>
                Fill out the details to request a booking with this chef.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <label htmlFor="date" className="text-sm font-medium block mb-1">Date</label>
                <input
                  id="date"
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full p-2 border rounded"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label htmlFor="time" className="text-sm font-medium block mb-1">Time</label>
                <input
                  id="time"
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="guests" className="text-sm font-medium block mb-1">Number of Guests</label>
                <input
                  id="guests"
                  type="number"
                  min="1"
                  max="20"
                  value={guestCount}
                  onChange={(e) => setGuestCount(parseInt(e.target.value))}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="duration" className="text-sm font-medium block mb-1">Duration (hours)</label>
                <input
                  id="duration"
                  type="number"
                  min="1"
                  max="8"
                  step="0.5"
                  value={duration}
                  onChange={(e) => setDuration(parseFloat(e.target.value))}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="bg-muted rounded p-3 mt-2">
                <div className="flex justify-between mb-2">
                  <span>Rate per hour:</span>
                  <span>${chef.hourly_rate.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Duration:</span>
                  <span>{duration} hours</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${(chef.hourly_rate * duration).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBookingDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleBooking} disabled={isSubmitting || !bookingDate || !bookingTime}>
                {isSubmitting ? "Submitting..." : "Confirm Booking"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ChefProfile;
