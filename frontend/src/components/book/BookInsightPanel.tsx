import type { BookInsight } from '@/types/book';
import { Brain, ThumbsDown, ThumbsUp } from 'lucide-react';
import type { ReactNode } from 'react';

interface BookInsightPanelProps {
    insight?: BookInsight;
    isLoading?: boolean;
}

const totalSentiment = (insight: BookInsight) => (
    insight.sentiment_distribution.positive +
    insight.sentiment_distribution.neutral +
    insight.sentiment_distribution.negative
);

const percent = (value: number, total: number) => total > 0 ? Math.round((value / total) * 100) : 0;

export function BookInsightPanel({ insight, isLoading }: BookInsightPanelProps) {
    if (isLoading) {
        return <div className="h-32 bg-white border border-stone-100 rounded-xl animate-pulse" />;
    }

    if (!insight || insight.review_count === 0) return null;

    const total = totalSentiment(insight);
    const positivePercent = percent(insight.sentiment_distribution.positive, total);
    const neutralPercent = percent(insight.sentiment_distribution.neutral, total);
    const negativePercent = percent(insight.sentiment_distribution.negative, total);

    return (
        <section className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#00796B]/10 text-[#00796B]">
                    <Brain className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-[#2F4F4F]">Review insights</h3>
                    <p className="text-sm text-stone-600 leading-relaxed">{insight.summary}</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                <div className="rounded-lg bg-green-50 text-green-700 px-3 py-2">Positive {positivePercent}%</div>
                <div className="rounded-lg bg-stone-50 text-stone-600 px-3 py-2">Neutral {neutralPercent}%</div>
                <div className="rounded-lg bg-red-50 text-red-700 px-3 py-2">Negative {negativePercent}%</div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <InsightList icon={<ThumbsUp className="w-4 h-4" />} title="Readers liked" items={insight.positive_points} color="text-green-700" />
                <InsightList icon={<ThumbsDown className="w-4 h-4" />} title="Watch-outs" items={insight.negative_points} color="text-red-700" />
            </div>

            {insight.recommendation_hint && (
                <p className="text-sm text-stone-600 border-t border-stone-100 pt-4">
                    {insight.recommendation_hint}
                </p>
            )}
        </section>
    );
}

function InsightList({ icon, title, items, color }: { icon: ReactNode; title: string; items: string[]; color: string }) {
    return (
        <div className="space-y-2">
            <div className={`flex items-center gap-2 text-sm font-bold ${color}`}>
                {icon}
                <span>{title}</span>
            </div>
            {items.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                        <span key={item} className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-xs">
                            {item}
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-stone-400">No clear pattern yet.</p>
            )}
        </div>
    );
}
