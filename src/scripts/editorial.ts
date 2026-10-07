const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const intro = document.querySelector<HTMLDialogElement>('.intro');
let visited = false;
try { visited = sessionStorage.getItem('boomley-story') === 'seen'; } catch {}
if (intro && !reduced.matches && !visited && typeof intro.showModal === 'function') {
  const story = intro.querySelector<HTMLElement>('.intro__story');
  const ending = intro.querySelector<HTMLElement>('.intro__ending');
  const timers: number[] = [];
  const previousOverflow = document.body.style.overflow;
  const finish = () => intro.close();
  intro.addEventListener('close', () => {
    timers.forEach(window.clearTimeout);
    document.body.style.overflow = previousOverflow;
    try { sessionStorage.setItem('boomley-story', 'seen'); } catch {}
    const main = document.querySelector<HTMLElement>('#main');
    main?.setAttribute('tabindex', '-1');
    main?.focus({ preventScroll: true });
  }, { once: true });
  intro.querySelector('.intro__skip')?.addEventListener('click', finish);
  intro.querySelector('.intro__enter')?.addEventListener('click', finish);
  reduced.addEventListener('change', () => { if (reduced.matches && intro.open) finish(); });
  intro.showModal();
  document.body.style.overflow = 'hidden';
  const beats = ['More noise. Less room to think.', 'Every problem holds a signal.'];
  beats.forEach((line, index) => {
    timers.push(window.setTimeout(() => {
      if (!story) return;
      story.textContent = line;
      story.getAnimations().forEach(animation => animation.cancel());
      story.animate(
        [{ opacity: 0, transform: 'translateY(16px)', filter: 'blur(5px)' },
         { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }],
        { duration: 650, easing: 'ease-out', fill: 'both' }
      );
    }, (index + 1) * 2200));
  });
  timers.push(window.setTimeout(() => {
    if (story) story.hidden = true;
    if (ending) ending.hidden = false;
    intro.classList.add('intro--ready');
  }, 6600));
}
const menu = document.querySelector<HTMLButtonElement>('.menu-toggle');
const mobileNav = document.querySelector<HTMLElement>('#mobile-nav');
const closeMenu = () => { if (!menu || !mobileNav) return; menu.setAttribute('aria-expanded','false'); mobileNav.hidden=true; };
menu?.addEventListener('click',()=> { if (!mobileNav) return; const open=menu.getAttribute('aria-expanded')!=='true'; menu.setAttribute('aria-expanded',String(open)); mobileNav.hidden=!open; });
mobileNav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape' && menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
window.matchMedia('(min-width: 801px)').addEventListener('change',closeMenu);
const motion = document.querySelector<HTMLButtonElement>('.motion-toggle');
const film = document.querySelector<HTMLElement>('.hero-film');
let manuallyPaused = reduced.matches;
const setMotion = () => { document.body.classList.toggle('motion-paused',manuallyPaused); if(motion){motion.setAttribute('aria-pressed',String(manuallyPaused));motion.textContent=manuallyPaused?'Play motion':'Ⅱ Pause motion';motion.setAttribute('aria-label',manuallyPaused?'Play ambient motion':'Pause ambient motion');} };
setMotion();
motion?.addEventListener('click',()=>{manuallyPaused=!manuallyPaused;setMotion();});
reduced.addEventListener('change',()=>{manuallyPaused=reduced.matches;setMotion();});
if(film && 'IntersectionObserver' in window) new IntersectionObserver(entries=>entries.forEach(entry=>film.classList.toggle('offscreen',!entry.isIntersecting))).observe(film);
if (!reduced.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.animate([{opacity:.45,transform:'translateY(22px)'},{opacity:1,transform:'translateY(0)'}],{duration:700,easing:'cubic-bezier(.2,.7,.2,1)'});observer.unobserve(entry.target);}}),{threshold:.1});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}
document.querySelectorAll<HTMLFormElement>('[data-async-form]').forEach(form=>{
  let sending=false;
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(sending || !form.reportValidity())return;
    const status=form.querySelector<HTMLElement>('.form-status');
    const button=form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if(!status || !button)return;
    sending=true;button.disabled=true;form.setAttribute('aria-busy','true');status.textContent='Sending…';
    const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),15000);
    try {
      const data=new URLSearchParams();new FormData(form).forEach((v,k)=>data.append(k,String(v)));
      const response=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:data.toString(),signal:controller.signal});
      if(!response.ok)throw new Error('Submission failed');
      status.textContent=form.name==='boomley-signal'?'Signal received. Thank you for sharing it with us.':'You’re on the list. We’ll be in touch when there’s something to share.';
      form.reset();
    } catch {status.textContent='That didn’t go through. Please try again, or email hello@boomley.com. Your message is still here.';}
    finally{clearTimeout(timeout);sending=false;button.disabled=false;form.removeAttribute('aria-busy');}
  });
});


// A letter is only "posted" after the server accepts its contents.
const letter = document.querySelector<HTMLFormElement>('[data-signal-mail]');
if (letter) {
  const fields = letter.querySelector<HTMLFieldSetElement>('fieldset')!;
  const status = document.querySelector<HTMLElement>('.mail-status')!;
  const receipt = document.querySelector<HTMLElement>('.mail-receipt')!;
  const envelope = document.querySelector<HTMLElement>('.mail-envelope')!;
  const slot = document.querySelector<HTMLElement>('.postbox-slot')!;
  const flap = envelope.querySelector<HTMLElement>('.envelope-flap')!;
  const seal = envelope.querySelector<HTMLElement>('.envelope-seal')!;
  let sending = false;
  const animate = async (element: HTMLElement, frames: Keyframe[], duration: number) => {
    if (reduced.matches || manuallyPaused) return;
    try { await element.animate(frames, { duration, easing: 'cubic-bezier(.22,.7,.2,1)', fill: 'forwards' }).finished; } catch {}
  };
  const cleanAnimations = () => [letter,envelope,flap,seal].forEach(el => el.getAnimations().forEach(a => a.cancel()));
  document.querySelector('.mail-again')?.addEventListener('click', () => {
    receipt.hidden = true; letter.hidden = false; status.textContent = '';
    letter.querySelector<HTMLInputElement>('#mail-subject')?.focus();
  });
  letter.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !letter.reportValidity()) return;
    sending = true;
    const data = new URLSearchParams();
    new FormData(letter).forEach((value,key) => data.append(key,String(value)));
    fields.disabled = true; letter.setAttribute('aria-busy','true');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(),15000);
    // Attach the rejection handler immediately while the folding animation runs.
    const delivery = fetch('/', { method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:data.toString(),signal:controller.signal })
      .then(response => response.ok && !response.url.includes('/login')).catch(() => false);
    try {
      status.textContent = 'Folding your letter…';
      const source = letter.getBoundingClientRect();
      envelope.style.left = (source.left + source.width / 2 - 90) + 'px';
      envelope.style.top = Math.max(30,Math.min(window.innerHeight - 150,source.top + source.height / 2 - 58)) + 'px';
      await animate(letter,[{transform:'rotate(-1deg) scaleY(1)',opacity:1},{transform:'rotate(-1deg) scaleY(.15)',opacity:0}],650);
      envelope.hidden = false;
      await animate(flap,[{transform:'rotateX(165deg)'},{transform:'rotateX(0deg)'}],550);
      status.textContent = 'Sealing your signal…';
      await animate(seal,[{opacity:0,transform:'scale(1.6)'},{opacity:1,transform:'scale(1)'}],300);
      status.textContent = 'Waiting for delivery confirmation…';
      if (!await delivery) throw new Error('Delivery unconfirmed');
      status.textContent = 'Posting your signal…';
      // On small screens bring the real slot into view before the flight.
      const box = slot.getBoundingClientRect();
      if (box.top < 30 || box.bottom > window.innerHeight - 30) slot.scrollIntoView({behavior:'instant',block:'center'});
      const target = slot.getBoundingClientRect(), from = envelope.getBoundingClientRect();
      const dx = target.left + target.width/2 - (from.left + from.width/2);
      const dy = target.top + target.height/2 - (from.top + from.height/2);
      await animate(envelope,[
        {transform:'translate(0,0) rotate(0deg) scale(1)',opacity:1},
        {transform:'translate('+dx*.6+'px,'+(dy-50)+'px) rotate(-10deg) scale(.7)',opacity:1,offset:.65},
        {transform:'translate('+dx+'px,'+dy+'px) rotate(3deg) scale(.45,.06)',opacity:0}
      ],1000);
      letter.reset(); letter.hidden = true; receipt.hidden = false;
      status.textContent = 'Posted. Your letter has reached the Boomley inbox.';
      receipt.focus({preventScroll:true});
      receipt.scrollIntoView({behavior:'instant',block:'center'});
    } catch {
      status.textContent = 'We couldn’t confirm delivery. Your letter is still here. Please try again, or email hello@boomley.com.';
    } finally {
      clearTimeout(timeout); envelope.hidden = true; cleanAnimations();
      fields.disabled = false; sending = false; letter.removeAttribute('aria-busy');
    }
  });
}
