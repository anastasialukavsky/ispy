import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
// import { BrowserRouter as Router } from 'react-router-dom';

import './input.css';
import { AuthProvider } from './context/AuthContext.tsx';

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <AuthProvider>
    <App />
  </AuthProvider>

  // </StrictMode>,
);
