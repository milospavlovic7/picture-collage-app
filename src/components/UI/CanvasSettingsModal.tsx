import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { UNITS, PAPER_SIZES, DPI_OPTIONS, convertToPx, convertFromPx, type Unit } from '../../utils/unitConversion';

interface CanvasSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CanvasSettingsModal: React.FC<CanvasSettingsModalProps> = ({ isOpen, onClose }) => {
    const canvasSettings = useStore((state) => state.canvasSettings);
    const setCanvasSettings = useStore((state) => state.setCanvasSettings);

    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [unit, setUnit] = useState<Unit>('mm');
    const [dpi, setDpi] = useState(72);
    const [bleed, setBleed] = useState(0);
    const [bgColor, setBgColor] = useState('#ffffff');

    // Sync local state with store when modal opens
    useEffect(() => {
        if (isOpen) {
            setUnit(canvasSettings.unit);
            setDpi(canvasSettings.dpi);
            setBleed(canvasSettings.bleed);
            setBgColor(canvasSettings.backgroundColor);

            // Convert current px width/height to current unit for display
            setWidth(Number(convertFromPx(canvasSettings.width, canvasSettings.unit, canvasSettings.dpi).toFixed(2)));
            setHeight(Number(convertFromPx(canvasSettings.height, canvasSettings.unit, canvasSettings.dpi).toFixed(2)));
        }
    }, [isOpen, canvasSettings]);

    const handleApply = () => {
        const newWidthPx = convertToPx(width, unit, dpi);
        const newHeightPx = convertToPx(height, unit, dpi);

        // Update settings other than W/H first
        setCanvasSettings({
            unit,
            dpi,
            bleed,
            backgroundColor: bgColor,
        });

        // Use dedicated action to update size and SCALE CONTENT
        useStore.getState().resizeCanvas(newWidthPx, newHeightPx);

        onClose();
    };

    const handleApplyPreset = (presetName: keyof typeof PAPER_SIZES) => {
        const preset = PAPER_SIZES[presetName];
        setUnit(preset.unit);
        setWidth(preset.width);
        setHeight(preset.height);
        // DPI stays as is or default? Let's keep current DPI or set to 300 for print?
        // Usually presets imply print, so maybe suggest 300 if not set.
        if (dpi < 300) setDpi(300);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full">
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold mb-6">Canvas Settings</h2>

                <div className="space-y-4">
                    {/* Presets */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Presets</label>
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 border rounded-lg p-2">
                            {/* ISO */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 mb-1 uppercase">ISO Formats</h3>
                                <div className="flex gap-2 flex-wrap">
                                    {['A5', 'A4', 'A3', 'A2', 'A1', 'A0'].map((key) => (
                                        <button
                                            key={key}
                                            onClick={() => handleApplyPreset(key as keyof typeof PAPER_SIZES)}
                                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                                        >
                                            {key}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* US */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 mb-1 uppercase">US Standard</h3>
                                <div className="flex gap-2 flex-wrap">
                                    {['Letter', 'Legal', 'Tabloid'].map((key) => (
                                        <button
                                            key={key}
                                            onClick={() => handleApplyPreset(key as keyof typeof PAPER_SIZES)}
                                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                                        >
                                            {key}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Posters */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 mb-1 uppercase">Posters</h3>
                                <div className="flex gap-2 flex-wrap">
                                    {['50x70', '70x100'].map((key) => (
                                        <button
                                            key={key}
                                            onClick={() => handleApplyPreset(key as keyof typeof PAPER_SIZES)}
                                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                                        >
                                            {key}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Social */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 mb-1 uppercase">Social Media</h3>
                                <div className="flex gap-2 flex-wrap">
                                    {['Instagram Square', 'Instagram Portrait', 'Instagram Story'].map((key) => (
                                        <button
                                            key={key}
                                            onClick={() => handleApplyPreset(key as keyof typeof PAPER_SIZES)}
                                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                                        >
                                            {key}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Width */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                            <input
                                type="number"
                                value={width}
                                onChange={(e) => setWidth(Number(e.target.value))}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        {/* Height */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                            <input
                                type="number"
                                value={height}
                                onChange={(e) => setHeight(Number(e.target.value))}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {/* Unit */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                            <select
                                value={unit}
                                onChange={(e) => setUnit(e.target.value as Unit)}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        {/* DPI */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">DPI</label>
                            <select
                                value={dpi}
                                onChange={(e) => setDpi(Number(e.target.value))}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                {DPI_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        {/* Bleed */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bleed (mm)</label>
                            <input
                                type="number"
                                value={bleed}
                                onChange={(e) => setBleed(Number(e.target.value))}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Background Color */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="color"
                                value={bgColor}
                                onChange={(e) => setBgColor(e.target.value)}
                                className="h-10 w-10 p-1 border rounded"
                            />
                            <input
                                type="text"
                                value={bgColor}
                                onChange={(e) => setBgColor(e.target.value)}
                                className="flex-1 px-3 py-2 border rounded-lg uppercase"
                                maxLength={7}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-lg font-medium"
                    >
                        Apply Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
