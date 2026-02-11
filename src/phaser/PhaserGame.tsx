// src/phaser/PhaserGame.tsx
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';

type Lang = 'cs' | 'en';
type Props = {
  navigate: (path: string) => void;
  getLang: () => Lang;
  setLang: (l?: Lang) => void; // u tebe voláme bez argumentu = toggle
};

export const PhaserGame: React.FC<Props> = ({ navigate, getLang, setLang }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  // Držíme aktuální callbacky v ref, ať nemusíme re-initovat hru
  const navigateRef = useRef(navigate);
  const getLangRef = useRef(getLang);
  const setLangRef = useRef(setLang);

  useEffect(() => { navigateRef.current = navigate; }, [navigate]);
  useEffect(() => { getLangRef.current = getLang; }, [getLang]);
  useEffect(() => { setLangRef.current = setLang; }, [setLang]);

  // Hru vytvoříme pouze jednou
  useEffect(() => {
    if (!hostRef.current || gameRef.current) return;

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

    // Předáme scéně WRAPPERY, které čtou z refů (stabilní, bez reinitu)
    game.scene.start('MainScene', {
      navigate: (path: string) => navigateRef.current(path),
      getLang: () => getLangRef.current(),
      setLang: (l?: Lang) => setLangRef.current(l),
    });

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []); // <- žádné závislosti!

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
