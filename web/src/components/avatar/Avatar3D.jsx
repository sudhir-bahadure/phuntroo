import React from "react";
import AvatarCanvas from "./AvatarCanvas";

export default function Avatar3D({ expression, visemes, avatarState, url }) {
    return (
        <div className="avatar-container">
            <AvatarCanvas expression={expression} visemes={visemes} avatarState={avatarState} url={url} />
        </div>
    );
}
