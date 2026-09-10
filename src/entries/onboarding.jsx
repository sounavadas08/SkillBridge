import React from 'react';
import ReactDOM from 'react-dom/client';
import OnboardingPage from '../pages/OnboardingPage';
import '../index.css';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <OnboardingPage />
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);
