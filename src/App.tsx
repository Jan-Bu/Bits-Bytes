// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainSection from './components/pages/MainSection';
import DesktopSection from './components/pages/DesktopSection';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainSection />} />
        <Route path="/desktop" element={<DesktopSection />} />
        {/* volitelně fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;