
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChefCardProps {
  id: string;
  name: string;
  image: string;
  rating: number;
  location: string;
  specialty: string;
  price: number;
  cuisines?: string[];
}

export const ChefCard = ({
  id,
  name,
  image,
  rating,
  location,
  specialty,
  price,
  cuisines = [],
}: ChefCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative aspect-square">
        <img
          src={image || "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80"}
          alt={name}
          className="object-cover w-full h-full"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg truncate">{name}</h3>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">{rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{location}</span>
        </div>
        <p className="text-sm mb-3 line-clamp-2">{specialty}</p>
        {cuisines.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {cuisines.slice(0, 3).map((cuisine, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-primary/10 rounded-full text-xs"
              >
                {typeof cuisine === 'string' 
                  ? cuisine.charAt(0).toUpperCase() + cuisine.slice(1)
                  : cuisine}
              </span>
            ))}
            {cuisines.length > 3 && (
              <span className="px-2 py-0.5 bg-muted rounded-full text-xs">
                +{cuisines.length - 3}
              </span>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="px-4 py-3 border-t flex items-center justify-between">
        <div className="font-semibold">${price}/hr</div>
        <Button 
          variant="default" 
          size="sm"
          onClick={() => navigate(`/chef/${id}`)}
        >
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
};
