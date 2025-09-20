// src/components/desktop/ClippyAssistant.tsx
import React, { useMemo, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

/** Záložní tipy, pokud v translations nic není */
const DEFAULT_TIPS = [
  'Psst… dvojklik na ikonu otevře okno.',
  'Ikony můžeš přetahovat po ploše.',
  'Klikni na mě znovu pro další tip.',
];

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

/** Vrátí další index v rozsahu 0..len-1 (cyklicky). */
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
      right: rightOffset + 180, // kousek vlevo od Clippyho
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
        maxWidth: 260,
        fontSize: 14,
        lineHeight: 1.35,
      }}
    >
      {/* Křížek pro zavření */}
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
  /** obvykle DESKTOP_MARGIN */
  rightOffset: number;
  /** ignoruje se, když centered = true (kvůli zpětné kompatibilitě) */
  bottomOffset?: number;
  /** vertikální centrování na střed */
  centered?: boolean;
  /** ref na vnější wrapper pro přesné měření pozice/velikosti z DesktopSection */
  containerRef?: React.RefObject<HTMLDivElement>;
};

const ClippyAssistant: React.FC<Props> = ({
  rightOffset,
  bottomOffset = 40,
  centered = true,
  containerRef, // ← pro měření zvenku
}) => {
  const { t, language } = useTranslation();

  // Label z translations (fallback na pevný text)
  const label = t('clippy.label') || t('desktop.clippy.label') || 'definitely not clippy';

  // Tipy z translations s fallbackem
  const tips = useMemo(() => {
    const fromI18n = loadTips(t);
    return fromI18n.length ? fromI18n : DEFAULT_TIPS;
  }, [t, language]);

  // Výchozí stav sticky poznámky otevřený
  const [showTip, setShowTip] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);

  const SIZE = 160;
  const SVG = 140;
  const NAME_FONT = 14;

  const advanceTip = () => {
    if (!showTip) {
      setShowTip(true);
      setTipIndex(0);
    } else {
      setTipIndex((i) => nextIndex(i, tips.length));
    }
  };

  const closeTip = () => setShowTip(false);

  return (
    <>
      {/* Clippy */}
      <div
        ref={containerRef} // ← důležité pro getBoundingClientRect v DesktopSection
        className="absolute select-none"
        role="button"
        tabIndex={0}
        onClick={advanceTip}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && advanceTip()}
        style={{
          right: rightOffset,
          ...(centered ? { top: '50%', transform: 'translateY(-50%)' } : { bottom: bottomOffset + 12 }),
          width: SIZE,
          textAlign: 'center',
          imageRendering: 'pixelated',
          pointerEvents: 'auto',
          cursor: 'pointer',
          transformOrigin: 'center',
          rotate: '-2deg',
          filter: `drop-shadow(14px -14px 10px rgba(0,0,0,0.25))`,
          zIndex: 49, // pod sticky, nad pozadím
        }}
        title={label}
        aria-label={label}
      >
        {/* sponka */}
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

        {/* jmenovka */}
        <div
          className="mt-2 text-white leading-tight drop-shadow-[1px_1px_0_rgba(0,0,0,0.9)]"
          style={{ fontSize: NAME_FONT }}
        >
          {label}
        </div>
      </div>

      {/* žlutá poznámka */}
      {showTip && tips.length > 0 && (
        <StickyNote
          text={tips[tipIndex]}
          rightOffset={rightOffset}
          centered={centered}
          bottomOffset={bottomOffset}
          onClose={closeTip}
        />
      )}
    </>
  );
};

export default ClippyAssistant;
