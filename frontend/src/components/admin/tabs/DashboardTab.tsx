// src/components/admin/tabs/DashboardTab.tsx
import { useAdminStats } from '@/hooks/useAdmin';
import { DollarSign, UserPlus, ShoppingBag, TrendingUp, PackageOpen, MoreVertical, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
// Import Recharts
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// Import formatPrice util
import { formatPrice } from '@/lib/utils';

export function DashboardTab() {
    const { data: stats, isLoading, isError } = useAdminStats();

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

function StatCard({ title, value, trend, icon, bgIcon, trendColor }: any) {
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

function CategoryBar({ label, percent, color, width }: any) {
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

function TableRow({ order }: { order: any }) {
    const statusColors: any = {
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