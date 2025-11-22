# Jarvis AI Assistant with 3D Avatar

A modern, browser-based AI assistant featuring a realistic 3D Indian female avatar with synchronized voice and full-body animations.

## Features

- 🤖 **AI-Powered Conversations** - Powered by Grok AI with Cohere enhancement
- 👤 **Realistic 3D Avatar** - Full-body human avatar with Indian female appearance
- 🎤 **Voice Interaction** - Speech recognition and Indian female text-to-speech
- 💬 **Real-time Chat** - Modern chat interface with message history
- 🎭 **Emotion Detection** - Avatar responds with appropriate emotions
- 🌐 **Browser-Based** - Works entirely in the browser, no installation required
- 🔒 **Secure** - API keys stored server-side only

## Technology Stack

### Frontend
- React 18
- Three.js & React Three Fiber (3D rendering)
- Vite (build tool)
- Web Speech API (voice recognition)
- Framer Motion (animations)

### Backend
- Node.js & Express
- Socket.IO (real-time communication)
- Grok SDK (AI responses)
- Cohere AI (text enhancement)
- Hugging Face (ML models)
- Google Cloud Text-to-Speech (Indian voice)

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Install Backend Dependencies**
```bash
cd server
npm install
```

2. **Install Frontend Dependencies**
```bash
cd web
npm install
```

### Running the Application

1. **Start the Backend Server**
```bash
cd server
npm run dev
```
The server will start on `http://localhost:3000`

2. **Start the Frontend** (in a new terminal)
```bash
cd web
npm run dev
```
The app will open at `http://localhost:5173`

3. **Open in Browser**
Navigate to `http://localhost:5173` and start chatting with Jarvis!

## Usage

### Voice Interaction
1. Click the microphone button
2. Speak your question or command
3. The avatar will respond with voice and animations

### Text Chat
1. Type your message in the chat input
2. Press Enter or click Send
3. Watch the avatar respond with synchronized lip movements

### Features
- **Clear Chat** - Click the trash icon to clear conversation history
- **Voice Control** - Toggle voice input with the microphone button
- **Real-time Responses** - See the avatar animate while speaking

## API Keys

The following API keys are configured in `server/.env`:

- **Grok API**: `[REDACTED_FOR_SECURITY]`
- **Cohere API**: `[REDACTED_FOR_SECURITY]`
- **Hugging Face API**: `[REDACTED_FOR_SECURITY]`

All API keys are stored securely on the server and never exposed to the client.

## Avatar Details

The 3D avatar features:
- Realistic human body proportions
- Indian female appearance with custom face texture
- Idle breathing animations
- Talking gestures (head movements, arm gestures)
- Lip-sync capabilities
- Emotion-based expressions

## Project Structure

```
Jarvis-main/
├── server/                 # Backend Node.js server
│   ├── routes/            # API routes
│   ├── services/          # API integrations
│   ├── server.js          # Main server file
│   └── package.json
├── web/                   # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API clients
│   │   ├── styles/        # CSS files
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── public/
│   │   └── textures/      # Avatar textures
│   └── package.json
└── README.md
```

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

## Performance

- Avatar renders at 60 FPS
- Voice latency < 500ms
- AI response time < 2 seconds

## Troubleshooting

### Avatar not loading
- Ensure the face texture is in `web/public/textures/face.png`
- Check browser console for errors

### Voice not working
- Grant microphone permissions in browser
- Check if browser supports Web Speech API

### Server connection issues
- Ensure backend is running on port 3000
- Check firewall settings

## Deployment

### Backend
```bash
cd server
npm run start
```

### Frontend
```bash
cd web
npm run build
npm run preview
```

## Future Enhancements

- [ ] More realistic avatar with Ready Player Me integration
- [ ] Advanced lip-sync with phoneme analysis
- [ ] Multiple avatar options
- [ ] Voice cloning for personalized responses
- [ ] Mobile app version
- [ ] Multi-language support

## License

MIT License - feel free to use and modify!

## Credits

- Built with React, Three.js, and Node.js
- AI powered by Grok, Cohere, and Hugging Face
- Voice synthesis by Google Cloud TTS
- Avatar design inspired by modern 3D character modeling

---

**Enjoy your AI assistant with a realistic avatar! 🚀**
