import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Photorealistic Avatar Model matching the reference image
 * Indian female with professional appearance
 */
function PhotorealisticAvatarModel({ isTalking, emotion = 'neutral' }) {
    const groupRef = useRef();
    const headRef = useRef();
    const bodyRef = useRef();
    const leftArmRef = useRef();
    const rightArmRef = useRef();
    const leftLegRef = useRef();
    const rightLegRef = useRef();
    const spineRef = useRef();
    const jawRef = useRef();

    // Animation state
    const [time, setTime] = useState(0);

    // Natural body movements matching reference
    useFrame((state, delta) => {
        if (!groupRef.current) return;

        const t = state.clock.getElapsedTime();
        setTime(t);

        // Very subtle breathing
        const breathe = Math.sin(t * 0.7) * 0.008;
        if (spineRef.current) {
            spineRef.current.scale.z = 1 + breathe;
            spineRef.current.position.y = breathe * 0.5;
        }

        // Minimal body sway for natural standing pose
        if (groupRef.current) {
            groupRef.current.rotation.z = Math.sin(t * 0.25) * 0.01;
        }

        if (isTalking) {
            // Natural talking animations
            if (headRef.current) {
                headRef.current.rotation.y = Math.sin(t * 1.3) * 0.12;
                headRef.current.rotation.x = Math.sin(t * 1.1) * 0.06;
                headRef.current.rotation.z = Math.sin(t * 0.9) * 0.04;
            }

            // Jaw movement for talking
            if (jawRef.current) {
                jawRef.current.rotation.x = Math.abs(Math.sin(t * 8)) * 0.15;
            }

            // Subtle hand gestures
            if (leftArmRef.current) {
                leftArmRef.current.rotation.x = Math.sin(t * 1.2) * 0.15 + 0.1;
                leftArmRef.current.rotation.z = Math.sin(t * 1.0) * 0.08 + 0.05;
            }
            if (rightArmRef.current) {
                rightArmRef.current.rotation.x = Math.sin(t * 1.3) * 0.15 + 0.1;
                rightArmRef.current.rotation.z = Math.sin(t * 1.1) * 0.08 - 0.05;
            }
        } else {
            // Professional standing pose
            if (headRef.current) {
                headRef.current.rotation.y = Math.sin(t * 0.3) * 0.03;
                headRef.current.rotation.x = 0.02;
                headRef.current.rotation.z = 0;
            }

            if (jawRef.current) {
                jawRef.current.rotation.x = 0;
            }

            // Relaxed arms at sides
            if (leftArmRef.current) {
                leftArmRef.current.rotation.x = 0.1;
                leftArmRef.current.rotation.z = 0.05;
            }
            if (rightArmRef.current) {
                rightArmRef.current.rotation.x = 0.1;
                rightArmRef.current.rotation.z = -0.05;
            }
        }
    });

    // Photorealistic materials
    const skinMaterial = new THREE.MeshStandardMaterial({
        color: '#c9a882', // Indian skin tone - lighter/more realistic
        roughness: 0.45,
        metalness: 0.02,
        envMapIntensity: 1.2
    });

    const faceMaterial = new THREE.MeshStandardMaterial({
        color: '#d4a574',
        roughness: 0.35,
        metalness: 0.01,
        envMapIntensity: 1.5
    });

    const hairMaterial = new THREE.MeshStandardMaterial({
        color: '#0d0806',
        roughness: 0.6,
        metalness: 0.4,
        envMapIntensity: 0.8
    });

    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: '#0a0a0a',
        roughness: 0.1,
        metalness: 0.1,
        envMapIntensity: 2.0
    });

    const eyeWhiteMaterial = new THREE.MeshStandardMaterial({
        color: '#f5f5f5',
        roughness: 0.3,
        metalness: 0.0
    });

    const clothMaterial = new THREE.MeshStandardMaterial({
        color: '#4a5f7f', // Professional blue-gray
        roughness: 0.75,
        metalness: 0.05
    });

    const pantsMaterial = new THREE.MeshStandardMaterial({
        color: '#2b2d2f',
        roughness: 0.65,
        metalness: 0.05
    });

    const shoesMaterial = new THREE.MeshStandardMaterial({
        color: '#1a1412',
        roughness: 0.3,
        metalness: 0.15
    });

    const lipsMaterial = new THREE.MeshStandardMaterial({
        color: '#b87070',
        roughness: 0.4,
        metalness: 0.1
    });

    return (
        <group ref={groupRef} position={[0, -1.65, 0]}>
            {/* Head - More realistic proportions */}
            <group ref={headRef} position={[0, 1.55, 0]}>
                {/* Face - oval shape */}
                <mesh material={faceMaterial} castShadow>
                    <sphereGeometry args={[0.20, 64, 64]} />
                    <meshStandardMaterial
                        color="#d4a574"
                        roughness={0.35}
                        metalness={0.01}
                        envMapIntensity={1.5}
                    />
                </mesh>

                {/* Forehead */}
                <mesh position={[0, 0.08, 0.12]} material={faceMaterial} castShadow>
                    <sphereGeometry args={[0.15, 64, 64]} />
                </mesh>

                {/* Cheeks */}
                <mesh position={[-0.09, -0.02, 0.14]} material={faceMaterial} castShadow>
                    <sphereGeometry args={[0.08, 32, 32]} />
                </mesh>
                <mesh position={[0.09, -0.02, 0.14]} material={faceMaterial} castShadow>
                    <sphereGeometry args={[0.08, 32, 32]} />
                </mesh>

                {/* Eyes - detailed */}
                {/* Left eye */}
                <group position={[-0.07, 0.04, 0.17]}>
                    <mesh material={eyeWhiteMaterial} castShadow>
                        <sphereGeometry args={[0.022, 32, 32]} />
                    </mesh>
                    <mesh position={[0, 0, 0.015]} material={eyeMaterial} castShadow>
                        <sphereGeometry args={[0.012, 32, 32]} />
                    </mesh>
                    {/* Pupil */}
                    <mesh position={[0, 0, 0.02]} castShadow>
                        <sphereGeometry args={[0.006, 16, 16]} />
                        <meshStandardMaterial color="#000000" />
                    </mesh>
                </group>

                {/* Right eye */}
                <group position={[0.07, 0.04, 0.17]}>
                    <mesh material={eyeWhiteMaterial} castShadow>
                        <sphereGeometry args={[0.022, 32, 32]} />
                    </mesh>
                    <mesh position={[0, 0, 0.015]} material={eyeMaterial} castShadow>
                        <sphereGeometry args={[0.012, 32, 32]} />
                    </mesh>
                    {/* Pupil */}
                    <mesh position={[0, 0, 0.02]} castShadow>
                        <sphereGeometry args={[0.006, 16, 16]} />
                        <meshStandardMaterial color="#000000" />
                    </mesh>
                </group>

                {/* Eyebrows */}
                <mesh position={[-0.07, 0.08, 0.18]} rotation={[0, 0, -0.1]} castShadow>
                    <boxGeometry args={[0.05, 0.008, 0.01]} />
                    <meshStandardMaterial color="#0d0806" roughness={0.8} />
                </mesh>
                <mesh position={[0.07, 0.08, 0.18]} rotation={[0, 0, 0.1]} castShadow>
                    <boxGeometry args={[0.05, 0.008, 0.01]} />
                    <meshStandardMaterial color="#0d0806" roughness={0.8} />
                </mesh>

                {/* Nose - realistic shape */}
                <mesh position={[0, 0.01, 0.19]} rotation={[Math.PI, 0, 0]} castShadow>
                    <coneGeometry args={[0.025, 0.07, 8]} />
                    <meshStandardMaterial color="#d4a574" roughness={0.4} />
                </mesh>
                {/* Nose bridge */}
                <mesh position={[0, 0.04, 0.18]} castShadow>
                    <boxGeometry args={[0.02, 0.06, 0.02]} />
                    <meshStandardMaterial color="#d4a574" roughness={0.4} />
                </mesh>

                {/* Lips */}
                <group ref={jawRef} position={[0, -0.08, 0.16]}>
                    {/* Upper lip */}
                    <mesh position={[0, 0.01, 0]} castShadow>
                        <boxGeometry args={[0.06, 0.012, 0.02]} />
                        <meshStandardMaterial {...lipsMaterial} />
                    </mesh>
                    {/* Lower lip */}
                    <mesh position={[0, -0.01, 0]} castShadow>
                        <boxGeometry args={[0.06, 0.015, 0.025]} />
                        <meshStandardMaterial {...lipsMaterial} />
                    </mesh>
                </group>

                {/* Chin */}
                <mesh position={[0, -0.14, 0.13]} material={faceMaterial} castShadow>
                    <sphereGeometry args={[0.06, 32, 32]} />
                </mesh>

                {/* Hair - realistic Indian female hairstyle */}
                {/* Top/back */}
                <mesh position={[0, 0.12, -0.05]} material={hairMaterial} castShadow>
                    <sphereGeometry args={[0.22, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
                </mesh>

                {/* Hair sides - longer */}
                <mesh position={[-0.14, 0.02, 0]} material={hairMaterial} castShadow>
                    <boxGeometry args={[0.08, 0.25, 0.15]} />
                </mesh>
                <mesh position={[0.14, 0.02, 0]} material={hairMaterial} castShadow>
                    <boxGeometry args={[0.08, 0.25, 0.15]} />
                </mesh>

                {/* Hair back - shoulder length */}
                <mesh position={[0, -0.05, -0.15]} material={hairMaterial} castShadow>
                    <boxGeometry args={[0.18, 0.3, 0.08]} />
                </mesh>

                {/* Ears */}
                <mesh position={[-0.18, 0, 0.05]} rotation={[0, 0, -0.3]} material={skinMaterial} castShadow>
                    <sphereGeometry args={[0.03, 16, 16]} />
                </mesh>
                <mesh position={[0.18, 0, 0.05]} rotation={[0, 0, 0.3]} material={skinMaterial} castShadow>
                    <sphereGeometry args={[0.03, 16, 16]} />
                </mesh>

                {/* Neck */}
                <mesh position={[0, -0.26, 0.02]} material={skinMaterial} castShadow>
                    <cylinderGeometry args={[0.065, 0.08, 0.22, 32]} />
                </mesh>
            </group>

            {/* Body - Professional proportions */}
            <group ref={spineRef} position={[0, 0.75, 0]}>
                <group ref={bodyRef}>
                    {/* Upper torso - fitted shirt */}
                    <mesh material={clothMaterial} castShadow>
                        <boxGeometry args={[0.42, 0.55, 0.22]} />
                    </mesh>

                    {/* Bust area - female proportions */}
                    <mesh position={[0, 0.15, 0.08]} material={clothMaterial} castShadow>
                        <sphereGeometry args={[0.18, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                    </mesh>

                    {/* Shoulders - rounded */}
                    <mesh position={[-0.26, 0.24, 0]} material={clothMaterial} castShadow>
                        <sphereGeometry args={[0.09, 32, 32]} />
                    </mesh>
                    <mesh position={[0.26, 0.24, 0]} material={clothMaterial} castShadow>
                        <sphereGeometry args={[0.09, 32, 32]} />
                    </mesh>

                    {/* Lower torso/waist */}
                    <mesh position={[0, -0.42, 0]} material={clothMaterial} castShadow>
                        <boxGeometry args={[0.38, 0.28, 0.20]} />
                    </mesh>
                </group>
            </group>

            {/* Arms - Natural positioning */}
            <group ref={leftArmRef} position={[-0.35, 0.98, 0]}>
                <mesh position={[0, -0.16, 0]} material={clothMaterial} castShadow>
                    <cylinderGeometry args={[0.05, 0.055, 0.32, 32]} />
                </mesh>
                <mesh position={[0, -0.33, 0]} material={skinMaterial} castShadow>
                    <sphereGeometry args={[0.05, 32, 32]} />
                </mesh>
                <mesh position={[0, -0.52, 0]} material={skinMaterial} castShadow>
                    <cylinderGeometry args={[0.042, 0.048, 0.35, 32]} />
                </mesh>
                <mesh position={[0, -0.74, 0]} material={skinMaterial} castShadow>
                    <boxGeometry args={[0.075, 0.11, 0.035]} />
                </mesh>
            </group>

            <group ref={rightArmRef} position={[0.35, 0.98, 0]}>
                <mesh position={[0, -0.16, 0]} material={clothMaterial} castShadow>
                    <cylinderGeometry args={[0.05, 0.055, 0.32, 32]} />
                </mesh>
                <mesh position={[0, -0.33, 0]} material={skinMaterial} castShadow>
                    <sphereGeometry args={[0.05, 32, 32]} />
                </mesh>
                <mesh position={[0, -0.52, 0]} material={skinMaterial} castShadow>
                    <cylinderGeometry args={[0.042, 0.048, 0.35, 32]} />
                </mesh>
                <mesh position={[0, -0.74, 0]} material={skinMaterial} castShadow>
                    <boxGeometry args={[0.075, 0.11, 0.035]} />
                </mesh>
            </group>

            {/* Hips - Female proportions */}
            <mesh position={[0, 0.12, 0]} material={pantsMaterial} castShadow>
                <boxGeometry args={[0.42, 0.24, 0.24]} />
            </mesh>

            {/* Legs */}
            <group ref={leftLegRef} position={[-0.12, -0.02, 0]}>
                <mesh position={[0, -0.26, 0]} material={pantsMaterial} castShadow>
                    <cylinderGeometry args={[0.075, 0.07, 0.48, 32]} />
                </mesh>
                <mesh position={[0, -0.51, 0]} material={pantsMaterial} castShadow>
                    <sphereGeometry args={[0.07, 32, 32]} />
                </mesh>
                <mesh position={[0, -0.76, 0]} material={pantsMaterial} castShadow>
                    <cylinderGeometry args={[0.06, 0.055, 0.48, 32]} />
                </mesh>
                <mesh position={[0, -1.01, 0]} material={skinMaterial} castShadow>
                    <sphereGeometry args={[0.055, 32, 32]} />
                </mesh>
                <mesh position={[0, -1.09, 0.055]} material={shoesMaterial} castShadow>
                    <boxGeometry args={[0.11, 0.09, 0.22]} />
                </mesh>
            </group>

            <group ref={rightLegRef} position={[0.12, -0.02, 0]}>
                <mesh position={[0, -0.26, 0]} material={pantsMaterial} castShadow>
                    <cylinderGeometry args={[0.075, 0.07, 0.48, 32]} />
                </mesh>
                <mesh position={[0, -0.51, 0]} material={pantsMaterial} castShadow>
                    <sphereGeometry args={[0.07, 32, 32]} />
                </mesh>
                <mesh position={[0, -0.76, 0]} material={pantsMaterial} castShadow>
                    <cylinderGeometry args={[0.06, 0.055, 0.48, 32]} />
                </mesh>
                <mesh position={[0, -1.01, 0]} material={skinMaterial} castShadow>
                    <sphereGeometry args={[0.055, 32, 32]} />
                </mesh>
                <mesh position={[0, -1.09, 0.055]} material={shoesMaterial} castShadow>
                    <boxGeometry args={[0.11, 0.09, 0.22]} />
                </mesh>
            </group>
        </group>
    );
}

/**
 * Photorealistic Avatar3D Component
 */
export default function Avatar3D({ isTalking = false, currentPhoneme = null, emotion = 'neutral' }) {
    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
            <Canvas shadows camera={{ position: [0, 0.6, 2.2], fov: 50 }}>
                <Suspense fallback={
                    <Html center>
                        <div style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>Loading Photorealistic Avatar...</div>
                    </Html>
                }>
                    {/* Studio lighting setup */}
                    <ambientLight intensity={0.35} />

                    {/* Key light - main illumination */}
                    <directionalLight
                        position={[4, 5, 4]}
                        intensity={1.5}
                        castShadow
                        shadow-mapSize-width={4096}
                        shadow-mapSize-height={4096}
                        shadow-camera-far={50}
                        shadow-camera-left={-10}
                        shadow-camera-right={10}
                        shadow-camera-top={10}
                        shadow-camera-bottom={-10}
                    />

                    {/* Fill light - soft shadows */}
                    <directionalLight
                        position={[-4, 3, -4]}
                        intensity={0.6}
                        color="#b8d4f1"
                    />

                    {/* Rim light - edge definition */}
                    <pointLight position={[0, 4, -4]} intensity={1.0} color="#8b9dc3" />

                    {/* Face light - highlight features */}
                    <spotLight
                        position={[0, 2, 3]}
                        angle={0.5}
                        penumbra={1}
                        intensity={0.8}
                        castShadow
                        color="#ffffff"
                    />

                    {/* Environment for realistic reflections */}
                    <Environment preset="studio" />

                    {/* Ground plane */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.75, 0]} receiveShadow>
                        <planeGeometry args={[10, 10]} />
                        <shadowMaterial opacity={0.25} />
                    </mesh>

                    {/* Photorealistic Avatar */}
                    <PhotorealisticAvatarModel isTalking={isTalking} emotion={emotion} />

                    {/* Camera Controls */}
                    <OrbitControls
                        enableZoom={true}
                        enablePan={false}
                        minDistance={1.6}
                        maxDistance={3.5}
                        minPolarAngle={Math.PI / 6}
                        maxPolarAngle={Math.PI / 1.7}
                        target={[0, 0.3, 0]}
                    />
                </Suspense>
            </Canvas>

            {/* Status Indicator */}
            {isTalking && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '30px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(99, 102, 241, 0.25)',
                        backdropFilter: 'blur(15px)',
                        border: '1px solid rgba(99, 102, 241, 0.6)',
                        borderRadius: '25px',
                        padding: '10px 20px',
                        color: '#fff',
                        fontSize: '15px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)'
                    }}
                >
                    <div
                        style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#10b981',
                            animation: 'pulse 1.5s ease-in-out infinite',
                            boxShadow: '0 0 10px #10b981'
                        }}
                    />
                    Speaking...
                </div>
            )}

            {/* Avatar Info Badge */}
            <div
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '15px',
                    padding: '12px 18px',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '600'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#10b981',
                        boxShadow: '0 0 10px #10b981'
                    }} />
                    <span>Photorealistic Avatar Active</span>
                </div>
            </div>
        </div>
    );
}
