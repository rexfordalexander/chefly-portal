
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

interface CuisineType {
  id: string;
  name: string;
  created_at: string;
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
}: FiltersSheetProps) => {
  const hasActiveFilters = selectedCuisine || minRating > 0 || priceRange[0] > 0 || priceRange[1] < 500;

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
        <div className="mt-6 space-y-6">
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
