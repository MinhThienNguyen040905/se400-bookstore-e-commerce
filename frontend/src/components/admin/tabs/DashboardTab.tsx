// src/components/admin/tabs/DashboardTab.tsx
import { useAdminAiInsights, useAdminStats } from '@/hooks/useAdmin';
import { AlertTriangle, Brain, DollarSign, UserPlus, ShoppingBag, TrendingUp, PackageOpen, MoreVertical, Loader2, ScaleIcon, Tags, LineChart } from 'lucide-react';
import { format } from 'date-fns';
// Import Recharts
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, LineChart as ReLineChart } from 'recharts';
// Import formatPrice util
import { formatPrice } from '@/lib/utils';
import { useState, type ReactNode } from 'react';

interface StatCardProps {
    title: string;
    value: string;
    trend: string;
    icon: ReactNode;
    bgIcon: string;
    trendColor: string;
}

interface CategoryBarProps {
    label: string;
    percent: string;
    color: string;
    width: string;
}

interface OrderRow {
    order_id: number;
    total_price: number;
    status: string;
    order_date: string;
    User?: { name?: string };
    OrderItems: Array<{ Book?: { title?: string } }>;
}

export function DashboardTab() {
    const { data: stats, isLoading, isError } = useAdminStats();
    const [windowDays, setWindowDays] = useState(7);
    const { data: aiInsights, isFetching: aiLoading } = useAdminAiInsights(windowDays);

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#0df2d7]" />
            </div>
        );
    }

    if (isError || !stats) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                Failed to load statistics data. Please try again later.
            </div>
        );
    }

    // Calculate Average Order Value
    const avgOrderValue = stats.totalOrders > 0
        ? stats.totalRevenue / stats.totalOrders
        : 0;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* HEADER - Download button removed */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold font-display text-stone-900">Dashboard Overview</h2>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Revenue"
                    value={formatPrice(stats.totalRevenue)} // VND Currency
                    trend="Year to date"
                    icon={<DollarSign className="w-6 h-6 text-green-700" />}
                    bgIcon="bg-green-100"
                    trendColor="text-green-700 bg-green-50"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders.toLocaleString('en-US')} // English number format (1,000)
                    trend="Lifetime"
                    icon={<ShoppingBag className="w-6 h-6 text-blue-700" />}
                    bgIcon="bg-blue-100"
                    trendColor="text-blue-700 bg-blue-50"
                />
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers.toLocaleString('en-US')} // English number format
                    trend="Customers"
                    icon={<UserPlus className="w-6 h-6 text-orange-700" />}
                    bgIcon="bg-orange-100"
                    trendColor="text-orange-700 bg-orange-50"
                />
                <StatCard
                    title="Avg. Order Value"
                    value={formatPrice(avgOrderValue)} // VND Currency
                    trend="Estimated"
                    icon={<TrendingUp className="w-6 h-6 text-[#009b8f]" />}
                    bgIcon="bg-[#0df2d7]/20"
                    trendColor="text-stone-600 bg-stone-100"
                />
            </div>

            {/* CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* REVENUE CHART */}
                <div className="lg:col-span-2 rounded-xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h3 className="text-stone-900 font-bold text-lg">Revenue Analytics</h3>
                            <p className="text-stone-500 text-sm">Monthly overview (Current Year)</p>
                        </div>
                        <div className="text-right">
                            <p className="text-stone-900 text-2xl font-bold leading-none">
                                {formatPrice(stats.totalRevenue)}
                            </p>
                        </div>
                    </div>
                    <div className="flex-1 w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0df2d7" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0df2d7" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    // Y-Axis formatting (1k, 2k...)
                                    tickFormatter={(value) => `${value >= 1000 ? value / 1000 + 'k' : value}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => [formatPrice(value), 'Revenue']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#0df2d7"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    activeDot={{ r: 6, fill: "#0df2d7", stroke: "#fff", strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* TOP CATEGORIES */}
                <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
                    <h3 className="text-stone-900 font-bold mb-6">Top Categories</h3>
                    <div className="flex flex-col gap-5">
                        <CategoryBar label="Fiction" percent="45%" color="bg-[#0df2d7]" width="45%" />
                        <CategoryBar label="Sci-Fi" percent="25%" color="bg-[#0df2d7]/80" width="25%" />
                        <CategoryBar label="Biography" percent="15%" color="bg-[#0df2d7]/60" width="15%" />
                        <CategoryBar label="History" percent="10%" color="bg-[#0df2d7]/40" width="10%" />
                        <CategoryBar label="Children" percent="5%" color="bg-[#0df2d7]/20" width="5%" />
                    </div>
                </div>
            </div>

            {/* ============== AI INSIGHTS SECTION ============== */}
            {/* Section header + window selector */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                    <Brain className="w-6 h-6 text-[#00796B]" />
                    <h2 className="text-xl font-bold font-display text-stone-900">AI Review Insights</h2>
                    {aiLoading && <Loader2 className="w-4 h-4 animate-spin text-stone-400" />}
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="text-stone-500">Window:</span>
                    {[7, 14, 30].map((d) => (
                        <button
                            key={d}
                            onClick={() => setWindowDays(d)}
                            className={`rounded-full px-3 py-1 transition-colors ${
                                windowDays === d
                                    ? 'bg-[#00796B] text-white shadow-sm'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                        >
                            {d}d
                        </button>
                    ))}
                </div>
            </div>

            {aiInsights && (
                <>
                    {/* Row 1: Sentiment trend (full width, chart) */}
                    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <LineChart className="w-5 h-5 text-[#00796B]" />
                            <h3 className="text-stone-900 font-bold">Sentiment trend ({aiInsights.window_days} days)</h3>
                        </div>
                        <div className="w-full h-[260px]">
                            {aiInsights.sentiment_trend.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <ReLineChart data={aiInsights.sentiment_trend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                        <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 11 }} />
                                        <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} allowDecimals={false} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="positive" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
                                        <Line type="monotone" dataKey="neutral" stroke="#78716c" strokeWidth={2} dot={{ r: 3 }} />
                                        <Line type="monotone" dataKey="negative" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
                                    </ReLineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-sm text-stone-400">
                                    Chưa có dữ liệu trend trong window này.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Row 2: Books needing attention + Rating-Sentiment Mismatch */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Negative trend books */}
                        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                <h3 className="text-stone-900 font-bold">Books needing attention</h3>
                                <span className="ml-auto text-xs text-stone-400">recent {aiInsights.window_days}d</span>
                            </div>
                            {aiInsights.negative_review_books.length > 0 ? (
                                <div className="space-y-2">
                                    {aiInsights.negative_review_books.slice(0, 6).map((book) => (
                                        <div key={book.book_id} className="flex items-center gap-3 rounded-lg bg-stone-50 px-3 py-2">
                                            {book.cover_image && (
                                                <img src={book.cover_image} alt="" className="w-9 h-12 object-cover rounded shadow-sm" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-stone-800 truncate">{book.title}</p>
                                                <p className="text-xs text-stone-500">
                                                    {book.negative_reviews_recent}/{book.analyzed_reviews_recent} negative gần đây
                                                    <span className="ml-2 text-stone-400">· avg sentiment {book.avg_sentiment}</span>
                                                </p>
                                            </div>
                                            <span className="text-xs font-bold text-red-700 bg-red-50 rounded-full px-2 py-0.5">
                                                {Math.round(book.negative_ratio_recent * 100)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-stone-500">Không có sách có pattern tiêu cực.</p>
                            )}
                        </div>

                        {/* Rating-Sentiment Mismatch — ⭐ minh chứng paper §5 */}
                        <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <ScaleIcon className="w-5 h-5 text-amber-600" />
                                <h3 className="text-stone-900 font-bold">Rating ↔ Sentiment mismatch</h3>
                                <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">
                                    paper §5
                                </span>
                            </div>
                            <p className="text-xs text-stone-500 mb-3">
                                Sách rating cao (≥4) nhưng sentiment trung bình âm — dấu hiệu rating giả/mỉa mai.
                            </p>
                            {aiInsights.rating_sentiment_mismatch.length > 0 ? (
                                <div className="space-y-2">
                                    {aiInsights.rating_sentiment_mismatch.slice(0, 6).map((book) => (
                                        <div key={book.book_id} className="flex items-center gap-3 rounded-lg bg-white border border-amber-100 px-3 py-2">
                                            {book.cover_image && (
                                                <img src={book.cover_image} alt="" className="w-9 h-12 object-cover rounded shadow-sm" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-stone-800 truncate">{book.title}</p>
                                                <p className="text-xs text-stone-500">
                                                    {book.analyzed_reviews} reviews
                                                </p>
                                            </div>
                                            <div className="text-xs text-right">
                                                <div className="font-bold text-green-700">★ {book.avg_rating}</div>
                                                <div className="font-bold text-red-700">≈ {book.avg_sentiment}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-stone-500">Chưa phát hiện mismatch.</p>
                            )}
                        </div>
                    </div>

                    {/* Row 3: Top genres + Top keywords + Suspicious */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Top positive genres */}
                        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                <h3 className="text-stone-900 font-bold">Top positive genres</h3>
                            </div>
                            <InsightMiniList
                                empty="Chưa có dữ liệu genre"
                                items={aiInsights.top_positive_genres.map((g) => ({
                                    key: g.genre_id,
                                    label: g.name,
                                    value: `sentiment ${g.avg_sentiment} · ${g.analyzed_reviews} reviews`,
                                }))}
                            />
                        </div>

                        {/* Top keywords */}
                        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Tags className="w-5 h-5 text-[#00796B]" />
                                <h3 className="text-stone-900 font-bold">Top keywords</h3>
                            </div>
                            {aiInsights.top_keywords.length > 0 ? (
                                <div className="space-y-2">
                                    {aiInsights.top_keywords.slice(0, 8).map((k) => (
                                        <div key={k.keyword} className="flex items-center gap-2">
                                            <span className="flex-1 text-sm text-stone-700 truncate font-medium">{k.keyword}</span>
                                            <KeywordSentimentBar pos={k.positive} neu={k.neutral} neg={k.negative} />
                                            <span className="text-xs text-stone-400 w-8 text-right">{k.count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-stone-500">Chưa có keyword nào.</p>
                            )}
                        </div>

                        {/* Suspicious reviews */}
                        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                                <h3 className="text-stone-900 font-bold">Suspicious reviews</h3>
                            </div>
                            {aiInsights.suspicious_reviews.length > 0 ? (
                                <div className="space-y-3">
                                    {aiInsights.suspicious_reviews.slice(0, 4).map((review) => (
                                        <div key={review.review_id} className="border-b border-stone-100 pb-3 last:border-0">
                                            <p className="text-sm font-semibold text-stone-800 truncate">
                                                {review.book?.title || 'Unknown book'}
                                            </p>
                                            <p className="text-xs text-stone-500 truncate italic">"{review.comment}"</p>
                                            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                                    review.spam_risk === 'high' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                                                }`}>
                                                    {review.spam_risk}
                                                </span>
                                                {review.spam_reasons?.slice(0, 2).map((r, i) => (
                                                    <span key={i} className="text-[10px] text-stone-400">· {r}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-stone-500">Không có review đáng ngờ.</p>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* RECENT ORDERS TABLE */}
            <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
                    <h3 className="text-[#111817] text-lg font-bold">Recent Orders</h3>
                    <button className="text-sm font-medium text-[#00796B] hover:text-[#00796B]/80">View all</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-stone-50">
                                <th className="px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wider">Items</th>
                                <th className="px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                            {stats.recentOrders.length > 0 ? (
                                stats.recentOrders.map((order) => (
                                    <TableRow key={order.order_id} order={order} />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-stone-500">
                                        <PackageOpen className="w-12 h-12 mx-auto mb-3 opacity-20 text-stone-900" />
                                        <p>No recent orders found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// --- SUB COMPONENTS ---

function StatCard({ title, value, trend, icon, bgIcon, trendColor }: StatCardProps) {
    return (
        <div className="flex flex-col gap-2 rounded-xl p-5 bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div className={`p-2 ${bgIcon} rounded-lg`}>{icon}</div>
                <span className={`${trendColor} px-2 py-0.5 rounded-full text-xs font-bold`}>{trend}</span>
            </div>
            <div>
                <p className="text-stone-500 text-sm font-medium mt-2">{title}</p>
                <p className="text-stone-900 text-2xl font-bold tracking-tight">{value}</p>
            </div>
        </div>
    );
}

function CategoryBar({ label, percent, color, width }: CategoryBarProps) {
    return (
        <div className="group">
            <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-stone-700">{label}</span>
                <span className="text-stone-500">{percent}</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2.5">
                <div className={`h-2.5 rounded-full ${color}`} style={{ width: width }}></div>
            </div>
        </div>
    );
}

function TableRow({ order }: { order: OrderRow }) {
    const statusColors: Record<string, string> = {
        delivered: "bg-green-100 text-green-800",
        processing: "bg-yellow-100 text-yellow-800",
        shipped: "bg-blue-100 text-blue-800",
        cancelled: "bg-red-100 text-red-800"
    };
    const style = statusColors[order.status] || "bg-gray-100 text-gray-800";

    const firstBook = order.OrderItems[0]?.Book?.title || "Unknown Book";
    const remainingCount = order.OrderItems.length - 1;
    const itemsDisplay = remainingCount > 0 ? `${firstBook} (+${remainingCount} others)` : firstBook;

    return (
        <tr className="hover:bg-stone-50 transition-colors">
            <td className="px-6 py-4 text-sm font-bold text-stone-900">#{order.order_id}</td>
            <td className="px-6 py-4 text-sm text-stone-600 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#0df2d7]/20 flex items-center justify-center text-xs font-bold text-[#009b8f]">
                    {order.User?.name?.charAt(0) || 'G'}
                </div>
                {order.User?.name || 'Guest'}
            </td>
            <td className="px-6 py-4 text-sm text-stone-900 max-w-[200px] truncate" title={itemsDisplay}>
                {itemsDisplay}
            </td>
            <td className="px-6 py-4 text-sm font-bold text-stone-900">
                {formatPrice(order.total_price)}
            </td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${style}`}>
                    {order.status}
                </span>
            </td>
            <td className="px-6 py-4 text-sm text-stone-500">
                {format(new Date(order.order_date), 'MMM dd, yyyy')}
            </td>
            <td className="px-6 py-4 text-right">
                <button className="text-stone-400 hover:text-[#00796B] transition-colors">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </td>
        </tr>
    );
}

function InsightMiniList({
    title,
    empty,
    items
}: {
    title?: string;
    empty: string;
    items: Array<{ key: number; label: string; value: string }>;
}) {
    return (
        <div className="space-y-3">
            {title && <h4 className="text-sm font-bold text-stone-700">{title}</h4>}
            {items.length > 0 ? (
                <div className="space-y-2">
                    {items.slice(0, 5).map((item) => (
                        <div key={item.key} className="rounded-lg bg-stone-50 px-3 py-2">
                            <p className="text-sm font-semibold text-stone-800 truncate">{item.label}</p>
                            <p className="text-xs text-stone-500">{item.value}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-stone-500">{empty}</p>
            )}
        </div>
    );
}

// Stacked bar nhỏ thể hiện phân bố sentiment của 1 keyword
function KeywordSentimentBar({ pos, neu, neg }: { pos: number; neu: number; neg: number }) {
    const total = pos + neu + neg;
    if (total === 0) return <div className="w-20 h-2 bg-stone-100 rounded" />;
    const pp = (pos / total) * 100;
    const np = (neu / total) * 100;
    const ng = (neg / total) * 100;
    return (
        <div className="w-20 h-2 bg-stone-100 rounded overflow-hidden flex" title={`+${pos} /0${neu} /-${neg}`}>
            <span className="bg-green-500" style={{ width: `${pp}%` }} />
            <span className="bg-stone-400" style={{ width: `${np}%` }} />
            <span className="bg-red-500" style={{ width: `${ng}%` }} />
        </div>
    );
}
