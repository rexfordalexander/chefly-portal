
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Calendar, Clock, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChatWindow } from "@/components/chat/ChatWindow";

interface ChefCardProps {
  id: string;
  name: string;
  image: string;
  rating: number;
  location: string;
  specialty: string;
  price: number;
}

export const ChefCard = ({
  id: chefId,
  name,
  image,
  rating,
  location,
  specialty,
  price,
}: ChefCardProps) => {
  const { toast } = useToast();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(1);
  const [hours, setHours] = useState(2);
  const [booking, setBooking] = useState<{ id: string } | null>(null);
  const [user, setUser] = useState<{ id: string } | null>(null);

  // Get current user
  useState(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser({ id: user.id });
      }
    });
  });

  const handleBook = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to book a chef.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          chef_id: chefId,
          customer_id: user.id,
          booking_date: date,
          start_time: time,
          duration_hours: hours,
          number_of_guests: guests,
          total_amount: price * hours,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      setBooking(data);
      toast({
        title: "Booking submitted!",
        description: "The chef will review your booking request.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg group animate-fade-up">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={name}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg font-medium">{name}</h3>
            <p className="text-sm text-muted-foreground">{specialty}</p>
          </div>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="ml-1 text-sm font-medium">{rating}</span>
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mr-1" />
          {location}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-display text-lg">
            ${price}
            <span className="text-sm text-muted-foreground">/hr</span>
          </span>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">Book Now</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Book {name}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hours">Duration (hours)</Label>
                  <Input
                    id="hours"
                    type="number"
                    min="1"
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="guests">Number of Guests</Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                  />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <p className="text-sm text-muted-foreground">Total Price:</p>
                  <p className="font-medium">${price * hours}</p>
                </div>
                {booking ? (
                  <ChatWindow
                    bookingId={booking.id}
                    customerId={user?.id || ""}
                    chefId={chefId}
                  />
                ) : (
                  <Button onClick={handleBook}>
                    Confirm Booking
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Card>
  );
};
