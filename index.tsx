import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

/**
 * TESSERA CORE - VITE DEPLOYMENT ENGINE
 * Modern Standalone Architecture
 */

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Sistem hatası: Root node bulunamadı.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);