// ─── CONFIGURATION ────────────────────────────────────────────────────────────

// Change this to update the displayed phrase.
const PHRASE = 'Stay Tooned GFX';

// Scale intensity —————————————————————————————————————————————————————————————
// SCALE_MAX:  how big the hovered character gets  (try 1.3 – 2.0)
// FALLOFF:    how fast scaling drops with distance (try 0.8 – 3.0)
//             higher = tighter spotlight; lower = wider wave
const SCALE_MAX = 1.55;
const FALLOFF   = 1.1;

// Magnetic mode ———————————————————————————————————————————————————————————————
// false → per-character hover (default, feels tactile)
// true  → cursor tracks across the whole phrase at once (feels fluid)
// Toggled at runtime by the Magnetic button; this is just the starting state.
const MAGNETIC_MODE_DEFAULT = false;

// Pitches (Hz) — pentatonic scale, cycles through per character ———————————————
// Change or extend this array to alter the sonic palette.
const NOTES = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66];

// Word colors — pulled from the SVG logo (red / blue / yellow / green) ————————
// Index 0 = first word, 1 = second word, etc.
// Cycles automatically for phrases with more than 4 words.
const WORD_PALETTE = ['#f60047', '#48a6ff', '#ffca23', '#8fe900'];


// ─── STATE ────────────────────────────────────────────────────────────────────
let soundEnabled  = false;
let magneticActive = MAGNETIC_MODE_DEFAULT;
let audioCtx      = null;
let lastClosest   = -1;   // tracks closest char in magnetic mode to avoid repeat tones


// ─── HELPERS ──────────────────────────────────────────────────────────────────

// Convert a #rrggbb hex color to rgba() string for use in CSS drop-shadow
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}


// ─── BUILD THE PHRASE ─────────────────────────────────────────────────────────
const container = document.getElementById('phrase');
const chars     = [];   // all span elements in order

let noteIdx = 0;
let wordIdx = 0;        // which word we're currently in

[...PHRASE].forEach((ch) => {
  const span = document.createElement('span');
  span.textContent = ch;
  span.setAttribute('aria-hidden', 'true');   // container aria-label covers the phrase

  if (ch === ' ') {
    span.className = 'char space';
    wordIdx++;  // advance to next word color on each space
  } else {
    span.className = 'char';
    span.setAttribute('tabindex', '0');

    // Assign word color + matching glow variable
    const color = WORD_PALETTE[wordIdx % WORD_PALETTE.length];
    span.style.color = color;
    span.style.setProperty('--char-glow', hexToRgba(color, 0.65));

    // Store pitch for this character
    span.dataset.note = NOTES[noteIdx % NOTES.length];
    noteIdx++;
  }

  chars.push(span);
  container.appendChild(span);
});


// ─── SCALE MATH ───────────────────────────────────────────────────────────────
//
// Smooth exponential falloff:
//   scale = 1 + (SCALE_MAX - 1) × e^(−FALLOFF × distance)
//
// distance 0 → SCALE_MAX (hovered char)
// distance 1 → noticeably smaller
// distance 2+ → nearly back to 1
//
function getScale(distance) {
  return 1 + (SCALE_MAX - 1) * Math.exp(-FALLOFF * distance);
}

function applyScales(hoveredIndex) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  chars.forEach((span, i) => {
    if (span.classList.contains('space')) return;

    const dist  = Math.abs(i - hoveredIndex);
    const scale = reduced ? 1 : getScale(dist);

    span.style.transform = `scale(${scale.toFixed(3)})`;
    span.classList.toggle('is-active', i === hoveredIndex);
  });
}

function resetScales() {
  chars.forEach(span => {
    if (span.classList.contains('space')) return;
    span.style.transform = 'scale(1)';
    span.classList.remove('is-active');
  });
  lastClosest = -1;
}


// ─── SOUND ────────────────────────────────────────────────────────────────────
//
// Short bell-like tone using a triangle oscillator + fast attack / slow decay.
// Web Audio API only — no audio files.
//
function ensureAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Browsers suspend AudioContext until a user gesture; resume here.
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playTone(freq) {
  if (!soundEnabled) return;
  ensureAudioCtx();

  const now  = audioCtx.currentTime;
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.type = 'triangle';   // softer than sine for a bell-like quality
  osc.frequency.setValueAtTime(freq, now);
  // Slight pitch droop for a "struck" feel
  osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 0.35);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.15, now + 0.008);   // snap attack
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);    // bell decay

  osc.start(now);
  osc.stop(now + 0.45);
}


// ─── MAGNETIC MODE — find closest char to cursor X ────────────────────────────
function findClosest(clientX) {
  let closest = 0;
  let minDist = Infinity;
  chars.forEach((span, i) => {
    if (span.classList.contains('space')) return;
    const rect = span.getBoundingClientRect();
    const cx   = rect.left + rect.width / 2;
    const dist = Math.abs(clientX - cx);
    if (dist < minDist) { minDist = dist; closest = i; }
  });
  return closest;
}


// ─── EVENTS ───────────────────────────────────────────────────────────────────

// Per-character hover (char mode)
chars.forEach((span, i) => {
  if (span.classList.contains('space')) return;

  span.addEventListener('mouseenter', () => {
    if (magneticActive) return;   // magnetic mode handles its own scaling
    applyScales(i);
    playTone(Number(span.dataset.note));
  });

  // Keyboard: same effect as hover
  span.addEventListener('focus', () => {
    applyScales(i);
    playTone(Number(span.dataset.note));
  });
  span.addEventListener('blur', () => {
    // Only reset if no other char in the phrase has focus
    if (!chars.some(s => s === document.activeElement)) resetScales();
  });
});

// Container events — shared by both modes
container.addEventListener('mousemove', (e) => {
  if (!magneticActive) return;
  const c = findClosest(e.clientX);
  applyScales(c);
  // Play tone only when the closest char changes (not on every pixel move)
  if (c !== lastClosest) {
    playTone(Number(chars[c].dataset.note));
    lastClosest = c;
  }
});

container.addEventListener('mouseleave', () => {
  resetScales();
});


// ─── CONTROLS ─────────────────────────────────────────────────────────────────

const btnSound = document.getElementById('btn-sound');
const btnMode  = document.getElementById('btn-mode');

btnSound.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  btnSound.textContent = soundEnabled ? '🔔 Sound' : '🔇 Sound';
  btnSound.setAttribute('aria-label',   soundEnabled ? 'Sound on — click to disable' : 'Sound off — click to enable');
  btnSound.setAttribute('aria-pressed', String(soundEnabled));
  if (soundEnabled) ensureAudioCtx();
});

btnMode.addEventListener('click', () => {
  magneticActive = !magneticActive;
  btnMode.textContent = magneticActive ? '✦ Magnetic ✓' : '✦ Magnetic';
  btnMode.setAttribute('aria-pressed', String(magneticActive));
  resetScales();
});
