import { defineConfig } from 'vite'
import monacoEditorPlugin from 'vite-plugin-monaco-editor';
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
