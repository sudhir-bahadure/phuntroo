import React, { useRef, useEffect, useState } from 'react';
import './AvatarVideo.css';

/**
 * Animated Video Avatar Component with Lip-Sync and Expressions
 * Features: Realistic lip movement, facial expressions, eye blinking
 */
export default function AvatarVideo({
    isTalking = false,
    emotion = 'neutral',
    outfit = 'casual',
    onOutfitChange
}) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [useImage, setUseImage] = useState(false);
    const [mouthState, setMouthState] = useState('closed'); // closed, open, wide
    const [eyeState, setEyeState] = useState('open'); // open, closed, half
    const [expressionIntensity, setExpressionIntensity] = useState(0);

    // Mood-based glow colors
    const moodColors = {
        happy: { ring: 'ring-green-500', glow: 'shadow-green-500/50', label: 'Happy', emoji: '😊' },
        thinking: { ring: 'ring-blue-500', glow: 'shadow-blue-500/50', label: 'Thinking', emoji: '🤔' },
        neutral: { ring: 'ring-purple-500', glow: 'shadow-purple-500/50', label: 'Neutral', emoji: '😐' },
        surprised: { ring: 'ring-yellow-500', glow: 'shadow-yellow-500/50', label: 'Surprised', emoji: '😲' }
    };

    const currentMood = moodColors[emotion] || moodColors.neutral;

    // Outfit configurations
    const outfits = {
        formal: { name: 'Formal', color: '#1a2332', icon: '👔' },
        elegant: { name: 'Elegant', color: '#8e44ad', icon: '👗' },
        casual: { name: 'Casual', color: '#3498db', icon: '👕' },
        sporty: { name: 'Sporty', color: '#e74c3c', icon: '🏃' }
    };

    const currentOutfit = outfits[outfit] || outfits.casual;

    // Lip-sync animation when talking
    useEffect(() => {
        if (!isTalking) {
            setMouthState('closed');
            return;
        }

        let frame = 0;
        const mouthSequence = ['closed', 'open', 'wide', 'open', 'closed', 'open', 'wide', 'open'];

        const interval = setInterval(() => {
            setMouthState(mouthSequence[frame % mouthSequence.length]);
            frame++;
        }, 100); // Change mouth shape every 100ms

        return () => clearInterval(interval);
    }, [isTalking]);

    // Eye blinking animation
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setEyeState('closed');
            setTimeout(() => setEyeState('open'), 150);
        }, 3000 + Math.random() * 2000); // Blink every 3-5 seconds

        return () => clearInterval(blinkInterval);
    }, []);

    // Expression intensity animation
    useEffect(() => {
        let intensity = 0;
        const direction = 1;

        const interval = setInterval(() => {
            intensity += direction * 0.05;
            if (intensity >= 1) intensity = 1;
            if (intensity <= 0) intensity = 0;
            setExpressionIntensity(intensity);
        }, 50);

        return () => clearInterval(interval);
    }, [emotion]);

    // Check if video file exists, fallback to image
    useEffect(() => {
        const checkVideo = async () => {
            try {
                const response = await fetch('/avatar-edith.mp4', { method: 'HEAD' });
                if (response.ok && videoRef.current) {
                    setUseImage(false);
                    videoRef.current.load();
                } else {
                    setUseImage(true);
                }
            } catch (error) {
                setUseImage(true);
            }
        };
        checkVideo();
    }, []);

    // Draw facial animations on canvas
    useEffect(() => {
        if (!canvasRef.current || !useImage) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const drawFacialFeatures = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const faceY = canvas.height * 0.35; // Face position

            // Draw mouth based on state
            ctx.save();
            ctx.translate(centerX, faceY + 80);

            if (mouthState === 'closed') {
                // Closed mouth - horizontal line
                ctx.strokeStyle = emotion === 'happy' ? '#ff6b9d' : '#c97064';
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(-20, 0);
                ctx.quadraticCurveTo(0, emotion === 'happy' ? -5 : 2, 20, 0);
                ctx.stroke();
            } else if (mouthState === 'open') {
                // Open mouth - oval
                ctx.fillStyle = '#3d1f1f';
                ctx.beginPath();
                ctx.ellipse(0, 0, 15, 10, 0, 0, Math.PI * 2);
                ctx.fill();

                // Lips
                ctx.strokeStyle = '#c97064';
                ctx.lineWidth = 2;
                ctx.stroke();
            } else if (mouthState === 'wide') {
                // Wide open mouth
                ctx.fillStyle = '#3d1f1f';
                ctx.beginPath();
                ctx.ellipse(0, 0, 18, 15, 0, 0, Math.PI * 2);
                ctx.fill();

                // Lips
                ctx.strokeStyle = '#c97064';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            ctx.restore();

            // Draw eyes based on state
            const drawEye = (x, y) => {
                ctx.save();
                ctx.translate(x, y);

                if (eyeState === 'open') {
                    // Eye white
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 12, 10, 0, 0, Math.PI * 2);
                    ctx.fill();

                    // Iris
                    ctx.fillStyle = '#2d1810';
                    ctx.beginPath();
                    ctx.arc(0, 0, 7, 0, Math.PI * 2);
                    ctx.fill();

                    // Pupil
                    ctx.fillStyle = '#000000';
                    ctx.beginPath();
                    ctx.arc(0, 0, 3, 0, Math.PI * 2);
                    ctx.fill();

                    // Highlight
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(-2, -2, 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (eyeState === 'closed') {
                    // Closed eye - line
                    ctx.strokeStyle = '#2d1810';
                    ctx.lineWidth = 2;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.moveTo(-12, 0);
                    ctx.lineTo(12, 0);
                    ctx.stroke();
                }

                ctx.restore();
            };

            // Draw both eyes
            drawEye(centerX - 40, faceY - 10);
            drawEye(centerX + 40, faceY - 10);

            // Draw eyebrows based on emotion
            const drawEyebrow = (x, y, angle) => {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(angle);
                ctx.strokeStyle = '#0d0806';
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(-15, 0);
                ctx.quadraticCurveTo(0, -3, 15, 0);
                ctx.stroke();
                ctx.restore();
            };

            if (emotion === 'happy') {
                drawEyebrow(centerX - 40, faceY - 30, -0.1);
                drawEyebrow(centerX + 40, faceY - 30, 0.1);
            } else if (emotion === 'surprised') {
                drawEyebrow(centerX - 40, faceY - 35, 0);
                drawEyebrow(centerX + 40, faceY - 35, 0);
            } else {
                drawEyebrow(centerX - 40, faceY - 25, 0);
                drawEyebrow(centerX + 40, faceY - 25, 0);
            }

            requestAnimationFrame(drawFacialFeatures);
        };

        drawFacialFeatures();
    }, [mouthState, eyeState, emotion, useImage]);

    const handleVideoLoad = () => {
        setIsVideoLoaded(true);
    };

    const handleVideoError = () => {
        setUseImage(true);
    };

    return (
        <div className="avatar-video-container">
            {/* Main Avatar Display */}
            <div className="avatar-video-wrapper">
                {/* Background glow effect */}
                <div className="avatar-background-glow">
                    <div className={`glow-orb ${emotion}`} />
                </div>

                {/* Avatar media (video or image with canvas overlay) */}
                <div className={`avatar-media-container ${isTalking ? 'talking' : ''}`}>
                    {!useImage ? (
                        <video
                            ref={videoRef}
                            className={`avatar-video ${currentMood.ring} ${isTalking ? 'ring-4 ring-offset-2' : 'ring-2'} ${currentMood.glow}`}
                            autoPlay
                            muted
                            loop
                            playsInline
                            onLoadedData={handleVideoLoad}
                            onError={handleVideoError}
                        >
                            <source src="/avatar-edith.mp4" type="video/mp4" />
                        </video>
                    ) : (
                        <div className={`avatar-image-container ${currentMood.ring} ${isTalking ? 'ring-4 ring-offset-2' : 'ring-2'} ${currentMood.glow}`}>
                            <img
                                src="/edith-avatar.png"
                                alt="Edith Avatar"
                                className={`avatar-image ${isTalking ? 'talking-animation' : ''}`}
                            />
                            {/* Canvas overlay for facial animations */}
                            <canvas
                                ref={canvasRef}
                                width="400"
                                height="600"
                                className="facial-animation-canvas"
                            />
                            {/* Expression emoji overlay */}
                            <div className={`expression-overlay ${emotion}`}>
                                <span className="expression-emoji">{currentMood.emoji}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Bar */}
                <div className="avatar-status-bar">
                    <div className="status-left">
                        <div className="status-item">
                            <span className="status-label">Outfit:</span>
                            <span className="status-value" style={{ color: currentOutfit.color }}>
                                {currentOutfit.icon} {currentOutfit.name}
                            </span>
                        </div>
                        <div className="status-item">
                            <span className="status-label">Mood:</span>
                            <span className="status-value" style={{ color: currentMood.ring.replace('ring-', '#') }}>
                                {currentMood.emoji} {currentMood.label}
                            </span>
                        </div>
                    </div>
                    <div className="status-right">
                        <div className="online-indicator">
                            <span className="online-dot"></span>
                            <span className="online-text">Online</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Outfit Selector */}
            <div className="outfit-selector">
                <div className="outfit-label">Change Outfit:</div>
                <div className="outfit-buttons">
                    {Object.keys(outfits).map(key => (
                        <button
                            key={key}
                            className={`outfit-btn ${outfit === key ? 'active' : ''}`}
                            onClick={() => onOutfitChange && onOutfitChange(key)}
                            style={{
                                borderColor: outfit === key ? outfits[key].color : 'transparent'
                            }}
                        >
                            {outfits[key].icon} {outfits[key].name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Info Badge */}
            <div className="avatar-info-badge">
                <div className="badge-icon">🎥</div>
                <div className="badge-text">
                    <div className="badge-title">Animated Avatar</div>
                    <div className="badge-subtitle">Lip-Sync Active</div>
                </div>
            </div>

            {/* Talking Indicator */}
            {isTalking && (
                <div className="talking-status">
                    <div className="pulse-dot"></div>
                    <span>Speaking...</span>
                </div>
            )}
        </div>
    );
}
