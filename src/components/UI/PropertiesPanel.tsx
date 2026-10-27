import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Trash2, Copy, ChevronUp, ChevronDown, Layers, Sliders, GripVertical } from 'lucide-react';

export const PropertiesPanel: React.FC = () => {
    const selection = useStore((state) => state.selection);
    const images = useStore((state) => state.images);
    const updateImage = useStore((state) => state.updateImage);
    const removeImage = useStore((state) => state.removeImage);
    const bringToFront = useStore((state) => state.bringToFront);
    const sendToBack = useStore((state) => state.sendToBack);
    const bringForward = useStore((state) => state.bringForward);
    const sendBackward = useStore((state) => state.sendBackward);
    const addImage = useStore((state) => state.addImage);
    const reorderImages = useStore((state) => state.reorderImages);
    const selectImage = useStore((state) => state.selectImage);
    const canvasSettings = useStore((state) => state.canvasSettings);
    const setCanvasSettings = useStore((state) => state.setCanvasSettings);

    const [activeTab, setActiveTab] = useState<'properties' | 'layers'>('properties');
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

    // Filter images to show in layers (reverse z-index order)
    const sortedImages = [...images].sort((a, b) => b.zIndex - a.zIndex);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedItemId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedItemId || draggedItemId === targetId) return;
        // Optional: Visual feedback
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedItemId || draggedItemId === targetId) return;

        // Calculate new order
        const currentIndex = sortedImages.findIndex(i => i.id === draggedItemId);
        const targetIndex = sortedImages.findIndex(i => i.id === targetId);

        if (currentIndex === -1 || targetIndex === -1) return;

        const newSorted = [...sortedImages];
        const [moved] = newSorted.splice(currentIndex, 1);
        newSorted.splice(targetIndex, 0, moved);

        // Update store with new order (IDs only)
        // sortedImages is Top-to-Bottom. reorderImages expects this list to assign Z-indices
        // Top item gets highest Z.
        reorderImages(newSorted.map(i => i.id));
        setDraggedItemId(null);
    };

    const selectedId = selection[0];
    const selectedImage = images.find(img => img.id === selectedId);

    const handleDuplicate = () => {
        if (selectedImage) {
            addImage(selectedImage.src, selectedImage.x + 20, selectedImage.y + 20);
        }
    };

    return (
        <div className="w-64 bg-white border-l border-gray-200 flex flex-col h-full">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('properties')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'properties'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Sliders size={16} /> Properties
                </button>
                <button
                    onClick={() => setActiveTab('layers')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'layers'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Layers size={16} /> Layers
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {activeTab === 'properties' ? (
                    <div className="p-4 space-y-6">
                        {!selectedImage ? (
                            <div className="space-y-6">
                                <div className="text-sm font-medium text-gray-900 border-b pb-2">
                                    Canvas Properties
                                </div>

                                {/* Canvas Global Filters */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Filters</label>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">Grayscale</span>
                                        <button
                                            onClick={() => setCanvasSettings({ grayscale: !canvasSettings.grayscale })}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${canvasSettings.grayscale ? 'bg-blue-600' : 'bg-gray-200'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${canvasSettings.grayscale ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        Applies a black & white filter over the entire composition.
                                    </p>
                                </div>

                                <div className="text-center text-gray-400 text-xs mt-10">
                                    Select an image to edit its properties
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Dimensions */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Position</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="text-xs text-gray-400">X</span>
                                            <input
                                                type="number"
                                                value={Math.round(selectedImage.x)}
                                                onChange={(e) => updateImage(selectedImage.id, { x: Number(e.target.value) })}
                                                className="w-full border rounded px-2 py-1 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-400">Y</span>
                                            <input
                                                type="number"
                                                value={Math.round(selectedImage.y)}
                                                onChange={(e) => updateImage(selectedImage.id, { y: Number(e.target.value) })}
                                                className="w-full border rounded px-2 py-1 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Transform</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="text-xs text-gray-400">Rotation</span>
                                            <input
                                                type="number"
                                                value={Math.round(selectedImage.rotation)}
                                                onChange={(e) => updateImage(selectedImage.id, { rotation: Number(e.target.value) })}
                                                className="w-full border rounded px-2 py-1 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-400">Scale</span>
                                            <input
                                                type="number"
                                                value={Math.round(selectedImage.scaleX * 100) / 100}
                                                step="0.1"
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    updateImage(selectedImage.id, { scaleX: val, scaleY: val })
                                                }}
                                                className="w-full border rounded px-2 py-1 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase flex justify-between items-center">
                                        <span>Crop</span>
                                        {selectedImage.crop && (
                                            <button
                                                onClick={() => updateImage(selectedImage.id, { crop: undefined, width: selectedImage.width, height: selectedImage.height })}
                                                className="text-[10px] text-blue-600 hover:text-blue-800 lowercase font-normal"
                                            >
                                                reset
                                            </button>
                                        )}
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {/* INSET LEFT (Crop X) */}
                                        <div>
                                            <span className="text-xs text-gray-400">Left</span>
                                            <input
                                                type="number"
                                                value={selectedImage.crop?.x || 0}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    if (val < 0) return;
                                                    // When changing Left, we update crop.x
                                                    // And we must reduce crop.width to keep Right edge stable?
                                                    // "Crop" in Konva is Source Rect (x,y,w,h) relative to original image.
                                                    // If we increase Crop X, we are cutting from left.
                                                    // Ideally, Width should decrease to match?
                                                    // Standard "Inset" behavior:
                                                    // Left Inset = crop.x
                                                    // Right Inset = originalWidth - (crop.x + crop.width)
                                                    // If I change Left Inset, I change crop.x.
                                                    // Should I keep Width constant (shifting right edge) or Right constant (shrinking width)?
                                                    // Usually, "Crop Left" implies shrinking the visible area from the left side.
                                                    // So Right edge stays visual same relative to image? No, image is static.
                                                    // Only the "Window" moves.
                                                    // If I say "Trim 10px from Left", I expect the resulting image to be 10px narrower.
                                                    // So: crop.x = val; crop.width = originalWidth - val - rightInset.

                                                    const current = selectedImage.crop || { x: 0, y: 0, width: selectedImage.width, height: selectedImage.height };
                                                    const rightInset = selectedImage.width - (current.x + current.width);
                                                    const newWidth = selectedImage.width - val - rightInset;

                                                    if (newWidth <= 0) return;

                                                    updateImage(selectedImage.id, {
                                                        crop: { ...current, x: val, width: newWidth },
                                                        // Also update displayed width? NO. Konva Image "width" is destination size.
                                                        // If we crop, destination size usually stays same (stretching) UNLESS we want "Crop" to also resize.
                                                        // The user asked "Choose how much to cut".
                                                        // Usually when you crop an image in a layout tool, the BOUNDS of the image shrink.
                                                        // So YES, we should ALSO reduce the destination Width/Height.
                                                        width: newWidth,
                                                    });
                                                }}
                                                className="w-full border rounded px-2 py-1 text-sm"
                                            />
                                        </div>
                                        {/* INSET TOP (Crop Y) */}
                                        <div>
                                            <span className="text-xs text-gray-400">Top</span>
                                            <input
                                                type="number"
                                                value={selectedImage.crop?.y || 0}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    if (val < 0) return;
                                                    const current = selectedImage.crop || { x: 0, y: 0, width: selectedImage.width, height: selectedImage.height };
                                                    const bottomInset = selectedImage.height - (current.y + current.height);
                                                    const newHeight = selectedImage.height - val - bottomInset;

                                                    if (newHeight <= 0) return;

                                                    updateImage(selectedImage.id, {
                                                        crop: { ...current, y: val, height: newHeight },
                                                        height: newHeight
                                                    });
                                                }}
                                                className="w-full border rounded px-2 py-1 text-sm"
                                            />
                                        </div>
                                        {/* INSET RIGHT */}
                                        <div>
                                            <span className="text-xs text-gray-400">Right</span>
                                            <input
                                                type="number"
                                                // Right Inset = OrigWidth - (CropX + CropW)
                                                value={
                                                    selectedImage.width - ((selectedImage.crop?.x || 0) + (selectedImage.crop?.width || selectedImage.width))
                                                }
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    if (val < 0) return;
                                                    const current = selectedImage.crop || { x: 0, y: 0, width: selectedImage.width, height: selectedImage.height };
                                                    // New Width = OrigWidth - CropX - Val
                                                    const newWidth = selectedImage.width - current.x - val;

                                                    if (newWidth <= 0) return;

                                                    updateImage(selectedImage.id, {
                                                        crop: { ...current, width: newWidth },
                                                        width: newWidth
                                                    });
                                                }}
                                                className="w-full border rounded px-2 py-1 text-sm"
                                            />
                                        </div>
                                        {/* INSET BOTTOM */}
                                        <div>
                                            <span className="text-xs text-gray-400">Bottom</span>
                                            <input
                                                type="number"
                                                value={
                                                    selectedImage.height - ((selectedImage.crop?.y || 0) + (selectedImage.crop?.height || selectedImage.height))
                                                }
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    if (val < 0) return;
                                                    const current = selectedImage.crop || { x: 0, y: 0, width: selectedImage.width, height: selectedImage.height };
                                                    const newHeight = selectedImage.height - current.y - val;

                                                    if (newHeight <= 0) return;

                                                    updateImage(selectedImage.id, {
                                                        crop: { ...current, height: newHeight },
                                                        height: newHeight
                                                    });
                                                }}
                                                className="w-full border rounded px-2 py-1 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Arrange</label>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => bringForward(selectedImage.id)}
                                                className="flex-1 bg-gray-100 hover:bg-gray-200 p-2 rounded flex justify-center items-center gap-1 text-xs"
                                                title="Bring Forward"
                                            >
                                                <ChevronUp size={14} /> Fwd
                                            </button>
                                            <button
                                                onClick={() => sendBackward(selectedImage.id)}
                                                className="flex-1 bg-gray-100 hover:bg-gray-200 p-2 rounded flex justify-center items-center gap-1 text-xs"
                                                title="Send Backward"
                                            >
                                                <ChevronDown size={14} /> Bwd
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => bringToFront(selectedImage.id)}
                                                className="flex-1 bg-gray-100 hover:bg-gray-200 p-2 rounded flex justify-center items-center gap-1 text-xs"
                                                title="Bring to Front"
                                            >
                                                <ChevronUp size={14} /> Front
                                            </button>
                                            <button
                                                onClick={() => sendToBack(selectedImage.id)}
                                                className="flex-1 bg-gray-100 hover:bg-gray-200 p-2 rounded flex justify-center items-center gap-1 text-xs"
                                                title="Send to Back"
                                            >
                                                <ChevronDown size={14} /> Back
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-200 space-y-2">
                                    <button
                                        onClick={handleDuplicate}
                                        className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 py-2 rounded text-sm font-medium transition-colors"
                                    >
                                        <Copy size={16} /> Duplicate
                                    </button>
                                    <button
                                        onClick={() => removeImage(selectedImage.id)}
                                        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded text-sm font-medium transition-colors"
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    // Layers Tab
                    <div className="p-2 space-y-1">
                        {sortedImages.length === 0 && (
                            <div className="text-center text-gray-400 text-sm mt-10">
                                No layers
                            </div>
                        )}
                        {sortedImages.map((img) => (
                            <div
                                key={img.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, img.id)}
                                onDragOver={(e) => handleDragOver(e, img.id)}
                                onDrop={(e) => handleDrop(e, img.id)}
                                onClick={() => selectImage(img.id)}
                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border ${selection.includes(img.id)
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'bg-white border-transparent hover:bg-gray-50'
                                    }`}
                            >
                                <div className="cursor-move text-gray-400">
                                    <GripVertical size={14} />
                                </div>
                                <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0 border border-gray-200">
                                    <img src={img.src} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-700 truncate">
                                        Image {img.zIndex}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
