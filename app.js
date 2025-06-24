// This file initializes the music generator and sets up event listeners for user interactions.

import { generateFrequencies, generateRandomAudio, globalAudioContext } from './generator.js';
import Player from './player.js';

const player = new Player(globalAudioContext);
player.setVolume(0.5);
let generatedBuffer = null;

const generateButton = document.getElementById('generate');
const pauseButton = document.getElementById('pause');
const volumeSlider = document.getElementById('volume');

// Generate and play music
if (generateButton) {
    generateButton.addEventListener('click', () => {
        // Genereer een random buffer en speel direct af
        const buffer = generateRandomAudio();
        generatedBuffer = buffer;
        player.playBuffer(buffer);
    });
}

// Pauzeer muziek
if (pauseButton) {
    pauseButton.addEventListener('click', () => {
        player.pause();
    });
}

// Volume control
if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
        player.setVolume(e.target.value);
    });
}