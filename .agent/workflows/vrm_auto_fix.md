---
description: Auto-fix VRM model path and redeploy
---
# Steps to automatically fix the missing VRM model path on GitHub Pages

1. **Ensure public/models directory exists**
   ```
   // turbo
   mkdir -p public/models
   ```

2. **Copy your VRM file into the public folder**
   - Place your `avatar.vrm` file in `public/models/`.
   - If you have the file elsewhere, move it:
   ```
   // turbo
   cp path/to/your/avatar.vrm public/models/avatar.vrm
   ```

3. **Update VRM loading path in the code (if needed)**
   - The loader currently uses `const modelUrl = "/models/avatar.vrm";`
   - This is correct for Vite with `base: '/phuntroo/'`. No code change required unless you changed it.
   - If you need to adjust, run:
   ```
   // turbo
   sed -i "s|/models/avatar.vrm|${import.meta.env.BASE_URL}models/avatar.vrm|" src/components/VRMAvatar.jsx
   ```

4. **Install dependencies (if any new ones were added)**
   ```
   // turbo
   npm install
   ```

5. **Build the project**
   ```
   // turbo
   npm run build
   ```

6. **Commit and push the changes**
   ```
   // turbo
   git add public/models/avatar.vrm src/components/VRMAvatar.jsx
   git commit -m "Fix VRM model path and add avatar file"
   git push origin main
   ```

7. **GitHub Actions will automatically redeploy**
   - Wait for the GitHub Pages workflow to finish.
   - Verify the avatar loads at `https://sudhir-bahadure.github.io/phuntroo/models/avatar.vrm`.

# Verification
After deployment, open the live site and ensure no 404 errors for the VRM model and that the avatar displays correctly with animations.
