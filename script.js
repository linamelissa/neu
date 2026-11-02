:root {
  --paper: #F7F2DF;        /* Hintergrund der Zeichnung */
  --line: #322F28;         /* Linienfarbe der Zeichnung */
  --screen: #98B49D;       /* Grün des Bildschirms */
  --screen-bar: #B9CCBD;   /* hellere Leiste oben im Bildschirm */
  --ink: #2F5A3D;          /* dunkles Grün für Akzente */
  --text: #111111;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  background: var(--paper);
  color: var(--text);
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  line-height: 1.5;
}

/* ---------- Navigation ---------- */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px max(32px, calc((100vw - 1400px) / 2));
  background: rgba(247, 242, 223, .92);
}

.nav__logo { font-weight: 700; font-size: 1.15rem; color: var(--ink); text-decoration: none; }

.nav__links { display: flex; align-items: center; gap: 28px; list-style: none; }
.nav__links a { color: var(--text); text-decoration: none; font-size: .95rem; }
.nav__links a:hover { color: var(--ink); text-decoration: underline; }

.nav__links a.nav__cta {
  background: var(--ink);
  color: var(--paper);
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 999px;
}
.nav__links a.nav__cta:hover { background: var(--text); text-decoration: none; }


/* =====================================================
   ZOOM IN DEN BILDSCHIRM
   ===================================================== */

/* Je höher dieser Bereich, desto langsamer der Zoom beim Scrollen */
.zoom { height: 320vh; }

.stage {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}

.hero-text {
  position: absolute;
  top: 96px;
  left: 16px;
  right: 16px;
  z-index: 2;
  text-align: center;
  /* wird beim Scrollen per JS ausgeblendet */
}
.hero-text h1 { font-size: clamp(1.5rem, 3.2vw, 2.4rem); line-height: 1.2; }
.hero-text p  { color: var(--ink); margin-top: 6px; }

.scroll-hint {
  display: inline-block;
  margin-top: 4px;
  color: var(--ink);
  font-size: 1.4rem;
  animation: hint 1.8s ease-in-out infinite;
}
@keyframes hint { 50% { transform: translateY(6px); } }

/* Die Zeichnung: Größe und Kamera setzt das JavaScript */
.scene {
  position: absolute;
  left: 0;
  top: 0;
  width: 100vw;
  transform-origin: 0 0;
}

.scene__img { display: block; width: 100%; height: auto; }

/* ---------- Der Bildschirm (scharfes HTML über der Zeichnung) ---------- */
.screen {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: var(--w);
  height: var(--h);
  background: var(--screen);
  container-type: inline-size;   /* Schriftgrößen wachsen mit dem Bildschirm (cqw) */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.screen__bar {
  flex: 0 0 auto;
  height: 6cqw;
  background: var(--screen-bar);
  display: flex;
  align-items: center;
  gap: 1.2cqw;
  padding: 0 2cqw;
}
.screen__bar span {
  width: 1.6cqw;
  height: 1.6cqw;
  border-radius: 50%;
  background: rgba(50, 47, 40, .25);
}
.screen__bar i {
  margin-left: auto;
  width: 6cqw;
  height: 1.4cqw;
  border-top: .35cqw solid rgba(50, 47, 40, .3);
  border-bottom: .35cqw solid rgba(50, 47, 40, .3);
}

.screen__body {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.screen__pill {
  position: relative;
  font-size: 7.5cqw;
  line-height: 1;
  padding: 2.2cqw 6cqw;
  color: #4C6654;
  background: rgba(255, 255, 255, .28);
  border-radius: 1.6cqw;
  text-decoration: none;
}
/* kleiner Reiter über dem Feld, wie in der Zeichnung */
.screen__pill::before {
  content: "";
  position: absolute;
  left: 0;
  top: -3.2cqw;
  width: 8cqw;
  height: 2cqw;
  border-radius: 1cqw 1cqw 0 0;
  background: rgba(255, 255, 255, .28);
}

.screen__sub {
  margin-top: 7cqw;
  font-size: 2.4cqw;
  color: #2E4636;
  opacity: 0;   /* erscheint beim Reinzoomen */
}

.screen__cursor {
  position: absolute;
  right: -2.5cqw;
  bottom: -4.5cqw;
  width: 3.6cqw;
  fill: var(--ink);
  stroke: var(--line);
  stroke-width: 2.5;
  stroke-linejoin: round;
  animation: cursor 4s ease-in-out infinite;
}
@keyframes cursor {
  0%, 100% { transform: translate(0, 0); }
  40%      { transform: translate(-1.5cqw, -1.2cqw); }
  60%      { transform: translate(-1.5cqw, -1.2cqw) scale(.9); }   /* "klickt" */
}

.screen__hint {
  position: absolute;
  bottom: 5cqw;
  font-size: 1.6cqw;
  color: #2E4636;
  opacity: 0;
}

/* Aufbau beim Laden: Zeichnung erscheint von links nach rechts */
.scene.intro .scene__img {
  -webkit-mask-image: linear-gradient(90deg, #000 0 40%, transparent 60%);
          mask-image: linear-gradient(90deg, #000 0 40%, transparent 60%);
  -webkit-mask-size: 250% 100%;
          mask-size: 250% 100%;
  -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
  animation: aufbau 2.4s cubic-bezier(.55, .1, .35, 1) forwards;
}
@keyframes aufbau {
  from { -webkit-mask-position: 100% 0; mask-position: 100% 0; }
  to   { -webkit-mask-position: 0 0;    mask-position: 0 0; }
}
.scene.intro .screen { opacity: 0; animation: einblenden .5s ease 1.6s forwards; }
@keyframes einblenden { to { opacity: 1; } }


/* =====================================================
   INHALT IM BILDSCHIRM
   ===================================================== */
.content {
  position: relative;
  background: var(--screen);
  padding: 24px 16px 0;
}

.block {
  max-width: 1000px;
  margin: 0 auto 32px;
  padding: 40px;
  background: var(--paper);
  border: 2px solid var(--line);
  border-radius: 20px;
  scroll-margin-top: 96px;
}

.kicker {
  display: block;
  color: var(--ink);
  font-size: .8rem;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.block h2 { font-size: clamp(1.5rem, 3vw, 2.2rem); line-height: 1.2; margin-bottom: 16px; }
.block p  { margin-bottom: 12px; max-width: 65ch; }

.links { display: flex; flex-wrap: wrap; gap: 12px; }
.links a {
  color: var(--ink);
  font-weight: 600;
  padding: 10px 16px;
  border: 2px solid var(--ink);
  border-radius: 999px;
  text-decoration: none;
}
.links a:hover { background: var(--ink); color: var(--paper); }

.chips { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; }
.chips li { padding: 6px 14px; border: 1.5px solid var(--line); border-radius: 999px; font-size: .9rem; }

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}
.card {
  display: block;
  padding: 20px;
  color: var(--ink);
  background: #fff;
  border: 2px solid var(--line);
  border-radius: 16px;
  text-decoration: none;
  transition: transform .2s ease, box-shadow .2s ease;
}
.card:hover { transform: translateY(-4px); box-shadow: 0 8px 0 var(--screen); }
.card h3 { color: var(--text); margin: 4px 0; }
.card p  { color: var(--text); margin: 0; font-size: .95rem; }
.card__tag { font-size: .8rem; font-weight: 600; }

.facts { list-style: none; margin-bottom: 16px; }
.facts li { margin-bottom: 6px; }
.facts strong { color: var(--ink); }

.process {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  counter-reset: schritt;
  margin-bottom: 16px;
}
.process li {
  counter-increment: schritt;
  font-weight: 600;
  padding: 8px 14px;
  background: var(--screen);
  border-radius: 999px;
}
.process li::before { content: counter(schritt) ". "; color: var(--ink); }

.footer { text-align: center; padding: 24px 16px 40px; font-size: .85rem; color: #2E4636; }


/* ---------- Handy ---------- */
@media (max-width: 700px) {
  .nav { padding: 12px 16px; flex-wrap: wrap; gap: 6px; }
  .nav__links { gap: 14px; }
  .nav__links a { font-size: .85rem; }
  .nav__links a.nav__cta { padding: 6px 12px; }
  .hero-text { top: 104px; }
  .block { padding: 24px; }
  .screen__sub  { font-size: 3.2cqw; text-align: center; max-width: 60cqw; }
  .screen__hint { font-size: 2.6cqw; }
}


/* ---------- Weniger Bewegung, wenn im System so eingestellt ---------- */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .scroll-hint, .screen__cursor { animation: none; }
  .scene.intro .scene__img { animation: none; -webkit-mask-image: none; mask-image: none; }
  .scene.intro .screen { animation: none; opacity: 1; }
}
