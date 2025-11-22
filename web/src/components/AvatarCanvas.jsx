import React, { useRef, useEffect, useState } from 'react';
import './AvatarCanvas.css';

/**
 * Enhanced Edith Live - Canvas-based Realistic Avatar
 * Features: Realistic facial rendering, dynamic clothing, expressions, animations
 */
export default function AvatarCanvas({
    isTalking = false,
    emotion = 'neutral',
    outfit = 'formal',
    onOutfitChange
}) {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const [time, setTime] = useState(0);
    const [blinkTime, setBlinkTime] = useState(0);
    const [hairStyle, setHairStyle] = useState('straight'); // straight, wavy, curly
    const [eyeColor, setEyeColor] = useState('#2d1810');
    const [lipColor, setLipColor] = useState('#c97064');

    // Outfit configurations
    const outfits = {
        formal: {
            name: 'Formal',
            topColor: '#1a2332',
            bottomColor: '#2c3e50',
            accentColor: '#e74c3c',
            tie: true,
            jacket: true
        },
        elegant: {
            name: 'Elegant',
            topColor: '#8e44ad',
            bottomColor: '#9b59b6',
            accentColor: '#f39c12',
            dress: true,
            flowing: true
        },
        casual: {
            name: 'Casual',
            topColor: '#3498db',
            bottomColor: '#34495e',
            accentColor: '#ecf0f1',
            relaxed: true
        },
        sporty: {
            name: 'Sporty',
            topColor: '#e74c3c',
            bottomColor: '#2c3e50',
            accentColor: '#f1c40f',
            stripes: true,
            athletic: true
        }
    };

    const currentOutfit = outfits[outfit] || outfits.formal;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        // Set canvas size
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        let animationTime = 0;
        let lastBlinkTime = 0;

        const animate = () => {
            animationTime += 0.016; // ~60fps
            setTime(animationTime);

            // Random blinking
            if (animationTime - lastBlinkTime > 3 + Math.random() * 2) {
                setBlinkTime(animationTime);
                lastBlinkTime = animationTime;
            }

            drawAvatar(ctx, rect.width, rect.height, animationTime);
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isTalking, emotion, outfit, hairStyle, eyeColor, lipColor]);

    const drawAvatar = (ctx, width, height, t) => {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Center coordinates
        const cx = width / 2;
        const cy = height / 2;
        const scale = Math.min(width, height) / 600;

        // Breathing animation
        const breathe = Math.sin(t * 0.7) * 0.008;
        const bodyScale = 1 + breathe;

        // Talking animation
        const jawOpen = isTalking ? Math.abs(Math.sin(t * 8)) * 0.15 : 0;

        // Head movement when talking
        const headTilt = isTalking ? Math.sin(t * 1.3) * 0.05 : Math.sin(t * 0.3) * 0.02;
        const headRotate = isTalking ? Math.sin(t * 1.1) * 0.03 : 0;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);

        // Draw glow effect based on emotion
        drawGlowEffect(ctx, emotion, t);

        // Draw body
        drawBody(ctx, currentOutfit, bodyScale, t);

        // Draw head
        ctx.save();
        ctx.translate(0, -180);
        ctx.rotate(headRotate);
        drawHead(ctx, jawOpen, headTilt, t);
        ctx.restore();

        ctx.restore();
    };

    const drawGlowEffect = (ctx, emotion, t) => {
        const glowColors = {
            happy: '#10b981',
            thinking: '#3b82f6',
            neutral: '#6366f1',
            surprised: '#f59e0b'
        };

        const color = glowColors[emotion] || glowColors.neutral;
        const pulse = 0.3 + Math.sin(t * 2) * 0.1;

        ctx.save();
        ctx.globalAlpha = pulse;
        const gradient = ctx.createRadialGradient(0, -100, 50, 0, -100, 150);
        gradient.addColorStop(0, color + '40');
        gradient.addColorStop(1, color + '00');
        ctx.fillStyle = gradient;
        ctx.fillRect(-200, -300, 400, 400);
        ctx.restore();
    };

    const drawBody = (ctx, outfit, scale, t) => {
        ctx.save();
        ctx.scale(1, scale);

        if (outfit.dress) {
            // Elegant dress
            drawDress(ctx, outfit, t);
        } else if (outfit.athletic) {
            // Sporty outfit
            drawSportyOutfit(ctx, outfit, t);
        } else if (outfit.jacket) {
            // Formal jacket
            drawFormalOutfit(ctx, outfit, t);
        } else {
            // Casual outfit
            drawCasualOutfit(ctx, outfit, t);
        }

        ctx.restore();
    };

    const drawFormalOutfit = (ctx, outfit, t) => {
        // Jacket
        ctx.fillStyle = outfit.topColor;
        ctx.beginPath();
        ctx.moveTo(-60, -50);
        ctx.lineTo(-80, 100);
        ctx.lineTo(-40, 100);
        ctx.lineTo(-30, -50);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(60, -50);
        ctx.lineTo(80, 100);
        ctx.lineTo(40, 100);
        ctx.lineTo(30, -50);
        ctx.closePath();
        ctx.fill();

        // Shirt
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-30, -50, 60, 80);

        // Tie
        if (outfit.tie) {
            ctx.fillStyle = outfit.accentColor;
            ctx.beginPath();
            ctx.moveTo(0, -40);
            ctx.lineTo(-8, -30);
            ctx.lineTo(-6, 20);
            ctx.lineTo(6, 20);
            ctx.lineTo(8, -30);
            ctx.closePath();
            ctx.fill();
        }

        // Pants
        ctx.fillStyle = outfit.bottomColor;
        ctx.fillRect(-35, 100, 30, 120);
        ctx.fillRect(5, 100, 30, 120);
    };

    const drawDress = (ctx, outfit, t) => {
        const flow = Math.sin(t * 2) * 5;

        // Dress top
        ctx.fillStyle = outfit.topColor;
        ctx.beginPath();
        ctx.moveTo(-50, -50);
        ctx.lineTo(-60, 50);
        ctx.lineTo(60, 50);
        ctx.lineTo(50, -50);
        ctx.closePath();
        ctx.fill();

        // Flowing skirt
        ctx.fillStyle = outfit.bottomColor;
        ctx.beginPath();
        ctx.moveTo(-60, 50);
        ctx.quadraticCurveTo(-80 + flow, 150, -70, 220);
        ctx.lineTo(70, 220);
        ctx.quadraticCurveTo(80 - flow, 150, 60, 50);
        ctx.closePath();
        ctx.fill();

        // Accent belt
        ctx.fillStyle = outfit.accentColor;
        ctx.fillRect(-60, 45, 120, 10);
    };

    const drawSportyOutfit = (ctx, outfit, t) => {
        // Athletic top
        ctx.fillStyle = outfit.topColor;
        ctx.fillRect(-50, -50, 100, 80);

        // Stripes
        if (outfit.stripes) {
            ctx.fillStyle = outfit.accentColor;
            ctx.fillRect(-50, -30, 100, 8);
            ctx.fillRect(-50, -10, 100, 8);
        }

        // Athletic pants
        ctx.fillStyle = outfit.bottomColor;
        ctx.fillRect(-35, 100, 30, 120);
        ctx.fillRect(5, 100, 30, 120);

        // Side stripes
        ctx.fillStyle = outfit.accentColor;
        ctx.fillRect(-38, 100, 4, 120);
        ctx.fillRect(34, 100, 4, 120);
    };

    const drawCasualOutfit = (ctx, outfit, t) => {
        // Casual shirt
        ctx.fillStyle = outfit.topColor;
        ctx.fillRect(-50, -50, 100, 80);

        // Pocket
        ctx.strokeStyle = outfit.accentColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(-30, -20, 20, 20);

        // Jeans
        ctx.fillStyle = outfit.bottomColor;
        ctx.fillRect(-35, 100, 30, 120);
        ctx.fillRect(5, 100, 30, 120);

        // Seam lines
        ctx.strokeStyle = '#7f8c8d';
        ctx.beginPath();
        ctx.moveTo(-20, 100);
        ctx.lineTo(-20, 220);
        ctx.moveTo(20, 100);
        ctx.lineTo(20, 220);
        ctx.stroke();
    };

    const drawHead = (ctx, jawOpen, tilt, t) => {
        ctx.save();
        ctx.rotate(tilt);

        // Neck
        ctx.fillStyle = '#d4a574';
        ctx.fillRect(-15, 50, 30, 40);

        // Face
        ctx.fillStyle = '#d4a574';
        ctx.beginPath();
        ctx.ellipse(0, 0, 50, 60, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.fillStyle = '#c9a882';
        ctx.beginPath();
        ctx.ellipse(-50, 0, 12, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(50, 0, 12, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        drawHair(ctx, hairStyle, t);

        // Eyes
        drawEyes(ctx, t);

        // Eyebrows
        ctx.strokeStyle = '#0d0806';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        const eyebrowY = emotion === 'surprised' ? -25 : -20;
        const eyebrowCurve = emotion === 'happy' ? -3 : emotion === 'surprised' ? -5 : 0;

        ctx.beginPath();
        ctx.moveTo(-35, eyebrowY);
        ctx.quadraticCurveTo(-25, eyebrowY + eyebrowCurve, -15, eyebrowY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(35, eyebrowY);
        ctx.quadraticCurveTo(25, eyebrowY + eyebrowCurve, 15, eyebrowY);
        ctx.stroke();

        // Nose
        ctx.strokeStyle = '#b89968';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.lineTo(-5, 15);
        ctx.moveTo(0, 15);
        ctx.lineTo(5, 15);
        ctx.stroke();

        // Mouth
        drawMouth(ctx, jawOpen, emotion);

        ctx.restore();
    };

    const drawHair = (ctx, style, t) => {
        ctx.fillStyle = '#0d0806';

        // Top of head
        ctx.beginPath();
        ctx.ellipse(0, -30, 55, 40, 0, Math.PI, Math.PI * 2);
        ctx.fill();

        // Sides
        if (style === 'straight') {
            ctx.fillRect(-55, -30, 10, 60);
            ctx.fillRect(45, -30, 10, 60);
        } else if (style === 'wavy') {
            for (let i = 0; i < 3; i++) {
                const wave = Math.sin(t * 2 + i) * 3;
                ctx.beginPath();
                ctx.ellipse(-50 + wave, -10 + i * 20, 8, 15, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(50 - wave, -10 + i * 20, 8, 15, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (style === 'curly') {
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.arc(-50, -20 + i * 15, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(50, -20 + i * 15, 6, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Back hair
        ctx.fillRect(-35, 30, 70, 25);
    };

    const drawEyes = (ctx, t) => {
        const isBlinking = (t - blinkTime) < 0.15;
        const blinkAmount = isBlinking ? 1 - ((t - blinkTime) / 0.15) : 0;

        // Left eye
        ctx.save();
        ctx.translate(-25, -5);

        // Eye white
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 10 * (1 - blinkAmount * 0.9), 0, 0, Math.PI * 2);
        ctx.fill();

        if (!isBlinking || blinkAmount < 0.5) {
            // Iris
            ctx.fillStyle = eyeColor;
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
        }
        ctx.restore();

        // Right eye
        ctx.save();
        ctx.translate(25, -5);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 10 * (1 - blinkAmount * 0.9), 0, 0, Math.PI * 2);
        ctx.fill();

        if (!isBlinking || blinkAmount < 0.5) {
            ctx.fillStyle = eyeColor;
            ctx.beginPath();
            ctx.arc(0, 0, 7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(0, 0, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-2, -2, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    };

    const drawMouth = (ctx, jawOpen, emotion) => {
        ctx.save();
        ctx.translate(0, 25);

        // Lips
        ctx.fillStyle = lipColor;

        if (emotion === 'happy') {
            // Smile
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0.2, Math.PI - 0.2);
            ctx.lineWidth = 4;
            ctx.strokeStyle = lipColor;
            ctx.stroke();
        } else if (emotion === 'surprised') {
            // Open mouth
            ctx.beginPath();
            ctx.ellipse(0, 5, 12, 15, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Neutral/talking
            const mouthOpen = jawOpen * 15;

            // Upper lip
            ctx.beginPath();
            ctx.ellipse(0, -mouthOpen / 2, 18, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Lower lip
            ctx.beginPath();
            ctx.ellipse(0, mouthOpen / 2, 18, 5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Mouth opening
            if (mouthOpen > 2) {
                ctx.fillStyle = '#3d1f1f';
                ctx.beginPath();
                ctx.ellipse(0, 0, 15, mouthOpen / 2, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    };

    return (
        <div className="avatar-canvas-container">
            <canvas
                ref={canvasRef}
                className="avatar-canvas"
            />

            {/* Outfit Controls */}
            <div className="outfit-controls">
                <div className="outfit-label">Outfit: {currentOutfit.name}</div>
                <div className="outfit-buttons">
                    {Object.keys(outfits).map(key => (
                        <button
                            key={key}
                            className={`outfit-btn ${outfit === key ? 'active' : ''}`}
                            onClick={() => onOutfitChange && onOutfitChange(key)}
                            title={outfits[key].name}
                        >
                            {outfits[key].name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Customization Controls */}
            <div className="customization-controls">
                <div className="control-group">
                    <label>Hair Style:</label>
                    <select value={hairStyle} onChange={(e) => setHairStyle(e.target.value)}>
                        <option value="straight">Straight</option>
                        <option value="wavy">Wavy</option>
                        <option value="curly">Curly</option>
                    </select>
                </div>
            </div>

            {/* Status Indicator */}
            {isTalking && (
                <div className="talking-indicator">
                    <div className="pulse-dot" />
                    Speaking...
                </div>
            )}
        </div>
    );
}
