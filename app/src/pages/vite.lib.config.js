import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'lib',
        lib: {
            entry: path.resolve(__dirname, 'src/index.js'),
            name: 'InteDepContinuLib',
            fileName: (format) => `index.${format}.js`
        },
        rollupOptions: {
            // Assurez-vous d'externaliser les dépendances que vous ne voulez pas bundler
            external: ['react', 'react-dom', 'react-router-dom', 'react-toastify'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'react-router-dom': 'ReactRouterDOM',
                    'react-toastify': 'ReactToastify'
                }
            }
        },
        emptyOutDir: true,
    }
});