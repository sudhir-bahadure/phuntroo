import React from "react";
import { AvatarCanvas } from "./AvatarCanvas";

export default function Avatar3D({ expression, visemes, avatarState }) {
    return (
        <div className="avatar-container">
            <AvatarCanvas expression={expression} visemes={visemes} avatarState={avatarState} />
        </div>
    );
}
