import React, { useState } from 'react';
import {
  X,
  Compass,
  Layers,
  Gamepad2,
  Sparkles,
  CheckCircle2,
  Cpu,
  Smartphone,
  Puzzle,
  Lightbulb,
} from 'lucide-react';

interface GameDesignModalProps {
  onClose: () => void;
}

export const GameDesignModal: React.FC<GameDesignModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'concept' | 'mechanics' | 'tech' | 'roadmap'>('concept');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-3xl bg-stone-900 border border-amber-500/40 text-stone-100 shadow-2xl overflow-hidden">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-stone-800 p-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-100">
                Game Design Document (GDD) & Konsep
              </h2>
              <p className="text-xs text-amber-400/90">
                Dokumen Perancangan & Mekanika: 3D Hidden Object Mystery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-stone-800 bg-stone-950/40 px-4 sm:px-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('concept')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'concept'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Lightbulb className="h-4 w-4" />
            <span>1. Konsep & Visi</span>
          </button>
          <button
            onClick={() => setActiveTab('mechanics')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'mechanics'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Gamepad2 className="h-4 w-4" />
            <span>2. Mekanisme Gameplay</span>
          </button>
          <button
            onClick={() => setActiveTab('tech')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'tech'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Cpu className="h-4 w-4" />
            <span>3. Pipeline & Arsitektur</span>
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'roadmap'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>4. Rencana Ekspansi</span>
          </button>
        </div>

        {/* TAB CONTENT (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-xs sm:text-sm leading-relaxed text-stone-300 space-y-4">
          {activeTab === 'concept' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="rounded-2xl bg-amber-950/30 border border-amber-500/30 p-4">
                <h3 className="text-sm font-bold text-amber-300 mb-1">
                  Visi Utama: Mengubah Genre Hidden Object dari 2D Flat Menjadi 3D Cozy Diorama
                </h3>
                <p className="text-stone-300 text-xs sm:text-sm">
                  Game hidden object 2D tradisional umumnya mengandalkan gambar lukisan statis
                  yang rawan pixel-hunting menjemukan. Dalam versi <strong>3D Diorama</strong> ini,
                  pemain menjadi pengamat aktif yang bebas memutar sudut ruangan 360°, mengintip
                  celah di balik rak buku, dan membuka kompartemen fisik layaknya menyentuh miniatur
                  kotak musik mekanikal.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-2xl bg-stone-800/60 border border-stone-700/60 p-3.5">
                  <h4 className="font-semibold text-stone-100 flex items-center gap-2 mb-1.5">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    Target Audiens & Mood
                  </h4>
                  <ul className="space-y-1 text-xs text-stone-300">
                    <li>• Penggemar game *cozy puzzle* (mirip <em>Tiny Lands</em>, <em>Cats in Time</em>, <em>Assemble with Care</em>).</li>
                    <li>• Pemain santai yang ingin relaksasi visual tanpa stres batas waktu yang mencekam.</li>
                    <li>• Penggemar misteri detektif dan estetika vintage/nostalgia.</li>
                  </ul>
                </div>

                <div className="rounded-2xl bg-stone-800/60 border border-stone-700/60 p-3.5">
                  <h4 className="font-semibold text-stone-100 flex items-center gap-2 mb-1.5">
                    <Smartphone className="h-4 w-4 text-emerald-400" />
                    Sensasi Taktil & Kontrol
                  </h4>
                  <ul className="space-y-1 text-xs text-stone-300">
                    <li>• Kontrol gestur sentuh / mouse drag yang responsif untuk mengorbit ruangan.</li>
                    <li>• Pinch / scroll halus untuk zoom in melihat detail barang kecil.</li>
                    <li>• Umpan balik audio sintetis (gemerincing lonceng kristal & desiran kayu).</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mechanics' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-2xl bg-stone-800/60 border border-stone-700/60 p-4">
                  <h4 className="font-bold text-amber-300 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400" />
                    1. 360° Orbit & Parallax Inspection
                  </h4>
                  <p className="text-xs text-stone-300">
                    Barang tidak hanya disembunyikan dengan kamuflase warna, melainkan secara
                    geometri berada di belakang perabot. Pemain wajib memutar sudut pandang
                    kamera (orbiting) untuk menemukan sudut pandang yang tepat.
                  </p>
                </div>

                <div className="rounded-2xl bg-stone-800/60 border border-stone-700/60 p-4">
                  <h4 className="font-bold text-amber-300 mb-2 flex items-center gap-2">
                    <Puzzle className="h-4 w-4 text-emerald-400" />
                    2. Kontainer Interaktif (Nested Items)
                  </h4>
                  <p className="text-xs text-stone-300">
                    Sebagian barang tersimpan di dalam objek lain (seperti <em>Kunci Antik</em>
                    di dalam Laci Meja Kerja, atau <em>Cincin Zamrud</em> di dalam Peti Harta Karun).
                    Pemain harus mengklik kontainer untuk membukanya terlebih dahulu.
                  </p>
                </div>

                <div className="rounded-2xl bg-stone-800/60 border border-stone-700/60 p-4">
                  <h4 className="font-bold text-amber-300 mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-sky-400" />
                    3. Sistem Petunjuk (Detective Clues & Beacon)
                  </h4>
                  <p className="text-xs text-stone-300">
                    Setiap barang memiliki teka-teki petunjuk naratif. Jika pemain kesulitan,
                    tombol <em>Petunjuk</em> memancarkan gelombang pulsar 3D yang mengarahkan
                    kamera ke lokasi barang terdekat.
                  </p>
                </div>

                <div className="rounded-2xl bg-stone-800/60 border border-stone-700/60 p-4">
                  <h4 className="font-bold text-amber-300 mb-2 flex items-center gap-2">
                    <Gamepad2 className="h-4 w-4 text-purple-400" />
                    4. Mode Permainan Fleksibel
                  </h4>
                  <p className="text-xs text-stone-300">
                    <strong>Mode Santai</strong> untuk eksplorasi tanpa batas waktu, atau
                    <strong>Mode Detektif Cepat (Timed)</strong> dengan countdown dan combo
                    skor bagi pemain kompetitif.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tech' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="rounded-2xl bg-stone-800/60 border border-stone-700/60 p-4">
                <h4 className="font-bold text-amber-300 mb-2">Arsitektur Prototipe Saat Ini</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-700/50">
                    <strong className="text-stone-100 block mb-1">Renderer 3D:</strong>
                    Three.js dengan ACES Filmic tone mapping, PCF Soft Shadows, dan Fog atmosferik.
                  </div>
                  <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-700/50">
                    <strong className="text-stone-100 block mb-1">Interaksi:</strong>
                    Raycaster presisi 3D dengan hover tooltip, bounding proxies, dan animasi rotasi lerp.
                  </div>
                  <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-700/50">
                    <strong className="text-stone-100 block mb-1">Audio Engine:</strong>
                    Web Audio API Procedural Synthesizer (tanpa unduhan file audio eksternal, latensi nol).
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-stone-800/60 border border-stone-700/60 p-4">
                <h4 className="font-bold text-stone-200 mb-2">Pipeline Aset untuk Versi Komersil</h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Untuk rilis penuh di Steam/Mobile, aset 3D dapat dibuat menggunakan
                  <strong> Blender</strong> dengan format <code>.gltf</code> / <code>.glb</code>
                  bertekstur Stylized Hand-painted PBR (Substance 3D Painter) dengan ukuran
                  file ultra-ringan (di bawah 15MB per ruangan).
                </p>
              </div>
            </div>
          )}

          {activeTab === 'roadmap' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="rounded-2xl bg-stone-800/60 border border-stone-700/60 p-4">
                <h4 className="font-bold text-amber-300 mb-2">Fitur-Fitur Rencana Rilis Berikutnya</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold">1</span>
                    <div>
                      <strong className="text-stone-100">Mini-Puzzle Mekanikal:</strong> Memutar gear jam kuno, memutar dial brankas dengan kode angka rahasia untuk membuka pintu brankas.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold">2</span>
                    <div>
                      <strong className="text-stone-100">Inventory & Item Combination:</strong> Menemukan baterai dan senter secara terpisah, lalu menggabungkannya untuk menerangi ruangan gelap gulita.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold">3</span>
                    <div>
                      <strong className="text-stone-100">Mode Siang & Malam (Day/Night Atmosphere):</strong> Ruangan yang sama memiliki pencahayaan sore hari yang hangat vs tengah malam yang misterius dengan bayangan dramatis.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold">4</span>
                    <div>
                      <strong className="text-stone-100">Room Level Editor:</strong> Fitur bagi komunitas untuk mendesain diorama dan menyembunyikan barang untuk dimainkan oleh pemain lain.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t border-stone-800 p-4 sm:px-6 bg-stone-950/60 flex items-center justify-between">
          <span className="text-xs text-stone-400">
            Prototipe interaktif siap dimainkan langsung di layar utama.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md active:scale-95 transition-all"
          >
            Tutup & Mainkan Game
          </button>
        </div>
      </div>
    </div>
  );
};
