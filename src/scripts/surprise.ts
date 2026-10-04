import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initDecoderLens() {
  if (reduced || !window.matchMedia('(pointer:fine)').matches) return;
  const stage = document.querySelector<HTMLElement>('[data-noise-stage]');
  const lens = document.querySelector<HTMLElement>('[data-decoder-lens]');
  if (!stage || !lens) return;

  const label = lens.querySelector<HTMLElement>('span');
  const glyph = lens.querySelector<HTMLElement>('b');
  const fragments = Array.from(stage.querySelectorAll<HTMLElement>('.noise-fragment'));

  const xTo = gsap.quickTo(lens, 'x', { duration: .22, ease: 'power3' });
  const yTo = gsap.quickTo(lens, 'y', { duration: .22, ease: 'power3' });

  stage.addEventListener('pointermove', (event) => {
    const rect = stage.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    xTo(x - stage.clientWidth / 2);
    yTo(y - 55 * window.innerHeight / 100);

    const hit = fragments.some((fragment) => {
      const r = fragment.getBoundingClientRect();
      return event.clientX >= r.left && event.clientX <= r.right &&
        event.clientY >= r.top && event.clientY <= r.bottom;
    });

    lens.classList.toggle('is-hit', hit);
    if (label) label.textContent = hit ? 'SIGNAL / FOUND' : 'SCAN / SIGNAL';
    if (glyph) glyph.textContent = hit ? '!' : '?';
  });

  stage.addEventListener('pointerleave', () => {
    lens.classList.remove('is-hit');
    if (label) label.textContent = 'SCAN / SIGNAL';
    if (glyph) glyph.textContent = '?';
  });
}

type FounderKey = 'chidi' | 'michael';

function initLiveAsciiPortraits() {
  const canvases = Array.from(document.querySelectorAll<HTMLCanvasElement>('[data-ascii-canvas]'));
  if (!canvases.length) return;

  const image = new Image();
  image.src = '/media/founders-sprite.webp';

  image.addEventListener('load', () => {
    canvases.forEach((canvas) => {
      const founder = (canvas.dataset.founder || 'chidi') as FounderKey;
      const parent = canvas.closest<HTMLElement>('[data-person]');
      if (!parent) return;

      let frame = 0;
      let targetChars: Array<{ char: string; light: number; x: number; y: number }> = [];
      let cols = 0;
      let rows = 0;
      const charset = ' .,:;irsXA253hMHGS#9B&@';

      const measure = () => {
        const rect = canvas.getBoundingClientRect();
        const cssW = Math.max(180, rect.width);
        const cssH = Math.max(220, rect.height);
        const cell = Math.max(6, Math.min(10, Math.round(cssW / 64)));
        cols = Math.max(24, Math.floor(cssW / cell));
        rows = Math.max(30, Math.floor(cssH / (cell * 1.15)));

        canvas.width = Math.floor(cssW * Math.min(2, window.devicePixelRatio || 1));
        canvas.height = Math.floor(cssH * Math.min(2, window.devicePixelRatio || 1));
        canvas.style.width = cssW + 'px';
        canvas.style.height = cssH + 'px';

        const sample = document.createElement('canvas');
        sample.width = cols;
        sample.height = rows;
        const sctx = sample.getContext('2d', { willReadFrequently: true });
        if (!sctx) return;

        const halfW = image.naturalWidth / 2;
        const halfH = image.naturalHeight / 2;
        const sx = founder === 'michael' ? halfW : 0;
        const sy = 0;

        sctx.drawImage(image, sx, sy, halfW, halfH, 0, 0, cols, rows);
        const pixels = sctx.getImageData(0, 0, cols, rows).data;

        targetChars = [];
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const idx = (y * cols + x) * 4;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];
            const light = (r * .2126 + g * .7152 + b * .0722) / 255;
            const charIndex = Math.min(charset.length - 1, Math.floor((1 - light) * charset.length));
            targetChars.push({
              char: charset[charIndex],
              light,
              x,
              y
            });
          }
        }
        draw(1);
      };

      const draw = (progress: number) => {
        const ctx = canvas.getContext('2d');
        if (!ctx || !cols || !rows) return;

        const dpr = canvas.width / Math.max(1, canvas.getBoundingClientRect().width);
        const charW = canvas.width / cols;
        const charH = canvas.height / rows;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0d1014';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${Math.max(7, charH * .82)}px "IBM Plex Mono", monospace`;

        targetChars.forEach((cell, index) => {
          const resolved = progress >= 1 || ((index * 17 + Math.floor(progress * 100)) % 100) < progress * 100;
          const char = resolved
            ? cell.char
            : charset[Math.abs((index * 13 + frame * 7)) % charset.length];

          const brightness = Math.max(.13, cell.light);
          const blue = 130 + Math.round(brightness * 59);
          const green = 157 + Math.round(brightness * 32);
          const red = 65 + Math.round(brightness * 45);
          ctx.fillStyle = `rgba(${red},${green},${blue},${.38 + brightness * .62})`;
          ctx.fillText(char, cell.x * charW + charW / 2, cell.y * charH + charH / 2);
        });

        // one quiet scanner line makes the transformation feel processed, not filtered
        ctx.fillStyle = 'rgba(130,189,247,.18)';
        const scanY = ((frame * 3) % canvas.height);
        ctx.fillRect(0, scanY, canvas.width, Math.max(1, dpr));
      };

      let raf = 0;
      const animateIn = () => {
        cancelAnimationFrame(raf);
        const start = performance.now();
        const duration = 520;

        const tick = (now: number) => {
          frame += 1;
          const p = Math.min(1, (now - start) / duration);
          draw(1 - Math.pow(1 - p, 3));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      };

      parent.addEventListener('pointerenter', animateIn);
      parent.addEventListener('focus', animateIn);
      window.addEventListener('resize', () => {
        window.clearTimeout(Number(canvas.dataset.resizeTimer || 0));
        const timer = window.setTimeout(measure, 120);
        canvas.dataset.resizeTimer = String(timer);
      });

      measure();
    });
  });
}

function initArtifactMotion() {
  if (reduced) return;

  gsap.utils.toArray<HTMLElement>('.artifact').forEach((artifact, index) => {
    gsap.to(artifact, {
      yPercent: index % 2 ? -10 : 10,
      rotate: index % 2 ? '+=2' : '-=2',
      ease: 'none',
      scrollTrigger: {
        trigger: '.product-documentary',
        start: 'top bottom',
        end: 'bottom top',
        scrub: .8
      }
    });
  });

  const path = document.querySelector<SVGPathElement>('.artifact--scribble path');
  if (path) {
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(path, {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.artifact--scribble',
        start: 'top 82%',
        end: 'bottom 58%',
        scrub: .6
      }
    });
  }
}

function initSignalField() {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-signal-field]');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let raf = 0;

  // deterministic random so the final scene never jumps between reloads
  let seed = 912742;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const people = Array.from({ length: 125 }, (_, i) => ({
    x: rand(),
    y: .06 + rand() * .82,
    size: 2.5 + rand() * 5.4,
    phase: rand() * Math.PI * 2,
    blue: i % 11 === 0 || i % 17 === 0,
    lean: (rand() - .5) * .5
  }));

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
  };

  const drawPerson = (
    x: number,
    y: number,
    size: number,
    blue: boolean,
    lean: number,
    time: number,
    phase: number
  ) => {
    const drift = reduced ? 0 : Math.sin(time * .00045 + phase) * 2.4;
    const px = (x + drift) * dpr;
    const py = y * dpr;
    const s = size * dpr;

    ctx.strokeStyle = blue ? 'rgba(130,189,247,.82)' : 'rgba(255,255,255,.34)';
    ctx.fillStyle = blue ? 'rgba(130,189,247,.82)' : 'rgba(255,255,255,.38)';
    ctx.lineWidth = Math.max(1, .72 * dpr);

    ctx.beginPath();
    ctx.arc(px, py - s * 1.45, s * .38, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(px, py - s * .95);
    ctx.lineTo(px + lean * s, py + s * .85);
    ctx.moveTo(px, py - s * .25);
    ctx.lineTo(px - s * .72, py + s * .28);
    ctx.moveTo(px, py - s * .25);
    ctx.lineTo(px + s * .72, py + s * .28);
    ctx.moveTo(px + lean * s, py + s * .85);
    ctx.lineTo(px - s * .5, py + s * 1.75);
    ctx.moveTo(px + lean * s, py + s * .85);
    ctx.lineTo(px + s * .58, py + s * 1.75);
    ctx.stroke();
  };

  const render = (time = 0) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // subtle horizon glow
    const gradient = ctx.createLinearGradient(0, height * .3 * dpr, 0, height * .92 * dpr);
    gradient.addColorStop(0, 'rgba(130,189,247,0)');
    gradient.addColorStop(1, 'rgba(130,189,247,.035)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    people.forEach((person) => {
      drawPerson(
        person.x * width,
        person.y * height,
        person.size,
        person.blue,
        person.lean,
        time,
        person.phase
      );
    });

    if (!reduced) raf = requestAnimationFrame(render);
  };

  resize();
  render();
  window.addEventListener('resize', resize);
  window.addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
}

initDecoderLens();
initLiveAsciiPortraits();
initArtifactMotion();
initSignalField();
