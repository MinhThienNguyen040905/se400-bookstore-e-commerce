// src/components/admin/tabs/GenresTab.tsx
import { useState, useEffect } from 'react';
import { useGenres, useGenreMutations } from '@/hooks/useAdminGenres';
import type { Genre } from '@/hooks/useAdminGenres';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight,
    List, X, Save, AlertTriangle, Loader2
} from 'lucide-react';

export function GenresTab() {
    const { data: genres = [], isLoading, isError } = useGenres();
    const { add, update, remove } = useGenreMutations();

    // State Table & Pagination
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 8; // Số dòng mỗi trang

    // State Modal (Add/Edit)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGenre, setEditingGenre] = useState<Genre | null>(null); // Null = Add Mode

    // State Delete
    const [genreToDelete, setGenreToDelete] = useState<number | null>(null);

    // --- LOGIC FILTER & PAGINATION ---
    const filteredGenres = genres.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredGenres.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const currentGenres = filteredGenres.slice(startIndex, startIndex + itemsPerPage);

    // Reset trang về 1 khi search
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    // --- HANDLERS ---
    const handleOpenAdd = () => {
        setEditingGenre(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (genre: Genre) => {
        setEditingGenre(genre);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (genreToDelete) {
            // Hàm remove sẽ tự catch lỗi và hiện toast nếu backend trả về lỗi ràng buộc
            await remove.mutateAsync(genreToDelete);
            setGenreToDelete(null);
        }
    };

    if (isLoading) return <div className="p-12 text-center text-stone-500">Loading genres...</div>;
    if (isError) return <div className="p-12 text-center text-red-500">Failed to load genres.</div>;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-display text-stone-900">Genre Management</h2>
                    <p className="text-stone-500 text-sm mt-1">Total: {genres.length} genres</p>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <Input
                            placeholder="Search genres..."
                            className="pl-9 bg-white border-stone-200"
                            value={search}
                            onChange={handleSearch}
                        />
                    </div>
                    <Button onClick={handleOpenAdd} className="bg-[#0df2d7] text-stone-900 font-bold hover:bg-[#00dcc3]">
                        <Plus className="w-5 h-5 mr-1" /> Add
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-stone-50 border-b border-stone-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase w-20">ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase">Genre Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {currentGenres.length > 0 ? (
                                currentGenres.map((genre) => (
                                    <tr key={genre.genre_id} className="hover:bg-stone-50 transition-colors group">
                                        <td className="px-6 py-4 text-sm text-stone-500 font-mono">#{genre.genre_id}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-stone-900">
                                            <div className="flex items-center gap-2">
                                                <List className="w-4 h-4 text-[#009b8f] opacity-50" />
                                                {genre.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost" size="icon"
                                                    onClick={() => handleOpenEdit(genre)}
                                                    className="h-8 w-8 text-stone-400 hover:text-[#009b8f] hover:bg-[#0df2d7]/10"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost" size="icon"
                                                    onClick={() => setGenreToDelete(genre.genre_id)}
                                                    className="h-8 w-8 text-stone-400 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-stone-500">
                                        No genres found matching "{search}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-stone-200 bg-stone-50">
                        <span className="text-xs text-stone-500">
                            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredGenres.length)} of {filteredGenres.length}
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
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- GENRE MODAL (Add/Edit) --- */}
            <GenreModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                genre={editingGenre}
                onSave={async (name) => {
                    if (editingGenre) {
                        await update.mutateAsync({ id: editingGenre.genre_id, name });
                    } else {
                        await add.mutateAsync(name);
                    }
                    setIsModalOpen(false);
                }}
                isSaving={add.isPending || update.isPending}
            />

            {/* --- DELETE CONFIRMATION --- */}
            {genreToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full animate-in zoom-in-95">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <div className="p-2 bg-red-50 rounded-full"><AlertTriangle className="w-6 h-6" /></div>
                            <h3 className="text-lg font-bold">Delete Genre?</h3>
                        </div>
                        <p className="text-stone-600 mb-6 text-sm leading-relaxed">
                            Are you sure? Note that you <strong>cannot delete</strong> a genre if there are books associated with it.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setGenreToDelete(null)}>Cancel</Button>
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

// --- SUB-COMPONENT: GENRE MODAL ---
interface GenreModalProps {
    isOpen: boolean;
    onClose: () => void;
    genre: Genre | null;
    onSave: (name: string) => Promise<void>;
    isSaving: boolean;
}

function GenreModal({ isOpen, onClose, genre, onSave, isSaving }: GenreModalProps) {
    const [name, setName] = useState('');
    const isEdit = !!genre;

    // Sync state when opening
    useEffect(() => {
        if (isOpen) {
            setName(genre?.name || '');
        }
    }, [isOpen, genre]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave(name);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-stone-100 bg-stone-50">
                    <h2 className="text-xl font-bold font-display text-stone-900">
                        {isEdit ? 'Edit Genre' : 'Add New Genre'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full text-stone-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <form id="genre-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Genre Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Science Fiction"
                                className="h-11 border-stone-200 focus:border-[#0df2d7] focus:ring-[#0df2d7]"
                                autoFocus
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" form="genre-form" className="bg-[#0df2d7] text-stone-900 font-bold hover:bg-[#00dcc3]" disabled={isSaving || !name.trim()}>
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        {isEdit ? 'Update' : 'Create'}
                    </Button>
                </div>

            </div>
        </div>
    );
}