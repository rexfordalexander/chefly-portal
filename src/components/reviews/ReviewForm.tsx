
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReviewFormProps {
  chefId: string;
  bookingId: string;
  customerId: string;
  onReviewSubmitted: () => void;
}

export const ReviewForm = ({
  chefId,
  bookingId,
  customerId,
  onReviewSubmitted,
}: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        variant: "destructive",
        title: "Rating required",
        description: "Please select a rating before submitting your review.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert the review
      const { error: reviewError } = await supabase
        .from("reviews")
        .insert({
          chef_id: chefId,
          booking_id: bookingId,
          customer_id: customerId,
          rating,
          comment: comment.trim() || null,
        });

      if (reviewError) throw reviewError;

      // Update chef's average rating
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("rating")
        .eq("chef_id", chefId);

      if (reviewsData) {
        const totalRating = reviewsData.reduce((sum, review) => sum + (review.rating || 0), 0);
        const avgRating = totalRating / reviewsData.length;

        await supabase
          .from("chef_profiles")
          .update({
            rating: avgRating,
            total_reviews: reviewsData.length
          })
          .eq("id", chefId);
      }

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });

      // Reset form and notify parent
      setRating(0);
      setComment("");
      onReviewSubmitted();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit your review. Please try again.",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Rating</label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-2xl focus:outline-none"
            >
              <Star
                className={`h-6 w-6 ${
                  (hoverRating || rating) >= star
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          Your Review (Optional)
        </label>
        <Textarea
          id="comment"
          placeholder="Tell us about your experience with this chef..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
};
