import React from 'react';
import ReactDOM from 'react-dom/client';
import { SkillBridgeClerkProvider } from './utils/clerkAuth';
import App from './App';
import './index.css';
import './utils/liquidGlass3D';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SkillBridgeClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ThemeProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ThemeProvider>
    </SkillBridgeClerkProvider>
  </React.StrictMode>
);


