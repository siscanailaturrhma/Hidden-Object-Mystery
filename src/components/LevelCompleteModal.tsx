import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Trophy, ArrowRight, RotateCcw, BookOpen, Clock, Target, Eye } from 'lucide-react';
import { GameLevel, GameStats } from '../types';
import { sound } from '../utils/audio';

interface LevelCompleteModalProps {
  level: GameLevel;
  levelNumber: number;
  totalLevels: number;
  stats: GameStats;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenGDD: () => void;
  onRestartFromFirst?: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  level,
  levelNumber,
  totalLevels,
  stats,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onOpenGDD,
  onRestartFromFirst,
}) => {
  useEffect(() => {
    sound.playVictory();

    // Trigger celebratory confetti
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 40 * (timeLeft / duration);
      confetti({
        particleCount,
        origin: { x: 0.2, y: 0.6 },
        spread: 60,
        colors: ['#f59e0b', '#10b981', '#38bdf8', '#fbbf24'],
      });
      confetti({
        particleCount,
        origin: { x: 0.8, y: 0.6 },
        spread: 60,
        colors: ['#f59e0b', '#10b981', '#38bdf8', '#fbbf24'],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md rounded-3xl bg-stone-900 border border-amber-500/40 p-6 sm:p-8 text-stone-100 shadow-2xl overflow-hidden">
        {/* Decorative Golden Ambient Glow */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />

        {/* Header Badge */}
        <div className="relative flex flex-col items-center text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 shadow-xl shadow-amber-500/30">
            <Trophy className="h-8 w-8" />
          </div>

          <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            Level {levelNumber} dari {totalLevels}
          </span>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-stone-100">
            Level Selesai!
          </h2>
          <p className="mt-1.5 text-xs text-stone-300 max-w-xs">
            Semua barang tersembunyi di <strong className="text-amber-300">{level.title}</strong> berhasil ditemukan!
          </p>

          {/* Star Rating */}
          <div className="my-5 flex items-center gap-2">
            {[1, 2, 3].map((starIdx) => (
              <div
                key={starIdx}
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-all ${
                  starIdx <= stats.stars
                    ? 'bg-amber-500/20 border-amber-400/80 text-amber-400 scale-105 shadow-md shadow-amber-500/20'
                    : 'bg-stone-800/60 border-stone-700/60 text-stone-600'
                }`}
              >
                <Star className="h-6 w-6 fill-current" />
              </div>
            ))}
          </div>

          {/* Statistics Grid: Waktu Ditempuh & Skor Akhir */}
          <div className="w-full grid grid-cols-3 gap-2.5 rounded-2xl bg-stone-800/70 border border-stone-700/60 p-3 text-center my-3 shadow-inner">
            <div className="flex flex-col items-center">
              <Clock className="h-4 w-4 text-sky-400 mb-1" />
              <span className="text-[11px] font-medium text-stone-400">Waktu Ditempuh</span>
              <span className="font-mono text-sm font-bold text-sky-300">
                {formatTime(stats.timeElapsed)}
              </span>
            </div>

            <div className="flex flex-col items-center border-x border-stone-700/50">
              <Eye className="h-4 w-4 text-emerald-400 mb-1" />
              <span className="text-[11px] font-medium text-stone-400">Petunjuk</span>
              <span className="font-mono text-sm font-bold text-stone-200">
                {stats.hintsUsed}x
              </span>
            </div>

            <div className="flex flex-col items-center">
              <Target className="h-4 w-4 text-amber-400 mb-1" />
              <span className="text-[11px] font-medium text-amber-300/80">Skor Akhir</span>
              <span className="font-mono text-sm font-extrabold text-amber-400">
                {stats.score}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 w-full flex flex-col gap-2.5">
            {hasNextLevel ? (
              <button
                id="btn-next-level"
                onClick={onNextLevel}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 py-3.5 text-sm font-bold text-stone-950 shadow-lg shadow-amber-500/25 transition-all active:scale-98 cursor-pointer"
              >
                <span>Lanjut ke Level Berikutnya</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex flex-col gap-2.5 w-full">
                <div className="rounded-2xl bg-emerald-950/70 border border-emerald-600/50 p-3.5 text-xs text-emerald-200 text-center font-medium leading-relaxed">
                  🎉 <strong>Hebat!</strong> Kamu telah berhasil menuntaskan seluruh {totalLevels} ruangan di game 3D Hidden Object ini!
                </div>
                {onRestartFromFirst && (
                  <button
                    id="btn-restart-from-first"
                    onClick={onRestartFromFirst}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 py-3 text-xs font-bold text-stone-950 shadow-lg shadow-amber-500/25 transition-all active:scale-98 cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Mulai Lagi dari Level 1</span>
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                id="btn-replay-level"
                onClick={onReplay}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-stone-800 hover:bg-stone-700/90 py-2.5 text-xs font-semibold text-stone-200 border border-stone-700/60 transition-all active:scale-98 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Ulangi Ruangan Ini</span>
              </button>

              <button
                id="btn-view-gdd-finish"
                onClick={onOpenGDD}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-950/40 hover:bg-amber-900/50 py-2.5 text-xs font-semibold text-amber-300 border border-amber-600/30 transition-all active:scale-98 cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5 text-amber-400" />
                <span>Dokumentasi GDD</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
