import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const stages = [
  { text: '💭 Thinking...',  color: '#85fbff' },
  { text: '✏️ Designing...', color: '#A54EFF' },
  { text: '🚀 Delivering!',  color: '#FFED29' },
  { text: '✅ Done.',        color: '#00FF99' },
];

type IdeaToRealityBarProps = {
  className?: string;
};

export const IdeaToRealityBar: React.FC<IdeaToRealityBarProps> = ({ className = '' }) => {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStageIndex((p) => (p + 1) % stages.length);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center font-jersey
                  text-[clamp(1rem,3.2vw,1.25rem)]
                  pt-[clamp(6px,1.8vw,12px)]
                  pb-[clamp(16px,1.8vw,12px)]
                  px-[clamp(24px,1.5vw,28px)]
                  gap-[clamp(4px,1vw,8px)] ${className}`}
    >
      {/* Fáze */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stages[stageIndex].text}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="text-center"
          style={{ color: stages[stageIndex].color }}
        >
          {stages[stageIndex].text}
        </motion.div>
      </AnimatePresence>

      {/* Track: padding na celé šířce (platí pro šedé pozadí i barevnou výplň) */}
      <div
        className="
          w-full
          h-[clamp(5px,1.5vw,12px)] min-h-[3px]
          bg-white/20 rounded-full overflow-hidden
          
        "
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#A54EFF] to-[#FFED29]"
          initial={{ width: 0 }}
          animate={{ width: `${((stageIndex + 1) / stages.length) * 100}%` }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
          style={{ willChange: 'width' }}
        />
      </div>
    </div>
  );
};
