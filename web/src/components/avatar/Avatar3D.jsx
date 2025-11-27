import React from "react";
import AvatarCanvas from "./AvatarCanvas";

export default function Avatar3D({ expression, visemes, avatarState, url, isVisible = true }) {
    return (
        <div className="avatar-container" style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.5s' }}>
            <AvatarCanvas expression={expression} visemes={visemes} avatarState={avatarState} url={url} />
        </div>
    );
}
