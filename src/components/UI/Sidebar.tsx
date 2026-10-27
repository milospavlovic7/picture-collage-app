import React, { useRef } from 'react';
import { useStore } from '../../store/useStore';
import { Upload, Image as ImageIcon, Clipboard } from 'lucide-react';

export const Sidebar: React.FC = () => {
    const addImage = useStore((state) => state.addImage);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach((file) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        addImage(event.target.result as string);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files) {
            Array.from(files).forEach((file) => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        if (event.target?.result) {
                            addImage(event.target.result as string);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    };

    return (
        <div
            className="w-64 bg-white border-r border-gray-200 flex flex-col h-full"
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <ImageIcon size={20} />
                    Library
                </h2>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
                <button
                    onClick={async () => {
                        try {
                            const clipboardItems = await navigator.clipboard.read();
                            for (const item of clipboardItems) {
                                // Filter for images
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
                            alert('Failed to read clipboard. Please ensure you have granted permission.');
                        }
                    }}
                    className="w-full mb-4 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 py-2 rounded-lg text-sm font-medium transition-colors border border-blue-200"
                >
                    <Clipboard className="w-4 h-4" />
                    Paste from Clipboard
                </button>

                <label
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="text-sm text-gray-500 font-semibold">Click to upload</p>
                        <p className="text-xs text-gray-400">or drag and drop</p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                    />
                </label>

                <div className="mt-6">
                    <h3 className="text-xs uppercase text-gray-400 font-bold mb-3">Recent Uploads</h3>
                    {/* 
                Ideally we would store recent uploads in a separate list in store not just on canvas.
                For now, we can list images currently on canvas as thumbnails?
                Or just leave this empty for future enhancement.
            */}
                    <p className="text-xs text-gray-400 italic">
                        Drag images from here to canvas (Coming Soon) <br />
                        Currently images appear on canvas immediately.
                    </p>
                </div>
            </div>
        </div>
    );
};
