
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin } from "lucide-react";

interface ChefCardProps {
  name: string;
  image: string;
  rating: number;
  location: string;
  specialty: string;
  price: number;
}

export const ChefCard = ({
  name,
  image,
  rating,
  location,
  specialty,
  price,
}: ChefCardProps) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg group animate-fade-up">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={name}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg font-medium">{name}</h3>
            <p className="text-sm text-muted-foreground">{specialty}</p>
          </div>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="ml-1 text-sm font-medium">{rating}</span>
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mr-1" />
          {location}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-display text-lg">
            ${price}
            <span className="text-sm text-muted-foreground">/hr</span>
          </span>
          <Button size="sm">Book Now</Button>
        </div>
      </div>
    </Card>
  );
};
