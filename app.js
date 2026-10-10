/* Impérios Audio Design · scroll do herói, vídeo opcional, películas e reveals */
(() => {
  const hero = document.querySelector('.hero');
  const stage = document.getElementById('stage');
  const topbar = document.getElementById('topbar');
  const fab = document.querySelector('.fab');
  const fill = document.getElementById('progressFill');
  const label = document.getElementById('progressLabel');
  const loader = document.getElementById('loader');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- progresso do scroll no herói ----------
  let target = 0, current = 0, raf = null;
  const read = () => {
    const r = hero.getBoundingClientRect();
    const span = r.height - window.innerHeight;
    target = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
    topbar.classList.toggle('solid', window.scrollY > window.innerHeight * 0.6);
    fab.classList.toggle('show', window.scrollY > window.innerHeight * 0.4);
    if (!raf) raf = requestAnimationFrame(tick);
  };
  const tick = () => {
    raf = null;
    current += (target - current) * (reduce ? 1 : 0.14);
    if (Math.abs(target - current) < 0.0005) current = target;
    const p = reduce ? 1 : current;
    stage.style.setProperty('--p', p.toFixed(4));
    hero.classList.toggle('late', current > 0.62);
    fill.style.transform = `scaleX(${current})`;
    label.textContent = String(Math.round(current * 100)).padStart(2, '0') + '%';
    if (video.duration) scrubVideo(current);
    if (current !== target) raf = requestAnimationFrame(tick);
  };
  window.addEventListener('scroll', read, { passive: true });
  window.addEventListener('resize', read);

  // ---------- vídeo opcional: coloque um arquivo em video/hero.mp4 ----------
  const video = document.getElementById('heroVideo');
  let lastSeek = -1;
  const scrubVideo = (p) => {
    const t = p * (video.duration - 0.05);
    if (Math.abs(t - lastSeek) > 1 / 30) { lastSeek = t; try { video.currentTime = t; } catch (e) {} }
  };
  const VIDEO_SRC = 'video/hero.mp4';
  fetch(VIDEO_SRC, { method: 'HEAD' })
    .then((res) => {
      const type = res.headers.get('content-type') || '';
      if (!res.ok || !type.includes('video')) return;
      video.src = VIDEO_SRC;
      video.addEventListener('loadeddata', () => { hero.classList.add('has-video'); read(); }, { once: true });
      video.load();
    })
    .catch(() => {});

  // ---------- loader ----------
  const done = () => loader.classList.add('done');
  window.addEventListener('load', () => setTimeout(done, 350));
  setTimeout(done, 3500);

  // ---------- películas ----------
  const tintLayer = document.getElementById('tintLayer');
  const desc = document.getElementById('tintDesc');
  const badge = document.getElementById('tintBadge');
  const buttons = [...document.querySelectorAll('.tints button')];
  const choose = (btn) => {
    buttons.forEach((b) => b.setAttribute('aria-checked', String(b === btn)));
    tintLayer.setAttribute('opacity', btn.dataset.tint);
    desc.innerHTML = `<strong>${btn.dataset.label}</strong> ${btn.dataset.desc}`;
    badge.textContent = btn.dataset.label;
  };
  buttons.forEach((b, i) => {
    b.addEventListener('click', () => choose(b));
    b.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const next = buttons[(i + (e.key === 'ArrowRight' ? 1 : buttons.length - 1)) % buttons.length];
      next.focus(); choose(next);
    });
  });

  // ---------- reveals ----------
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 3) * 60}ms`;
    io.observe(el);
  });

  // borda dourada que segue o cursor nos cards (só mouse)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  read();
})();
