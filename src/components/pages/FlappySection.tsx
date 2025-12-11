// src/components/pages/FlappySection.tsx
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { FlappyScene } from '../../phaser/scenes/FlappyScene';

type FlappySectionProps = {
  t: (key: string) => string;
  onExit?: () => void;
};

const FlappySection: React.FC<FlappySectionProps> = ({ onExit }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    // Získat velikost kontejneru
    const rect = containerRef.current.getBoundingClientRect();

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: rect.width,
      height: rect.height,
      backgroundColor: '#87CEEB',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0, x: 0 },
          debug: false,
        },
      },
      scene: [FlappyScene],
      scale: {
        mode: Phaser.Scale.NONE, // Žádné auto-škálování
      },
    };

    gameRef.current = new Phaser.Game(config);

    // Cleanup při unmount
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-[#87CEEB]"
      style={{ imageRendering: 'pixelated', overflow: 'hidden' }}
      tabIndex={0} // Umožnit focus pro keyboard events
      onKeyDown={(e) => {
        // ESC zavře hru
        if (e.key === 'Escape' && onExit) {
          onExit();
          e.stopPropagation();
          return;
        }
        // Zabránit propagaci mezerníku mimo tento container (ale nechat Phaser ho použít)
        if (e.key === ' ' || e.code === 'Space') {
          e.stopPropagation();
        }
      }}
    />
  );
};

export default FlappySection;
