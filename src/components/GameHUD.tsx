import React from 'react';
import {
  Search,
  Sparkles,
  Volume2,
  VolumeX,
  Music,
  Flashlight,
  BookOpen,
  RotateCcw,
  Clock,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';
import { GameLevel, GameMode, HiddenItem } from '../types';

interface GameHUDProps {
  level: GameLevel;
  levelNumber: number;
  totalLevels: number;
  items: HiddenItem[];
  foundCount: number;
  totalCount: number;
  score: number;
  timeRemaining: number;
  gameMode: GameMode;
  hintsLeft: number;
  isMuted: boolean;
  isMusicPlaying: boolean;
  flashlightMode: boolean;
  selectedClueItem: HiddenItem | null;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onToggleFlashlight: () => void;
  onUseHint: () => void;
  onSelectClueItem: (item: HiddenItem | null) => void;
  onOpenGDD: () => void;
  onOpenLevelSelect: () => void;
  onRestartLevel: () => void;
  onToggleGameMode: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  level,
  levelNumber,
  totalLevels,
  items,
  foundCount,
  totalCount,
  score,
  timeRemaining,
  gameMode,
  hintsLeft,
  isMuted,
  isMusicPlaying,
  flashlightMode,
  selectedClueItem,
  onToggleMute,
  onToggleMusic,
  onToggleFlashlight,
  onUseHint,
  onSelectClueItem,
  onOpenGDD,
  onOpenLevelSelect,
  onRestartLevel,
  onToggleGameMode,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = Math.round((foundCount / totalCount) * 100);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-3 sm:p-4 overflow-hidden">
      {/* TOP BAR */}
      <header className="pointer-events-auto flex flex-wrap items-center justify-between gap-2.5 rounded-2xl bg-stone-900/85 p-2.5 sm:px-4 sm:py-3 text-stone-100 shadow-2xl backdrop-blur-md border border-stone-800/80">
        {/* Left: Level Info & Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-level-select"
            onClick={onOpenLevelSelect}
            className="group flex items-center gap-2 rounded-xl bg-stone-800/90 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-stone-700/90 hover:text-amber-300 transition-all border border-amber-500/20 shadow-sm active:scale-95 cursor-pointer"
          >
            <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/30">
              Lvl {levelNumber}/{totalLevels}
            </span>
            <span className="max-w-[110px] sm:max-w-[160px] truncate">{level.title}</span>
            <ChevronRight className="h-3 w-3 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <div className="hidden md:flex items-center gap-2 text-xs text-stone-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{level.subtitle}</span>
          </div>
        </div>

        {/* Center: Score & Progress */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Found Count Pill */}
          <div className="flex items-center gap-2 rounded-xl bg-stone-800/60 px-3 py-1.5 text-xs font-medium border border-stone-700/50">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>
              <strong className="text-amber-300 font-bold text-sm">{foundCount}</strong> / {totalCount} Dicari
            </span>
          </div>

          {/* Mode & Timer */}
          {gameMode === 'timed' ? (
            <div
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-mono font-bold border transition-colors ${
                timeRemaining < 30
                  ? 'bg-rose-950/80 text-rose-300 border-rose-600/80 animate-pulse'
                  : 'bg-stone-800/60 text-stone-200 border-stone-700/50'
              }`}
            >
              <Clock className="h-3.5 w-3.5 text-rose-400" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          ) : (
            <button
              id="btn-mode-toggle"
              onClick={onToggleGameMode}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-950/50 px-2.5 py-1.5 text-xs font-medium text-emerald-300 border border-emerald-700/40 hover:bg-emerald-900/50 transition-colors"
              title="Klik untuk beralih ke Mode Waktu"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Mode Santai
            </button>
          )}

          {/* Score */}
          <div className="hidden sm:flex items-center gap-1 text-xs text-stone-300 font-mono">
            <span className="text-stone-400">Skor:</span>
            <span className="text-amber-400 font-bold">{score}</span>
          </div>
        </div>

        {/* Right: Quick Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Flashlight toggle */}
          <button
            id="btn-toggle-flashlight"
            onClick={onToggleFlashlight}
            className={`p-2 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
              flashlightMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20'
                : 'bg-stone-800/70 text-stone-400 hover:text-stone-200 border-stone-700/60'
            }`}
            title={flashlightMode ? 'Matikan Senter Detektif' : 'Nyalakan Senter Detektif'}
          >
            <Flashlight className="h-4 w-4" />
          </button>

          {/* Sound FX toggle */}
          <button
            id="btn-toggle-sound"
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-stone-800/70 hover:bg-stone-700/80 text-stone-400 hover:text-stone-200 border border-stone-700/60 transition-all active:scale-95"
            title={isMuted ? 'Nyalakan Efek Suara (SFX)' : 'Matikan Efek Suara (SFX)'}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
          </button>

          {/* Ambient Mystery Music toggle */}
          <button
            id="btn-toggle-music"
            onClick={onToggleMusic}
            className={`p-2 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
              isMusicPlaying && !isMuted
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20'
                : 'bg-stone-800/70 text-stone-500 hover:text-stone-300 border-stone-700/60'
            }`}
            title={
              isMusicPlaying && !isMuted
                ? 'Matikan Musik Ambient Misteri'
                : 'Nyalakan Musik Ambient Misteri (Looping Pelan)'
            }
          >
            <Music className={`h-4 w-4 ${isMusicPlaying && !isMuted ? 'animate-pulse' : ''}`} />
          </button>

          {/* Restart */}
          <button
            id="btn-restart-level"
            onClick={onRestartLevel}
            className="p-2 rounded-xl bg-stone-800/70 hover:bg-stone-700/80 text-stone-400 hover:text-stone-200 border border-stone-700/60 transition-all active:scale-95"
            title="Mulai Ulang Level Ini"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Game Design Document Button */}
          <button
            id="btn-open-gdd"
            onClick={onOpenGDD}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-semibold text-xs shadow-lg shadow-amber-600/20 transition-all active:scale-95"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Konsep Game & GDD</span>
            <span className="sm:hidden">GDD</span>
          </button>
        </div>
      </header>

      {/* ACTIVE CLUE BANNER (When player selects an item or needs hints) */}
      {selectedClueItem && (
        <div className="pointer-events-auto mx-auto mt-2 max-w-xl w-full flex items-center justify-between gap-3 rounded-xl bg-amber-950/90 px-4 py-2.5 text-xs text-amber-100 shadow-2xl border border-amber-600/40 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <Info className="h-4 w-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-semibold text-amber-300">{selectedClueItem.indonesianName}:</span>{' '}
              <span className="text-amber-100/90">{selectedClueItem.clue}</span>
            </div>
          </div>
          <button
            onClick={() => onSelectClueItem(null)}
            className="text-amber-400 hover:text-amber-200 font-bold px-2 py-0.5 rounded text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* BOTTOM TARGET ITEM CHECKLIST BAR */}
      <footer className="pointer-events-auto flex flex-col gap-2 rounded-2xl bg-stone-900/90 p-3 text-stone-100 shadow-2xl backdrop-blur-md border border-stone-800/90">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Daftar Barang Tersembunyi
            </span>
            <span className="text-[11px] text-stone-400 hidden sm:inline">
              (Klik item untuk membaca petunjuk lokasi)
            </span>
          </div>

          {/* Hint Action Button */}
          <button
            id="btn-use-hint"
            onClick={onUseHint}
            disabled={hintsLeft <= 0 || foundCount >= totalCount}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 ${
              hintsLeft > 0 && foundCount < totalCount
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
                : 'bg-stone-800 text-stone-500 border border-stone-700/40 cursor-not-allowed'
            }`}
          >
            <Search className="h-3.5 w-3.5 text-amber-400" />
            <span>Petunjuk ({hintsLeft})</span>
          </button>
        </div>

        {/* Horizontal Items Carousel */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin scrollbar-thumb-stone-700">
          {items.map((item) => {
            const isFound = item.found;
            const isSelected = selectedClueItem?.id === item.id;

            return (
              <button
                key={item.id}
                id={`item-card-${item.id}`}
                onClick={() => onSelectClueItem(isSelected ? null : item)}
                className={`relative flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all active:scale-95 border ${
                  isFound
                    ? 'bg-emerald-950/40 border-emerald-700/40 opacity-75'
                    : isSelected
                    ? 'bg-amber-950/70 border-amber-500 ring-2 ring-amber-500/30 shadow-lg'
                    : 'bg-stone-800/70 hover:bg-stone-800 border-stone-700/60'
                }`}
              >
                {/* Visual indicator / Color Dot */}
                <div
                  className="h-3.5 w-3.5 rounded-full shrink-0 border border-white/20 shadow-sm"
                  style={{ backgroundColor: item.color }}
                />

                <div className="flex flex-col">
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${
                      isFound ? 'line-through text-stone-400' : 'text-stone-200'
                    }`}
                  >
                    {item.indonesianName}
                  </span>
                  <span className="text-[10px] text-stone-400 whitespace-nowrap">
                    {isFound ? '✓ Ditemukan' : item.name}
                  </span>
                </div>

                {isFound && (
                  <span className="ml-1 text-xs font-bold text-emerald-400">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Visual Progress Bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </footer>
    </div>
  );
};
