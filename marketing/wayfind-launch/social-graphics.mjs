// Goldie's own renderer and geometry, adapted to a feed canvas; no UI is invented.
import {mkdir,readFile,writeFile,readdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {loadConfig} from './node_modules/goldie/dist/config.js';
import {DEVICES} from './node_modules/goldie/dist/specs.js';
import {renderScreenshots} from './node_modules/goldie/dist/render.js';
const require=createRequire(path.resolve('node_modules/goldie/package.json'));
const {createCanvas,loadImage,GlobalFonts}=require('@napi-rs/canvas');
GlobalFonts.registerFromPath('composition/assets/dm-sans.ttf','DM Sans');
const raw='out/screenshots/pixel-10-pro/en-US';
const files=(await readdir(raw)).filter(n=>n.endsWith('.png'));
const originals=new Map(await Promise.all(files.map(async n=>[n,await readFile(path.join(raw,n))])));
const logo=await loadImage('composition/assets/logo.jpeg');
await mkdir('out/social/story',{recursive:true});await mkdir('out/social/feed',{recursive:true});
async function branded(bytes,height,dest){
  const canvas=createCanvas(1080,height),ctx=canvas.getContext('2d');
  ctx.fillStyle='#FAF7F2';ctx.fillRect(0,0,1080,height);ctx.drawImage(await loadImage(bytes),0,0);
  const top=height===1920?1780:1260;
  ctx.fillStyle='#FAF7F2';ctx.fillRect(0,top,1080,height-top);
  ctx.fillStyle='#E6D9C8';ctx.fillRect(60,top,960,1);
  ctx.drawImage(logo,60,top+25,48,48);ctx.fillStyle='#2C1A0E';ctx.font='700 34px "DM Sans"';ctx.fillText('Wayfind',126,top+61);
  ctx.textAlign='right';ctx.font='500 29px "DM Sans"';ctx.fillText('app.wayfind.workers.dev',1018,top+59);
  await writeFile(dest,canvas.toBuffer('image/png'));
}
for(const [name,bytes] of originals)await branded(bytes,1920,`out/social/story/${name}`);
const cfg=await loadConfig(path.resolve('goldie.config.mjs'));
cfg.theme.template='classic';cfg.theme.copyHeightRatio=.33;cfg.theme.deviceWidthRatio=.65;
DEVICES['pixel-10-pro'].screenshot={width:1080,height:1260};
await renderScreenshots(cfg,'pixel-10-pro','en-US');
for(const name of files){await branded(await readFile(path.join(raw,name)),1350,`out/social/feed/${name}`);await writeFile(path.join(raw,name),originals.get(name));}
console.log('Created six 1080×1920 Story graphics and six 1080×1350 feed graphics with Goldie.');
