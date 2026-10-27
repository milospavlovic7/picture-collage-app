import Konva from 'konva';
import jsPDF from 'jspdf';
import type { CanvasSettings } from '../store/useStore';
import { convertFromPx } from './unitConversion';

export const downloadURI = (uri: string, name: string) => {
    const link = document.createElement('a');
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportToImage = (stage: Konva.Stage, _settings: CanvasSettings, filename: string, type: 'png' | 'jpeg' = 'png', quality = 1) => {
    // 1. Find the artboard group
    const artboardGroup = stage.findOne('.artboard-group');

    if (!artboardGroup) {
        console.error("Artboard group not found");
        return;
    }

    // 2. Save current stage state
    const oldScale = stage.scale();
    const oldPosition = stage.position();

    // 3. Reset stage to 1:1 for clean export
    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });
    // Force a redraw to ensure internal state is updated
    stage.batchDraw();

    try {
        const dataURL = artboardGroup.toDataURL({
            pixelRatio: 1, // 1:1 with the settings.width/height
            mimeType: `image/${type}`,
            quality: quality,
            x: 0,
            y: 0,
            width: _settings.width,
            height: _settings.height
        });

        downloadURI(dataURL, `${filename}.${type}`);
    } finally {
        // 4. Restore stage state
        stage.scale(oldScale);
        stage.position(oldPosition);
        stage.batchDraw();
    }
};

export const exportToPDF = (stage: Konva.Stage, settings: CanvasSettings, filename: string) => {
    const artboardGroup = stage.findOne('.artboard-group');
    if (!artboardGroup) return;

    // 1. Get dimensions in mm for PDF
    const widthMm = convertFromPx(settings.width, 'mm', settings.dpi);
    const heightMm = convertFromPx(settings.height, 'mm', settings.dpi);

    const orientation = widthMm > heightMm ? 'l' : 'p';

    // 2. Save and Reset Stage
    const oldScale = stage.scale();
    const oldPosition = stage.position();
    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });
    stage.batchDraw();

    try {
        const dataURL = artboardGroup.toDataURL({
            pixelRatio: 1,
            mimeType: 'image/jpeg',
            quality: 0.95,
            x: 0,
            y: 0,
            width: settings.width,
            height: settings.height
        });

        // 3. Create PDF
        const pdf = new jsPDF({
            orientation,
            unit: 'mm',
            format: [widthMm, heightMm]
        });

        // 4. Add image to PDF
        pdf.addImage(dataURL, 'JPEG', 0, 0, widthMm, heightMm);
        pdf.save(`${filename}.pdf`);
    } finally {
        // 5. Restore Stage
        stage.scale(oldScale);
        stage.position(oldPosition);
        stage.batchDraw();
    }
};
