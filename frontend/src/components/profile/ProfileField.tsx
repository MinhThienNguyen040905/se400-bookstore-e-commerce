import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit2, Check, X, Loader2 } from 'lucide-react'; // Thêm Loader2

interface ProfileFieldProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    fieldKey: string;
    inputType?: string;
    onSave: (key: string, value: string) => Promise<void> | void; // <--- Callback lưu
    isLoading?: boolean; // <--- Trạng thái loading
}

export function ProfileField({ label, value, icon, fieldKey, inputType = "text", onSave, isLoading }: ProfileFieldProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);

    useEffect(() => {
        setTempValue(value);
    }, [value]);

    const handleSave = async () => {
        if (tempValue !== value) {
            await onSave(fieldKey, tempValue); // Gọi hàm từ cha
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempValue(value);
        setIsEditing(false);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center border-b border-stone-100 pb-6 last:border-0 last:pb-0">
            <Label className="text-stone-500 font-medium">{label}</Label>
            <div className="md:col-span-2 flex items-center justify-between gap-4">
                {isEditing ? (
                    <div className="flex items-center gap-2 w-full animate-in fade-in zoom-in-95 duration-200">
                        <Input
                            type={inputType}
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="h-10 border-[#0df2d7] ring-2 ring-[#0df2d7]/20 bg-white"
                            autoFocus
                            disabled={isLoading}
                        />
                        <Button size="icon" onClick={handleSave} disabled={isLoading} className="h-10 w-10 bg-[#0df2d7] hover:bg-[#00dcc3] text-stone-900 shrink-0">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </Button>
                        <Button size="icon" variant="outline" onClick={handleCancel} disabled={isLoading} className="h-10 w-10 border-stone-200 text-stone-500 hover:text-red-500 hover:bg-red-50 shrink-0">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-3 text-stone-900 font-medium truncate">
                            {icon}
                            {value || <span className="text-stone-400 italic">Chưa cập nhật</span>}
                        </div>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 text-stone-400 hover:text-[#00bbb6] hover:bg-[#0df2d7]/10 rounded-full transition-all"
                            title="Edit"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}