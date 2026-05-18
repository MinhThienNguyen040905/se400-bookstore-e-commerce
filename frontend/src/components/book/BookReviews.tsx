import { useState } from 'react';
import { Star, Send, Loader2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Review, AspectLabel, SentimentLabel } from '@/types/Review';
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

const sentimentStyles = {
    positive: 'bg-green-50 text-green-700 border-green-100',
    neutral: 'bg-stone-50 text-stone-600 border-stone-100',
    negative: 'bg-red-50 text-red-700 border-red-100',
};

const sentimentText = {
    positive: 'Positive',
    neutral: 'Neutral',
    negative: 'Negative',
};

const ASPECT_LABELS: Record<keyof NonNullable<Review['analysis']>['aspects'] & string, string> = {
    content_quality: 'Nội dung',
    translation: 'Dịch thuật',
    print_quality: 'Chất lượng in',
    shipping: 'Giao hàng',
    price_value: 'Giá trị',
};

const aspectStyles: Record<AspectLabel, string> = {
    positive: 'bg-green-50 text-green-700 border-green-200',
    neutral: 'bg-stone-50 text-stone-600 border-stone-200',
    negative: 'bg-red-50 text-red-700 border-red-200',
    none: 'bg-stone-50 text-stone-400 border-stone-100 line-through',
};

const sourceStyles: Record<SentimentLabel, string> = {
    positive: 'text-green-700',
    neutral: 'text-stone-600',
    negative: 'text-red-700',
};

const spamStyles = {
    low: 'bg-stone-100 text-stone-600',
    medium: 'bg-amber-50 text-amber-700 border border-amber-200',
    high: 'bg-red-50 text-red-700 border border-red-200',
} as const;

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
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string; msg?: string }; status?: number } };
            const msg = err.response?.data?.message || err.response?.data?.msg || 'Failed to submit review';

            // Handle specific backend errors
            if (msg.toLowerCase().includes('already reviewed')) {
                showToast.error('You have already reviewed this book.');
                // Refresh to update UI state if needed
                queryClient.invalidateQueries({ queryKey: ['book', bookId] });
            }
            else if (err.response?.status === 403) {
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
                        {[...reviews]
                            .sort((a, b) => {
                                const aMine = user && a.user?.user_id === user.user_id ? 1 : 0;
                                const bMine = user && b.user?.user_id === user.user_id ? 1 : 0;
                                return bMine - aMine;
                            })
                            .map((review) => {
                            const isMine = user ? review.user?.user_id === user.user_id : false;
                            return (
                            <div
                                key={review.review_id}
                                className={cn(
                                    "group flex gap-4 p-5 rounded-xl border shadow-sm transition-all hover:shadow-md",
                                    isMine
                                        ? "bg-[#00bbb6]/5 border-[#00bbb6]/40 ring-1 ring-[#00bbb6]/20"
                                        : "bg-white border-stone-100 hover:border-[#0df2d7]/30"
                                )}
                            >
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    <img
                                        src={review.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.name || 'User')}&background=random&color=fff`}
                                        alt={review.user?.name}
                                        className={cn(
                                            "w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 shadow-sm",
                                            isMine
                                                ? "border-[#00bbb6]"
                                                : "border-stone-100 group-hover:border-[#0df2d7]"
                                        )}
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex-1 space-y-1.5">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-stone-900 text-sm md:text-base">
                                                {review.user?.name || 'Anonymous User'}
                                            </h3>
                                            {isMine && (
                                                <span className="inline-flex items-center rounded-full bg-[#00bbb6] text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                                                    Bạn
                                                </span>
                                            )}
                                        </div>
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
                                        {review.analysis?.sentiment_label && (
                                            <span className={cn(
                                                "ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold",
                                                sentimentStyles[review.analysis.sentiment_label]
                                            )}>
                                                {sentimentText[review.analysis.sentiment_label]}
                                            </span>
                                        )}
                                    </div>

                                    {/* Comment */}
                                    <p className="text-stone-600 leading-relaxed text-sm md:text-base pt-1">
                                        {review.comment}
                                    </p>
                                    {review.analysis?.summary && (
                                        <p className="text-xs text-stone-500 bg-stone-50 rounded-lg px-3 py-2 italic">
                                            "{review.analysis.summary}"
                                        </p>
                                    )}

                                    {/* AI analysis details — minh chứng paper §2.1 (aspect) + §4.4 (ensemble) + §5 (spam) */}
                                    {review.analysis && <AnalysisPanel analysis={review.analysis} />}
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}

// ---------- AI Analysis Panel ----------
// Hiển thị aspects, ensemble_agreement, ensemble_sources, spam_risk
// (đối ứng full output từ ReviewAnalysisService + ensembleVote)
function AnalysisPanel({ analysis }: { analysis: NonNullable<Review['analysis']> }) {
    const aspects = analysis.aspects || {};
    const meaningfulAspects = (Object.entries(aspects) as Array<[string, AspectLabel]>)
        .filter(([, label]) => label && label !== 'none');
    const agreement = analysis.ensemble_agreement;
    const sources = analysis.ensemble_sources;
    const showSpam = analysis.spam_risk && analysis.spam_risk !== 'low';

    if (!meaningfulAspects.length && agreement == null && !sources && !showSpam && !analysis.signals?.length) {
        return null;
    }

    return (
        <div className="mt-2 space-y-2 rounded-lg border border-stone-100 bg-linear-to-br from-stone-50/60 to-white p-3 text-xs">
            {/* Aspects */}
            {meaningfulAspects.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-stone-500 mr-1">Aspects:</span>
                    {meaningfulAspects.map(([key, label]) => (
                        <span
                            key={key}
                            className={cn(
                                "rounded-full border px-2 py-0.5 font-medium",
                                aspectStyles[label]
                            )}
                        >
                            {ASPECT_LABELS[key as keyof typeof ASPECT_LABELS] || key}: {label}
                        </span>
                    ))}
                </div>
            )}

            {/* Signals (keywords) */}
            {analysis.signals && analysis.signals.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-stone-500 mr-1">Signals:</span>
                    {analysis.signals.slice(0, 6).map((s, i) => (
                        <span key={i} className="rounded bg-stone-100 px-1.5 py-0.5 text-stone-600">
                            {s}
                        </span>
                    ))}
                </div>
            )}

            {/* Ensemble vote */}
            {(agreement != null || sources) && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-stone-500">Ensemble vote:</span>
                    {sources && (
                        <div className="flex items-center gap-1.5">
                            {(['groq', 'rule', 'rating'] as const).map((key) => {
                                const lbl = sources[key];
                                if (!lbl) return (
                                    <span key={key} className="text-stone-300">
                                        {key}=<span className="italic">off</span>
                                    </span>
                                );
                                return (
                                    <span key={key} className="text-stone-500">
                                        {key}=<span className={cn("font-bold", sourceStyles[lbl])}>{lbl}</span>
                                    </span>
                                );
                            })}
                        </div>
                    )}
                    {agreement != null && (
                        <span
                            className={cn(
                                "ml-auto rounded-full px-2 py-0.5 font-bold",
                                agreement >= 0.8 ? "bg-green-50 text-green-700"
                                    : agreement >= 0.6 ? "bg-amber-50 text-amber-700"
                                        : "bg-red-50 text-red-700"
                            )}
                            title={agreement < 0.6 ? "Đồng thuận thấp — admin nên xem lại" : "Đồng thuận cao"}
                        >
                            agreement {(agreement * 100).toFixed(0)}%
                        </span>
                    )}
                </div>
            )}

            {/* Spam */}
            {showSpam && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span
                        className={cn(
                            "rounded-full px-2 py-0.5 font-bold uppercase tracking-wide",
                            spamStyles[analysis.spam_risk!]
                        )}
                    >
                        spam {analysis.spam_risk}
                    </span>
                    {analysis.spam_reasons?.slice(0, 3).map((r, i) => (
                        <span key={i} className="text-stone-500 italic">· {r}</span>
                    ))}
                </div>
            )}

            {/* Provider */}
            {analysis.provider && (
                <div className="text-[10px] text-stone-400 pt-1">
                    Provider: {analysis.provider}{analysis.model ? ` (${analysis.model})` : ''}
                </div>
            )}
        </div>
    );
}
