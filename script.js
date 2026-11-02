/* =========================================================
   Lina Melissa Arndt · Portfolio v2 · „Lo-Fi wird Hi-Fi"
   ========================================================= */
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.addEventListener('load', function () {
  if (!window.location.hash) window.scrollTo(0, 0);
});

(function () {
  var body = document.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= Hero: Fidelity-Stufen per Scroll ================= */
  var hero = document.querySelector('.hero-scroll');
  var stageLabel = document.querySelector('[data-stage-label]');
  var hud = document.querySelector('.fid-hud');
  var hudSteps = Array.prototype.slice.call(document.querySelectorAll('.hud-steps [data-go]'));
  var STAGE_NAMES = ['Sketch', 'Wireframe', 'Mid-Fi', 'Hi-Fi'];
  // Ab welchem Scroll-Anteil (0–1) im Hero welche Stufe gilt
  var STOPS = [0, 0.2, 0.45, 0.7];
  var stage = -1;

  function setStage(s) {
    if (s === stage) return;
    stage = s;
    body.setAttribute('data-stage', s);
    if (stageLabel) stageLabel.textContent = 'Hero · ' + STAGE_NAMES[s];
    hudSteps.forEach(function (b, i) {
      b.classList.toggle('done', i < s);
      b.classList.toggle('active', i === s);
      b.setAttribute('aria-pressed', i === s ? 'true' : 'false');
    });
  }

  function heroTotal() {
    return Math.max(1, hero.offsetHeight - window.innerHeight);
  }
  function heroProgress() {
    var r = hero.getBoundingClientRect();
    return Math.min(1, Math.max(0, -r.top / heroTotal()));
  }

  // Klick auf eine Stufe im HUD springt an die passende Scroll-Position
  document.querySelectorAll('.fid-hud [data-go]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = parseInt(btn.getAttribute('data-go'), 10);
      var p = i === 0 ? 0 : STOPS[i] + 0.06;
      if (i === 3) p = 0.8;
      window.scrollTo({ top: hero.offsetTop + p * heroTotal(), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  if (reduceMotion) setStage(3);

  /* ================= Scroll: Fortschritt, Nav, Hero ================= */
  var bar = document.getElementById('scroll-progress');
  var navDesktop = document.getElementById('navDesktop');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  var sectionIds = ['projekte', 'antrieb', 'expertise', 'ueber-mich', 'blog', 'zwischendurch', 'kontakt'];
  var ticking = false;

  function onScroll() {
    ticking = false;
    var y = window.scrollY || 0;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0).toFixed(4) + ')';
    if (navDesktop) navDesktop.classList.toggle('small', y > 40);

    if (!reduceMotion && hero) {
      var p = heroProgress();
      var s = 0;
      for (var i = 0; i < STOPS.length; i++) if (p >= STOPS[i]) s = i;
      setStage(s);
      if (hud) hud.classList.toggle('hidden', hero.getBoundingClientRect().bottom < window.innerHeight * 0.7);
    }

    var active = '';
    var mid = window.innerHeight * 0.42;
    sectionIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var r = el.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) active = id;
    });
    navLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-nav') === active);
    });
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ================= Resolve: Wireframe → Hi-Fi beim Reinscrollen ================= */
  var resolveSections = document.querySelectorAll('.resolve');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    resolveSections.forEach(function (s) { s.classList.add('is-hi'); });
  } else {
    resolveSections.forEach(function (s) {
      s.querySelectorAll('.sk, .chip, .ph').forEach(function (el, i) {
        el.style.setProperty('--i', Math.min(i, 16));
      });
    });
    var resolveIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target;
        setTimeout(function () { t.classList.add('is-hi'); }, 220);
        resolveIO.unobserve(t);
      });
    }, { rootMargin: '0px 0px -18% 0px', threshold: 0.04 });
    resolveSections.forEach(function (s) { resolveIO.observe(s); });
  }

  /* ================= Mobile Navigation ================= */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    body.style.overflow = open ? 'hidden' : '';
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
    menu.querySelectorAll('[data-close-menu]').forEach(function (el) {
      el.addEventListener('click', function () { setMenu(false); });
    });
  }

  /* ================= Sprache DE / EN ================= */
  var lang = 'de';
  document.querySelectorAll('[data-lang-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      lang = lang === 'de' ? 'en' : 'de';
      document.querySelectorAll('[data-' + lang + ']').forEach(function (el) {
        el.innerHTML = el.getAttribute('data-' + lang);
      });
      document.querySelectorAll('[data-' + lang + '-placeholder]').forEach(function (el) {
        el.setAttribute('placeholder', el.getAttribute('data-' + lang + '-placeholder'));
      });
      document.documentElement.setAttribute('lang', lang);
      document.querySelectorAll('[data-lang-toggle]').forEach(function (b) {
        b.textContent = lang === 'de' ? 'EN' : 'DE';
      });
    });
  });

  /* ================= E-Mail kopieren ================= */
  var mailBtn = document.getElementById('mailBtn');
  var mailNote = document.getElementById('mailNote');
  var mailTimer;
  function copyFallback(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }
  if (mailBtn) {
    mailBtn.addEventListener('click', function () {
      var EMAIL = 'Lina-Melissa@web.de';
      var label = mailBtn.querySelector('.mail-label');
      var done = function () {
        mailBtn.classList.add('copied');
        mailNote.classList.add('show');
        label.textContent = lang === 'de' ? 'Kopiert!' : 'Copied!';
        clearTimeout(mailTimer);
        mailTimer = setTimeout(function () {
          mailBtn.classList.remove('copied');
          mailNote.classList.remove('show');
          label.textContent = lang === 'de' ? 'E-Mail kopieren' : 'Copy email';
        }, 2400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(EMAIL).then(done).catch(function () { copyFallback(EMAIL); done(); });
      } else {
        copyFallback(EMAIL);
        done();
      }
    });
  }

  /* ================= Update-Ticker ================= */
  var chat = document.getElementById('chat');
  var launcher = document.getElementById('chatLauncher');
  var nudge = document.getElementById('nudge');
  var badge = document.getElementById('chatBadge');
  var typing = document.getElementById('typing');
  var latest = document.getElementById('latestMsg');
  var chatBody = document.getElementById('chatBody');
  var openedOnce = false;

  function openChat() {
    chat.hidden = false;
    launcher.style.display = 'none';
    nudge.classList.remove('show');
    badge.classList.remove('show');
    if (!openedOnce) {
      openedOnce = true;
      typing.classList.add('show');
      latest.classList.add('hidden');
      setTimeout(function () {
        typing.classList.remove('show');
        latest.classList.remove('hidden');
        chatBody.scrollTop = chatBody.scrollHeight;
      }, 1200);
    }
    chatBody.scrollTop = chatBody.scrollHeight;
  }
  function closeChat() {
    chat.hidden = true;
    launcher.style.display = '';
  }
  document.querySelectorAll('[data-open-chat]').forEach(function (el) { el.addEventListener('click', openChat); });
  document.getElementById('chatClose').addEventListener('click', closeChat);
  document.querySelectorAll('[data-close-chat]').forEach(function (el) { el.addEventListener('click', closeChat); });

  setTimeout(function () {
    if (chat.hidden) { nudge.classList.add('show'); badge.classList.add('show'); }
  }, 3800);
  setTimeout(function () { nudge.classList.remove('show'); }, 10500);

  /* ================= Lightbox ================= */
  var lb = document.getElementById('lightbox');
  document.querySelectorAll('[data-lightbox]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var set = btn.getAttribute('data-lightbox');
      lb.querySelectorAll('[data-set]').forEach(function (d) {
        d.classList.toggle('active', d.getAttribute('data-set') === set);
      });
      if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
    });
  });
  function closeLb() { if (lb.close) lb.close(); else lb.removeAttribute('open'); }
  document.getElementById('lbClose').addEventListener('click', closeLb);
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });

  /* ================= Escape schließt Overlays ================= */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!chat.hidden) closeChat();
    else if (menu && menu.classList.contains('open')) setMenu(false);
  });
})();

/* ================= Videos: Autoplay auch auf dem Handy ================= */
(function () {
  var io = null;

  function isVisible(v) {
    var r = v.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
  }
  function tryPlay(v) {
    if (!v.paused) return;
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }
  function prepare(v) {
    if (v.__lmReady) return;
    v.__lmReady = true;
    // iOS startet nur stumme Inline-Videos von selbst
    v.muted = true;
    v.defaultMuted = true;
    v.loop = true;
    v.playsInline = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    if (!v.getAttribute('preload')) v.setAttribute('preload', 'metadata');
    v.addEventListener('canplay', function () { if (isVisible(v)) tryPlay(v); });
    if (io) io.observe(v);
    if (isVisible(v)) tryPlay(v);
  }

  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        if (entry.isIntersecting) tryPlay(v);
        else if (!v.paused) v.pause();
      });
    }, { threshold: 0.1 });
  }

  function resumeVideos() {
    if (document.visibilityState === 'hidden') return;
    document.querySelectorAll('video').forEach(function (v) { if (isVisible(v)) tryPlay(v); });
  }

  document.querySelectorAll('video').forEach(prepare);
  document.addEventListener('visibilitychange', resumeVideos);
  window.addEventListener('pageshow', resumeVideos);
  // Stromsparmodus (iPhone) blockiert Autoplay: beim ersten Antippen starten
  document.addEventListener('touchstart', resumeVideos, { passive: true, once: true });
  document.addEventListener('click', resumeVideos, { capture: true, once: true });
})();
