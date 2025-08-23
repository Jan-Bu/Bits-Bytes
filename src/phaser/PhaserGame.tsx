// src/phaser/PhaserGame.tsx
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';

export const PhaserGame: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: hostRef.current,
      width: 2560,
      height: 1440,
      backgroundColor: '#000', // 🔳 mimo svět (letterbox) taky černo
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      render: {
        pixelArt: true,
        antialias: false,
        roundPixels: true,
        mipmapFilter: 'NEAREST',
      },
      scene: [MainScene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    const onNav = (section: string) => {
      onNavigate?.('/' + section);
    };

    // poslech události ze scény
    game.events.on('navigate', onNav);

    return () => {
      // odpoj listener a znič hru
      game.events.off('navigate', onNav);
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [onNavigate]);

  return <div
    ref={hostRef}
    style={{ width: '100vw', height: '100vh', background: '#000' }}
  />;
};
