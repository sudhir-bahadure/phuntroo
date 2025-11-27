import React, { useState, useEffect } from 'react';
import { autonomyManager } from '../services/autonomy/AutonomyManager';

export default function AutonomyLog() {
    const [activityLog, setActivityLog] = useState([]);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Subscribe to autonomy manager actions
        const interval = setInterval(() => {
            const currentAction = autonomyManager.getCurrentAction?.() || 'idle';
            const timestamp = new Date().toLocaleTimeString();

            setActivityLog(prev => [
                { time: timestamp, action: currentAction },
                ...prev.slice(0, 9) // Keep last 10
            ]);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            width: '300px',
            background: 'rgba(0,0,0,0.8)',
            border: '1px solid #444',
            borderRadius: '8px',
            padding: '10px',
            zIndex: 1000,
            maxHeight: isVisible ? '400px' : '40px',
            overflow: 'hidden',
            transition: 'all 0.3s'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                marginBottom: isVisible ? '10px' : '0'
            }} onClick={() => setIsVisible(!isVisible)}>
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>
                    🤖 Autonomy Log
                </span>
                <span style={{ color: '#888' }}>{isVisible ? '▼' : '▲'}</span>
            </div>

            {isVisible && (
                <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {activityLog.length === 0 && (
                        <div style={{ color: '#666', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
                            Waiting for autonomous actions...
                        </div>
                    )}
                    {activityLog.map((log, idx) => (
                        <div key={idx} style={{
                            padding: '8px',
                            borderBottom: '1px solid #333',
                            fontSize: '12px'
                        }}>
                            <span style={{ color: '#888' }}>[{log.time}]</span>{' '}
                            <span style={{ color: '#4CAF50' }}>{log.action}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
