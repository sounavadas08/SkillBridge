import React from 'react';
import ReactDOM from 'react-dom/client';
import LoginPage from '../pages/LoginPage';
import '../index.css';
import '../utils/liquidGlass3D';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import { SkillBridgeClerkProvider } from '../utils/clerkAuth';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SkillBridgeClerkProvider>
      <ThemeProvider>
        <ToastProvider>
          <LoginPage />
        </ToastProvider>
      </ThemeProvider>
    </SkillBridgeClerkProvider>
  </React.StrictMode>
);
