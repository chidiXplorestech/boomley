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

function initLoader() {
  const loader = document.querySelector<HTMLElement>('[data-loader]');
  if (!loader || reduced) return;

  document.body.classList.add('is-loading');

  const count = loader.querySelector<HTMLElement>('[data-loader-count]');
  const line = loader.querySelector<HTMLElement>('[data-loader-line]');
  const mark = loader.querySelector<HTMLElement>('[data-loader-mark]');
  const rest = loader.querySelector<HTMLElement>('.hub-loader__rest');
  const welcome = loader.querySelector<HTMLElement>('[data-loader-welcome]');

  const phrases = [
    'WE ALL HAVE THEM.',
    'PROBLEMS.',
    'THOUGHTS.',
    'IDEAS.',
    'SOMETIMES THEY KEEP COMING BACK.',
    'WE CALL THAT A SIGNAL.'
  ];

  const counter = { value: 0 };

  gsap.to(counter, {
    value: 100,
    duration: 3.65,
    ease: 'power1.inOut',
    onUpdate: () => {
      if (count) count.textContent = String(Math.round(counter.value)).padStart(3, '0');
    }
  });

  const tl = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    onComplete: () => {
      document.body.classList.remove('is-loading');
      ScrollTrigger.refresh();
    }
  });

  phrases.forEach((phrase, index) => {
    const at = index * .53;
    tl.to(line, { autoAlpha: 0, y: -12, duration: .18 }, at)
      .call(() => { if (line) line.textContent = phrase; }, undefined, at + .18)
      .fromTo(line, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .22 }, at + .2);
  });

  tl.to(line, { autoAlpha: 0, duration: .2 }, 3.2)
    .to(mark, { autoAlpha: 1, duration: .25 }, 3.45)
    .fromTo('.hub-loader__b', { scale: .7 }, { scale: 1, duration: .42, ease: 'back.out(1.7)' }, 3.45)
    .to(rest, { autoAlpha: 1, x: 0, duration: .45 }, 3.7)
    .to(welcome, { autoAlpha: 1, y: 0, duration: .25 }, 4.0)
    .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: .72, ease: 'power4.inOut' }, 4.35)
    .set(loader, { display: 'none' });
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

function initHero() {
  if (reduced) return;
  const title = document.querySelector<HTMLElement>('[data-hub-hero-title]');
  if (!title) return;

  SplitText.create(title, {
    type: 'lines,words',
    mask: 'lines',
    autoSplit: true,
    onSplit(self) {
      return gsap.timeline({ delay: 4.7, defaults: { ease: 'power4.out' } })
        .from(self.lines, { yPercent: 115, rotate: .5, duration: 1, stagger: .07 })
        .from('.hub-hero__portrait--one', { x: 60, y: 40, rotate: 4, autoAlpha: 0, duration: .85 }, .18)
        .from('.hub-hero__portrait--two', { x: -45, y: -20, rotate: -4, autoAlpha: 0, duration: .85 }, .3)
        .from('.hub-hero__stamp,.hub-hero__signal', { scale: .8, autoAlpha: 0, stagger: .08, duration: .4 }, .58)
        .from('.hub-hero__deck,.hub-hero__bottom,.hub-eyebrow', { y: 18, autoAlpha: 0, stagger: .08, duration: .5 }, .45);
    }
  });

  gsap.to('.hub-hero__portrait--one', {
    yPercent: -8,
    ease: 'none',
    scrollTrigger: { trigger: '.hub-hero', start: 'top top', end: 'bottom top', scrub: .7 }
  });
  gsap.to('.hub-hero__portrait--two', {
    yPercent: 9,
    ease: 'none',
    scrollTrigger: { trigger: '.hub-hero', start: 'top top', end: 'bottom top', scrub: .7 }
  });
}

function initReveal() {
  if (reduced) return;
  gsap.utils.toArray<HTMLElement>('[data-hub-reveal]').forEach((el) => {
    if (el.closest('.hub-hero')) return;
    gsap.from(el, {
      y: 34,
      autoAlpha: 0,
      duration: .8,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });
}

function initStory() {
  if (reduced) return;
  const beats = gsap.utils.toArray<HTMLElement>('.hub-story__beat');

  beats.forEach((beat, index) => {
    const heading = beat.querySelector('h2');
    const copy = beat.querySelector('p');
    gsap.fromTo([heading, copy],
      { autoAlpha: .2, y: 36 },
      {
        autoAlpha: 1,
        y: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: beat,
          start: 'top 74%',
          end: 'top 35%',
          scrub: .6
        }
      }
    );

    if (index < beats.length - 1) {
      gsap.to(beat, {
        scale: .94,
        autoAlpha: .12,
        filter: 'blur(8px)',
        ease: 'none',
        scrollTrigger: {
          trigger: beats[index + 1],
          start: 'top 75%',
          end: 'top 25%',
          scrub: .7
        }
      });
    }
  });

  gsap.from('.hub-story__resolution h3', {
    letterSpacing: '.18em',
    autoAlpha: 0,
    scale: .84,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hub-story__resolution',
      start: 'top 75%',
      end: 'top 25%',
      scrub: .7
    }
  });
}

function initProcess() {
  if (reduced) return;
  gsap.from('.hub-process__rail article', {
    y: 42,
    autoAlpha: 0,
    stagger: .07,
    duration: .7,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.hub-process__rail',
      start: 'top 84%',
      once: true
    }
  });
}

function initHistory() {
  if (reduced) return;
  gsap.from('.hub-history__timeline article', {
    x: -34,
    autoAlpha: 0,
    stagger: .09,
    duration: .7,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.hub-history__timeline',
      start: 'top 84%',
      once: true
    }
  });
}

type FounderKey = 'chidi' | 'michael';

function initAsciiPortraits() {
  const canvases = Array.from(document.querySelectorAll<HTMLCanvasElement>('[data-hub-ascii]'));
  if (!canvases.length) return;

  const image = new Image();
  image.src = '/media/founders-sprite.webp';

  image.addEventListener('load', () => {
    canvases.forEach((canvas) => {
      const founder = (canvas.dataset.founder || 'chidi') as FounderKey;
      const card = canvas.closest<HTMLElement>('[data-hub-person]');
      if (!card) return;

      const charset = ' .,:;irsXA253hMHGS#9B&@';
      let cells: Array<{ char:string; light:number; x:number; y:number }> = [];
      let cols = 0;
      let rows = 0;
      let frame = 0;
      let raf = 0;

      const measure = () => {
        const rect = canvas.getBoundingClientRect();
        const cssW = Math.max(180, rect.width);
        const cssH = Math.max(220, rect.height);
        const cell = Math.max(6, Math.min(10, Math.round(cssW / 64)));
        cols = Math.max(24, Math.floor(cssW / cell));
        rows = Math.max(30, Math.floor(cssH / (cell * 1.15)));

        const dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.floor(cssW * dpr);
        canvas.height = Math.floor(cssH * dpr);

        const sample = document.createElement('canvas');
        sample.width = cols;
        sample.height = rows;
        const sctx = sample.getContext('2d', { willReadFrequently:true });
        if (!sctx) return;

        const halfW = image.naturalWidth / 2;
        const halfH = image.naturalHeight / 2;
        const sx = founder === 'michael' ? halfW : 0;
        sctx.drawImage(image, sx, 0, halfW, halfH, 0, 0, cols, rows);

        const pixels = sctx.getImageData(0,0,cols,rows).data;
        cells = [];
        for (let y=0;y<rows;y++) {
          for (let x=0;x<cols;x++) {
            const i = (y*cols+x)*4;
            const light = (pixels[i]*.2126 + pixels[i+1]*.7152 + pixels[i+2]*.0722)/255;
            const index = Math.min(charset.length-1, Math.floor((1-light)*charset.length));
            cells.push({ char:charset[index], light, x, y });
          }
        }
        draw(1);
      };

      const draw = (progress:number) => {
        const ctx = canvas.getContext('2d');
        if (!ctx || !cols || !rows) return;

        const charW = canvas.width/cols;
        const charH = canvas.height/rows;
        ctx.fillStyle = '#0c0e12';
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${Math.max(7,charH*.82)}px "IBM Plex Mono", monospace`;

        cells.forEach((cell,index) => {
          const resolved = progress >= 1 || ((index*17 + Math.floor(progress*100))%100) < progress*100;
          const char = resolved ? cell.char : charset[(index*13 + frame*7)%charset.length];
          const l = Math.max(.12,cell.light);
          const r = 56 + Math.round(l*72);
          const g = 115 + Math.round(l*72);
          const b = 176 + Math.round(l*72);
          ctx.fillStyle = `rgba(${r},${g},${b},${.38+l*.62})`;
          ctx.fillText(char,cell.x*charW+charW/2,cell.y*charH+charH/2);
        });

        ctx.fillStyle='rgba(130,189,247,.16)';
        ctx.fillRect(0,(frame*3)%canvas.height,canvas.width,1);
      };

      const animate = () => {
        cancelAnimationFrame(raf);
        const start = performance.now();
        const tick = (now:number) => {
          frame++;
          const p = Math.min(1,(now-start)/500);
          draw(1-Math.pow(1-p,3));
          if (p<1) raf=requestAnimationFrame(tick);
        };
        raf=requestAnimationFrame(tick);
      };

      card.addEventListener('pointerenter',animate);
      card.addEventListener('focus',animate);
      measure();
      window.addEventListener('resize',() => setTimeout(measure,100));
    });
  });
}

function initBuilds() {
  if (reduced) return;
  gsap.utils.toArray<HTMLElement>('.hub-evidence').forEach((el,index) => {
    gsap.to(el, {
      yPercent:index%2?-9:8,
      rotate:index%2?'+=2':'-=2',
      ease:'none',
      scrollTrigger:{
        trigger:'.hub-builds__evidence',
        start:'top bottom',
        end:'bottom top',
        scrub:.8
      }
    });
  });
}

function buildField(container: HTMLElement, count = 130) {
  let seed = 74139;
  const rand = () => {
    seed = (seed*1664525+1013904223)%4294967296;
    return seed/4294967296;
  };

  const frag = document.createDocumentFragment();
  for (let i=0;i<count;i++) {
    const person = document.createElement('i');
    person.style.left = `${rand()*96+2}%`;
    person.style.top = `${rand()*88+6}%`;
    person.style.setProperty('--s', `${2+rand()*5}px`);
    person.style.setProperty('--d', `${(rand()-.5)*18}px`);
    if (i%11===0 || i%17===0) person.classList.add('is-signal');
    frag.appendChild(person);
  }
  container.appendChild(frag);
}

function initCommunityField() {
  const field = document.querySelector<HTMLElement>('[data-community-field]');
  if (!field) return;
  buildField(field,150);
}

function initEndingField() {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-hub-ending-field]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let seed = 91822;
  const rand = () => {
    seed = (seed*1664525+1013904223)%4294967296;
    return seed/4294967296;
  };
  const people = Array.from({length:120},(_,i)=>({
    x:rand(),y:.08+rand()*.82,s:2.3+rand()*5.2,p:rand()*Math.PI*2,blue:i%13===0
  }));

  let w=0,h=0,dpr=1,raf=0;
  const resize=()=>{
    const rect=canvas.getBoundingClientRect();
    w=rect.width;h=rect.height;dpr=Math.min(2,window.devicePixelRatio||1);
    canvas.width=Math.max(1,Math.floor(w*dpr));
    canvas.height=Math.max(1,Math.floor(h*dpr));
  };

  const render=(time=0)=>{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    people.forEach(p=>{
      const drift=reduced?0:Math.sin(time*.00045+p.p)*2.2;
      const x=(p.x*w+drift)*dpr;
      const y=p.y*h*dpr;
      const s=p.s*dpr;
      ctx.strokeStyle=p.blue?'rgba(130,189,247,.82)':'rgba(255,255,255,.28)';
      ctx.fillStyle=p.blue?'rgba(130,189,247,.82)':'rgba(255,255,255,.32)';
      ctx.lineWidth=Math.max(1,.7*dpr);
      ctx.beginPath();ctx.arc(x,y-s*1.4,s*.35,0,Math.PI*2);ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x,y-s*.95);ctx.lineTo(x,y+s*.8);
      ctx.moveTo(x,y-s*.2);ctx.lineTo(x-s*.65,y+s*.25);
      ctx.moveTo(x,y-s*.2);ctx.lineTo(x+s*.65,y+s*.25);
      ctx.moveTo(x,y+s*.8);ctx.lineTo(x-s*.45,y+s*1.65);
      ctx.moveTo(x,y+s*.8);ctx.lineTo(x+s*.45,y+s*1.65);
      ctx.stroke();
    });
    if(!reduced) raf=requestAnimationFrame(render);
  };

  resize();render();
  window.addEventListener('resize',resize);
  window.addEventListener('pagehide',()=>cancelAnimationFrame(raf),{once:true});
}

function initForms() {
  const productForm = document.querySelector<HTMLFormElement>('form[name="product-1000001"]');
  const productStatus = productForm?.querySelector<HTMLElement>('[data-product-form-status]');
  if (productForm && productStatus) {
    productForm.addEventListener('submit',async(event)=>{
      event.preventDefault();
      if(!productForm.reportValidity()) return;
      productStatus.textContent='TRANSMITTING...';
      try{
        await postNetlifyForm(productForm);
        productStatus.textContent='RECEIVED / WE\'LL KEEP YOU CLOSE.';
        productForm.reset();
      }catch{
        productStatus.textContent='TRANSMISSION FAILED / TRY AGAIN.';
      }
    });
  }

  const signalForm=document.querySelector<HTMLFormElement>('[data-hub-signal-form]');
  const wrap=document.querySelector<HTMLButtonElement>('[data-hub-wrap]');
  const post=document.querySelector<HTMLButtonElement>('[data-hub-post]');
  const envelope=document.querySelector<HTMLElement>('[data-hub-envelope]');
  const box=document.querySelector<HTMLElement>('[data-hub-postbox]');
  const status=document.querySelector<HTMLElement>('[data-hub-signal-status]');
  if(!signalForm||!wrap||!post||!envelope||!box||!status) return;

  let wrapped=false;

  wrap.addEventListener('click',()=>{
    if(!signalForm.reportValidity()) return;
    wrapped=true;
    wrap.disabled=true;
    post.disabled=false;
    envelope.classList.add('is-ready');
    status.textContent='LETTER READY / NOW POST IT.';

    if(reduced) return;
    const paper=envelope.querySelector<HTMLElement>('.hub-envelope__paper');
    const flap=envelope.querySelector<HTMLElement>('.hub-envelope__flap');
    gsap.timeline({defaults:{ease:'power3.inOut'}})
      .fromTo(envelope,{autoAlpha:0,scale:.68,rotate:-11},{autoAlpha:1,scale:1,rotate:-4,duration:.58})
      .to(paper,{y:35,scaleY:.7,duration:.42},.13)
      .fromTo(flap,{rotateX:0},{rotateX:-176,transformOrigin:'top center',duration:.48},.4)
      .to(envelope,{rotate:0,duration:.25},.72);
  });

  signalForm.addEventListener('submit',async(event)=>{
    event.preventDefault();
    if(!wrapped||!signalForm.reportValidity()) return;

    post.disabled=true;
    status.textContent='POSTING SIGNAL...';

    const slot=box.querySelector<HTMLElement>('.hub-postbox__slot');
    const er=envelope.getBoundingClientRect();
    const sr=slot?.getBoundingClientRect();

    if(!reduced&&sr){
      const dx=(sr.left+sr.width/2)-(er.left+er.width/2);
      const dy=(sr.top+sr.height/2)-(er.top+er.height/2);
      await new Promise<void>((resolve)=>{
        gsap.timeline({defaults:{ease:'power2.inOut'},onComplete:resolve})
          .to(envelope,{x:dx,y:dy,rotate:-3,scale:.58,duration:.85})
          .to(envelope,{scaleX:.43,scaleY:.08,autoAlpha:.1,duration:.34,ease:'power2.in'})
          .to(box,{y:3,scale:.993,duration:.1,yoyo:true,repeat:1},'<');
      });
    }

    try{
      await postNetlifyForm(signalForm);
      status.textContent='SIGNAL RECEIVED / WE\'LL LISTEN.';
      signalForm.reset();
      wrapped=false;
      setTimeout(()=>{
        wrap.disabled=false;
        post.disabled=true;
        envelope.classList.remove('is-ready');
        gsap.set(envelope,{clearProps:'all'});
        gsap.set(envelope.querySelector('.hub-envelope__paper'),{clearProps:'all'});
        gsap.set(envelope.querySelector('.hub-envelope__flap'),{clearProps:'all'});
        status.textContent='';
      },2600);
    }catch{
      status.textContent='SIGNAL COULD NOT BE POSTED / TRY AGAIN.';
      post.disabled=false;
      if(!reduced) gsap.to(envelope,{x:0,y:0,scale:1,scaleX:1,scaleY:1,autoAlpha:1,duration:.5});
    }
  });
}

function initAnchors() {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(link=>{
    link.addEventListener('click',(event)=>{
      const id=link.getAttribute('href');
      if(!id||id==='#') return;
      const target=document.querySelector(id);
      if(!target) return;
      event.preventDefault();
      target.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
    });
  });
}

initLoader();
initCursor();
initHero();
initReveal();
initStory();
initProcess();
initHistory();
initAsciiPortraits();
initBuilds();
initCommunityField();
initEndingField();
initForms();
initAnchors();
