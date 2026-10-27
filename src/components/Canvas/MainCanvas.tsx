import React, { useRef } from 'react';
import { Stage, Layer, Rect, Group, Transformer } from 'react-konva';
import { useStore } from '../../store/useStore';
import { ImageItem } from './ImageItem';
import Konva from 'konva';
import { Context } from 'konva/lib/Context';

import { ContextMenu } from '../UI/ContextMenu';

export const MainCanvas: React.FC = () => {
    const images = useStore((state) => state.images);
    const selection = useStore((state) => state.selection);
    const canvasSettings = useStore((state) => state.canvasSettings);
    const selectImage = useStore((state) => state.selectImage);
    const updateImage = useStore((state) => state.updateImage);
    const setCanvasSettings = useStore((state) => state.setCanvasSettings);

    const stageRef = useRef<Konva.Stage>(null);
    const setStageRef = useStore((state) => state.setStageRef);

    const [contextMenu, setContextMenu] = React.useState<{ x: number, y: number, id: string | null } | null>(null);

    const trRef = useRef<Konva.Transformer>(null);

    React.useEffect(() => {
        if (stageRef.current) {
            setStageRef(stageRef.current);

            // Initial Center (optional, but good)
            const stage = stageRef.current;
            const containerWidth = window.innerWidth;
            const containerHeight = window.innerHeight;
            const scale = 0.8;
            stage.scale({ x: scale, y: scale });
            stage.position({
                x: (containerWidth - canvasSettings.width * scale) / 2,
                y: (containerHeight - canvasSettings.height * scale) / 2
            });
            setCanvasSettings({
                zoom: scale,
                paramX: stage.x(),
                paramY: stage.y()
            });
        }
    }, [setStageRef]);

    // Effect to attach transformer to selected image
    React.useEffect(() => {
        const stage = stageRef.current;
        const tr = trRef.current;
        if (!stage || !tr) return;

        // Start fresh
        tr.nodes([]);

        if (selection.length > 0) {
            // Find nodes
            const selectedNodes = selection.map(id => stage.findOne('#' + id)).filter(Boolean);
            if (selectedNodes.length > 0) {
                tr.nodes(selectedNodes as Konva.Node[]);
                tr.getLayer()?.batchDraw();
            }
        }
    }, [selection, images]); // Dep on images to re-find if re-ordered/changed?

    const checkDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
        // deselect when clicked on empty area
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            selectImage(null);
            setContextMenu(null);
        }
    };

    const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();
        const stage = stageRef.current;
        if (!stage) return;

        const scaleBy = 1.1;
        const oldScale = stage.scaleX();

        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

        stage.scale({ x: newScale, y: newScale });

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };

        stage.position(newPos);
        setCanvasSettings({
            zoom: newScale,
            paramX: newPos.x,
            paramY: newPos.y
        });
    };

    // Sort images by zIndex to ensure correct rendering order (Konva renders in array order)
    const sortedImages = [...images].sort((a, b) => a.zIndex - b.zIndex);

    return (
        <div className='flex-1 bg-gray-100 overflow-hidden relative drop-shadow-inner'>
            <Stage
                width={window.innerWidth}
                height={window.innerHeight}
                onMouseDown={checkDeselect}
                onTouchStart={checkDeselect}
                onContextMenu={(e) => {
                    e.evt.preventDefault();
                    if (e.target === e.target.getStage()) {
                        setContextMenu({
                            x: e.evt.clientX,
                            y: e.evt.clientY,
                            id: null
                        });
                    }
                }}
                onWheel={handleWheel}
                draggable
                ref={stageRef}
            >
                <Layer>
                    {/* Workspace Viewport Background - Infinite illusion */}
                    <Rect
                        x={-50000}
                        y={-50000}
                        width={100000}
                        height={100000}
                        fill="#e5e7eb"
                        listening={false}
                    />

                    {/* Shadow for Artboard */}
                    <Rect
                        x={0}
                        y={0}
                        width={canvasSettings.width}
                        height={canvasSettings.height}
                        fill="transparent"
                        shadowColor="black"
                        shadowBlur={20}
                        shadowOpacity={0.2}
                        shadowOffset={{ x: 0, y: 10 }}
                        listening={false}
                    />

                    {/* CLIPPED GROUP: Content inside the artboard */}
                    <Group
                        name="artboard-group"
                        clipFunc={(ctx: Context) => {
                            ctx.rect(0, 0, canvasSettings.width, canvasSettings.height);
                        }}
                    >
                        {/* Artboard Fill */}
                        <Rect
                            x={0}
                            y={0}
                            width={canvasSettings.width}
                            height={canvasSettings.height}
                            fill={canvasSettings.backgroundColor}
                            listening={false}
                        />

                        {sortedImages.map((img) => (
                            <ImageItem
                                key={img.id}
                                image={img}
                                isSelected={selection.includes(img.id)}
                                onSelect={(e) => {
                                    const isShift = e.evt.shiftKey;
                                    selectImage(img.id, isShift);
                                    e.cancelBubble = true;
                                }}
                                onChange={(newAttrs) => {
                                    updateImage(img.id, newAttrs);
                                }}
                                onContextMenu={(e) => {
                                    e.evt.preventDefault();
                                    setContextMenu({
                                        x: e.evt.clientX,
                                        y: e.evt.clientY,
                                        id: img.id
                                    });
                                    e.cancelBubble = true; // Stop stage from seeing it
                                }}
                            />
                        ))}

                        {/* Grayscale Overlay */}
                        {canvasSettings.grayscale && (
                            <Rect
                                x={0}
                                y={0}
                                width={canvasSettings.width}
                                height={canvasSettings.height}
                                fill="black"
                                globalCompositeOperation="saturation"
                                listening={false}
                            />
                        )}
                    </Group>

                    {/* Bleed Guide */}
                    {canvasSettings.bleed > 0 && (
                        <Rect
                            x={-canvasSettings.bleed * (canvasSettings.dpi / 25.4)}
                            y={-canvasSettings.bleed * (canvasSettings.dpi / 25.4)}
                            width={canvasSettings.width + (canvasSettings.bleed * 2 * (canvasSettings.dpi / 25.4))}
                            height={canvasSettings.height + (canvasSettings.bleed * 2 * (canvasSettings.dpi / 25.4))}
                            stroke="#ff0000"
                            strokeWidth={1}
                            dash={[5, 5]}
                            listening={false}
                        />
                    )}

                    {/* GLOBAL TRANSFORMER - Outside clipped group, Top of Layer */}
                    <Transformer
                        ref={trRef}
                        boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                            }
                            return newBox;
                        }}
                    />
                </Layer>
            </Stage>

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    targetId={contextMenu.id}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </div>
    );
};
