'use client';

import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, TransformControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { DreamControlPanel } from './dream-panel';
import { DreamPlacedItem, DreamResult } from '@/actions/dream-actions';

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
    description?: string;
    score?: number; // Similarity score for AI search
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
    onItemsChange?: (items: PlacedItem[]) => void;
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
    onMove
}: {
    item: PlacedItem;
    isSelected: boolean;
    onSelect: () => void;
    onMove: (pos: [number, number, number], rot: [number, number, number]) => void;
}) {
    // Determine model URL: Mock AI returns 'model_url' inside catalog_item.
    const modelUrl = item.catalog_item?.model_url;

    return (
        <group>
            {isSelected ? (
                <TransformControls
                    mode="translate"
                    onObjectChange={(e: any) => {
                        if (e?.target?.object) {
                            const o = e.target.object;
                            onMove([o.position.x, o.position.y, o.position.z], [o.rotation.x, o.rotation.y, o.rotation.z]);
                        }
                    }}
                >
                    <ItemMesh item={item} modelUrl={modelUrl} onSelect={onSelect} />
                </TransformControls>
            ) : (
                <ItemMesh item={item} modelUrl={modelUrl} onSelect={onSelect} />
            )}
        </group>
    );
}

function ItemMesh({ item, modelUrl, onSelect }: { item: PlacedItem, modelUrl?: string, onSelect: () => void }) {
    // If we have a URL, try to load it. Otherwise box.
    // We use a Suspense boundary or error boundary ideally.
    // For MVP, if modelUrl is empty or fails, we fallback to box?
    // useGLTF will crash if url is empty.

    if (modelUrl) {
        return <ModelFromUrl url={modelUrl} position={item.position} rotation={item.rotation} onClick={onSelect} />;
    }

    // Fallback Box
    return (
        <mesh
            position={item.position}
            rotation={item.rotation}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
        >
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="hotpink" />
            <Html position={[0, 1, 0]}>
                <div className="bg-black/50 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {item.catalog_item?.name || 'Unknown Item'}
                </div>
            </Html>
        </mesh>
    );
}

function ModelFromUrl({ url, position, rotation, onClick }: any) {
    // Safe load
    // Need to handle errors?
    // For now assume valid URL
    const { scene } = useGLTF(url) as any;
    const cloned = scene.clone();

    return (
        <primitive
            object={cloned}
            position={position}
            rotation={rotation}
            onClick={(e: any) => {
                e.stopPropagation();
                onClick();
            }}
        />
    );
}

export default function SpaceViewer({
    modelUrl,
    dimensions,
    items,
    onItemSelect,
    onItemMove,
    onItemsChange,
    isDesignMode = true
}: SpaceViewerProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [currentItems, setCurrentItems] = useState<PlacedItem[]>(items);

    // Sync props to state (External updates)
    useEffect(() => {
        // Compare to avoid infinite loop if parent updates on change
        if (JSON.stringify(items) !== JSON.stringify(currentItems)) {
            setCurrentItems(items);
        }
    }, [items]); // Dependent on items prop

    const handleSelect = (id: string | null) => {
        setSelectedId(id);
        onItemSelect?.(id);
    };

    const handleMove = (id: string, pos: [number, number, number], rot: [number, number, number]) => {
        // Update local state for smoothness
        const updated = currentItems.map(item =>
            item.id === id ? { ...item, position: pos, rotation: rot } : item
        );
        setCurrentItems(updated);

        // Notify parent
        onItemMove?.(id, pos, rot);
        onItemsChange?.(updated);
    };

    const handleDreamRealized = (result: DreamResult) => {
        if (result.success && result.items) {
            const castedNewItems = result.items as unknown as PlacedItem[];
            const updated = [...currentItems, ...castedNewItems];
            setCurrentItems(updated);
            onItemsChange?.(updated);
        }
    };

    return (
        <div className="w-full h-full relative bg-slate-100">
            <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
                <Suspense fallback={null}>
                    <Environment preset="apartment" />
                    <ambientLight intensity={0.5} />
                    <RoomModel url={modelUrl} dimensions={dimensions} />

                    {currentItems.map((item) => (
                        <FurnitureItem
                            key={item.id}
                            item={item}
                            isSelected={selectedId === item.id}
                            onSelect={() => handleSelect(item.id)}
                            onMove={(pos, rot) => handleMove(item.id, pos, rot)}
                        />
                    ))}

                    <ContactShadows position={[0, -0.01, 0]} opacity={0.5} scale={20} blur={2} far={4.5} />
                    <OrbitControls makeDefault />
                </Suspense>
            </Canvas>

            {isDesignMode && (
                <DreamControlPanel onDreamRealized={handleDreamRealized} />
            )}
        </div>
    );
}

// Preload common models if needed (optional)
// useGLTF.preload('/sofa.glb')
