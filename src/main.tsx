// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { enableMapSet } from 'immer'
import App from './App.tsx'
import './index.css'

// 启用 Immer MapSet 支持
enableMapSet()

// 开发环境下的性能监控
if (import.meta.env.DEV) {
  console.log('🚀 Event-Driven Low-Code Platform POC');
  console.log('📅 Built on:', new Date().toLocaleString('zh-CN'));
  console.log('👤 Developer: zl19911110');
  console.log('🎯 Features: Event Sourcing, Time Travel, Real-time Collaboration Ready');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)