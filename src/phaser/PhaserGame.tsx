// src/phaser/PhaserGame.tsx
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';

// Centrální mapování sekcí → URL (home vede na '/')
const ROUTES: Record<string, string> = {
  home: '/',
  about: '/about',
  services: '/services',
  pricing: '/pricing',
  blog: '/blog',
  contact: '/contact',
  terms: '/terms',
  gdpr: '/gdpr',
};

export const PhaserGame: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;

    const isTall = window.innerHeight > window.innerWidth;
    const BASE = isTall ? { w: 960, h: 1540 } : { w: 2560, h: 1440 };

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: hostRef.current,
      width: BASE.w,
      height: BASE.h,
      backgroundColor: '#000',
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

    // Handler navigace: mapuje sekci na URL a nenaviguje, pokud už jsme na cíli
    const onNav = (section: string) => {
      const path = ROUTES[section] ?? '/';
      if (window.location.pathname !== path) onNavigate?.(path);
    };

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
