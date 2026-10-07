const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const intro = document.querySelector<HTMLElement>('.intro');
let visited = false;
try { visited = sessionStorage.getItem('boomley-intro') === 'seen'; } catch {}
if (intro && !reduced.matches && !visited) {
  intro.classList.add('intro--active');
  window.setTimeout(() => { intro.classList.remove('intro--active'); try { sessionStorage.setItem('boomley-intro','seen'); } catch {} }, 1500);
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
