// src/components/pages/MainSection.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PhaserGame } from '../../phaser/PhaserGame';
import { useTranslation } from '../../hooks/useTranslation';

const MainSection: React.FC = () => {
  const navigateRR = useNavigate();
  const { language, switchLanguage } = useTranslation();

  return (
    <PhaserGame
      navigate={(path) => navigateRR(path)}
      getLang={() => language}
      setLang={(l) => switchLanguage(l)}
    />
  );
};

export default MainSection;
