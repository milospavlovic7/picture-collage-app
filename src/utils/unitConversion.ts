export type Unit = 'px' | 'mm' | 'cm' | 'in';

export const UNITS: Unit[] = ['px', 'mm', 'cm', 'in'];

export const PAPER_SIZES = {
    // ISO A series
    A5: { width: 148, height: 210, unit: 'mm' as Unit },
    A4: { width: 210, height: 297, unit: 'mm' as Unit },
    A3: { width: 297, height: 420, unit: 'mm' as Unit },
    A2: { width: 420, height: 594, unit: 'mm' as Unit },
    A1: { width: 594, height: 841, unit: 'mm' as Unit },
    A0: { width: 841, height: 1189, unit: 'mm' as Unit },
    // US Standard
    Letter: { width: 8.5, height: 11, unit: 'in' as Unit },
    Legal: { width: 8.5, height: 14, unit: 'in' as Unit },
    Tabloid: { width: 11, height: 17, unit: 'in' as Unit },
    // Poster
    '50x70': { width: 50, height: 70, unit: 'cm' as Unit },
    '70x100': { width: 70, height: 100, unit: 'cm' as Unit },
    'Instagram Square': { width: 1080, height: 1080, unit: 'px' as Unit },
    'Instagram Portrait': { width: 1080, height: 1350, unit: 'px' as Unit },
    'Instagram Story': { width: 1080, height: 1920, unit: 'px' as Unit },
};

export const DPI_OPTIONS = [72, 150, 300];

export const convertToPx = (value: number, unit: Unit, dpi: number): number => {
    if (unit === 'px') return value;
    if (unit === 'in') return value * dpi;
    if (unit === 'mm') return (value / 25.4) * dpi;
    if (unit === 'cm') return (value / 2.54) * dpi;
    return value;
};

export const convertFromPx = (px: number, unit: Unit, dpi: number): number => {
    if (unit === 'px') return px;
    if (unit === 'in') return px / dpi;
    if (unit === 'mm') return (px / dpi) * 25.4;
    if (unit === 'cm') return (px / dpi) * 2.54;
    return px;
};
