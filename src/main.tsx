import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 导入Edge浏览器兼容性工具
import { initializeEdgeCompatibility } from './utils/edgeCompatibility'

// 初始化Edge浏览器兼容性处理
initializeEdgeCompatibility()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
