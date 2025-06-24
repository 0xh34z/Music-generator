<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Music Generator</title>
    <link rel='stylesheet' type='text/css' media='screen' href='../main.css'>
</head>
<body>
    <?php include '../navbar.php'; ?>
    <h1>Random Music Generator</h1>
    
    <div class="main-flex-row">
        <div class="info-block" style="max-width: 420px; min-width: 320px; margin: 2em 1.5em; background: var(--panel-bg); border-radius: 16px; box-shadow: 0 2px 12px 0 rgba(76,195,247,0.10); border: 1.5px solid var(--border); padding: 1.5em 2em; text-align: center; color: var(--text-main);">
            <h2 style="color: var(--accent); margin-bottom: 0.7em;">Info over audio generatie</h2>
            <ul style="list-style: none; padding: 0; margin: 0 0 1em 0;">
                <li><b>60 seconden</b> per generatie: elke muziekstuk duurt 1 minuut.</li>
                <li><b>44.100 Hz</b> sample rate: 44.100 samples per seconde.</li>
                <li><b>32-bit float</b> samples: hoge precisie tijdens generatie en afspelen.</li>
                <li>Bij export naar WAV wordt <b>16-bit PCM</b> gebruikt.</li>
            </ul>
            <div style="font-size: 0.98em; color: var(--text-muted);">Deze instellingen gelden voor alle muziek- en melodiegeneraties hieronder.</div>
        </div>
        <div class="controls-flex-row">
            <div class="music-controls">
                <p style="color: var(--accent); margin-bottom: 0.7em;">Generate a random piece of music.</p>
                <input type="number" style="display:none">
                <button id="generate">Generate Music</button>
                <button id="pause">Pause/Play</button>
                <label for="volume" style="color: #4cc3f7;">Volume:</label>
                <input type="range" id="volume" min="0" max="1" step="0.01" value="0.5" style="width: 60%">
                <button id="download">Download</button>
                <span id="counter">0</span>
                <div id="music-theoretical">/ <b>65536^2.646.000</b></div>
            </div>
</div>
            <div class="melody-controls">
                <p style="color: var(--accent); margin-bottom: 0.7em;">Generate a random melody.</p>
                <label for="scale">Toonladder:</label>
                <select id="scale">
                    <option value="major">Majeur</option>
                    <option value="minor">Mineur</option>
                    <option value="pentatonic">Pentatonisch</option>
                </select>
                <label for="bpm">BPM:</label>
                <input type="number" id="bpm" value="120" min="40" max="240" step="1">
                <button id="generate-melody">Genereer Melodie</button>
                <span id="melody-counter">0</span><b>/ 16777216</b>
            </div>
        
    </div>

    <script type="module" src="app.js"></script>
    <script type="module" src="generator.js"></script>
    <script type="module">
        import { downloadRandomAudioWav, downloadRandomMelodyWav } from './generator.js';

        // Fetch and display the current count on page load
        function updateCounterDisplay() {
            fetch('counter.php')
                .then(res => res.json())
                .then(data => {
                    document.getElementById('counter').textContent = data.count;
                });
            fetch('melody_counter.php')
                .then(res => res.json())
                .then(data => {
                    document.getElementById('melody-counter').textContent = data.count;
                });
        }
        updateCounterDisplay();

        const generateBtn = document.getElementById('generate');
        generateBtn.addEventListener('click', () => {
            fetch('counter.php', { method: 'POST' })
                .then(res => res.json())
                .then(data => {
                    document.getElementById('counter').textContent = data.count;
                });
        });

        document.getElementById('download').addEventListener('click', () => {
            downloadRandomAudioWav();
        });

        document.getElementById('generate-melody').addEventListener('click', () => {
            const scale = document.getElementById('scale').value;
            const bpm = parseInt(document.getElementById('bpm').value, 10);
            // Inputvalidatie
            if (isNaN(bpm) || bpm < 40 || bpm > 240) {
                alert('BPM moet tussen 40 en 240 liggen.');
                return;
            }
            // numNotes kan via prompt of extra input, maar standaard 16
            let numNotes = 16;
            if (window.prompt) {
                const userNumNotes = prompt('Aantal noten (1-64, standaard 16):', '16');
                if (userNumNotes !== null) {
                    numNotes = parseInt(userNumNotes, 10);
                    if (isNaN(numNotes) || numNotes < 1 || numNotes > 64) {
                        alert('Aantal noten moet tussen 1 en 64 liggen.');
                        return;
                    }
                }
            }
            downloadRandomMelodyWav({ scale, bpm, numNotes });
            fetch('melody_counter.php', { method: 'POST' })
                .then(res => res.json())
                .then(data => {
                    document.getElementById('melody-counter').textContent = data.count;
                });
        });
    </script>
</body>
</html>