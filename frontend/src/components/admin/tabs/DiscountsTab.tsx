// src/components/admin/tabs/DiscountsTab.tsx
import { useState } from 'react';
import { useAllPromos, useActivePromos, usePromoMutations } from '@/hooks/useAdminPromos';
import type { PromoCode } from '@/hooks/useAdminPromos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Plus, Tag, Calendar, Percent, ChevronLeft, ChevronRight,
    Filter, X, Save, Loader2, CheckCircle, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { cn, formatPrice } from '@/lib/utils';

export function DiscountsTab() {
    // State
    const [filter, setFilter] = useState<'all' | 'active'>('all'); // Bộ lọc: 'all' hoặc 'active'
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Queries
    // Gọi hook tương ứng dựa trên filter
    const {
        data: allData,
        isLoading: isLoadingAll
    } = useAllPromos(page, itemsPerPage, filter === 'all');

    const {
        data: activeData,
        isLoading: isLoadingActive
    } = useActivePromos(filter === 'active');

    const { mutate: addPromo, isPending: isAdding } = usePromoMutations();

    // Xác định dữ liệu hiển thị hiện tại
    const displayPromos = filter === 'all' ? allData?.promos || [] : activeData || [];
    const isLoading = filter === 'all' ? isLoadingAll : isLoadingActive;
    const pagination = allData?.pagination;

    // Helper check hết hạn (cho danh sách All)
    const isExpired = (dateString: string) => new Date(dateString) < new Date();

    // Modal Handler
    const handleSave = (data: any) => {
        addPromo(data, {
            onSuccess: () => setIsModalOpen(false)
        });
    };

    if (isLoading) return <div className="p-12 text-center text-stone-500">Loading promotions...</div>;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* HEADER: Title & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-display text-stone-900">Discount Codes</h2>
                    <p className="text-stone-500 text-sm mt-1">Manage your store's promo codes</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* FILTER BUTTONS */}
                    <div className="flex bg-stone-100 p-1 rounded-lg border border-stone-200">
                        <button
                            onClick={() => setFilter('all')}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                                filter === 'all' ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-900"
                            )}
                        >
                            <Tag className="w-4 h-4" /> All
                        </button>
                        <button
                            onClick={() => setFilter('active')}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                                filter === 'active' ? "bg-white text-[#009b8f] shadow-sm" : "text-stone-500 hover:text-stone-900"
                            )}
                        >
                            <CheckCircle className="w-4 h-4" /> Active Only
                        </button>
                    </div>

                    <Button onClick={() => setIsModalOpen(true)} className="bg-[#0df2d7] text-stone-900 font-bold hover:bg-[#00dcc3]">
                        <Plus className="w-5 h-5 mr-1" /> Create Promo
                    </Button>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-stone-50 border-b border-stone-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase">Code</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase">Discount</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase">Min Order</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase">Expiry Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {displayPromos.length > 0 ? (
                                displayPromos.map((promo) => {
                                    const expired = isExpired(promo.expiry_date);
                                    return (
                                        <tr key={promo.promo_id} className="hover:bg-stone-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-1 rounded text-sm border border-stone-200">
                                                    {promo.code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-stone-900">
                                                <div className="flex items-center gap-1 text-[#009b8f]">
                                                    <Percent className="w-3 h-3" /> {promo.discount_percent}%
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-stone-600">
                                                {formatPrice(promo.min_amount)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-stone-600">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                                                    {format(new Date(promo.expiry_date), 'dd MMM yyyy')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {expired ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Expired
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-stone-500">
                                        No promo codes found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION (Chỉ hiện khi ở tab ALL) */}
                {filter === 'all' && pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-stone-200 bg-stone-50">
                        <span className="text-xs text-stone-500">
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline" size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline" size="sm"
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- ADD PROMO MODAL --- */}
            <AddPromoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                isSaving={isAdding}
            />

        </div>
    );
}

// --- SUB-COMPONENT: ADD MODAL ---
function AddPromoModal({ isOpen, onClose, onSave, isSaving }: { isOpen: boolean, onClose: () => void, onSave: (data: any) => void, isSaving: boolean }) {
    const [formData, setFormData] = useState({
        code: '',
        discount_percent: '',
        min_amount: '',
        expiry_date: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            discount_percent: Number(formData.discount_percent),
            min_amount: Number(formData.min_amount)
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-stone-100 bg-stone-50">
                    <h2 className="text-xl font-bold font-display text-stone-900">Create New Promo</h2>
                    <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full text-stone-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <form id="promo-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Promo Code</Label>
                            <Input
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} // Auto Uppercase
                                placeholder="e.g., SUMMER2025"
                                className="uppercase font-mono"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Discount (%)</Label>
                                <Input
                                    type="number"
                                    min="1" max="100"
                                    value={formData.discount_percent}
                                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label>Min Order (VND)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.min_amount}
                                    onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Expiry Date</Label>
                            <Input
                                type="date"
                                value={formData.expiry_date}
                                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                required
                            />
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" form="promo-form" className="bg-[#0df2d7] text-stone-900 font-bold hover:bg-[#00dcc3]" disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Create Code
                    </Button>
                </div>
            </div>
        </div>
    );
}