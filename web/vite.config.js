import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

export default defineConfig({
    plugins: [
        react(),
        // Generate brotli compressed files
        compression({
            algorithm: 'brotliCompress',
            ext: '.br',
            threshold: 10240
        }),
        // Generate gzip compressed files
        compression({
            algorithm: 'gzip',
            ext: '.gz',
            threshold: 10240
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
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        // Split large dependencies into separate chunks
                        if (id.includes('three')) return 'vendor-three';
                        if (id.includes('@react-three')) return 'vendor-three-react';
                        if (id.includes('react')) return 'vendor-react';
                        return 'vendor';
                    }
                }
            }
        },
        chunkSizeWarningLimit: 2000,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        }
    }
})
