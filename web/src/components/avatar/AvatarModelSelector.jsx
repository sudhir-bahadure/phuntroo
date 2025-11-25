import React, { useState } from 'react';

import { AVATAR_MODELS } from '../../constants/AvatarModels';

export default function AvatarModelSelector({ currentModel, onSelectModel }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="avatar-selector" style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 1000
        }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)'
                }}
            >
                Change Avatar 👕
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '10px',
                    background: 'rgba(20, 20, 30, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '10px',
                    width: '200px',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}>
                    {AVATAR_MODELS.map(model => (
                        <div
                            key={model.id}
                            onClick={() => {
                                onSelectModel(model.url);
                                setIsOpen(false);
                            }}
                            style={{
                                padding: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                borderRadius: '8px',
                                background: currentModel === model.url ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                marginBottom: '5px',
                                color: 'white'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = currentModel === model.url ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}
                        >
                            <span style={{ fontSize: '20px' }}>{model.thumbnail}</span>
                            <span>{model.name}</span>
                        </div>
                    ))}

                    <div style={{
                        marginTop: '10px',
                        paddingTop: '10px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '12px',
                        color: '#aaa',
                        textAlign: 'center'
                    }}>
                        More models coming soon!
                    </div>
                </div>
            )}
        </div>
    );
}
