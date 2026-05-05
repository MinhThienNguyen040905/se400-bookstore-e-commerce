// src/components/admin/tabs/BooksTab.tsx
import { useState } from 'react';
import { useAdminBooks, useBookMutations } from '@/hooks/useAdminBooks';
import type { Book } from '@/hooks/useAdminBooks';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search, Plus, Trash2, Edit, AlertTriangle, PackageOpen } from 'lucide-react';
import { BookModal } from '../books/BookModal';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';

export function BooksTab() {
    const [page, setPage] = useState(1);
    const limit = 8;
    const { data, isLoading, isError } = useAdminBooks(page, limit);
    const { add, update, remove } = useBookMutations();

    // State Modal
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // State Delete
    const [bookToDelete, setBookToDelete] = useState<number | null>(null);

    // Xử lý mở Modal Add
    const handleOpenAdd = () => {
        setSelectedBook(null); // Null = Add Mode
        setIsModalOpen(true);
    };

    // Xử lý mở Modal Edit/View
    const handleOpenEdit = (book: Book) => {
        setSelectedBook(book);
        setIsModalOpen(true);
    };

    // Xử lý Save (Add or Update)
    const handleSave = async (id: number | null, formData: FormData) => {
        if (id) {
            await update.mutateAsync({ id, formData });
        } else {
            await add.mutateAsync(formData);
        }
    };

    // Xử lý Delete
    const handleDelete = async () => {
        if (bookToDelete) {
            await remove.mutateAsync(bookToDelete);
            setBookToDelete(null);
        }
    };

    if (isLoading) return <div className="p-12 text-center text-stone-500">Loading books...</div>;
    if (isError) return <div className="p-12 text-center text-red-500">Failed to load books.</div>;

    const { books, pagination } = data || { books: [], pagination: { totalPages: 1, currentPage: 1 } };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header Actions */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold font-display text-stone-900">Book Management</h2>
                    <p className="text-stone-500 text-sm mt-1">Total: {pagination.totalItems} books</p>
                </div>
                <Button onClick={handleOpenAdd} className="bg-[#0df2d7] text-stone-900 font-bold hover:bg-[#00dcc3]">
                    <Plus className="w-5 h-5 mr-2" /> Add Book
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-stone-50 border-b border-stone-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase">Book</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase">Publisher</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase">Price</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase">Stock</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {books.map((book) => (
                                <tr key={book.book_id} className="hover:bg-stone-50 transition-colors group cursor-pointer" onClick={() => handleOpenEdit(book)}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-8 bg-stone-200 rounded overflow-hidden shrink-0 border border-stone-200">
                                                {book.cover_image && <img src={book.cover_image} alt="" className="w-full h-full object-cover" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-stone-900 text-sm line-clamp-1 max-w-[200px]">{book.title}</p>
                                                <p className="text-stone-500 text-xs mt-0.5 line-clamp-1 max-w-[200px]">
                                                    {book.Authors?.map(a => a.name).join(', ') || 'No Author'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-stone-600">{book.Publisher?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-stone-900">{formatPrice(book.price)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${book.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {book.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(book)} className="h-8 w-8 text-stone-400 hover:text-[#009b8f]">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => setBookToDelete(book.book_id)} className="h-8 w-8 text-stone-400 hover:text-red-600 hover:bg-red-50">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-stone-200 bg-stone-50">
                    <span className="text-xs text-stone-500">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline" size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline" size="sm"
                            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                            disabled={page === pagination.totalPages}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* --- MAIN MODAL (Add/Edit/View) --- */}
            <BookModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                book={selectedBook}
                onSave={handleSave}
                isSaving={add.isPending || update.isPending}
            />

            {/* --- DELETE CONFIRMATION --- */}
            {bookToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full animate-in zoom-in-95">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <div className="p-2 bg-red-50 rounded-full"><AlertTriangle className="w-6 h-6" /></div>
                            <h3 className="text-lg font-bold">Delete Book?</h3>
                        </div>
                        <p className="text-stone-600 mb-6 text-sm">Are you sure? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setBookToDelete(null)}>Cancel</Button>
                            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-bold" disabled={remove.isPending}>
                                {remove.isPending ? 'Deleting...' : 'Yes, Delete'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}