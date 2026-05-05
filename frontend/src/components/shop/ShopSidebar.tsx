// src/components/shop/ShopSidebar.tsx
import { useSearchParams } from 'react-router-dom';
import { useShopGenres, useShopAuthors } from '@/hooks/useShop';
import { Star, X, Filter, Check } from 'lucide-react'; // Thêm icon Check
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ShopSidebarProps {
    className?: string;
    onClose?: () => void;
}

export function ShopSidebar({ className, onClose }: ShopSidebarProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const { data: genresData } = useShopGenres();
    const { data: authorsData } = useShopAuthors();

    // Xử lý dữ liệu an toàn
    const genres = Array.isArray(genresData) ? genresData : (genresData?.genres || []);
    const authors = Array.isArray(authorsData) ? authorsData : (authorsData?.authors || []);

    const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');

    // Hàm cập nhật URL Params chung
    const updateParam = (key: string, value: string | null) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) newParams.set(key, value);
        else newParams.delete(key);
        newParams.set('page', '1'); // Reset về trang 1 khi filter thay đổi
        setSearchParams(newParams);
    };

    // Hàm xử lý chọn nhiều (Multi-select) cho cả Genre và Author
    const handleMultiSelect = (key: string, id: number) => {
        const current = searchParams.get(key)?.split(',').filter(Boolean) || [];
        const idStr = id.toString();

        // Nếu đã chọn thì bỏ chọn, ngược lại thì thêm vào
        const newValues = current.includes(idStr)
            ? current.filter(i => i !== idStr)
            : [...current, idStr];

        // Cập nhật lại URL (nối bằng dấu phẩy)
        updateParam(key, newValues.join(','));
    };

    const handlePriceApply = () => {
        const newParams = new URLSearchParams(searchParams);
        if (minPrice) newParams.set('min_price', minPrice); else newParams.delete('min_price');
        if (maxPrice) newParams.set('max_price', maxPrice); else newParams.delete('max_price');
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    return (
        <div className={cn("space-y-8 pb-10", className)}>
            {/* Mobile Header */}
            <div className="flex justify-between items-center lg:hidden mb-6 pb-4 border-b border-stone-100">
                <h2 className="text-xl font-bold font-display flex items-center gap-2 text-stone-900">
                    <Filter className="w-5 h-5 text-[#008080]" /> Filters
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                    <X className="w-6 h-6 text-stone-500" />
                </button>
            </div>

            {/* 1. Price Range */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 border-l-4 border-[#008080] pl-3">Price Range</h3>
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs"></span> 
                        {/* // ẩn vnd */}
                        <input
                            type="number" placeholder="0"
                            className="w-full rounded-md border-stone-200 text-sm py-2 pl-6 pr-2 focus:ring-[#008080] focus:border-[#008080] bg-stone-50"
                            value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                        />
                    </div>
                    <span className="text-stone-300">-</span>
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs"></span> 
                         {/* ẩn vnd */}
                        <input
                            type="number" placeholder="Max"
                            className="w-full rounded-md border-stone-200 text-sm py-2 pl-6 pr-2 focus:ring-[#008080] focus:border-[#008080] bg-stone-50"
                            value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                        />
                    </div>
                </div>
                <Button onClick={handlePriceApply} size="sm" className="w-full bg-[#008080] hover:bg-[#006666] text-white font-bold h-8">
                    Apply Filter
                </Button>
            </div>

            {/* 2. Genres (Multi-Select Checkbox) */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 border-l-4 border-[#008080] pl-3">Genres</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {genres.length > 0 ? genres.map((g: any) => {
                        const isChecked = searchParams.get('genre')?.split(',').includes(g.genre_id.toString());
                        return (
                            <label key={g.genre_id} className="flex items-center gap-3 cursor-pointer group py-1">
                                <div className={cn(
                                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                    isChecked ? "bg-[#008080] border-[#008080]" : "border-stone-300 bg-white group-hover:border-[#008080]"
                                )}>
                                    {isChecked && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <input
                                    type="checkbox" className="hidden"
                                    checked={isChecked || false}
                                    onChange={() => handleMultiSelect('genre', g.genre_id)}
                                />
                                <span className={cn("text-sm transition-colors", isChecked ? "text-[#008080] font-medium" : "text-stone-600 group-hover:text-[#008080]")}>
                                    {g.name}
                                </span>
                            </label>
                        )
                    }) : <p className="text-stone-400 text-xs italic">Loading genres...</p>}
                </div>
            </div>

            {/* 3. Authors (Multi-Select Checkbox - ĐÃ SỬA TỪ SELECT SANG CHECKBOX) */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 border-l-4 border-[#008080] pl-3">Authors</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {authors.length > 0 ? authors.map((a: any) => {
                        // Logic kiểm tra xem tác giả này có đang được chọn trên URL không
                        const isChecked = searchParams.get('author')?.split(',').includes(a.author_id.toString());
                        return (
                            <label key={a.author_id} className="flex items-center gap-3 cursor-pointer group py-1">
                                <div className={cn(
                                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                    isChecked ? "bg-[#008080] border-[#008080]" : "border-stone-300 bg-white group-hover:border-[#008080]"
                                )}>
                                    {isChecked && <Check className="w-3 h-3 text-white" />}
                                </div>
                                {/* Gọi hàm handleMultiSelect với key là 'author' */}
                                <input
                                    type="checkbox" className="hidden"
                                    checked={isChecked || false}
                                    onChange={() => handleMultiSelect('author', a.author_id)}
                                />
                                <span className={cn("text-sm transition-colors", isChecked ? "text-[#008080] font-medium" : "text-stone-600 group-hover:text-[#008080]")}>
                                    {a.name}
                                </span>
                            </label>
                        )
                    }) : <p className="text-stone-400 text-xs italic">Loading authors...</p>}
                </div>
            </div>

            {/* 4. Rating */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 border-l-4 border-[#008080] pl-3">Rating</h3>
                <div className="flex flex-col gap-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                        const isActive = Number(searchParams.get('rating')) === star;
                        return (
                            <div
                                key={star}
                                className={cn(
                                    "flex items-center cursor-pointer px-2 py-1.5 rounded-md transition-colors",
                                    isActive ? "bg-[#008080]/10" : "hover:bg-stone-50"
                                )}
                                onClick={() => updateParam('rating', star.toString())}
                            >
                                <div className="flex text-yellow-400 mr-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className="w-4 h-4"
                                            fill={i < star ? "currentColor" : "none"}
                                            strokeWidth={1.5}
                                            color={i < star ? "currentColor" : "#e5e7eb"}
                                        />
                                    ))}
                                </div>
                                <span className={cn("text-sm", isActive ? "text-[#008080] font-bold" : "text-stone-500")}>
                                    {star === 5 ? "" : "& Up"}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Clear Filters */}
            <button
                onClick={() => setSearchParams({})}
                className="w-full py-2 text-sm text-stone-500 hover:text-red-500 border border-dashed border-stone-300 hover:border-red-300 rounded-md transition-colors"
            >
                Reset All Filters
            </button>
        </div>
    );
}