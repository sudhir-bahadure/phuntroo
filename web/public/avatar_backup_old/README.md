# Avatar Gallery System

## 🎭 What is this?

A standalone 3D avatar gallery that lets you:
- View multiple realistic human avatars
- Download avatars from the internet (ReadyPlayerMe, AI-generated faces, etc.)
- Switch between avatars instantly
- Use webcam (she "sees" you)
- **100% free, browser-only, no server required**

## 📍 Live URL

After deployment:
```
https://sudhir-bahadure.github.io/phuntroo/avatar/
```

## 📁 File Structure

```
web/public/avatar/
  ├── index.html          ← Standalone gallery viewer
  ├── avatars.json        ← Avatar library configuration
  └── avatars/
      ├── avatar1.glb     ← 3D avatar files
      ├── avatar1.jpg     ← Thumbnail images
      ├── avatar2.glb
      └── avatar2.jpg
```

## 🚀 How to Add New Avatars

### Step 1: Get a .glb avatar file

**Option A - ReadyPlayerMe (Full Body):**
1. Go to https://readyplayer.me/avatar
2. Create realistic avatar
3. Export as `.glb`

**Option B - AI Face (from photo):**
1. Generate AI face at https://artbreeder.com
2. Convert to 3D at https://meshcapade.com
3. Download `.glb`

**Option C - Download from gallery:**
- Open `https://sudhir-bahadure.github.io/phuntroo/avatar/`
- Paste direct `.glb` URL in "Download Avatar" section
- Click "Download GLB"

### Step 2: Upload files

Upload to `web/public/avatar/avatars/`:
- `my_avatar.glb` (the 3D model)
- `my_avatar.jpg` (thumbnail image)

### Step 3: Register in avatars.json

Edit `web/public/avatar/avatars.json`, add:

```json
{
  "id": "my_avatar",
  "name": "My Custom Avatar",
  "file": "avatars/my_avatar.glb",
  "thumb": "avatars/my_avatar.jpg",
  "source": "ReadyPlayerMe",
  "notes": "Realistic human avatar"
}
```

### Step 4: Deploy

```bash
cd d:\Jarvis-main
git add web/public/avatar
git commit -m "Add new avatar"
git push origin main
```

Wait 2-3 minutes, then visit the gallery URL!

## 🔗 Free Avatar Sources

- **ReadyPlayerMe:** https://readyplayer.me/avatar (best for full body)
- **Artbreeder:** https://artbreeder.com (AI faces)
- **Meshcapade:** https://meshcapade.com (photo → 3D)
- **Sketchfab:** https://sketchfab.com/tags/human (free models)
- **FBX Converter:** https://fbxtogl.com (convert other formats)

## 💻 Technical Details

- **3D Engine:** Three.js (CDN, no build required)
- **Format:** GLB (GLTF binary)
- **Hosting:** GitHub Pages (static files)
- **Cost:** $0

## 🔧 Integration with Main App

To integrate this gallery into your main React app later, I can provide a React component version that reads the same `avatars.json`.
