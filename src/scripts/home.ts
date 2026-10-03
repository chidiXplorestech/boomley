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
      tl.from(self.lines, { yPercent: 115, rotate: 1.2, duration: 1.05, stagger: .08 })
        .from('.system-row', { y: 12, autoAlpha: 0, duration: .45 }, .1)
        .from('.hero-summary', { y: 24, autoAlpha: 0, duration: .7 }, .42)
        .from('.hero-actions', { y: 18, autoAlpha: 0, duration: .6 }, .54)
        .from('.portrait--chidi', { x: 50, y: 35, rotate: 4, autoAlpha: 0, duration: .85 }, .28)
        .from('.portrait--michael', { x: -45, y: -20, rotate: -3, autoAlpha: 0, duration: .85 }, .4)
        .from('.hero-note,.hero-cross', { scale: .8, autoAlpha: 0, stagger: .08, duration: .45 }, .65);
      return tl;
    }
  });
}

function initScrollScenes() {
  if (reduced) return;
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    if (el.closest('.hero')) return;
    gsap.from(el, {
      y: 38,
      autoAlpha: 0,
      duration: .85,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  gsap.from('.signal-cards article', {
    y: 55,
    autoAlpha: 0,
    stagger: .08,
    duration: .7,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.signal-cards', start: 'top 84%', once: true }
  });

  gsap.to('.ascii-wave', {
    xPercent: -10,
    yPercent: -8,
    ease: 'none',
    scrollTrigger: { trigger: '.signal-story', start: 'top bottom', end: 'bottom top', scrub: .8 }
  });

  const roadmap = document.querySelector<HTMLElement>('[data-roadmap]');
  if (roadmap) {
    gsap.from(Array.from(roadmap.children), {
      y: 24,
      autoAlpha: 0,
      stagger: .08,
      duration: .6,
      ease: 'power2.out',
      scrollTrigger: { trigger: roadmap, start: 'top 84%', once: true }
    });
  }

  const teaser = document.querySelector<HTMLElement>('[data-product-teaser]');
  if (teaser) {
    gsap.fromTo(teaser, { clipPath: 'inset(9% 12% 9% 12%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)',
      ease: 'none',
      scrollTrigger: { trigger: teaser, start: 'top 90%', end: 'center 55%', scrub: .7 }
    });
  }
}

function initFounders() {
  document.querySelectorAll<HTMLElement>('[data-founder-card]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      if (reduced || !window.matchMedia('(pointer:fine)').matches) return;
      const rect = card.getBoundingClientRect();
      const rx = ((event.clientY - rect.top) / rect.height - .5) * -4;
      const ry = ((event.clientX - rect.left) / rect.width - .5) * 4;
      gsap.to(card.querySelector('.founder-media'), { rotateX: rx, rotateY: ry, transformPerspective: 900, duration: .35, ease: 'power2.out' });
    });
    card.addEventListener('pointerleave', () => {
      gsap.to(card.querySelector('.founder-media'), { rotateX: 0, rotateY: 0, duration: .45, ease: 'power3.out' });
    });
  });
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
  const steps = Array.from(document.querySelectorAll<HTMLElement>('.step'));
  if (!form || !wrapButton || !postButton || !envelope || !box || !status) return;

  const activateStep = (n: number) => steps.forEach((step) => step.classList.toggle('is-active', step.dataset.step === String(n)));

  let wrapped = false;

  wrapButton.addEventListener('click', () => {
    if (!form.reportValidity()) return;
    wrapped = true;
    activateStep(2);
    postButton.disabled = false;
    wrapButton.disabled = true;
    status.textContent = 'LETTER READY / PRESS POST IT.';
    envelope.classList.add('is-ready');

    if (!reduced) {
      const paper = envelope.querySelector<HTMLElement>('.blue-envelope__paper');
      const flap = envelope.querySelector<HTMLElement>('.blue-envelope__flap');
      const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
      tl.fromTo(envelope, { scale: .75, rotate: -8, autoAlpha: 0 }, { scale: 1, rotate: -2, autoAlpha: 1, duration: .55 })
        .to(paper, { y: 38, scaleY: .72, duration: .45 }, .12)
        .fromTo(flap, { rotateX: 0 }, { rotateX: -170, transformOrigin: 'top center', duration: .5 }, .42)
        .to(envelope, { rotate: 0, duration: .3 }, .72);
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!wrapped || !form.reportValidity()) return;
    activateStep(3);
    postButton.disabled = true;
    status.textContent = 'POSTING SIGNAL...';

    const slot = box.querySelector<HTMLElement>('.pillar-slot');
    const envelopeRect = envelope.getBoundingClientRect();
    const slotRect = slot?.getBoundingClientRect();

    if (!reduced && slotRect) {
      const dx = (slotRect.left + slotRect.width / 2) - (envelopeRect.left + envelopeRect.width / 2);
      const dy = (slotRect.top + slotRect.height / 2) - (envelopeRect.top + envelopeRect.height / 2);
      await new Promise<void>((resolve) => {
        gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: resolve })
          .to(envelope, { x: dx, y: dy, rotate: -4, scale: .52, duration: .85 })
          .to(envelope, { scaleY: .08, scaleX: .44, autoAlpha: .25, duration: .38, ease: 'power2.in' })
          .to(box, { scale: .985, duration: .1, yoyo: true, repeat: 1 }, '<');
      });
    }

    try {
      await postNetlifyForm(form);
      status.textContent = 'SIGNAL RECEIVED / WE\'LL LISTEN.';
      form.reset();
      activateStep(1);
      wrapped = false;
      setTimeout(() => {
        wrapButton.disabled = false;
        postButton.disabled = true;
        envelope.classList.remove('is-ready');
        gsap.set(envelope, { clearProps: 'all' });
        gsap.set(envelope.querySelector('.blue-envelope__paper'), { clearProps: 'all' });
        gsap.set(envelope.querySelector('.blue-envelope__flap'), { clearProps: 'all' });
        status.textContent = '';
      }, 2600);
    } catch {
      status.textContent = 'SIGNAL COULD NOT BE POSTED / PLEASE TRY AGAIN.';
      postButton.disabled = false;
      if (!reduced) gsap.to(envelope, { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1, autoAlpha: 1, duration: .5 });
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
initScrollScenes();
initFounders();
initWaitlist();
initSignalBox();
initAnchorLinks();
