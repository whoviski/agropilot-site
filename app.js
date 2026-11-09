(() => {
  const rm = document.documentElement.classList.contains('rm');
  const nav = document.getElementById('topnav');
  const ul = nav.querySelector('ul');
  const burger = nav.querySelector('.burger');

  const setMenu = (open) => {
    ul.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  };
  burger.addEventListener('click', () => setMenu(!ul.classList.contains('open')));
  ul.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });

  const sections = [...document.querySelectorAll('section[id]')];
  const links = [...ul.querySelectorAll('a')];
  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        reveal.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((section) => reveal.observe(section));

    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = '#' + entry.target.id;
        links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((section) => spy.observe(section));
  } else {
    document.querySelectorAll('.reveal').forEach((section) => section.classList.add('in'));
  }

  const bar = document.querySelector('.scroller');
  const onScroll = () => {
    const height = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (height > 0 ? scrollY / height : 0) + ')';
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const lb = document.getElementById('lb');
  const lbImg = lb.querySelector('img');
  const lbText = lb.querySelector('p');
  const lbClose = lb.querySelector('button');
  let lastFocus = null;
  const closeLb = () => {
    lb.hidden = true;
    lbImg.removeAttribute('src');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };
  document.querySelectorAll('img.zoom').forEach((img) => {
    img.addEventListener('click', () => {
      lastFocus = img;
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbText.textContent = img.alt;
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    });
  });
  lb.addEventListener('click', (e) => { if (e.target !== lbImg) closeLb(); });
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!lb.hidden) closeLb();
    setMenu(false);
  });

  const filters = [...document.querySelectorAll('.filters button')];
  const figures = [...document.querySelectorAll('.gal figure')];
  filters.forEach((button) => {
    button.addEventListener('click', () => {
      const group = button.dataset.filter;
      filters.forEach((item) => {
        const on = item === button;
        item.classList.toggle('on', on);
        item.setAttribute('aria-pressed', String(on));
      });
      figures.forEach((figure) => {
        figure.hidden = group !== 'all' && figure.dataset.group !== group;
      });
    });
  });

  document.querySelectorAll('.faq details').forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      document.querySelectorAll('.faq details').forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });

  const format = (value, digits) => value.toLocaleString('ru-RU', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
  const runCounter = (el) => {
    const target = +el.dataset.to;
    const digits = +el.dataset.dec;
    const suffix = el.dataset.suf || '';
    if (rm) {
      el.textContent = format(target, digits) + suffix;
      return;
    }
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - start) / 1400);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = format(target * eased, digits) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counters = document.querySelectorAll('[data-to]');
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach(runCounter);
  }

  const scene = document.querySelector('.scene');
  if (scene && !rm) {
    const stageInputs = [...scene.querySelectorAll('input[name="stage"]')];
    let timer = 0;
    let locked = false;
    const visible = { current: true };
    const stop = () => { locked = true; clearInterval(timer); };
    const stages = scene.querySelector('.stages');
    stages.addEventListener('change', stop);
    stages.addEventListener('click', stop);
    stages.addEventListener('focusin', stop);
    if (!stageInputs.some((input) => input.checked)) stageInputs[0].checked = true;
    const tick = () => {
      if (locked || !visible.current || document.hidden) return;
      const current = stageInputs.findIndex((input) => input.checked);
      const next = stageInputs[(current + 1) % stageInputs.length];
      next.checked = true;
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => { visible.current = entries[0].isIntersecting; }).observe(scene);
    }
    timer = setInterval(tick, 3400);
  }

  const canvas = document.getElementById('fx');
  const fine = matchMedia('(pointer: fine)').matches && innerWidth > 900;
  if (!rm && fine) {
    const hero = document.querySelector('.hero');
    const layers = [...hero.querySelectorAll('[data-depth]')];
    let mx = 0;
    let my = 0;
    let sy = 0;
    let ticking = false;
    const render = () => {
      ticking = false;
      const rect = hero.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) return;
      layers.forEach((layer) => {
        const depth = +layer.dataset.depth;
        layer.style.transform = 'translate3d(' + (mx * depth * 28) + 'px,' + (my * depth * 16 + sy * depth * 0.35) + 'px,0)';
      });
    };
    const requestRender = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(render);
      }
    };
    addEventListener('scroll', () => { sy = scrollY; requestRender(); }, { passive: true });
    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect();
      mx = (event.clientX - rect.left) / rect.width - 0.5;
      my = (event.clientY - rect.top) / rect.height - 0.5;
      requestRender();
    });
    hero.addEventListener('pointerleave', () => { mx = 0; my = 0; requestRender(); });
  }

  if (!canvas || rm) return;
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let dots = [];
  const colors = ['rgba(255,255,255,.75)', 'rgba(250,204,21,.8)', 'rgba(163,230,53,.75)', 'rgba(125,211,252,.8)', 'rgba(251,113,133,.7)'];
  const resize = () => {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
    const count = Math.min(36, Math.max(12, width / 36 | 0));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 2.2 + 0.8,
      c: colors[Math.random() * colors.length | 0]
    }));
  };
  resize();
  addEventListener('resize', resize);
  let canvasVisible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => { canvasVisible = entries[0].isIntersecting; }).observe(canvas);
  }
  const frame = () => {
    requestAnimationFrame(frame);
    if (!canvasVisible || document.hidden) return;
    ctx.clearRect(0, 0, width, height);
    dots.forEach((dot) => {
      dot.x = (dot.x + dot.vx + width) % width;
      dot.y = (dot.y + dot.vy + height) % height;
      ctx.fillStyle = dot.c;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
      ctx.fill();
    });
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const a = dots[i];
        const b = dots[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 110) {
          ctx.strokeStyle = 'rgba(255,255,255,' + (0.18 * (1 - dist / 110)) + ')';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  };
  requestAnimationFrame(frame);
})();
