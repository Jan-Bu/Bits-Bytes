// src/components/desktop/ClippyAssistant.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

const DEFAULT_TIPS = [
  'Psst... double click on an icon opens a window.',
  'You can drag icons on the desktop.',
  'Click me again for another tip.',
];

const MONOLOG = 'Už žádné tipy k ničemu. Jmenuji se Bits a jsem připravený vám pomoct s tvorbou vašeho nového webu!';
const PUNCH_TRIGGER_CLICK = 3;
const HIT_AT_MS = 800;
const FLY_AWAY_MS = 900;
const BITS_RENDER_WIDTH = 220;

function loadTips(t: (key: string) => string, max = 50): string[] {
  const tips: string[] = [];
  for (let i = 0; i < max; i++) {
    const k1 = `clippy.tips.${i}`;
    const k2 = `desktop.clippy.tips.${i}`;
    const val = t(k1) || t(k2);
    if (!val || val === k1 || val === k2) break;
    tips.push(val);
  }
  return tips;
}

function nextIndex(cur: number, len: number) {
  if (len <= 0) return 0;
  return (cur + 1) % len;
}

const StickyNote: React.FC<{
  text: string;
  rightOffset: number;
  centered?: boolean;
  bottomOffset?: number;
  onClose?: () => void;
}> = ({ text, rightOffset, centered = true, bottomOffset = 40, onClose }) => (
  <div
    className="absolute"
    style={{
      zIndex: 50,
      right: rightOffset + 180,
      ...(centered ? { top: '50%', transform: 'translateY(-50%)' } : { bottom: bottomOffset + 12 }),
    }}
  >
    <div
      style={{
        position: 'relative',
        background: '#FFEB7A',
        color: '#111',
        border: '1px solid #D4C45A',
        boxShadow: '2px 2px 0 #b3a64a, 4px 4px 0 rgba(0,0,0,0.15)',
        padding: '10px 12px',
        maxWidth: 280,
        fontSize: 14,
        lineHeight: 1.35,
      }}
    >
      {onClose && (
        <button
          type="button"
          aria-label="Zavřít"
          title="Zavřít"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 1,
            right: 1,
            width: 18,
            height: 18,
            lineHeight: 1,
            fontSize: 16,
            cursor: 'pointer',
          }}
        >
          ×
        </button>
      )}
      {text}
    </div>
    <div
      aria-hidden
      style={{
        width: 0,
        height: 0,
        borderTop: '8px solid transparent',
        borderBottom: '8px solid transparent',
        borderLeft: '10px solid #FFEB7A',
        position: 'absolute',
        right: -10,
        top: '50%',
        transform: 'translateY(-50%)',
        filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.12))',
      }}
    />
  </div>
);

type Props = {
  rightOffset: number;
  bottomOffset?: number;
  centered?: boolean;
  containerRef?: React.RefObject<HTMLDivElement>;
};

type Phase = 'tips' | 'charge' | 'hit' | 'bits';

const ClippyAssistant: React.FC<Props> = ({
  rightOffset,
  bottomOffset = 40,
  centered = true,
  containerRef,
}) => {
  const { t } = useTranslation();

  const label = t('clippy.label') || t('desktop.clippy.label') || 'definitely not clippy';
  const tips = useMemo(() => {
    const fromI18n = loadTips(t);
    return fromI18n.length ? fromI18n : DEFAULT_TIPS;
  }, [t]);

  const [showTip, setShowTip] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);
  const [tipClicks, setTipClicks] = useState(0);
  const [phase, setPhase] = useState<Phase>('tips');
  const [chargeActive, setChargeActive] = useState(false);
  const timeouts = useRef<number[]>([]);

  useEffect(() => () => {
    timeouts.current.forEach((id) => clearTimeout(id));
    timeouts.current = [];
  }, []);

  useEffect(() => {
    if (tips.length <= 0) return;
    setTipIndex((i) => i % tips.length);
  }, [tips.length]);

  const clearTimers = () => {
    timeouts.current.forEach((id) => clearTimeout(id));
    timeouts.current = [];
  };

  const startPunchSequence = () => {
    clearTimers();
    setShowTip(false);
    setPhase('charge');
    setChargeActive(false);

    const t0 = window.setTimeout(() => setChargeActive(true), 20);
    const t1 = window.setTimeout(() => setPhase('hit'), HIT_AT_MS);
    const t2 = window.setTimeout(() => setPhase('bits'), HIT_AT_MS + FLY_AWAY_MS);
    timeouts.current.push(t0, t1, t2);
  };

  const advanceTip = () => {
    if (phase !== 'tips') return;

    const nextClicks = tipClicks + 1;
    setTipClicks(nextClicks);

    if (nextClicks >= PUNCH_TRIGGER_CLICK) {
      startPunchSequence();
      return;
    }

    if (!showTip) {
      setShowTip(true);
      setTipIndex(0);
      return;
    }
    setTipIndex((i) => nextIndex(i, tips.length));
  };

  const closeTip = () => setShowTip(false);

  const SIZE = 160;
  const SVG = 140;
  const NAME_FONT = 14;

  const showClippy = phase === 'tips' || phase === 'charge' || phase === 'hit';
  const clippyFlying = phase === 'hit';
  const showChargingBits = phase === 'charge';
  const showFinalBits = phase === 'bits';
  const isInteractive = phase === 'tips';

  const noteText = phase === 'bits' ? MONOLOG : (tips[tipIndex] ?? DEFAULT_TIPS[0]);
  const showNote = phase === 'bits' || (phase === 'tips' && showTip && tips.length > 0);

  return (
    <>
      {showChargingBits && (
        <div
          className="absolute pointer-events-none select-none"
          style={{
            zIndex: 60,
            left: chargeActive ? `calc(100% - ${rightOffset + 270}px)` : 'calc(62% - 110px)',
            ...(centered ? { top: '50%', transform: 'translateY(-50%)' } : { bottom: bottomOffset + 12 }),
            transition: `left ${HIT_AT_MS}ms linear`,
            imageRendering: 'pixelated',
          }}
        >
          <img
            src="/bits_punching.gif"
            alt="Bits punching"
            style={{ width: BITS_RENDER_WIDTH, height: 'auto', imageRendering: 'pixelated' }}
            draggable={false}
          />
        </div>
      )}

      <div
        ref={containerRef}
        className="absolute select-none"
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : -1}
        onClick={isInteractive ? advanceTip : undefined}
        onKeyDown={isInteractive ? (e) => (e.key === 'Enter' || e.key === ' ') && advanceTip() : undefined}
        style={{
          right: rightOffset,
          ...(centered ? { top: '50%', transform: 'translateY(-50%)' } : { bottom: bottomOffset + 12 }),
          width: showFinalBits ? BITS_RENDER_WIDTH : SIZE,
          textAlign: 'center',
          imageRendering: 'pixelated',
          pointerEvents: isInteractive ? 'auto' : 'none',
          cursor: isInteractive ? 'pointer' : 'default',
          zIndex: 49,
        }}
        title={showFinalBits ? 'Bits' : label}
        aria-label={showFinalBits ? 'Bits' : label}
      >
        {showClippy && (
          <div
            style={{
              transform: clippyFlying ? 'translate(420px,-180px) rotate(920deg)' : 'translate(0,0) rotate(-2deg)',
              opacity: clippyFlying ? 0 : 1,
              transformOrigin: 'center',
              transition: clippyFlying
                ? `transform ${FLY_AWAY_MS}ms cubic-bezier(0.15, 0.75, 0.25, 1), opacity ${FLY_AWAY_MS}ms linear`
                : undefined,
              filter: 'drop-shadow(14px -14px 10px rgba(0,0,0,0.25))',
            }}
          >
            <div className="grid place-items-center relative">
              <svg width={SVG} height={SVG} viewBox="0 0 76 76" style={{ transform: 'translateZ(0)' }}>
                <defs>
                  <linearGradient id="dncMetal" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#f3f4f6" />
                    <stop offset="1" stopColor="#9ca3af" />
                  </linearGradient>
                </defs>
                <path
                  d="M20 34c0-10 8-18 18-18s18 8 18 18v18c0 6-5 11-11 11s-11-5-11-11V28a7 7 0 1 1 14 0v22"
                  fill="none"
                  stroke="url(#dncMetal)"
                  strokeWidth="7.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="34" cy="26" r="3.2" fill="#111827" />
                <circle cx="46" cy="26" r="3.2" fill="#111827" />
              </svg>
            </div>
            <div
              className="mt-2 text-white leading-tight drop-shadow-[1px_1px_0_rgba(0,0,0,0.9)]"
              style={{ fontSize: NAME_FONT }}
            >
              {label}
            </div>
          </div>
        )}

        {showFinalBits && (
          <div style={{ filter: 'drop-shadow(10px -10px 8px rgba(0,0,0,0.25))' }}>
            <img
              src="/bits_static_1.png"
              alt="Bits"
              style={{
                width: BITS_RENDER_WIDTH,
                height: 'auto',
                margin: '0 auto',
                imageRendering: 'pixelated',
              }}
              draggable={false}
            />
          </div>
        )}
      </div>

      {showNote && (
        <StickyNote
          text={noteText}
          rightOffset={rightOffset}
          centered={centered}
          bottomOffset={bottomOffset}
          onClose={phase === 'tips' ? closeTip : undefined}
        />
      )}
    </>
  );
};

export default ClippyAssistant;
