'use client';

import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, TransformControls, Html, Edges } from '@react-three/drei';
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
    modelUrl: string; // Helper for viewer
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
    dreamImageUrl?: string | null;
    captureRef?: React.MutableRefObject<(() => string) | null>;
}

function GLTFRoom({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
}

function DefaultRoom({ dimensions }: { dimensions: { l: number; w: number; h: number } }) {
    return (
        <group position={[0, dimensions.h / 2, 0]}>
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -dimensions.h / 2, 0]}>
                <planeGeometry args={[dimensions.l, dimensions.w]} />
                <meshStandardMaterial color="#f0f2f5" roughness={0.8} />
                <gridHelper args={[Math.max(dimensions.l, dimensions.w), Math.max(dimensions.l, dimensions.w) * 2, "#e2e8f0", "#e2e8f0"]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} />
            </mesh>

            {/* Walls (Simple Box reversed) */}
            <mesh>
                <boxGeometry args={[dimensions.l, dimensions.h, dimensions.w]} />
                <meshStandardMaterial color="#ffffff" side={THREE.BackSide} roughness={0.5} />
            </mesh>
        </group>
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

    // Fallback Box (Professional White Clay)
    return (
        <mesh
            position={item.position}
            rotation={item.rotation}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
            castShadow
            receiveShadow
        >
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
            <Edges color="#cbd5e1" threshold={15} />

            {/* Hover Tooltip (Optional, improved) */}
            <Html position={[0, 0.8, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
                <div className="bg-slate-900/80 backdrop-blur text-white text-[10px] px-2 py-1 rounded shadow-lg border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.catalog_item?.name || 'Object'}
                </div>
            </Html>
        </mesh>
    );
}

function ModelFromUrl({ url, position, rotation, onClick }: any) {
    const { scene } = useGLTF(url) as any;
    // Clone scene to avoid shared mutations
    const cloned = React.useMemo(() => scene.clone(), [scene]);

    // HACK: Normalize scale for known giant models
    // Using simple string matching for now
    let scale: [number, number, number] = [1, 1, 1];
    let isLantern = false;

    if (url && typeof url === 'string') {
        const lower = url.toLowerCase();
        if (lower.includes('lantern')) {
            // console.log('[SpaceViewer] Detect Lantern -> Apply Scale [0.02, 0.02, 0.02]');
            scale = [0.03, 0.03, 0.03]; // 10x smaller than before!
        } else if (lower.includes('box')) {
            scale = [0.5, 0.5, 0.5];
        }
    }

    return (
        <group
            position={position}
            rotation={rotation}
            scale={scale}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
        >
            <primitive object={cloned} />
        </group>
    );
}

function SceneCapturer({ captureRef }: { captureRef?: React.MutableRefObject<(() => string) | null> }) {
    const { gl, scene, camera } = useThree();

    useEffect(() => {
        if (!captureRef) return;
        captureRef.current = () => {
            gl.render(scene, camera);
            return gl.domElement.toDataURL('image/png');
        };
    }, [gl, scene, camera, captureRef]);

    return null;
}

export default function SpaceViewer({
    modelUrl,
    dimensions,
    items,
    onItemSelect,
    onItemMove,
    onItemsChange,
    isDesignMode = true,
    dreamImageUrl,
    captureRef
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

    return (
        <div className="w-full h-full relative bg-slate-100 group">
            <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }} gl={{ preserveDrawingBuffer: true }}>
                <SceneCapturer captureRef={captureRef} />
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

            {/* Dream Overlay Mode */}
            {dreamImageUrl && (
                <div className="absolute inset-0 z-10 pointer-events-none transition-all duration-700">
                    <div className="relative w-full h-full overflow-hidden">
                        {/* The Dream Image */}
                        <img
                            src={dreamImageUrl}
                            alt="Dream Generated"
                            className="w-full h-full object-cover opacity-80"
                        />
                        {/* Comparison Slider Handle (Fake for MVP) */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg border border-white/50 text-white font-medium shadow-xl">
                            Dream View (Overlay)
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
