import React, { useRef, useEffect } from 'react';
import { Image as KonvaImage } from 'react-konva';
import type { ImageItem as ImageItemType } from '../../store/useStore';
import Konva from 'konva';

interface ImageItemProps {
    image: ImageItemType;
    isSelected: boolean;
    onSelect: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
    onChange: (newAttrs: Partial<ImageItemType>) => void;
    onContextMenu: (e: Konva.KonvaEventObject<PointerEvent>) => void;
}

export const ImageItem: React.FC<ImageItemProps> = ({
    image,
    // isSelected, // Unused now
    onSelect,
    onChange,
    onContextMenu,
}) => {
    const shapeRef = useRef<Konva.Image>(null);
    const [imgObj, setImgObj] = React.useState<HTMLImageElement | null>(null);

    useEffect(() => {
        const img = new Image();
        img.src = image.src;
        img.onload = () => {
            setImgObj(img);
        };
    }, [image.src]);

    return (
        <>
            <KonvaImage
                id={image.id} // Important for MainCanvas to find it
                onClick={onSelect}
                onTap={onSelect}
                ref={shapeRef}
                image={imgObj || undefined}
                x={image.x}
                y={image.y}
                width={image.width}
                height={image.height}
                rotation={image.rotation}
                scaleX={image.scaleX}
                scaleY={image.scaleY}
                crop={image.crop}
                draggable
                onContextMenu={onContextMenu}
                onDragEnd={(e) => {
                    onChange({
                        x: e.target.x(),
                        y: e.target.y(),
                    });
                }}
                onTransformEnd={() => {
                    const node = shapeRef.current;
                    if (!node) return;

                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    // Reset scale to 1 and adjust width/height? 
                    // Or keep scale?
                    // For images, usually better to keep scale or reset it.
                    // Let's keep scale for now to avoid quality loss if Konva handles it.
                    // Start refactoring to simple properties:

                    onChange({
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        scaleX: scaleX,
                        scaleY: scaleY,
                        // optionally you can reset scale and multiply width/height:
                        // width: Math.max(5, node.width() * scaleX),
                        // height: Math.max(node.height() * scaleY),
                    });
                }}
            />
        </>
    );
};
