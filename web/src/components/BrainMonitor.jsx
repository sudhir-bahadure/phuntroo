import React, { useState, useEffect } from 'react';
import { autonomousBrain } from '../services/brain/AutonomousBrain';
import { memorySync } from '../utils/MemorySync';

export default function BrainMonitor() {
    const [status, setStatus] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        // Update status every 5 seconds
        const interval = setInterval(() => {
            setStatus(autonomousBrain.getStatus());
        }, 5000);

        // Initial status
        setStatus(autonomousBrain.getStatus());

        return () => clearInterval(interval);
    }, []);

    if (!status) return null;

    const handleSetToken = (e) => {
        e.stopPropagation();
        const token = window.prompt('Enter GitHub Token for Cloud Sync & Uploads:');
        if (token) {
            memorySync.setToken(token);
            alert('Token saved! Brain can now sync and upload.');
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'rgba(0,0,0,0.9)',
            border: '2px solid #4CAF50',
            borderRadius: '12px',
            padding: '12px',
            minWidth: '200px',
            maxWidth: isExpanded ? '400px' : '200px',
            zIndex: 2000,
            fontSize: '12px',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(76,175,80,0.3)',
            transition: 'all 0.3s'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
            }}>
                <div
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', flex: 1 }}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: status.active ? '#4CAF50' : '#999',
                        animation: status.active ? 'pulse 2s infinite' : 'none'
                    }} />
                    <span style={{ fontWeight: 'bold' }}>🧠 Autonomous Brain</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                        onClick={handleSetToken}
                        title="Set GitHub Token"
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid #666',
                            borderRadius: '4px',
                            color: '#fff',
                            cursor: 'pointer',
                            padding: '2px 6px',
                            fontSize: '10px'
                        }}
                    >
                        🔑 Set Token
                    </button>
                    <span
                        onClick={() => setIsExpanded(!isExpanded)}
                        style={{ cursor: 'pointer', padding: '0 4px' }}
                    >
                        {isExpanded ? '▼' : '▶'}
                    </span>
                </div>
            </div>

            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '8px' }}>
                Status: {status.active ? 'Thinking' : 'Paused'}
            </div>

            {isExpanded && (
                <>
                    <div style={{ marginBottom: '8px' }}>
                        <div style={{ color: '#4CAF50' }}>Goals Completed: {status.goalsCompleted}</div>
                    </div>

                    {status.recentDecisions && status.recentDecisions.length > 0 && (
                        <div>
                            <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#64B5F6' }}>
                                Recent Decisions:
                            </div>
                            {status.recentDecisions.map((decision, idx) => (
                                <div key={idx} style={{
                                    padding: '4px',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '4px',
                                    marginBottom: '4px',
                                    fontSize: '10px'
                                }}>
                                    <div style={{ color: decision.success ? '#4CAF50' : '#f44336' }}>
                                        {decision.success ? '✓' : '✗'} {decision.goal?.description}
                                    </div>
                                    <div style={{ color: '#888', fontSize: '9px' }}>
                                        {new Date(decision.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}
