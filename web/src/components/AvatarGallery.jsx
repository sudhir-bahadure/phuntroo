import React, { useState } from 'react';
import { AVATAR_LIBRARY } from '../config/AvatarLibrary';
import './AvatarGallery.css';

export default function AvatarGallery({ onAvatarSelect, currentAvatarId }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAvatars = AVATAR_LIBRARY.filter(avatar =>
        avatar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        avatar.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (avatar) => {
        onAvatarSelect(avatar);
        setIsOpen(false);
    };

    if (!isOpen) {
        return (
            <button
                className="avatar-gallery-toggle"
                onClick={() => setIsOpen(true)}
                title="Change Avatar"
            >
                👤 Avatar Gallery
            </button>
        );
    }

    return (
        <div className="avatar-gallery-overlay" onClick={() => setIsOpen(false)}>
            <div className="avatar-gallery-panel" onClick={(e) => e.stopPropagation()}>
                <div className="gallery-header">
                    <h2>🎭 Avatar Gallery</h2>
                    <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                </div>

                <input
                    type="text"
                    className="avatar-search"
                    placeholder="🔍 Search avatars..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="avatar-grid">
                    {filteredAvatars.map(avatar => (
                        <div
                            key={avatar.id}
                            className={`avatar-card ${currentAvatarId === avatar.id ? 'active' : ''}`}
                            onClick={() => handleSelect(avatar)}
                        >
                            <div className="avatar-thumbnail">
                                {avatar.thumbnail ? (
                                    <img src={avatar.thumbnail} alt={avatar.name} />
                                ) : (
                                    <div className="thumbnail-placeholder">
                                        {avatar.type === 'vrm' ? '🤖' : '👤'}
                                    </div>
                                )}
                            </div>
                            <div className="avatar-info">
                                <h3>{avatar.name}</h3>
                                <p>{avatar.description}</p>
                                <span className="avatar-type">{avatar.type.toUpperCase()}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredAvatars.length === 0 && (
                    <div className="no-results">
                        No avatars found matching "{searchTerm}"
                    </div>
                )}

                <div className="gallery-footer">
                    <p>📥 Add more avatars to <code>/public/avatars/</code></p>
                </div>
            </div>
        </div>
    );
}
