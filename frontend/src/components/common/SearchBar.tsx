import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { useBookSearch } from '@/hooks/useBookSearch';
import type { SearchBook } from '@/hooks/useBookSearch';
import { cn, formatPrice } from '@/lib/utils';

export function SearchBar() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // 1. Debounce từ khóa (300ms)
    const debouncedTerm = useDebounce(searchTerm, 300);

    // 2. Gọi API tìm kiếm
    const { data: books, isLoading } = useBookSearch(debouncedTerm);

    // 3. Xử lý click ra ngoài để đóng dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 4. Mở dropdown khi có kết quả hoặc đang loading
    useEffect(() => {
        if (debouncedTerm && (isLoading || (books && books.length > 0))) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [debouncedTerm, books, isLoading]);

    // 5. Chuyển hướng khi chọn sách
    const handleSelectBook = (bookId: number) => {
        setIsOpen(false);
        setSearchTerm(''); // Xóa từ khóa sau khi chọn
        navigate(`/book/${bookId}`);
    };

    return (
        <div ref={wrapperRef} className="relative w-full max-w-md">
            {/* Input Field */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                    type="search"
                    placeholder="Search books..."
                    className="w-full pl-10 pr-10 rounded-full border-stone-200 bg-stone-50 focus:bg-white transition-all focus:ring-2 focus:ring-[#0df2d7] focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => { if (searchTerm) setIsOpen(true); }}
                />
                {/* Nút xóa text hoặc loading icon */}
                {isLoading ? (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#0df2d7]" />
                ) : searchTerm && (
                    <button
                        onClick={() => { setSearchTerm(''); setIsOpen(false); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Dropdown Results */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-stone-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    {books && books.length > 0 ? (
                        <div className="py-2">
                            <div className="px-4 py-2 text-xs font-bold text-stone-400 uppercase tracking-wider">
                                Suggestions
                            </div>
                            {books.map((book: SearchBook) => (
                                <div
                                    key={book.book_id}
                                    onClick={() => handleSelectBook(book.book_id)}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 cursor-pointer transition-colors border-b border-stone-50 last:border-0"
                                >
                                    {/* Ảnh nhỏ */}
                                    <div className="w-10 h-14 bg-stone-200 rounded overflow-hidden flex-shrink-0">
                                        <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
                                    </div>

                                    {/* Thông tin */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-stone-900 truncate">{book.title}</h4>
                                        <p className="text-xs text-stone-500 truncate">{book.authors}</p>
                                    </div>

                                    {/* Giá tiền */}
                                    <div className="font-bold text-sm text-[#009b8f]">
                                        {formatPrice(book.price)}
                                    </div>
                                </div>
                            ))}

                            {/* Nút xem tất cả kết quả */}
                            {/* <div
                                onClick={() => {
                                    navigate(`/?search=${searchTerm}`); // Giả sử trang chủ lọc được search
                                    setIsOpen(false);
                                }}
                                className="block px-4 py-3 text-center text-sm font-bold text-[#009b8f] bg-stone-50 hover:bg-[#0df2d7]/10 cursor-pointer transition-colors"
                            >
                                View all results for "{searchTerm}"
                            </div> */}
                        </div>
                    ) : !isLoading && (
                        <div className="p-6 text-center text-stone-500 text-sm">
                            No books found matching "{searchTerm}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}