# Video Avatar Setup Instructions

## Current Status

✅ **Video Avatar Component** - Fully implemented and integrated
✅ **Female Voice TTS** - Auto-selects best female voice
✅ **Fallback Image** - Using AI-generated avatar image
⚠️ **Video File** - Optional upgrade available

---

## What's Working Now

The video avatar system is **fully functional** using a static image with animations:

1. **Image Avatar**: `edith-avatar.png` (AI-generated realistic woman)
2. **Animations**: Talking indicator, glow effects, mood changes
3. **Female Voice**: Browser TTS with female voice selection
4. **Status Display**: Outfit, mood, online indicator
5. **Interactive**: Outfit changes, mood responses

---

## Optional: Add Real Video

To upgrade to a real video avatar, follow these steps:

### Option 1: Use Stock Video (Free)

1. Visit **Pexels** or **Pixabay**
2. Search for: "woman standing smiling portrait"
3. Download a short (5-15 second) MP4 video
4. Save as: `d:\Jarvis-main\web\public\avatar-edith.mp4`

**Recommended videos**:
- Portrait orientation (9:16 or 1:1)
- Clean background
- Friendly, professional appearance
- Loopable (starts and ends similarly)

### Option 2: Generate with AI

Use AI video generation tools:

**Runway ML** (https://runwayml.com):
```
Prompt: "Professional portrait of a friendly young woman in casual attire, 
standing and smiling warmly at camera, clean background, subtle movements"
```

**Pika Labs** (https://pika.art):
```
Upload the generated image (edith-avatar.png) and animate it with:
"Subtle breathing, gentle smile, professional demeanor"
```

**D-ID** (https://www.d-id.com):
- Upload `edith-avatar.png`
- Generate talking avatar video
- Download as MP4

### Option 3: Record Custom Video

Requirements:
- **Duration**: 5-15 seconds
- **Format**: MP4 (H.264 codec)
- **Resolution**: 720p or 1080p
- **Aspect Ratio**: 9:16 (portrait) or 16:9 (landscape)
- **Content**: Standing, smiling, minimal movement
- **Background**: Clean, professional

---

## How It Works

### With Image (Current)
- Displays static image with animations
- Talking indicator overlay
- Glow effects for mood
- Sound wave visualization

### With Video (After adding MP4)
- Plays looping video
- Video glows based on mood
- Smooth transitions
- More realistic appearance

---

## Testing

The avatar is ready to test now:

1. Open http://localhost:5173
2. Click "🎥 Video" toggle
3. Say "Hello Edith"
4. Watch the avatar respond with female voice
5. Try "switch to elegant" to change outfit

---

## Voice Configuration

The system automatically selects the best female voice available on your system.

**Windows voices** (if installed):
- Microsoft Zira (Female, English US)
- Microsoft Aria (Female, English US)
- Google voices (if Chrome)

**To check available voices**:
Open browser console and run:
```javascript
speechSynthesis.getVoices().forEach(v => 
  console.log(v.name, v.lang, v.gender || 'unknown')
);
```

---

## Troubleshooting

**No voice output?**
- Check browser supports Web Speech API (Chrome, Edge recommended)
- Ensure system volume is up
- Check browser permissions for audio

**Image not loading?**
- Verify `edith-avatar.png` exists in `web/public/`
- Check browser console for errors
- Clear browser cache

**Want to change the image?**
- Replace `web/public/edith-avatar.png` with your own
- Recommended size: 400x600px or similar portrait ratio

---

## Next Steps

The video avatar is **production-ready** with the current image setup. Adding a real video is optional and will enhance the visual experience but is not required for full functionality.

**Current features working**:
✅ Female voice TTS
✅ Mood-based effects
✅ Outfit changes
✅ Status display
✅ Talking animations
✅ AI integration (Groq/Grok/HF)

Enjoy your enhanced Edith Live avatar! 🎥✨
