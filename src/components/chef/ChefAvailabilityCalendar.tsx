
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

interface ChefAvailabilityCalendarProps {
  availabilityData: {
    [date: string]: string[]; // date string -> array of available time slots
  };
  onSelectDateTime: (date: Date, time: string) => void;
}

export const ChefAvailabilityCalendar = ({
  availabilityData,
  onSelectDateTime,
}: ChefAvailabilityCalendarProps) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Convert availabilityData keys to Date objects for the calendar
  const getAvailableDates = () => {
    return Object.keys(availabilityData).map(dateStr => new Date(dateStr));
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setSelectedTime(null);
  };

  const getAvailableTimesForDate = () => {
    if (!date) return [];
    const dateStr = format(date, "yyyy-MM-dd");
    return availabilityData[dateStr] || [];
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirm = () => {
    if (date && selectedTime) {
      onSelectDateTime(date, selectedTime);
    }
  };

  const availableDates = getAvailableDates();

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              