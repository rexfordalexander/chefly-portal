
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
              selected={date}
              onSelect={handleDateSelect}
              disabled={(date) => {
                // Disable dates that aren't in availableDates
                return !availableDates.some(
                  (d) => format(d, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
                );
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {date && (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Available Times</label>
            <div className="grid grid-cols-3 gap-2">
              {getAvailableTimesForDate().length > 0 ? (
                getAvailableTimesForDate().map((time) => (
                  <Button
                    key={time}
                    type="button"
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => handleTimeSelect(time)}
                    className="text-center"
                  >
                    {time}
                  </Button>
                ))
              ) : (
                <p className="col-span-3 text-sm text-muted-foreground">
                  No available times for this date.
                </p>
              )}
            </div>
          </div>

          {selectedTime && (
            <Button
              onClick={handleConfirm}
              className="w-full"
            >
              Confirm {format(date, "MMM d")} at {selectedTime}
            </Button>
          )}
        </>
      )}
    </div>
  );
};
