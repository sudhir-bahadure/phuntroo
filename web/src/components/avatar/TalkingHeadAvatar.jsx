import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import TalkingHead from '../../lib/TalkingHead';

/**
 * AvatarScene - Inner component that handles Three.js scene
 */
function AvatarScene({
    avatarUrl,
    animations,
    currentAnimation,
    visemes,
    avatarState,
    isSeeing
}) {
    const { scene } = useThree();
    const talkingHead = useRef(null);
    const [loaded, setLoaded] = useState(false);

    // Initialize avatar
    useEffect(() => {
        const init = async () => {
            const th = new TalkingHead();

            try {
                // Load avatar
                await th.loadAvatar(scene, avatarUrl);

                // Load animations
                for (const [name, url] of Object.entries(animations)) {
                    try {
                        await th.loadAnimation(name, url);
                    } catch (error) {
                        console.warn(`Failed to load animation ${name}:`, error);
                    }
                }

                talkingHead.current = th;
                setLoaded(true);

                // Play default idle animation
                th.playAnimation('idle');
            } catch (error) {
                console.error('Failed to initialize avatar:', error);
            }
        };

        init();

        return () => {
            if (talkingHead.current) {
                talkingHead.current.dispose();
            }
        };
    }, [scene, avatarUrl, animations]);

    // Update animation based on state
    useEffect(() => {
        if (!loaded || !talkingHead.current) return;

        const th = talkingHead.current;

        // Map avatar state to animation
        let animName = 'idle';

        if (avatarState === 'talking') {
            animName = 'gesture-talk';
        } else if (avatarState === 'listening') {
            animName = 'thinking';
        } else if (avatarState === 'thinking') {
            animName = 'thinking';
        } else if (currentAnimation) {
            animName = currentAnimation;
        }

        th.playAnimation(animName);
    }, [loaded, avatarState, currentAnimation]);

    // Update visemes for lip-sync
    useEffect(() => {
        if (!loaded || !talkingHead.current || !visemes) return;

        // Apply visemes from TTS
        Object.entries(visemes).forEach(([viseme, value]) => {
            talkingHead.current.setViseme(viseme, value);
        });
    }, [loaded, visemes]);

    // Look at camera when seeing
    useEffect(() => {
        if (!loaded || !talkingHead.current) return;

        if (isSeeing) {
            // Make avatar look at camera
            talkingHead.current.lookAt(0, 0, 2);
        }
    }, [loaded, isSeeing]);

    // Animation loop
    useFrame(() => {
        if (talkingHead.current) {
            talkingHead.current.update();
        }
    });

    return null;
}

/**
 * TalkingHeadAvatar - Main component
 */
export default function TalkingHeadAvatar({
    avatarState = 'idle',
    expression = 'neutral',
    visemes = {},
    url // Kept for compatibility but not used (we use GLB now)
}) {
    // Animation paths (will be loaded from public/animations)
    const [currentAnimation, setCurrentAnimation] = useState('idle');
    const [isSeeing, setIsSeeing] = useState(false);

    const animations = {
        walk: '/phuntroo/animations/walk.glb',
        idle: '/phuntroo/animations/idle.glb',
        wave: '/phuntroo/animations/wave.glb',
        'gesture-talk': '/phuntroo/animations/gesture-talk.glb',
        thinking: '/phuntroo/animations/thinking.glb'
    };

    // Random autonomous actions
    useEffect(() => {
        const interval = setInterval(() => {
            // 20% chance to do something
            if (Math.random() < 0.2 && avatarState === 'idle') {
                const actions = ['walk', 'wave', 'idle'];
                const action = actions[Math.floor(Math.random() * actions.length)];
                setCurrentAnimation(action);

                // Reset to idle after animation
                setTimeout(() => {
                    setCurrentAnimation('idle');
                }, 5000);
            }
        }, 10000); // Check every 10 seconds

        return () => clearInterval(interval);
    }, [avatarState]);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 2.5]} />

                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={0.8} />
                <spotLight
                    position={[0, 3, 0]}
                    angle={0.3}
                    penumbra={1}
                    intensity={0.5}
                    castShadow
                />

                {/* Avatar */}
                <AvatarScene
                    avatarUrl="/phuntroo/avatars/realistic-female.glb"
                    animations={animations}
                    currentAnimation={currentAnimation}
                    visemes={visemes}
                    avatarState={avatarState}
                    isSeeing={isSeeing}
                />

                {/* Controls (optional - for debugging) */}
                {/* <OrbitControls /> */}
            </Canvas>
        </div>
    );
}
