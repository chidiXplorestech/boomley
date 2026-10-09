const {chromium}=require(process.env.PLAYWRIGHT_PACKAGE || 'playwright');
const fs=require('fs');
(async()=>{
 // Set CHROME_PATH for a locally installed browser, or install Playwright Chromium.
 const executablePath=process.env.CHROME_PATH;
 const browser=await chromium.launch({executablePath,args:['--no-sandbox','--disable-dev-shm-usage'],headless:true});
 fs.mkdirSync('docs/verification/browser',{recursive:true});const results=[];
 for(const width of [390,768,1366,1920]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.AUDIT_URL || 'http://127.0.0.1:4180',{waitUntil:'networkidle'});await page.locator('img').evaluateAll(imgs=>imgs.forEach(i=>i.loading='eager'));await page.waitForFunction(()=>[...document.images].every(i=>i.complete));await page.screenshot({path:`docs/verification/browser/${width}.png`,fullPage:true});
  const result=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,brand:document.querySelector('.boomer-logo').textContent,brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),grainOpacity:getComputedStyle(document.querySelector('.film-layer')).opacity}));
  results.push({width,...result,errors});await page.close();
 }
 const page=await browser.newPage({viewport:{width:1366,height:900},reducedMotion:'reduce'});await page.goto(process.env.AUDIT_URL || 'http://127.0.0.1:4180');
 await page.locator('#mail-subject').fill('QA test — do not send');await page.locator('#friction').fill('Local automated delivery-state test.');await page.locator('#signal-email').fill('qa@example.com');
 await page.route('**/*',route=>route.request().method()==='POST'?route.fulfill({status:500,body:'Test failure'}):route.continue());
 await page.getByRole('button',{name:'Send your note'}).click();await page.waitForFunction(()=>document.querySelector('[data-signal-mail]').dataset.state==='error');
 results.push({test:'failure preserves draft',passed:await page.locator('#friction').inputValue()==='Local automated delivery-state test.'});
 await page.unroute('**/*');await page.route('**/*',route=>route.request().method()==='POST'?route.fulfill({status:200,body:'Test accepted'}):route.continue());
 await page.getByRole('button',{name:'Send your note'}).click();await page.waitForFunction(()=>document.querySelector('[data-signal-mail]').dataset.state==='posted');results.push({test:'mocked backend acceptance shows receipt',passed:await page.locator('.mail-receipt').isVisible()});
 fs.writeFileSync('docs/verification/browser/results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
