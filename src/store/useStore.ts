import { create } from 'zustand';
import { temporal } from 'zundo';
import { v4 as uuidv4 } from 'uuid';
import type { Unit } from '../utils/unitConversion';

export interface ImageItem {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  zIndex: number;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface CanvasSettings {
  width: number;
  height: number;
  backgroundColor: string;
  zoom: number;
  paramX: number; // Pan x
  paramY: number; // Pan y
  unit: Unit;
  dpi: number;
  bleed: number; // in mm
  grayscale?: boolean;
  projectName?: string;
}

interface AppState {
  images: ImageItem[];
  selection: string[]; // array of selected IDs
  canvasSettings: CanvasSettings;

  // Actions
  addImage: (src: string, x?: number, y?: number) => void;
  updateImage: (id: string, attrs: Partial<ImageItem>) => void;
  removeImage: (id: string) => void;
  selectImage: (id: string | null, multi?: boolean) => void;
  setCanvasSettings: (settings: Partial<CanvasSettings>) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  reorderImages: (newOrderIds: string[]) => void;


  stageRef: any; // Konva.Stage | null
  setStageRef: (ref: any) => void;
  loadProject: (data: { images: ImageItem[], canvasSettings: CanvasSettings }) => void;
  resizeCanvas: (width: number, height: number) => void;
  resetProject: () => void;
}

export const useStore = create<AppState>()(
  temporal(
    (set) => ({
      images: [],
      selection: [],
      stageRef: null,
      canvasSettings: {
        width: 210 * 3.7795, // A4 approx in px (at 96dpi default for screen) but we will manage via unit
        height: 297 * 3.7795,
        backgroundColor: '#ffffff',
        zoom: 1,
        paramX: 0,
        paramY: 0,
        unit: 'mm',
        dpi: 72, // Screen default
        bleed: 0,
        grayscale: false,
        projectName: 'Untitled Project',
      },

      setStageRef: (ref) => set({ stageRef: ref }),

      loadProject: (data) => set({
        images: data.images,
        canvasSettings: {
          ...data.canvasSettings,
          // Ensure compatibility if loading old projects
          unit: data.canvasSettings.unit || 'px',
          dpi: data.canvasSettings.dpi || 72,
          bleed: data.canvasSettings.bleed || 0,
          grayscale: data.canvasSettings.grayscale || false,
          projectName: data.canvasSettings.projectName || 'Untitled Project',
        },
        selection: []
      }),

      resizeCanvas: (newWidth: number, newHeight: number) => set((state) => {
        const oldWidth = state.canvasSettings.width;
        const oldHeight = state.canvasSettings.height;

        // Avoid division by zero
        if (oldWidth === 0 || oldHeight === 0) {
          return {
            canvasSettings: { ...state.canvasSettings, width: newWidth, height: newHeight }
          };
        }

        const scaleX = newWidth / oldWidth;
        const scaleY = newHeight / oldHeight;

        // Scale all images position and size
        const scaledImages = state.images.map(img => ({
          ...img,
          x: img.x * scaleX,
          y: img.y * scaleY,
          width: img.width * scaleX,
          height: img.height * scaleY,
          // Note: We scale width/height directly. 
          // Alternatively we could scale scaleX/scaleY, but usually resizing canvas means "physically" resizing content.
          // However, ImageItem uses scaleX/scaleY for user transforms.
          // If we change width/height, does it affect scale?
          // Konva Image width/height are the unscaled dimensions * scale.
          // Let's just scale width/height.
        }));

        return {
          canvasSettings: { ...state.canvasSettings, width: newWidth, height: newHeight },
          images: scaledImages
        };
      }),

      resetProject: () => set((state) => ({
        images: [],
        selection: [],
        canvasSettings: {
          ...state.canvasSettings,
          // Keep dimensions but reset name if desired? No, usually New Project resets to Untitled.
          projectName: 'Untitled Project',
        }
      })),

      addImage: (src: string, x = 100, y = 100) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          // ...
          set((state) => ({
            images: [
              ...state.images,
              {
                id: uuidv4(),
                src,
                x,
                y,
                width: img.width, // Natural width initially
                height: img.height,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: state.images.length,
              },
            ],
          }));
        };
      },

      updateImage: (id: string, attrs: Partial<ImageItem>) =>
        set((state) => ({
          images: state.images.map((img) =>
            img.id === id ? { ...img, ...attrs } : img
          ),
        })),

      removeImage: (id: string) =>
        set((state) => ({
          images: state.images.filter((img) => img.id !== id),
          selection: state.selection.filter((selId) => selId !== id),
        })),

      selectImage: (id: string | null, multi = false) =>
        set((state) => {
          if (!id) return { selection: [] };
          if (multi) {
            return {
              selection: state.selection.includes(id)
                ? state.selection.filter((i) => i !== id)
                : [...state.selection, id],
            };
          }
          return { selection: [id] };
        }),

      setCanvasSettings: (settings: Partial<CanvasSettings>) =>
        set((state) => ({
          canvasSettings: { ...state.canvasSettings, ...settings },
        })),

      bringToFront: (id: string) =>
        set((state) => {
          const maxZ = Math.max(...state.images.map((i) => i.zIndex), 0);
          return {
            images: state.images.map((img) =>
              img.id === id ? { ...img, zIndex: maxZ + 1 } : img
            ),
          };
        }),

      sendToBack: (id: string) =>
        set((state) => {
          const minZ = Math.min(...state.images.map((i) => i.zIndex), 0);
          return {
            images: state.images.map((img) =>
              img.id === id ? { ...img, zIndex: minZ - 1 } : img
            ),
          };
        }),

      bringForward: (id: string) =>
        set((state) => {
          const currentImg = state.images.find(i => i.id === id);
          if (!currentImg) return {};
          const currentZ = currentImg.zIndex;

          // Find next image with higher Z
          const nextImg = state.images
            .filter(i => i.zIndex > currentZ)
            .sort((a, b) => a.zIndex - b.zIndex)[0];

          if (!nextImg) return {}; // Already at top

          return {
            images: state.images.map(img => {
              if (img.id === id) return { ...img, zIndex: nextImg.zIndex };
              if (img.id === nextImg.id) return { ...img, zIndex: currentZ };
              return img;
            })
          };
        }),

      sendBackward: (id: string) =>
        set((state) => {
          const currentImg = state.images.find(i => i.id === id);
          if (!currentImg) return {};
          const currentZ = currentImg.zIndex;

          // Find prev image with lower Z
          const prevImg = state.images
            .filter(i => i.zIndex < currentZ)
            .sort((a, b) => b.zIndex - a.zIndex)[0]; // Sort desc to get closest lower

          if (!prevImg) return {}; // Already at bottom

          return {
            images: state.images.map(img => {
              if (img.id === id) return { ...img, zIndex: prevImg.zIndex };
              if (img.id === prevImg.id) return { ...img, zIndex: currentZ };
              return img;
            })
          };
        }),

      reorderImages: (newOrderIds: string[]) =>
        set((state) => {
          // newOrderIds is array of IDs in order from top to bottom (or bottom to top, depends on UI)
          // Let's assume input is [Top, ..., Bottom] or similar. 
          // We just need to assign Z-indices based on the index in the array.
          // If array is [Top...Bottom], then Top has highest index.
          // Usually Drag and Drop lists: Index 0 is top visually.
          // We can map:
          const newImages = state.images.map(img => {
            const newIndex = newOrderIds.indexOf(img.id);
            if (newIndex === -1) return img; // Should not happen
            // if newOrderIds[0] is top (highest z), then zIndex = length - index
            return { ...img, zIndex: newOrderIds.length - 1 - newIndex };
          });
          return { images: newImages };
        }),

    }),
    {
      // Temporal middleware options (optional)
      limit: 100, // Limit history
      partialize: (state) => {
        const { images, canvasSettings } = state;
        return { images, canvasSettings };
      },
      equality: (a, b) => JSON.stringify(a) === JSON.stringify(b), // Simple equality check for now
    }
  )
);

