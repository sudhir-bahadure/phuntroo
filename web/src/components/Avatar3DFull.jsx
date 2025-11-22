import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import './Avatar3DFull.css';

/**
 * Realistic 3D Human Avatar using Ready Player Me
 * Free realistic full-body 3D models with animations
 */
function RealisticHumanAvatar({ animation }) {
    const groupRef = useRef();

    // Load Ready Player Me avatar (realistic 3D human)
    // Using a pre-made female avatar URL
    const avatarUrl = 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb';

    const { scene, animations: modelAnimations } = useGLTF(avatarUrl, true);
    const [mixer] = useState(() => new THREE.AnimationMixer(scene));
    const [actions, setActions] = useState({});

    useEffect(() => {
        if (modelAnimations && modelAnimations.length > 0) {
            const newActions = {};
            modelAnimations.forEach((clip) => {
                const action = mixer.clipAction(clip);
                newActions[clip.name] = action;
            });
            setActions(newActions);

            // Play first animation by default
            if (modelAnimations[0]) {
                mixer.clipAction(modelAnimations[0]).play();
            }
        }
    }, [modelAnimations, mixer]);

    // Update animation mixer
    useFrame((state, delta) => {
        mixer.update(delta);

        // Gentle breathing animation
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
        }
    });

    return (
        <group ref={groupRef}>
            <primitive
                object={scene}
                scale={1}
                position={[0, -1, 0]}
            />
        </group>
    );
}

/**
 * Loading indicator
 */
function LoadingAvatar() {
    const meshRef = useRef();

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.02;
        }
    });

    return (
        <group>
            <mesh ref={meshRef} position={[0, 0, 0]}>
                <capsuleGeometry args={[0.3, 1.2, 16, 32]} />
                <meshStandardMaterial color="#8b5cf6" wireframe />
            </mesh>
            <mesh position={[0, 1.2, 0]}>
                <sphereGeometry args={[0.35, 32, 32]} />
                <meshStandardMaterial color="#ec4899" wireframe />
            </mesh>
        </group>
    );
}

/**
 * Full-Body 3D Avatar Component
 */
export default function Avatar3DFullComponent({
    animation = 'idle',
    outfit = 'casual',
    expression = 'neutral',
    onAnimationComplete,
    className = ''
}) {
    const [currentAnimation, setCurrentAnimation] = useState(animation);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setCurrentAnimation(animation);
    }, [animation]);

    return (
        <div className={`avatar-3d-full-container ${className}`}>
            <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
                {/* Camera */}
                <PerspectiveCamera makeDefault position={[0, 1.6, 2.5]} fov={50} />

                {/* Lighting - Professional setup */}
                <ambientLight intensity={0.4} />

                {/* Key light */}
                <directionalLight
                    position={[5, 5, 5]}
                    intensity={1.2}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                    shadow-camera-far={50}
                    shadow-camera-left={-10}
                    shadow-camera-right={10}
                    shadow-camera-top={10}
                    shadow-camera-bottom={-10}
                />

                {/* Fill light */}
                <directionalLight
                    position={[-3, 2, -5]}
                    intensity={0.5}
                />

                {/* Rim light */}
                <spotLight
                    position={[0, 5, -5]}
                    angle={0.3}
                    penumbra={1}
                    intensity={0.8}
                    castShadow
                />

                {/* Environment for realistic reflections */}
                <Environment preset="city" />

                {/* Realistic Human Avatar */}
                <Suspense fallback={<LoadingAvatar />}>
                    <RealisticHumanAvatar
                        animation={currentAnimation}
                        onLoad={() => setIsLoading(false)}
                    />
                </Suspense>

                {/* Ground plane with realistic shadow */}
                <mesh
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0, -1, 0]}
                    receiveShadow
                >
                    <planeGeometry args={[20, 20]} />
                    <shadowMaterial opacity={0.4} />
                </mesh>

                {/* Subtle fog for depth */}
                <fog attach="fog" args={['#0a0a1a', 5, 15]} />

                {/* Camera Controls */}
                <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    minDistance={1.5}
                    maxDistance={5}
                    minPolarAngle={Math.PI / 6}
                    maxPolarAngle={Math.PI / 2}
                    target={[0, 0.8, 0]}
                    enableDamping
                    dampingFactor={0.05}
                />
            </Canvas>

            {/* Animation Status */}
            <div className="animation-status">
                <div className="status-dot"></div>
                <span>{currentAnimation}</span>
            </div>

            {/* Loading Indicator */}
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-content">
                        <div className="loading-spinner"></div>
                        <h3>🎭 Loading Realistic 3D Human Avatar...</h3>
                        <p>Fetching full-body model from Ready Player Me</p>
                        <p className="fallback-note">This may take a few seconds</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// Preload the avatar model
useGLTF.preload('https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb');
