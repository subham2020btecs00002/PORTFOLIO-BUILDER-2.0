import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './components/context/AuthContext';
import { ThemeProvider } from './components/context/ThemeContext';
import reportWebVitals from './reportWebVitals';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ── Scroll Progress Bar ─────────────────────────────────────────────────────
// Uses a passive scroll listener + CSS custom property.
// Passive = never blocks scrolling. CSS transform = GPU only. Zero layout cost.
const progressBarStyle = document.createElement('style');
progressBarStyle.textContent = `
  #scroll-progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: var(--scroll-progress, 0%);
    height: 3px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
    z-index: 9999;
    transition: width 0.1s linear;
    pointer-events: none;
  }
`;
document.head.appendChild(progressBarStyle);

const progressBar = document.createElement('div');
progressBar.id = 'scroll-progress-bar';
document.body.prepend(progressBar);

const updateScrollProgress = () => {
  const scrollTop = document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  document.documentElement.style.setProperty('--scroll-progress', `${pct.toFixed(1)}%`);
};

window.addEventListener('scroll', updateScrollProgress, { passive: true });
// ───────────────────────────────────────────────────────────────────────────

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Root element with id="root" was not found in the document. ' +
    'Ensure your index.html contains <div id="root"></div>.',
  );
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
        <ToastContainer
          containerId="global"
          position="bottom-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="dark"
        />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);

reportWebVitals();


