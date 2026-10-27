import { Sidebar } from './components/UI/Sidebar';
import { Toolbar } from './components/UI/Toolbar';
import { PropertiesPanel } from './components/UI/PropertiesPanel';
import { MainCanvas } from './components/Canvas/MainCanvas';
import { CanvasSettingsModal } from './components/UI/CanvasSettingsModal';
import { useEffect, useState } from 'react';
import { useStore } from './store/useStore';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const addImage = useStore((state) => state.addImage);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                addImage(event.target.result as string);
              }
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [addImage]);

  // Global Key Listener for Delete
  const selection = useStore((state) => state.selection);
  const removeImage = useStore((state) => state.removeImage);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selection.length > 0) {
          // Remove all selected images
          selection.forEach(id => removeImage(id));
        }
      }

      if (e.key.toLowerCase() === 'n') {
        if (selection.length > 0) {
          useStore.getState().bringForward(selection[0]);
        }
      }

      if (e.key.toLowerCase() === 'm') {
        if (selection.length > 0) {
          useStore.getState().sendBackward(selection[0]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selection, removeImage]);

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <Toolbar onOpenSettings={() => setIsSettingsOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <MainCanvas />
        <PropertiesPanel />
      </div>
      <CanvasSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default App;
