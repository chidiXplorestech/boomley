import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initCursor() {
  if (reduced || !window.matchMedia('(pointer:fine)').matches) return;
  const cursor = document.querySelector<HTMLElement>('.cursor');
  if (!cursor) return;
  const xTo = gsap.quickTo(cursor, 'x', { duration: .2, ease: 'power3' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: .2, ease: 'power3' });
  window.addEventListener('pointermove', (event) => {
    cursor.style.opacity = '1';
    xTo(event.clientX);
    yTo(event.clientY);
  });
  document.querySelectorAll('a,button,input,textarea,.envelope').forEach((el) => {
    el.addEventListener('mouseenter', () => gsap.to(cursor, { scale: 1.8, duration: .2 }));
    el.addEventListener('mouseleave', () => gsap.to(cursor, { scale: 1, duration: .2 }));
  });
}

function initHero() {
  if (reduced) return;
  const title = document.querySelector<HTMLElement>('[data-split]');
  if (!title) return;
  SplitText.create(title, {
    type: 'lines,words',
    mask: 'lines',
    autoSplit: true,
    onSplit(self) {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.from(self.lines, { yPercent: 115, rotate: 1.2, duration: 1.15, stagger: .08 })
        .from('.hero .eyebrow', { y: 15, autoAlpha: 0, duration: .55 }, .15)
        .from('.hero-bottom', { y: 24, autoAlpha: 0, duration: .8 }, .45)
        .from('.hero-workbench', { y: 30, rotate: 4, autoAlpha: 0, duration: .9 }, .45);
      return tl;
    }
  });
}

function initScrollReveals() {
  if (reduced) return;
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 36,
      autoAlpha: 0,
      duration: .85,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  const railDot = document.querySelector<HTMLElement>('[data-signal-dot]');
  if (railDot) {
    gsap.to(railDot, {
      left: '100%',
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .4 }
    });
  }

  const process = document.querySelector('[data-process-track]');
  if (process) {
    ScrollTrigger.create({ trigger: process, start: 'top 75%', once: true, onEnter: () => process.classList.add('is-live') });
  }

  const roadmap = document.querySelector('[data-roadmap]');
  if (roadmap) {
    gsap.from(roadmap.children, {
      y: 24,
      autoAlpha: 0,
      stagger: .1,
      duration: .6,
      ease: 'power2.out',
      scrollTrigger: { trigger: roadmap, start: 'top 82%', once: true }
    });
  }
}

function initTeaser() {
  const teaser = document.querySelector<HTMLElement>('[data-teaser]');
  if (!teaser) return;
  teaser.addEventListener('pointermove', (event) => {
    const rect = teaser.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    teaser.style.setProperty('--mx', `${x}%`);
    teaser.style.setProperty('--my', `${y}%`);
  });
}

function initSimpleForms() {
  const notify = document.querySelector<HTMLFormElement>('[data-notify-form]');
  const notifyStatus = document.querySelector<HTMLElement>('[data-notify-status]');
  notify?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (notifyStatus) notifyStatus.textContent = 'NOTED / FORM BACKEND WILL BE CONNECTED BEFORE PUBLIC LAUNCH.';
  });

  const community = document.querySelector<HTMLFormElement>('[data-community-form]');
  const communityStatus = document.querySelector<HTMLElement>('[data-community-status]');
  community?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (communityStatus) communityStatus.textContent = 'TRANSMISSION REQUEST NOTED / BACKEND CONNECTION PENDING.';
  });
}

function initSignalBox() {
  const form = document.querySelector<HTMLFormElement>('[data-letter-form]');
  const envelope = document.querySelector<HTMLElement>('[data-envelope]');
  const box = document.querySelector<HTMLElement>('[data-signal-box]');
  const instruction = document.querySelector<HTMLElement>('[data-envelope-instruction]');
  const boxStatus = document.querySelector<HTMLElement>('[data-box-status]');
  if (!form || !envelope || !box || !instruction || !boxStatus) return;

  let ready = false;
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let dx = 0;
  let dy = 0;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    ready = true;
    envelope.classList.add('is-ready');
    instruction.textContent = 'DRAG THE ENVELOPE INTO THE SIGNAL BOX.';
    if (!reduced) {
      gsap.fromTo(envelope, { scale: .7, rotate: -8, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: .65, ease: 'back.out(1.35)' });
    }
  });

  const resetEnvelope = () => {
    dx = 0; dy = 0;
    gsap.to(envelope, { x: 0, y: 0, duration: .45, ease: 'power3.out' });
  };

  const isOverBox = () => {
    const a = envelope.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    const cx = a.left + a.width / 2;
    const cy = a.top + a.height / 2;
    return cx > b.left && cx < b.right && cy > b.top && cy < b.bottom;
  };

  envelope.addEventListener('pointerdown', (event) => {
    if (!ready) return;
    dragging = true;
    startX = event.clientX - dx;
    startY = event.clientY - dy;
    envelope.setPointerCapture(event.pointerId);
    envelope.classList.add('is-dragging');
  });

  envelope.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    dx = event.clientX - startX;
    dy = event.clientY - startY;
    gsap.set(envelope, { x: dx, y: dy });
    box.classList.toggle('is-target', isOverBox());
  });

  envelope.addEventListener('pointerup', (event) => {
    if (!dragging) return;
    dragging = false;
    envelope.releasePointerCapture(event.pointerId);
    envelope.classList.remove('is-dragging');
    box.classList.remove('is-target');
    if (isOverBox()) {
      ready = false;
      box.classList.add('is-received');
      boxStatus.textContent = 'SIGNAL RECEIVED';
      instruction.textContent = 'RECEIVED / WE WILL DECIDE WHETHER IT HOLDS UP.';
      gsap.to(envelope, { scale: .2, autoAlpha: 0, y: dy - 80, duration: .45, ease: 'power2.in', onComplete: () => {
        form.reset();
        setTimeout(() => {
          envelope.classList.remove('is-ready');
          box.classList.remove('is-received');
          boxStatus.textContent = 'WAITING FOR SIGNAL';
          instruction.textContent = 'WRITE YOUR SIGNAL FIRST.';
          gsap.set(envelope, { x: 0, y: 0, scale: 1, autoAlpha: 1 });
          dx = 0; dy = 0;
        }, 2200);
      }});
    } else {
      resetEnvelope();
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
initHero();
initScrollReveals();
initTeaser();
initSimpleForms();
initSignalBox();
initAnchorLinks();
