// src/components/desktop/DesktopWindowManager.tsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { X, Minus, Square } from 'lucide-react';

import { AppId } from './types';

type Titles = Record<AppId, string>;
type WindowPos = Record<AppId, { left: number; top: number }>;

const WIN95 = {
  face: '#c0c0c0',
  light: '#ffffff',
  dark: '#7b7b7b',
  shadow: '#000000',
  title: '#253A8A',
};

const bevelIn = `inset 1px 1px ${WIN95.light}, inset -1px -1px ${WIN95.dark}`;
const bevelOut = `inset 1px 1px ${WIN95.dark}, inset -1px -1px ${WIN95.light}`;

const TASKBAR_SAFE = 40; // rezerva dole (taskbar ~32 px)
const TITLEBAR_H = 24;

type WinProps = {
  id: AppId;
  title: string;
  left: number;
  top: number;
  z: number;
  onFocus: (id: AppId) => void;
  onClose: (id: AppId) => void;
  onMinimize: (id: AppId) => void;
  onMaximize: (id: AppId) => void;
  children: React.ReactNode;
  /** panel = bílý vnitřní panel s paddingem; edge = obsah zabere celé okno bez vnitřního rámu */
  frame?: 'panel' | 'edge';
  /** v landscape vynutí startovní velikost aspoň 70% viewportu */
  enforce70?: boolean;
};

const Win95Window: React.FC<WinProps> = ({
  id, title, left, top, z,
  onFocus, onClose, onMinimize, onMaximize,
  children, frame = 'panel', enforce70 = false
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const dragData = useRef<{ dx: number; dy: number; pid: number } | null>(null);

  // === responsivní velikosti (telefon ponechán), landscape >= 70% pokud enforce70 === true ===
  const getWinSize = () => {
    // spolehlivější rozměry na iOS/iPadOS
    const vw = Math.round(window.visualViewport?.width ?? document.documentElement.clientWidth ?? window.innerWidth);
    const vh = Math.round(window.visualViewport?.height ?? document.documentElement.clientHeight ?? window.innerHeight);

    const portrait = vh >= vw;

    if (portrait) {
      // telefon / portrét beze změny
      return {
        width: Math.min(Math.round(vw * 0.92), 560),
        height: Math.min(Math.round(vh * 0.86), 620),
      };
    }

    if (enforce70) {
      // ⬆️ „iPad“ šířky: udělej to větší (cca 90 %)
      // iPad / tablet landscape bývá cca 820–1180 px šířka (CSS px)
      const isIPadWidth = vw >= 800 && vw <= 1200;
      const factor = isIPadWidth ? 0.90 : 0.70;

      return {
        width: Math.round(vw * factor),
        height: Math.round(vh * factor),
      };
    }

    // původní landscape (např. pro ABOUT)
    return {
      width: Math.min(Math.round(vw * 0.9), 720),
      height: Math.min(Math.round(vh * 0.78), 460),
    };
  };

  const [baseSize, setBaseSize] = useState(getWinSize);
  const [isMaximized, setIsMaximized] = useState(false);
  const [restorePos, setRestorePos] = useState<{ left: number; top: number } | null>(null);

  const clampPos = useCallback((x: number, y: number, w?: number, h?: number) => {
    const width = w ?? (isMaximized ? window.innerWidth : baseSize.width);
    const height = h ?? (isMaximized ? window.innerHeight - TASKBAR_SAFE : baseSize.height);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxX = Math.max(0, vw - width);
    const maxY = Math.max(0, vh - height - TASKBAR_SAFE);
    return { x: Math.min(Math.max(0, x), maxX), y: Math.min(Math.max(0, y), maxY) };
  }, [baseSize.width, baseSize.height, isMaximized]);

  // Srovnat startovní pozici
  useEffect(() => {
    if (!ref.current) return;
    const { x, y } = clampPos(left, top);
    ref.current.style.left = `${x}px`;
    ref.current.style.top = `${y}px`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, top]);

  // Resize / orientationchange
  useEffect(() => {
    const onResize = () => {
      if (!isMaximized) setBaseSize(getWinSize());
      if (ref.current) {
        const curLeft = parseFloat(ref.current.style.left || '0') || 0;
        const curTop = parseFloat(ref.current.style.top || '0') || 0;
        const { x, y } = clampPos(curLeft, curTop);
        ref.current.style.left = `${x}px`;
        ref.current.style.top = `${y}px`;
      }
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize as any);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize as any);
    };
  }, [clampPos, isMaximized]);

  // === DRAG titulku – nechytej tlačítka a capture na titlebar ===
  const onPointerDownTitle = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target?.closest('button')) return;
    if (!ref.current || !titleRef.current || isMaximized) return;
    onFocus(id);
    titleRef.current.setPointerCapture(e.pointerId);
    const rect = ref.current.getBoundingClientRect();
    dragData.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top, pid: e.pointerId };
  };
  const onPointerMoveTitle = (e: React.PointerEvent) => {
    if (!ref.current || !dragData.current || isMaximized) return;
    const nx = e.clientX - dragData.current.dx;
    const ny = e.clientY - dragData.current.dy;
    const cl = clampPos(nx, ny);
    ref.current.style.left = `${cl.x}px`;
    ref.current.style.top = `${cl.y}px`;
  };
  const releaseCapture = (pid: number) => {
    if (titleRef.current && titleRef.current.hasPointerCapture?.(pid)) titleRef.current.releasePointerCapture(pid);
    dragData.current = null;
  };
  const onPointerUpTitle = () => {
    if (!dragData.current) return;
    releaseCapture(dragData.current.pid);
  };
  const onPointerCancelTitle = () => {
    if (!dragData.current) return;
    releaseCapture(dragData.current.pid);
  };

  // === Maximize toggle ===
  const toggleMaximize = () => {
    onMaximize(id); // kvůli zOrder
    if (!ref.current) return;

    if (!isMaximized) {
      const curLeft = parseFloat(ref.current.style.left || '0') || 0;
      const curTop = parseFloat(ref.current.style.top || '0') || 0;
      setRestorePos({ left: curLeft, top: curTop });
      setIsMaximized(true);
      ref.current.style.left = `0px`;
      ref.current.style.top = `0px`;
    } else {
      const back = restorePos ?? { left, top };
      const cl = clampPos(back.left, back.top, baseSize.width, baseSize.height);
      ref.current.style.left = `${cl.x}px`;
      ref.current.style.top = `${cl.y}px`;
      setIsMaximized(false);
    }
  };

  const width = isMaximized ? window.innerWidth : baseSize.width;
  const height = isMaximized ? Math.max(200, window.innerHeight - TASKBAR_SAFE) : baseSize.height;

  return (
    <div
      ref={ref}
      onMouseDown={() => onFocus(id)}
      style={{
        position: 'absolute',
        left, top,
        width, height,
        background: WIN95.face,
        boxShadow: bevelOut,
        zIndex: z,
        imageRendering: 'pixelated',
      }}
      className="select-none"
      role="dialog"
      aria-label={title}
    >
      {/* Titlebar */}
      <div
        ref={titleRef}
        onPointerDown={onPointerDownTitle}
        onPointerMove={onPointerMoveTitle}
        onPointerUp={onPointerUpTitle}
        onPointerCancel={onPointerCancelTitle}
        className="h-6 px-2 flex items-center justify-between text-white"
        style={{ background: WIN95.title, cursor: isMaximized ? 'default' : 'move', touchAction: 'none' }}
      >
        <span className="font-bold text-sm tracking-wide select-none">{title}</span>

        <div className="flex gap-[3px]">
          <button
            type="button"
            onClick={() => onMinimize(id)}
            aria-label="Minimize"
            className="w-7 h-5 grid place-items-center bg-[#bdbdbd] border border-black hover:bg-[#a0a0a0]"
            style={{ boxShadow: bevelOut, cursor: 'pointer' }}
          >
            <Minus size={14} />
          </button>

          <button
            type="button"
            onClick={toggleMaximize}
            aria-label={isMaximized ? 'Restore' : 'Maximize'}
            className="w-7 h-5 grid place-items-center bg-[#bdbdbd] border border-black hover:bg-[#a0a0a0]"
            style={{ boxShadow: bevelOut, cursor: 'pointer' }}
          >
            <Square size={12} />
          </button>

          <button
            type="button"
            onClick={() => onClose(id)}
            aria-label="Close"
            className="w-7 h-5 grid place-items-center bg-[#bdbdbd] border border-black hover:bg-[#a0a0a0]"
            style={{ boxShadow: bevelOut, cursor: 'pointer' }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      {frame === 'panel' ? (
        <div className="p-2 w-full" style={{ height: `calc(100% - ${TITLEBAR_H}px)` }}>
          <div className="w-full h-full bg-white overflow-auto" style={{ boxShadow: bevelIn }}>
            <div className="p-4 text-sm leading-relaxed h-full">{children}</div>
          </div>
        </div>
      ) : (
        // edge: obsah zabere celé okno (žádný vnitřní bílý panel)
        <div className="w-full h-full">{children}</div>
      )}
    </div>
  );
};

const Taskbar: React.FC<{
  items: { id: AppId; title: string; active: boolean; minimized: boolean }[];
  onClickItem: (id: AppId) => void; // toggle minimize/restore
}> = ({ items, onClickItem }) => (
  <div
    className="fixed bottom-0 left-0 right-0 h-8 flex items-center gap-2 px-2"
    style={{
      background: WIN95.face,
      boxShadow: `0 -1px ${WIN95.dark}, inset 1px 1px ${WIN95.light}, inset -1px -1px ${WIN95.dark}`
    }}
  >
    <button className="h-6 px-3 bg-[#bdbdbd] border border-black text-sm font-semibold" style={{ boxShadow: bevelOut }}>
      Start
    </button>
    <div className="flex-1 flex items-center gap-2 overflow-x-auto">
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onClickItem(it.id)}
          className={`h-6 px-2 bg-[#bdbdbd] border border-black text-xs ${it.active && !it.minimized ? 'font-bold' : ''}`}
          style={{ boxShadow: (it.active && !it.minimized) ? bevelIn : bevelOut, opacity: it.minimized ? 0.85 : 1 }}
          title={it.minimized ? 'Restore' : 'Minimize'}
        >
          {it.title}
        </button>
      ))}
    </div>
    <div
      className="h-6 px-3 grid place-items-center text-xs"
      style={{ background: '#bdbdbd', boxShadow: bevelIn, minWidth: 68 }}
    >
      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </div>
  </div>
);

type DesktopWindowManagerProps = {
  open: AppId[];
  zOrder: AppId[];
  titles: Titles;
  windowPos?: WindowPos;
  onFocus: (id: AppId) => void;
  onClose: (id: AppId) => void;
  onMinimize: (id: AppId) => void;
  onMaximize: (id: AppId) => void;
  renderContent: (id: AppId) => React.ReactNode;
  onAboutFullscreenChange?: (isFullscreen: boolean) => void;
  aboutFullscreenContent?: React.ReactNode;
};

export const DesktopWindowManager: React.FC<DesktopWindowManagerProps> = ({
  open,
  zOrder,
  titles,
  windowPos,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  renderContent,
  onAboutFullscreenChange,
  aboutFullscreenContent,
}) => {
  const zFor = useCallback((id: AppId) => 100 + zOrder.indexOf(id), [zOrder]);

  const defaultPos: WindowPos = useMemo(() => ({
    about: { left: 220, top: 120 },
    services: { left: 260, top: 160 },
    pricing: { left: 300, top: 200 },
    blog: { left: 340, top: 240 },
    contact: { left: 380, top: 280 },
    terms: { left: 420, top: 160 },
    gdpr: { left: 460, top: 200 },
    webview: { left: 500, top: 240 },
  }), []);
  const wpos = windowPos ?? defaultPos;

  // ====== ABOUT loading/fullscreen logika (beze změny) ======
  const [aboutLoading, setAboutLoading] = useState(false);
  const [aboutFullscreen, setAboutFullscreen] = useState(false);
  const [aboutLoadPct, setAboutLoadPct] = useState(0);

  const timersRef = useRef<{ interval?: number; timeout?: number }>({});
  const startedRef = useRef(false);

  useEffect(() => {
    const isAboutOpen = open.includes('about');

    if (isAboutOpen && !aboutFullscreen && !startedRef.current) {
      startedRef.current = true;
      setAboutLoading(true);
      setAboutLoadPct(0);

      const start = Date.now();
      timersRef.current.interval = window.setInterval(() => {
        const elapsed = Date.now() - start;
        const pct = Math.min(100, Math.round((elapsed / 900) * 100));
        setAboutLoadPct(pct);
      }, 50);

      timersRef.current.timeout = window.setTimeout(() => {
        if (timersRef.current.interval) clearInterval(timersRef.current.interval);
        setAboutLoadPct(100);
        setAboutLoading(false);
        setAboutFullscreen(true);
        onAboutFullscreenChange?.(true);
      }, 1000);
    }

    if (!isAboutOpen && (aboutLoading || aboutFullscreen || startedRef.current)) {
      if (timersRef.current.interval) clearInterval(timersRef.current.interval);
      if (timersRef.current.timeout) clearTimeout(timersRef.current.timeout);
      startedRef.current = false;
      setAboutLoading(false);
      setAboutFullscreen(false);
      setAboutLoadPct(0);
      onAboutFullscreenChange?.(false);
    }
  }, [open, aboutFullscreen, onAboutFullscreenChange, aboutLoading]);

  // ESC zavře top window
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open.length) {
        const top = zOrder[zOrder.length - 1];
        if (top) handleClose(top);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, zOrder]);

  // === Minimalizace: udržujeme lokální set minimalizovaných id ===
  const [minimized, setMinimized] = useState<Set<AppId>>(new Set());

  const handleMinimize = (id: AppId) => {
    setMinimized(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const restoreFromMinimized = (id: AppId) => {
    setMinimized(prev => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    onFocus(id);
  };

  const toggleFromTaskbar = (id: AppId) => {
    setMinimized(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        onFocus(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleClose = (id: AppId) => {
    setMinimized(prev => {
      if (!prev.size) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    onClose(id);
  };

  // Retro loader pro About
  const RetroLoading: React.FC = () => (
    <div
      className="w-full h-full rounded-[2px] overflow-hidden"
      style={{
        backgroundColor: '#000',
        backgroundImage: `
          radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.95) 100%),
          repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 2px, transparent 4px)
        `,
        imageRendering: 'pixelated',
      }}
    >
      <div className="w-full h-full flex flex-col items-center justify-center text-green-400 font-mono px-4">
        <div className="text-center mb-6">
          <div className="text-[13px] tracking-wider">BITS&BYTES ENGINE v1.0</div>
          <div className="text-[11px] opacity-70 mt-1">© 1998–2003 BB Studio</div>
        </div>
        <div className="mb-3 text-[13px]">
          <span className="mr-2">LOADING</span>
          <span className="inline-block w-1 h-4 align-middle animate-pulse">▮</span>
        </div>
        <div className="w-[min(520px,90%)] border border-green-500 p-1" style={{ boxShadow: '0 0 8px rgba(0,255,0,0.25) inset' }}>
          <div
            className="h-4 bg-green-500"
            style={{
              width: `${aboutLoadPct}%`,
              transition: 'width 80ms linear',
              boxShadow: '0 0 6px rgba(0,255,0,0.7)',
            }}
          />
        </div>
        <div className="mt-2 text-[11px] opacity-80">
          {aboutLoadPct < 100 ? `Loading assets… ${aboutLoadPct}%` : 'Ready.'}
        </div>
        <div className="mt-5 text-[10px] leading-relaxed opacity-80 text-center">
          <div>INIT VIDEO… OK</div>
          <div>INIT AUDIO… OK</div>
          <div>INIT INPUT… OK</div>
          <div>BUILD SCENE… {aboutLoadPct >= 80 ? 'OK' : '…'}</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Okna */}
      {open.map((id) => {
        // ABOUT fullscreen stage anebo loader
        if (id === 'about' && aboutFullscreen) return null;

        if (id === 'about' && aboutLoading) {
          if (minimized.has('about')) return null;
          return (
            <Win95Window
              key="about-loading"
              id="about"
              title={titles['about']}
              left={wpos['about'].left}
              top={wpos['about'].top}
              z={zFor('about')}
              onFocus={onFocus}
              onClose={handleClose}
              onMinimize={handleMinimize}
              onMaximize={onFocus}
              frame="panel" // loader v panelu
              enforce70={false}
            >
              <div className="w-full h-[360px]">
                <RetroLoading />
              </div>
            </Win95Window>
          );
        }

        if (minimized.has(id)) return null;

        // Render obsahu okna
        const raw = renderContent(id);

        // ✨ Auto-inject: pokud je to React element, přidej embedded + onRequestClose
        const enhanced =
          React.isValidElement(raw)
            ? React.cloneElement(raw as any, {
              embedded: true,
              onRequestClose: () => handleClose(id),
            })
            : raw;

        return (
          <Win95Window
            key={id}
            id={id}
            title={titles[id]}
            left={wpos[id].left}
            top={wpos[id].top}
            z={zFor(id)}
            onFocus={onFocus}
            onClose={handleClose}
            onMinimize={handleMinimize}
            onMaximize={onFocus}
            frame="edge" // ⚡️ běžné stránky zabírají celé okno (žádný vnitřní panel)
            enforce70={id !== 'about'} // 🔸 70% viewportu pro všechno kromě ABOUT
          >
            {/* Obsah stránky vyplní okno */}
            <div className="w-full h-[calc(100%-24px)]">
              {/* Pozn.: h-… nechává trochu místa oproti titlebaru Win95Window, aby embedded layouty seděly */}
              <div className="w-full h-full">{enhanced}</div>
            </div>
          </Win95Window>
        );
      })}

      {/* ABOUT fullscreen stage */}
      {aboutFullscreen && (
        <div
          className="fixed inset-0 z-[9999] bg-black"
          style={{ imageRendering: 'pixelated' }}
          role="dialog"
          aria-label={`${titles['about']} Fullscreen`}
        >
          {aboutFullscreenContent ?? (
            <div className="w-full h-full grid place-items-center text-white">
              <div className="text-center opacity-80">
                <div className="text-2xl font-bold mb-2">{titles['about']} – Fullscreen</div>
                <div>Sem vlož &lt;AboutSection /&gt; (hra)</div>
              </div>
            </div>
          )}
        </div>
      )}

      <Taskbar
        items={open.map((id) => ({
          id,
          title: titles[id],
          active: id === zOrder[zOrder.length - 1],
          minimized: minimized.has(id),
        }))}
        onClickItem={toggleFromTaskbar}
      />
    </>
  );
};
