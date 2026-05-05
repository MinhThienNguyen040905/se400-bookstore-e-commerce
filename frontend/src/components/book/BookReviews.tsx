import { useState } from 'react';
import { Star, Send, Loader2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Review } from '@/types/Review';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReview } from '@/api/reviewApi';
import { showToast } from '@/lib/toast';

interface BookReviewsProps {
    bookId: number;
    reviews: Review[];
    className?: string;
}

export function BookReviews({ bookId, reviews, className }: BookReviewsProps) {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    // Form state
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);

    // CHECK: Does the current user have a review in the list?
    const hasReviewed = user ? reviews.some(r => r.user?.user_id === user.user_id) : false;

    // Mutation to submit review
    const reviewMutation = useMutation({
        mutationFn: createReview,
        onSuccess: () => {
            showToast.success('Review submitted successfully!');
            setComment('');
            setRating(5);
            // Refresh book data to show the new review
            queryClient.invalidateQueries({ queryKey: ['book', bookId] });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || error.response?.data?.msg || 'Failed to submit review';

            // Handle specific backend errors
            if (msg.toLowerCase().includes('already reviewed')) {
                showToast.error('You have already reviewed this book.');
                // Refresh to update UI state if needed
                queryClient.invalidateQueries({ queryKey: ['book', bookId] });
            }
            else if (error.response?.status === 403) {
                showToast.error('You can only review books from delivered orders.');
            }
            else {
                showToast.error(msg);
            }
        }
    });

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

        if (!comment.trim()) {
            showToast.error('Please enter your review content');
            return;
        }

        reviewMutation.mutate({
            book_id: bookId,
            rating,
            comment: comment.trim()
        });
    };

    return (
        <section className={cn("space-y-10", className)}>

            {/* --- REVIEW FORM SECTION --- */}
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-stone-700" />
                    <h3 className="text-xl font-bold text-stone-900">Write your review</h3>
                </div>

                {/* Case 1: Not logged in */}
                {!user ? (
                    <div className="text-center py-8 bg-stone-50 rounded-lg border border-dashed border-stone-300">
                        <p className="text-stone-600 mb-3 font-medium">Please login to review this product</p>
                        <Button
                            onClick={() => navigate('/login', { state: { from: location.pathname } })}
                            variant="outline"
                            className="border-stone-300 hover:bg-white hover:text-[#00bbb6]"
                        >
                            Login now
                        </Button>
                    </div>
                ) : hasReviewed ? (
                    // Case 2: Logged in & Already reviewed -> Show Notice
                    <div className="flex flex-col items-center justify-center py-8 bg-green-50/50 rounded-lg border border-green-100">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3 shadow-sm">
                            <Star className="w-6 h-6 fill-current" />
                        </div>
                        <p className="text-green-800 font-bold text-lg">You have already reviewed this product</p>
                        <p className="text-green-600 text-sm mt-1">Thank you for sharing your experience!</p>
                    </div>
                ) : (
                    // Case 3: Logged in & Not reviewed -> Show Form
                    <form onSubmit={handleSubmitReview} className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Rating Selection */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-stone-700">Rating:</span>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                    >
                                        <Star
                                            className={cn(
                                                "w-7 h-7 transition-colors duration-200",
                                                star <= (hoveredRating || rating)
                                                    ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                                                    : "text-stone-200 fill-stone-50"
                                            )}
                                        />
                                    </button>
                                ))}
                            </div>
                            <span className="text-sm font-medium text-[#00bbb6] ml-2 min-w-[80px]">
                                {rating === 5 ? 'Excellent' :
                                    rating === 4 ? 'Good' :
                                        rating === 3 ? 'Average' :
                                            rating === 2 ? 'Poor' : 'Very Poor'}
                            </span>
                        </div>

                        {/* Comment Input */}
                        <Textarea
                            placeholder="Share your thoughts about this book..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="min-h-[120px] bg-stone-50 border-stone-200 focus:bg-white focus:border-[#0df2d7] focus:ring-[#0df2d7] transition-all resize-none text-base"
                        />

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                className="bg-[#00bbb6] hover:bg-[#00dcc3] text-white font-bold px-6 h-10 shadow-sm"
                                disabled={reviewMutation.isPending}
                            >
                                {reviewMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" /> Submit Review
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </div>

            {/* --- REVIEWS LIST --- */}
            <div className="space-y-6">
                <div className="flex items-baseline justify-between border-b border-stone-100 pb-2">
                    <h2 className="text-2xl font-bold text-stone-900 font-display">
                        Customer Reviews <span className="text-stone-400 text-lg font-normal">({reviews.length})</span>
                    </h2>
                </div>

                {reviews.length === 0 ? (
                    <div className="py-12 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200">
                        <p className="text-stone-500 italic">No reviews yet. Be the first to review!</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {reviews.map((review) => (
                            <div
                                key={review.review_id}
                                className="group flex gap-4 p-5 bg-white rounded-xl border border-stone-100 shadow-sm transition-all hover:shadow-md hover:border-[#0df2d7]/30"
                            >
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    <img
                                        src={review.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.name || 'User')}&background=random&color=fff`}
                                        alt={review.user?.name}
                                        className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-stone-100 shadow-sm group-hover:border-[#0df2d7]"
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex-1 space-y-1.5">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                        <h3 className="font-bold text-stone-900 text-sm md:text-base">
                                            {review.user?.name || 'Anonymous User'}
                                        </h3>
                                        <time className="text-xs text-stone-400 font-medium">
                                            {format(new Date(review.review_date), 'dd/MM/yyyy HH:mm')}
                                        </time>
                                    </div>

                                    {/* Rating Display */}
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={cn(
                                                    "w-3.5 h-3.5",
                                                    star <= review.rating
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-stone-200 fill-stone-100"
                                                )}
                                            />
                                        ))}
                                    </div>

                                    {/* Comment */}
                                    <p className="text-stone-600 leading-relaxed text-sm md:text-base pt-1">
                                        {review.comment}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}