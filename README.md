# Music Generator

Dit project bevat een eenvoudige muziek-generator en speler, geschreven in JavaScript en PHP.

## Info
- 60 seconden per generatie: elke muziekstuk duurt 1 minuut.
- 44.100 Hz sample rate: 44.100 samples per seconde.
- 32-bit float samples: hoge precisie tijdens generatie en afspelen.
Bij export naar WAV wordt 16-bit PCM gebruikt.

## Bestanden

- `app.js` — Hoofd JavaScript-bestand voor de applicatie
- `generator.js` — Genereert muziek of melodieën
- `player.js` — Speelt gegenereerde muziek af
- `counter.php` / `counter.txt` — Houdt een teller bij (mogelijk voor bezoekers of generaties)
- `melody_counter.php` / `melody_counter.txt` — Houdt een teller bij voor melodieën
- `index.php` — Startpunt van de webapplicatie

## Installatie

1. Clone deze repository:
   ```
   git clone https://github.com/0xh34z/Music-generator.git
   ```
2. Zorg dat je een webserver met PHP hebt (zoals XAMPP, WAMP, of MAMP).
3. Plaats de bestanden in de webserver rootmap.
4. Open `index.php` in je browser.

## Gebruik

- Genereer muziek via de webinterface of navigeer naar mijn website: [https://h34z.tech/Audio](https://h34z.tech/Audio)
- Speel de gegenereerde muziek direct af.

## Licentie

Dit project is open source.
