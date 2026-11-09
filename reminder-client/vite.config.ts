import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    server: {
        port: 5173,
        proxy: {
            // Forwards all /api/* requests to ASP.NET Core
            '/api': {
                target: 'http://127.0.0.1:5154',
                changeOrigin: true,
                secure: false, // Allows self-signed localhost SSL certs
            },
            // Forwards /uploads/* requests so receipts load seamlessly
            '/uploads': {
                target: 'http://127.0.0.1:5154',
                changeOrigin: true,
                secure: false,
            },
        },
    },
})