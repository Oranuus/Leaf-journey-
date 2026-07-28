/**
 * Leaf Journey Menu Music Controller
 * * Features:
 * - 2 Loops of Clear Calm Music
 * - 2 Loops of Fuller Louder Instrument
 * - Layered Procedural Wind Ambience
 */

class MenuMusicController {
    constructor() {
        this.audioCtx = null;
        this.isPlaying = false;
        this.nextNoteTime = 0;
        this.currentNote = 0;
        this.loopCount = 0;
        this.windCleanup = [];
        
        // A-minor melancholy melody
        this.melody = [
            440, 0, 493.88, 523.25, 
            587.33, 0, 523.25, 493.88,
            440, 0, 392.00, 349.23,
            392.00, 0, 440, 440
        ];
    }

    init() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    createWind() {
        const bufferSize = 2 * this.audioCtx.sampleRate;
        const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

        const createLayer = (baseFreq, q, vol, lfoFreq, lfoDepth) => {
            const source = this.audioCtx.createBufferSource();
            source.buffer = noiseBuffer;
            source.loop = true;

            const filter = this.audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = baseFreq;
            filter.Q.value = q;

            const lfo = this.audioCtx.createOscillator();
            const lfoGain = this.audioCtx.createGain();
            lfo.frequency.value = lfoFreq;
            lfoGain.gain.value = lfoDepth;
            lfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);

            const gain = this.audioCtx.createGain();
            gain.gain.value = vol;

            source.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioCtx.destination);

            source.start();
            lfo.start();
            return { stop: () => { source.stop(); lfo.stop(); } };
        };

        const l1 = createLayer(400, 3, 0.18, 0.08, 250);
        const l2 = createLayer(800, 10, 0.06, 0.15, 400);
        return () => { l1.stop(); l2.stop(); };
    }

    playPluck(freq, time, isLouder) {
        if (freq === 0) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const filter = this.audioCtx.createBiquadFilter();

        osc.type = isLouder ? 'square' : 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        const targetVol = isLouder ? 0.35 : 0.20;
        const decayTime = isLouder ? 1.8 : 1.4;

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(targetVol, time + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, time + decayTime);

        filter.type = "lowpass";
        filter.frequency.value = isLouder ? 1600 : 1000;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(time);
        osc.stop(time + 2.0);
    }

    scheduler() {
        if (!this.isPlaying) return;
        while (this.nextNoteTime < this.audioCtx.currentTime + 0.1) {
            const isLouderMode = this.loopCount >= 2;
            this.playPluck(this.melody[this.currentNote], this.nextNoteTime, isLouderMode);

            this.nextNoteTime += 0.65;
            this.currentNote++;

            if (this.currentNote >= this.melody.length) {
                this.currentNote = 0;
                this.loopCount = (this.loopCount + 1) % 4;
            }
        }
        requestAnimationFrame(() => this.scheduler());
    }

    start() {
        this.init();
        if (this.isPlaying) return;
        
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        
        this.isPlaying = true;
        this.nextNoteTime = this.audioCtx.currentTime;
        this.currentNote = 0;
        this.loopCount = 0;
        this.windCleanup.push(this.createWind());
        this.scheduler();
    }

    stop() {
        this.isPlaying = false;
        if (this.windCleanup.length) {
            this.windCleanup.forEach(fn => fn());
            this.windCleanup = [];
        }
    }
}

// Global instance to be used by the game
window.menuMusic = new MenuMusicController();