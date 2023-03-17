import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    base: "/pomodoro/",
    build: {
        outDir: "./docs",
    },
    server: {
        watch: {
            // limitation of WSL2 - https://vitejs.dev/config/#server-watch
            // This is not needed if working out of WSL drive
            // usePolling: true
        },
        proxy: {
            "/api": {
                target: "http://localhost:3001",
                secure: false,
                rewrite: (path) => {
                    return path.replace(/api/, "");
                },
            },
        },
    },
    plugins: [react()],
});
