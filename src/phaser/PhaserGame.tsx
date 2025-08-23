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
      backgroundColor: '#000',
      scale: {
        mode: Phaser.Scale.FIT,           // vše viditelné, bez ořezu
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

    // === jen lokálně: parent kopíruje skutečný viewport (i s iOS lištami) ===
    const getViewportSize = () => {
      const vv = (window as any).visualViewport as VisualViewport | undefined;
      const vw = Math.floor(vv?.width ?? window.innerWidth);
      const vh = Math.floor(vv?.height ?? window.innerHeight);
      return { vw, vh };
    };

    const applyViewportSize = () => {
      if (!hostRef.current || !gameRef.current) return;
      const { vw, vh } = getViewportSize();

      // nastavíme přesné px jen na PARENTU téhle komponenty
      hostRef.current.style.width = `${vw}px`;
      hostRef.current.style.height = `${vh}px`;

      // řekneme Phaser Scale manageru velikost parentu (bez ořezu UI lišt)
      gameRef.current.scale.setParentSize(vw, vh);
      // refresh pro jistotu, ale bez tvrdého resize canvasu
      gameRef.current.scale.refresh();
    };

    applyViewportSize();

    // naslouchání změnám, které mění skutečný viewport na mobilech
    const vv = (window as any).visualViewport as VisualViewport | undefined;
    window.addEventListener('resize', applyViewportSize);
    window.addEventListener('orientationchange', applyViewportSize);
    vv?.addEventListener('resize', applyViewportSize);
    vv?.addEventListener('scroll', applyViewportSize);

    return () => {
      game.events.off('navigate', onNav);
      window.removeEventListener('resize', applyViewportSize);
      window.removeEventListener('orientationchange', applyViewportSize);
      vv?.removeEventListener('resize', applyViewportSize);
      vv?.removeEventListener('scroll', applyViewportSize);
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [onNavigate]);

  // žádné globální styly – jen lokálně pro tento wrapper
  return (
    <div
      ref={hostRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',  // počáteční fallback
        height: '100vh', // skutečnou výšku přepíšeme JS výše
        background: '#000',
        overscrollBehavior: 'none',
      }}
    />
  );
};
