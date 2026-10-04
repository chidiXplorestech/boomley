import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function encodeForm(form: HTMLFormElement) {
  const data = new FormData(form);
  return new URLSearchParams(Array.from(data.entries()).map(([key, value]) => [key, String(value)])).toString();
}

async function postNetlifyForm(form: HTMLFormElement) {
  const response = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: encodeForm(form)
  });
  if (!response.ok) throw new Error('Form failed: ' + response.status);
}

function initCursor() {
  if (reduced || !window.matchMedia('(pointer:fine)').matches) return;
  const cursor = document.querySelector<HTMLElement>('.cursor');
  if (!cursor) return;
  const xTo = gsap.quickTo(cursor, 'x', { duration: .18, ease: 'power3' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: .18, ease: 'power3' });

  window.addEventListener('pointermove', (event) => {
    cursor.style.opacity = '1';
    xTo(event.clientX);
    yTo(event.clientY);
  });

  document.querySelectorAll('a,button,input,textarea,[tabindex]').forEach((el) => {
    el.addEventListener('mouseenter', () => gsap.to(cursor, { scale: 1.9, duration: .2 }));
    el.addEventListener('mouseleave', () => gsap.to(cursor, { scale: 1, duration: .2 }));
  });
}

function initCover() {
  if (reduced) return;

  const title = document.querySelector<HTMLElement>('[data-split]');
  if (title) {
    SplitText.create(title, {
      type: 'lines,words',
      mask: 'lines',
      autoSplit: true,
      onSplit(self) {
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
        tl.from(self.lines, { yPercent: 118, rotate: 1.4, duration: 1.05, stagger: .08 })
          .from('.cover__meta', { y: 12, autoAlpha: 0, duration: .45 }, .08)
          .from('.cover__standfirst', { y: 20, autoAlpha: 0, duration: .55 }, .34)
          .from('.cover-portrait--a', { x: 58, y: 38, rotate: 4, autoAlpha: 0, duration: .9 }, .24)
          .from('.cover-portrait--b', { x: -48, y: -20, rotate: -3, autoAlpha: 0, duration: .9 }, .38)
          .from('.cover__annotation,.cover__mark', { scale: .82, autoAlpha: 0, stagger: .08, duration: .5 }, .64)
          .from('.cover__bottom', { y: 22, autoAlpha: 0, duration: .6 }, .72);
        return tl;
      }
    });
  }

  gsap.to('.cover-portrait--a', {
    yPercent: -8,
    ease: 'none',
    scrollTrigger: { trigger: '.cover', start: 'top top', end: 'bottom top', scrub: .8 }
  });

  gsap.to('.cover-portrait--b', {
    yPercent: 10,
    ease: 'none',
    scrollTrigger: { trigger: '.cover', start: 'top top', end: 'bottom top', scrub: .8 }
  });
}

function initRevealScenes() {
  if (reduced) return;

  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    if (el.closest('.cover')) return;
    gsap.from(el, {
      y: 42,
      autoAlpha: 0,
      duration: .85,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  const evidence = document.querySelector<HTMLElement>('[data-evidence-stack]');
  if (evidence) {
    gsap.from(Array.from(evidence.children), {
      y: 70,
      rotate: (i) => i === 1 ? -3 : i === 2 ? 3 : -1,
      autoAlpha: 0,
      stagger: .13,
      duration: .85,
      ease: 'power3.out',
      scrollTrigger: { trigger: evidence, start: 'top 82%', once: true }
    });
  }

  const rail = document.querySelector<HTMLElement>('[data-build-progress]');
  if (rail) {
    gsap.to(rail, {
      width: '40%',
      ease: 'none',
      scrollTrigger: { trigger: '[data-build-line]', start: 'top 82%', end: 'center 58%', scrub: .7 }
    });
  }
}

function initNoiseScene() {
  const chapter = document.querySelector<HTMLElement>('[data-noise-chapter]');
  if (!chapter || reduced) return;

  const fragments = gsap.utils.toArray<HTMLElement>('[data-fragment]');
  const reveal = chapter.querySelector<HTMLElement>('.noise-chapter__reveal');
  const process = chapter.querySelector<HTMLElement>('.signal-process');
  if (!reveal || !process) return;

  gsap.set(fragments, { autoAlpha: 0, scale: .86 });
  gsap.set(reveal, { autoAlpha: 0, scale: .96 });
  gsap.set(process, { autoAlpha: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: chapter,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.1
    }
  });

  tl.to(fragments, {
    autoAlpha: 1,
    scale: 1,
    stagger: .08,
    duration: .7,
    ease: 'power2.out'
  })
  .to(fragments, {
    x: (i) => i % 2 ? -55 : 55,
    y: (i) => i % 3 ? -35 : 42,
    rotate: (i) => i % 2 ? -5 : 5,
    duration: .75,
    stagger: .03,
    ease: 'sine.inOut'
  })
  .to(fragments, {
    autoAlpha: 0,
    scale: 1.5,
    filter: 'blur(8px)',
    duration: .55,
    stagger: .025,
    ease: 'power2.in'
  })
  .to(reveal, { autoAlpha: 1, scale: 1, duration: .7, ease: 'power3.out' }, '-=.1')
  .to(process, { autoAlpha: 1, duration: .35 }, '-=.2')
  .to(reveal, { scale: 1.025, duration: .7, ease: 'none' });
}

function renderAscii(canvas: HTMLCanvasElement, sprite: HTMLImageElement, quadrant: string) {
  const parent = canvas.parentElement;
  if (!parent) return;

  const cssWidth = Math.max(1, Math.floor(parent.clientWidth));
  const cssHeight = Math.max(1, Math.floor(parent.clientHeight));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const sample = document.createElement('canvas');
  const columns = cssWidth < 560 ? 56 : 86;
  const rows = Math.max(28, Math.round(columns * cssHeight / cssWidth * .48));
  sample.width = columns;
  sample.height = rows;
  const sctx = sample.getContext('2d', { willReadFrequently: true });
  if (!sctx) return;

  const halfW = sprite.naturalWidth / 2;
  const halfH = sprite.naturalHeight / 2;
  const sx = quadrant === 'michael' ? halfW : 0;
  const sy = 0;

  sctx.drawImage(sprite, sx, sy, halfW, halfH, 0, 0, columns, rows);
  const pixels = sctx.getImageData(0, 0, columns, rows).data;
  const chars = '@%#*+=-:. ';
  const cellW = cssWidth / columns;
  const cellH = cssHeight / rows;

  ctx.fillStyle = '#090B10';
  ctx.fillRect(0, 0, cssWidth, cssHeight);
  ctx.textBaseline = 'top';
  ctx.textAlign = 'center';
  ctx.font = `${Math.ceil(cellH * 1.02)}px "IBM Plex Mono", monospace`;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const i = (y * columns + x) * 4;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const brightness = (r * .2126 + g * .7152 + b * .0722) / 255;
      const char = chars[Math.min(chars.length - 1, Math.floor((1 - brightness) * chars.length))];
      const alpha = .46 + brightness * .54;
      ctx.fillStyle = `rgba(137,189,245,${alpha})`;
      ctx.fillText(char, x * cellW + cellW / 2, y * cellH);
    }
  }
}

function initFounders() {
  const sprite = new Image();
  sprite.src = '/media/founders-sprite.webp';

  const canvases = Array.from(document.querySelectorAll<HTMLCanvasElement>('[data-ascii-canvas]'));
  const drawAll = () => canvases.forEach((canvas) => renderAscii(canvas, sprite, canvas.dataset.quadrant || 'chidi'));

  if (sprite.complete) drawAll();
  else sprite.addEventListener('load', drawAll, { once: true });

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(drawAll, 140);
  });

  document.querySelectorAll<HTMLElement>('[data-founder-card]').forEach((card) => {
    const media = card.querySelector<HTMLElement>('[data-founder-media]');

    card.addEventListener('pointermove', (event) => {
      if (reduced || !media || !window.matchMedia('(pointer:fine)').matches) return;
      const rect = card.getBoundingClientRect();
      const rx = ((event.clientY - rect.top) / rect.height - .5) * -4.5;
      const ry = ((event.clientX - rect.left) / rect.width - .5) * 4.5;
      gsap.to(media, { rotateX: rx, rotateY: ry, transformPerspective: 950, duration: .35, ease: 'power2.out' });
    });

    card.addEventListener('pointerleave', () => {
      if (!media) return;
      gsap.to(media, { rotateX: 0, rotateY: 0, duration: .45, ease: 'power3.out' });
    });
  });
}

function initTraveller() {
  const traveller = document.querySelector<HTMLElement>('[data-signal-traveller]');
  const main = document.querySelector<HTMLElement>('main');
  if (!traveller || !main || reduced || window.innerWidth < 721) return;

  gsap.timeline({
    scrollTrigger: {
      trigger: main,
      start: 'top top',
      end: 'bottom bottom',
      scrub: .9
    }
  })
  .to(traveller, { x: '74vw', y: '10vh', rotate: 8, duration: 1 })
  .to(traveller, { x: '18vw', y: '62vh', rotate: -12, duration: 1 })
  .to(traveller, { x: '68vw', y: '42vh', rotate: 6, duration: 1 })
  .to(traveller, { x: '36vw', y: '70vh', rotate: -4, duration: 1 })
  .to(traveller, { x: '78vw', y: '54vh', rotate: 3, autoAlpha: .9, duration: .7 })
  .to(traveller, { autoAlpha: 0, scale: .7, duration: .3 });
}

function initWaitlist() {
  const form = document.querySelector<HTMLFormElement>('form[name="declutter-waitlist"]');
  const status = form?.querySelector<HTMLElement>('[data-form-status]');
  if (!form || !status) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    status.textContent = 'TRANSMITTING...';
    try {
      await postNetlifyForm(form);
      status.textContent = 'RECEIVED / YOU ARE ON THE PRODUCT 001 EARLY-ACCESS LIST.';
      form.reset();
    } catch {
      status.textContent = 'TRANSMISSION FAILED / PLEASE TRY AGAIN.';
    }
  });
}

function initSignalBox() {
  const form = document.querySelector<HTMLFormElement>('[data-signal-form]');
  const wrapButton = document.querySelector<HTMLButtonElement>('[data-wrap-button]');
  const postButton = document.querySelector<HTMLButtonElement>('[data-post-button]');
  const envelope = document.querySelector<HTMLElement>('[data-blue-envelope]');
  const box = document.querySelector<HTMLElement>('[data-pillar-box]');
  const status = document.querySelector<HTMLElement>('[data-signal-status]');
  const steps = Array.from(document.querySelectorAll<HTMLElement>('[data-step]'));
  if (!form || !wrapButton || !postButton || !envelope || !box || !status) return;

  const paper = envelope.querySelector<HTMLElement>('.signal-object__paper');
  const flap = envelope.querySelector<HTMLElement>('.signal-object__flap');
  const activateStep = (n: number) => steps.forEach((step) => step.classList.toggle('is-active', step.dataset.step === String(n)));

  let wrapped = false;

  wrapButton.addEventListener('click', () => {
    if (!form.reportValidity()) return;
    wrapped = true;
    activateStep(2);
    postButton.disabled = false;
    wrapButton.disabled = true;
    status.textContent = 'LETTER WRAPPED / READY TO POST.';
    envelope.classList.add('is-ready');

    if (!reduced) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
      tl.to(form, { scaleY: .88, rotateX: 5, duration: .2, transformOrigin: 'center center' })
        .to(form, { scaleY: .7, scaleX: .93, duration: .25 })
        .to(form, { autoAlpha: .42, y: 18, duration: .25 }, '<')
        .fromTo(envelope, { scale: .72, rotate: -10, autoAlpha: 0 }, { scale: 1, rotate: -3, autoAlpha: 1, duration: .55 }, '-=.2')
        .to(paper, { y: 32, scaleY: .74, duration: .38 }, '-=.3')
        .fromTo(flap, { rotateX: 0 }, { rotateX: -168, transformOrigin: 'top center', duration: .48 }, '-=.08')
        .to(envelope, { rotate: 0, duration: .26 });
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!wrapped || !form.reportValidity()) return;

    activateStep(3);
    postButton.disabled = true;
    status.textContent = 'POSTING SIGNAL...';

    const slot = box.querySelector<HTMLElement>('.pillar-box__slot');
    const envelopeRect = envelope.getBoundingClientRect();
    const slotRect = slot?.getBoundingClientRect();

    if (!reduced && slotRect) {
      const dx = (slotRect.left + slotRect.width / 2) - (envelopeRect.left + envelopeRect.width / 2);
      const dy = (slotRect.top + slotRect.height / 2) - (envelopeRect.top + envelopeRect.height / 2);

      await new Promise<void>((resolve) => {
        gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: resolve })
          .to(envelope, { x: dx, y: dy, rotate: -3, scale: .54, duration: .9 })
          .to(envelope, { scaleY: .08, scaleX: .42, autoAlpha: .16, duration: .36, ease: 'power2.in' })
          .to(box, { scale: .985, duration: .1, yoyo: true, repeat: 1 }, '<');
      });
    }

    try {
      await postNetlifyForm(form);
      status.textContent = 'SIGNAL RECEIVED / WE\'LL LISTEN.';
      form.reset();
      wrapped = false;

      setTimeout(() => {
        activateStep(1);
        wrapButton.disabled = false;
        postButton.disabled = true;
        envelope.classList.remove('is-ready');
        gsap.set(form, { clearProps: 'transform,opacity,visibility' });
        gsap.set(envelope, { clearProps: 'transform,opacity,visibility' });
        gsap.set(paper, { clearProps: 'transform' });
        gsap.set(flap, { clearProps: 'transform' });
        status.textContent = '';
      }, 2600);
    } catch {
      status.textContent = 'SIGNAL COULD NOT BE POSTED / PLEASE TRY AGAIN.';
      postButton.disabled = false;
      if (!reduced) {
        gsap.to(envelope, { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1, autoAlpha: 1, duration: .5 });
      }
    }
  });
}

function initAnchorLinks() {
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

initCursor();
initCover();
initRevealScenes();
initNoiseScene();
initFounders();
initTraveller();
initWaitlist();
initSignalBox();
initAnchorLinks();

window.addEventListener('load', () => ScrollTrigger.refresh());
