function generateFrequencies(durationInMinutes) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const frequencies = [];
    const durationInSeconds = durationInMinutes * 60;
    const sampleRate = audioContext.sampleRate;
    const totalSamples = sampleRate * durationInSeconds;

    for (let i = 0; i < totalSamples; i++) {
        const frequency = Math.random() * (2000 - 20) + 20; // Random frequency between 20Hz and 2000Hz
        frequencies.push(frequency);
    }

    return frequencies;
}

export const globalAudioContext = new (window.AudioContext || window.webkitAudioContext)();

function generateRandomAudio(durationSeconds = 60, sampleRate = 44100) {
    const audioCtx = globalAudioContext;
    const frameCount = durationSeconds * sampleRate;
    const buffer = audioCtx.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);

    // Fill the buffer with random values between -1 and 1
    for (let i = 0; i < frameCount; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    // Return buffer for playback
    return buffer;
}

function bufferToWav(buffer, sampleRate) {
    // Mono only
    const numChannels = 1;
    const numSamples = buffer.length;
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = numSamples * bytesPerSample;

    const bufferLength = 44 + dataSize;
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    // RIFF identifier 'RIFF'
    view.setUint32(0, 0x52494646, false);
    // file length minus RIFF identifier and length field (4 + 4)
    view.setUint32(4, 36 + dataSize, true);
    // RIFF type 'WAVE'
    view.setUint32(8, 0x57415645, false);
    // format chunk identifier 'fmt '
    view.setUint32(12, 0x666d7420, false);
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, 1, true);
    // channel count
    view.setUint16(22, numChannels, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, byteRate, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, blockAlign, true);
    // bits per sample
    view.setUint16(34, bytesPerSample * 8, true);
    // data chunk identifier 'data'
    view.setUint32(36, 0x64617461, false);
    // data chunk length
    view.setUint32(40, dataSize, true);

    // Write PCM samples
    let offset = 44;
    for (let i = 0; i < numSamples; i++, offset += 2) {
        // Clamp and convert float [-1,1] to 16-bit PCM
        let s = Math.max(-1, Math.min(1, buffer[i]));
        s = s < 0 ? s * 0x8000 : s * 0x7FFF;
        view.setInt16(offset, s, true);
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function downloadRandomAudioWav(durationSeconds = 60, sampleRate = 44100) {
    const frameCount = durationSeconds * sampleRate;
    const data = new Float32Array(frameCount);
    for (let i = 0; i < frameCount; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    const wavBlob = bufferToWav(data, sampleRate);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'random_audio.wav';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

const SCALES = {
    major:    [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25], // C D E F G A B C
    minor:    [261.63, 293.66, 311.13, 349.23, 392.00, 415.30, 493.88, 523.25], // C D Eb F G Ab B C
    pentatonic: [261.63, 293.66, 311.13, 392.00, 415.30, 523.25], // C D Eb G Ab C
};

function noteToFrequency(note) {
    // C4 = 261.63 Hz, D4 = 293.66 Hz, E4 = 329.63 Hz, F4 = 349.23 Hz, G4 = 392.00 Hz, A4 = 440.00 Hz, B4 = 493.88 Hz, C5 = 523.25 Hz
    const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
    return notes[note];
}

function noteToFrequencyScale(note, scale) {
    const notes = SCALES[scale] || SCALES.major;
    return notes[note % notes.length];
}

function generateRandomMelodyBuffer(numNotes = 16, noteDuration = 0.375, sampleRate = 44100) {
    // 16 notes, each 0.375s = 6s total
    const totalDuration = numNotes * noteDuration;
    const frameCount = Math.floor(totalDuration * sampleRate);
    const buffer = new Float32Array(frameCount);
    for (let n = 0; n < numNotes; n++) {
        const note = Math.floor(Math.random() * 8); // 0-7
        const freq = noteToFrequency(note);
        const start = Math.floor(n * noteDuration * sampleRate);
        const end = Math.floor((n + 1) * noteDuration * sampleRate);
        for (let i = start; i < end && i < buffer.length; i++) {
            // Sinusgolf, fade in/out voor klikvrij geluid
            let t = (i - start) / sampleRate;
            let amplitude = 0.8;
            // Fade in/out (10ms)
            const fadeSamples = Math.floor(0.01 * sampleRate);
            if (i - start < fadeSamples) amplitude *= (i - start) / fadeSamples;
            if (end - i < fadeSamples) amplitude *= (end - i) / fadeSamples;
            buffer[i] += amplitude * Math.sin(2 * Math.PI * freq * t);
        }
    }
    return buffer;
}

function generateRandomMelodyBufferV2({
    numNotes = 16,
    bpm = 120,
    scale = 'major',
    sampleRate = 44100
} = {}) {
    // nootduur in seconden: 60 / bpm
    const noteDuration = 60 / bpm;
    const totalDuration = numNotes * noteDuration;
    const frameCount = Math.floor(totalDuration * sampleRate);
    const buffer = new Float32Array(frameCount);
    const notes = SCALES[scale] || SCALES.major;
    for (let n = 0; n < numNotes; n++) {
        const note = Math.floor(Math.random() * notes.length);
        const freq = noteToFrequencyScale(note, scale);
        const start = Math.floor(n * noteDuration * sampleRate);
        const end = Math.floor((n + 1) * noteDuration * sampleRate);
        for (let i = start; i < end && i < buffer.length; i++) {
            let t = (i - start) / sampleRate;
            let amplitude = 0.8;
            const fadeSamples = Math.floor(0.01 * sampleRate);
            if (i - start < fadeSamples) amplitude *= (i - start) / fadeSamples;
            if (end - i < fadeSamples) amplitude *= (end - i) / fadeSamples;
            buffer[i] += amplitude * Math.sin(2 * Math.PI * freq * t);
        }
    }
    return buffer;
}

function downloadRandomMelodyWav({
    numNotes = 16,
    bpm = 120,
    scale = 'major',
    sampleRate = 44100
} = {}) {
    const buffer = generateRandomMelodyBufferV2({ numNotes, bpm, scale, sampleRate });
    const wavBlob = bufferToWav(buffer, sampleRate);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `random_melody_${scale}_${bpm}bpm.wav`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

export { generateFrequencies, generateRandomAudio, downloadRandomAudioWav, downloadRandomMelodyWav };