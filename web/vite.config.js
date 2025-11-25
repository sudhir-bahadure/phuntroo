import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
    base: '/phuntroo/',
    plugins: [
        react(),
        nodePolyfills({
            protocolImports: true,
            include: ['fs', 'path', 'crypto', 'buffer', 'util', 'stream', 'events'],
            globals: {
                Buffer: true,
                global: true,
                process: true,
            },
        })
    ],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true
            },
            '/audio': {
                target: 'http://localhost:3000',
                changeOrigin: true
            }
        }
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
        chunkSizeWarningLimit: 2000
    },
    optimizeDeps: {
        exclude: ['@xenova/transformers', '@wllama/wllama']
    }
})
