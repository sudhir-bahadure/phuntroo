import React from "react";
import { AvatarCanvas } from "./AvatarCanvas";

export const Avatar3D = ({ speaking, visemes }) => {
    return <AvatarCanvas speaking={speaking} visemeStream={visemes} />;
};
