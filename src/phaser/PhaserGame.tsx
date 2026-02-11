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
  // Reactively keep host height in sync with visualViewport on mobile
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const setSizeFromViewport = () => {
      const vv: any = (window as any).visualViewport;
      let w: number = window.innerWidth;
      let h: number = window.innerHeight;
      if (vv && vv.width && vv.height) {
        w = Math.round(vv.width);
        h = Math.round(vv.height);
      }

      // update CSS var --vh so we can use calc(var(--vh) * 100) in CSS
      try {
        document.documentElement.style.setProperty('--vh', `${h * 0.01}px`);
      } catch (e) {
        // ignore
      }

      // Ensure host uses the computed --vh
      el.style.width = `${w}px`;
      el.style.height = 'calc(var(--vh) * 100)';

      // Also notify Phaser scale manager so it can recalc sizes
      try {
        const game = gameRef.current;
        if (game && game.scale && typeof game.scale.resize === 'function') {
          const rw = w;
          const rh = h;
          // @ts-ignore
          game.scale.resize(rw, rh);
        }
      } catch (e) {
        // ignore
      }
    };

    setSizeFromViewport();
    window.addEventListener('resize', setSizeFromViewport);
    window.addEventListener('orientationchange', setSizeFromViewport);
    if ((window as any).visualViewport) {
      (window as any).visualViewport.addEventListener('resize', setSizeFromViewport);
      (window as any).visualViewport.addEventListener('scroll', setSizeFromViewport);
    }

    return () => {
      window.removeEventListener('resize', setSizeFromViewport);
      window.removeEventListener('orientationchange', setSizeFromViewport);
      if ((window as any).visualViewport) {
        (window as any).visualViewport.removeEventListener('resize', setSizeFromViewport);
        (window as any).visualViewport.removeEventListener('scroll', setSizeFromViewport);
      }
    };
  }, []);

    return (
    <div
      id="phaser-host"
      ref={hostRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        background: '#000',
        overscrollBehavior: 'none',
        display: 'block',
        touchAction: 'manipulation',
      }}
    />
  );
};
