import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App'; // Command Center
import LandingPage from './LandingPage';
import { CitizenLogin, AuthorityLogin } from './LoginPages';
import CitizenPortal from './CitizenPortal';

import './styles.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/citizen-login" element={<CitizenLogin />} />
      <Route path="/authority-login" element={<AuthorityLogin />} />
      <Route path="/citizen" element={<CitizenPortal />} />
      <Route path="/command-center" element={<App />} />
    </Routes>
  </BrowserRouter>
);
