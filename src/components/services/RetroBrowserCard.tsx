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
};

/**
 * Stylizované „okno prohlížeče“ (bez iframu kvůli XFO).
 * - horní lišta s „• • •“, názvem a externím odkazem
 * - plátno s náhledem (img) nebo placeholder
 */
const RetroBrowserCard: React.FC<Props> = ({ item, accent = 'green' }) => {
  const a = accentPresets[accent];

  return (
    <article
      className={[
        'relative overflow-hidden bg-gray-900 border-2 h-full flex flex-col',
        a.border,
        'shadow-lg transition-transform duration-300 hover:scale-[1.02]',
        a.hoverShadow,
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
            className={['p-1 rounded border', a.border, a.bgSoft, a.text, 'hover:opacity-90'].join(' ')}
            aria-label={`Open ${item.title}`}
            title={item.title}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </header>

      {/* Preview */}
      <div className="flex-1 relative bg-black min-h-0">
        {item.preview ? (
          <img
            src={item.preview}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
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
