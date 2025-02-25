
import { ChefCard } from "@/components/ChefCard";

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

interface ChefGridProps {
  chefs: Chef[] | undefined;
  isLoading: boolean;
}

export const ChefGrid = ({ chefs, isLoading }: ChefGridProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[400px] rounded-lg bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!chefs?.length) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-muted-foreground">No chefs found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {chefs.map((chef) => (
        <ChefCard key={chef.id} {...chef} />
      ))}
    </div>
  );
};
