import React from 'react';
import ReactDOM from 'react-dom/client';
import PortalPage from '../pages/PortalPage';
import '../index.css';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <PortalPage />
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);
