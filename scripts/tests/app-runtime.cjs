/* Ordered-runtime regression: direct entry, hash/role switching, local book form,
 * login return, missing-source recovery and CDN loss. No sign-in or server writes. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright-core');
const base=process.env.TEST_ORIGIN||'http://127.0.0.1:8796';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_EXECUTABLE||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const results=[];
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage();
  page.setDefaultTimeout(8000);const errors=[],scripts=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.resourceType()==='script')scripts.push(new URL(r.url()).pathname)});
  await page.goto(base+'/app/?studentMode=study#student');await page.locator('.dsh').waitFor();await page.waitForTimeout(500);
  assert.match(await page.locator('#content').innerText(),/한 문제 풀어보기/);
  const scriptCount=scripts.filter(p=>p.endsWith('.js')&&!p.includes('cdn.jsdelivr')).length;
  assert(scriptCount<=8,`Expected bundled scripts only, got ${scriptCount}`);
  if(!await page.locator('.role-switch a[href="#teacher"]').isVisible())await page.locator('.ds-mobile-toggle').click();await page.locator('.role-switch a[href="#teacher"]').click();await page.waitForTimeout(200);assert.match(await page.locator('#content').innerText(),/내신 자료|프린트 만들기|교재 만들기/);
  await page.evaluate(()=>{const u=new URL(location.href);u.searchParams.set('teacherMode','book');u.hash='teacher';history.pushState({},'',u);dispatchEvent(new PopStateEvent('popstate'));});
  await page.locator('label.bf62-all').first().click();await page.locator('[data-bf62-next]').click();assert.match(await page.locator('#content').innerText(),/무엇을 바탕/);
  if(!await page.locator('.role-switch a[href="#student"]').isVisible())await page.locator('.ds-mobile-toggle').click();await page.locator('.role-switch a[href="#student"]').click();await page.waitForTimeout(150);assert.match(await page.locator('#content').innerText(),/한 문제 풀어보기/);
  await page.locator('#header a.login').click();await page.waitForTimeout(150);assert.match(await page.locator('#content').innerText(),/로그인/);
  await page.goBack();await page.waitForTimeout(150);assert.match(await page.locator('#content').innerText(),/한 문제 풀어보기/);
  assert.deepEqual(errors,[]);results.push({width,normalScriptRequests:scriptCount,flows:'study → teacher → book selection/next → student → login → back',errors});await context.close();
 }
 // Remove a prerequisite from the built response. The existing boot recovery must
 // discover its inert descriptor and retry the original URL exactly once.
 {
  const context=await browser.newContext(),page=await context.newPage();let retried=0;
  await context.route('**/runtime-after-core.js*',async route=>{const response=await route.fetch();let text=await response.text();const start=text.indexOf(';/* Original classic script: student-learning-domain-v54.js');const end=text.indexOf(';/* Original classic script:',start+10);assert(start>=0&&end>start);text=text.slice(0,start)+text.slice(end);await route.fulfill({response,body:text});});
  page.on('request',r=>{if(new URL(r.url()).pathname==='/app/student-learning-domain-v54.js')retried++});
  await page.goto(base+'/app/?studentMode=study#student');await page.waitForFunction(()=>window.DSStudyEntryBootV54?.started===true);assert.equal(retried,1);assert.match(await page.locator('#content').innerText(),/한 문제 풀어보기/);results.push({recovery:'missing student domain source',retried});await context.close();
 }
 {
  const context=await browser.newContext(),page=await context.newPage();await context.route('**cdn.jsdelivr.net/**',route=>route.fulfill({status:404,contentType:'text/css',body:''}));await page.goto(base+'/app/?studentMode=study#student');await page.locator('.dsh').waitFor();assert.match(await page.locator('#content').innerText(),/한 문제 풀어보기/);results.push({cdn404:'공부 화면 유지'});await context.close();
 }
 await browser.close();console.log(JSON.stringify({passed:true,results},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
