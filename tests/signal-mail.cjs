// Regression checks for submission state and draft preservation (not browser/render tests).
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { transformSync } = require('esbuild');
const source = fs.readFileSync('src/scripts/observatory.ts', 'utf8');
const code = transformSync(source.slice(source.indexOf('async function deliver')), { loader: 'ts', target: 'es2022' }).code;
async function check({ accepted, reducedMotion = false, hide = false }) {
  const handlers = {}, motions = [], states = [];
  let resets = 0, calls = 0, resolveRequest;
  const element = name => ({ name, hidden: false, disabled: false, open: false, style: {}, textContent: '',
    dataset: new Proxy({}, { set(o,k,v) { o[k]=v; if(k==='state')states.push(v); return true; } }),
    addEventListener(type, fn) { handlers[name + ':' + type] = fn; },
    setAttribute() {}, removeAttribute() {}, focus() {}, reportValidity() { return true; },
    getBoundingClientRect() { return { left: name==='slot'?400:100, top:100, width:180, height:100 }; },
    showModal() { this.open=true; }, close() { this.open=false; }, reset() { resets++; }
  });
  const letter=element('letter'), fields=element('fields'), receipt=element('receipt'), status=element('status'), stage=element('stage'), stageStatus=element('stageStatus'), paper=element('paper'), top=element('top'), bottom=element('bottom'), envelope=element('envelope'), flap=element('flap'), seal=element('seal'), slot=element('slot'), hideButton=element('hide'), again=element('again');
  receipt.hidden=true;
  letter.querySelector = () => fields;
  const inside={ '[data-stage-status]':stageStatus,'.fold-letter':paper,'.fold-top':top,'.fold-bottom':bottom,'.flying-envelope':envelope,'.envelope-flap':flap,'.envelope-seal':seal,'.stage-slot':slot,'.stage-hide':hideButton };
  stage.querySelector = s => inside[s];
  const selectors={'[data-signal-mail]':letter,'.mail-status':status,'.mail-receipt':receipt,'.mail-stage':stage,'.mail-again':again};
  const context={ document:{querySelector:s=>selectors[s],querySelectorAll:()=>[]}, reduced:{matches:reducedMotion,addEventListener(){}}, paused:false, URLSearchParams,AbortController,clearTimeout,
    window:{setTimeout}, FormData:class {forEach(fn){assert.equal(fields.disabled,false,'serialize before disabling');fn('boomley-signal','form-name');fn('An ordinary problem','subject');fn('A recurring problem worth investigating.','friction');fn('visitor@example.com','email');fn('','bot-field');}},
    fetch:async (url,opts)=>{calls++;assert.equal(url,'/');assert.equal(opts.method,'POST');assert.equal(new URLSearchParams(opts.body).get('form-name'),'boomley-signal');return new Promise(resolve=>resolveRequest=resolve);},
    gsap:{set(){},timeline({onComplete}){const tl={to(el,props){motions.push([el.name,props]);return tl;},fromTo(el,from,to){motions.push([el.name,to]);return tl;},progress(){onComplete();},kill(){}};queueMicrotask(onComplete);return tl;}}
  };
  vm.runInNewContext(code,context);
  const task=handlers['letter:submit']({preventDefault(){}});
  await handlers['letter:submit']({preventDefault(){}});
  if(hide)handlers['hide:click']();
  await new Promise(r=>setImmediate(r));
  assert.equal(calls,1,'double clicks must not post twice');
  assert.equal(receipt.hidden,true,'receipt must wait for network acceptance');
  assert(!states.includes('posted'));
  resolveRequest({ok:accepted}); await task;
  assert.equal(resets,accepted?1:0,'failed delivery must preserve draft');
  assert.equal(receipt.hidden,!accepted);
  assert.equal(fields.disabled,false);
  assert.equal(stage.open,false);
  assert.equal(states.at(-1),accepted?'posted':'error');
  if(!reducedMotion&&!hide) {assert(motions.some(([name,p])=>name==='top'&&p.rotationX===-179));assert(motions.some(([name,p])=>name==='bottom'&&p.rotationX===179));}
  if(!accepted)assert(!motions.some(([name,p])=>name==='envelope'&&p.x!==undefined),'no posting flight after failed delivery');
  console.log('PASS', {accepted,reducedMotion,hide});
}
(async()=>{for(const accepted of [true,false])for(const reducedMotion of [false,true])await check({accepted,reducedMotion});await check({accepted:true,hide:true});await check({accepted:false,hide:true});})().catch(e=>{console.error(e);process.exitCode=1});
