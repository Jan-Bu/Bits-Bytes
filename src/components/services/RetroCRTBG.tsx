import React from 'react';

/**
 * 90s CRT background (CSS-only):
 * - Dark base gradient
 * - Subtle scanlines (repeating-linear-gradient)
 * - Phosphor glow (radial gradient)
 * - Soft vignette at edges
 * All layers are fixed behind content.
 */
const RetroCRTBG: React.FC<{
  intensity?: number;   // scanline opacity (0–1), default 0.08
  glow?: number;        // center glow opacity (0–1), default 0.10
  vignette?: number;    // vignette opacity (0–1), default 0.30
}> = ({ intensity = 0.08, glow = 0.10, vignette = 0.30 }) => {
  return (
    <div className="fixed inset-0 -z-20 pointer-events-none">
      {/* Base dark gradient */}
      <div className="absolute inset-0"
           style={{
             background: 'radial-gradient(1200px 800px at 50% 40%, rgba(22,22,28,0.9), rgba(5,5,8,1))'
           }}
      />
      {/* Scanlines */}
      <div className="absolute inset-0 mix-blend-screen"
           style={{
             backgroundImage: `repeating-linear-gradient(
               to bottom,
               rgba(120, 255, 200, ${intensity}),
               rgba(120, 255, 200, ${intensity}) 1px,
               rgba(0,0,0,0) 2px,
               rgba(0,0,0,0) 3px
             )`,
             opacity: 1
           }}
      />
      {/* Very subtle center phosphor glow */}
      <div className="absolute inset-0"
           style={{
             background: `radial-gradient(600px 400px at 50% 45%, rgba(120, 255, 200, ${glow}), rgba(0,0,0,0) 60%)`
           }}
      />
      {/* Vignette */}
      <div className="absolute inset-0"
           style={{
             background: 'radial-gradient(100% 100% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,1) 100%)',
             opacity: vignette
           }}
      />
      {/* Tiny static noise (dither-ish) */}
      <div className="absolute inset-0 opacity-[0.04]"
           style={{
             backgroundImage: `url("data:image/svg+xml;utf8,
               <svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>
                 <filter id='n'>
                   <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
                   <feComponentTransfer>
                     <feFuncA type='table' tableValues='0 0 0.4 0'/>
                   </feComponentTransfer>
                 </filter>
                 <rect width='100%' height='100%' filter='url(%23n)'/>
               </svg>")`,
             backgroundRepeat: 'repeat'
           }}
      />
    </div>
  );
};

export default RetroCRTBG;
