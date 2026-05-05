import { useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input'; // Import Input
import { Camera, Lock, User, Mail, Phone as PhoneIcon, MapPin, Loader2, KeyRound, X, Check } from 'lucide-react';
import { ProfileField } from '../ProfileField';
import { showToast } from '@/lib/toast';

export function ProfileTab() {
    const { user, updateProfile, isUpdating, changePassword, isChangingPassword } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State cho form đổi mật khẩu
    const [isPasswordMode, setIsPasswordMode] = useState(false);
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });

    // 1. Logic Update Profile (Giữ nguyên)
    const handleUpdateField = (key: string, value: string) => {
        const formData = new FormData();
        formData.append(key, value);
        updateProfile(formData);
    };

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append('avatar', file);
            updateProfile(formData);
        }
    };

    // 2. Logic Đổi Mật Khẩu (Mới)
    const handleChangePassword = async () => {
        if (!passwords.oldPassword || !passwords.newPassword) {
            showToast.error('Vui lòng nhập đầy đủ thông tin');
            return;
        }
        if (passwords.newPassword.length < 6) {
            showToast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        try {
            await changePassword(passwords);
            // Reset form sau khi thành công
            setIsPasswordMode(false);
            setPasswords({ oldPassword: '', newPassword: '' });
        } catch (error) {
            // Lỗi đã được xử lý hiển thị toast ở hook useAuth
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Ẩn Input File */}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

            {/* 1. Avatar Section (Giữ nguyên) */}
            <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                    <Avatar className="h-24 w-24 border-4 border-stone-100 group-hover:border-[#0df2d7]/50 transition-colors">
                        <AvatarImage src={user?.avatar || ''} className="object-cover" />
                        <AvatarFallback className="text-2xl bg-stone-200 text-stone-500 font-bold">
                            {user?.name?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <button
                        className="absolute bottom-0 right-0 p-2 bg-[#0df2d7] text-stone-900 rounded-full hover:bg-[#00dcc3] shadow-sm transition-colors z-10"
                        title="Change Avatar"
                        disabled={isUpdating}
                    >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    </button>
                </div>
                <div className="text-center sm:text-left flex-1">
                    <h2 className="text-xl font-bold font-display text-stone-900">{user?.name}</h2>
                    <p className="text-stone-500 text-sm mb-4">
                        {user?.role === 'admin' ? 'Administrator' : 'Member'}
                    </p>
                    <div className="flex gap-3 justify-center sm:justify-start">
                        <Button variant="outline" className="border-stone-200 text-stone-600 hover:bg-stone-50 h-9 text-sm" onClick={handleAvatarClick} disabled={isUpdating}>
                            Change Avatar
                        </Button>
                    </div>
                </div>
            </div>

            {/* 2. Personal Information Section (Giữ nguyên) */}
            <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold font-display text-stone-900">Personal Information</h3>
                </div>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center border-b border-stone-100 pb-6">
                        <Label className="text-stone-500 font-medium">Email Address</Label>
                        <div className="md:col-span-2 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-stone-900 font-medium">
                                <Mail className="w-4 h-4 text-[#00bbb6]" />
                                {user?.email}
                            </div>
                            <span className="text-xs bg-stone-100 text-stone-500 px-2 py-1 rounded">Read-only</span>
                        </div>
                    </div>
                    <ProfileField label="Full Name" value={user?.name || ''} icon={<User className="w-4 h-4 text-[#00bbb6]" />} fieldKey="name" onSave={handleUpdateField} isLoading={isUpdating} />
                    <ProfileField label="Phone Number" value={user?.phone || ''} icon={<PhoneIcon className="w-4 h-4 text-[#00bbb6]" />} fieldKey="phone" inputType="tel" onSave={handleUpdateField} isLoading={isUpdating} />
                    <ProfileField label="Address" value={user?.address || ''} icon={<MapPin className="w-4 h-4 text-[#00bbb6]" />} fieldKey="address" onSave={handleUpdateField} isLoading={isUpdating} />
                </div>
            </div>

            {/* 3. Security Section (ĐÃ CẬP NHẬT) */}
            <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold font-display text-stone-900 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-[#00bbb6]" /> Security
                        </h3>
                        <p className="text-stone-500 text-sm mt-1">Manage your password and account security.</p>
                    </div>

                    {!isPasswordMode ? (
                        /* Trạng thái bình thường: Hiển thị nút Change Password */
                        <Button
                            onClick={() => setIsPasswordMode(true)}
                            className="bg-[#0df2d7] text-stone-900 hover:bg-[#00dcc3] font-bold"
                        >
                            Change Password
                        </Button>
                    ) : (
                        /* Trạng thái chỉnh sửa: Hiển thị Form đổi mật khẩu */
                        <div className="w-full md:w-1/2 bg-stone-50 p-4 rounded-lg border border-stone-100 animate-in fade-in zoom-in-95 duration-200">
                            {/* === THÊM DÒNG NÀY VÀO ĐẦU FORM === */}
                            {/* Input ẩn để đánh lừa trình duyệt điền username vào đây thay vì lên Header */}
                            <input type="text" name="username" autoComplete="username" className="hidden" aria-hidden="true" />
                            {/* ================================== */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-stone-600 font-medium">Current Password</Label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                        <Input
                                            type="password"
                                            autoComplete="current-password"
                                            placeholder="Enter current password"
                                            value={passwords.oldPassword}
                                            onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                                            className="pl-9 h-10 bg-white border-stone-200 focus:border-[#0df2d7] focus:ring-[#0df2d7]/20"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-stone-600 font-medium">New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                        <Input
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder="Enter new password (min 6 chars)"
                                            value={passwords.newPassword}
                                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                            className="pl-9 h-10 bg-white border-stone-200 focus:border-[#0df2d7] focus:ring-[#0df2d7]/20"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        onClick={handleChangePassword}
                                        disabled={isChangingPassword}
                                        className="flex-1 bg-[#0df2d7] hover:bg-[#00dcc3] text-stone-900 font-bold h-9"
                                    >
                                        {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                                        Save
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsPasswordMode(false);
                                            setPasswords({ oldPassword: '', newPassword: '' });
                                        }}
                                        disabled={isChangingPassword}
                                        className="flex-1 border-stone-200 text-stone-600 hover:text-red-600 hover:bg-red-50 h-9"
                                    >
                                        <X className="w-4 h-4 mr-2" /> Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}