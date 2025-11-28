import React, { useState } from 'react';
import { avatarAnalyzer } from '../services/analysis/AvatarAnalyzer';
import { proceduralMotionEngine } from '../services/motion/ProceduralMotionEngine';
import { micAnalyzer } from '../services/audio/MicAnalyzer';
import './AvatarAnalysisPanel.css';

export default function AvatarAnalysisPanel({ vrmModel }) {
    const [analysis, setAnalysis] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [micLevel, setMicLevel] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleAnalyze = () => {
        if (!vrmModel) {
            setSuggestions(['No avatar loaded']);
            return;
        }

        const result = avatarAnalyzer.analyze(vrmModel);
        const sug = avatarAnalyzer.generateSuggestions(result);

        setAnalysis(result);
        setSuggestions(sug);

        console.log('📊 Avatar Analysis:', result);
    };

    const handleRandomizeMotion = () => {
        proceduralMotionEngine.randomizeSeed();
    };

    const handleEnableMic = async () => {
        const success = await micAnalyzer.initialize();
        if (success) {
            // Update mic level continuously
            const updateLevel = () => {
                if (micAnalyzer.isReady()) {
                    const level = micAnalyzer.getCurrentLevel();
                    setMicLevel(level);
                    window.micLevel = level; // Make it available globally for VRMAvatar
                    requestAnimationFrame(updateLevel);
                }
            };
            updateLevel();
        }
    };

    return (
        <div className="avatar-analysis-panel">
            <div
                className="panel-header"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span>🔬 Avatar Analysis</span>
                <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
            </div>

            {isExpanded && (
                <div className="panel-content">
                    {/* Mic Level Indicator */}
                    <div className="mic-section">
                        <div className="section-title">Mic-Reactive Motion</div>
                        <button onClick={handleEnableMic} disabled={micAnalyzer.isReady()}>
                            {micAnalyzer.isReady() ? '✅ Mic Active' : '🎤 Enable Mic'}
                        </button>
                        <div className="mic-level-bar">
                            <div
                                className="mic-level-fill"
                                style={{ width: `${micLevel * 100}%` }}
                            />
                        </div>
                        <small>Voice intensity affects body movement</small>
                    </div>

                    {/* Motion Controls */}
                    <div className="motion-section">
                        <div className="section-title">Procedural Motion</div>
                        <button onClick={handleRandomizeMotion}>
                            🎲 Randomize Movement Pattern
                        </button>
                        <small>Changes natural variation seed</small>
                    </div>

                    {/* Analysis */}
                    <div className="analysis-section">
                        <div className="section-title">Model Analysis</div>
                        <button onClick={handleAnalyze}>
                            📊 Analyze Avatar
                        </button>

                        {analysis && (
                            <div className="analysis-results">
                                <div className="stat">
                                    <span>Meshes:</span>
                                    <span>{analysis.meshCount}</span>
                                </div>
                                <div className="stat">
                                    <span>Polygons:</span>
                                    <span>{analysis.polyCount.toLocaleString()}</span>
                                </div>
                                <div className="stat">
                                    <span>Materials:</span>
                                    <span>{analysis.materialCount}</span>
                                </div>
                                <div className="stat">
                                    <span>Bones:</span>
                                    <span>{analysis.boneCount}</span>
                                </div>
                            </div>
                        )}

                        {suggestions.length > 0 && (
                            <div className="suggestions">
                                <div className="section-title">Suggestions</div>
                                {suggestions.map((sug, idx) => (
                                    <div key={idx} className="suggestion-item">
                                        {sug}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
