
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SearchBar } from "@/components/chef/SearchBar";
import { FiltersSheet } from "@/components/chef/FiltersSheet";
import { ChefGrid } from "@/components/chef/ChefGrid";

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
  const queryClient = useQueryClient();

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
        .eq('status', 'approved')
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

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('chef-profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chef_profiles',
          filter: `status=eq.approved`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["chefs"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleClearFilters = () => {
    setSelectedCuisine("");
    setMinRating(0);
    setPriceRange([0, 500]);
  };

  return (
    <div className="container py-20">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-display font-bold mb-4">Explore Chefs</h1>
        <p className="text-muted-foreground mb-8">
          Discover talented chefs in your area and book your next culinary experience
        </p>
        <div className="flex gap-2 max-w-md mx-auto">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <FiltersSheet
            cuisineTypes={cuisineTypes || []}
            selectedCuisine={selectedCuisine}
            onCuisineChange={setSelectedCuisine}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            minRating={minRating}
            onMinRatingChange={setMinRating}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>
      <ChefGrid chefs={chefs} isLoading={isLoading} />
    </div>
  );
};

export default ChefExplore;
