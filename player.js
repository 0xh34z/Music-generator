class Player {
    constructor(audioContext) {
        this.audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
        this.isPlaying = false;
        this.currentSource = null;
    }

    async play(frequencies) {
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        if (this.isPlaying) {
            this.stop();
        }

        this.currentSource = this.audioContext.createBufferSource();
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 3 * 60, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const frequency = frequencies[i % frequencies.length];
            data[i] = Math.sin(2 * Math.PI * frequency * (i / this.audioContext.sampleRate));
        }

        this.currentSource.buffer = buffer;
        this.currentSource.connect(this.gainNode);
        this.currentSource.start(0);
        this.isPlaying = true;
    }

    async playBuffer(buffer) {
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        if (this.isPlaying) {
            this.stop();
        }
        this.currentSource = this.audioContext.createBufferSource();
        this.currentSource.buffer = buffer;
        this.currentSource.connect(this.gainNode);
        this.currentSource.start(0);
        this.isPlaying = true;
        this.currentSource.onended = () => {
            this.isPlaying = false;
        };
    }

    async pause() {
        if (this.audioContext.state === 'running') {
            await this.audioContext.suspend();
        } else if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    stop() {
        if (this.isPlaying && this.currentSource) {
            this.currentSource.stop();
            this.isPlaying = false;
        }
    }

    setVolume(value) {
        this.gainNode.gain.value = value;
    }
}

export default Player;

// Zorg dat deze functies bestaan en exporteer ze als named exports
export function playAudio() {
    // ...implementatie voor afspelen...
}

export function pauseAudio() {
    // ...implementatie voor pauzeren...
}

export function stopAudio() {
    // ...implementatie voor stoppen...
}