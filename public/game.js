import {map,player,step,ZONES,movePlatforms,zoneAt,zoneStart,WORLD,fellOut,respawn} from './physics.js';
import {drawBackground,drawPlatform,drawTutorial,drawOverview} from './art.js';
const $=id=>document.getElementById(id), canvas=$('game'),ctx=canvas.getContext('2d'),platforms=map();
const W=canvas.width,H=canvas.height;
let p=player(platforms[0]), camera={x:0,y:-400},last=performance.now(),jump=false,won=false,activeBox=null,item='',clock=0,falls=0;
const keys=new Set();
const items=['Banana Peel','Bomb','Spring Shoes','Shield','Wings','Grappling Hook','Jetpack','Super Jetpack'];
const questions=[{prompt:'What is 7 × 8?',options:['54','56','64'],answer:1},{prompt:'Which word is a noun?',options:['Mountain','Quickly','Jumping'],answer:0},{prompt:'Which planet is closest to the Sun?',options:['Earth','Venus','Mercury'],answer:2}];
const boxes=Array.from({length:18},(_,i)=>({zone:Math.floor(i/2),platform:null,ready:0}));
function relocate(b){
 const eligible=platforms.filter(q=>q.zone===b.zone&&q.w>=64&&!q.checkpoint&&!q.moving&&!q.tutorial&&!boxes.some(other=>other!==b&&other.platform===q));
 b.platform=eligible[Math.floor(Math.random()*eligible.length)];
}
boxes.forEach(relocate);
function message(s){$('message').textContent=s;}
function resetCamera(){camera={x:Math.max(0,Math.min(WORLD.width-W,p.x-W*.4)),y:p.y-H*.65};}
function clearInput(){keys.clear();jump=false;}
function restart(q=platforms[0]){
 p=player(q);resetCamera();won=false;item='';falls=0;
 if($('question').open)$('question').close();
 activeBox=null;clearInput();
}
ZONES.forEach((z,i)=>$('stage').add(new Option(`${i+1}. ${z}`,i)));
$('warp').onclick=()=>{const z=Number($('stage').value);restart(zoneStart(platforms,z));message('Test zone: '+ZONES[z]);canvas.focus();};
$('reset').onclick=()=>{restart();message('Practice on the ground, then follow the props into the climb.');canvas.focus();};
$('respawn').onclick=()=>{if(activeBox)return;boxes.forEach(b=>{relocate(b);b.ready=clock;});message('Boxes moved to safe, stationary ledges.');canvas.focus();};
function consumeBox(){
 if(activeBox){activeBox.ready=clock+20+Math.random()*15;relocate(activeBox);}
 activeBox=null;$('question').close();clearInput();
}
$('cancel').onclick=()=>{consumeBox();message('Question skipped. Box will return in 20–35 seconds.');};
$('question').addEventListener('cancel',e=>{e.preventDefault();$('cancel').click();});
function ask(b){
 activeBox=b;const q=questions[Math.floor(Math.random()*questions.length)];
 $('prompt').textContent=q.prompt;$('choices').replaceChildren();
 q.options.forEach((o,i)=>{
  const button=document.createElement('button');button.type='button';button.textContent=o;
  button.onclick=()=>{
   if(i===q.answer){item=items[Math.floor(Math.random()*items.length)];message('Correct! Demo reward: '+item+'. Item effects are not available in this teacher test.');}
   else message('Incorrect. No reward this time.');
   consumeBox();
  };
  $('choices').append(button);
 });
 clearInput();$('question').showModal();
}
window.addEventListener('keydown',e=>{
 if(['INPUT','SELECT','BUTTON'].includes(e.target.tagName)||$('question').open)return;
 if(['Space','ArrowLeft','ArrowRight','ArrowUp'].includes(e.code))e.preventDefault();
 keys.add(e.code);
 if((e.code==='Space'||e.code==='ArrowUp')&&!e.repeat)jump=true;
 if(e.code==='KeyE')message('Items are demo rewards only. Throwing and item effects are not implemented yet.');
});
window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',clearInput);
document.querySelectorAll('[data-key]').forEach(b=>{
 const key={left:'ArrowLeft',right:'ArrowRight',jump:'Space'}[b.dataset.key];
 b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(key);if(key==='Space')jump=true;});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>keys.delete(key));
});
function update(dt){
 if($('question').open||won)return;
 clock+=dt;movePlatforms(platforms,clock,p);
 step(p,{axis:(keys.has('ArrowRight')||keys.has('KeyD')?1:0)-(keys.has('ArrowLeft')||keys.has('KeyA')?1:0),jump},dt,platforms);jump=false;
 if(fellOut(p)){
  p=respawn(p);falls++;resetCamera();clearInput();
  message('You fell below the world. Back at your highest checkpoint; height record preserved.');
 }
 if($('boxes').checked&&p.grounded){
  for(const b of boxes){const q=b.platform;
   if(q&&clock>=b.ready&&Math.abs(p.y+p.h-q.y)<1&&p.x+p.w>q.x+q.w/2-12&&p.x<q.x+q.w/2+12){ask(b);break;}
  }
 }
 if(p.grounded&&p.y+p.h<=platforms.at(-1).y+.1){won=true;message('Summit reached! You completed the continuous nine-zone climb.');}
 camera.x+=(Math.max(0,Math.min(WORLD.width-W,p.x-W*.4))-camera.x)*Math.min(1,dt*6);
 camera.y+=(p.y-H*.65-camera.y)*Math.min(1,dt*7);
}
function drawPlayer(){
 const {x,y}=p;
 ctx.fillStyle='#0005';ctx.fillRect(x+3,y+28,22,4);
 ctx.fillStyle='#ed987f';ctx.fillRect(x,y+5,22,23);ctx.fillRect(x-3,y,8,10);ctx.fillRect(x+17,y,8,10);
 ctx.fillStyle='#ffe0ba';ctx.fillRect(x+3,y+12,16,10);ctx.fillStyle='#142638';ctx.fillRect(x+4,y+10,4,4);ctx.fillRect(x+15,y+10,4,4);
 if(item){ctx.fillStyle='#ffd766';ctx.fillRect(x+23,y+12,8,8);}
}
function draw(){
 const zone=zoneAt(platforms,p.y+p.h);
 drawBackground(ctx,platforms,zone,camera,W,H);
 ctx.save();ctx.translate(-camera.x,-camera.y);
 // Tall prop silhouettes are culled with a margin; all collision surfaces remain exact.
 const visible=platforms.filter(q=>q.y>camera.y-80&&q.y<camera.y+H+80&&q.x+q.w>camera.x-80&&q.x<camera.x+W+80);
 if($('guide').checked){
  ctx.strokeStyle='#c0e8e155';ctx.setLineDash([4,8]);ctx.beginPath();
  platforms.forEach((q,i)=>i?ctx.lineTo(q.x+q.w/2,q.y-5):ctx.moveTo(q.x+q.w/2,q.y-5));ctx.stroke();ctx.setLineDash([]);
 }
 visible.forEach(q=>drawPlatform(ctx,q));
 if(camera.x<1400&&camera.y>-1100)drawTutorial(ctx);
 if($('boxes').checked)boxes.forEach(b=>{
  if(clock<b.ready||b===activeBox||!b.platform)return;
  const q=b.platform,x=q.x+q.w/2-12,y=q.y-25;
  if(x<camera.x-30||x>camera.x+W+30||y<camera.y-30||y>camera.y+H+30)return;
  ctx.fillStyle='#f6bc59';ctx.fillRect(x,y,24,24);ctx.strokeStyle='#ffe3a0';ctx.strokeRect(x+3,y+3,18,18);
  ctx.fillStyle='#4b351d';ctx.font='bold 20px monospace';ctx.fillText('?',x+6,y+19);
 });
 const end=platforms.at(-1);ctx.fillStyle='#e3edfa';ctx.fillRect(end.x+90,end.y-65,3,65);ctx.fillStyle='#63e6c2';ctx.fillRect(end.x+93,end.y-65,30,20);
 drawPlayer();ctx.restore();
 if($('overview').checked)drawOverview(ctx,platforms,p,camera,W,H);
 $('zone').textContent=ZONES[zone];$('height').textContent=Math.floor(p.best/32)+' m · best';$('jumps').textContent=(2-p.jumps)+' jumps';
 $('item').textContent=item?item+' · demo only':'No item · effects not available';
 $('checkpoint').textContent='Checkpoint '+Math.floor(-p.checkpoint.y/32)+' m · '+falls+' full falls';
}
function frame(t){
 let dt=Math.min((t-last)/1000,.05);last=t;
 while(dt>0){const d=Math.min(dt,1/120);update(d);dt-=d;}
 draw();requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
