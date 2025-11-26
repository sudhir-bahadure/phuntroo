import React, { useEffect, useRef, useState } from 'react';
import { TalkingHead } from '../../lib/talkinghead.mjs';

export default function TalkingHeadAvatar({
    avatarState,
    visemes,
    isSeeing
}) {
    const containerRef = useRef(null);
    const avatarRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;

        const init = async () => {
            try {
                // Initialize TalkingHead
                const node = containerRef.current;
                const head = new TalkingHead(node, {
                    ttsLang: "en-GB",
                    lipsyncLang: "en",
                    cameraView: "upper", // Focus on upper body for chat
                    avatarIdleEyeContact: 0.5,
                    avatarSpeakingEyeContact: 0.8
                });

                // Load the avatar
                await head.showAvatar({
                    url: '/phuntroo/avatars/realistic-avatar.glb',
                    body: 'F',
                    avatarMood: 'neutral',
                    ttsVoice: "Google UK English Female"
                });

                // Try to load animations if they exist (optional)
                try {
                    await head.loadAnimation('walk', '/phuntroo/animations/walk.glb');
                    await head.loadAnimation('idle', '/phuntroo/animations/idle.glb');
                    await head.loadAnimation('wave', '/phuntroo/animations/wave.glb');
                } catch (e) {
                    console.log("Animations not found, using defaults");
                }

                avatarRef.current = head;
                setIsLoaded(true);

                // Start the animation loop
                const animate = () => {
                    // TalkingHead handles its own loop internally via requestAnimationFrame
                    // when we call start() or similar, but here we just let it sit
                };

            } catch (error) {
                console.error("Failed to init avatar:", error);
            }
        };

        init();

        return () => {
            // Cleanup if needed
            // avatarRef.current?.stop();
        };
    }, []);

    // Handle State Changes
    useEffect(() => {
        if (!avatarRef.current || !isLoaded) return;
        const head = avatarRef.current;

        if (avatarState === 'talking') {
            head.startLipsync(); // Ensure lipsync is active
            // If we had a specific talking gesture:
            // head.playAnimation('gesture-talk'); 
        } else if (avatarState === 'listening') {
            head.stopLipsync();
            // head.playAnimation('thinking');
        } else {
            head.stopLipsync();
            // head.playAnimation('idle');
        }

    }, [avatarState, isLoaded]);

    // Handle Visemes (Lip Sync from TTS)
    useEffect(() => {
        if (!avatarRef.current || !isLoaded || !visemes) return;

        // TalkingHead has its own internal TTS/Lipsync engine.
        // If we are using external TTS (like Coqui/Browser TTS) and getting visemes,
        // we need to map them. 
        // However, TalkingHead.mjs is designed to handle audio + lipsync internally 
        // or via its own speakText() method.

        // For now, we'll assume the external TTS service is playing audio
        // and we might need to trigger mouth shapes if possible.
        // But TalkingHead is best used by calling head.speakText(text).

    }, [visemes, isLoaded]);

    // Expose to window for direct control if needed
    useEffect(() => {
        if (isLoaded && avatarRef.current) {
            window.talkingHeadAvatar = avatarRef.current;
        }
    }, [isLoaded]);

    return (
        <div
            ref={containerRef}
            id="avatar-container"
            style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 0
            }}
        />
    );
}
