class WindSoundGenerator {
    constructor() {
        this.audioCtx = null;
        this.stopWind = null;
    }

    init() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    start() {
        this.init();
        
        // Resume context if suspended (required by browsers)
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        // Create White Noise Buffer
        const bufferSize = 2 * this.audioCtx.sampleRate;
        const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const createLayer = (baseFreq, q, vol, lfoFreq, lfoDepth) => {
            const source = this.audioCtx.createBufferSource();
            source.buffer = noiseBuffer;
            source.loop = true;

            const filter = this.audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = baseFreq;
            filter.Q.value = q;

            // LFO for "windy" fluctuation
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
            return { 
                stop: () => { 
                    try { source.stop(); } catch(e){}
                    try { lfo.stop(); } catch(e){}
                } 
            };
        };

        // Create layers
        const l1 = createLayer(400, 3, 0.18, 0.08, 250);
        const l2 = createLayer(800, 10, 0.06, 0.15, 400);

        this.stopWind = () => { 
            l1.stop(); 
            l2.stop(); 
        };
    }

    stop() {
        if (this.stopWind) {
            this.stopWind();
            this.stopWind = null;
        }
    }
}

// --- CRITICAL CHANGE HERE ---
// We attach it to "window.airMusic" so the main HTML file can find it.
window.airMusic = new WindSoundGenerator();