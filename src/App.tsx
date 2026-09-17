import React, { useState, useEffect, useRef } from 'react';
import { GAME_LEVELS } from './data/levels';
import { GameLevel, GameMode, GameStats, HiddenItem } from './types';
import { GameCanvas } from './game/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { GameDesignModal } from './components/GameDesignModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { sound } from './utils/audio';
import { Sparkles, HelpCircle, X, Info } from 'lucide-react';

export default function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const currentLevel = GAME_LEVELS[currentLevelIndex];

  // Game Play State
  const [items, setItems] = useState<HiddenItem[]>(() =>
    currentLevel.items.map((i) => ({ ...i, found: false }))
  );
  const [score, setScore] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(currentLevel.timeLimitSeconds);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [gameMode, setGameMode] = useState<GameMode>('cozy');
  const [hintsLeft, setHintsLeft] = useState<number>(3);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [misclicks, setMisclicks] = useState<number>(0);
  const [isLevelComplete, setIsLevelComplete] = useState<boolean>(false);
  const [completedLevelIds, setCompletedLevelIds] = useState<string[]>([]);

  // Interactive Tools
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(true);
  const [flashlightMode, setFlashlightMode] = useState<boolean>(false);
  const [activeHintItemId, setActiveHintItemId] = useState<string | null>(null);
  const [selectedClueItem, setSelectedClueItem] = useState<HiddenItem | null>(null);

  // Auto-start ambient mystery music on first user gesture (browser audio policy)
  useEffect(() => {
    const startMusicOnFirstGesture = () => {
      if (sound.isMusicEnabled && !sound.isMuted) {
        sound.startMusic();
        setIsMusicPlaying(sound.getMusicStatus());
      }
      window.removeEventListener('pointerdown', startMusicOnFirstGesture);
      window.removeEventListener('keydown', startMusicOnFirstGesture);
    };

    window.addEventListener('pointerdown', startMusicOnFirstGesture, { once: true });
    window.addEventListener('keydown', startMusicOnFirstGesture, { once: true });

    return () => {
      window.removeEventListener('pointerdown', startMusicOnFirstGesture);
      window.removeEventListener('keydown', startMusicOnFirstGesture);
    };
  }, []);

  // Modals
  const [showGDD, setShowGDD] = useState<boolean>(false);
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [showControlsGuide, setShowControlsGuide] = useState<boolean>(true);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Reset or Load Level
  const loadLevel = (level: GameLevel) => {
    const index = GAME_LEVELS.findIndex((l) => l.id === level.id);
    if (index !== -1) {
      setCurrentLevelIndex(index);
    }
    setItems(level.items.map((i) => ({ ...i, found: false })));
    setTimeRemaining(level.timeLimitSeconds);
    setTimeElapsed(0);
    setMisclicks(0);
    setHintsUsed(0);
    setHintsLeft(3);
    setActiveHintItemId(null);
    setSelectedClueItem(null);
    setIsLevelComplete(false);
    showToast(`Memulai Penyelidikan: ${level.title}`);
  };

  const restartCurrentLevel = () => {
    loadLevel(currentLevel);
  };

  // Timer Tick (Timed Mode)
  useEffect(() => {
    if (isLevelComplete) return;

    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);

      if (gameMode === 'timed') {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            showToast('⏰ Waktu habis! Mode santai diaktifkan.');
            setGameMode('cozy');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameMode, isLevelComplete]);

  // Handle Item Found
  const handleItemFound = (foundItem: HiddenItem) => {
    setItems((prevItems) => {
      const updated = prevItems.map((item) =>
        item.id === foundItem.id ? { ...item, found: true } : item
      );

      // Check level completion
      const remaining = updated.filter((i) => !i.found);
      if (remaining.length === 0) {
        setTimeout(() => {
          setIsLevelComplete(true);
          setCompletedLevelIds((prev) =>
            prev.includes(currentLevel.id) ? prev : [...prev, currentLevel.id]
          );
        }, 1200);
      }

      return updated;
    });

    // Score computation: base points + speed bonus
    const points = 150 + Math.max(0, 100 - timeElapsed * 2);
    setScore((prev) => prev + points);

    // Clear active hint if this was the hinted item
    if (activeHintItemId === foundItem.id) {
      setActiveHintItemId(null);
    }
    if (selectedClueItem?.id === foundItem.id) {
      setSelectedClueItem(null);
    }

    showToast(`✨ ${foundItem.indonesianName} Ditemukan! (+${points} Poin)`);
  };

  // Handle Misclick
  const handleMisclick = () => {
    setMisclicks((prev) => prev + 1);
  };

  // Handle Container Toggled (e.g. Drawer / Chest)
  const handleContainerToggled = (name: string, isOpen: boolean) => {
    showToast(`📦 ${name} ${isOpen ? 'dibuka' : 'ditutup'}`);
  };

  // Hint button triggered
  const handleUseHint = () => {
    if (hintsLeft <= 0) return;

    // Pick first uncollected item
    const uncollected = items.filter((i) => !i.found);
    if (uncollected.length === 0) return;

    const target = uncollected[0];
    sound.playHint();
    setHintsLeft((prev) => prev - 1);
    setHintsUsed((prev) => prev + 1);
    setActiveHintItemId(target.id);
    setSelectedClueItem(target);

    showToast(`🧭 Petunjuk: Radar diarahkan ke ${target.indonesianName}!`);

    // Auto-clear active marker pulse after 6 seconds
    setTimeout(() => {
      setActiveHintItemId((current) => (current === target.id ? null : current));
    }, 6000);
  };

  // Sound toggle (Global Mute)
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.isMuted = nextMuted;
    if (nextMuted) {
      sound.stopMusic();
      setIsMusicPlaying(false);
    } else {
      sound.playClick();
      if (sound.isMusicEnabled) {
        sound.startMusic();
        setIsMusicPlaying(true);
      }
    }
  };

  // Ambient Mystery Music Toggle
  const toggleMusic = () => {
    const active = sound.toggleMusic();
    setIsMusicPlaying(active);
    showToast(
      active
        ? '🎵 Musik ambient misteri dinyalakan (looping pelan)'
        : '🔇 Musik ambient misteri dimatikan'
    );
  };

  // Game Mode Toggle
  const toggleGameMode = () => {
    sound.playClick();
    const next = gameMode === 'cozy' ? 'timed' : 'cozy';
    setGameMode(next);
    showToast(
      next === 'timed'
        ? '⏱️ Mode Detektif Cepat diaktifkan!'
        : '🌿 Mode Santai diaktifkan.'
    );
  };

  // Calculate Stars on Finish
  const calculateStars = (): number => {
    if (misclicks <= 3 && hintsUsed <= 1) return 3;
    if (misclicks <= 7 && hintsUsed <= 2) return 2;
    return 1;
  };

  const foundCount = items.filter((i) => i.found).length;
  const totalCount = items.length;
  const hasNextLevel = currentLevelIndex < GAME_LEVELS.length - 1;

  const currentStats: GameStats = {
    score,
    foundCount,
    totalCount,
    timeElapsed,
    hintsUsed,
    misclicks,
    stars: calculateStars(),
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 font-sans select-none text-stone-100">
      {/* 3D WebGL Canvas Layer */}
      <GameCanvas
        level={currentLevel}
        foundItemIds={items.filter((i) => i.found).map((i) => i.id)}
        activeHintItemId={activeHintItemId}
        flashlightMode={flashlightMode}
        onItemFound={handleItemFound}
        onMisclick={handleMisclick}
        onContainerToggled={handleContainerToggled}
      />

      {/* Heads-Up Display (HUD) Layer */}
      <GameHUD
        level={currentLevel}
        levelNumber={currentLevelIndex + 1}
        totalLevels={GAME_LEVELS.length}
        items={items}
        foundCount={foundCount}
        totalCount={totalCount}
        score={score}
        timeRemaining={timeRemaining}
        gameMode={gameMode}
        hintsLeft={hintsLeft}
        isMuted={isMuted}
        isMusicPlaying={isMusicPlaying}
        flashlightMode={flashlightMode}
        selectedClueItem={selectedClueItem}
        onToggleMute={toggleMute}
        onToggleMusic={toggleMusic}
        onToggleFlashlight={() => setFlashlightMode((prev) => !prev)}
        onUseHint={handleUseHint}
        onSelectClueItem={setSelectedClueItem}
        onOpenGDD={() => setShowGDD(true)}
        onOpenLevelSelect={() => setShowLevelSelect(true)}
        onRestartLevel={restartCurrentLevel}
        onToggleGameMode={toggleGameMode}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="pointer-events-none fixed top-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-2xl bg-stone-900/90 text-amber-300 text-xs font-semibold border border-amber-500/50 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Initial Player Controls Onboarding Banner */}
      {showControlsGuide && (
        <div className="pointer-events-auto fixed bottom-28 left-1/2 -translate-x-1/2 z-30 flex items-center justify-between gap-4 rounded-2xl bg-stone-900/95 px-4 py-2.5 text-xs text-stone-300 border border-stone-700/80 shadow-2xl backdrop-blur-md max-w-lg w-[92%] sm:w-auto">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="leading-snug">
              <strong>Kontrol 3D:</strong> Klik & geser untuk memutar ruangan 360° • Scroll untuk zoom • Klik laci/peti untuk membuka • Klik barang untuk mengumpulkannya.
            </span>
          </div>
          <button
            onClick={() => setShowControlsGuide(false)}
            className="text-stone-400 hover:text-stone-100 p-1 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* LEVEL COMPLETE MODAL */}
      {isLevelComplete && (
        <LevelCompleteModal
          level={currentLevel}
          levelNumber={currentLevelIndex + 1}
          totalLevels={GAME_LEVELS.length}
          stats={currentStats}
          hasNextLevel={hasNextLevel}
          onNextLevel={() => {
            if (hasNextLevel) {
              loadLevel(GAME_LEVELS[currentLevelIndex + 1]);
            }
          }}
          onReplay={restartCurrentLevel}
          onRestartFromFirst={() => loadLevel(GAME_LEVELS[0])}
          onOpenGDD={() => setShowGDD(true)}
        />
      )}

      {/* GAME DESIGN DOCUMENT (GDD) MODAL */}
      {showGDD && <GameDesignModal onClose={() => setShowGDD(false)} />}

      {/* LEVEL SELECTOR MODAL */}
      {showLevelSelect && (
        <LevelSelectModal
          levels={GAME_LEVELS}
          currentLevelId={currentLevel.id}
          completedLevelIds={completedLevelIds}
          onSelectLevel={loadLevel}
          onClose={() => setShowLevelSelect(false)}
        />
      )}
    </div>
  );
}
