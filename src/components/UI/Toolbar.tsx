import React, { useRef, useEffect, useState } from 'react';
import { Download, ZoomIn, ZoomOut, FileDown, Save, Upload, Settings, RotateCcw, RotateCw, FilePlus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { exportToImage, exportToPDF } from '../../utils/exportUtils';

interface ToolbarProps {
    onOpenSettings: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onOpenSettings }) => {
    const canvasSettings = useStore((state) => state.canvasSettings);
    const setCanvasSettings = useStore((state) => state.setCanvasSettings);
    const stageRef = useStore((state) => state.stageRef);
    const images = useStore((state) => state.images);
    const loadProject = useStore((state) => state.loadProject);
    const selectImage = useStore((state) => state.selectImage);
    const resetProject = useStore((state) => state.resetProject);

    // Access temporal store for Undo/Redo
    // @ts-ignore - zundo adds temporal to the store
    const { undo, redo, pastStates, futureStates } = useStore.temporal.getState();
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    // Subscribe to temporal state changes to update button disabled state
    useEffect(() => {
        const unsub = useStore.temporal.subscribe((state: any) => {
            setCanUndo(state.pastStates.length > 0);
            setCanRedo(state.futureStates.length > 0);
        });
        return unsub;
    }, []);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleZoomIn = () => {
        setCanvasSettings({ zoom: canvasSettings.zoom * 1.1 });
    };

    const handleZoomOut = () => {
        setCanvasSettings({ zoom: canvasSettings.zoom / 1.1 });
    };

    const handleExport = async (type: 'png' | 'pdf') => {
        if (!stageRef) {
            alert("Canvas not ready");
            return;
        }

        // 1. Deselect everything to hide transformers/handles
        selectImage(null);

        // 2. Wait for a render cycle to ensure visual update
        setTimeout(() => {
            const filename = canvasSettings.projectName || 'collage';
            if (type === 'png') {
                exportToImage(stageRef, canvasSettings, filename);
            } else {
                exportToPDF(stageRef, canvasSettings, filename);
            }
        }, 100);
    };

    const handleSaveProject = () => {
        const projectData = {
            images,
            canvasSettings,
            version: "1.0.0"
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${canvasSettings.projectName || 'collage_project'}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleLoadClick = () => {
        fileInputRef.current?.click();
    };

    const handleLoadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                if (event.target?.result) {
                    const data = JSON.parse(event.target.result as string);
                    if (data.images && data.canvasSettings) {
                        loadProject(data);
                    } else {
                        alert("Invalid project file");
                    }
                }
            } catch (err) {
                console.error(err);
                alert("Failed to load project");
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleNewProject = () => {
        if (confirm("Are you sure you want to start a new project? Unsaved changes will be lost.")) {
            resetProject();
        }
    };

    return (
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent hidden sm:block">
                        Collage
                    </h1>
                    <input
                        type="text"
                        value={canvasSettings.projectName || ''}
                        onChange={(e) => setCanvasSettings({ projectName: e.target.value })}
                        placeholder="Untitled Project"
                        className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none text-sm font-medium w-32 sm:w-48 text-gray-700 placeholder-gray-400"
                    />
                </div>


                <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>

                {/* File Operations */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleNewProject}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        title="New Project"
                    >
                        <FilePlus size={18} />
                    </button>
                    <button
                        onClick={handleSaveProject}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        title="Save Project"
                    >
                        <Save size={18} />
                    </button>
                    <button
                        onClick={handleLoadClick}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        title="Load Project"
                    >
                        <Upload size={18} />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".json"
                        onChange={handleLoadFile}
                    />
                </div>

                <div className="h-6 w-px bg-gray-200 mx-2"></div>

                {/* History */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => undo()}
                        disabled={!canUndo}
                        className={`p-2 rounded-lg ${!canUndo ? 'text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                        title="Undo"
                    >
                        <RotateCcw size={18} />
                    </button>
                    <button
                        onClick={() => redo()}
                        disabled={!canRedo}
                        className={`p-2 rounded-lg ${!canRedo ? 'text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                        title="Redo"
                    >
                        <RotateCw size={18} />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Settings */}
                <button
                    onClick={onOpenSettings}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 font-medium rounded-lg hover:bg-gray-200 transition-colors mr-2"
                >
                    <Settings size={16} />
                    <span className="hidden sm:inline">Settings</span>
                </button>


                <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={handleZoomOut}>
                    <ZoomOut size={20} />
                </button>
                <span className="text-sm font-medium min-w-[3rem] text-center">
                    {Math.round(canvasSettings.zoom * 100)}%
                </span>
                <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={handleZoomIn}>
                    <ZoomIn size={20} />
                </button>
            </div>

            <div className="flex items-center gap-2 ml-4">
                <button
                    onClick={() => handleExport('png')}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <Download size={16} />
                    PNG
                </button>
                <button
                    onClick={() => handleExport('pdf')}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <FileDown size={16} />
                    PDF
                </button>
            </div>
        </div>
    );
};
