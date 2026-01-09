'use client';

import React, { Suspense, useState, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, PivotControls, Html } from '@react-three/drei';
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

    // Use a simple box if no model_url (Placeholder for now)
    // In real app, we would load item.catalog_item.model_url with useGLTF
    // For v1, we draw a box based on dimensions

    const dims = item.catalog_item?.dimensions || { l: 1, w: 1, h: 1 };

    return (
        <group
            position={item.position}
            rotation={item.rotation}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
        >
            {isSelected && isDesignMode && (
                <PivotControls
                    anchor={[0, 0, 0]}
                    depthTest={false}
                    lineWidth={4}
                    scale={1.5}
                    onDragEnd={() => {
                        if (meshRef.current) {
                            const pos = meshRef.current.position;
                            const rot = meshRef.current.rotation;
                            onMove?.([pos.x, pos.y, pos.z], [rot.x, rot.y, rot.z]);
                        }
                    }}
                >
                    <mesh ref={meshRef as any}>
                        {/* Invisible pivot target if needed, but grouping works */}
                    </mesh>
                </PivotControls>
            )}

            <mesh ref={meshRef as any}>
                <boxGeometry args={[dims.l, dims.h, dims.w]} />
                <meshStandardMaterial color={isSelected ? "#aaaaaa" : "orange"} />
            </mesh>

            {/* Label */}
            {isSelected && (
                <Html position={[0, dims.h + 0.5, 0]} center>
                    <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {item.catalog_item?.name || 'Unknown Item'}
                        <br />
                        {item.catalog_item?.price} {item.catalog_item?.currency}
                    </div>
                </Html>
            )}
        </group>
    );
}

export default function SpaceViewer({
    modelUrl,
    dimensions,
    items,
    onItemSelect,
    onItemMove,
    isDesignMode = false
}: SpaceViewerProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

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
            <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
                <Suspense fallback={null}>
                    <ambientLight intensity={0.7} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-bias={-0.0001} />
                    <Environment preset="city" />

                    <group onPointerMissed={handleMiss}>
                        {/* Room Shell */}
                        <RoomModel url={modelUrl} dimensions={dimensions} />

                        {/* Items */}
                        {items.map((item) => (
                            <FurnitureItem
                                key={item.id}
                                item={item}
                                isSelected={selectedId === item.id}
                                onSelect={() => handleSelect(item.id)}
                                onMove={(pos, rot) => onItemMove?.(item.id, pos, rot)}
                                isDesignMode={isDesignMode}
                            />
                        ))}
                    </group>

                    <ContactShadows position={[0, -0.01, 0]} opacity={0.5} scale={20} blur={2} far={4} />
                    <OrbitControls makeDefault />
                </Suspense>
            </Canvas>

            {/* Overlay UI controls could go here */}
            <div className="absolute top-4 left-4 bg-white/90 p-2 rounded shadow text-sm">
                <p className="font-medium text-slate-700">3D Design View</p>
                <p className="text-slate-500 text-xs">Left click to rotate • Right click to pan • Scroll to zoom</p>
            </div>
        </div>
    );
}
