
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CuisineType {
  id: string;
  name: string;
  created_at: string;
}

interface DietaryRestriction {
  id: string;
  name: string;
}

interface Specialization {
  id: string;
  name: string;
}

interface FiltersSheetProps {
  cuisineTypes: CuisineType[];
  selectedCuisine: string;
  onCuisineChange: (value: string) => void;
  priceRange: number[];
  onPriceRangeChange: (value: number[]) => void;
  minRating: number;
  onMinRatingChange: (value: number) => void;
  onClearFilters: () => void;
  // New props
  dietaryRestrictions?: DietaryRestriction[];
  selectedDietaryRestrictions?: string[];
  onDietaryRestrictionChange?: (value: string[]) => void;
  specializations?: Specialization[];
  selectedSpecializations?: string[];
  onSpecializationChange?: (value: string[]) => void;
  yearsOfExperience?: number;
  onYearsOfExperienceChange?: (value: number) => void;
  availableDate?: string;
  onAvailableDateChange?: (value: string) => void;
}

export const FiltersSheet = ({
  cuisineTypes,
  selectedCuisine,
  onCuisineChange,
  priceRange,
  onPriceRangeChange,
  minRating,
  onMinRatingChange,
  onClearFilters,
  dietaryRestrictions = [],
  selectedDietaryRestrictions = [],
  onDietaryRestrictionChange = () => {},
  specializations = [],
  selectedSpecializations = [],
  onSpecializationChange = () => {},
  yearsOfExperience = 0,
  onYearsOfExperienceChange = () => {},
  availableDate = "",
  onAvailableDateChange = () => {},
}: FiltersSheetProps) => {
  const hasActiveFilters = 
    selectedCuisine || 
    minRating > 0 || 
    priceRange[0] > 0 || 
    priceRange[1] < 500 ||
    selectedDietaryRestrictions.length > 0 ||
    selectedSpecializations.length > 0 ||
    yearsOfExperience > 0 ||
    availableDate;

  const handleDietaryRestrictionChange = (id: string, checked: boolean) => {
    if (checked) {
      onDietaryRestrictionChange([...selectedDietaryRestrictions, id]);
    } else {
      onDietaryRestrictionChange(selectedDietaryRestrictions.filter(r => r !== id));
    }
  };

  const handleSpecializationChange = (id: string, checked: boolean) => {
    if (checked) {
      onSpecializationChange([...selectedSpecializations, id]);
    } else {
      onSpecializationChange(selectedSpecializations.filter(s => s !== id));
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter Chefs</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto pb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Cuisine Type</label>
            <Select value={selectedCuisine} onValueChange={onCuisineChange}>
              <SelectTrigger>
                <SelectValue placeholder="All cuisines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All cuisines</SelectItem>
                {cuisineTypes?.map((cuisine) => (
                  <SelectItem key={cuisine.id} value={cuisine.name}>
                    {cuisine.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Price Range ($/hr)</label>
            <Slider
              min={0}
              max={500}
              step={10}
              value={priceRange}
              onValueChange={onPriceRangeChange}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Minimum Rating</label>
            <Slider
              min={0}
              max={5}
              step={0.5}
              value={[minRating]}
              onValueChange={([value]) => onMinRatingChange(value)}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{minRating} stars</span>
            </div>
          </div>

          {/* New filters */}
          {dietaryRestrictions.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Dietary Accommodations</label>
              <div className="grid grid-cols-2 gap-2">
                {dietaryRestrictions.map((restriction) => (
                  <div key={restriction.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`restriction-${restriction.id}`} 
                      checked={selectedDietaryRestrictions.includes(restriction.id)}
                      onCheckedChange={(checked) => 
                        handleDietaryRestrictionChange(restriction.id, checked as boolean)
                      } 
                    />
                    <Label htmlFor={`restriction-${restriction.id}`}>{restriction.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {specializations.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Specializations</label>
              <div className="grid grid-cols-2 gap-2">
                {specializations.map((specialization) => (
                  <div key={specialization.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`specialization-${specialization.id}`} 
                      checked={selectedSpecializations.includes(specialization.id)}
                      onCheckedChange={(checked) => 
                        handleSpecializationChange(specialization.id, checked as boolean)
                      } 
                    />
                    <Label htmlFor={`specialization-${specialization.id}`}>{specialization.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Minimum Years of Experience</label>
            <Slider
              min={0}
              max={20}
              step={1}
              value={[yearsOfExperience]}
              onValueChange={([value]) => onYearsOfExperienceChange(value)}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{yearsOfExperience} years</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Available Date</label>
            <input 
              type="date" 
              value={availableDate}
              onChange={(e) => onAvailableDateChange(e.target.value)}
              className="w-full p-2 rounded-md border"
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              className="w-full"
              onClick={onClearFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
