import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { Volume2, ArrowLeft, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { playSound } from './lib/SfxEngine';
import { speakLearningPhrase, speakBlend } from './lib/AudioEngine';
import ParticleOverlay from './components/PixelCanvas';
import { PHASES, PhonicsItem, Phase } from './data/phases';

// --- Stage colors (pastel) ---
const COLORS = [
  '#F0FDF4', // Foundation — mint
  '#EFF6FF', // CVC — sky
  '#FAF5FF', // Patterns — lavender
  '#FEF2F2', // Rules — warm red
];

// --- Parse audioText to extract the anchor word ---
function extractWord(audioText: string): string {
  // "a for apple" → "apple", "c-a-t, cat" → "cat"
  const forMatch = audioText.match(/for\s+(.+)/i);
  if (forMatch) return forMatch[1].trim();
  const commaMatch = audioText.match(/,\s*(.+)/);
  if (commaMatch) return commaMatch[1].trim();
  return audioText;
}

// ─── PhonicsCard ───
interface PhonicsCardProps {
  item: PhonicsItem;
  isTop: boolean;
  onSwipe: (mastered: boolean) => void;
  isError: boolean;
  showHint: boolean;
}

const PhonicsCard: React.FC<PhonicsCardProps> = ({ item, isTop, onSwipe, isError, showHint }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);
  const leftIndicatorOpacity = useTransform(x, [-100, -20], [0.8, 0]);
  const rightIndicatorOpacity = useTransform(x, [20, 100], [0, 0.8]);

  const handleDragEnd = (_: any, info: any) => {
    if (!isTop) return;
    const threshold = 80;
    if (info.offset.x > threshold) {
      onSwipe(true);
    } else if (info.offset.x < -threshold) {
      onSwipe(false);
    } else {
      x.set(0);
    }
  };

  const handleSpeak = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    const word = extractWord(item.audioText);
    speakLearningPhrase(item.display, item.ipa, word);
  }, [item]);

  return (
    <>
      <motion.div
        style={isTop ? { x, rotate, opacity, zIndex: 10 } : { scale: 0.92, y: 15, opacity: 0.3, zIndex: 0 }}
        drag={isTop ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        onDragStart={() => isTop && playSound('swipe')}
        onDragEnd={handleDragEnd}
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{
          scale: isTop ? 1 : 0.92,
          opacity: isTop ? 1 : 0.3,
          y: isTop ? 0 : 15,
          transition: { type: 'spring', stiffness: 400, damping: 30 }
        }}
        exit={{
          x: x.get() > 0 ? 600 : -600,
          opacity: 0,
          scale: 0.8,
          transition: { duration: 0.3, ease: "easeIn" }
        }}
        className={`absolute inset-0 physical-card flex flex-col items-center justify-between p-8 py-14 ${isError && isTop ? 'animate-spring' : ''}`}
      >
        {/* Top Tag */}
        <div className="text-black/5 uppercase font-black text-[9px] tracking-widest">
          PHONICS FLOW
        </div>

        {/* Center: Letter + IPA + anchor phrase */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-3">
          <div className="text-9xl font-black font-display tracking-tighter text-black/80">
            {item.display}
          </div>
          {item.ipa && (
            <div className="px-4 py-2 bg-black/5 rounded-2xl text-2xl font-bold font-mono text-black/30">
              {item.ipa}
            </div>
          )}
          <div className="text-2xl font-bold font-mono text-black/30">
            {item.display} for {extractWord(item.audioText)}
          </div>
        </div>

        {/* Bottom: Audio button + hint */}
        <div className="flex flex-col items-center space-y-6 w-full">
          <button
            onPointerDown={handleSpeak}
            className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center text-black/40 hover:text-black hover:bg-black/10 transition-all active:scale-90"
          >
            <Volume2 size={20} />
          </button>

          {showHint && (
            <div className="flex w-full justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="text-rose-500/30">&larr; Practice</span>
              <span className="text-emerald-500/30">Mastered &rarr;</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Edge glow indicators */}
      {isTop && (
        <>
          <motion.div
            style={{ opacity: leftIndicatorOpacity }}
            className="fixed inset-y-0 left-0 w-32 bg-gradient-to-r from-rose-400/10 to-transparent pointer-events-none z-20 flex items-center justify-center"
          >
            <XCircle className="text-rose-500/20" size={64} />
          </motion.div>
          <motion.div
            style={{ opacity: rightIndicatorOpacity }}
            className="fixed inset-y-0 right-0 w-32 bg-gradient-to-l from-emerald-400/10 to-transparent pointer-events-none z-20 flex items-center justify-center"
          >
            <CheckCircle2 className="text-emerald-500/20" size={64} />
          </motion.div>
        </>
      )}
    </>
  );
};

// ─── Main App ───
export default function App() {
  const [activePhase, setActivePhase] = useState<Phase | null>(null);
  const [queue, setQueue] = useState<PhonicsItem[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalSwipes, setTotalSwipes] = useState(0);
  const [burst, setBurst] = useState<{ x: number; y: number; color: string } | null>(null);
  const [isError, setIsError] = useState(false);

  const currentItem = queue[0];
  const bgColor = useMemo(() => activePhase ? COLORS[activePhase.id - 1] : '#FFFFFF', [activePhase]);
  const showHint = totalSwipes < 5;

  const selectPhase = (phase: Phase) => {
    setActivePhase(phase);
    setQueue([...phase.items]);
    setStreak(0);
    playSound('success');
  };

  const handleSwipe = (mastered: boolean) => {
    if (!currentItem) return;
    setTotalSwipes(n => n + 1);

    if (mastered) {
      playSound('success', streak);
      setBurst({ x: window.innerWidth / 2, y: window.innerHeight / 2, color: '#4ADE80' });
      setStreak(s => s + 1);

      setTimeout(() => {
        setQueue(prev => prev.slice(1));
        setBurst(null);
      }, 10);
    } else {
      playSound('error');
      setIsError(true);
      setStreak(0);
      setTimeout(() => setIsError(false), 400);

      setQueue(prev => {
        const remaining = [...prev.slice(1)];
        remaining.splice(Math.min(3, remaining.length), 0, prev[0]);
        return remaining;
      });
    }
  };

  // Auto-speak on card change
  useEffect(() => {
    if (currentItem) {
      const word = extractWord(currentItem.audioText);
      const timer = setTimeout(() => {
        speakLearningPhrase(currentItem.display, currentItem.ipa, word);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [currentItem]);

  // ─── HOME: The Staircase ───
  if (!activePhase) {
    return (
      <div className="min-h-screen bg-white p-8 overflow-y-auto pb-24">
        <header className="py-12 text-center space-y-2">
          <h1 className="text-7xl font-black tracking-tighter">FLOW</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-black/20">
            The Foundation Staircase
          </p>
        </header>

        <div className="max-w-md mx-auto space-y-6">
          {PHASES.map((phase, idx) => (
            <motion.button
              key={phase.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => selectPhase(phase)}
              className="w-full text-left p-8 rounded-[40px] flex flex-col justify-between group relative overflow-hidden transition-all hover:-translate-y-1 active:scale-[0.98]"
              style={{ backgroundColor: COLORS[idx] }}
            >
              <div className="relative z-10 space-y-1">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20">
                  Stage 0{phase.id}
                </div>
                <h3 className="text-3xl font-black text-black/80">{phase.title}</h3>
                <p className="text-xs text-black/40 font-medium">{phase.description}</p>
              </div>

              <div className="mt-8 flex items-center justify-between relative z-10">
                <div className="flex -space-x-2">
                  {phase.items.slice(0, 4).map(item => (
                    <div
                      key={item.id}
                      className="w-8 h-8 rounded-full bg-white/50 border border-white flex items-center justify-center text-[10px] font-black"
                    >
                      {item.display.slice(0, 1)}
                    </div>
                  ))}
                </div>
                <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <Sparkles size={20} />
                </div>
              </div>

              {/* Decorative blob */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // ─── STAGE COMPLETE ───
  if (queue.length === 0) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-8 bg-white text-center"
        style={{ backgroundColor: bgColor }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-8"
        >
          <div className="w-32 h-32 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-2xl">
            <CheckCircle2 size={64} />
          </div>
          <div>
            <h2 className="text-5xl font-black tracking-tight mb-2">Stage Mastered!</h2>
            <p className="text-black/40 uppercase tracking-widest text-xs font-bold">
              You've unlocked the next rhythm
            </p>
          </div>
          <div className="flex flex-col gap-4 mt-12">
            <button
              onClick={() => setActivePhase(null)}
              className="px-12 py-5 bg-black text-white rounded-full font-black text-sm tracking-widest hover:scale-105 transition-transform uppercase"
            >
              Return to Staircase
            </button>
            <button
              onClick={() => selectPhase(activePhase)}
              className="px-12 py-5 border-2 border-black/5 text-black/40 rounded-full font-black text-sm tracking-widest hover:bg-black/5 transition-colors uppercase"
            >
              Practice Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── DRILL VIEW ───
  return (
    <div
      className="min-h-screen relative flex items-center justify-center touch-none overflow-hidden transition-colors duration-1000 ease-in-out"
      style={{ backgroundColor: bgColor }}
    >
      <ParticleOverlay burst={burst} />

      {/* Header */}
      <div className="absolute top-12 left-0 right-0 flex px-8 justify-between items-start pointer-events-none">
        <button
          onClick={() => setActivePhase(null)}
          className="pointer-events-auto w-12 h-12 rounded-full bg-white/50 backdrop-blur-md flex items-center justify-center text-black shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col items-end space-y-1">
          <div className="text-[9px] font-black uppercase tracking-[0.3em] opacity-20">Remaining</div>
          <div className="text-2xl font-black font-mono">{queue.length}</div>
        </div>
      </div>

      {/* Card Stack */}
      <div className="relative w-full max-w-sm aspect-[4/5] px-6">
        <AnimatePresence mode="popLayout">
          {queue.slice(0, 2).reverse().map((item, idx) => (
            <PhonicsCard
              key={item.id + '-' + queue.length}
              item={item}
              isTop={idx === 1}
              onSwipe={handleSwipe}
              isError={isError}
              showHint={showHint}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="absolute bottom-12 text-black/20 text-[10px] font-black uppercase tracking-[0.3em] flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="animate-pulse" />
          <span>Stage 0{activePhase.id}: {activePhase.title}</span>
        </div>
      </div>
    </div>
  );
}
