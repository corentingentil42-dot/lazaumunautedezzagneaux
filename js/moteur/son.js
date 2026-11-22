/* ============================================================
   js/moteur/son.js — Sons générés par le code (WebAudio) : Snd.play('nom'), bouton muet.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* =====================================================================
   v20.23 — SONS, EFFETS, ÉCRAN TACTILE, LISTE « À FAIRE »
   ===================================================================== */

/* ---------- SONS : tout est généré dans le code (WebAudio), aucun fichier requis ----------
   Option : si tu poses un fichier assets/sons/<nom>.mp3 (ou .ogg / .wav), il REMPLACE le son généré.
   Noms : step blip select open close toast coin wrong sign win fail unlock pop
          + musique-hub et musique-mini (jouées en boucle). */
const SOUND_PATH = 'assets/sons/';
const SOUND_EXTS = ['mp3', 'ogg', 'wav'];
const Snd = (() => {
  let ac = null, master = null, sfxBus = null, musBus = null;
  let muted = false;
  try { muted = localStorage.getItem('zaum_mute') === '1'; } catch (e) {}
  const files = {};              // nom -> <audio> trouvé dans assets/sons/ , ou false
  const lastPlay = {};
  const mtof = n => 440 * Math.pow(2, (n - 69) / 12);

  function ensure() {
    try {
      if (!ac) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ac = new AC();
        master = ac.createGain(); master.gain.value = muted ? 0 : 1; master.connect(ac.destination);
        sfxBus = ac.createGain(); sfxBus.gain.value = 0.55; sfxBus.connect(master);
        musBus = ac.createGain(); musBus.gain.value = 0.14; musBus.connect(master);
      }
      if (ac.state === 'suspended') ac.resume();
      return ac;
    } catch (e) { return null; }
  }
  function tone(freq, t0, dur, o) {
    o = o || {};
    const osc = ac.createOscillator(), g = ac.createGain();
    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(freq, t0);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
    const v = o.vol == null ? 0.2 : o.vol;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v, t0 + Math.min(0.012, dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(o.bus || sfxBus);
    osc.start(t0); osc.stop(t0 + dur + 0.03);
  }
  function noise(t0, dur, vol, fc) {
    const n = Math.max(1, Math.floor(ac.sampleRate * dur));
    const buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = ac.createBufferSource(); src.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = fc || 800;
    const g = ac.createGain(); g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(sfxBus); src.start(t0);
  }
  const SFX = {
    step:   t => noise(t, 0.05, 0.10, 500),
    blip:   t => tone(620, t, 0.05, { vol: 0.07 }),
    select: t => { tone(660, t, 0.07, { type: 'triangle', vol: 0.2 }); tone(990, t + 0.06, 0.09, { type: 'triangle', vol: 0.2 }); },
    open:   t => { tone(440, t, 0.08, { type: 'triangle', vol: 0.18 }); tone(587, t + 0.07, 0.10, { type: 'triangle', vol: 0.18 }); },
    close:  t => { tone(587, t, 0.07, { type: 'triangle', vol: 0.15 }); tone(392, t + 0.06, 0.10, { type: 'triangle', vol: 0.15 }); },
    toast:  t => { tone(784, t, 0.08, { type: 'triangle', vol: 0.2 }); tone(1175, t + 0.08, 0.14, { type: 'triangle', vol: 0.2 }); },
    coin:   t => { tone(988, t, 0.07, { vol: 0.14 }); tone(1319, t + 0.07, 0.16, { vol: 0.14 }); },
    wrong:  t => tone(180, t, 0.24, { type: 'sawtooth', vol: 0.16, to: 105 }),
    sign:   t => { noise(t, 0.07, 0.35, 350); tone(150, t, 0.10, { type: 'triangle', vol: 0.3, to: 90 }); },
    pop:    t => tone(500, t, 0.08, { type: 'sine', vol: 0.2, to: 900 }),
    win:    t => [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.09, 0.2, { vol: 0.13 })),
    fail:   t => { tone(330, t, 0.18, { type: 'sawtooth', vol: 0.15, to: 220 }); tone(247, t + 0.17, 0.18, { type: 'sawtooth', vol: 0.15, to: 165 }); tone(165, t + 0.34, 0.42, { type: 'sawtooth', vol: 0.15, to: 105 }); },
    unlock: t => [523, 659, 784, 659, 784, 1047, 1319].forEach((f, i) => tone(f, t + i * 0.1, i === 6 ? 0.55 : 0.14, { vol: 0.13 }))
  };
  function probe(name) {
    files[name] = false;                       // « en cours / absent » : on joue le son généré
    const a = new Audio(); let i = 0;
    a.preload = 'auto';
    a.addEventListener('canplaythrough', () => { files[name] = a; }, { once: true });
    const next = () => { if (i < SOUND_EXTS.length) a.src = SOUND_PATH + name + '.' + SOUND_EXTS[i++]; };
    a.addEventListener('error', next);
    next();
  }
  function play(name) {
    if (muted || !SFX[name]) return;
    const now = performance.now();
    if (lastPlay[name] && now - lastPlay[name] < (name === 'step' ? 170 : 40)) return;
    lastPlay[name] = now;
    const f = files[name];
    if (f) { try { const a = f.cloneNode(); a.volume = 0.7; a.play(); } catch (e) {} return; }
    if (f === undefined) probe(name);
    if (!ensure()) return;
    try { SFX[name](ac.currentTime + 0.001); } catch (e) {}
  }
  // Musique : petite boucle générée (Am-F-C-G) ; 'hub' calme, 'mini' plus vive, null = silence.
  const MUS = { hub: { bpm: 84, wave: 'triangle', vol: 1 }, mini: { bpm: 112, wave: 'square', vol: 0.5 } };
  const PROG = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
  let mood = null, timer = null, nextT = 0, stepN = 0;
  function tick() {
    if (!ac || !mood) return;
    if (muted || ac.state !== 'running') { nextT = ac.currentTime + 0.1; return; }
    const m = MUS[mood], spb = 60 / m.bpm / 2;
    if (nextT < ac.currentTime) nextT = ac.currentTime + 0.05;
    while (nextT < ac.currentTime + 0.4) {
      const bar = Math.floor(stepN / 8) % 4, k = stepN % 8, ch = PROG[bar];
      const pat = [0, 1, 2, 1, 2, 1, 0, 1];
      tone(mtof(ch[pat[k]] + 12), nextT, spb * 1.6, { type: m.wave, vol: 0.5 * m.vol, bus: musBus });
      if (k === 0) tone(mtof(ch[0] - 12), nextT, spb * 6, { type: 'sine', vol: 0.9 * m.vol, bus: musBus });
      if (k === 4 || (k === 7 && bar % 2 === 1)) tone(mtof(ch[(bar + k) % 3] + 24), nextT, spb * 1.2, { type: 'sine', vol: 0.35 * m.vol, bus: musBus });
      nextT += spb; stepN++;
    }
  }
  function music(newMood) {
    if (newMood === mood) return;
    mood = newMood;
    if (timer) { clearInterval(timer); timer = null; }
    if (!mood) return;
    if (!ensure()) return;
    nextT = ac.currentTime + 0.1; stepN = 0;
    timer = setInterval(tick, 120);
  }
  function setMuted(m) {
    muted = m;
    try { localStorage.setItem('zaum_mute', m ? '1' : '0'); } catch (e) {}
    if (master) master.gain.value = m ? 0 : 1;
    const b = document.getElementById('btnSound'); if (b) b.textContent = m ? '🔇' : '🔊';
  }
  document.addEventListener('visibilitychange', () => {
    if (!ac) return;
    if (document.hidden) ac.suspend(); else if (!muted) ac.resume();
  });
  return { play, music, ensure, setMuted, toggleMute() { ensure(); setMuted(!muted); return muted; }, isMuted: () => muted };
})();
(function () { const b = document.getElementById('btnSound'); if (b) { b.textContent = Snd.isMuted() ? '🔇' : '🔊'; b.addEventListener('click', () => Snd.toggleMute()); } })();
// Le navigateur n'autorise le son qu'après un geste : au premier clic / touche / toucher on réveille l'audio.
['pointerdown', 'keydown', 'touchstart'].forEach(ev => window.addEventListener(ev, () => Snd.ensure(), { once: true, passive: true }));
