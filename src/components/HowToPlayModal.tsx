import React from 'react';
import { X, Rotate3d, ZoomIn, Search, PackageOpen, Flashlight, Compass, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  const handleClose = () => {
    sound.playClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-stone-900 border border-amber-500/40 p-6 sm:p-8 text-stone-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Background Ambient Glow */}
        <div className="absolute -top-20 -left-20 h-52 w-52 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 shadow-inner">
              <Search className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">
                Instruksi Detektif
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-100">
                Cara Bermain & Kontrol 3D
              </h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-xl p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Instructions Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 overflow-y-auto pr-1 py-1">
          {/* Item 1: Rotasi 360 */}
          <div className="rounded-2xl bg-stone-800/60 border border-stone-700/60 p-4 flex gap-3.5 items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Rotate3d className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-200">Eksplorasi Ruangan 360°</h4>
              <p className="mt-1 text-xs text-stone-400 leading-relaxed">
                Klik kiri & geser mouse (atau usap layar) untuk memutar sudut pandang diorama 3D ke seluruh penjuru ruangan.
              </p>
            </div>
          </div>

          {/* Item 2: Zoom */}
          <div className="rounded-2xl bg-stone-800/60 border border-stone-700/60 p-4 flex gap-3.5 items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <ZoomIn className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-200">Perbesar & Zoom Detail</h4>
              <p className="mt-1 text-xs text-stone-400 leading-relaxed">
                Gunakan scroll roda mouse atau cubit layar untuk mendekat ke rak buku, meja, atau sudut tersembunyi.
              </p>
            </div>
          </div>

          {/* Item 3: Klik Objek */}
          <div className="rounded-2xl bg-stone-800/60 border border-stone-700/60 p-4 flex gap-3.5 items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-200">Klik & Kumpulkan Barang</h4>
              <p className="mt-1 text-xs text-stone-400 leading-relaxed">
                Periksa daftar barang target di bagian bawah. Saat menemukannya di dalam scene, klik objek untuk mengumpulkannya.
              </p>
            </div>
          </div>

          {/* Item 4: Peti & Laci */}
          <div className="rounded-2xl bg-stone-800/60 border border-stone-700/60 p-4 flex gap-3.5 items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <PackageOpen className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-200">Buka Peti & Laci Meja</h4>
              <p className="mt-1 text-xs text-stone-400 leading-relaxed">
                Beberapa barang penting tersimpan di dalam laci atau peti tertutup. Klik peti/laci terlebih dahulu untuk membukanya!
              </p>
            </div>
          </div>

          {/* Item 5: Senter */}
          <div className="rounded-2xl bg-stone-800/60 border border-stone-700/60 p-4 flex gap-3.5 items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Flashlight className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-200">Senter Detektif</h4>
              <p className="mt-1 text-xs text-stone-400 leading-relaxed">
                Aktifkan senter untuk menciptakan sorot cahaya dramatis yang mempermudah mendeteksi barang di balik bayangan gelap.
              </p>
            </div>
          </div>

          {/* Item 6: Petunjuk Sonar */}
          <div className="rounded-2xl bg-stone-800/60 border border-stone-700/60 p-4 flex gap-3.5 items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-200">Radar Petunjuk (Hint)</h4>
              <p className="mt-1 text-xs text-stone-400 leading-relaxed">
                Kesulitan menemukan suatu objek? Tekan tombol Hint untuk menyalakan sinyal radar berdenyut ke lokasi barang target.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-4 border-t border-stone-800 flex justify-end">
          <button
            id="btn-close-how-to-play"
            onClick={handleClose}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-6 py-3 text-sm font-bold text-stone-950 shadow-lg shadow-amber-500/25 transition-all active:scale-98 cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Saya Mengerti • Siap Memulai</span>
          </button>
        </div>
      </div>
    </div>
  );
};
