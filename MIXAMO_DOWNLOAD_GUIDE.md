# Mixamo Model Download Guide

## Step-by-Step Instructions

### 1. Create Adobe Account (Free)
1. Go to https://www.mixamo.com
2. Click "Sign In" → "Create Account"
3. Use your email to create free Adobe account

### 2. Download Character Model

1. **Browse Characters**:
   - Click "Characters" tab
   - Search for female characters
   - Recommended: "Kaya", "Jasmine", "Amy", or "Megan"

2. **Download Character**:
   - Select a character
   - Click "Download"
   - Format: **FBX for Unity (.fbx)**
   - Pose: **T-Pose**
   - Click "Download"
   - Save as: `edith-character.fbx`

### 3. Download Animations

Download these animations (one by one):

#### Required Animations:
1. **Idle** - Search "Breathing Idle" or "Standing Idle"
2. **Walk** - Search "Walking" or "Female Walk"
3. **Laugh** - Search "Laughing" or "Happy Laugh" (3+ seconds)
4. **Talk** - Search "Talking" or "Speaking"
5. **Wave** - Search "Waving" or "Hi Wave"
6. **Thumbs Up** - Search "Thumbs Up"
7. **Point** - Search "Pointing"
8. **Shrug** - Search "Shrug"
9. **Nod** - Search "Yes Nod"
10. **Shake Head** - Search "No Shake Head"
11. **Spin** - Search "Spin" or "Turn Around"
12. **Dance** - Search "Dancing" or "Hip Hop Dance"

#### For Each Animation:
1. Select the character you downloaded
2. Search for animation name
3. Click on animation to preview
4. Click "Download"
5. Format: **FBX for Unity (.fbx)**
6. With Skin: **Without Skin** (we already have the character)
7. Frames per second: **30 fps**
8. Click "Download"
9. Save with descriptive name (e.g., `walk.fbx`, `laugh.fbx`)

### 4. Convert FBX to GLTF

**Option A: Online Converter (Easiest)**
1. Go to https://products.aspose.app/3d/conversion/fbx-to-gltf
2. Upload your FBX files
3. Convert to GLTF (.glb format)
4. Download converted files

**Option B: Blender (More Control)**
1. Download Blender (free): https://www.blender.org
2. Open Blender
3. File → Import → FBX (.fbx)
4. Select your character/animation file
5. File → Export → glTF 2.0 (.glb)
6. Export settings:
   - Format: **GLB**
   - Include: **Animations**
   - Compression: **Enabled**
7. Save

### 5. Place Files in Project

Copy the converted files to:
```
d:\Jarvis-main\web\public\models\
  ├── edith-character.glb       (main character)
  └── animations\
      ├── idle.glb
      ├── walk.glb
      ├── laugh.glb
      ├── talk.glb
      ├── wave.glb
      ├── thumbs-up.glb
      ├── point.glb
      ├── shrug.glb
      ├── nod.glb
      ├── shake-head.glb
      ├── spin.glb
      └── dance.glb
```

### 6. Verify Files

Check that:
- Character model is < 10MB
- Each animation is < 2MB
- Files are in .glb format (not .gltf)
- All files are in correct folders

---

## Quick Start Commands

After downloading and converting:

```powershell
# Create models directory
New-Item -ItemType Directory -Path "d:\Jarvis-main\web\public\models\animations" -Force

# Move files (adjust paths to your downloads)
Move-Item "C:\Users\SUDHIR\Downloads\edith-character.glb" "d:\Jarvis-main\web\public\models\"
Move-Item "C:\Users\SUDHIR\Downloads\*.glb" "d:\Jarvis-main\web\public\models\animations\"
```

---

## Alternative: Ready Player Me (Easier)

If Mixamo is too complex, use Ready Player Me:

1. Go to https://readyplayer.me
2. Create an avatar (customize appearance)
3. Download as GLB
4. Comes with basic animations built-in
5. Much simpler but less customization

---

## Troubleshooting

**FBX won't convert?**
- Try different online converter
- Use Blender method
- Check file isn't corrupted

**File too large?**
- Reduce texture resolution in Blender
- Enable compression during export
- Use lower poly character

**Animations not working?**
- Ensure "With Skin: Without Skin" was selected
- Verify character and animations use same skeleton
- Check FPS is consistent (30fps)

---

Once you have the files ready, the code will automatically load and use them!
