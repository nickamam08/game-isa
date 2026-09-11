/**
 * audio.js - Sintetizador de audio procedural con Web Audio API y respuesta háptica
 * 100% autónomo: no requiere archivos mp3 externos, garantizando carga instantánea y cero fallos.
 */

class SoundSystem {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.bgmPlaying = false;
        this.bgmInterval = null;
        this.masterVolume = 0.25;
        this.hapticEnabled = true;

        // Escalas pentatónicas mágicas para melodía ambiental
        this.notes = {
            C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
            C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.00,
            B5: 987.77, C6: 1046.50, E6: 1318.51, G6: 1567.98
        };
        
        this.chords = [
            [this.notes.C4, this.notes.E4, this.notes.G4, this.notes.C5],
            [this.notes.A4, this.notes.C5, this.notes.E5, this.notes.A5],
            [this.notes.D4, this.notes.G4, this.notes.B4, this.notes.D5],
            [this.notes.C4, this.notes.G4, this.notes.C5, this.notes.E5]
        ];
        this.currentChordIndex = 0;
        this.noteIndex = 0;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    haptic(pattern = [30]) {
        if (this.hapticEnabled && navigator.vibrate) {
            try {
                navigator.vibrate(pattern);
            } catch (e) {}
        }
    }

    // Sonido de Salto Normal
    playJump() {
        if (this.muted || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.16);

        gain.gain.setValueAtTime(this.masterVolume * 0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);

        this.haptic(15);
    }

    // Sonido de Resorte
    playSpring() {
        if (this.muted || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(700, now + 0.12);
        osc.frequency.exponentialRampToValueAtTime(350, now + 0.3);

        gain.gain.setValueAtTime(this.masterVolume * 0.65, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);

        this.haptic([30, 20, 40]);
    }

    // Sonido de Daño / Pérdida de Corazón
    playHurt() {
        if (this.muted || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.2);

        gain.gain.setValueAtTime(this.masterVolume * 0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.26);

        this.haptic([80, 50, 100]);
    }

    // Sonido de Trueno
    playThunder() {
        if (this.muted || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);

        gain.gain.setValueAtTime(this.masterVolume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.42);
    }

    // Campana de Boxeo para la Cinemática (¡DING DING DING!)
    playBoxingBell() {
        if (this.muted || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const bellTones = [1200, 1800, 2400];

        [0, 0.2, 0.4].forEach(offset => {
            bellTones.forEach(freq => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const t = now + offset;

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, t);

                gain.gain.setValueAtTime(this.masterVolume * 0.4, t);
                gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(t);
                osc.stop(t + 0.5);
            });
        });

        this.haptic([50, 30, 50, 30, 80]);
    }

    // Sonido de Golpe de Impacto Épico (Súper Punch)
    playPunchImpact() {
        if (this.muted || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;

        // Golpe bajo resonante
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

        gain.gain.setValueAtTime(this.masterVolume * 0.85, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.45);

        this.haptic([120, 60, 160]);
    }

    // Recolección de Belleza
    playBeautyCollect() {
        if (this.muted || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const freqs = [this.notes.E5, this.notes.G5, this.notes.B5, this.notes.E6];

        freqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + (idx * 0.045);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.4, startTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.32);
        });

        this.haptic([25, 30, 25]);
    }

    // Recolección de Inteligencia
    playIntelCollect() {
        if (this.muted || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const freqs = [this.notes.C5, this.notes.E5, this.notes.A5, this.notes.C6];

        freqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + (idx * 0.035);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.45, startTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.36);
        });

        this.haptic([30, 20, 50]);
    }

    // Cohete
    playRocket() {
        if (this.muted || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(1000, now + 0.9);

        gain.gain.setValueAtTime(this.masterVolume * 0.25, now);
        gain.gain.linearRampToValueAtTime(this.masterVolume * 0.55, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 1.05);

        this.haptic([60, 40, 80, 40, 100]);
    }

    // Superación de Nivel
    playLevelUp() {
        if (this.muted || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const freqs = [this.notes.C5, this.notes.E5, this.notes.G5, this.notes.B5, this.notes.C6];

        freqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + (idx * 0.07);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(this.masterVolume * 0.5, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.45);
        });

        this.haptic([50, 40, 80, 40, 150]);
    }

    // Fanfarria de Victoria Final (Celebración del Cerdo Campeón)
    playWinFanfare() {
        if (this.muted || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;

        const chords = [
            { freqs: [this.notes.C5, this.notes.E5, this.notes.G5], dur: 0.25 },
            { freqs: [this.notes.D5, this.notes.G5, this.notes.B5], dur: 0.25 },
            { freqs: [this.notes.E5, this.notes.G5, this.notes.C6], dur: 0.35 },
            { freqs: [this.notes.C5, this.notes.E5, this.notes.G5, this.notes.C6, this.notes.E6], dur: 1.4 }
        ];

        let offset = 0;
        chords.forEach(chord => {
            const t = now + offset;
            chord.freqs.forEach(freq => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, t);

                gain.gain.setValueAtTime(this.masterVolume * 0.45, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + chord.dur);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(t);
                osc.stop(t + chord.dur + 0.05);
            });
            offset += chord.dur * 0.9;
        });

        this.haptic([100, 50, 100, 50, 200, 100, 300]);
    }

    // BGM
    startBGM() {
        if (this.bgmPlaying) return;
        this.bgmPlaying = true;
        this.init();

        const stepTime = 360;
        this.bgmInterval = setInterval(() => {
            if (this.muted || !this.ctx || !this.bgmPlaying) return;
            
            const currentChord = this.chords[this.currentChordIndex];
            const freq = currentChord[this.noteIndex % currentChord.length];
            const now = this.ctx.currentTime;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.14, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.55);

            this.noteIndex++;
            if (this.noteIndex % 8 === 0) {
                this.currentChordIndex = (this.currentChordIndex + 1) % this.chords.length;
            }
        }, stepTime);
    }

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }
}

window.sound = new SoundSystem();
