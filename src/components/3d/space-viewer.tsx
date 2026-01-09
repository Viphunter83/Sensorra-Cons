'use client';

import React, { Suspense, useState, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, TransformControls, Html } from '@react-three/drei';
import * as THREE from 'three';

// Types (to be moved to global types later)
export interface CatalogItem {
    id: string;
    name: string;
    category: string;
    price: number;
    currency: string;
    dimensions: { l: number; w: number; h: number };
    model_url?: string; // URL to GLB/GLTF
    image_url?: string;
}

export interface PlacedItem {
    id: string; // Unique instance ID
    catalog_item_id: string;
    position: [number, number, number];
    rotation: [number, number, number];
    catalog_item?: CatalogItem; // Hydrated data
}

interface SpaceViewerProps {
    modelUrl?: string | null;
    dimensions: { l: number; w: number; h: number };
    items: PlacedItem[];
    onItemSelect?: (itemId: string | null) => void;
    onItemMove?: (itemId: string, position: [number, number, number], rotation: [number, number, number]) => void;
    isDesignMode?: boolean;
}

function GLTFRoom({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
}

function DefaultRoom({ dimensions }: { dimensions: { l: number; w: number; h: number } }) {
    return (
        <mesh position={[0, dimensions.h / 2, 0]}>
            <boxGeometry args={[dimensions.l, dimensions.h, dimensions.w]} />
            <meshStandardMaterial color="#f0f0f0" side={THREE.BackSide} />
            <gridHelper args={[Math.max(dimensions.l, dimensions.w), 10]} position={[0, -dimensions.h / 2 + 0.01, 0]} />
        </mesh>
    );
}

function RoomModel({ url, dimensions }: { url?: string | null; dimensions: { l: number; w: number; h: number } }) {
    if (url) {
        return <GLTFRoom url={url} />;
    }
    return <DefaultRoom dimensions={dimensions} />;
}

function FurnitureItem({
    item,
    isSelected,
    onSelect,
    onMove,
    isDesignMode
}: {
    item: PlacedItem;
    isSelected: boolean;
    onSelect: () => void;
    onMove?: (pos: [number, number, number], rot: [number, number, number]) => void;
    isDesignMode: boolean;
}) {
    const meshRef = useRef<THREE.Group>(null);

    const glbUrl = item.catalog_item?.model_url;
    let scene = null;

    if (glbUrl && (glbUrl.startsWith('http') || glbUrl.startsWith('/'))) {
        try {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const gltf = useGLTF(glbUrl);
            scene = gltf.scene.clone();
        } catch (e) {
            console.warn("Failed to load model", glbUrl);
        }
    }

    const dims = item.catalog_item?.dimensions || { l: 1, w: 1, h: 1 };

    return (
        <group
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
        >
            {isSelected && isDesignMode && (
                <TransformControls
                    object={meshRef as any}
                    mode="translate" // Default mode, we can add a toggle later
                    onObjectChange={(e) => {
                        if (meshRef.current) {
                            const pos = meshRef.current.position;
                            const rot = meshRef.current.rotation;
                            // TransformControls modifies object in place, we need to sync up
                            // But better to save state on drag end.
                        }
                    }}
                    onMouseUp={() => {
                        if (meshRef.current) {
                            const pos = meshRef.current.position;
                            const rot = meshRef.current.rotation;
                            onMove?.([pos.x, pos.y, pos.z], [rot.x, rot.y, rot.z]);
                        }
                    }}
                />
            )}

            <group
                ref={meshRef}
                position={item.position}
                rotation={item.rotation}
            >
                {scene ? (
                    <primitive object={scene} scale={[1, 1, 1]} />
                ) : (
                    <mesh>
                        <boxGeometry args={[dims.l, dims.h, dims.w]} />
                        <meshStandardMaterial color={isSelected ? "#aaaaaa" : "#e2e8f0"} />
                        <lineSegments>
                            <edgesGeometry args={[new THREE.BoxGeometry(dims.l, dims.h, dims.w)]} />
                            <lineBasicMaterial color="black" />
                        </lineSegments>
                    </mesh>
                )}
            </group>

            {/* Label */}
            {isSelected && (
                <Html position={[item.position[0], item.position[1] + dims.h + 0.5, item.position[2]]} center>
                    <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none select-none">
                        {item.catalog_item?.name || 'Unknown Item'}
                        <br />
                        {item.catalog_item?.price} {item.catalog_item?.currency}
                    </div>
                </Html>
            )}
        </group>
    );
}

// ... imports
import { DreamControlPanel } from './dream-panel';

export default function SpaceViewer({
    modelUrl,
    dimensions,
    items: initialItems,
    onItemSelect,
    onItemMove,
    isDesignMode = false
}: SpaceViewerProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [currentItems, setCurrentItems] = useState<PlacedItem[]>(initialItems);

    // Sync initialItems if they change from parent (optional, but good for robust sync)
    // For now we assume local state takes precedence after a "Dream" event

    // Handler for when the "Dream Engine" returns results
    const handleDreamRealized = (result: any) => {
        if (result.success && result.items) {
            // Replace current items with Dream items
            // We need to map DreamPlacedItem to PlacedItem (they are compatible structurally)
            setCurrentItems(result.items.map((item: any) => ({
                ...item,
                rotation: [item.rotation[0], item.rotation[1], item.rotation[2]] // Ensure array
            })));
            console.log("Dream manifest:", result.items);
        }
    };

    const handleSelect = (id: string) => {
        setSelectedId(id);
        onItemSelect?.(id);
    };

    const handleMiss = () => {
        setSelectedId(null);
        onItemSelect?.(null);
    };

    return (
        <div className="w-full h-full min-h-[500px] bg-slate-50 relative rounded-lg overflow-hidden border border-slate-200">
            {/* Dream Control Panel Overlay */}
            <DreamControlPanel onDreamRealized={handleDreamRealized} />

            <div className="absolute top-4 right-4 bg-white/90 p-2 rounded shadow text-sm z-10 pointer-events-none">
                <p className="font-medium text-slate-700">3D Design View</p>
                <p className="text-slate-500 text-xs text-right">Left click to rotate<br />Right click to pan<br />Scroll to zoom</p>
            </div>

            <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
                <Suspense fallback={null}>
                    <ambientLight intensity={0.7} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-bias={-0.0001} />
                    <Environment preset="city" />

                    <group onPointerMissed={handleMiss}>
                        {/* Room Shell */}
                        <RoomModel url={modelUrl} dimensions={dimensions} />

                        {/* Items */}
                        {currentItems.map((item) => (
                            <FurnitureItem
                                key={item.id}
                                item={item}
                                isSelected={selectedId === item.id}
                                onSelect={() => handleSelect(item.id)}
                                onMove={(pos, rot) => {
                                    // Update local state for immediate feedback
                                    const updated = currentItems.map(i =>
                                        i.id === item.id ? { ...i, position: pos, rotation: rot } : i
                                    );
                                    setCurrentItems(updated as PlacedItem[]);
                                    onItemMove?.(item.id, pos, rot);
                                }}
                                isDesignMode={isDesignMode}
                            />
                        ))}
                    </group>

                    <ContactShadows position={[0, -0.01, 0]} opacity={0.5} scale={20} blur={2} far={4} />
                    <OrbitControls makeDefault />
                </Suspense>
            </Canvas>
        </div>
    );
}
