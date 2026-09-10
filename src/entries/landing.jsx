import React from 'react';
import ReactDOM from 'react-dom/client';
import LandingPage from '../pages/LandingPage';
import '../index.css';
import '../utils/liquidGlass3D';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <LandingPage />
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);
