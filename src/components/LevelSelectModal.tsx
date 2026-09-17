import React from 'react';
import { X, CheckCircle, Sparkles, Clock, Lock } from 'lucide-react';
import { GameLevel } from '../types';

interface LevelSelectModalProps {
  levels: GameLevel[];
  currentLevelId: string;
  completedLevelIds: string[];
  onSelectLevel: (level: GameLevel) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  levels,
  currentLevelId,
  completedLevelIds,
  onSelectLevel,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-stone-900 border border-amber-500/40 p-6 text-stone-100 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div>
            <h3 className="text-lg font-bold text-stone-100">Pilih Tempat Penyelidikan (3D Level)</h3>
            <p className="text-xs text-amber-400">Pilih ruangan diorama untuk dijelajahi</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {levels.map((lvl, index) => {
            const isSelected = lvl.id === currentLevelId;
            const isCompleted = completedLevelIds.includes(lvl.id);

            return (
              <button
                key={lvl.id}
                onClick={() => {
                  onSelectLevel(lvl);
                  onClose();
                }}
                className={`w-full flex items-start gap-3.5 rounded-2xl p-4 text-left transition-all active:scale-98 border ${
                  isSelected
                    ? 'bg-amber-950/50 border-amber-500 ring-2 ring-amber-500/20 shadow-lg'
                    : 'bg-stone-800/60 hover:bg-stone-800 border-stone-700/60'
                }`}
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-base shadow-md"
                  style={{
                    backgroundColor: `${lvl.themeColor}30`,
                    color: lvl.themeColor,
                    borderColor: `${lvl.themeColor}60`,
                    borderWidth: '1px',
                  }}
                >
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-stone-100 truncate">{lvl.title}</h4>
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-700/40">
                        <CheckCircle className="h-3 w-3" />
                        Selesai
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 line-clamp-2 mt-0.5">{lvl.description}</p>

                  <div className="mt-2 flex items-center gap-3 text-[11px] text-stone-400">
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      {lvl.items.length} Barang
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-stone-400" />
                      {lvl.difficulty}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
