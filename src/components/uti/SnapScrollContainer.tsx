// src/components/ui/SnapScrollContainer.tsx
import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useCallback,
  createContext,
  useMemo,
  useState,
} from 'react';

export type SnapScrollHandle = {
  jumpTo: (id: string) => void;
  scrollToIndex: (index: number) => void;
  getCurrentIndex: () => number;
};

export type SnapScrollContainerProps = {
  children: React.ReactNode;
  sectionSelector?: string;        // default: 'section[id]'
  durationMs?: number;             // default: 800
  swipePx?: number;                // default: 50
  swipeVel?: number;               // default: 0.3
  easing?: (t: number) => number;  // default: easeOutCubic
  onSectionChange?: (index: number, el: HTMLElement) => void;
  className?: string;
  style?: React.CSSProperties;
  manageVhVar?: boolean;           // default: true
  enabled?: boolean;               // default: true
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// === Context pro čtení progressu sekcí ===
type SnapScrollContextType = {
  getSectionProgress: (sectionId: string) => number;
  isDesktop: boolean;
};

export const SnapScrollContext = createContext<SnapScrollContextType | null>(null);

export const useSectionProgress = (sectionId: string) => {
  const ctx = React.useContext(SnapScrollContext);
  return ctx?.getSectionProgress(sectionId) ?? 0;
};

export const useIsDesktop = () => {
  const ctx = React.useContext(SnapScrollContext);
  return ctx?.isDesktop ?? false;
};

const SnapScrollContainer = forwardRef<SnapScrollHandle, SnapScrollContainerProps>(
  (
    {
      children,
      sectionSelector = 'section[id]',
      durationMs = 800,
      swipePx = 50,
      swipeVel = 0.3,
      easing = easeOutCubic,
      onSectionChange,
      className,
      style,
      manageVhVar = true,
      enabled = true,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isAnimatingRef = useRef(false);
    
    // Responsive state - snap pouze na desktop (≥1024px)
    const [isDesktop, setIsDesktop] = useState(false);

    // Touch tracking
    const touchStartY = useRef(0);
    const touchLastY = useRef(0);
    const touchStartTime = useRef(0);

    // Geometry a progress tracking
    const sectionsRef = useRef<HTMLElement[]>([]);
    const rangesRef = useRef<Record<string, { start: number; end: number }>>({});
    const progressRef = useRef<Record<string, number>>({});

    // === Konfigurace pro about-mission sekci ===
    const MISSION_ID = 'about-mission';
    const TOP_BUF = 0.2;         // buffer na začátku sekce (20 %)
    const BOT_BUF = 0.2;         // buffer na konci sekce (20 %)
    const EDGE_EPS = 0.001;      // epsilon pro detekci kraje

    // === Stav pro mission sekci (pouze desktop) ===
    const missionEdgeAtRef = useRef<'start' | 'end' | null>(null);
    const missionAllowRef = useRef<boolean>(false);

    const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

    // === Detekce breakpointu ===
    useEffect(() => {
      const checkBreakpoint = () => {
        setIsDesktop(window.innerWidth >= 1024);
      };

      checkBreakpoint();
      window.addEventListener('resize', checkBreakpoint);
      window.addEventListener('orientationchange', checkBreakpoint);

      return () => {
        window.removeEventListener('resize', checkBreakpoint);
        window.removeEventListener('orientationchange', checkBreakpoint);
      };
    }, []);

    const getSections = useCallback((): HTMLElement[] => {
      const cont = containerRef.current;
      if (!cont) return [];
      return Array.from(cont.querySelectorAll(sectionSelector)) as HTMLElement[];
    }, [sectionSelector]);

    // === Výpočet rozsahů sekcí ===
    const computeRanges = useCallback((): void => {
      const cont = containerRef.current;
      if (!cont) return;
      const contRect = cont.getBoundingClientRect();

      const list = getSections();
      sectionsRef.current = list;
      const ranges: Record<string, { start: number; end: number }> = {};

      list.forEach((el) => {
        const id = el.id;
        const r = el.getBoundingClientRect();
        const top = r.top - contRect.top + cont.scrollTop;
        const height = el.offsetHeight;
        const start = top;
        // Konec = začátek + výška - výška viewportu (aby sekce mohla být plně viditelná)
        const end = Math.max(start + 1, top + height - cont.clientHeight);
        ranges[id] = { start, end };
      });

      rangesRef.current = ranges;
    }, [getSections]);

    // === Přepočet progressu všech sekcí ===
    const recomputeProgress = useCallback(() => {
      const cont = containerRef.current;
      if (!cont) return;
      const ranges = rangesRef.current;
      const progress: Record<string, number> = {};

      Object.keys(ranges).forEach((id) => {
        const { start, end } = ranges[id];
        const raw = (cont.scrollTop - start) / Math.max(1, end - start);
        progress[id] = clamp01(raw);
      });

      progressRef.current = progress;
    }, []);

    // === Zjištění aktuální sekce (podle středu viewportu) ===
    const currentSectionIndex = useCallback((cont: HTMLElement, list: HTMLElement[]) => {
      const mid = cont.scrollTop + cont.clientHeight / 2;
      let bestIdx = 0;
      let bestDist = Number.POSITIVE_INFINITY;

      list.forEach((section, i) => {
        const rect = section.getBoundingClientRect();
        const top = rect.top - cont.getBoundingClientRect().top + cont.scrollTop;
        const center = top + rect.height / 2;
        const distance = Math.abs(center - mid);

        if (distance < bestDist) {
          bestDist = distance;
          bestIdx = i;
        }
      });

      return bestIdx;
    }, []);

    // === Výpočet cílové pozice pro centrování sekce ===
    const centerTargetFor = useCallback((el: HTMLElement, cont: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      const contRect = cont.getBoundingClientRect();
      const top = rect.top - contRect.top + cont.scrollTop;
      const targetY = top + rect.height / 2 - cont.clientHeight / 2;
      return Math.max(0, targetY);
    }, []);

    // === Smooth scroll s respektováním prefers-reduced-motion ===
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const effectiveDuration = prefersReduced ? 0 : durationMs;

    const smoothScrollTo = useCallback(
      (cont: HTMLElement, targetY: number) => {
        // Na mobilu snap scroll nepoužívej
        if (!isDesktop) {
          cont.scrollTo({ top: targetY, behavior: 'smooth' });
          return;
        }

        const startY = cont.scrollTop;
        const delta = targetY - startY;

        if (effectiveDuration <= 0) {
          cont.scrollTop = targetY;
          const list = sectionsRef.current;
          if (list.length) {
            const idx = currentSectionIndex(cont, list);
            onSectionChange?.(idx, list[idx]);
          }
          return;
        }

        const start = performance.now();
        isAnimatingRef.current = true;

        const step = (now: number) => {
          const t = Math.min(1, (now - start) / effectiveDuration);
          cont.scrollTop = startY + delta * easing(t);

          if (t < 1) {
            requestAnimationFrame(step);
          } else {
            isAnimatingRef.current = false;
            const list = sectionsRef.current;
            if (list.length) {
              const idx = currentSectionIndex(cont, list);
              onSectionChange?.(idx, list[idx]);
            }
          }
        };
        requestAnimationFrame(step);
      },
      [effectiveDuration, easing, onSectionChange, currentSectionIndex, isDesktop]
    );

    // === Získání progressu sekce s aplikací bufferů pro mission sekci ===
    const getSectionProgress = useCallback((sectionId: string) => {
      const rawProgress = progressRef.current[sectionId] ?? 0;
      const progress =
        rawProgress <= EDGE_EPS ? 0 : rawProgress >= 1 - EDGE_EPS ? 1 : rawProgress;

      // Mission sekce má speciální buffer handling pouze na desktopu
      if (sectionId === MISSION_ID && isDesktop) {
        const activeRange = 1 - (TOP_BUF + BOT_BUF);
        if (activeRange <= 0.01) return progress;

        if (progress <= TOP_BUF) return 0;
        if (progress >= 1 - BOT_BUF) return 1;

        return (progress - TOP_BUF) / activeRange;
      }

      return progress;
    }, [isDesktop]);

    // === Aktualizace stavu hrany mission sekce (pouze desktop) ===
    const updateMissionEdge = useCallback(() => {
      if (!isDesktop) return;
      
      const progress = getSectionProgress(MISSION_ID);
      const now = performance.now();

      if (progress <= EDGE_EPS) {
        if (missionEdgeAtRef.current !== 'start') {
          missionEdgeAtRef.current = 'start';
          missionAllowRef.current = false;
        }
      } else if (progress >= 1 - EDGE_EPS) {
        if (missionEdgeAtRef.current !== 'end') {
          missionEdgeAtRef.current = 'end';
        }
      } else {
        missionEdgeAtRef.current = null;
      }
    }, [getSectionProgress, isDesktop]);

    // === Logika blokování snapu pro mission sekci (pouze desktop) ===
    const missionBlocksSnap = useCallback((idx: number, direction: 1 | -1) => {
      if (!isDesktop) return false;
      
      const list = sectionsRef.current;
      const sec = list[idx];
      if (!sec || sec.id !== MISSION_ID) return false;

      const progress = getSectionProgress(MISSION_ID);

      // Uprostřed — vždy blokuj, dokud nepřijde "allow" (po animaci A→B)
      if (progress > EDGE_EPS && progress < 1 - EDGE_EPS) {
        return !missionAllowRef.current;
      }

      // Pokud jsme přesně na kraji a allow ještě není, blokuj také
      if (!missionAllowRef.current) {
        return true;
      }

      // Allow je true → snap povol jen správným směrem:
      if (direction === 1 && progress >= 1 - EDGE_EPS) return false; // dolů z konce
      if (direction === -1 && progress <= EDGE_EPS) return false;    // nahoru ze startu

      // Špatný směr — blokuj
      return true;
    }, [getSectionProgress, isDesktop]);

    // === Kontext ===
    const contextValue = useMemo<SnapScrollContextType>(
      () => ({ getSectionProgress, isDesktop }),
      [getSectionProgress, isDesktop]
    );

    // === TOUCH (pouze desktop snap) ===
    const onTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
      if (!enabled || !isDesktop) return;
      touchStartY.current = e.touches[0].clientY;
      touchLastY.current = touchStartY.current;
      touchStartTime.current = performance.now();
    }, [enabled, isDesktop]);

    const onTouchMove = useCallback((_e: React.TouchEvent<HTMLDivElement>) => {
      // nech nativní scroll běžet pro "progress"
    }, []);

    const onTouchEnd = useCallback((_e: React.TouchEvent<HTMLDivElement>) => {
      if (!enabled || !isDesktop) return;
      const cont = containerRef.current;
      if (!cont || isAnimatingRef.current) return;

      updateMissionEdge();

      const list = sectionsRef.current;
      if (!list.length) return;

      const deltaY = touchStartY.current - touchLastY.current; // >0 = swipe nahoru
      const deltaTime = Math.max(1, performance.now() - touchStartTime.current);
      const velocity = Math.abs(deltaY) / deltaTime;

      const idx = currentSectionIndex(cont, list);
      const direction: 1 | -1 = deltaY > 0 ? 1 : -1;

      if (missionBlocksSnap(idx, direction)) {
        return; // zůstaň v sekci, ať probíhá "progress/animace"
      }

      let targetIdx = idx;
      if (Math.abs(deltaY) > swipePx || velocity > swipeVel) {
        targetIdx = Math.max(0, Math.min(list.length - 1, idx + direction));
      }

      const targetY = centerTargetFor(list[targetIdx], cont);
      smoothScrollTo(cont, targetY);
    }, [enabled, isDesktop, updateMissionEdge, missionBlocksSnap, swipePx, swipeVel, currentSectionIndex, centerTargetFor, smoothScrollTo]);

    // === Imperative handle ===
    useImperativeHandle(
      ref,
      () => ({
        jumpTo: (id: string) => {
          const cont = containerRef.current;
          if (!cont) return;
          const target = cont.querySelector<HTMLElement>(`${sectionSelector}#${CSS.escape(id)}`);
          if (!target) return;
          smoothScrollTo(cont, centerTargetFor(target, cont));
        },
        scrollToIndex: (index: number) => {
          const cont = containerRef.current;
          if (!cont) return;
          const list = sectionsRef.current;
          if (!list.length) return;
          const clampedIndex = Math.max(0, Math.min(list.length - 1, index));
          smoothScrollTo(cont, centerTargetFor(list[clampedIndex], cont));
        },
        getCurrentIndex: () => {
          const cont = containerRef.current;
          if (!cont) return 0;
          const list = sectionsRef.current;
          if (!list.length) return 0;
          return currentSectionIndex(cont, list);
        },
      }),
      [sectionSelector, smoothScrollTo, centerTargetFor, currentSectionIndex]
    );

    // === CSS custom property pro viewport height ===
    useEffect(() => {
      if (!manageVhVar) return;

      const setVhVariable = () => {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
      };

      setVhVariable();
      window.addEventListener('resize', setVhVariable);
      window.addEventListener('orientationchange', setVhVariable);

      return () => {
        window.removeEventListener('resize', setVhVariable);
        window.removeEventListener('orientationchange', setVhVariable);
      };
    }, [manageVhVar]);

    // === Inicializace a reflow listenery ===
    useEffect(() => {
      const cont = containerRef.current;
      if (!cont) return;

      const recalc = () => {
        computeRanges();
        recomputeProgress();
        updateMissionEdge();
      };

      // Init + delayed reflow (obsah se může načítat)
      recalc();
      const timeoutId = window.setTimeout(recalc, 60);

      // Scroll → přepočítej progress (pasivně)
      const onScroll = () => {
        recomputeProgress();
        updateMissionEdge();
      };
      cont.addEventListener('scroll', onScroll, { passive: true });

      // ResizeObserver: container + sekce
      const ro = new ResizeObserver(recalc);
      ro.observe(cont);
      sectionsRef.current.forEach((s) => ro.observe(s));

      // MutationObserver: strukturální změny uvnitř
      const mo = new MutationObserver(recalc);
      mo.observe(cont, { childList: true, subtree: true });

      // Reflow i při resize/orientation
      window.addEventListener('resize', recalc);
      window.addEventListener('orientationchange', recalc);

      return () => {
        window.clearTimeout(timeoutId);
        cont.removeEventListener('scroll', onScroll);
        ro.disconnect();
        mo.disconnect();
        window.removeEventListener('resize', recalc);
        window.removeEventListener('orientationchange', recalc);
      };
    }, [computeRanges, recomputeProgress, updateMissionEdge]);

    // === Mission "allow snap": custom event z vnitřní sekce ===
    useEffect(() => {
      const cont = containerRef.current;
      if (!cont) return;

      const handler = (e: Event) => {
        if (isDesktop) {
          // Na desktopu standardní logika
          missionAllowRef.current = true;
        } else {
          // Na mobilu okamžité povolení (už je řízeno z MobileMissionVision)
          // nic speciálního neděláme, protože na mobilu není snap
        }
      };

      cont.addEventListener('mission:allow-snap', handler as EventListener);
      return () => cont.removeEventListener('mission:allow-snap', handler as EventListener);
    }, [isDesktop]);

    // === WHEEL listener (pouze desktop snap) ===
    useEffect(() => {
      if (!enabled || !isDesktop) return;
      const cont = containerRef.current;
      if (!cont) return;

      const wheelHandler = (e: WheelEvent) => {
        if (isAnimatingRef.current) {
          e.preventDefault();
          return;
        }

        const list = sectionsRef.current;
        if (!list.length) return;

        const direction: 1 | -1 = e.deltaY > 0 ? 1 : -1;
        const idx = currentSectionIndex(cont, list);

        // zaktualizuj hrany sekce
        updateMissionEdge();

        if (missionBlocksSnap(idx, direction)) {
          // nech nativní scroll běžet pro "progress" uprostřed sekce
          // ale pokud jsme přesně na kraji a allow ještě není, zabraň odskoku
          const secId = list[idx].id;
          if (secId === MISSION_ID) {
            const p = getSectionProgress(MISSION_ID);
            if ((p <= EDGE_EPS || p >= 1 - EDGE_EPS) && !missionAllowRef.current) {
              e.preventDefault();
            }
          }
          return;
        }

        // Snap povolen — střed nejbližší sekce v daném směru
        const nextIdx = Math.max(0, Math.min(list.length - 1, idx + direction));
        if (nextIdx === idx) return;

        e.preventDefault();

        const targetY = centerTargetFor(list[nextIdx], cont);
        smoothScrollTo(cont, targetY);
      };

      const ac = new AbortController();
      cont.addEventListener('wheel', wheelHandler, { passive: false, signal: ac.signal });
      return () => ac.abort();
    }, [
      enabled,
      isDesktop,
      currentSectionIndex,
      updateMissionEdge,
      missionBlocksSnap,
      getSectionProgress,
      centerTargetFor,
      smoothScrollTo,
    ]);

    // === scrollend rozhodování (po inerci) + fallback debounce (pouze desktop) ===
    useEffect(() => {
      if (!isDesktop) return;
      
      const cont = containerRef.current;
      if (!cont) return;

      let t: number | null = null;

      const decide = () => {
        if (!enabled || isAnimatingRef.current) return;
        const list = sectionsRef.current;
        if (!list.length) return;

        // Pokud speciální sekce stále blokuje snap, nedělej nic
        const idx = currentSectionIndex(cont, list);
        if (missionBlocksSnap(idx, 1) || missionBlocksSnap(idx, -1)) return;

        const targetY = centerTargetFor(list[idx], cont);
        smoothScrollTo(cont, targetY);
      };

      const onScrollEndFallback = () => {
        if (t) window.clearTimeout(t);
        t = window.setTimeout(decide, 120); // debounce fallback
      };

      const supportsScrollEnd = 'onscrollend' in window;
      if (supportsScrollEnd) {
        cont.addEventListener('scrollend', decide as EventListener);
      } else {
        cont.addEventListener('scroll', onScrollEndFallback, { passive: true });
      }

      return () => {
        if (supportsScrollEnd) cont.removeEventListener('scrollend', decide as EventListener);
        else cont.removeEventListener('scroll', onScrollEndFallback);
        if (t) window.clearTimeout(t);
      };
    }, [enabled, isDesktop, missionBlocksSnap, currentSectionIndex, centerTargetFor, smoothScrollTo]);

    return (
      <SnapScrollContext.Provider value={contextValue}>
        <div
          ref={containerRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          tabIndex={0}
          className={className}
          style={{
            ...style,
            overscrollBehavior: 'contain',
            touchAction: 'pan-y',
            scrollbarGutter: 'stable',
          }}
        >
          {children}
        </div>
      </SnapScrollContext.Provider>
    );
  }
);

SnapScrollContainer.displayName = 'SnapScrollContainer';
export default SnapScrollContainer;