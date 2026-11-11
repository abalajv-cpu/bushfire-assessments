/* Bushfire Assessments — Home template interactions
   Lenis (inertia smooth scroll) + GSAP ScrollTrigger (scrubbed / pinned animation).
   Everything degrades to a static, fully readable page if scripts fail or motion is reduced. */
(() => {
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);

  /* ---------------- State switch (QLD / NSW) ---------------- */
  function setState(state, save = true) {
    root.dataset.state = state;
    $$('[data-set-state]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.setState === state)));
    $$('[data-qld]').forEach(el => { el.textContent = el.dataset[state]; });
    const sel = $('[data-state-select]'); if (sel) sel.value = state;
    if (save) { try { localStorage.setItem('bfa-state', state); } catch (e) {} }
  }
  $$('[data-set-state]').forEach(b => b.addEventListener('click', () => setState(b.dataset.setState)));
  $('[data-state-select]')?.addEventListener('change', e => setState(e.target.value));
  setState(root.dataset.state || 'qld', false);

  /* ---------------- Mobile menu ---------------- */
  const menuBtn = $('[data-menu-btn]'), nav = $('#nav');
  const closeMenu = () => { nav.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); };
  menuBtn?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ---------------- BAL tabs (work with or without scroll pinning) ---------------- */
  const balTabs = $$('[data-bal-tab]'), balPanels = $$('[data-bal-panel]'), balStage = $('.bal__stage');
  let balIndex = -1;
  function setBal(i) {
    if (i === balIndex) return;
    balIndex = i;
    balTabs.forEach((t, n) => t.setAttribute('aria-selected', String(n === i)));
    balPanels.forEach((p, n) => p.classList.toggle('is-active', n === i));
    balStage?.style.setProperty('--bal-c', getComputedStyle(balTabs[i]).getPropertyValue('--c'));
  }
  if (balTabs.length) setBal(0);

  /* ---------------- Quote form (not connected yet) ---------------- */
  $('[data-form]')?.addEventListener('submit', e => {
    e.preventDefault();
    const f = e.currentTarget;
    if (!f.checkValidity()) { f.reportValidity(); return; }
    $('[data-form-note]').textContent = 'Template preview: this form is not connected to an inbox yet.';
  });

  /* ---------------- Pause motion control ---------------- */
  let paused = false;
  const motionBtn = $('[data-motion-btn]');
  motionBtn?.addEventListener('click', () => {
    paused = !paused;
    root.classList.toggle('motion-paused', paused);
    motionBtn.textContent = paused ? 'Play motion' : 'Pause motion';
  });

  /* ---------------- Static fallback ---------------- */
  if (!hasGsap || reduced) {
    root.classList.remove('js');
    balTabs.forEach((t, i) => t.addEventListener('click', () => setBal(i)));
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', closeMenu));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out', duration: 1 });

  /* ---------------- Smooth scroll ---------------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop(); // released after the preloader
  }
  const scrollTo = (target, opts = {}) => {
    if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: t => 1 - Math.pow(1 - t, 4), ...opts });
    else (typeof target === 'number' ? window.scrollTo({ top: target, behavior: 'smooth' }) : target.scrollIntoView({ behavior: 'smooth' }));
  };
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const el = document.getElementById(a.getAttribute('href').slice(1));
    if (!el) return;
    e.preventDefault(); closeMenu();
    scrollTo(el, { offset: el.id === 'top' ? 0 : -96 });
  }));

  /* ---------------- Text splitting ---------------- */
  function splitWords(el, inner = true) {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map(w => inner
      ? `<span class="w" aria-hidden="true"><span class="wi">${w}</span></span>`
      : `<span class="word" aria-hidden="true">${w}</span>`).join(' ');
    return $$(inner ? '.wi' : '.word', el);
  }

  /* ---------------- Page intro ---------------- */
  const pre = $('.preloader');
  const heroFades = $$('[data-hero-fade]');
  gsap.set(heroFades, { autoAlpha: 0, y: 24 });
  gsap.set('.header', { yPercent: -120 });

  if (pre) {
    /* Home: preloader, then the scene settles and the headline rises */
    const heroLines = $$('.hero__title .line > span');
    gsap.set(heroLines, { yPercent: 115 });
    gsap.set('.scene', { scale: 1.12 });
    const counter = { v: 0 }, countEl = $('[data-count]');
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .to(counter, { v: 100, duration: 1.3, ease: 'power2.inOut', onUpdate: () => { countEl.textContent = Math.round(counter.v); } })
      .to('.preloader__bar span', { scaleX: 1, duration: 1.3, ease: 'power2.inOut' }, 0)
      .to('.preloader__inner', { autoAlpha: 0, y: -30, duration: .6, ease: 'power2.in' })
      .to(pre, { yPercent: -100, duration: 1.1, ease: 'expo.inOut', onComplete: () => { pre.remove(); lenis?.start(); } }, '-=.1')
      .to('.scene', { scale: 1, duration: 2.4 }, '-=.9')
      .to(heroLines, { yPercent: 0, duration: 1.4, stagger: .12 }, '-=2.1')
      .to(heroFades, { autoAlpha: 1, y: 0, duration: 1.1, stagger: .1 }, '-=1.3')
      .to('.header', { yPercent: 0, duration: 1.1 }, '-=1.4');
  } else {
    /* Inner pages: quick, no preloader */
    lenis?.start();
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: .1 });
    const h1 = $('[data-split-now]');
    if (h1) { const parts = splitWords(h1); tl.from(parts, { yPercent: 115, duration: 1.2, stagger: .045 }, 0); }
    tl.to(heroFades, { autoAlpha: 1, y: 0, duration: 1, stagger: .08 }, .15)
      .to('.header', { yPercent: 0, duration: 1 }, .1);
  }

  /* ---------------- Header ---------------- */
  const header = $('[data-header]');
  const onScrollHeader = () => header.classList.toggle('is-scrolled', scrollY > 80);
  addEventListener('scroll', onScrollHeader, { passive: true }); onScrollHeader();

  /* hero content drifts up and fades as you leave */
  if ($('.hero')) gsap.to('.hero__content', { yPercent: -18, autoAlpha: 0, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 35%', scrub: true } });

  /* ---------------- Generic reveals ---------------- */
  gsap.set('[data-reveal]', { autoAlpha: 0, y: 44 });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%', once: true,
    onEnter: els => gsap.to(els, { autoAlpha: 1, y: 0, duration: 1.2, stagger: .09, ease: 'expo.out', overwrite: true })
  });

  $$('[data-split]').forEach(el => {
    const parts = splitWords(el);
    gsap.set(parts, { yPercent: 115 });
    ScrollTrigger.create({ trigger: el, start: 'top 86%', once: true,
      onEnter: () => gsap.to(parts, { yPercent: 0, duration: 1.3, stagger: .05, ease: 'expo.out' }) });
  });

  /* intro statement: words light up with scroll */
  $$('[data-words]').forEach(el => {
    const words = splitWords(el, false);
    gsap.fromTo(words, { opacity: .14 }, { opacity: 1, ease: 'none', stagger: .08,
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: .6 } });
  });

  /* count-up stats */
  $$('[data-countup]').forEach(el => {
    const end = +el.dataset.countup, o = { v: 0 }, plain = 'plain' in el.dataset;
    el.textContent = '0';
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 2, ease: 'power3.out',
        onUpdate: () => { const n = Math.round(o.v); el.textContent = plain ? n : n.toLocaleString('en-AU'); } }) });
  });

  /* marquee leans with scroll velocity */
  const track = $('.marquee__track');
  if (track && lenis) {
    const skew = gsap.quickTo(track, 'skewX', { duration: .6, ease: 'power3.out' });
    lenis.on('scroll', ({ velocity }) => skew(gsap.utils.clamp(-8, 8, velocity * -.25)));
  }

  /* ---------------- BAL: click a rating; the page scrolls past normally ---------------- */
  const balSection = $('[data-bal]'), balProgress = $('[data-bal-progress]');
  if (balSection) {
    const showBal = i => {
      setBal(i);
      gsap.to(balProgress, { scaleX: (i + 1) / balTabs.length, duration: .8, overwrite: true });
    };
    // Until the visitor picks a rating, step through them slowly while the section is on screen.
    let auto = true, balVisible = false, timer = null;
    const stopAuto = () => { auto = false; clearInterval(timer); };
    const tick = () => { if (auto && balVisible && !paused) showBal((balIndex + 1) % balTabs.length); };
    ScrollTrigger.create({ trigger: balSection, start: 'top 70%', end: 'bottom 30%',
      onToggle: self => { balVisible = self.isActive; } });
    timer = setInterval(tick, 3200);
    showBal(0);

    balTabs.forEach((t, i) => {
      t.addEventListener('click', () => { stopAuto(); showBal(i); });
      t.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault(); stopAuto();
        const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + balTabs.length) % balTabs.length;
        balTabs[n].focus(); showBal(n);
      });
    });
  }

  /* ---------------- Process line burns down ---------------- */
  const steps = $('[data-steps]');
  if (steps) {
    gsap.to('[data-steps-line]', { scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: steps, start: 'top 65%', end: 'bottom 65%', scrub: .5 } });
    $$('[data-step]', steps).forEach(step => {
      gsap.from(step.children, { autoAlpha: 0, x: 40, duration: 1.1, stagger: .07, ease: 'expo.out',
        scrollTrigger: { trigger: step, start: 'top 80%', once: true } });
      ScrollTrigger.create({ trigger: step, start: 'top 65%', toggleClass: { targets: step, className: 'is-lit' } });
    });
  }

  /* footer wordmark rises */
  gsap.from('.footer__word', { yPercent: 45, autoAlpha: .2, ease: 'none',
    scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  if ($('.quote')) gsap.to('.quote__glow', { scale: 1.25, ease: 'none',
    scrollTrigger: { trigger: '.quote', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------------- Pointer effects (fine pointers only) ---------------- */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('[data-magnetic]').forEach(btn => {
      const x = gsap.quickTo(btn, 'x', { duration: .5, ease: 'power3.out' });
      const y = gsap.quickTo(btn, 'y', { duration: .5, ease: 'power3.out' });
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        x((e.clientX - r.left - r.width / 2) * .3); y((e.clientY - r.top - r.height / 2) * .4);
      });
      btn.addEventListener('pointerleave', () => { x(0); y(0); });
    });
    $$('[data-card]').forEach(card => card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    }));
    /* scene follows the pointer slightly */
    const tree = !$('.scene') ? () => {} : gsap.quickTo('.scene__tree', 'x', { duration: 1.4, ease: 'power3.out' });
    const sun = !$('.scene') ? () => {} : gsap.quickTo('.scene__sun', 'x', { duration: 1.8, ease: 'power3.out' });
    $('.hero')?.addEventListener('pointermove', e => {
      const n = e.clientX / innerWidth - .5;
      tree(n * -26); sun(n * 14);
    });
  }

  /* ---------------- Embers canvas ---------------- */
  const canvas = $('[data-embers]');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = 1, visible = true, parts = [];
    const COUNT = innerWidth < 700 ? 34 : 90;
    const spawn = (p = {}, anywhere = false) => {
      p.x = w * (.25 + Math.random() * .8);
      p.y = anywhere ? Math.random() * h : h * (.78 + Math.random() * .2);
      p.r = (.6 + Math.random() * 2.2) * dpr;
      p.vy = -(.25 + Math.random() * .9) * dpr;
      p.vx = (-.35 + Math.random() * .25) * dpr;
      p.life = 0; p.max = 260 + Math.random() * 420;
      p.phase = Math.random() * 6.28; p.hue = 18 + Math.random() * 26;
      return p;
    };
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      w = canvas.width = canvas.clientWidth * dpr; h = canvas.height = canvas.clientHeight * dpr;
    };
    resize(); addEventListener('resize', resize);
    parts = Array.from({ length: COUNT }, () => spawn({}, true));
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

    gsap.ticker.add(() => {
      if (!visible || paused) return;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const p of parts) {
        p.life++; p.phase += .03;
        p.x += p.vx + Math.sin(p.phase) * .45 * dpr; p.y += p.vy;
        const t = p.life / p.max;
        if (t >= 1 || p.y < -20) { spawn(p); continue; }
        const a = Math.sin(Math.PI * t) * (.55 + .45 * Math.sin(p.phase * 2.3));
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `hsla(${p.hue + 20}, 100%, 78%, ${a})`);
        g.addColorStop(.35, `hsla(${p.hue}, 100%, 55%, ${a * .55})`);
        g.addColorStop(1, 'hsla(14, 100%, 50%, 0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.2832); ctx.fill();
      }
    });
  }

  addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
