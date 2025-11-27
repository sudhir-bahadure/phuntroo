// Avatar Gallery - List of available avatars
export const AVATAR_LIBRARY = [
    {
        id: 'default',
        name: 'Default VRM',
        file: '/models/avatar.vrm',
        type: 'vrm',
        thumbnail: '/avatars/thumbnails/default.jpg',
        description: 'Original VRM avatar'
    },
    // Add more avatars here
    // Example ReadyPlayerMe:
    // {
    //     id: 'rpm_realistic',
    //     name: 'Realistic Human (RPM)',
    //     file: '/avatars/avatar_rpm1.glb',
    //     type: 'glb',
    //     thumbnail: '/avatars/thumbnails/rpm1.jpg',
    //     description: 'ReadyPlayerMe realistic avatar'
    // },
    // Example AI Face:
    // {
    //     id: 'ai_face1',
    //     name: 'AI Generated Face',
    //     file: '/avatars/human_face1.glb',
    //     type: 'glb',
    //     thumbnail: '/avatars/thumbnails/face1.jpg',
    //     description: '3D face from AI photo'
    // }
];

export function getAvatarById(id) {
    return AVATAR_LIBRARY.find(avatar => avatar.id === id) || AVATAR_LIBRARY[0];
}

export function getAllAvatars() {
    return AVATAR_LIBRARY;
}
