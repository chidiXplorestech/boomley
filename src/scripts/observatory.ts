import { gsap } from 'gsap';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduced.matches;
const motionButton = document.querySelector<HTMLButtonElement>('.motion-toggle');
const updateMotion = () => {
  document.body.classList.toggle('motion-paused', paused);
  motionButton?.setAttribute('aria-pressed', String(paused));
  if (motionButton) motionButton.textContent = paused ? '▶ Play motion' : 'Ⅱ Pause motion';
};
updateMotion();
motionButton?.addEventListener('click', () => { paused = !paused; updateMotion(); });
reduced.addEventListener('change', () => { paused = reduced.matches; updateMotion(); });

const menuButton = document.querySelector<HTMLButtonElement>('.menu-toggle');
const menu = document.querySelector<HTMLElement>('#mobile-menu');
const closeMenu = () => { if (menu) menu.hidden = true; menuButton?.setAttribute('aria-expanded', 'false'); };
menuButton?.addEventListener('click', () => { if (!menu) return; menu.hidden = !menu.hidden; menuButton.setAttribute('aria-expanded', String(!menu.hidden)); });
menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu && !menu.hidden) { closeMenu(); menuButton?.focus(); } });
window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);

const opening = document.querySelector<HTMLDialogElement>('.opening');
let seen = false;
try { seen = sessionStorage.getItem('boomley-observatory-intro') === 'seen'; } catch {}
if (opening && !seen && !reduced.matches && typeof opening.showModal === 'function') {
  const line = opening.querySelector<HTMLElement>('.opening-line')!;
  const ending = opening.querySelector<HTMLElement>('.opening-end')!;
  const timers: number[] = [];
  const restoreOverflow = document.body.style.overflow;
  opening.showModal(); document.body.style.overflow = 'hidden';
  const finish = () => opening.close();
  opening.querySelector('.opening-skip')?.addEventListener('click', finish);
  opening.querySelector('[data-enter]')?.addEventListener('click', finish);
  reduced.addEventListener('change', () => { if (reduced.matches && opening.open) finish(); });
  opening.addEventListener('close', () => {
    timers.forEach(window.clearTimeout); document.body.style.overflow = restoreOverflow;
    try { sessionStorage.setItem('boomley-observatory-intro', 'seen'); } catch {}
    const main = document.querySelector<HTMLElement>('#main'); main?.setAttribute('tabindex', '-1'); main?.focus({ preventScroll: true });
  }, { once: true });
  ['Some things deserve a closer look.', 'Every problem holds a signal.'].forEach((text, i) => timers.push(window.setTimeout(() => {
    line.textContent = text; gsap.fromTo(line, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .5 });
  }, (i + 1) * 1700)));
  timers.push(window.setTimeout(() => { line.hidden = true; ending.hidden = false; gsap.fromTo(ending, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .5 }); }, 5100));
}

if ('IntersectionObserver' in window) {
  const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    if (!reduced.matches && !paused) gsap.fromTo(entry.target, { opacity: .5, y: 20 }, { opacity: 1, y: 0, duration: .75, clearProps: 'opacity,transform', ease: 'power2.out' });
    reveal.unobserve(entry.target);
  }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));
  const ambient = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('offscreen', !entry.isIntersecting)));
  document.querySelectorAll('.people-grid,.process-visual').forEach(el => ambient.observe(el));
}

// Characters converge into one line: the same noise-to-signal story as the lens.
const ascii = document.querySelector<HTMLElement>('[data-ascii]');
let asciiVisible = true, asciiPhase = 0;
if (ascii) {
  const render = () => {
    const chars = '. : + * /';
    ascii.textContent = Array.from({ length: 2 }, (_, row) => Array.from({ length: 180 }, (_, i) => {
      if (i > 115) return row === 0 ? '─' : ' ';
      const n = (i * 13 + row * 17 + Math.floor(asciiPhase)) % 31;
      return n < 12 ? ' ' : chars[n % chars.length];
    }).join('')).join('\n');
  };
  render();
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { asciiVisible = entries[0].isIntersecting; }).observe(ascii);
  window.setInterval(() => { if (!paused && !reduced.matches && asciiVisible && !document.hidden) { asciiPhase++; render(); } }, 180);
}

async function deliver(form: HTMLFormElement, signal: AbortSignal) {
  const data = new URLSearchParams();
  new FormData(form).forEach((value, key) => data.append(key, String(value)));
  const response = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: data.toString(), signal, redirect: 'error' });
  if (!response.ok) throw new Error('Delivery not accepted');
}

document.querySelectorAll<HTMLFormElement>('[data-waitlist]').forEach(form => {
  let pending = false;
  form.addEventListener('submit', async e => {
    e.preventDefault(); if (pending || !form.reportValidity()) return;
    pending = true; const button = form.querySelector<HTMLButtonElement>('button')!;
    const status = form.querySelector<HTMLElement>('.form-status')!;
    const controller = new AbortController(), timeout = window.setTimeout(() => controller.abort(), 15000);
    button.disabled = true; status.textContent = 'Sending…'; form.setAttribute('aria-busy', 'true');
    try { await deliver(form, controller.signal); status.textContent = 'You’re on the list. We’ll write when there’s something to share.'; form.reset(); }
    catch { status.textContent = 'We couldn’t confirm delivery. Please try again. Your email is still here.'; }
    finally { clearTimeout(timeout); pending = false; button.disabled = false; form.removeAttribute('aria-busy'); }
  });
});

const letter = document.querySelector<HTMLFormElement>('[data-signal-mail]');
if (letter) {
  const fields = letter.querySelector<HTMLFieldSetElement>('fieldset')!;
  const status = document.querySelector<HTMLElement>('.mail-status')!;
  const receipt = document.querySelector<HTMLElement>('.mail-receipt')!;
  const stage = document.querySelector<HTMLDialogElement>('.mail-stage')!;
  const stageStatus = stage.querySelector<HTMLElement>('[data-stage-status]')!;
  const paper = stage.querySelector<HTMLElement>('.fold-letter')!;
  const top = stage.querySelector<HTMLElement>('.fold-top')!;
  const bottom = stage.querySelector<HTMLElement>('.fold-bottom')!;
  const envelope = stage.querySelector<HTMLElement>('.flying-envelope')!;
  const flap = stage.querySelector<HTMLElement>('.envelope-flap')!;
  const seal = stage.querySelector<HTMLElement>('.envelope-seal')!;
  const slot = stage.querySelector<HTMLElement>('.stage-slot')!;
  let pending = false, skipAnimation = false, timeline: gsap.core.Timeline | null = null;
  const changeState = (state: string, text: string) => { letter.dataset.state = state; status.textContent = text; stageStatus.textContent = text; };
  const hideStage = () => { skipAnimation = true; timeline?.progress(1); if (stage.open) stage.close(); };
  stage.querySelector('.stage-hide')?.addEventListener('click', hideStage);
  stage.addEventListener('cancel', () => { skipAnimation = true; timeline?.progress(1); });
  reduced.addEventListener('change', () => { if (reduced.matches) hideStage(); });
  const play = (compose: (tl: gsap.core.Timeline) => void) => new Promise<void>(resolve => {
    if (skipAnimation || paused || reduced.matches) { resolve(); return; }
    timeline = gsap.timeline({ onComplete: () => resolve() }); compose(timeline);
  });
  const resetScene = () => { timeline?.kill(); timeline = null; gsap.set([paper,top,bottom,envelope,flap,seal], { clearProps: 'all' }); };
  letter.dataset.state = 'editing';
  document.querySelector('.mail-again')?.addEventListener('click', () => {
    receipt.hidden = true; letter.hidden = false; changeState('editing', ''); letter.querySelector<HTMLInputElement>('#mail-subject')?.focus();
  });
  letter.addEventListener('submit', async event => {
    event.preventDefault(); if (pending) return;
    changeState('validating', ''); if (!letter.reportValidity()) { changeState('editing', 'Please complete the required fields.'); return; }
    pending = true; skipAnimation = paused || reduced.matches;
    resetScene();
    const controller = new AbortController(); const timeout = window.setTimeout(() => controller.abort(), 15000);
    // Serialize before disabling fields, and handle rejection immediately.
    const request = deliver(letter, controller.signal).then(() => true).catch(() => false);
    fields.disabled = true; letter.setAttribute('aria-busy', 'true');
    if (!skipAnimation && typeof stage.showModal === 'function') stage.showModal(); else skipAnimation = true;
    try {
      changeState('folding', 'Folding your letter…');
      await play(tl => {
        tl.to(top, { rotationX: -179, duration: .6, ease: 'power2.inOut' })
          .to(bottom, { rotationX: 179, duration: .6, ease: 'power2.inOut' }, '-=.1')
          .to(envelope, { opacity: 1, duration: .25 })
          .to(paper, { y: 12, opacity: 0, duration: .35 }, '<');
      });
      changeState('sealing', 'Sealing your signal…');
      await play(tl => { tl.to(flap, { rotationX: 0, duration: .5, ease: 'power2.inOut' }).fromTo(seal, { opacity: 0, scale: 1.7 }, { opacity: 1, scale: 1, duration: .3, ease: 'back.out(1.2)' }); });
      changeState('submitting', 'Confirming delivery…');
      if (!await request) throw new Error('Delivery unconfirmed');
      if (!skipAnimation) {
        const target = slot.getBoundingClientRect(), origin = envelope.getBoundingClientRect();
        const dx = target.left + target.width/2 - (origin.left + origin.width/2);
        const dy = target.top + target.height/2 - (origin.top + origin.height/2);
        await play(tl => { tl.to(envelope, { x: dx, y: dy - 12, scale: .36, rotation: -3, duration: .8, ease: 'power2.inOut' }).to(envelope, { y: dy, rotationX: 74, duration: .2, ease: 'power2.in' }).to(envelope, { y: dy + 8, clipPath: 'inset(0 0 100% 0)', opacity: 0, duration: .25, ease: 'power2.in' }); });
      }
      changeState('posted', 'Posted. Your letter has reached the Boomley inbox.');
      if (stage.open) stage.close();
      letter.reset(); letter.hidden = true; receipt.hidden = false; receipt.focus({ preventScroll: true });
    } catch {
      if (stage.open) stage.close();
      changeState('error', 'We couldn’t confirm delivery. Your letter is still here. Please try again, or email hello@boomley.com.');
    } finally {
      clearTimeout(timeout); resetScene(); pending = false; fields.disabled = false; letter.removeAttribute('aria-busy');
    }
  });
}
