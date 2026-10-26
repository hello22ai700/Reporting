import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

try {
  const originalFetch = window.fetch ? window.fetch.bind(window) : undefined;
  let _currentFetch = originalFetch;
  Object.defineProperty(window, 'fetch', {
    configurable: true,
    enumerable: true,
    get: () => _currentFetch,
    set: (fn) => { _currentFetch = fn; },
  });
} catch (e) {
  // Ignore
}

createRoot(document.getElementById('root')!).render(<App />);
