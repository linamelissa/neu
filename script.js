/* =====================================================
   ZOOM IN DEN BILDSCHIRM BEIM SCROLLEN
   ===================================================== */

const BILD_VERHAELTNIS = 687 / 1024;   // Höhe / Breite der Zeichnung
const HANDY_BREITE = 700;

const nav = document.querySelector('.nav');
const zoom = document.querySelector('.zoom');
const stage = zoom.querySelector('.stage');
const heroText = zoom.querySelector('.hero-text');
const scene = zoom.querySelector('.scene');
const img = scene.querySelector('.scene__img');
const screen = scene.querySelector('.screen');
const sub = screen.querySelector('.screen__sub');
const hint = screen.querySelector('.screen__hint');
const bar = screen.querySelector('.screen__bar');

// Position des Bildschirms in der Zeichnung (in %), kommt aus dem style-Attribut
const sx = parseFloat(screen.style.getPropertyValue('--x')) / 100;
const sy = parseFloat(screen.style.getPropertyValue('--y')) / 100;
const sw = parseFloat(screen.style.getPropertyValue('--w')) / 100;
const sh = parseFloat(screen.style.getPropertyValue('--h')) / 100;

// Farben für den Übergang Papier → Bildschirm-Grün
const PAPIER = [247, 242, 223];
const GRUEN = [152, 180, 157];

function begrenzen(v, min, max) { return Math.min(max, Math.max(min, v)); }
function weich(t) { return t * t * (3 - 2 * t); }                      // sanft rein & raus
function bereich(a, b, t) { return weich(begrenzen((t - a) / (b - a), 0, 1)); }
function mischen(a, b, t) { return a + (b - a) * t; }

let laeuft = false;

function aktualisieren() {
  laeuft = false;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const oben = nav.offsetHeight;
  const W = vw;
  const H = W * BILD_VERHAELTNIS;

  // Fortschritt 0 → 1, während man durch den Zoom-Bereich scrollt
  const r = zoom.getBoundingClientRect();
  const p = begrenzen(-r.top / (zoom.offsetHeight - vh), 0, 1);
  const t = bereich(0, 0.85, p);   // Zoom ist nach 85 % fertig, danach kurz stehen

  // START: ganze Zeichnung unter der Begrüßung
  const textUnten = heroText.offsetTop + heroText.offsetHeight + 8;
  const istHandy = vw <= HANDY_BREITE;
  // auf dem Handy etwas näher ran (Ränder der Zeichnung dürfen abgeschnitten sein)
  const s0 = Math.min((vw - 32) / W, (vh - textUnten - 16) / H) * (istHandy ? 1.45 : 1);
  const start = { x: vw / 2, y: textUnten + (vh - textUnten) / 2 };
  const mitteBild = { x: W / 2, y: H / 2 };
  // Wo liegt die Bildschirm-Mitte am Anfang auf dem Monitor?
  const bx = (sx + sw / 2) * W;
  const by = (sy + sh / 2) * H;
  const c0 = { x: start.x + (bx - mitteBild.x) * s0, y: start.y + (by - mitteBild.y) * s0 };

  // ENDE: Bildschirm füllt die Seite
  const s1 = istHandy
    ? (vw * 1.5) / (sw * W)
    : Math.min((vw * 0.9) / (sw * W), ((vh - oben - 40) * 0.88) / (sh * H));
  const c1 = { x: vw / 2, y: oben + (vh - oben) / 2 };

  // Dazwischen: Zoom gleichmäßig (logarithmisch), Bildschirm-Mitte gleitet zur Seitenmitte
  const s = s0 * Math.pow(s1 / s0, t);
  const cx = mischen(c0.x, c1.x, t);
  const cy = mischen(c0.y, c1.y, t);
  const tx = cx - bx * s;
  const ty = cy - by * s;

  scene.style.width = W + 'px';
  scene.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ')';

  // Begrüßung verschwindet beim ersten Scrollen
  heroText.style.opacity = 1 - bereich(0, 0.15, p);

  // Zum Schluss: Schreibtisch blendet aus, alles wird Bildschirm-Grün
  const aus = bereich(0.6, 0.85, p);
  img.style.opacity = 1 - aus;
  const farbe = PAPIER.map(function (c, i) { return Math.round(mischen(c, GRUEN[i], aus)); });
  stage.style.backgroundColor = 'rgb(' + farbe.join(',') + ')';

  // Auf dem Handy verschwindet die Browser-Leiste am Ende, damit es ruhiger wirkt
  bar.style.opacity = istHandy ? 1 - aus : 1;

  // Texte im Bildschirm erscheinen
  sub.style.opacity = bereich(0.55, 0.85, p);
  hint.style.opacity = bereich(0.8, 0.95, p);
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
