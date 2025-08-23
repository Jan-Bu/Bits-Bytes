// src/phaser/PhaserGame.tsx
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';

export const PhaserGame: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;

    // ✅ základní plátno hry podle orientace (bez zbytečných vrstev navíc)
    const isTall = window.innerHeight > window.innerWidth;
    const BASE = isTall
      ? { w: 1200, h: 1440 } // tvoje portrait scéna
      : { w: 2560, h: 1440 }; // tvoje landscape scéna

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: hostRef.current,
      width: BASE.w,
      height: BASE.h,
      backgroundColor: '#000',
      scale: {
        mode: Phaser.Scale.FIT,         // vyplní viewport bez deformace
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

    const onNav = (section: string) => onNavigate?.('/' + section);
    game.events.on('navigate', onNav);

    return () => {
      game.events.off('navigate', onNav);
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [onNavigate]);

  return (
    <div
      ref={hostRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        background: '#000',
        overscrollBehavior: 'none',
      }}
    />
  );
};
