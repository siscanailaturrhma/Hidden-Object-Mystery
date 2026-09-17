import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Clock, Target, Eye, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/audio';

interface GameEndingScreenProps {
  totalScore: number;
  totalTimeSeconds: number;
  totalHintsUsed: number;
  totalRoomsCleared?: number;
  onPlayAgain: () => void;
  onReturnToMainMenu: () => void;
  onOpenLevelSelect?: () => void;
}

export const GameEndingScreen: React.FC<GameEndingScreenProps> = ({
  totalScore,
  totalTimeSeconds,
  totalHintsUsed,
  onPlayAgain,
  onReturnToMainMenu,
}) => {
  useEffect(() => {
    sound.playVictory();

    // Trigger grand victory confetti cannon
    const duration = 3.5 * 1000;
    const animationEnd = Date.now() + duration;

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 45 * (timeLeft / duration);
      confetti({
        particleCount,
        origin: { x: 0.2, y: 0.5 },
        spread: 70,
        colors: ['#f59e0b', '#10b981', '#38bdf8', '#fbbf24', '#ec4899'],
      });
      confetti({
        particleCount,
        origin: { x: 0.8, y: 0.5 },
        spread: 70,
        colors: ['#f59e0b', '#10b981', '#38bdf8', '#fbbf24', '#ec4899'],
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    if (hours > 0) {
      return `${hours}j ${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
    }
    return `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 select-none">
      <div className="relative w-full max-w-lg rounded-3xl bg-stone-900 border border-amber-500/50 p-6 sm:p-8 text-stone-100 shadow-2xl overflow-hidden my-6">
        {/* Ornate Background Glows */}
        <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        {/* Header Badge & Title */}
        <div className="relative flex flex-col items-center text-center">
          <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-stone-950 shadow-2xl shadow-amber-500/40 border-2 border-amber-300">
            <Trophy className="h-10 w-10" />
            <div className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-stone-950 shadow-md">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-400 drop-shadow-md">
            Misteri Terpecahkan!
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-300 max-w-sm font-light leading-relaxed">
            Dokumen Rahasia 1895 Berhasil Ditemukan!
          </p>

          {/* SUMMARY STATISTICS GRID (SKOR AKHIR, TOTAL WAKTU, PETUNJUK DIPAKAI) */}
          <div className="w-full grid grid-cols-3 gap-3 text-center my-6">
            <div className="rounded-2xl bg-stone-800/80 border border-stone-700/60 p-3.5 shadow-inner">
              <div className="flex justify-center mb-1 text-amber-400">
                <Target className="h-4 w-4" />
              </div>
              <span className="text-[11px] text-stone-400 block font-medium">Skor Akhir</span>
              <span className="font-mono text-base sm:text-lg font-extrabold text-amber-400">
                {totalScore.toLocaleString()}
              </span>
            </div>

            <div className="rounded-2xl bg-stone-800/80 border border-stone-700/60 p-3.5 shadow-inner">
              <div className="flex justify-center mb-1 text-sky-400">
                <Clock className="h-4 w-4" />
              </div>
              <span className="text-[11px] text-stone-400 block font-medium">Total Waktu</span>
              <span className="font-mono text-base sm:text-lg font-bold text-sky-300">
                {formatTime(totalTimeSeconds)}
              </span>
            </div>

            <div className="rounded-2xl bg-stone-800/80 border border-stone-700/60 p-3.5 shadow-inner">
              <div className="flex justify-center mb-1 text-emerald-400">
                <Eye className="h-4 w-4" />
              </div>
              <span className="text-[11px] text-stone-400 block font-medium">Hint Dipakai</span>
              <span className="font-mono text-base sm:text-lg font-bold text-emerald-300">
                {totalHintsUsed}x
              </span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="w-full flex flex-col sm:flex-row gap-3">
            {/* Button: Main Lagi dari Awal */}
            <button
              id="btn-play-again"
              onClick={() => {
                sound.playClick();
                onPlayAgain();
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 py-3.5 px-5 text-sm font-bold text-stone-950 shadow-lg shadow-amber-500/25 transition-all active:scale-98 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Main Lagi dari Awal</span>
            </button>

            {/* Button: Kembali ke Menu Utama */}
            <button
              id="btn-return-to-menu"
              onClick={() => {
                sound.playClick();
                onReturnToMainMenu();
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-stone-800 hover:bg-stone-700 py-3.5 px-5 text-sm font-bold text-stone-200 border border-stone-700/70 transition-all active:scale-98 cursor-pointer"
            >
              <Home className="h-4 w-4 text-amber-400" />
              <span>Kembali ke Menu Utama</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
