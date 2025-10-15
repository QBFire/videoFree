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
  // 配置开发服务器代理，解决CORS问题
  server: {
    proxy: {
      // 针对GitHub相关资源的代理配置
      '/github': {
        target: 'https://github.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/github/, ''),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      },
      // 针对GitLab相关资源的代理配置
      '/gitlab': {
        target: 'https://gitlab.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gitlab/, ''),
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      },
      // 针对GitCode相关资源的代理配置
      '/gitcode': {
        target: 'https://raw.gitcode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gitcode/, ''),
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      },
      // 针对jsdelivr相关资源的代理配置
      '/jsdelivr': {
        target: 'https://fastly.jsdelivr.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/jsdelivr/, ''),
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      },
    },
    // 添加CORS相关的服务器配置
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  },
})
