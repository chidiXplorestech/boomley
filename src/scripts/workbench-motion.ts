import { gsap } from 'gsap';
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const isPaused = () => reduced.matches || document.body.classList.contains('motion-paused');
const welcome = document.querySelector<HTMLDialogElement>('.welcome-dialog');
let introSeen = false;
try { introSeen = sessionStorage.getItem('boomley-welcome-v2') === 'seen'; } catch {}
if (welcome && !introSeen && !reduced.matches) {
  const previous = document.body.style.overflow;
  let exiting = false;
  welcome.showModal(); document.body.style.overflow = 'hidden';
  const entrance = gsap.fromTo('.welcome-copy > *', { opacity: 0, y: 12, filter: 'blur(5px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', stagger: .17, duration: .7 });
  const finish = () => {
    if (exiting) return; exiting = true; clearTimeout(timer); entrance.kill();
    gsap.to(welcome, { opacity: 0, filter: 'blur(12px)', duration: reduced.matches ? 0 : .6, onComplete: () => welcome.close() });
  };
  const timer = window.setTimeout(finish, 2400);
  welcome.querySelector('[data-skip-intro]')?.addEventListener('click', finish);
  welcome.addEventListener('cancel', e => { e.preventDefault(); finish(); });
  welcome.addEventListener('close', () => { clearTimeout(timer); document.body.style.overflow = previous; try { sessionStorage.setItem('boomley-welcome-v2', 'seen'); } catch {} document.querySelector<HTMLAnchorElement>('.boomer-logo')?.focus({ preventScroll: true }); }, { once: true });
  reduced.addEventListener('change', () => { if (reduced.matches) finish(); });
}
// Progressive enhancement: text remains visible if JavaScript is unavailable.
const copy = document.querySelectorAll<HTMLElement>('.bench-story h2,.story-columns p,.people-intro h2,.post-heading h2');
const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  if (!isPaused()) gsap.fromTo(entry.target, { opacity: .55, y: 18, filter: 'blur(4px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .85, ease: 'power2.out', clearProps: 'all' });
  reveal.unobserve(entry.target);
}), { threshold: .25 });
copy.forEach(el => reveal.observe(el));

const profiles = [
  { id:'chidi', name:'Chidi', role:'CO-FOUNDER / PRODUCT & STRATEGY', copy:'I start with the person using it. What’s getting in their way? What would make a difference? I look after the research, product direction, and how it all feels to use.' },
  { id:'michael', name:'Michael', role:'CO-FOUNDER / SOFTWARE ENGINEERING', copy:'I work on how the idea becomes a working product: the code, the systems behind it, and the details that make it reliable. I build, test, and keep improving it.' }
];
const dialog = document.querySelector<HTMLDialogElement>('.founder-dialog')!;
let index = 0, opener: HTMLElement | null = null;
const showPerson = (n: number) => {
  index = (n + profiles.length) % profiles.length; const person = profiles[index];
  dialog.querySelector('#founder-name')!.textContent = person.name;
  dialog.querySelector('[data-founder-role]')!.textContent = person.role;
  dialog.querySelector('[data-founder-copy]')!.textContent = person.copy;
  const photo = dialog.querySelector<HTMLImageElement>('.founder-photo')!; photo.src = `/media/founders/${person.id}.webp`; photo.alt = `${person.name}, co-founder of Boomley`;
  if (!isPaused()) gsap.fromTo([photo,dialog.querySelector('.founder-info')], { opacity: .4, y: 9 }, { opacity: 1, y: 0, duration: .35, stagger: .04, clearProps: 'all' });
};
document.querySelectorAll<HTMLButtonElement>('[data-person]').forEach(button => button.addEventListener('click', () => { opener = button; showPerson(profiles.findIndex(p=>p.id===button.dataset.person)); dialog.showModal(); }));
dialog.querySelector('.founder-close')?.addEventListener('click', () => dialog.close());
dialog.querySelector('[data-founder-prev]')?.addEventListener('click', () => showPerson(index-1));
dialog.querySelector('[data-founder-next]')?.addEventListener('click', () => showPerson(index+1));
dialog.querySelector('[data-founder-mail]')?.addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => opener?.focus({preventScroll:true}));

// Dot field responds to pointer proximity. Event-driven; no perpetual animation loop.
const canvas = document.querySelector<HTMLCanvasElement>('.interactive-dots')!;
const ctx = canvas.getContext('2d');
let pointer = { x:-1000, y:-1000 }, frame = 0;
const paint = () => {
  frame = 0; if (!ctx) return;
  const dpr = Math.min(devicePixelRatio || 1, 1.5), w = innerWidth, h = innerHeight;
  if (canvas.width !== Math.round(w*dpr) || canvas.height !== Math.round(h*dpr)) { canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr); }
  ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
  if (isPaused() || document.hidden) return;
  for (let y=20;y<h;y+=42) for(let x=20;x<w;x+=42) {
    const dx=x-pointer.x,dy=y-pointer.y,d=Math.hypot(dx,dy),near=Math.max(0,1-d/160);
    ctx.fillStyle=`rgba(229,239,130,${.09+near*.55})`;ctx.beginPath();ctx.arc(x+(d?dx/d:0)*near*8,y+(d?dy/d:0)*near*8,1+near*1.7,0,Math.PI*2);ctx.fill();
  }
};
const schedule=()=>{if(!frame)frame=requestAnimationFrame(paint);};
window.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||isPaused())return;pointer={x:e.clientX,y:e.clientY};schedule();},{passive:true});
document.addEventListener('pointerleave',()=>{pointer={x:-1000,y:-1000};schedule();});
window.addEventListener('resize',schedule,{passive:true});document.addEventListener('visibilitychange',schedule);
new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class']});
reduced.addEventListener('change',schedule);schedule();

// Pointer cue follows the visitor inside each portrait; touch keeps a visible label.
document.querySelectorAll<HTMLElement>('.portrait-button').forEach(portrait => {
  portrait.addEventListener('pointermove', e => {
    if(e.pointerType === 'touch' || isPaused()) return;
    const bounds = portrait.getBoundingClientRect();
    portrait.style.setProperty('--cue-x', `${Math.max(78,Math.min(bounds.width-78,e.clientX-bounds.left))}px`);
    portrait.style.setProperty('--cue-y', `${Math.max(28,Math.min(bounds.height-65,e.clientY-bounds.top))}px`);
  }, {passive:true});
  portrait.addEventListener('pointerleave', () => {portrait.style.removeProperty('--cue-x');portrait.style.removeProperty('--cue-y');});
});

const contact = document.querySelector<HTMLDialogElement>('#contact')!;
const contactForm = contact.querySelector<HTMLFormElement>('[data-contact-form]')!;
const contactReview = contact.querySelector<HTMLElement>('.contact-review')!;
let contactOpener: HTMLElement | null = null;
let previousContactOverflow = '';
document.querySelectorAll<HTMLElement>('[data-contact-open]').forEach(link => link.addEventListener('click', e => {
  e.preventDefault(); contactOpener = link; previousContactOverflow = document.body.style.overflow;
  contact.showModal(); document.body.style.overflow = 'hidden';
  if(!isPaused()) gsap.fromTo(contact,{opacity:0,y:14},{opacity:1,y:0,duration:.25,clearProps:'opacity,transform'});
}));
contact.querySelector('.contact-close')?.addEventListener('click',()=>contact.close());
contact.addEventListener('click',e=>{if(e.target!==contact)return;const r=contact.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)contact.close();});
contact.addEventListener('close',()=>{document.body.style.overflow=previousContactOverflow;contactOpener?.focus({preventScroll:true});});
contactForm.addEventListener('submit',e=>{
  e.preventDefault();const data=new FormData(contactForm);
  contact.querySelector<HTMLElement>('[data-contact-summary]')!.textContent=`From: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`;
  contactForm.hidden=true;contactReview.hidden=false;
  contact.querySelector<HTMLButtonElement>('[data-contact-edit]')!.focus();
});
contact.querySelector('[data-contact-edit]')?.addEventListener('click',()=>{contactReview.hidden=true;contactForm.hidden=false;contact.querySelector<HTMLTextAreaElement>('#contact-message')!.focus();});

const brand = document.querySelector<HTMLElement>('.header-brand')!;
let brandCycle: number | undefined;
let brandClose: number | undefined;
const stopBrand = () => {
  window.clearInterval(brandCycle); window.clearTimeout(brandClose);
  brandCycle = undefined; brand.classList.remove('brand-intro');
};
const scheduleBrand = () => {
  stopBrand();
  if (isPaused() || document.hidden || welcome?.open) return;
  brandCycle = window.setInterval(() => {
    brand.classList.add('brand-intro');
    // 1.4-second slide out, 3-second hold, then a 1.4-second return.
    brandClose = window.setTimeout(() => brand.classList.remove('brand-intro'), 4400);
  }, 20000);
};
welcome?.addEventListener('close', scheduleBrand, { once: true });
document.addEventListener('visibilitychange', scheduleBrand);
reduced.addEventListener('change', scheduleBrand);
new MutationObserver(scheduleBrand).observe(document.body, { attributes: true, attributeFilter: ['class'] });
window.addEventListener('pagehide', stopBrand);
window.addEventListener('pageshow', scheduleBrand);
scheduleBrand();
const pillNav=document.querySelector<HTMLElement>('.pill-nav')!;
const navLinks=Array.from(pillNav.querySelectorAll<HTMLAnchorElement>('a'));
const indicator=pillNav.querySelector<HTMLElement>('.nav-indicator')!;
const updatePill=(link:HTMLAnchorElement)=>{
 navLinks.forEach(item=>{if(item===link)item.setAttribute('aria-current','location');else item.removeAttribute('aria-current');});
 indicator.style.width=`${link.offsetWidth}px`;indicator.style.transform=`translateX(${link.offsetLeft}px)`;
};
navLinks.forEach(link=>link.addEventListener('click',()=>updatePill(link)));
const sections=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){const link=navLinks.find(link=>link.hash===`#${entry.target.id}`);if(link)updatePill(link);}}},{rootMargin:'-15% 0px -65% 0px',threshold:0});
navLinks.forEach(link=>{const section=document.querySelector(link.hash);if(section)sections.observe(section);});
new ResizeObserver(()=>updatePill(navLinks.find(link=>link.hasAttribute('aria-current'))||navLinks[0])).observe(pillNav);
document.fonts.ready.then(()=>updatePill(navLinks.find(link=>link.hasAttribute('aria-current'))||navLinks[0]));
updatePill(navLinks[0]);
