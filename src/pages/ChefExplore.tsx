
import { useState } from "react";
import { ChefCard } from "@/components/ChefCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Slider
} from "@/components/ui/slider";
import {
  Search,
  SlidersHorizontal,
  X
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Chef {
  id: string;
  name: string;
  image: string;
  rating: number;
  location: string;
  specialty: string;
  price: number;
  cuisines: string[];
}

interface CuisineType {
  id: string;
  name: string;
  created_at: string;
}

const ChefExplore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string>("");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [minRating, setMinRating] = useState(0);

  // Fetch cuisine types
  const { data: cuisineTypes } = useQuery<CuisineType[]>({
    queryKey: ['cuisineTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cuisine_types')
        .select('id, name, created_at');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch chefs with filters
  const { data: chefs, isLoading } = useQuery<Chef[]>({
    queryKey: ['chefs', selectedCuisine, priceRange, minRating, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('chef_profiles')
        .select(`
          id,
          hourly_rate,
          location,
          rating,
          specialties,
          cuisine_types,
          profiles!inner (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('status', 'approved') // Only show approved chefs
        .order('rating', { ascending: false });

      if (selectedCuisine) {
        query = query.contains('cuisine_types', [selectedCuisine]);
      }

      if (priceRange[0] > 0 || priceRange[1] < 500) {
        query = query
          .gte('hourly_rate', priceRange[0])
          .lte('hourly_rate', priceRange[1]);
      }

      if (minRating > 0) {
        query = query.gte('rating', minRating);
      }

      if (searchQuery) {
        query = query.or(`
          location.ilike.%${searchQuery}%,
          specialties.ilike.%${searchQuery}%
        `);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      return data?.map(chef => ({
        id: chef.id,
        name: `${chef.profiles.first_name} ${chef.profiles.last_name}`,
        image: chef.profiles.avatar_url || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80',
        rating: chef.rating || 0,
        location: chef.location || 'Location not specified',
        specialty: chef.specialties?.[0] || 'Various Cuisines',
        price: chef.hourly_rate || 0,
        cuisines: chef.cuisine_types || []
      })) as Chef[];
    }
  });

  return (
    <div className="container py-20">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-display font-bold mb-4">Explore Chefs</h1>
        <p className="text-muted-foreground mb-8">
          Discover talented chefs in your area and book your next culinary experience
        </p>
        <div className="flex gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by location or cuisine..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
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
                  <Select
                    value={selectedCuisine}
                    onValueChange={setSelectedCuisine}
                  >
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
                    onValueChange={setPriceRange}
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
                    onValueChange={([value]) => setMinRating(value)}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{minRating} stars</span>
                  </div>
                </div>
                {(selectedCuisine || minRating > 0 || priceRange[0] > 0 || priceRange[1] < 500) && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedCuisine("");
                      setMinRating(0);
                      setPriceRange([0, 500]);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[400px] rounded-lg bg-muted animate-pulse"
            />
          ))
        ) : chefs?.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No chefs found matching your criteria.</p>
          </div>
        ) : (
          chefs?.map((chef) => <ChefCard key={chef.id} {...chef} />)
        )}
      </div>
    </div>
  );
};

export default ChefExplore;
