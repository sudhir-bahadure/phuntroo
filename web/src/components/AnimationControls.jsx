import React from 'react';
import './AnimationControls.css';

/**
 * Animation Control Panel
 * Quick access buttons for avatar animations
 */
export default function AnimationControls({ onAnimationChange, currentAnimation }) {
    const animations = [
        { name: 'idle', label: 'Idle', icon: '🧍', description: 'Standing naturally' },
        { name: 'walk', label: 'Walk', icon: '🚶', description: 'Walking animation' },
        { name: 'laugh', label: 'Laugh', icon: '😂', description: '3-second laugh' },
        { name: 'talk', label: 'Talk', icon: '💬', description: 'Speaking animation' },
        { name: 'wave', label: 'Wave', icon: '👋', description: 'Greeting wave' },
        { name: 'thumbs-up', label: 'Thumbs Up', icon: '👍', description: 'Approval gesture' },
        { name: 'point', label: 'Point', icon: '☝️', description: 'Pointing gesture' },
        { name: 'shrug', label: 'Shrug', icon: '🤷', description: 'Confusion gesture' },
        { name: 'nod', label: 'Nod', icon: '✅', description: 'Yes gesture' },
        { name: 'shake-head', label: 'Shake Head', icon: '❌', description: 'No gesture' },
        { name: 'spin', label: 'Spin', icon: '🔄', description: 'Turn around' },
        { name: 'dance', label: 'Dance', icon: '💃', description: 'Dance moves' }
    ];

    return (
        <div className="animation-controls">
            <div className="controls-header">
                <h3>🎬 Animations</h3>
                <p className="controls-subtitle">Click to play animation</p>
            </div>

            <div className="animation-grid">
                {animations.map(anim => (
                    <button
                        key={anim.name}
                        className={`animation-btn ${currentAnimation === anim.name ? 'active' : ''}`}
                        onClick={() => onAnimationChange(anim.name)}
                        title={anim.description}
                    >
                        <span className="animation-icon">{anim.icon}</span>
                        <span className="animation-label">{anim.label}</span>
                    </button>
                ))}
            </div>

            <div className="quick-actions">
                <button
                    className="quick-action-btn"
                    onClick={() => {
                        onAnimationChange('laugh');
                        setTimeout(() => onAnimationChange('idle'), 3000);
                    }}
                >
                    😂 Make Her Laugh
                </button>
                <button
                    className="quick-action-btn"
                    onClick={() => {
                        onAnimationChange('wave');
                        setTimeout(() => onAnimationChange('idle'), 2000);
                    }}
                >
                    👋 Say Hi
                </button>
            </div>
        </div>
    );
}
