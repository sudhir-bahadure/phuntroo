# Phuntroo Browser Avatar

A standalone, fully browser-based 3D avatar application with webcam and speech integration.

## Features

✨ **Realistic 3D Avatar** - Full-body GLB model with animations  
📹 **Webcam Integration** - "She sees you" via getUserMedia API  
🎤 **Speech Recognition** - Voice input using browser SpeechRecognition  
🔊 **Text-to-Speech** - Voice responses using speechSynthesis  
🧠 **Simple AI** - Rule-based responses (no external APIs)  
🆓 **Zero Cost** - Runs entirely in browser, no servers needed

## Quick Start

### 1. Get Your Avatar Model

1. Visit [ReadyPlayer.me](https://readyplayer.me)
2. Create a full-body avatar
3. Download as **GLB** format
4. Rename the file to `avatar.glb`
5. Place it in: `web/public/avatar/avatars/avatar.glb`

### 2. Test Locally

Open `web/public/avatar/index.html` in your browser (Chrome/Edge recommended for speech features).

**OR** use a local server:
```bash
cd web/public/avatar
python -m http.server 8000
# Then visit: http://localhost:8000
```

### 3. Deploy to GitHub Pages

The file is already in the `web/public` folder, so it will be automatically deployed when you push to GitHub.

**Live URL** (after deployment):
```
https://sudhir-bahadure.github.io/phuntroo/avatar/
```

## How to Use

1. **Turn Camera ON** - Click to enable webcam
2. **MIC – Talk to her** - Click and speak
3. **Try saying**:
   - "Hello" or "Hi"
   - "Who are you?"
   - "How are you?"
   - "What's your name?"

## Technical Details

- **3D Engine**: Three.js (from CDN)
- **Model Format**: GLB (GLTF Binary)
- **Webcam**: `navigator.mediaDevices.getUserMedia()`
- **Speech Input**: `SpeechRecognition` API (Chrome/Edge)
- **Speech Output**: `speechSynthesis` API (all browsers)
- **No Build Step**: Pure HTML + JavaScript
- **No Dependencies**: Everything from CDN

## Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| 3D Avatar | ✅ | ✅ | ✅ | ✅ |
| Webcam | ✅ | ✅ | ✅ | ✅ |
| Speech Recognition | ✅ | ✅ | ❌ | ❌ |
| Text-to-Speech | ✅ | ✅ | ✅ | ✅ |

**Recommended**: Chrome or Edge for full functionality

## Customization

### Change Avatar Behavior

Edit the `animate()` function in `index.html`:
```javascript
// Adjust motion parameters
avatar.position.x = Math.sin(t * 0.5) * 0.2; // left/right sway
avatar.position.z = Math.cos(t * 0.5) * 0.1; // forward/back
avatar.position.y = 0.02 * Math.sin(t * 2.0); // breathing
```

### Add More Responses

Edit the `simpleBrainReply()` function:
```javascript
if (lower.includes("your keyword")) {
  reply = "Your custom response";
}
```

### Change Voice

Edit the `speak()` function:
```javascript
utter.pitch = 1.05; // 0.5 to 2.0
utter.rate = 1.0;   // 0.1 to 10
```

## Troubleshooting

**Avatar doesn't load**:
- Check that `avatar.glb` is in `avatars/` folder
- Open browser console (F12) for error messages
- Verify GLB file is valid (test at https://gltf-viewer.donmccurdy.com/)

**Webcam not working**:
- Allow camera permissions when prompted
- Use HTTPS or localhost (required for getUserMedia)

**Speech recognition not working**:
- Use Chrome or Edge browser
- Allow microphone permissions
- Check that you're on HTTPS or localhost

## File Structure

```
web/public/avatar/
├── index.html          # Main application (all-in-one)
├── avatars/
│   └── avatar.glb      # Your 3D avatar model
└── README.md           # This file
```

## License

Free to use and modify. No attribution required.
