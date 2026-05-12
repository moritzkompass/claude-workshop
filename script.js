// Werkstatt KI — interactions
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = document.getElementById('nav');

  const targetSelectors = [
    '.hero__copy',
    '.hero__aside',
    '.hero__meta',
    '.section-head',
    '.quote',
    '.problem__bridge',
    '.bento__card',
    '.proof__stat',
    '.host',
    '.timeline__row',
    '.audience__card',
    '.price',
    '.faq__item',
    '.cta__bezel',
  ].join(',');

  // Avoid the reveal flash: elements already in viewport at load
  // are shown immediately without the hide → animate cycle.
  const inViewport = (el) => {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight * 0.95 && r.bottom > 0;
  };

  const elements = Array.from(document.querySelectorAll(targetSelectors));
  const toReveal = [];

  elements.forEach((el) => {
    if (reduce || inViewport(el)) {
      // Already visible (above-fold) or reduced motion — no animation.
      return;
    }
    el.classList.add('reveal');
    toReveal.push(el);
  });

  if ('IntersectionObserver' in window && toReveal.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
          .forEach((entry, idx) => {
            const el = entry.target;
            el.style.transitionDelay = `${Math.min(idx * 50, 200)}ms`;
            el.classList.add('is-in');
            io.unobserve(el);
          });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    toReveal.forEach((el) => io.observe(el));
  }

  // Nav scroll state
  const onScroll = () => {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 16);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Counters
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length && !reduce) {
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseFloat(el.getAttribute('data-count')) || 0;
          const duration = 1200;
          const start = performance.now();
          const easeOut = (t) => 1 - Math.pow(1 - t, 3);
          const tick = (now) => {
            const t = Math.min(1, (now - start) / duration);
            el.textContent = Math.round(easeOut(t) * target).toString();
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          co.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((c) => co.observe(c));
  }

  // Form
  const form = document.getElementById('form');
  const success = document.getElementById('form-success');
  if (form && success) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('[required]').forEach((input) => {
        const val = input.value.trim();
        const isEmail = input.type === 'email';
        const ok = val && (!isEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));
        input.style.borderColor = ok ? '' : 'rgba(255, 99, 71, 0.7)';
        if (!ok) valid = false;
      });
      if (!valid) return;
      form.style.display = 'none';
      success.hidden = false;
    });
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    });
  });
})();
