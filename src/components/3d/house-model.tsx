'use client'

import React, { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import { usePropertyStore } from '@/lib/store/property-store'

interface RoomProps {
    position: [number, number, number]
    size: [number, number, number]
    name: string
    color: string
    isActive: boolean
    onClick: () => void
}

const Room = ({ position, size, name, color, isActive, onClick }: RoomProps) => {
    const mesh = useRef<THREE.Mesh>(null!)
    const [hovered, setHover] = useState(false)

    return (
        <group position={position}>
            <mesh
                ref={mesh}
                onClick={(e) => {
                    e.stopPropagation()
                    onClick()
                }}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                <boxGeometry args={size} />
                <meshStandardMaterial
                    color={isActive ? '#ff6b6b' : hovered ? '#ffd43b' : color}
                    transparent
                    opacity={0.8}
                />
            </mesh>
            <Text
                position={[0, size[1] / 2 + 0.5, 0]}
                fontSize={0.5}
                color="black"
                anchorX="center"
                anchorY="middle"
            >
                {name}
            </Text>
        </group>
    )
}

export function HouseModel() {
    const { selectedZone, setZone } = usePropertyStore()

    const handleRoomClick = (zone: string) => {
        setZone(selectedZone === zone ? null : zone)
    }

    return (
        <Canvas camera={{ position: [8, 8, 8], fov: 50 }} style={{ height: '100%', width: '100%' }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />

            {/* Living Room */}
            <Room
                position={[0, 0, 0]}
                size={[4, 2.5, 4]}
                name="Living Room"
                color="#a5d8ff"
                isActive={selectedZone === 'Living Room'}
                onClick={() => handleRoomClick('Living Room')}
            />

            {/* Kitchen - Left of Living Room */}
            <Room
                position={[-3.5, 0, 0]}
                size={[3, 2.5, 4]}
                name="Kitchen"
                color="#ffc9c9"
                isActive={selectedZone === 'Kitchen'}
                onClick={() => handleRoomClick('Kitchen')}
            />

            {/* Master Bedroom - Back of Living Room */}
            <Room
                position={[0, 0, -3.5]}
                size={[4, 2.5, 3]}
                name="Master Bedroom"
                color="#b2f2bb"
                isActive={selectedZone === 'Master Bedroom'}
                onClick={() => handleRoomClick('Master Bedroom')}
            />

            <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.2} />
            <gridHelper args={[20, 20]} />
            <color attach="background" args={['#f0f0f0']} />
        </Canvas>
    )
}
