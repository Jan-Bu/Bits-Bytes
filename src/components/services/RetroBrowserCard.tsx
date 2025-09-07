import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Accent, accentPresets } from './theme';

export type ProjectItem = {
  title: string;
  note?: string;
  href?: string;
  /** volitelné – cesta na náhled (např. /imgs/previews/pragoline.webp) */
  preview?: string;
};

type Props = {
  item: ProjectItem;
  accent?: Accent;
  /** Klik na kartu (interní otevření ve webview) */
  onOpen?: (e?: React.MouseEvent) => void;
};

/**
 * Stylizované „okno prohlížeče“ (bez iframu kvůli XFO).
 * - horní lišta s „• • •“, názvem a externím odkazem
 * - plátno s náhledem (img) nebo placeholder
 * - pokud je předán onOpen, karta je celá klikací (a podporuje i prostřední tlačítko)
 */
const RetroBrowserCard: React.FC<Props> = ({ item, accent = 'green', onOpen }) => {
  const a = accentPresets[accent];

  const handleOpen = (e?: React.MouseEvent) => {
    if (!onOpen || !item.href) return;
    e?.preventDefault?.();
    onOpen(e);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // podpora prostředního tlačítka (button === 1)
    if (onOpen && item.href && e.button === 1) {
      e.preventDefault();
      onOpen(e);
    }
  };

  const clickable = Boolean(onOpen && item.href);

  return (
    <article
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={item.title}
      onClick={clickable ? handleOpen : undefined}
      onMouseDown={clickable ? handleMouseDown : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOpen();
              }
            }
          : undefined
      }
      className={[
        'relative rounded-lg overflow-hidden bg-gray-900 border-2',
        a.border,
        'shadow-lg transition-transform duration-300',
        clickable ? 'hover:scale-[1.02] cursor-pointer' : '',
        a.hoverShadow,
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
        clickable ? a.ring : 'ring-transparent',
      ].join(' ')}
    >
      {/* Titlebar */}
      <header
        className={[
          'flex items-center justify-between px-3 py-2 border-b',
          a.border,
          a.bgSoft,
        ].join(' ')}
      >
        <div className="flex items-center gap-2">
          <span className="flex gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />
          </span>
          <span className="text-xs md:text-sm font-mono text-white/90 truncate max-w-[14rem]">
            {item.title}
          </span>
        </div>

        {item.href && (
          <a
            href={item.href}
            target="_blank"
            rel="noreferrer"
            // Důležité: nespouštět interní onOpen při kliknutí na externí ikonu
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className={['p-1 rounded border', a.border, a.bgSoft, a.text, 'hover:opacity-90'].join(' ')}
            aria-label={`Open ${item.title} in new tab`}
            title={item.title}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </header>

      {/* Preview */}
      <div className="aspect-[16/10] relative bg-black">
        {item.preview ? (
          <img
            src={item.preview}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 8px, rgba(255,255,255,0.02) 8px 16px)',
            }}
          />
        )}

        {/* jemné CRT scanlines přes preview */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20 mix-blend-screen"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, rgba(120,255,200,0.25), rgba(120,255,200,0.25) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 3px)',
          }}
        />
      </div>

      {/* Note / tag */}
      {item.note && (
        <footer className={['px-3 py-2 border-t', a.border, 'bg-gray-900/60'].join(' ')}>
          <span className={['text-[11px] font-mono', a.text].join(' ')}>{item.note}</span>
        </footer>
      )}
    </article>
  );
};

export default RetroBrowserCard;
