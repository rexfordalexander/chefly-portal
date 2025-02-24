
import { useState } from "react";
import { ChefCard } from "@/components/ChefCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const SAMPLE_CHEFS = [
  {
    id: 1,
    name: "Alex Thompson",
    image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80",
    rating: 4.8,
    location: "New York, NY",
    specialty: "French Cuisine",
    price: 120,
  },
  {
    id: 2,
    name: "Maria Rodriguez",
    image: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&q=80",
    rating: 4.9,
    location: "Miami, FL",
    specialty: "Mediterranean",
    price: 100,
  },
  // Add more sample chefs here
];

const ChefExplore = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="container py-20">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-display font-bold mb-4">Explore Chefs</h1>
        <p className="text-muted-foreground mb-8">
          Discover talented chefs in your area and book your next culinary experience
        </p>
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by location or cuisine..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_CHEFS.map((chef) => (
          <ChefCard key={chef.id} {...chef} />
        ))}
      </div>
    </div>
  );
};

export default ChefExplore;
