// src/components/pages/MainSection.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PhaserGame } from '../../phaser/PhaserGame';

const MainSection: React.FC = () => {
  const navigate = useNavigate();
  return <PhaserGame onNavigate={(path) => navigate(path)} />;
};

export default MainSection;
