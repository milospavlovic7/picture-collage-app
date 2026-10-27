import React, { useEffect, useRef } from 'react';
import { BringToFront, SendToBack, ChevronUp, ChevronDown, Trash2, Copy, Clipboard } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface ContextMenuProps {
    x: number;
    y: number;
    targetId: string | null;
    onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, targetId, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const bringToFront = useStore((state) => state.bringToFront);
    const sendToBack = useStore((state) => state.sendToBack);
    const bringForward = useStore((state) => state.bringForward);
    const sendBackward = useStore((state) => state.sendBackward);
    const removeImage = useStore((state) => state.removeImage);
    const images = useStore((state) => state.images);
    const addImage = useStore((state) => state.addImage);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleAction = (action: () => void) => {
        action();
        onClose();
    };

    const handleDuplicate = () => {
        if (!targetId) return;
        const img = images.find(i => i.id === targetId);
        if (img) {
            addImage(img.src, img.x + 10, img.y + 10);
        }
        onClose();
    };

    const handlePaste = async () => {
        try {
            const clipboardItems = await navigator.clipboard.read();
            for (const item of clipboardItems) {
                const imageTypes = item.types.filter(type => type.startsWith('image/'));
                for (const type of imageTypes) {
                    const blob = await item.getType(type);
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        if (event.target?.result) {
                            addImage(event.target.result as string);
                        }
                    };
                    reader.readAsDataURL(blob);
                }
            }
        } catch (err) {
            console.error('Failed to read clipboard', err);
        }
        onClose();
    };

    return (
        <div
            ref={menuRef}
            className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[200px] z-[100]"
            style={{ top: y, left: x }}
        >
            <button
                onClick={handlePaste}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
                <Clipboard size={16} />
                Paste Image
            </button>

            {targetId && (
                <>
                    <div className="my-1 h-px bg-gray-200" />
                    <button
                        onClick={() => handleAction(() => bringToFront(targetId))}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                        <BringToFront size={16} />
                        Bring to Front
                    </button>
                    <button
                        onClick={() => handleAction(() => bringForward(targetId))}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                        <ChevronUp size={16} />
                        Bring Forward
                    </button>
                    <button
                        onClick={() => handleAction(() => sendBackward(targetId))}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                        <ChevronDown size={16} />
                        Send Backward
                    </button>
                    <button
                        onClick={() => handleAction(() => sendToBack(targetId))}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                        <SendToBack size={16} />
                        Send to Back
                    </button>
                    <div className="my-1 h-px bg-gray-200" />
                    <button
                        onClick={handleDuplicate}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                        <Copy size={16} />
                        Duplicate
                    </button>
                    <button
                        onClick={() => handleAction(() => removeImage(targetId))}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                        <Trash2 size={16} />
                        Delete
                    </button>
                </>
            )}
        </div>
    );
};
