/* =====================================================
   HILFSFUNKTIONEN
   ===================================================== */
function begrenzen(v, min, max) { return Math.min(max, Math.max(min, v)); }
function weich(t) { return t * t * (3 - 2 * t); }                        // sanft rein & raus
function bereich(a, b, t) { return weich(begrenzen((t - a) / (b - a), 0, 1)); }
function mischen(a, b, t) { return a + (b - a) * t; }

// liest eine Farbe aus den CSS-Variablen als [r, g, b]
function farbeAus(name) {
  const hex = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function farbMix(a, b, t) {
  return 'rgb(' + a.map(function (c, i) { return Math.round(mischen(c, b[i], t)); }).join(',') + ')';
}

let PAPIER = farbeAus('--paper');
let INHALT = farbeAus('--content');


/* =====================================================
   ELEMENTE
   ===================================================== */
const BILD_VERHAELTNIS = 687 / 1024;
const HANDY_BREITE = 700;

const nav = document.querySelector('.nav');
const zoom = document.querySelector('.zoom');
const stage = zoom.querySelector('.stage');
const heroText = zoom.querySelector('.hero-text');
const scene = zoom.querySelector('.scene');
const img = scene.querySelector('.scene__img');
const screen = scene.querySelector('.screen');
const bar = screen.querySelector('.screen__bar');
const tabs = screen.querySelector('.tabs');
const hint = screen.querySelector('.screen__hint');
const search = screen.querySelector('.search');
const typed = screen.querySelector('.typed');
const journey = scene.querySelector('.journey__line');

const outro = document.querySelector('.outro');
const outroStage = outro.querySelector('.outro__stage');
const outroImg = outro.querySelector('.outro__img');
const outroText = outro.querySelector('.outro__text');

const guide = document.querySelector('.guide');
const blocks = Array.from(document.querySelectorAll('.block'));

// Position des Bildschirms in der Zeichnung (in %)
const sx = parseFloat(screen.style.getPropertyValue('--x')) / 100;
const sy = parseFloat(screen.style.getPropertyValue('--y')) / 100;
const sw = parseFloat(screen.style.getPropertyValue('--w')) / 100;
const sh = parseFloat(screen.style.getPropertyValue('--h')) / 100;


/* =====================================================
   "LINA" TIPPT SICH EIN + VORSCHLÄGE
   ===================================================== */
let tippZustand = 'start';   // start → tippt → fertig
let tippTimer;

function tippen() {
  tippZustand = 'tippt';
  search.classList.add('is-typing');
  search.classList.remove('is-open');
  typed.textContent = '';
  const wort = 'Lina';
  let i = 0;
  (function naechster() {
    typed.textContent = wort.slice(0, ++i);
    if (i < wort.length) {
      tippTimer = setTimeout(naechster, 170);
    } else {
      tippTimer = setTimeout(function () {
        search.classList.add('is-open');
        tippZustand = 'fertig';
      }, 350);
    }
  })();
}

function tippenZuruecksetzen() {
  clearTimeout(tippTimer);
  tippZustand = 'start';
  search.classList.remove('is-typing', 'is-open');
  typed.textContent = 'Lina';
}


/* =====================================================
   SCROLLEN: Zoom, User Journey, Outro, Zeiger
   ===================================================== */
let laeuft = false;

function aktualisieren() {
  laeuft = false;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const oben = nav.offsetHeight;
  const W = vw;
  const H = W * BILD_VERHAELTNIS;
  const istHandy = vw <= HANDY_BREITE;

  /* ---------- Zoom in den Bildschirm ---------- */
  const r = zoom.getBoundingClientRect();
  const p = begrenzen(-r.top / (zoom.offsetHeight - vh), 0, 1);
  const t = bereich(0, 0.85, p);

  const textUnten = heroText.offsetTop + heroText.offsetHeight + 8;
  const s0 = Math.min((vw - 32) / W, (vh - textUnten - 16) / H) * (istHandy ? 1.45 : 1);
  const start = { x: vw / 2, y: textUnten + (vh - textUnten) / 2 };
  const bx = (sx + sw / 2) * W;
  const by = (sy + sh / 2) * H;
  const c0 = { x: start.x + (bx - W / 2) * s0, y: start.y + (by - H / 2) * s0 };

  const s1 = istHandy
    ? (vw * 1.5) / (sw * W)
    : Math.min((vw * 0.9) / (sw * W), ((vh - oben - 40) * 0.88) / (sh * H));
  const c1 = { x: vw / 2, y: oben + (vh - oben) / 2 };

  const s = s0 * Math.pow(s1 / s0, t);
  const tx = mischen(c0.x, c1.x, t) - bx * s;
  const ty = mischen(c0.y, c1.y, t) - by * s;

  scene.style.width = W + 'px';
  scene.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ')';

  heroText.style.opacity = 1 - bereich(0, 0.15, p);

  // User Journey zeichnet sich in den ersten Scroll-Momenten grün nach
  journey.style.strokeDashoffset = 1 - bereich(0.02, 0.4, p);

  // Schreibtisch blendet aus, alles wird Bildschirm-Grün
  const aus = bereich(0.6, 0.85, p);
  img.style.opacity = 1 - aus;
  stage.style.backgroundColor = farbMix(PAPIER, INHALT, aus);
  bar.style.opacity = istHandy ? 1 - aus : 1;
  tabs.style.opacity = bereich(0.6, 0.85, p);
  hint.style.opacity = bereich(0.85, 0.97, p);

  // "Lina" tippt sich ein, sobald man nah genug dran ist
  if (p > 0.55 && tippZustand === 'start') tippen();
  if (p < 0.3 && tippZustand !== 'start') tippenZuruecksetzen();

  /* ---------- Ende: wieder rauszoomen ---------- */
  const ro = outro.getBoundingClientRect();
  const q = begrenzen(-ro.top / (outro.offsetHeight - vh), 0, 1);
  const raus = bereich(0, 0.7, q);
  outroImg.style.transform = 'scale(' + Math.pow(3.2, 1 - raus) + ')';
  outroImg.style.opacity = bereich(0, 0.3, q);
  outroText.style.opacity = bereich(0.55, 0.85, q);
  outroStage.style.backgroundColor = farbMix(INHALT, PAPIER, bereich(0.15, 0.7, q));

  /* ---------- Grüner Zeiger zeigt auf den nächsten Button ---------- */
  let ziel = null;
  if (p >= 1 && ro.top > vh * 0.5) {
    const mitte = vh * 0.55;
    const block = blocks.find(function (b) {
      const br = b.getBoundingClientRect();
      return br.top < mitte && br.bottom > mitte;
    });
    if (block) {
      const kandidat = block.querySelector('.links a, .card');
      if (kandidat) {
        const kr = kandidat.getBoundingClientRect();
        if (kr.bottom > oben + 20 && kr.top < vh - 20) ziel = kr;
      }
    }
  }
  if (ziel) {
    guide.style.transform = 'translate(' + (ziel.right - 18) + 'px,' + (ziel.bottom - 14) + 'px)';
    guide.classList.add('is-visible');
  } else {
    guide.classList.remove('is-visible');
  }
}

function anfordern() {
  if (!laeuft) {
    laeuft = true;
    requestAnimationFrame(aktualisieren);
  }
}

window.addEventListener('scroll', anfordern, { passive: true });
window.addEventListener('resize', anfordern);
img.addEventListener('load', anfordern);
aktualisieren();


/* =====================================================
   LAMPE: Licht an / aus
   ===================================================== */
const lamp = scene.querySelector('.lamp');

function lichtSetzen(aus) {
  document.documentElement.classList.toggle('licht-aus', aus);
  lamp.dataset.label = aus ? 'Licht an?' : 'Licht aus?';
  PAPIER = farbeAus('--paper');
  INHALT = farbeAus('--content');
  try { localStorage.setItem('licht', aus ? 'aus' : 'an'); } catch (e) {}
  anfordern();
}

lamp.addEventListener('click', function () {
  lichtSetzen(!document.documentElement.classList.contains('licht-aus'));
});

// letzte Einstellung merken
try { if (localStorage.getItem('licht') === 'aus') lichtSetzen(true); } catch (e) {}
