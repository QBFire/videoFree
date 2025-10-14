import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020', // 降低到ES2020以提高Edge兼容性
    cssTarget: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 手动分割代码块
          if (id.includes('node_modules/react')) {
            return 'vendor';
          }
          if (id.includes('node_modules/react-dom')) {
            return 'vendor';
          }
          if (id.includes('node_modules/react-router-dom')) {
            return 'vendor';
          }
        },
      },
    },
  },
  // 全局常量定义
  define: {
    'process.env.IS_EDGE': JSON.stringify(false), // 将在运行时检测
  },
})
