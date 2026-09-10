import React from 'react';
import ReactDOM from 'react-dom/client';
import LoginPage from '../pages/LoginPage';
import '../index.css';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <LoginPage />
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);
