import React from "react";
import { AvatarCanvas } from "./AvatarCanvas";

export default function Avatar3D({ expression, viseme, avatarState }) {
    return (
        <div className="avatar-container">
            <AvatarCanvas expression={expression} viseme={viseme} avatarState={avatarState} />
        </div>
    );
}
