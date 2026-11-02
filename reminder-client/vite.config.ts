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
                target: 'https://localhost:7184',
                changeOrigin: true,
                secure: false, // Allows self-signed localhost SSL certs
            },
            // Forwards /uploads/* requests so receipts load seamlessly
            '/uploads': {
                target: 'https://localhost:7184',
                changeOrigin: true,
                secure: false,
            },
        },
    },
})