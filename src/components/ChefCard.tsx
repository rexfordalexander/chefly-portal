
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Calendar, Clock, Users, Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChatWindow } from "@/components/chat/ChatWindow";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

interface ChefCardProps {
  id: string;
  name: string;
  image: string;
  rating: number;
  location: string;
  specialty: string;
  price: number;
}

type Booking = {
  id: string;
  booking_date: string;
  start_time: string;
  duration_hours: number;
  number_of_guests: number;
  total_amount: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  special_requests: string | null;
};

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
  const [specialRequests, setSpecialRequests] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser({ id: user.id });
        fetchBookings(user.id);
      }
    });
  }, []);

  const fetchBookings = async (userId: string) => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("customer_id", userId)
      .eq("chef_id", chefId);

    if (!error && data) {
      setBookings(data as Booking[]);
      // Check if there are any new messages or status changes
      const hasUpdates = data.some(b => 
        b.status === "confirmed" || 
        b.status === "cancelled" || 
        b.status === "completed"
      );
      setHasNotifications(hasUpdates);
    }
  };

  // Subscribe to booking changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`bookings-${chefId}-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `chef_id=eq.${chefId},customer_id=eq.${user.id}`
        },
        async (payload) => {
          if (user) {
            await fetchBookings(user.id);
            // Notify user about changes
            if (payload.eventType === "UPDATE") {
              const newStatus = (payload.new as Booking).status;
              toast({
                title: `Booking ${newStatus}`,
                description: `Your booking has been ${newStatus}.`,
              });
              setHasNotifications(true);
            }
          }
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel(`messages-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "booking_messages",
          filter: `sender_id=neq.${user.id}`
        },
        async (payload) => {
          const { data } = await supabase
            .from("bookings")
            .select("chef_id")
            .eq("id", (payload.new as any).booking_id)
            .single();

          if (data && data.chef_id === chefId) {
            toast({
              title: "New message",
              description: "You have a new message from the chef.",
            });
            setHasNotifications(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user, chefId]);

  const handleBook = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to book a chef.",
        variant: "destructive",
      });
      return;
    }

    if (!date || !time) {
      toast({
        title: "Missing information",
        description: "Please select a date and time for your booking.",
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
          special_requests: specialRequests || null,
        })
        .select()
        .single();

      if (error) throw error;

      setBooking(data as Booking);
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

  const handleReschedule = async (bookingId: string) => {
    if (!date || !time) {
      toast({
        title: "Missing information",
        description: "Please select a new date and time.",
        variant: "destructive",
      });
      return;
    }

    try {
      await supabase
        .from("bookings")
        .update({
          booking_date: date,
          start_time: time,
          duration_hours: hours,
          number_of_guests: guests,
          total_amount: price * hours,
          status: "pending", // Reset to pending after rescheduling
          special_requests: specialRequests || null,
        })
        .eq("id", bookingId);

      toast({
        title: "Booking rescheduled",
        description: "Your booking has been updated and awaits chef confirmation.",
      });

      if (user) {
        fetchBookings(user.id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reschedule booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = async (bookingId: string) => {
    try {
      await supabase
        .from("bookings")
        .update({
          status: "cancelled",
        })
        .eq("id", bookingId);

      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled.",
      });

      if (user) {
        fetchBookings(user.id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearNotifications = () => {
    setHasNotifications(false);
  };

  const getActiveBooking = () => {
    return bookings.find(b => 
      b.status === "confirmed" || b.status === "pending"
    ) || null;
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
              <Button 
                size="sm" 
                className="relative"
                onClick={() => {
                  setIsBookingOpen(true);
                  clearNotifications();
                }}
              >
                {hasNotifications && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                )}
                {getActiveBooking() ? "View Booking" : "Book Now"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Book {name}</DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue={getActiveBooking() ? "bookings" : "book"}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="book">New Booking</TabsTrigger>
                  <TabsTrigger value="bookings">My Bookings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="book" className="mt-4 space-y-4">
                  <div className="grid gap-4">
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
                    <div className="grid grid-cols-2 gap-4">
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
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="special-requests">Special Requests</Label>
                      <Textarea
                        id="special-requests"
                        placeholder="Any dietary restrictions, special occasions, or requests..."
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <p className="text-sm text-muted-foreground">Total Price:</p>
                      <p className="font-medium">${price * hours}</p>
                    </div>
                    <Button onClick={handleBook}>
                      Confirm Booking
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="bookings" className="mt-4 space-y-4">
                  {bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.map((b) => (
                        <div key={b.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">
                                {new Date(b.booking_date).toLocaleDateString()} at {b.start_time}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {b.duration_hours} hours • {b.number_of_guests} guests • ${b.total_amount}
                              </p>
                              {b.special_requests && (
                                <p className="text-sm mt-2">
                                  <span className="font-medium">Special requests:</span> {b.special_requests}
                                </p>
                              )}
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              b.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              b.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                            </span>
                          </div>
                          
                          <div className="mt-4 flex gap-2 justify-end">
                            {b.status === "pending" && (
                              <>
                                <Button size="sm" variant="outline" onClick={() => handleCancel(b.id)}>
                                  Cancel
                                </Button>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm">Reschedule</Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Reschedule Booking</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid gap-2">
                                        <Label htmlFor="reschedule-date">New Date</Label>
                                        <Input
                                          id="reschedule-date"
                                          type="date"
                                          value={date}
                                          onChange={(e) => setDate(e.target.value)}
                                        />
                                      </div>
                                      <div className="grid gap-2">
                                        <Label htmlFor="reschedule-time">New Time</Label>
                                        <Input
                                          id="reschedule-time"
                                          type="time"
                                          value={time}
                                          onChange={(e) => setTime(e.target.value)}
                                        />
                                      </div>
                                      <Button onClick={() => handleReschedule(b.id)}>
                                        Confirm Reschedule
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </>
                            )}
                            {b.status === "confirmed" && (
                              <Button size="sm" variant="outline" onClick={() => handleCancel(b.id)}>
                                Cancel
                              </Button>
                            )}
                            {(b.status === "confirmed" || b.status === "pending") && (
                              <Button size="sm">
                                Chat with Chef
                              </Button>
                            )}
                          </div>
                          
                          {(b.status === "confirmed" || b.status === "pending") && (
                            <div className="mt-4">
                              <ChatWindow
                                bookingId={b.id}
                                customerId={user?.id || ""}
                                chefId={chefId}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">No bookings with this chef yet.</p>
                  )}
                </TabsContent>
              </Tabs>
              
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsBookingOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Card>
  );
};
