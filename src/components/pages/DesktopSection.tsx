// src/components/pages/DesktopSection.tsx
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { DesktopWindowManager } from '../desktop/DesktopWindowManager';
import { AppId } from '../desktop/types';
import AboutSection from './AboutSection';
import PricingSection from './PricingSection';
import ServicesSection from './ServicesSection';
import BlogSection from './BlogSection';
import ContactSection from './ContactSection';
import TermsSection from './TermsSection';
import GDPRSection from './GDPRSection';
import FlappySection from './FlappySection';
import ClippyAssistant from '../desktop/ClippyAssistant';

/* ---- lokální rozšíření ID kvůli internímu prohlížeči ---- */
type DesktopAppId = AppId | 'webview';

/* --- Breakpoint hook --- */
type BP = 'mobile' | 'tablet' | 'desktop';
function useBreakpoint(): BP {
  const get = () => {
    const w = window.innerWidth;
    if (w < 640) return 'mobile';
    if (w < 1024) return 'tablet';
    return 'desktop';
  };
  const [bp, setBp] = useState<BP>(get);
  useEffect(() => {
    const onR = () => setBp(get());
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, []);
  return bp;
}

/* --- Ikony --- */
type IconAppId = Exclude<AppId, 'webview'>;

const iconMeta: Record<IconAppId, { src: string }> = {
  about: { src: '/icons/about_icon.png' },
  services: { src: '/icons/services_icon.png' },
  pricing: { src: '/icons/pricing_icon.png' },
  blog: { src: '/icons/blog_icon.png' },
  contact: { src: '/icons/contact_icon.png' },
  terms: { src: '/icons/text_icon.png' },
  gdpr: { src: '/icons/text_icon.png' },
  flappy: { src: '/icons/flappy_icon.png' },
};

const DesktopIcon: React.FC<{
  id: AppId; label: string; x: number; y: number;
  onOpen: (id: AppId) => void;
  onMove: (id: AppId, x: number, y: number) => void;
  src: string;
  desktopRef: React.RefObject<HTMLDivElement>;
  ICON_SIZE: number;
  DESKTOP_MARGIN: number;
  TASKBAR_HEIGHT: number;
  snapX: (n: number) => number;
  snapY: (n: number) => number;
  blockedRects?: Array<{ x:number; y:number; w:number; h:number }>;
  occupiedRects?: Array<{ x:number; y:number; w:number; h:number }>;
  GRID: number;
}> = ({
  id, label, x, y, onOpen, onMove, src, desktopRef,
  ICON_SIZE, DESKTOP_MARGIN, TASKBAR_HEIGHT, snapX, snapY,
  blockedRects = [], occupiedRects = [], GRID,
}) => {
  const local = useRef<{ dx: number; dy: number; dragging: boolean; startedAt?: { x: number; y: number } }>({
    dx: 0, dy: 0, dragging: false,
  });
  const raf = useRef<number | null>(null);

  const clampToDesktop = (nx: number, ny: number) => {
    const desk = desktopRef.current;
    if (!desk) return { nx, ny };
    const rect = desk.getBoundingClientRect();
    const maxX = rect.width - DESKTOP_MARGIN - ICON_SIZE;
    const maxY = rect.height - (DESKTOP_MARGIN + TASKBAR_HEIGHT) - (ICON_SIZE + 30);
    return {
      nx: Math.min(Math.max(nx, DESKTOP_MARGIN), Math.max(DESKTOP_MARGIN, maxX)),
      ny: Math.min(Math.max(ny, DESKTOP_MARGIN), Math.max(DESKTOP_MARGIN, maxY)),
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLDivElement;
    if (e.isPrimary) target.setPointerCapture(e.pointerId);

    local.current.dragging = true;

    const rect = desktopRef.current?.getBoundingClientRect();
    const desktopLeft = rect?.left ?? 0;
    const desktopTop = rect?.top ?? 0;
    local.current.dx = e.clientX - (desktopLeft + x);
    local.current.dy = e.clientY - (desktopTop + y);
    local.current.startedAt = { x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!local.current.dragging) return;
    e.preventDefault();

    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const rect = desktopRef.current?.getBoundingClientRect();
      const desktopLeft = rect?.left ?? 0;
      const desktopTop = rect?.top ?? 0;

      const nxRaw = e.clientX - desktopLeft - local.current.dx;
      const nyRaw = e.clientY - desktopTop - local.current.dy;

      const s = local.current.startedAt;
      if (s && Math.hypot(e.clientX - s.x, e.clientY - s.y) < 4) return;

      const { nx, ny } = clampToDesktop(nxRaw, nyRaw);
      onMove(id, nx, ny);
    });
  };

  // --- Kolize ---
  const intersects = (a: {x:number;y:number;w:number;h:number}, b:{x:number;y:number;w:number;h:number}) =>
    !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);

  const iconRectAt = (xx:number, yy:number) => ({ x: xx, y: yy, w: ICON_SIZE, h: ICON_SIZE + 30 });

  const finishDrag = (e: React.PointerEvent) => {
    const target = e.currentTarget as HTMLDivElement;
    try { target.releasePointerCapture(e.pointerId); } catch {}
    if (!local.current.dragging) return;
    local.current.dragging = false;

    const rect = desktopRef.current?.getBoundingClientRect();
    const desktopLeft = rect?.left ?? 0;
    const desktopTop = rect?.top ?? 0;

    const nxRaw = e.clientX - desktopLeft - local.current.dx;
    const nyRaw = e.clientY - desktopTop - local.current.dy;

    // první clamp + snap
    const { nx, ny } = clampToDesktop(nxRaw, nyRaw);
    let sx = snapX(nx);
    let sy = snapY(ny);

    // hranice plochy pro BFS
    const deskRect = desktopRef.current?.getBoundingClientRect();
    const maxX = (deskRect?.width ?? window.innerWidth) - DESKTOP_MARGIN - ICON_SIZE;
    const maxY = (deskRect?.height ?? window.innerHeight) - (DESKTOP_MARGIN + TASKBAR_HEIGHT) - (ICON_SIZE + 30);
    const minX = DESKTOP_MARGIN;
    const minY = DESKTOP_MARGIN;
    const withinBounds = (xx:number, yy:number) =>
      xx >= minX && xx <= maxX && yy >= minY && yy <= maxY;

    const forbidden = [...blockedRects, ...occupiedRects];

    // Pokud koliduje, najdi nejbližší volné místo po mřížce
    const startHit = forbidden.some(b => intersects(iconRectAt(sx, sy), b));
    if (startHit) {
      const tried = new Set<string>();
      const key = (xx:number, yy:number) => `${xx},${yy}`;
      const q: Array<{x:number;y:number}> = [{ x: sx, y: sy }];
      let found: {x:number;y:number} | null = null;

      // pořadí směrů kvůli „přirozenému“ pocitu
      const dirs = [
        { dx: -GRID, dy: 0 },
        { dx:  GRID, dy: 0 },
        { dx: 0,     dy: -GRID },
        { dx: 0,     dy:  GRID },
      ];

      let steps = 0;
      const MAX_STEPS = 400;

      while (q.length && steps++ < MAX_STEPS) {
        const cur = q.shift()!;
        if (tried.has(key(cur.x, cur.y))) continue;
        tried.add(key(cur.x, cur.y));

        if (!withinBounds(cur.x, cur.y)) continue;

        const hit = forbidden.some(b => intersects(iconRectAt(cur.x, cur.y), b));
        if (!hit) { found = cur; break; }

        for (const d of dirs) {
          const nx = cur.x + d.dx;
          const ny = cur.y + d.dy;
          if (withinBounds(nx, ny) && !tried.has(key(nx, ny))) {
            q.push({ x: nx, y: ny });
          }
        }
      }

      if (found) { sx = found.x; sy = found.y; }
      const cl = clampToDesktop(sx, sy);
      sx = snapX(cl.nx);
      sy = snapY(cl.ny);
    }

    onMove(id, sx, sy);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    finishDrag(e);
  };

  const onPointerCancel = (e: React.PointerEvent) => {
    if (!local.current.dragging) return;
    e.preventDefault();
    const target = e.currentTarget as HTMLDivElement;
    try { target.releasePointerCapture(e.pointerId); } catch {}
    local.current.dragging = false;
  };

  return (
    <div
      role="button"
      onDoubleClick={() => { if (!('ontouchstart' in window)) onOpen(id); }} // PC: dvojklik
      onClick={() => { if ('ontouchstart' in window) onOpen(id); }}          // Mobile/Tablet: jednoklik
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onContextMenu={(e) => e.preventDefault()}
      className="absolute flex flex-col items-center cursor-default select-none group touch-none"
      style={{
        left: x,
        top: y,
        width: ICON_SIZE + 28,
        userSelect: 'none',
      }}
    >
      <div
        className="grid place-items-center rounded-[2px] group-hover:bg-white/10 select-none [-webkit-user-drag:none]"
        style={{ width: ICON_SIZE, height: ICON_SIZE, imageRendering: 'pixelated' }}
      >
        <img
          src={src}
          alt={label}
          className="select-none pointer-events-none [-webkit-user-drag:none]"
          style={{
            width: ICON_SIZE,
            height: ICON_SIZE,
            objectFit: 'contain',
            imageRendering: 'pixelated',
          }}
          draggable={false}
        />
      </div>
      <div className="mt-2 text-white text-center leading-tight drop-shadow-[1px_1px_0_rgba(0,0,0,0.9)] whitespace-pre-wrap break-words px-1 text-[13px] sm:text-[14px] md:text-[15px] select-none">
        {label}
      </div>
    </div>
  );
};

const DesktopSection: React.FC = () => {
  const { t, language } = useTranslation();
  const desktopRef = useRef<HTMLDivElement>(null);
  const clippyRef = useRef<HTMLDivElement>(null); // ← pro přesné měření Clippyho
  const bp = useBreakpoint();
  const [webviewUrl, setWebviewUrl] = useState<string | null>(null);
  const [webviewTitle, setWebviewTitle] = useState<string>('Browser');

  const openWebview = (url: string, title?: string) => {
    setWebviewUrl(url);
    if (title) setWebviewTitle(title);
    openApp('webview');
  };

  // Zákaz scrollu body během desktopu
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  // Barva horní lišty na mobilech
  useEffect(() => {
    const color = '#008080';
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    let created = false;
    if (!meta) { meta = document.createElement('meta'); meta.name = 'theme-color'; created = true; }
    const prevContent = meta.content;
    meta.content = color;
    if (created) document.head.appendChild(meta);
    return () => { if (created) meta?.remove(); else (meta as HTMLMetaElement).content = prevContent; };
  }, []);

  // Rozměry + taskbar rezerva
  const { ICON_SIZE, GRID, DESKTOP_MARGIN, TASKBAR_HEIGHT } = useMemo(() => {
    if (bp === 'mobile') return { ICON_SIZE: 80, GRID: 120, DESKTOP_MARGIN: 16, TASKBAR_HEIGHT: 64 };
    if (bp === 'tablet') return { ICON_SIZE: 96, GRID: 140, DESKTOP_MARGIN: 20, TASKBAR_HEIGHT: 48 };
    return { ICON_SIZE: 80, GRID: 120, DESKTOP_MARGIN: 24, TASKBAR_HEIGHT: 40 };
  }, [bp]);

  // Snap na grid
  const snapCoord = (n: number) =>
    DESKTOP_MARGIN + Math.round((n - DESKTOP_MARGIN) / GRID) * GRID;

  // Mobil: 4 sloupce
  const fourColXs = useMemo(() => {
    if (bp !== 'mobile') return null;
    const cw = window.innerWidth;
    const maxX = cw - DESKTOP_MARGIN - ICON_SIZE;
    const step = Math.max(1, Math.floor((maxX - DESKTOP_MARGIN) / 3));
    return [DESKTOP_MARGIN, DESKTOP_MARGIN + step, DESKTOP_MARGIN + 2 * step, DESKTOP_MARGIN + 3 * step];
  }, [bp, DESKTOP_MARGIN, ICON_SIZE]);

  const snapX = (n: number) => {
    if (fourColXs) {
      let best = fourColXs[0];
      let bestD = Math.abs(n - best);
      for (let i = 1; i < fourColXs.length; i++) {
        const d = Math.abs(n - fourColXs[i]);
        if (d < bestD) { bestD = d; best = fourColXs[i]; }
      }
      return best;
    }
    return snapCoord(n);
  };
  const snapY = (n: number) => snapCoord(n);

  // Tablet layout
  const layoutTabletColumns = () => {
    const ids: AppId[] = ['about', 'services', 'pricing', 'blog', 'contact', 'terms', 'gdpr', 'flappy'];
    const rect = desktopRef.current?.getBoundingClientRect();
    const height = rect?.height ?? window.innerHeight;

    const baseX = snapCoord(DESKTOP_MARGIN);
    const baseY = snapCoord(DESKTOP_MARGIN);

    const usableH = height - (DESKTOP_MARGIN + TASKBAR_HEIGHT) - baseY - (ICON_SIZE + 30);
    const rowsPerCol = Math.max(1, Math.floor(usableH / GRID) + 1);

    return ids.map((id, i) => {
      const col = Math.floor(i / rowsPerCol);
      const row = i % rowsPerCol;
      return { id, x: baseX + col * GRID, y: baseY + row * GRID };
    });
  };

  // Inicializace ikon
  const initialIcons = useMemo((): { id: AppId; x: number; y: number }[] => {
    if (bp === 'mobile' && fourColXs) {
      const baseY = snapCoord(DESKTOP_MARGIN);
      const ids: AppId[] = ['about', 'services', 'pricing', 'blog', 'contact', 'terms', 'gdpr', 'flappy'];
      return ids.map((id, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        return { id, x: fourColXs[col], y: baseY + row * GRID };
      });
    }
    if (bp === 'tablet') return layoutTabletColumns();

    const baseX = snapCoord(DESKTOP_MARGIN);
    const baseY = snapCoord(DESKTOP_MARGIN);
    return [
      { id: 'about',   x: baseX, y: baseY + 0 * GRID },
      { id: 'services',x: baseX, y: baseY + 1 * GRID },
      { id: 'pricing', x: baseX, y: baseY + 2 * GRID },
      { id: 'blog',    x: baseX, y: baseY + 3 * GRID },
      { id: 'contact', x: baseX, y: baseY + 4 * GRID },
      { id: 'terms',   x: baseX, y: baseY + 5 * GRID },
      { id: 'gdpr',    x: baseX, y: baseY + 6 * GRID },
      { id: 'flappy',  x: baseX, y: baseY + 7 * GRID },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bp, GRID, DESKTOP_MARGIN, TASKBAR_HEIGHT, ICON_SIZE, fourColXs]);

  const [iconPos, setIconPos] = useState<Record<AppId, { x: number; y: number }>>(() => {
    const obj = {} as Record<AppId, { x: number; y: number }>;
    initialIcons.forEach(i => { obj[i.id] = { x: i.x, y: i.y }; });
    return obj;
  });

  useEffect(() => {
    if (bp === 'tablet') {
      const applyLayout = () => {
        const laid = layoutTabletColumns();
        setIconPos(() => {
          const obj = {} as Record<AppId, { x: number; y: number }>;
          laid.forEach(i => { obj[i.id] = { x: i.x, y: i.y }; });
          return obj;
        });
      };
      applyLayout();
      window.addEventListener('resize', applyLayout);
      window.addEventListener('orientationchange', applyLayout as any);
      return () => {
        window.removeEventListener('resize', applyLayout);
        window.removeEventListener('orientationchange', applyLayout as any);
      };
    } else {
      setIconPos((cur) => {
        const next: Record<AppId, { x: number; y: number }> = { ...cur };
        (Object.keys(cur) as AppId[]).forEach((id) => {
          const { x, y } = cur[id];
          next[id] = { x: snapX(x), y: snapY(y) };
        });
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bp, GRID, DESKTOP_MARGIN, TASKBAR_HEIGHT, ICON_SIZE, fourColXs]);

  const [open, setOpen] = useState<DesktopAppId[]>([]);
  const [zOrder, setZOrder] = useState<DesktopAppId[]>([]);

  const titles: Record<DesktopAppId, string> = {
    about: t('desktop.icons.about') || t('nav.about') || 'About',
    services: t('desktop.icons.services') || t('nav.services') || 'Services',
    pricing: t('desktop.icons.pricing') || t('nav.pricing') || 'Pricing',
    blog: t('desktop.icons.blog') || t('nav.blog') || 'Blog',
    contact: t('desktop.icons.contact') || t('nav.contact') || 'Contact',
    terms: t('desktop.icons.terms') || t('nav.terms') || 'Terms',
    gdpr: t('desktop.icons.gdpr') || t('nav.gdpr') || 'GDPR',
    webview: webviewTitle || 'Browser',
    flappy: 'Flappy Bits',
  };

  const bringToFront = (id: DesktopAppId) =>
    setZOrder((cur) => [...cur.filter(x => x !== id), id]);

  const openApp = (id: DesktopAppId) => {
    setOpen((cur) => (cur.includes(id) ? cur : [...cur, id]));
    bringToFront(id);
  };
  const closeApp = (id: DesktopAppId) => {
    setOpen((cur) => cur.filter(x => x !== id));
    setZOrder((cur) => cur.filter(x => x !== id));
  };
  const maximizeApp = (id: DesktopAppId) => bringToFront(id);

  const handleMoveIcon = (id: AppId, nx: number, ny: number) => {
    setIconPos((cur) => ({ ...cur, [id]: { x: nx, y: ny } }));
  };

  // ===== Přesné měření Clippyho (blokovací obdélník) =====
  const [clippyRect, setClippyRect] = useState<{ x:number; y:number; w:number; h:number } | null>(null);

  useEffect(() => {
    const recompute = () => {
      const desk = desktopRef.current?.getBoundingClientRect();
      const clip = clippyRef.current?.getBoundingClientRect();
      if (!desk || !clip) {
        setClippyRect(null);
        return;
      }
      // pozice Clippyho v souřadnicích desktopu
      const x = Math.round(clip.left - desk.left);
      const y = Math.round(clip.top - desk.top);
      const w = Math.round(clip.width);
      const h = Math.round(clip.height);

      const PAD = 6; // bezpečná mezera, ať ikony "neškrtají" o okraj
      setClippyRect({ x: x - PAD, y: y - PAD, w: w + 2 * PAD, h: h + 2 * PAD });
    };

    // po mountu, po změně rozměrů/rotace, a i při změně jazyka (kvůli label výšce)
    const id = window.setTimeout(recompute, 0);
    recompute();
    window.addEventListener('resize', recompute);
    window.addEventListener('orientationchange', recompute as any);
    return () => {
      clearTimeout(id);
      window.removeEventListener('resize', recompute);
      window.removeEventListener('orientationchange', recompute as any);
    };
  }, [language]); // label pod Clippym se může lišit výškou

  // ⚠️ About: fullscreen přes aboutFullscreenContent. Ostatní jako okna.
  const renderContent = (id: DesktopAppId) => {
    switch (id) {
      case 'about':   return <AboutSection t={t} onExit={() => closeApp('about')} />;
      case 'services':return <ServicesSection t={t} embedded onOpenApp={(aid: AppId) => openApp(aid)} onOpenWeb={(url: string, title?: string) => openWebview(url, title)} />;
      case 'pricing': return <PricingSection t={t} />;
      case 'blog':    return <BlogSection t={t} />;
      case 'contact': return <ContactSection t={t} embedded />;
      case 'terms':   return <TermsSection t={t} />;
      case 'gdpr':    return <GDPRSection t={t} />;
      case 'flappy':  return <FlappySection t={t} onExit={() => closeApp('flappy')} />;
      case 'webview':
        return (
          <div className="w-full h-full bg-white">
            {webviewUrl ? (
              <iframe title={webviewTitle || 'Browser'} src={webviewUrl} className="w-full h-full" style={{ border: 0 }} />
            ) : (
              <div className="p-4 text-sm text-gray-700">No URL loaded.</div>
            )}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div
      ref={desktopRef}
      className="w-full min-h-[100svh] relative overflow-hidden touch-none select-none"
      style={{
        backgroundColor: '#008080',
        backgroundImage: `
          repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 4px),
          repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 4px)
        `,
        backgroundSize: '4px 4px',
        imageRendering: 'pixelated',
        userSelect: 'none',
        overscrollBehavior: 'none',
      }}
    >
      {/* Ikony */}
      {Object.entries(iconPos).map(([id, pos]) => {
        const appId = id as IconAppId;
        const src = iconMeta[appId].src;

        // všechny ostatní ikony → occupied rects
        const occupiedRects = (Object.entries(iconPos) as Array<[AppId, {x:number;y:number}]>)
          .filter(([otherId]) => otherId !== appId)
          .map(([, p]) => ({ x: snapX(p.x), y: snapY(p.y), w: ICON_SIZE, h: ICON_SIZE + 30 }));

        return (
          <DesktopIcon
            id={appId}
            key={appId} // stabilní key – žádný remount při změně jazyka/breakpointu
            label={titles[appId]}
            x={pos.x}
            y={pos.y}
            onOpen={(aid) => openApp(aid)}
            onMove={handleMoveIcon}
            src={src}
            desktopRef={desktopRef}
            ICON_SIZE={ICON_SIZE}
            DESKTOP_MARGIN={DESKTOP_MARGIN}
            TASKBAR_HEIGHT={TASKBAR_HEIGHT}
            snapX={snapX}
            snapY={snapY}
            blockedRects={clippyRect ? [clippyRect] : []}
            occupiedRects={occupiedRects}
            GRID={GRID}
          />
        );
      })}

      <DesktopWindowManager
        open={open as AppId[]}
        zOrder={zOrder as AppId[]}
        titles={titles as Record<AppId, string>}
        onFocus={(id) => bringToFront(id)}
        onClose={(id) => closeApp(id)}
        onMinimize={(_id) => {}}
        onMaximize={(id) => maximizeApp(id)}
        renderContent={(id) => renderContent(id as any)}
        aboutFullscreenContent={<AboutSection t={t} onExit={() => closeApp('about')} />}
      />

      {/* not clippy – nyní s refem pro přesné měření */}
      <ClippyAssistant
        centered
        rightOffset={DESKTOP_MARGIN}
        bottomOffset={TASKBAR_HEIGHT}
        containerRef={clippyRef}
      />
    </div>
  );
};

export default DesktopSection;
