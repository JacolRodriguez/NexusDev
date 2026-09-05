import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // Esto llama a tu archivo App.tsx
import './style.css'   // Esto llama a tus estilos de Tailwind

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)