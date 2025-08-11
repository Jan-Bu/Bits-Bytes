import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const stages = [
  { text: '💭 Thinking...', color: '#85fbff' },
  { text: '✏️ Designing...', color: '#A54EFF' },
  { text: '🚀 Delivering!', color: '#FFED29' },
  { text: '✅ Done.', color: '#00FF99' },
];

export const IdeaToRealityBar: React.FC = () => {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % stages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black rounded-3xl border border-white/10 p-4 font-jersey text-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={stages[stageIndex].text}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="mb-4 text-center"
          style={{ color: stages[stageIndex].color }}
        >
          {stages[stageIndex].text}
        </motion.div>
      </AnimatePresence>

      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#A54EFF] to-[#FFED29]"
          animate={{ width: `${((stageIndex + 1) / stages.length) * 100}%` }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
};
