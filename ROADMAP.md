# PHUNTROO – Java/Python/Cloud AI Avatar Roadmap

## 1. Background & Goals
PHUNTROO is a browser-rendered, realistic human avatar connected to a multi-engine AI brain. All UI and avatar rendering run entirely in the browser and are hosted from GitHub Pages. The intelligence layer uses Java and Python services talking to external AI APIs (Hugging Face, Grok, Cohere) plus GitHub’s API via a GitHub token.

**Primary goals:**
- Realistic 3D avatar rendered only in the browser (Three.js/three-vrm/glTF).
- Chat-first UI with prompt box, attach button, and send button.
- No extra “prompt” button: user simply types and presses Enter.
- Avatar appears directly in the UI alongside the chat.
- Java-based orchestration service for AI conversation and tools.
- Python-based tool service for model-heavy utilities via Hugging Face.
- Cohere + Grok + Hugging Face as the core AI engines.
- GitHub token used for code-reading, self-improvement skills, and CI/CD.

## 2. Requirements & Constraints

**Functional:**
- **Full-body or upper-body human avatar** rendered in browser.
- **Chat interface** with:
  - Single-line prompt input with auto-focus on page load.
  - **Attach button** (file input) for future document/code uploads.
  - Send button plus Enter-to-send behavior.
- **Voice support:**
  - Optional microphone input for STT via Hugging Face Inference API or browser STT.
  - Optional TTS using either browser speechSynthesis or Hugging Face TTS.
- **Avatar-body sync:**
  - Gestures and body motions should react to:
    - User messages.
    - AI replies (text and audio).
    - Audio amplitude (for lipsync and energy).
- **AI brain:**
  - Use **Cohere** as the primary conversational LLM.
  - Use **Grok** for web-aware or trending-information queries.
  - Use **Hugging Face** for STT, TTS, embeddings, and any open models.
  - Use **GitHub token** for repository inspection, issues, PRs, and self-upgrade suggestions.

**Non-functional:**
- All UI and avatar rendering hosted on GitHub Pages (static front-end).
- All server-side logic open-source and stored in the same GitHub org/user.
- Avoid exposing API keys in the browser; keep them on server-side Java/Python services.
- Prefer free tiers and careful rate limiting on external APIs.

## 3. High-Level Architecture

**Layers:**
1. **Front-End (Browser + GitHub Pages)**
   - React/Vite (or simple HTML/JS) SPA.
   - Three.js + three-vrm or GLTFLoader for avatar rendering.
   - Chat UI (prompt, attach, send, history).
   - WebAudio for audio visualization and lip sync.

2. **Java Orchestrator Service**
   - **Tech:** Java 17+, Spring Boot (or Quarkus/Micronaut).
   - **Responsibilities:**
     - Expose REST endpoints for:
       - `/chat` (conversation turns)
       - `/analyze-avatar` (send avatar metadata, receive suggestions)
       - `/tools/*` (proxy to specialized tools)
     - Orchestrate calls to:
       - Cohere LLM (primary reasoning and conversation).
       - Grok API (for up-to-date or web-linked queries).
       - Hugging Face Inference (fallback or special tasks).
     - Manage conversation memory (e.g., in Redis or simple DB).
     - Enforce rate limits and safety filters.
   - **Deployment:**
     - Containerized (Docker) and deployed on a free-tier cloud (Render, Railway, Fly.io, etc.).
     - CI/CD using GitHub Actions with GitHub token.

3. **Python Tool Service**
   - **Tech:** Python 3.10+, FastAPI (or Flask) + Uvicorn.
   - **Responsibilities:**
     - Heavy or specialized AI tools where Python ecosystem is superior.
     - Example endpoints:
       - `/stt` (Hugging Face STT model wrapper).
       - `/tts` (Hugging Face or other TTS wrapper).
       - `/embeddings` (Hugging Face embeddings for documents).
       - `/vision` (avatar image/pose evaluation, optional).
     - Properly manage Hugging Face API requests.
   - **Deployment:**
     - Separate container on same or separate free-tier cloud.
     - Triggered only when needed by Java Orchestrator.

4. **GitHub Integration Service (Java or Python)**
   - Uses GitHub token stored as secret in backend.
   - **Abilities:**
     - Read and analyze repo code (including avatar scene and UI).
     - Open issues or PRs with suggested improvements.
     - Fetch project roadmap, skills, and configuration files for the AI brain.

5. **External AI Engines**
   - **Cohere:** Main chat model and planning. Tools: summarize, rewrite, generate code snippets, dialog.
   - **Grok:** For web-aware, up-to-date knowledge, trending topics. Use via orchestrator in specific “web mode” cases.
   - **Hugging Face:** STT, TTS, Embeddings, Safety/Toxicity models.

## 4. Detailed Front-End Plan (Browser + Avatar Only)

### 4.1 UI Layout
- **Left:** Chat history and prompt area.
- **Right:** 3D avatar viewport.
- **Top bar:** Status (online/offline, which engine is active: Cohere/Grok/HF).
- **Bottom bar:** Prompt + buttons.

### 4.2 Chat Input Behavior
- **Input:**
  - Auto-focus as soon as page loads.
  - Enter sends message.
  - Shift+Enter inserts newline.
- **Buttons:**
  - **Attach:** opens file picker, stores file in memory and passes metadata to backend.
  - **Send:** triggers same handler as Enter.
- **State:**
  - Display which engine handled the last reply (Cohere / Grok / HF).
  - Show error messages inline if any API fails.

### 4.3 Avatar Integration
- Use Three.js with GLTFLoader or three-vrm for a realistic human avatar.
- Load a GLB/VRM avatar from the same GitHub repo (under `/public/avatars/`).
- Attach an AnimationMixer:
  - Idle base animation.
  - Talk/gesture animation layer.
  - Walk/turn animation layer (optional).
- Build a small “MotionController”:
  - **Inputs:** chatRole ("user" or "assistant"), sentiment, audioLevel.
  - **Outputs:** which animation weight to increase, minor procedural offsets.

## 5. Java Backend Roadmap

### Phase J1 — Project Scaffold
- Create Java project (Maven/Gradle) named `phuntroo-orchestrator`.
- Modules: `api`, `core`, `clients`.
- Add unit tests and configuration for secrets.

### Phase J2 — Cohere Integration
- Implement `CohereClient`.
- `/chat` endpoint in Java.
- Conversation orchestration with memory.

### Phase J3 — Grok Integration
- Implement `GrokClient` for web/trend reasoning.
- Extend orchestration to blend Grok’s output.

### Phase J4 — Hugging Face Integration (Java side)
- Implement `HuggingFaceClient` for STT/TTS proxying.

### Phase J5 — GitHub Integration
- Implement `GitHubClient`.
- Skills: `/tools/github/analyze-repo`, `/tools/github/open-issue`, `/tools/github/open-pr`.

### Phase J6 — Deployment & CI
- GitHub Actions to build and test.
- Dockerize and deploy to free-tier cloud.

## 6. Python Tools Service Roadmap

### Phase P1 — Scaffold FastAPI Project
- Create repo folder `phuntroo-tools-py`.
- FastAPI app with routes: `/stt`, `/tts`, `/embeddings`, `/vision`.

### Phase P2 — Hugging Face STT Wrapper
- Implement `/stt` using HF model.

### Phase P3 — Hugging Face TTS (or fallback)
- Implement `/tts`.

### Phase P4 — Embeddings & Document Tools
- Implement `/embeddings`.

### Phase P5 — Optional Vision / Avatar Analysis
- Implement `/vision/avatar-eval`.

### Phase P6 — Deployment & CI
- Dockerize and deploy.

## 7. AI Conversation & Avatar Sync Logic

### 7.1 Conversation Loop
- **Front-end:** User types -> Calls Java `/chat`.
- **Java orchestrator:** Decides engine -> Formats response with `replyText`, `motionHint`, `audioHint`.
- **Front-end:** Renders reply -> Calls TTS -> Calls `AvatarController.onReply`.

### 7.2 AvatarController Behaviors
- **onUserMessage(text):** "Listening" posture.
- **onReply(replyText, motionHint, audioStream):** Drive gestures and lipsync.

## 8. GitHub Hosting & Project Layout
- **phuntroo-frontend** (GitHub Pages).
- **phuntroo-orchestrator-java**.
- **phuntroo-tools-py**.
- **Secrets:** Store API keys as GitHub secrets.
- **Documentation:** `/docs` folder.

## 9. Milestones & Timeline

**Milestone 1 (Week 1–2):** ✅ Front-end scaffold, Avatar rendering, Chat UI (prompt + attach + send).
**Milestone 2 (Week 3–4):** 🔄 Java orchestrator with Cohere integration (Scaffolded).
**Milestone 3 (Week 5–6):** Python tools service with HF STT/TTS.
**Milestone 4 (Week 7–8):** Grok integration, GitHub integration.
**Milestone 5 (Week 9–10):** Hardening, UI polish, Documentation.
