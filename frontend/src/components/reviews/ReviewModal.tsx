// src/components/reviews/ReviewModal.tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReview, type CreateReviewBody } from '@/api/reviewApi';
import { showToast } from '@/lib/toast';

interface ReviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bookId: number;
    bookTitle: string;
    bookCover: string;
}

export function ReviewModal({ open, onOpenChange, bookId, bookTitle, bookCover }: ReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const queryClient = useQueryClient();

    const createReviewMutation = useMutation({
        mutationFn: (body: CreateReviewBody) => createReview(body),
        onSuccess: () => {
            showToast.success('Đánh giá của bạn đã được gửi thành công!');
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['book', bookId] });
            onOpenChange(false);
            // Reset form
            setRating(5);
            setComment('');
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Không thể gửi đánh giá';
            showToast.error(message);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) {
            showToast.error('Vui lòng nhập nội dung đánh giá');
            return;
        }
        createReviewMutation.mutate({
            book_id: bookId,
            rating,
            comment: comment.trim()
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Viết đánh giá</DialogTitle>
                    <DialogDescription>
                        Chia sẻ trải nghiệm của bạn về cuốn sách này
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Book Info */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <img 
                            src={bookCover} 
                            alt={bookTitle}
                            className="w-16 h-20 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{bookTitle}</h4>
                        </div>
                    </div>

                    {/* Star Rating */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Đánh giá của bạn</label>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        className={`w-8 h-8 ${
                                            star <= (hoveredRating || rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                </button>
                            ))}
                            <span className="ml-2 text-sm text-gray-600">
                                {rating === 1 && 'Rất tệ'}
                                {rating === 2 && 'Tệ'}
                                {rating === 3 && 'Bình thường'}
                                {rating === 4 && 'Tốt'}
                                {rating === 5 && 'Rất tốt'}
                            </span>
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <label htmlFor="comment" className="text-sm font-medium">
                            Nội dung đánh giá <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                            id="comment"
                            placeholder="Chia sẻ suy nghĩ của bạn về cuốn sách này..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={5}
                            className="resize-none"
                        />
                        <p className="text-xs text-gray-500">
                            {comment.length}/500 ký tự
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={createReviewMutation.isPending}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={createReviewMutation.isPending || !comment.trim()}
                        >
                            {createReviewMutation.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

