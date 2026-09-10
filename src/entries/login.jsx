import React from 'react';
import ReactDOM from 'react-dom/client';
import LoginPage from '../pages/LoginPage';
import '../index.css';
import '../utils/liquidGlass3D';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import { SkillBridgeClerkProvider } from '../utils/clerkAuth';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SkillBridgeClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ThemeProvider>
        <ToastProvider>
          <LoginPage />
        </ToastProvider>
      </ThemeProvider>
    </SkillBridgeClerkProvider>
  </React.StrictMode>
);
