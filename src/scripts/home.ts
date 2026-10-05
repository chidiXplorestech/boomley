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
  if (!response.ok) throw new Error('Form failed: ' + response.status);
}

function initCursor() {
  if (reduced || !window.matchMedia('(pointer:fine)').matches) return;
  const cursor = document.querySelector<HTMLElement>('.cursor');
  if (!cursor) return;

  const xTo = gsap.quickTo(cursor, 'x', { duration: .16, ease: 'power3' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: .16, ease: 'power3' });

  window.addEventListener('pointermove', (event) => {
    cursor.style.opacity = '1';
    xTo(event.clientX);
    yTo(event.clientY);
  });

  document.querySelectorAll('a,button,input,textarea,[tabindex]').forEach((el) => {
    el.addEventListener('mouseenter', () => gsap.to(cursor, { scale: 1.8, duration: .18 }));
    el.addEventListener('mouseleave', () => gsap.to(cursor, { scale: 1, duration: .18 }));
  });
}

function initCover() {
  if (reduced) return;

  const title = document.querySelector<HTMLElement>('[data-cover-title]');
  if (!title) return;

  SplitText.create(title, {
    type: 'lines,words',
    mask: 'lines',
    autoSplit: true,
    onSplit(self) {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.from(self.lines, {
        yPercent: 112,
        rotate: .6,
        duration: 1,
        stagger: .075
      })
      .from('.edition', { autoAlpha: 0, y: 12, duration: .45 }, .05)
      .from('.cover-deck', { autoAlpha: 0, y: 22, duration: .7 }, .42)
      .from('.cover-foot', { autoAlpha: 0, y: 16, duration: .55 }, .52)
      .from('.cover-portrait--a', { autoAlpha: 0, x: 60, y: 30, rotate: 4, duration: .85 }, .25)
      .from('.cover-portrait--b', { autoAlpha: 0, x: -45, y: -22, rotate: -3, duration: .85 }, .38)
      .from('.cover-mark,.blue-envelope--cover', {
        autoAlpha: 0,
        scale: .82,
        stagger: .07,
        duration: .42
      }, .67);
      return tl;
    }
  });

  gsap.to('.cover-portrait--a', {
    yPercent: -7,
    ease: 'none',
    scrollTrigger: { trigger: '.cover', start: 'top top', end: 'bottom top', scrub: .7 }
  });
  gsap.to('.cover-portrait--b', {
    yPercent: 8,
    ease: 'none',
    scrollTrigger: { trigger: '.cover', start: 'top top', end: 'bottom top', scrub: .7 }
  });
  gsap.to('.blue-envelope--cover', {
    xPercent: -38,
    yPercent: 95,
    rotate: -10,
    ease: 'none',
    scrollTrigger: { trigger: '.cover', start: 'top 20%', end: 'bottom top', scrub: .65 }
  });
}

function initNoiseScene() {
  if (reduced) return;

  const stage = document.querySelector<HTMLElement>('[data-noise-stage]');
  const resolve = document.querySelector<HTMLElement>('[data-signal-resolve]');
  if (!stage || !resolve) return;

  const fragments = gsap.utils.toArray<HTMLElement>('.noise-fragment');

  gsap.set(resolve, { autoAlpha: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      end: 'bottom bottom',
      scrub: .8
    }
  });

  fragments.forEach((fragment, index) => {
    tl.fromTo(fragment,
      { autoAlpha: 0, y: 60, filter: 'blur(8px)' },
      { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: .18 },
      index * .12
    );
  });

  tl.to('.noise-ascii', { autoAlpha: 1, xPercent: -20, duration: .35 }, .18)
    .to(fragments, {
      autoAlpha: 0,
      scale: .88,
      filter: 'blur(14px)',
      stagger: .025,
      duration: .22
    }, .72)
    .to('.noise-ascii', {
      autoAlpha: 0,
      scale: 1.45,
      filter: 'blur(12px)',
      duration: .18
    }, .74)
    .to(resolve, { autoAlpha: 1, duration: .16 }, .8)
    .fromTo(resolve.querySelector('h2'),
      { yPercent: 12, clipPath: 'inset(0 0 100% 0)' },
      { yPercent: 0, clipPath: 'inset(0 0 0% 0)', duration: .2 },
      .82
    );
}

function initRevealMoments() {
  if (reduced) return;

  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
    if (element.closest('.cover')) return;
    gsap.from(element, {
      y: 28,
      autoAlpha: 0,
      duration: .78,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 88%',
        once: true
      }
    });
  });
}

function initPeople() {
  document.querySelectorAll<HTMLElement>('[data-person]').forEach((card) => {
    const media = card.querySelector<HTMLElement>('.person-media');
    if (!media) return;

    card.addEventListener('pointermove', (event) => {
      if (reduced || !window.matchMedia('(pointer:fine)').matches) return;
      const rect = card.getBoundingClientRect();
      const rx = ((event.clientY - rect.top) / rect.height - .5) * -3.5;
      const ry = ((event.clientX - rect.left) / rect.width - .5) * 3.5;
      gsap.to(media, {
        rotateX: rx,
        rotateY: ry,
        transformPerspective: 1100,
        duration: .32,
        ease: 'power2.out'
      });
    });

    card.addEventListener('pointerleave', () => {
      gsap.to(media, {
        rotateX: 0,
        rotateY: 0,
        duration: .45,
        ease: 'power3.out'
      });
    });
  });

  if (!reduced) {
    gsap.to('.person--primary', {
      yPercent: -7,
      ease: 'none',
      scrollTrigger: { trigger: '.people-composition', start: 'top bottom', end: 'bottom top', scrub: .7 }
    });
    gsap.to('.person--secondary', {
      yPercent: 10,
      ease: 'none',
      scrollTrigger: { trigger: '.people-composition', start: 'top bottom', end: 'bottom top', scrub: .7 }
    });
  }
}

function initProductDocumentary() {
  if (reduced) return;

  gsap.utils.toArray<HTMLElement>('[data-doc]').forEach((doc, index) => {
    gsap.from(doc, {
      y: 70,
      rotate: index % 2 ? 5 : -5,
      autoAlpha: 0,
      duration: .95,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: doc,
        start: 'top 86%',
        once: true
      }
    });
  });

  const reveal = document.querySelector<HTMLElement>('[data-product-reveal]');
  if (reveal) {
    gsap.fromTo(reveal,
      { clipPath: 'inset(12% 9% 12% 9%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        ease: 'none',
        scrollTrigger: {
          trigger: reveal,
          start: 'top 92%',
          end: 'center 56%',
          scrub: .7
        }
      }
    );
  }

  const line = document.querySelector<HTMLElement>('.thread-line');
  if (line) {
    gsap.fromTo(line,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '[data-build-thread]',
          start: 'top 80%',
          end: 'bottom 45%',
          scrub: .8
        }
      }
    );
  }
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

  if (!form || !wrapButton || !postButton || !envelope || !box || !status) return;

  let wrapped = false;

  wrapButton.addEventListener('click', () => {
    if (!form.reportValidity()) return;

    wrapped = true;
    wrapButton.disabled = true;
    postButton.disabled = false;
    status.textContent = 'LETTER READY / NOW POST IT.';
    envelope.classList.add('is-ready');

    if (reduced) return;

    const paper = envelope.querySelector<HTMLElement>('.envelope-paper');
    const flap = envelope.querySelector<HTMLElement>('.envelope-flap');

    gsap.timeline({ defaults: { ease: 'power3.inOut' } })
      .fromTo(envelope,
        { autoAlpha: 0, scale: .68, rotate: -11 },
        { autoAlpha: 1, scale: 1, rotate: -4, duration: .58 }
      )
      .to(paper, { y: 35, scaleY: .7, duration: .42 }, .13)
      .fromTo(flap,
        { rotateX: 0 },
        { rotateX: -176, transformOrigin: 'top center', duration: .48 },
        .4
      )
      .to(envelope, { rotate: 0, duration: .25 }, .72);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!wrapped || !form.reportValidity()) return;

    postButton.disabled = true;
    status.textContent = 'POSTING SIGNAL...';

    const slot = box.querySelector<HTMLElement>('.pillar-slot');
    const envelopeRect = envelope.getBoundingClientRect();
    const slotRect = slot?.getBoundingClientRect();

    if (!reduced && slotRect) {
      const dx = (slotRect.left + slotRect.width / 2) - (envelopeRect.left + envelopeRect.width / 2);
      const dy = (slotRect.top + slotRect.height / 2) - (envelopeRect.top + envelopeRect.height / 2);

      await new Promise<void>((resolve) => {
        gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          onComplete: resolve
        })
          .to(envelope, {
            x: dx,
            y: dy,
            rotate: -3,
            scale: .58,
            duration: .85
          })
          .to(envelope, {
            scaleX: .43,
            scaleY: .08,
            autoAlpha: .1,
            duration: .34,
            ease: 'power2.in'
          })
          .to(box, {
            y: 3,
            scale: .993,
            duration: .1,
            yoyo: true,
            repeat: 1
          }, '<');
      });
    }

    try {
      await postNetlifyForm(form);
      status.textContent = 'SIGNAL RECEIVED / WE\'LL LISTEN.';
      form.reset();
      wrapped = false;

      setTimeout(() => {
        wrapButton.disabled = false;
        postButton.disabled = true;
        envelope.classList.remove('is-ready');
        gsap.set(envelope, { clearProps: 'all' });
        gsap.set(envelope.querySelector('.envelope-paper'), { clearProps: 'all' });
        gsap.set(envelope.querySelector('.envelope-flap'), { clearProps: 'all' });
        status.textContent = '';
      }, 2600);
    } catch {
      status.textContent = 'SIGNAL COULD NOT BE POSTED / PLEASE TRY AGAIN.';
      postButton.disabled = false;
      if (!reduced) {
        gsap.to(envelope, {
          x: 0,
          y: 0,
          scale: 1,
          scaleX: 1,
          scaleY: 1,
          autoAlpha: 1,
          duration: .5
        });
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
      target.scrollIntoView({
        behavior: reduced ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  });
}

initCursor();
initCover();
initNoiseScene();
initRevealMoments();
initPeople();
initProductDocumentary();
initWaitlist();
initSignalBox();
initAnchorLinks();
