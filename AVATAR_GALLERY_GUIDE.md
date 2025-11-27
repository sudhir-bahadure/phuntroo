# Avatar Gallery Guide

## How to Add New Avatars

### Option 1: ReadyPlayerMe (Realistic Full-Body)

1. Visit: https://readyplayer.me/avatar
2. Create realistic avatar
3. Export as `.glb`
4. Copy to: `d:\Jarvis-main\web\public\avatars\avatar_rpm1.glb`
5. Add entry to `AvatarLibrary.js`:

```javascript
{
    id: 'rpm_realistic',
    name: 'Realistic Human',
    file: '/avatars/avatar_rpm1.glb',
    type: 'glb',
    description: 'ReadyPlayerMe avatar'
}
```

### Option 2: AI-Generated Face (3D from Photo)

1. Generate AI face at: https://artbreeder.com
2. Convert photo to 3D at: https://meshcapade.com
3. Download `.glb`
4. Copy to: `d:\Jarvis-main\web\public\avatars\face_ai1.glb`
5. Add to library

### Option 3: Free Avatar Collections

- **Sketchfab**: https://sketchfab.com/tags/human (filter: downloadable + free)
- **Mixamo**: https://mixamo.com (FBX → convert via fbxtogl.com)
- **Renderpeople**: Free human models

### Option 4: Convert Other Formats

Use **fbxtogl.com** (browser-based, free):
- Upload FBX/OBJ/GLTF
- Convert to GLB
- Download and add to `/avatars/`

## File Structure

```
web/
  public/
    avatars/
      avatar_rpm1.glb
      avatar_rpm2.glb
      face_ai1.glb
      custom1.glb
      thumbnails/
        rpm1.jpg (optional previews)
        face1.jpg
```

## Update Avatar Library

Edit: `web/src/config/AvatarLibrary.js`

Add new entry for each avatar:

```javascript
{
    id: 'unique_id',
    name: 'Display Name',
    file: '/avatars/filename.glb',
    type: 'glb', // or 'vrm'
    thumbnail: '/avatars/thumbnails/preview.jpg', // optional
    description: 'Short description'
}
```

## Deploy

```bash
cd d:\Jarvis-main
git add web/public/avatars
git add web/src/config/AvatarLibrary.js
git commit -m "Add new avatars"
git push origin main
```

Avatars will be available in gallery after 2-3 minutes!
