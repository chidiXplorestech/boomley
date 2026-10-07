import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function encodeForm(form: HTMLFormElement) {
  const data = new FormData(form);
  return new URLSearchParams(
    Array.from(data.entries()).map(([key, value]) => [key, String(value)])
  ).toString();
}

async function postNetlifyForm(form: HTMLFormElement) {
  const response = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: encodeForm(form)
  });
  if (!response.ok) throw new Error(String(response.status));
}

function initBoot() {
  const boot = document.querySelector<HTMLElement>('[data-boot]');
  if (!boot || reduced) return;

  document.body.classList.add('is-loading');

  const count = boot.querySelector<HTMLElement>('[data-boot-count]');
  const phrase = boot.querySelector<HTMLElement>('[data-boot-phrase]');
  const logo = boot.querySelector<HTMLElement>('[data-boot-logo]');
  const welcome = boot.querySelector<HTMLElement>('[data-boot-welcome]');
  const phrases = ['PROBLEM.', 'THOUGHT.', 'IDEA.', 'REPEATS.', 'SIGNAL.'];

  const progress = { value: 0 };
  gsap.to(progress, {
    value: 100,
    duration: 3.05,
    ease: 'power1.inOut',
    onUpdate: () => {
      if (count) count.textContent = String(Math.round(progress.value)).padStart(3, '0');
    }
  });

  const tl = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    onComplete: () => {
      document.body.classList.remove('is-loading');
      ScrollTrigger.refresh();
    }
  });

  phrases.forEach((text, i) => {
    const at = i * .5;
    tl.to(phrase, { autoAlpha: 0, y: -10, duration: .14 }, at)
      .call(() => { if (phrase) phrase.textContent = text; }, undefined, at + .14)
      .fromTo(phrase, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .2 }, at + .16);
  });

  tl.to(phrase, { autoAlpha: 0, duration: .16 }, 2.54)
    .to(logo, { autoAlpha: 1, duration: .24 }, 2.68)
    .fromTo(logo, { scale: .95 }, { scale: 1, duration: .34, ease: 'power3.out' }, 2.68)
    .to(welcome, { autoAlpha: 1, duration: .18 }, 2.98)
    .to(boot, { clipPath: 'inset(0 0 100% 0)', duration: .62, ease: 'power4.inOut' }, 3.38)
    .set(boot, { display: 'none' });
}

function initHero() {
  if (reduced) return;
  const title = document.querySelector<HTMLElement>('.hero h1');
  if (!title) return;

  SplitText.create(title, {
    type: 'lines,words',
    mask: 'lines',
    autoSplit: true,
    onSplit(self) {
      return gsap.timeline({ delay: 3.75, defaults: { ease: 'power4.out' } })
        .from(self.lines, { yPercent: 112, duration: .88, stagger: .06 })
        .from('.kicker,.hero__deck,.hero__foot', { y: 18, autoAlpha: 0, stagger: .07, duration: .44 }, .24)
        .from('.hero-photo', { y: 38, scale: .97, autoAlpha: 0, stagger: .08, duration: .72 }, .12)
        .from('.hero__scribble,.signal-module', { scale: .82, autoAlpha: 0, stagger: .07, duration: .38 }, .5);
    }
  });

  gsap.to('.hero-photo--a', {
    yPercent: -7,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .7 }
  });
  gsap.to('.hero-photo--b', {
    yPercent: 8,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .7 }
  });
}

function initFounderRotation() {
  const hero = document.querySelector<HTMLElement>('[data-founder-rotator]');
  const people = document.querySelector<HTMLElement>('[data-people-rotator]');
  if (!hero || !people || reduced) return;

  let swapped = false;
  const rotate = () => {
    swapped = !swapped;
    hero.classList.toggle('is-swapped', swapped);
    people.classList.toggle('is-swapped', swapped);
  };

  window.setTimeout(() => {
    rotate();
    window.setInterval(rotate, 8000);
  }, 7000);
}

function initScanner() {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-scanner-canvas]');
  const scanner = document.querySelector<HTMLElement>('[data-scanner]');
  const reticle = document.querySelector<HTMLElement>('[data-reticle]');
  if (!canvas || !scanner || !reticle) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let raf = 0;
  let time = 0;
  const symbols = '01.:;#@/\\<>[]{}+*';

  let seed = 8731;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const nodes = Array.from({ length: 110 }, () => ({
    x: rand(),
    y: rand(),
    s: 8 + rand() * 10,
    a: .15 + rand() * .65,
    p: rand() * Math.PI * 2,
    c: symbols[Math.floor(rand() * symbols.length)]
  }));

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0b0d10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    nodes.forEach((node, i) => {
      const driftX = reduced ? 0 : Math.sin(time * .003 + node.p) * 8;
      const driftY = reduced ? 0 : Math.cos(time * .002 + node.p) * 5;
      const x = (node.x * width + driftX) * dpr;
      const y = (node.y * height + driftY) * dpr;

      ctx.font = `${node.s * dpr}px "IBM Plex Mono", monospace`;
      ctx.fillStyle = i % 17 === 0
        ? `rgba(242,201,76,${node.a})`
        : `rgba(118,184,245,${node.a})`;
      ctx.fillText(node.c, x, y);
    });

    ctx.strokeStyle = 'rgba(118,184,245,.12)';
    ctx.lineWidth = 1 * dpr;
    for (let i = 0; i < 24; i++) {
      const y = (i / 24) * height * dpr;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    time++;
    if (!reduced) raf = requestAnimationFrame(draw);
  };

  resize();
  draw();

  if (!reduced) {
    gsap.to(reticle, { rotate: 360, duration: 18, ease: 'none', repeat: -1 });

    ScrollTrigger.create({
      trigger: scanner,
      start: 'top 58%',
      end: 'bottom 42%',
      onEnter: () => {
        const s = reticle.querySelector('span');
        if (s) s.textContent = 'SIGNAL FOUND';
      },
      onLeaveBack: () => {
        const s = reticle.querySelector('span');
        if (s) s.textContent = 'SEARCHING';
      }
    });
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
}

function initProcess() {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-step]'));
  const panels = Array.from(document.querySelectorAll<HTMLElement>('[data-step-panel]'));
  if (!buttons.length || !panels.length) return;

  let active = 0;

  const show = (index: number) => {
    if (index === active && panels[index]?.classList.contains('is-active')) return;
    active = index;
    buttons.forEach((button, i) => button.classList.toggle('is-active', i === index));
    panels.forEach((panel, i) => {
      if (i === index) {
        panel.classList.add('is-active');
        if (!reduced) {
          gsap.fromTo(panel, { autoAlpha: 0, y: 28, scale: .985 }, { autoAlpha: 1, y: 0, scale: 1, duration: .52, ease: 'power3.out' });
        }
      } else {
        panel.classList.remove('is-active');
      }
    });
  };

  buttons.forEach((button, i) => button.addEventListener('click', () => show(i)));

  if (!reduced) {
    const process = document.querySelector<HTMLElement>('.process');
    if (process) {
      ScrollTrigger.create({
        trigger: process,
        start: 'top 30%',
        end: 'bottom 40%',
        onUpdate: (self) => {
          const index = Math.min(panels.length - 1, Math.floor(self.progress * panels.length));
          show(index);
        }
      });
    }
  }
}

type FounderKey = 'chidi' | 'michael';

function initAsciiPortraits() {
  const canvases = Array.from(document.querySelectorAll<HTMLCanvasElement>('[data-founder-ascii]'));
  if (!canvases.length) return;

  canvases.forEach((canvas) => {
    const founder = (canvas.dataset.founderAscii || 'chidi') as FounderKey;
    const card = canvas.closest<HTMLElement>('.person');
    if (!card) return;

    const image = new Image();
    image.decoding = 'async';
    image.src = founder === 'michael' ? '/media/founders/michael.webp' : '/media/founders/chidi.webp';

    image.addEventListener('load', () => {
      const charset = ' .,:;irsXA253hMHGS#9B&@';
      let cells: Array<{ char:string; light:number; x:number; y:number }> = [];
      let cols = 0;
      let rows = 0;
      let frame = 0;
      let raf = 0;

      const measure = () => {
        const rect = canvas.getBoundingClientRect();
        const w = Math.max(220, rect.width);
        const h = Math.max(220, rect.height);
        const cell = Math.max(6, Math.min(10, Math.round(w / 62)));
        cols = Math.max(28, Math.floor(w / cell));
        rows = Math.max(28, Math.floor(h / (cell * 1.05)));
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);

        const sample = document.createElement('canvas');
        sample.width = cols;
        sample.height = rows;
        const sctx = sample.getContext('2d', { willReadFrequently:true });
        if (!sctx) return;

        const src = Math.min(image.naturalWidth, image.naturalHeight);
        const sx = (image.naturalWidth - src) / 2;
        const sy = (image.naturalHeight - src) / 2;
        sctx.drawImage(image, sx, sy, src, src, 0, 0, cols, rows);

        const px = sctx.getImageData(0, 0, cols, rows).data;
        cells = [];
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const i = (y * cols + x) * 4;
            const light = (px[i] * .2126 + px[i + 1] * .7152 + px[i + 2] * .0722) / 255;
            const charIndex = Math.min(charset.length - 1, Math.floor((1 - light) * charset.length));
            cells.push({ char: charset[charIndex], light, x, y });
          }
        }
        draw(1);
      };

      const draw = (progress: number) => {
        const ctx = canvas.getContext('2d');
        if (!ctx || !cols || !rows) return;

        const cw = canvas.width / cols;
        const ch = canvas.height / rows;

        ctx.fillStyle = '#0c0f13';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${Math.max(7, ch * .82)}px "IBM Plex Mono", monospace`;

        cells.forEach((cell, index) => {
          const resolved = progress >= 1 || ((index * 17 + Math.floor(progress * 100)) % 100) < progress * 100;
          const char = resolved ? cell.char : charset[(index * 13 + frame * 7) % charset.length];
          const l = Math.max(.12, cell.light);
          const r = 52 + Math.round(l * 75);
          const g = 115 + Math.round(l * 75);
          const b = 180 + Math.round(l * 68);
          ctx.fillStyle = `rgba(${r},${g},${b},${.34 + l * .66})`;
          ctx.fillText(char, cell.x * cw + cw / 2, cell.y * ch + ch / 2);
        });

        ctx.fillStyle = 'rgba(242,201,76,.18)';
        ctx.fillRect(0, (frame * 4) % canvas.height, canvas.width, Math.max(1, canvas.width / 800));
      };

      const animate = () => {
        cancelAnimationFrame(raf);
        const start = performance.now();

        const tick = (now: number) => {
          frame++;
          const p = Math.min(1, (now - start) / 540);
          draw(1 - Math.pow(1 - p, 3));
          if (p < 1) raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
      };

      card.addEventListener('pointerenter', animate);
      card.addEventListener('focusin', animate);
      measure();

      let timer = 0;
      window.addEventListener('resize', () => {
        window.clearTimeout(timer);
        timer = window.setTimeout(measure, 120);
      });
    });
  });
}

function initBuilds() {
  if (reduced) return;

  gsap.utils.toArray<HTMLElement>('.artifact').forEach((el, i) => {
    gsap.to(el, {
      yPercent: i % 2 ? -8 : 8,
      rotate: i % 2 ? '+=1.5' : '-=1.5',
      ease: 'none',
      scrollTrigger: { trigger: '.builds__collage', start: 'top bottom', end: 'bottom top', scrub: .8 }
    });
  });
}

function initReveals() {
  if (reduced) return;

  const targets = gsap.utils.toArray<HTMLElement>(
    '.chapter,.history>h2,.people>h2,.community__headline h2,.community__headline>p,.builds__hero p,.builds__status,.waitlist,.signal__head,.letter,.posting'
  );

  targets.forEach((el) => {
    gsap.from(el, {
      y: 30,
      autoAlpha: 0,
      duration: .75,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });
}

function initEndingField() {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-ending-field]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let seed = 91822;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const people = Array.from({ length: 140 }, (_, i) => ({
    x: rand(),
    y: .07 + rand() * .85,
    s: 2.2 + rand() * 5.2,
    phase: rand() * Math.PI * 2,
    signal: i % 13 === 0 || i % 19 === 0
  }));

  let w = 0;
  let h = 0;
  let dpr = 1;
  let raf = 0;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
  };

  const render = (time = 0) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    people.forEach((p) => {
      const drift = reduced ? 0 : Math.sin(time * .00045 + p.phase) * 2.1;
      const x = (p.x * w + drift) * dpr;
      const y = p.y * h * dpr;
      const s = p.s * dpr;

      ctx.strokeStyle = p.signal ? 'rgba(242,201,76,.82)' : 'rgba(255,255,255,.26)';
      ctx.fillStyle = p.signal ? 'rgba(242,201,76,.86)' : 'rgba(255,255,255,.29)';
      ctx.lineWidth = Math.max(1, .7 * dpr);

      ctx.beginPath();
      ctx.arc(x, y - s * 1.35, s * .34, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x, y - s * .9);
      ctx.lineTo(x, y + s * .8);
      ctx.moveTo(x, y - s * .15);
      ctx.lineTo(x - s * .6, y + s * .2);
      ctx.moveTo(x, y - s * .15);
      ctx.lineTo(x + s * .6, y + s * .2);
      ctx.moveTo(x, y + s * .8);
      ctx.lineTo(x - s * .45, y + s * 1.65);
      ctx.moveTo(x, y + s * .8);
      ctx.lineTo(x + s * .45, y + s * 1.65);
      ctx.stroke();
    });

    if (!reduced) raf = requestAnimationFrame(render);
  };

  resize();
  render();

  window.addEventListener('resize', resize);
  window.addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
}

function initForms() {
  const waitlist = document.querySelector<HTMLFormElement>('form[name="product-0001"]');
  const waitStatus = waitlist?.querySelector<HTMLElement>('[data-product-status]');

  if (waitlist && waitStatus) {
    waitlist.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!waitlist.reportValidity()) return;

      waitStatus.textContent = 'TRANSMITTING...';

      try {
        await postNetlifyForm(waitlist);
        waitStatus.textContent = 'RECEIVED / WE\'LL KEEP YOU CLOSE.';
        waitlist.reset();
      } catch {
        waitStatus.textContent = 'TRANSMISSION FAILED / TRY AGAIN.';
      }
    });
  }

  const form = document.querySelector<HTMLFormElement>('[data-signal-form]');
  const wrap = document.querySelector<HTMLButtonElement>('[data-wrap]');
  const post = document.querySelector<HTMLButtonElement>('[data-post]');
  const envelope = document.querySelector<HTMLElement>('[data-envelope]');
  const box = document.querySelector<HTMLElement>('[data-postbox]');
  const status = document.querySelector<HTMLElement>('[data-signal-status]');

  if (!form || !wrap || !post || !envelope || !box || !status) return;

  let wrapped = false;

  wrap.addEventListener('click', () => {
    if (!form.reportValidity()) return;

    wrapped = true;
    wrap.disabled = true;
    post.disabled = false;
    envelope.classList.add('is-ready');
    status.textContent = 'LETTER READY / NOW POST IT.';

    if (reduced) return;

    const paper = envelope.querySelector<HTMLElement>('.envelope__paper');
    const flap = envelope.querySelector<HTMLElement>('.envelope__flap');

    gsap.timeline({ defaults: { ease: 'power3.inOut' } })
      .fromTo(envelope, { autoAlpha: 0, scale: .68, rotate: -11 }, { autoAlpha: 1, scale: 1, rotate: -4, duration: .58 })
      .to(paper, { y: 35, scaleY: .7, duration: .42 }, .13)
      .fromTo(flap, { rotateX: 0 }, { rotateX: -176, transformOrigin: 'top center', duration: .48 }, .4)
      .to(envelope, { rotate: 0, duration: .25 }, .72);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!wrapped || !form.reportValidity()) return;

    post.disabled = true;
    status.textContent = 'POSTING SIGNAL...';

    const slot = box.querySelector<HTMLElement>('.postbox__slot');
    const er = envelope.getBoundingClientRect();
    const sr = slot?.getBoundingClientRect();

    if (!reduced && sr) {
      const dx = (sr.left + sr.width / 2) - (er.left + er.width / 2);
      const dy = (sr.top + sr.height / 2) - (er.top + er.height / 2);

      await new Promise<void>((resolve) => {
        gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: resolve })
          .to(envelope, { x: dx, y: dy, rotate: -3, scale: .58, duration: .85 })
          .to(envelope, { scaleX: .43, scaleY: .08, autoAlpha: .1, duration: .34, ease: 'power2.in' })
          .to(box, { y: 3, scale: .993, duration: .1, yoyo: true, repeat: 1 }, '<');
      });
    }

    try {
      await postNetlifyForm(form);
      status.textContent = 'SIGNAL RECEIVED / WE\'LL LISTEN.';
      form.reset();
      wrapped = false;

      setTimeout(() => {
        wrap.disabled = false;
        post.disabled = true;
        envelope.classList.remove('is-ready');
        gsap.set(envelope, { clearProps: 'all' });
        gsap.set(envelope.querySelector('.envelope__paper'), { clearProps: 'all' });
        gsap.set(envelope.querySelector('.envelope__flap'), { clearProps: 'all' });
        status.textContent = '';
      }, 2400);
    } catch {
      status.textContent = 'SIGNAL COULD NOT BE POSTED / TRY AGAIN.';
      post.disabled = false;
      if (!reduced) {
        gsap.to(envelope, { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1, autoAlpha: 1, duration: .5 });
      }
    }
  });
}

function initAnchors() {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });
  });
}

initBoot();
initHero();
initFounderRotation();
initScanner();
initProcess();
initAsciiPortraits();
initBuilds();
initReveals();
initEndingField();
initForms();
initAnchors();
