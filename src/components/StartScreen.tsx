import React from 'react';
import { Play, HelpCircle, Music } from 'lucide-react';
import { sound } from '../utils/audio';

interface StartScreenProps {
  onStartGame: () => void;
  onOpenHowToPlay: () => void;
  onOpenLevelSelect?: () => void;
  isMuted?: boolean;
  isMusicPlaying: boolean;
  onToggleMute?: () => void;
  onToggleMusic: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  onOpenHowToPlay,
  isMusicPlaying,
  onToggleMusic,
}) => {
  const handlePlayClick = () => {
    sound.playClick();
    if (!isMusicPlaying) {
      sound.startMusic();
    }
    onStartGame();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 font-sans text-stone-100 flex flex-col justify-between select-none">
      {/* ATMOSPHERIC DETECTIVE ROOM BACKGROUND */}
      <div className="absolute inset-0 z-0">
        {/* Deep moody gradient mimicking a candlelit Victorian study at night */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/90 via-stone-900/80 to-stone-950/95" />

        {/* Vintage Damask / Detective Wall Texture Simulation */}
        <div
          className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.4) 0%, transparent 60%),
                              radial-gradient(circle at 20% 70%, rgba(217, 119, 6, 0.25) 0%, transparent 50%),
                              radial-gradient(circle at 80% 60%, rgba(180, 83, 9, 0.25) 0%, transparent 50%)`,
          }}
        />

        {/* Floating dust motes / mystery particles illusion */}
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:48px_48px] opacity-10 animate-pulse pointer-events-none" />

        {/* Vignette border around screen */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.85)]" />

        {/* Stylized classic silhouette of Victorian study room in blurred background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 filter blur-sm">
          <div className="w-[850px] h-[550px] rounded-full bg-amber-600/20 blur-3xl animate-pulse" />
        </div>
      </div>

      {/* TOP BAR / TOGGLE MUSIK DI KANAN ATAS */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-end">
        <button
          id="btn-toggle-music-start"
          onClick={onToggleMusic}
          title={isMusicPlaying ? 'Matikan Musik Ambient' : 'Nyalakan Musik Ambient'}
          className={`p-2.5 sm:px-4 sm:py-2 rounded-2xl text-xs flex items-center gap-2 font-medium transition-all backdrop-blur-md shadow-lg border cursor-pointer ${
            isMusicPlaying
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800 border-stone-800'
          }`}
        >
          <Music className="h-4 w-4" />
          <span>{isMusicPlaying ? 'Musik Aktif' : 'Musik Mati'}</span>
        </button>
      </header>

      {/* MAIN HERO TITLE & PLAY CONTROLS */}
      <main className="relative z-10 w-full max-w-3xl mx-auto px-6 py-4 flex flex-col items-center text-center my-auto">
        {/* Vintage Classic Detective Title */}
        <div className="relative mb-8 sm:mb-10">
          {/* Subtle golden ambient glow behind title */}
          <div className="absolute -inset-6 rounded-3xl bg-amber-500/15 blur-3xl pointer-events-none" />

          <h1 className="relative font-serif text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-500 drop-shadow-[0_4px_20px_rgba(217,119,6,0.35)]">
            Hidden Object Mystery
          </h1>
        </div>

        {/* MAIN BUTTONS SECTION */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-sm sm:max-w-md">
          {/* BIG PLAY BUTTON */}
          <button
            id="btn-start-game"
            onClick={handlePlayClick}
            className="group relative w-full sm:flex-1 flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 py-4 px-8 text-stone-950 font-extrabold text-base tracking-wide shadow-[0_10px_30px_rgba(245,158,11,0.35)] hover:shadow-[0_12px_36px_rgba(245,158,11,0.45)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:scale-98 cursor-pointer overflow-hidden border border-amber-300"
          >
            {/* Shimmer light effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-950/15 text-stone-950">
              <Play className="h-5 w-5 fill-current" />
            </div>
            <span>Mulai Investigasi</span>
          </button>

          {/* HOW TO PLAY BUTTON */}
          <button
            id="btn-how-to-play"
            onClick={() => {
              sound.playClick();
              onOpenHowToPlay();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-stone-900/90 hover:bg-stone-800 py-4 px-6 text-stone-200 hover:text-amber-300 font-bold text-sm border border-stone-700/80 hover:border-amber-500/50 shadow-xl backdrop-blur-md transition-all active:scale-98 cursor-pointer"
          >
            <HelpCircle className="h-4 w-4 text-amber-400" />
            <span>Cara Bermain</span>
          </button>
        </div>
      </main>

      {/* BOTTOM SPACER TO KEEP PERFECT BALANCE */}
      <div className="relative z-10 w-full h-16 pointer-events-none" />
    </div>
  );
};
