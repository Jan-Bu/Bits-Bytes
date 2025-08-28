import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

if (!customElements.get('model-viewer')) {
  import('@google/model-viewer');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
