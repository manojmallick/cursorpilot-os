import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import electronRenderer from 'vite-plugin-electron-renderer';

export default defineConfig({
    plugins: [
        react(),
        electron([
            {
                entry: 'src/main/main.ts',
                vite: {
                    build: {
                        outDir: 'dist/main',
                        lib: {
                            entry: 'src/main/main.ts',
                            formats: ['cjs'],
                        },
                        rollupOptions: {
                            external: [
                                'electron',
                                'simple-git',
                                '@google/generative-ai',
                                'dotenv',
                                'path',
                                'fs',
                                'fs/promises',
                                'os',
                                'crypto',
                                'url',
                                'child_process',
                                'events',
                            ],
                            output: {
                                entryFileNames: '[name].js',
                            },
                        },
                    },
                },
            },
            {
                entry: 'src/main/preload.ts',
                onstart(args) {
                    args.reload();
                },
                vite: {
                    build: {
                        outDir: 'dist/preload',
                        rollupOptions: {
                            external: ['electron'],
                            output: {
                                format: 'cjs',
                                entryFileNames: '[name].js',
                            },
                        },
                    },
                },
            },
        ]),
        electronRenderer(),
    ],
    build: {
        outDir: 'dist/renderer',
    },
});
