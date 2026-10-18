import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const base='https://app.wayfind.workers.dev';
const raw=path.resolve('out/raw/pixel-10-pro');
await mkdir(raw,{recursive:true});
await mkdir('composition/assets',{recursive:true});
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:412,height:919},deviceScaleFactor:2,locale:'en-US',timezoneId:'Africa/Kigali'});
const page=await context.newPage();
page.setDefaultTimeout(30000);
const shots=[];
const evidence=[];
async function shot(id){await page.waitForTimeout(600);await page.evaluate(()=>document.fonts.ready);const file=path.join(raw,`${id}.png`);await page.screenshot({path:file});await page.screenshot({path:`composition/assets/${id}.png`});shots.push({sceneId:id,file});evidence.push({id,url:page.url(),heading:await page.locator('h1').first().textContent()});}
await page.goto(base,{waitUntil:'networkidle'});
await page.getByRole('button',{name:'Begin',exact:true}).click();
await page.getByRole('button',{name:'Join the conversation'}).waitFor();
await shot('daily');
await page.getByRole('button',{name:'Feel',exact:true}).click();
await shot('feel-entry');
await page.getByRole('textbox',{name:'Describe how you feel'}).fill('anxious');
await page.getByRole('button',{name:'Search',exact:true}).click();
await shot('feel');
await page.getByRole('button',{name:'Bible',exact:true}).click();
await page.getByRole('button',{name:'KIN',exact:true}).click();
await page.locator('.reading[lang="rw"] p').first().waitFor();
await shot('kinyarwanda');
await page.getByRole('button',{name:'Fellowship',exact:true}).click();
await page.getByRole('heading',{name:'Chats',exact:true}).waitFor();
await shot('fellowship');
await page.getByRole('button',{name:/Prayer Wall.*Community group/}).click();
const plus=page.getByRole('button',{name:'Add attachment',exact:true});
await plus.waitFor({state:'visible'});
await page.waitForFunction(()=>!document.querySelector('[aria-label="Add attachment"]')?.disabled);
await shot('chat');
await plus.click();
await page.getByRole('button',{name:/Camera Photograph/}).waitFor();
await shot('share');
await page.getByRole('button',{name:/Share a verse Send/}).click();
await page.getByRole('dialog',{name:'Share a verse'}).waitFor();
await page.getByRole('button',{name:/Psalm 34:18/}).click();
await page.getByRole('button',{name:'Remove verse'}).waitFor();
await shot('verse-preview'); // Draft only: no messages sent to public rooms.
await writeFile(path.join(raw,'manifest.json'),JSON.stringify({device:'pixel-10-pro',udid:'browser-pwa-capture',capturedAt:new Date().toISOString(),screenshots:shots,preview:null},null,2));
await writeFile('capture-evidence.json',JSON.stringify({base,method:'Genuine browser screenshots of the deployed PWA. No native app-store capture or fabricated customer data.',screens:evidence},null,2));
for(const [file,url] of Object.entries({
  'logo.jpeg':`${base}/wayfind-logo.jpeg`,
  'dm-sans.ttf':'https://raw.githubusercontent.com/google/fonts/main/ofl/dmsans/DMSans%5Bopsz%2Cwght%5D.ttf',
  'lora.ttf':'https://raw.githubusercontent.com/google/fonts/main/ofl/lora/Lora%5Bwght%5D.ttf',
})){const response=await fetch(url);if(!response.ok)throw new Error(`${file}: ${response.status}`);await writeFile(`composition/assets/${file}`,Buffer.from(await response.arrayBuffer()));}
await context.close();await browser.close();
console.log('Captured genuine Wayfind screens; no public messages were posted.');
