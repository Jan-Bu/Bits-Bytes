import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { X, Minus, Square } from 'lucide-react';
import { WindowBusCtx } from './WindowBus'; // ✨ bus pro děti

import { AppId } from './types';

type Titles = Record<AppId, string>;
type WindowPos = Record<string, { left: number; top: number }>;

const WIN95 = {
  face: '#c0c0c0',
  light: '#ffffff',
  dark: '#7b7b7b',
  shadow: '#000000',
  title: '#253A8A',
};

const bevelIn = `inset 1px 1px ${WIN95.light}, inset -1px -1px ${WIN95.dark}`;
const bevelOut = `inset 1px 1px ${WIN95.dark}, inset -1px -1px ${WIN95.light}`;

const TASKBAR_SAFE = 40;
const TITLEBAR_H = 24;

type WinProps = {
  id: string;
  title: string;
  left: number;
  top: number;
  z: number;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  children: React.ReactNode;
  frame?: 'panel' | 'edge';
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

  const getWinSize = () => {
    const vw = Math.round(window.visualViewport?.width ?? document.documentElement.clientWidth ?? window.innerWidth);
    const vh = Math.round(window.visualViewport?.height ?? document.documentElement.clientHeight ?? window.innerHeight);
    const portrait = vh >= vw;

    if (portrait) {
      return { width: Math.min(Math.round(vw * 0.92), 560), height: Math.min(Math.round(vh * 0.86), 620) };
    }
    if (enforce70) {
      const isIPadWidth = vw >= 800 && vw <= 1200;
      const factor = isIPadWidth ? 0.90 : 0.70;
      return { width: Math.round(vw * factor), height: Math.round(vh * factor) };
    }
    return { width: Math.min(Math.round(vw * 0.9), 720), height: Math.min(Math.round(vh * 0.78), 460) };
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

  useEffect(() => {
    if (!ref.current) return;
    const { x, y } = clampPos(left, top);
    ref.current.style.left = `${x}px`;
    ref.current.style.top = `${y}px`;
  }, [left, top, clampPos]);

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
  const onPointerUpTitle = () => { if (dragData.current) releaseCapture(dragData.current.pid); };
  const onPointerCancelTitle = () => { if (dragData.current) releaseCapture(dragData.current.pid); };

  const toggleMaximize = () => {
    onMaximize(id);
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
      <div
        ref={titleRef}
        onPointerDown={onPointerDownTitle}
        onPointerMove={onPointerMoveTitle}
        onPointerUp={onPointerUpTitle}
        onPointerCancel={onPointerCancelTitle}
        className="h-6 px-2 flex items-center justify-between text-white"
        style={{ background: WIN95.title, cursor: 'move', touchAction: 'none' }}
      >
        <span className="font-bold text-sm tracking-wide select-none">{title}</span>
        <div className="flex gap-[3px]">
          <button type="button" onClick={() => onMinimize(id)} aria-label="Minimize"
            className="w-7 h-5 grid place-items-center bg-[#bdbdbd] border border-black hover:bg-[#a0a0a0]"
            style={{ boxShadow: bevelOut, cursor: 'pointer' }}><Minus size={14} /></button>
          <button type="button" onClick={toggleMaximize} aria-label="Maximize"
            className="w-7 h-5 grid place-items-center bg-[#bdbdbd] border border-black hover:bg-[#a0a0a0]"
            style={{ boxShadow: bevelOut, cursor: 'pointer' }}><Square size={12} /></button>
          <button type="button" onClick={() => onClose(id)} aria-label="Close"
            className="w-7 h-5 grid place-items-center bg-[#bdbdbd] border border-black hover:bg-[#a0a0a0]"
            style={{ boxShadow: bevelOut, cursor: 'pointer' }}><X size={14} /></button>
        </div>
      </div>

      {frame === 'panel' ? (
        <div className="p-2 w-full" style={{ height: `calc(100% - ${TITLEBAR_H}px)` }}>
          <div className="w-full h-full bg-white overflow-auto" style={{ boxShadow: bevelIn }}>
            <div className="p-4 text-sm leading-relaxed h-full">{children}</div>
          </div>
        </div>
      ) : (
        <div className="w-full h-[calc(100%-24px)]">{children}</div>
      )}
    </div>
  );
};

const Taskbar: React.FC<{
  items: { id: string; title: string; active: boolean; minimized: boolean }[];
  onClickItem: (id: string) => void;
}> = ({ items, onClickItem }) => (
  <div className="fixed bottom-0 left-0 right-0 h-8 flex items-center gap-2 px-2"
    style={{ background: WIN95.face, boxShadow: `0 -1px ${WIN95.dark}, inset 1px 1px ${WIN95.light}, inset -1px -1px ${WIN95.dark}` }}>
    <button className="h-6 px-3 bg-[#bdbdbd] border border-black text-sm font-semibold" style={{ boxShadow: bevelOut }}>Start</button>
    <div className="flex-1 flex items-center gap-2 overflow-x-auto">
      {items.map(it => (
        <button key={it.id} onClick={() => onClickItem(it.id)}
          className={`h-6 px-2 bg-[#bdbdbd] border border-black text-xs ${it.active && !it.minimized ? 'font-bold' : ''}`}
          style={{ boxShadow: (it.active && !it.minimized) ? bevelIn : bevelOut, opacity: it.minimized ? 0.85 : 1 }}
          title={it.minimized ? 'Restore' : 'Minimize'}>
          {it.title}
        </button>
      ))}
    </div>
    <div className="h-6 px-3 grid place-items-center text-xs" style={{ background: '#bdbdbd', boxShadow: bevelIn, minWidth: 68 }}>
      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </div>
  </div>
);

type DesktopWindowManagerProps = {
  open: AppId[];
  zOrder: AppId[];
  titles: Record<string, string>;
  windowPos?: WindowPos;
  onFocus: (id: AppId) => void;
  onClose: (id: AppId) => void;
  onMinimize: (id: AppId) => void;
  onMaximize: (id: AppId) => void;
  renderContent: (id: AppId) => React.ReactNode;
  onAboutFullscreenChange?: (isFullscreen: boolean) => void;
  aboutFullscreenContent?: React.ReactNode;
};

// ==== import pro post okna ====
import type { BlogPost } from "../pages/BlogSection";
import { PostWindow } from "../desktop/PostWindow";

// ========== MANAGER ==========
export const DesktopWindowManager: React.FC<DesktopWindowManagerProps> = ({
  open, zOrder, titles, windowPos, onFocus, onClose, onMinimize, onMaximize,
  renderContent, onAboutFullscreenChange, aboutFullscreenContent,
}) => {
  const zFor = useCallback((id: string) => 100 + zOrder.indexOf(id as any), [zOrder]);

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

  // ====== ABOUT loader (beze změny) ======
  const [aboutLoading, setAboutLoading] = useState(false);
  const [aboutFullscreen, setAboutFullscreen] = useState(false);
  const [aboutLoadPct, setAboutLoadPct] = useState(0);
  const timersRef = useRef<{ interval?: number; timeout?: number }>({}); const startedRef = useRef(false);
  useEffect(() => {
    const isAboutOpen = open.includes('about' as any);
    if (isAboutOpen && !aboutFullscreen && !startedRef.current) {
      startedRef.current = true; setAboutLoading(true); setAboutLoadPct(0);
      const start = Date.now();
      timersRef.current.interval = window.setInterval(() => {
        const elapsed = Date.now() - start; const pct = Math.min(100, Math.round((elapsed / 900) * 100));
        setAboutLoadPct(pct);
      }, 50);
      timersRef.current.timeout = window.setTimeout(() => {
        if (timersRef.current.interval) clearInterval(timersRef.current.interval);
        setAboutLoadPct(100); setAboutLoading(false); setAboutFullscreen(true); onAboutFullscreenChange?.(true);
      }, 1000);
    }
    if (!isAboutOpen && (aboutLoading || aboutFullscreen || startedRef.current)) {
      if (timersRef.current.interval) clearInterval(timersRef.current.interval);
      if (timersRef.current.timeout) clearTimeout(timersRef.current.timeout);
      startedRef.current = false; setAboutLoading(false); setAboutFullscreen(false); setAboutLoadPct(0);
      onAboutFullscreenChange?.(false);
    }
  }, [open, aboutFullscreen, onAboutFullscreenChange, aboutLoading]);

  // ESC zavře top window
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open.length) {
        const top = zOrder[zOrder.length - 1];
        if (top) handleClose(top as any);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, zOrder]);

  // === Minimalizace řízená zde (beze změny pro standardní okna) ===
  const [minimized, setMinimized] = useState<Set<string>>(new Set());
  const handleMinimize = (id: string) => setMinimized(prev => new Set(prev).add(id));
  const restoreFromMinimized = (id: string) => {
    setMinimized(prev => { const next = new Set(prev); next.delete(id); return next; });
    onFocus(id as any);
  };
  const toggleFromTaskbar = (id: string) => {
    setMinimized(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); onFocus(id as any); }
      else { next.add(id); }
      return next;
    });
  };
  const handleClose = (id: string) => {
    setMinimized(prev => { if (!prev.size) return prev; const next = new Set(prev); next.delete(id); return next; });
    onClose(id as any);
    // pro dynamická post okna zavřeme i jejich registr (níže)
    if (id.startsWith("post:")) {
      setPostWins(prev => {
        const n = { ...prev }; delete n[id]; return n;
      });
    }
  };

  // === POST WINDOWS (dynamická okna) =====================================
  const [postWins, setPostWins] = useState<Record<string, { post: BlogPost; title: string }>>({});
  const openPostWindow = (post: BlogPost) => {
    const id = `post:${post.id}`;
    setPostWins(prev => ({ ...prev, [id]: { post, title: post.title } }));
    // „otevřít“ přes tvůj nadřazený state: zavoláme focus (zOrder) a odemkneme z Taskbaru
    restoreFromMinimized(id);
    onFocus(id as any);
  };

  // taskbar seznam = standardní + dynamické post okna
  const taskbarItems = [
    ...open.map(id => ({ id: id as string, title: titles[id], active: id === (zOrder[zOrder.length - 1] as any), minimized: minimized.has(id as any) })),
    ...Object.keys(postWins).map(id => ({ id, title: postWins[id].title, active: (id === (zOrder[zOrder.length - 1] as any)), minimized: minimized.has(id) })),
  ];

  // pozice pro dynamická okna (pokud není v windowPos)
  const posFor = (id: string) => {
    if (wpos[id]) return wpos[id];
    // jednoduchý „fanning“ podle hash
    const i = Math.abs([...id].reduce((s, c) => s + c.charCodeAt(0), 0)) % 6;
    return { left: 220 + i * 40, top: 120 + i * 40 };
  };

  // =======================================================================

  // RetroLoading – (zkráceno) …
  const RetroLoading: React.FC = () => (
    <div className="w-full h-full rounded-[2px] overflow-hidden" style={{ backgroundColor: '#000' }}>
      <div className="w-full h-full flex items-center justify-center text-green-400 font-mono">LOADING…</div>
    </div>
  );

  // === RENDER =============================================================
  return (
    <WindowBusCtx.Provider value={{ openPostWindow }}>
      <>
        {/* Standardní okna (podle props.open) */}
        {open.map((id) => {
          if (id === 'about' as any && aboutFullscreen) return null;
          if (id === 'about' as any && aboutLoading) {
            if (minimized.has('about')) return null;
            return (
              <Win95Window key="about-loading" id="about" title={titles['about']} left={posFor('about').left} top={posFor('about').top}
                z={zFor('about')} onFocus={onFocus as any} onClose={handleClose} onMinimize={handleMinimize} onMaximize={onFocus as any} frame="panel" enforce70={false}>
                <div className="w-full h-[360px]"><RetroLoading /></div>
              </Win95Window>
            );
          }
          if (minimized.has(id as any)) return null;
          const raw = renderContent(id);
          const enhanced = React.isValidElement(raw) ? React.cloneElement(raw as any, { embedded: true, onRequestClose: () => handleClose(id as any) }) : raw;

          const p = posFor(id as string);
          return (
            <Win95Window key={id as string} id={id as string} title={titles[id]} left={p.left} top={p.top}
              z={zFor(id as string)} onFocus={onFocus as any} onClose={handleClose} onMinimize={handleMinimize} onMaximize={onFocus as any}
              frame="edge" enforce70={id !== ('about' as any)}>
              <div className="w-full h-[calc(100%-24px)]"><div className="w-full h-full">{enhanced}</div></div>
            </Win95Window>
          );
        })}

        {/* Dynamická POST okna */}
        {Object.entries(postWins).map(([id, data]) => {
          if (minimized.has(id)) return null;
          const p = posFor(id);
          return (
            <Win95Window key={id} id={id} title={data.title} left={p.left} top={p.top}
              z={zFor(id)} onFocus={onFocus as any} onClose={handleClose} onMinimize={handleMinimize} onMaximize={onFocus as any}
              frame="edge" enforce70>
              <PostWindow post={data.post} t={(k: string) => k as any} />
            </Win95Window>
          );
        })}

        {/* ABOUT fullscreen stage */}
        {aboutFullscreen && (
          <div className="fixed inset-0 z-[9999] bg-black" role="dialog" aria-label={`${titles['about']} Fullscreen`}>
            {aboutFullscreenContent ?? <div className="w-full h-full grid place-items-center text-white">About Fullscreen</div>}
          </div>
        )}

        <Taskbar
          items={taskbarItems}
          onClickItem={(id) => toggleFromTaskbar(id)}
        />
      </>
    </WindowBusCtx.Provider>
  );
};
