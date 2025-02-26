
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
  const [isBookingOpen, setIsBookingOpen]