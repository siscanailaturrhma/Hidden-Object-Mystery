// Web Audio API Synthesizer for game sound effects & Ambient Mystery BGM

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public isMusicEnabled: boolean = true;
  private musicGainNode: GainNode | null = null;
  private isMusicRunning: boolean = false;
  private musicInterval: NodeJS.Timeout | null = null;
  private chimeTimeout: NodeJS.Timeout | null = null;
  private activeMusicOscillators: OscillatorNode[] = [];

  private initCtx(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // --- AMBIENT MYSTERY BACKGROUND MUSIC (PROCEDURAL LOOP) ---

  public startMusic() {
    if (this.isMusicRunning || !this.isMusicEnabled || this.isMuted) return;

    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      this.isMusicRunning = true;

      // Master gain for music
      const masterMusicGain = ctx.createGain();
      masterMusicGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      // Soft gentle volume that sits comfortably under sound effects
      masterMusicGain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 3.0);
      masterMusicGain.connect(ctx.destination);
      this.musicGainNode = masterMusicGain;

      // 1. Continuous Sub & Warm Pad Drone
      this.createAtmosphericDrone(ctx, masterMusicGain);

      // 2. Slow Ethereal Mystery Chord Progression Cycle (24-second loop)
      this.runChordProgressionCycle(ctx, masterMusicGain);
      this.musicInterval = setInterval(() => {
        if (this.isMusicRunning && this.ctx && this.musicGainNode) {
          this.runChordProgressionCycle(this.ctx, this.musicGainNode);
        }
      }, 24000);

      // 3. Delicate Clockwork Music-Box / Crystal Plucks
      this.scheduleRandomMysteryPluck(ctx, masterMusicGain);
    } catch {
      this.isMusicRunning = false;
    }
  }

  public stopMusic() {
    if (!this.isMusicRunning && !this.musicGainNode) return;
    this.isMusicRunning = false;

    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (this.chimeTimeout) {
      clearTimeout(this.chimeTimeout);
      this.chimeTimeout = null;
    }

    if (this.ctx && this.musicGainNode) {
      try {
        const currTime = this.ctx.currentTime;
        this.musicGainNode.gain.cancelScheduledValues(currTime);
        this.musicGainNode.gain.setValueAtTime(this.musicGainNode.gain.value, currTime);
        this.musicGainNode.gain.exponentialRampToValueAtTime(0.0001, currTime + 1.2);

        setTimeout(() => {
          this.activeMusicOscillators.forEach((osc) => {
            try {
              osc.stop();
              osc.disconnect();
            } catch {
              // Ignore stopped
            }
          });
          this.activeMusicOscillators = [];
          if (this.musicGainNode) {
            this.musicGainNode.disconnect();
            this.musicGainNode = null;
          }
        }, 1300);
      } catch {
        this.musicGainNode = null;
      }
    }
  }

  public toggleMusic(): boolean {
    if (this.isMusicRunning) {
      this.isMusicEnabled = false;
      this.stopMusic();
      return false;
    } else {
      this.isMusicEnabled = true;
      this.startMusic();
      return true;
    }
  }

  public getMusicStatus(): boolean {
    return this.isMusicRunning && this.isMusicEnabled && !this.isMuted;
  }

  // Create deep mysterious sub-drone with gentle undulating filter
  private createAtmosphericDrone(ctx: AudioContext, destination: GainNode) {
    // Low root tone (D2 ~ 73.4Hz & A1 ~ 55Hz)
    const droneOsc1 = ctx.createOscillator();
    const droneOsc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const droneGain = ctx.createGain();

    droneOsc1.type = 'sine';
    droneOsc1.frequency.setValueAtTime(73.42, ctx.currentTime); // D2

    droneOsc2.type = 'triangle';
    droneOsc2.frequency.setValueAtTime(110.0, ctx.currentTime); // A2 (fifth)

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);
    filter.Q.setValueAtTime(3.5, ctx.currentTime);

    // LFO to slowly sweep the lowpass filter like a slow heartbeat / atmospheric breath
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.06, ctx.currentTime); // one cycle every ~16 seconds
    lfoGain.gain.setValueAtTime(120, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    droneGain.gain.setValueAtTime(0.35, ctx.currentTime);

    droneOsc1.connect(filter);
    droneOsc2.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(destination);

    droneOsc1.start();
    droneOsc2.start();
    lfo.start();

    this.activeMusicOscillators.push(droneOsc1, droneOsc2, lfo);
  }

  // Plays 4 slow mysterious ambient chords (6 seconds each = 24s cycle)
  private runChordProgressionCycle(ctx: AudioContext, destination: GainNode) {
    // Dm9 -> Bbmaj7 -> Gm7 -> Asus4 (Classic cozy mystery progression)
    const chords = [
      [146.83, 174.61, 220.0, 261.63, 329.63], // D3, F3, A3, C4, E4 (Dm9)
      [116.54, 146.83, 174.61, 220.0, 261.63], // Bb2, D3, F3, A3, C4 (Bbmaj7)
      [98.0, 146.83, 174.61, 220.0, 293.66],  // G2, D3, F3, A3, D4 (Gm7/9)
      [110.0, 146.83, 164.81, 220.0, 293.66], // A2, D3, E3, A3, D4 (Asus4)
    ];

    chords.forEach((chordNotes, chordIndex) => {
      const startTime = ctx.currentTime + chordIndex * 6.0;
      const duration = 6.2; // slight overlap for seamless smooth crossfade

      chordNotes.forEach((freq, noteIdx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        const noteFilter = ctx.createBiquadFilter();

        osc.type = noteIdx % 2 === 0 ? 'sine' : 'triangle';
        // Gentle micro-detune for lush warmth
        osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 0.8, startTime);

        noteFilter.type = 'lowpass';
        noteFilter.frequency.setValueAtTime(650, startTime);

        // Slow soft swell (attack 2.0s, release 2.5s)
        noteGain.gain.setValueAtTime(0.0001, startTime);
        noteGain.gain.exponentialRampToValueAtTime(0.045, startTime + 2.0);
        noteGain.gain.setValueAtTime(0.045, startTime + duration - 2.5);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(noteFilter);
        noteFilter.connect(noteGain);
        noteGain.connect(destination);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.1);

        this.activeMusicOscillators.push(osc);
      });
    });
  }

  // Gentle clockwork bell / music-box plucks that play randomly in the background
  private scheduleRandomMysteryPluck(ctx: AudioContext, destination: GainNode) {
    if (!this.isMusicRunning) return;

    // High delicate notes from D minor pentatonic/dorian
    const scale = [587.33, 659.25, 698.46, 783.99, 880.0, 1046.5, 1174.66]; // D5, E5, F5, G5, A5, C6, D6
    const randomNote = scale[Math.floor(Math.random() * scale.length)];

    try {
      const startTime = ctx.currentTime + 0.1;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(randomNote, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.035, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.8); // Long resonant music box tail

      osc.connect(gain);
      gain.connect(destination);

      osc.start(startTime);
      osc.stop(startTime + 3.0);
    } catch {
      // Ignored
    }

    // Schedule next pluck between 2.5s and 5.0s
    const nextInterval = 2500 + Math.random() * 2500;
    this.chimeTimeout = setTimeout(() => {
      if (this.isMusicRunning && this.ctx && this.musicGainNode) {
        this.scheduleRandomMysteryPluck(this.ctx, this.musicGainNode);
      }
    }, nextInterval);
  }

  // --- SOUND EFFECTS ---

  // Play click / UI interaction
  playClick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Item successfully found (Crystal bell chime sequence)
  playFound() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.06);

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime + index * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + index * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + index * 0.06);
        osc.stop(this.ctx.currentTime + index * 0.06 + 0.35);
      });
    } catch {
      // Ignored
    }
  }

  // Open drawer/chest interactable sound
  playContainerOpen() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(240, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch {
      // Ignored
    }
  }

  // Hint radar / compass ping
  playHint() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch {
      // Ignored
    }
  }

  // Misclick or empty tap
  playMisclick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {
      // Ignored
    }
  }

  // Victory Fanfare
  playVictory() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [
        { f: 523.25, d: 0.12 }, // C
        { f: 659.25, d: 0.12 }, // E
        { f: 783.99, d: 0.12 }, // G
        { f: 1046.5, d: 0.35 }, // High C
      ];

      let accumulatedTime = 0;
      notes.forEach(({ f, d }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime + accumulatedTime);

        gain.gain.setValueAtTime(0.18, this.ctx.currentTime + accumulatedTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + accumulatedTime + d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + accumulatedTime);
        osc.stop(this.ctx.currentTime + accumulatedTime + d);

        accumulatedTime += d * 0.9;
      });
    } catch {
      // Ignored
    }
  }
}

export const sound = new SoundEffectsManager();
