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
  const copy = loader.querySelector<HTMLElement>('[data-loader-copy]');
  const logo = loader.querySelector<HTMLElement>('[data-loader-logo]');
  const welcome = loader.querySelector<HTMLElement>('[data-loader-welcome]');

  const phrases = [
    'WE ALL HAVE THEM.',
    'A PROBLEM.',
    'A THOUGHT.',
    'AN IDEA.',
    'WHEN IT KEEPS COMING BACK…',
    'WE CALL THAT A SIGNAL.'
  ];

  const counter = { value: 0 };
  gsap.to(counter, {
    value: 100,
    duration: 3.15,
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

  phrases.forEach((phrase, i) => {
    const at = i * .47;
    tl.to(copy, { autoAlpha: 0, y: -10, duration: .16 }, at)
      .call(() => { if (copy) copy.textContent = phrase; }, undefined, at + .16)
      .fromTo(copy, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .22 }, at + .18);
  });

  tl.to(copy, { autoAlpha: 0, duration: .18 }, 2.82)
    .to(logo, { autoAlpha: 1, duration: .28 }, 2.98)
    .fromTo(logo, { scale: .95 }, { scale: 1, duration: .38, ease: 'power3.out' }, 2.98)
    .to(welcome, { autoAlpha: 1, duration: .2 }, 3.22)
    .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: .62, ease: 'power4.inOut' }, 3.58)
    .set(loader, { display: 'none' });
}

function initHero() {
  if (reduced) return;
  const title = document.querySelector<HTMLElement>('.hero h1');
  if (!title) return;

  SplitText.create(title, {
    type: 'lines,words',
    mask: 'lines',
    autoSplit: true,
    onSplit(self) {
      const tl = gsap.timeline({ delay: 4.0, defaults: { ease: 'power4.out' } });
      tl.from(self.lines, { yPercent: 112, duration: .9, stagger: .06 })
        .from('.hero-deck,.hero-meta,.eyebrow', { y: 18, autoAlpha: 0, stagger: .07, duration: .46 }, .26)
        .from('.founder-tile', { y: 35, autoAlpha: 0, scale: .97, stagger: .08, duration: .72 }, .16)
        .from('.hero-sticker,.hero-signal-card', { scale: .8, autoAlpha: 0, stagger: .08, duration: .4 }, .52);
      return tl;
    }
  });

  gsap.to('.founder-tile[data-founder-tile="chidi"]', {
    yPercent: -7,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .7 }
  });
  gsap.to('.founder-tile[data-founder-tile="michael"]', {
    yPercent: 8,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .7 }
  });
}

function initFounderRotation() {
  const hero = document.querySelector<HTMLElement>('[data-founder-rotator]');
  const people = document.querySelector<HTMLElement>('[data-people-rotator]');
  if (!hero || !people || reduced) return;

  let swapped = false;
  const rotate = () => {
    swapped = !swapped;
    hero.classList.toggle('is-swapped', swapped);
    people.classList.toggle('is-swapped', swapped);
  };

  window.setTimeout(() => {
    rotate();
    window.setInterval(rotate, 8200);
  }, 7000);
}

function initSignalLab() {
  if (reduced) return;
  const ring = document.querySelector<HTMLElement>('[data-scan-ring]');
  const field = document.querySelector<HTMLElement>('[data-ascii-field]');
  if (!ring || !field) return;

  gsap.to(ring, {
    rotate: 360,
    duration: 18,
    repeat: -1,
    ease: 'none'
  });

  gsap.to(field, {
    yPercent: -18,
    xPercent: 4,
    ease: 'none',
    scrollTrigger: {
      trigger: '.signal-lab',
      start: 'top bottom',
      end: 'bottom top',
      scrub: .7
    }
  });

  const label = ring.querySelector('span');
  ScrollTrigger.create({
    trigger: '.signal-lab',
    start: 'top 50%',
    end: 'bottom 45%',
    onEnter: () => { if (label) label.textContent = 'SIGNAL FOUND'; },
    onLeaveBack: () => { if (label) label.textContent = 'SEARCHING'; }
  });
}

function initProcess() {
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-process-tab]'));
  const cards = Array.from(document.querySelectorAll<HTMLElement>('.process-card'));
  if (!tabs.length || !cards.length) return;

  let active = 0;
  const show = (index: number) => {
    active = index;
    tabs.forEach((tab, i) => tab.classList.toggle('is-active', i === index));
    cards.forEach((card, i) => {
      if (i === index) {
        card.classList.add('is-active');
        if (!reduced) gsap.fromTo(card, { autoAlpha: 0, y: 26, scale: .985 }, { autoAlpha: 1, y: 0, scale: 1, duration: .5, ease: 'power3.out' });
      } else {
        card.classList.remove('is-active');
      }
    });
  };

  tabs.forEach((tab, i) => tab.addEventListener('click', () => show(i)));

  if (!reduced) {
    cards.forEach((_, i) => {
      ScrollTrigger.create({
        trigger: '.process',
        start: `top+=${i * 16}% center`,
        end: `top+=${(i + 1) * 16}% center`,
        onEnter: () => show(i),
        onEnterBack: () => show(i)
      });
    });
  }

  show(active);
}

type FounderKey = 'chidi' | 'michael';

function initAsciiPortraits() {
  const canvases = Array.from(document.querySelectorAll<HTMLCanvasElement>('[data-founder-ascii]'));
  if (!canvases.length) return;

  canvases.forEach((canvas) => {
    const founder = (canvas.dataset.founderAscii || 'chidi') as FounderKey;
    const card = canvas.closest<HTMLElement>('.person');
    if (!card) return;

    const image = new Image();
    image.decoding = 'async';
    image.src = founder === 'michael' ? '/media/founders/michael.webp' : '/media/founders/chidi.webp';

    image.addEventListener('load', () => {
      const chars = ' .,:;irsXA253hMHGS#9B&@';
      let cells: Array<{ char:string; light:number; x:number; y:number }> = [];
      let cols = 0;
      let rows = 0;
      let frame = 0;
      let raf = 0;

      const measure = () => {
        const rect = canvas.getBoundingClientRect();
        const w = Math.max(220, rect.width);
        const h = Math.max(220, rect.height);
        const cell = Math.max(6, Math.min(10, Math.round(w / 62)));
        cols = Math.max(28, Math.floor(w / cell));
        rows = Math.max(28, Math.floor(h / (cell * 1.05)));
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);

        const sample = document.createElement('canvas');
        sample.width = cols;
        sample.height = rows;
        const sctx = sample.getContext('2d', { willReadFrequently:true });
        if (!sctx) return;

        const src = Math.min(image.naturalWidth, image.naturalHeight);
        const sx = (image.naturalWidth - src) / 2;
        const sy = (image.naturalHeight - src) / 2;
        sctx.drawImage(image, sx, sy, src, src, 0, 0, cols, rows);

        const px = sctx.getImageData(0,0,cols,rows).data;
        cells = [];
        for (let y=0;y<rows;y++) {
          for (let x=0;x<cols;x++) {
            const i=(y*cols+x)*4;
            const light=(px[i]*.2126+px[i+1]*.7152+px[i+2]*.0722)/255;
            const idx=Math.min(chars.length-1,Math.floor((1-light)*chars.length));
            cells.push({char:chars[idx],light,x,y});
          }
        }
        draw(1);
      };

      const draw=(progress:number)=>{
        const ctx=canvas.getContext('2d');
        if(!ctx||!cols||!rows)return;
        const cw=canvas.width/cols;
        const ch=canvas.height/rows;
        ctx.fillStyle='#0c0f13';
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.textAlign='center';
        ctx.textBaseline='middle';
        ctx.font=`${Math.max(7,ch*.82)}px "IBM Plex Mono", monospace`;

        cells.forEach((cell,index)=>{
          const resolved=progress>=1||((index*17+Math.floor(progress*100))%100)<progress*100;
          const char=resolved?cell.char:chars[(index*13+frame*7)%chars.length];
          const l=Math.max(.12,cell.light);
          const r=52+Math.round(l*75);
          const g=115+Math.round(l*75);
          const b=180+Math.round(l*68);
          ctx.fillStyle=`rgba(${r},${g},${b},${.34+l*.66})`;
          ctx.fillText(char,cell.x*cw+cw/2,cell.y*ch+ch/2);
        });

        ctx.fillStyle='rgba(242,201,76,.18)';
        ctx.fillRect(0,(frame*4)%canvas.height,canvas.width,Math.max(1,canvas.width/800));
      };

      const animate=()=>{
        cancelAnimationFrame(raf);
        const start=performance.now();
        const tick=(now:number)=>{
          frame++;
          const p=Math.min(1,(now-start)/540);
          draw(1-Math.pow(1-p,3));
          if(p<1)raf=requestAnimationFrame(tick);
        };
        raf=requestAnimationFrame(tick);
      };

      card.addEventListener('pointerenter',animate);
      card.addEventListener('focusin',animate);
      measure();

      let timer=0;
      window.addEventListener('resize',()=>{
        window.clearTimeout(timer);
        timer=window.setTimeout(measure,120);
      });
    });
  });
}

function initBuilds() {
  if (reduced) return;
  gsap.utils.toArray<HTMLElement>('.artifact').forEach((el, i) => {
    gsap.to(el, {
      yPercent: i % 2 ? -8 : 8,
      rotate: i % 2 ? '+=1.5' : '-=1.5',
      ease: 'none',
      scrollTrigger: {
        trigger: '.builds-wall',
        start: 'top bottom',
        end: 'bottom top',
        scrub: .8
      }
    });
  });
}

function initReveal() {
  if (reduced) return;
  const selectors = [
    '.section-head',
    '.history-intro',
    '.people-title',
    '.community-copy h2',
    '.community-copy>p',
    '.builds-deck',
    '.status-rail',
    '.waitlist',
    '.signal-box-intro',
    '.signal-form',
    '.post-stage'
  ];
  gsap.utils.toArray<HTMLElement>(selectors.join(',')).forEach((el) => {
    gsap.from(el, {
      y: 28,
      autoAlpha: 0,
      duration: .75,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });
}

function initEndingField() {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-ending-field]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let seed=91822;
  const rand=()=>{seed=(seed*1664525+1013904223)%4294967296;return seed/4294967296;};
  const people=Array.from({length:135},(_,i)=>({x:rand(),y:.08+rand()*.84,s:2.2+rand()*5,p:rand()*Math.PI*2,hot:i%14===0||i%23===0}));
  let w=0,h=0,dpr=1,raf=0;

  const resize=()=>{
    const rect=canvas.getBoundingClientRect();
    w=rect.width;h=rect.height;dpr=Math.min(2,window.devicePixelRatio||1);
    canvas.width=Math.floor(w*dpr);canvas.height=Math.floor(h*dpr);
  };

  const render=(time=0)=>{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    people.forEach(p=>{
      const drift=reduced?0:Math.sin(time*.00045+p.p)*2;
      const x=(p.x*w+drift)*dpr;
      const y=p.y*h*dpr;
      const s=p.s*dpr;
      ctx.strokeStyle=p.hot?'rgba(242,201,76,.8)':'rgba(255,255,255,.24)';
      ctx.fillStyle=p.hot?'rgba(242,201,76,.82)':'rgba(255,255,255,.28)';
      ctx.lineWidth=Math.max(1,.7*dpr);
      ctx.beginPath();ctx.arc(x,y-s*1.35,s*.34,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.moveTo(x,y-s*.9);ctx.lineTo(x,y+s*.8);
      ctx.moveTo(x,y-s*.15);ctx.lineTo(x-s*.6,y+s*.2);
      ctx.moveTo(x,y-s*.15);ctx.lineTo(x+s*.6,y+s*.2);
      ctx.moveTo(x,y+s*.8);ctx.lineTo(x-s*.45,y+s*1.65);
      ctx.moveTo(x,y+s*.8);ctx.lineTo(x+s*.45,y+s*1.65);ctx.stroke();
    });
    if(!reduced)raf=requestAnimationFrame(render);
  };

  resize();render();
  window.addEventListener('resize',resize);
  window.addEventListener('pagehide',()=>cancelAnimationFrame(raf),{once:true});
}

function initForms() {
  const waitlist=document.querySelector<HTMLFormElement>('form[name="product-1000001"]');
  const waitStatus=waitlist?.querySelector<HTMLElement>('[data-product-status]');
  if(waitlist&&waitStatus){
    waitlist.addEventListener('submit',async(e)=>{
      e.preventDefault();
      if(!waitlist.reportValidity())return;
      waitStatus.textContent='TRANSMITTING...';
      try{
        await postNetlifyForm(waitlist);
        waitStatus.textContent='RECEIVED / WE\'LL KEEP YOU CLOSE.';
        waitlist.reset();
      }catch{
        waitStatus.textContent='TRANSMISSION FAILED / TRY AGAIN.';
      }
    });
  }

  const form=document.querySelector<HTMLFormElement>('[data-signal-form]');
  const wrap=document.querySelector<HTMLButtonElement>('[data-wrap]');
  const post=document.querySelector<HTMLButtonElement>('[data-post]');
  const envelope=document.querySelector<HTMLElement>('[data-envelope]');
  const box=document.querySelector<HTMLElement>('[data-postbox]');
  const status=document.querySelector<HTMLElement>('[data-signal-status]');
  if(!form||!wrap||!post||!envelope||!box||!status)return;

  let wrapped=false;

  wrap.addEventListener('click',()=>{
    if(!form.reportValidity())return;
    wrapped=true;wrap.disabled=true;post.disabled=false;envelope.classList.add('is-ready');
    status.textContent='LETTER READY / NOW POST IT.';
    if(reduced)return;
    const paper=envelope.querySelector<HTMLElement>('.paper');
    const flap=envelope.querySelector<HTMLElement>('.flap');
    gsap.timeline({defaults:{ease:'power3.inOut'}})
      .fromTo(envelope,{autoAlpha:0,scale:.68,rotate:-11},{autoAlpha:1,scale:1,rotate:-4,duration:.58})
      .to(paper,{y:35,scaleY:.7,duration:.42},.13)
      .fromTo(flap,{rotateX:0},{rotateX:-176,transformOrigin:'top center',duration:.48},.4)
      .to(envelope,{rotate:0,duration:.25},.72);
  });

  form.addEventListener('submit',async(e)=>{
    e.preventDefault();
    if(!wrapped||!form.reportValidity())return;
    post.disabled=true;status.textContent='POSTING SIGNAL...';

    const slot=box.querySelector<HTMLElement>('.postbox-slot');
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
      await postNetlifyForm(form);
      status.textContent='SIGNAL RECEIVED / WE\'LL LISTEN.';
      form.reset();wrapped=false;
      setTimeout(()=>{
        wrap.disabled=false;post.disabled=true;envelope.classList.remove('is-ready');
        gsap.set(envelope,{clearProps:'all'});gsap.set(envelope.querySelector('.paper'),{clearProps:'all'});gsap.set(envelope.querySelector('.flap'),{clearProps:'all'});
        status.textContent='';
      },2400);
    }catch{
      status.textContent='SIGNAL COULD NOT BE POSTED / TRY AGAIN.';
      post.disabled=false;
      if(!reduced)gsap.to(envelope,{x:0,y:0,scale:1,scaleX:1,scaleY:1,autoAlpha:1,duration:.5});
    }
  });
}

function initAnchors(){
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(link=>{
    link.addEventListener('click',(e)=>{
      const id=link.getAttribute('href');if(!id||id==='#')return;
      const target=document.querySelector(id);if(!target)return;
      e.preventDefault();target.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
    });
  });
}

initLoader();
initHero();
initFounderRotation();
initSignalLab();
initProcess();
initAsciiPortraits();
initBuilds();
initReveal();
initEndingField();
initForms();
initAnchors();
