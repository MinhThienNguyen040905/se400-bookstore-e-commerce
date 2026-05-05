// src/components/admin/books/BookModal.tsx
import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuthors, useGenres, usePublishers } from '@/hooks/useAdminBooks';
import type { Book } from '@/hooks/useAdminBooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Upload, Save, Edit2, Loader2, Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- SUB-COMPONENT: Single Select with Search (Cho Publisher) ---
function SearchableSelect({
    options, value, onChange, placeholder, disabled
}: {
    options: { id: number; name: string }[],
    value: string | number,
    onChange: (val: number) => void,
    placeholder: string,
    disabled?: boolean
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.name.toLowerCase().includes(search.toLowerCase())
    );

    const selectedLabel = options.find(opt => opt.id === Number(value))?.name;

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#0df2d7] disabled:cursor-not-allowed disabled:opacity-50"
            >
                <span className={selectedLabel ? "text-stone-900" : "text-stone-500"}>
                    {selectedLabel || placeholder}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </button>

            {isOpen && !disabled && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-stone-200 bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center border-b border-stone-100 px-3 pb-2 pt-2 sticky top-0 bg-white">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                            className="flex h-6 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-stone-500"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="pt-1">
                        {filteredOptions.length === 0 ? (
                            <div className="py-6 text-center text-sm text-stone-500">No results found.</div>
                        ) : (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.id}
                                    className={cn(
                                        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 outline-none hover:bg-stone-100 mx-1",
                                        option.id === Number(value) && "bg-[#0df2d7]/10 text-[#009b8f]"
                                    )}
                                    onClick={() => {
                                        onChange(option.id);
                                        setIsOpen(false);
                                        setSearch("");
                                    }}
                                >
                                    <Check className={cn("mr-2 h-4 w-4", option.id === Number(value) ? "opacity-100" : "opacity-0")} />
                                    {option.name}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// --- SUB-COMPONENT: Multi Select with Search (Cho Author/Genre) ---
function MultiSelectSearch({
    options, selectedIds, onChange, placeholder, disabled
}: {
    options: { id: number; name: string }[],
    selectedIds: number[],
    onChange: (ids: number[]) => void,
    placeholder: string,
    disabled?: boolean
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Đóng khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleSelection = (id: number) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter(i => i !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    const filteredOptions = options.filter(opt =>
        opt.name.toLowerCase().includes(search.toLowerCase()) &&
        !selectedIds.includes(opt.id) // Ẩn những cái đã chọn khỏi list dropdown
    );

    const selectedItems = options.filter(opt => selectedIds.includes(opt.id));

    return (
        <div className="space-y-3" ref={wrapperRef}>
            {/* Selected Tags Display */}
            {selectedItems.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedItems.map(item => (
                        <span key={item.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#0df2d7]/10 text-stone-900 border border-[#0df2d7]/20">
                            {item.name}
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => toggleSelection(item.id)}
                                    className="hover:text-red-500 rounded-full p-0.5 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </span>
                    ))}
                </div>
            )}

            {/* Input & Dropdown */}
            <div className="relative">
                <div
                    onClick={() => !disabled && setIsOpen(true)}
                    className={cn(
                        "flex min-h-[40px] w-full items-center justify-between rounded-md border border-stone-200 bg-white px-3 py-2 text-sm cursor-text",
                        disabled && "opacity-50 cursor-not-allowed bg-stone-50"
                    )}
                >
                    <input
                        className="flex-1 bg-transparent outline-none placeholder:text-stone-500 min-w-[120px]"
                        placeholder={selectedIds.length > 0 ? "Add more..." : placeholder}
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
                        disabled={disabled}
                        onFocus={() => setIsOpen(true)}
                    />
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </div>

                {isOpen && !disabled && (
                    <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-stone-200 bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm animate-in fade-in zoom-in-95 duration-100">
                        {filteredOptions.length === 0 ? (
                            <div className="py-3 px-3 text-sm text-stone-500 text-center">
                                {search ? "No results found." : "Type to search..."}
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.id}
                                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 outline-none hover:bg-stone-100 mx-1"
                                    onClick={() => {
                                        toggleSelection(option.id);
                                        setSearch("");
                                        // Keep open to select more or close? Let's keep open for multi select convienience
                                        // But usually focusing back to input is good
                                    }}
                                >
                                    {option.name}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// --- MAIN COMPONENT ---

interface BookModalProps {
    book?: Book | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: number | null, formData: FormData) => Promise<void>;
    isSaving: boolean;
}

export function BookModal({ book, isOpen, onClose, onSave, isSaving }: BookModalProps) {
    const isAddMode = !book;
    const [isEditing, setIsEditing] = useState(isAddMode);

    // Dữ liệu Form
    const [formData, setFormData] = useState<any>({
        title: '', description: '', price: 0, stock: 0, isbn: '', publisher_id: '',
        release_date: '', authors: [], genres: []
    });
    const [previewImage, setPreviewImage] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch Data (Author, Genre, Publisher)
    const { data: allAuthors = [] } = useAuthors();
    const { data: allGenres = [] } = useGenres();
    const { data: allPublishers = [] } = usePublishers();

    // Mapping options cho Select components
    const authorOptions = useMemo(() => {
        // Nếu là mảng thì dùng luôn, nếu là object thì lấy property .authors
        const list = Array.isArray(allAuthors) ? allAuthors : (allAuthors as any).authors || [];
        return list.map((a: any) => ({ id: a.author_id, name: a.name }));
    }, [allAuthors]);
    const genreOptions = useMemo(() => {
        const list = Array.isArray(allGenres) ? allGenres : (allGenres as any).genres || [];
        return list.map((g: any) => ({ id: g.genre_id, name: g.name }));
    }, [allGenres]);

    const publisherOptions = useMemo(() => {
        const list = Array.isArray(allPublishers) ? allPublishers : (allPublishers as any).publishers || [];
        return list.map((p: any) => ({ id: p.publisher_id, name: p.name }));
    }, [allPublishers]);

    useEffect(() => {
        if (isOpen) {
            if (book) {
                setFormData({
                    title: book.title,
                    description: book.description,
                    price: book.price,
                    stock: book.stock,
                    isbn: book.isbn,
                    publisher_id: book.publisher_id,
                    release_date: book.release_date ? new Date(book.release_date).toISOString().split('T')[0] : '',
                    authors: book.Authors?.map(a => a.author_id) || [],
                    genres: book.Genres?.map(g => g.genre_id) || [],
                });
                setPreviewImage(book.cover_image);
                setIsEditing(false);
            } else {
                setFormData({
                    title: '', description: '', price: 0, stock: 0, isbn: '', publisher_id: '',
                    release_date: '', authors: [], genres: []
                });
                setPreviewImage('');
                setIsEditing(true);
            }
        }
    }, [isOpen, book]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, file });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('price', formData.price.toString());
        data.append('stock', formData.stock.toString());
        data.append('isbn', formData.isbn);
        data.append('publisher_id', formData.publisher_id.toString());
        data.append('release_date', formData.release_date);

        // Gửi JSON string cho mảng ID
        if (formData.authors.length) data.append('authors', JSON.stringify(formData.authors));
        if (formData.genres.length) data.append('genres', JSON.stringify(formData.genres));
        if (formData.file) data.append('cover_image', formData.file);

        await onSave(book?.book_id || null, data);
        if (isAddMode) onClose();
        else setIsEditing(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-stone-100 bg-stone-50">
                    <h2 className="text-xl font-bold font-display text-stone-900">
                        {isAddMode ? 'Add New Book' : (isEditing ? 'Edit Book' : 'Book Details')}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full text-stone-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    <form id="book-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Image Section */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="relative aspect-[3/4] bg-stone-100 rounded-lg overflow-hidden border-2 border-dashed border-stone-300 flex items-center justify-center group">
                                {previewImage ? (
                                    <img src={previewImage} alt="Cover" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-stone-400 flex flex-col items-center">
                                        <Upload className="w-8 h-8 mb-2" />
                                        <span className="text-sm">No Cover Image</span>
                                    </div>
                                )}

                                {isEditing && (
                                    <div
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <span className="text-white font-bold flex items-center gap-2">
                                            <Edit2 className="w-4 h-4" /> Change Image
                                        </span>
                                    </div>
                                )}
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>
                        </div>

                        {/* Form Section */}
                        <div className="lg:col-span-2 space-y-5">
                            <div className="space-y-2">
                                <Label>Book Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    disabled={!isEditing}
                                    className="font-bold text-lg"
                                    placeholder="Enter book title"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Publisher</Label>
                                    <SearchableSelect
                                        options={publisherOptions}
                                        value={formData.publisher_id}
                                        onChange={(val) => setFormData({ ...formData, publisher_id: val })}
                                        placeholder="Select Publisher"
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Release Date</Label>
                                    <Input type="date" value={formData.release_date} onChange={(e) => setFormData({ ...formData, release_date: e.target.value })} disabled={!isEditing} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Price (VND)</Label>
                                    <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} disabled={!isEditing} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Stock</Label>
                                    <Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} disabled={!isEditing} />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label>ISBN</Label>
                                    <Input value={formData.isbn} onChange={(e) => setFormData({ ...formData, isbn: e.target.value })} disabled={!isEditing} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <textarea
                                    className="w-full min-h-[100px] p-3 rounded-md border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0df2d7] disabled:bg-stone-50 disabled:text-stone-500"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>

                            {/* AUTHORS MULTI-SELECT */}
                            <div className="space-y-2">
                                <Label>Authors</Label>
                                <MultiSelectSearch
                                    options={authorOptions}
                                    selectedIds={formData.authors || []}
                                    onChange={(ids) => setFormData({ ...formData, authors: ids })}
                                    placeholder="Search and select authors..."
                                    disabled={!isEditing}
                                />
                            </div>

                            {/* GENRES MULTI-SELECT */}
                            <div className="space-y-2">
                                <Label>Genres</Label>
                                <MultiSelectSearch
                                    options={genreOptions}
                                    selectedIds={formData.genres || []}
                                    onChange={(ids) => setFormData({ ...formData, genres: ids })}
                                    placeholder="Search and select genres..."
                                    disabled={!isEditing}
                                />
                            </div>

                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-end gap-3">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => isAddMode ? onClose() : setIsEditing(false)} disabled={isSaving}>Cancel</Button>
                            <Button type="submit" form="book-form" className="bg-[#0df2d7] text-stone-900 font-bold hover:bg-[#00dcc3]" disabled={isSaving}>
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Save Changes
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)} className="bg-stone-900 text-white font-bold hover:bg-stone-800">
                            <Edit2 className="w-4 h-4 mr-2" /> Edit Book
                        </Button>
                    )}
                </div>

            </div>
        </div>
    );
}