// src/components/admin/tabs/UsersTab.tsx
import { useState } from 'react';
import { useAdminUsers, useDeleteUser } from '@/hooks/useAdmin';
import type { User } from '@/hooks/useAdmin';
import {
    Search, Trash2, Eye, MoreVertical, ChevronLeft, ChevronRight,
    User as UserIcon, Mail, Phone, MapPin, Shield, AlertTriangle, X
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function UsersTab() {
    const { data: users = [], isLoading, isError } = useAdminUsers();
    const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

    // State
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Số user mỗi trang
    const [selectedUser, setSelectedUser] = useState<User | null>(null); // Modal Xem chi tiết
    const [userToDelete, setUserToDelete] = useState<number | null>(null); // Modal Xóa

    // 1. FILTERING (Tìm kiếm)
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    // 2. PAGINATION (Phân trang)
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
    };

    const handleDelete = () => {
        if (userToDelete) {
            deleteUser(userToDelete, {
                onSuccess: () => setUserToDelete(null)
            });
        }
    };

    if (isLoading) return <div className="p-8 text-center text-stone-500">Loading users...</div>;
    if (isError) return <div className="p-8 text-center text-red-500">Failed to load users</div>;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* HEADER: TITLE & SEARCH */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-display text-stone-900">User Management</h2>
                    <p className="text-stone-500 text-sm mt-1">Total: {users.length} users</p>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <Input
                        placeholder="Search by name or email..."
                        className="pl-9 bg-white border-stone-200"
                        value={search}
                        onChange={handleSearch}
                    />
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-stone-50 border-b border-stone-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase">Contact</th>
                                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {currentUsers.length > 0 ? (
                                currentUsers.map((user) => (
                                    <tr key={user.user_id} className="hover:bg-stone-50 transition-colors group">
                                        {/* Column 1: User Info */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-stone-100">
                                                    <AvatarImage src={user.avatar || ''} />
                                                    <AvatarFallback className="bg-[#0df2d7]/10 text-[#009b8f] font-bold">
                                                        {user.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-bold text-stone-900 text-sm">{user.name}</p>
                                                    <p className="text-stone-500 text-xs">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Column 2: Role */}
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2.5 py-0.5 rounded-full text-xs font-bold capitalize",
                                                user.role === 'admin'
                                                    ? "bg-purple-100 text-purple-700"
                                                    : "bg-blue-100 text-blue-700"
                                            )}>
                                                {user.role}
                                            </span>
                                        </td>

                                        {/* Column 3: Contact */}
                                        <td className="px-6 py-4 text-sm text-stone-600">
                                            <div className="flex flex-col gap-1">
                                                <span className="flex items-center gap-1.5 text-xs">
                                                    <Phone className="w-3 h-3 text-stone-400" /> {user.phone || 'N/A'}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-xs max-w-[200px] truncate" title={user.address}>
                                                    <MapPin className="w-3 h-3 text-stone-400" /> {user.address || 'N/A'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Column 4: Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setSelectedUser(user)}
                                                    className="h-8 w-8 text-stone-400 hover:text-[#009b8f] hover:bg-[#0df2d7]/10"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>

                                                {/* Không cho phép xóa Admin hoặc chính mình (nếu cần logic chặn ở UI) */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setUserToDelete(user.user_id)}
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
                                    <td colSpan={4} className="px-6 py-12 text-center text-stone-500">
                                        No users found matching "{search}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-stone-200 bg-stone-50">
                        <span className="text-xs text-stone-500">
                            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- MODAL: VIEW USER DETAIL --- */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="relative h-24 bg-[#0df2d7]/20">
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="absolute top-4 right-4 p-1 bg-white/50 hover:bg-white rounded-full transition-colors text-stone-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="px-6 pb-6 -mt-12">
                            <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
                                <AvatarImage src={selectedUser.avatar || ''} />
                                <AvatarFallback className="bg-stone-100 text-2xl font-bold text-stone-500">
                                    {selectedUser.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="mt-4 text-center">
                                <h3 className="text-xl font-bold text-stone-900">{selectedUser.name}</h3>
                                <span className={cn(
                                    "inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide",
                                    selectedUser.role === 'admin' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                                )}>
                                    {selectedUser.role}
                                </span>
                            </div>

                            <div className="mt-6 space-y-4">
                                <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={selectedUser.email} />
                                <InfoItem icon={<Phone className="w-4 h-4" />} label="Phone" value={selectedUser.phone} />
                                <InfoItem icon={<MapPin className="w-4 h-4" />} label="Address" value={selectedUser.address} />
                                <InfoItem icon={<Shield className="w-4 h-4" />} label="User ID" value={`#${selectedUser.user_id}`} />
                            </div>

                            <div className="mt-8 pt-4 border-t border-stone-100 flex justify-end">
                                <Button onClick={() => setSelectedUser(null)} className="bg-stone-900 text-white hover:bg-stone-800">
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL: CONFIRM DELETE --- */}
            {userToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <div className="p-2 bg-red-50 rounded-full">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold">Delete User?</h3>
                        </div>

                        <p className="text-stone-600 text-sm mb-6 leading-relaxed">
                            Are you sure you want to delete this user? This action cannot be undone and will remove all their data.
                        </p>

                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setUserToDelete(null)}
                                className="border-stone-200"
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold"
                            >
                                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

// Sub-component cho Info Modal
function InfoItem({ icon, label, value }: any) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-stone-50 border border-stone-100">
            <div className="mt-0.5 text-[#009b8f]">{icon}</div>
            <div className="flex-1">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-sm font-medium text-stone-900 break-all">{value || 'N/A'}</p>
            </div>
        </div>
    );
}