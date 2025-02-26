
import { useEffect, useState } from "react";
import { Star, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  customer: {
    first_name: string | null;
    last_name: string | null;
  };
}

interface ReviewListProps {
  chefId: string;
  limit?: number;
}

export const ReviewList = ({ chefId, limit }: ReviewListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from("reviews")
          .select(`
            id,
            rating,
            comment,
            created_at,
            customer:customer_id (
              first_name,
              last_name
            )
          `)
          .eq("chef_id", chefId)
          .order("created_at", { ascending: false });

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) throw error;

        setReviews(data as Review[]);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (chefId) {
      fetchReviews();
    }

    // Subscribe to new reviews
    const channel = supabase
      .channel(`chef-${chefId}-reviews`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reviews",
          filter: `chef_id=eq.${chefId}`
        },
        () => {
          fetchReviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chefId, limit]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No reviews yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 rounded-full p-2">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium">
                {review.customer.first_name} {review.customer.last_name}
              </span>
            </div>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="mt-2">
            <p className="text-sm text-muted-foreground mb-1">
              {format(new Date(review.created_at), "MMMM d, yyyy")}
            </p>
            {review.comment && <p className="text-sm">{review.comment}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};
