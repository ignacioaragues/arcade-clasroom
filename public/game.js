import {map,player,step,ZONES,movePlatforms,zoneAt} from './physics.js';
const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d'),platforms=map();
let p=player(platforms[0]),camera=-400,last=performance.now(),jump=false,won=false,activeBox=null,item='',clock=0;
const keys=new Set(),palette=['#173851','#292e54','#203b53','#334244','#294958','#305472','#252e53','#141c3b','#36354b'];
const items=['Banana Peel','Bomb','Spring Shoes','Shield','Wings','Grappling Hook','Jetpack','Super Jetpack'];
const questions=[{prompt:'What is 7 × 8?',options:['54','56','64'],answer:1},{prompt:'Which word is a noun?',options:['Mountain','Quickly','Jumping'],answer:0},{prompt:'Which planet is closest to the Sun?',options:['Earth','Venus','Mercury'],answer:2}];
const boxes=Array.from({length:9},(_,z)=>({zone:z,platform:null,ready:0}));
function relocate(b){const eligible=platforms.filter((q,i)=>q.zone===b.zone&&q.w>=64&&!q.checkpoint&&i>0);b.platform=eligible[Math.floor(Math.random()*eligible.length)];}
boxes.forEach(relocate);
function message(s){$('message').textContent=s;}
function restart(q=platforms[0]){p=player(q);p.checkpoint=q;camera=p.y-360;won=false;item='';if($('question').open)$('question').close();activeBox=null;keys.clear();jump=false;}
ZONES.forEach((z,i)=>$('stage').add(new Option(`${i+1}. ${z}`,i)));
$('warp').onclick=()=>{const z=Number($('stage').value);restart(platforms[z*12]);message('Test zone: '+ZONES[z]);canvas.focus();};
$('reset').onclick=()=>restart();$('respawn').onclick=()=>{if(activeBox)return;boxes.forEach(b=>{relocate(b);b.ready=clock;});message('Boxes moved to eligible safe ledges.');};
function consumeBox(){if(activeBox){activeBox.ready=clock+20+Math.random()*15;relocate(activeBox);}activeBox=null;$('question').close();keys.clear();jump=false;}
$('cancel').onclick=()=>{consumeBox();message('Question skipped. Box will return in 20–35 seconds.');};
$('question').addEventListener('cancel',e=>{e.preventDefault();$('cancel').click();});
function ask(b){activeBox=b;const q=questions[Math.floor(Math.random()*questions.length)];$('prompt').textContent=q.prompt;$('choices').replaceChildren();q.options.forEach((o,i)=>{const button=document.createElement('button');button.type='button';button.textContent=o;button.onclick=()=>{if(i===q.answer){item=items[Math.floor(Math.random()*items.length)];message('Correct! Demo reward: '+item+' (visual only in this physics test).');}else message('Incorrect. No reward this time.');consumeBox();};$('choices').append(button);});keys.clear();jump=false;$('question').showModal();}
window.addEventListener('keydown',e=>{if(['INPUT','SELECT','BUTTON'].includes(e.target.tagName)||$('question').open)return;if(['Space','ArrowLeft','ArrowRight','ArrowUp'].includes(e.code))e.preventDefault();keys.add(e.code);if((e.code==='Space'||e.code==='ArrowUp')&&!e.repeat)jump=true;if(e.code==='KeyR')restart(p.checkpoint);});
window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{keys.clear();jump=false;});
document.querySelectorAll('[data-key]').forEach(b=>{const key={left:'ArrowLeft',right:'ArrowRight',jump:'Space'}[b.dataset.key];b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(key);if(key==='Space')jump=true;});for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>keys.delete(key));});
function update(dt){if($('question').open||won)return;clock+=dt;movePlatforms(platforms,clock,p);step(p,{axis:(keys.has('ArrowRight')||keys.has('KeyD')?1:0)-(keys.has('ArrowLeft')||keys.has('KeyA')?1:0),jump},dt,platforms);jump=false;
 if(p.y>p.checkpoint.y+620){const best=p.best,q=p.checkpoint;restart(q);p.best=best;message('Back at your checkpoint. Your height record is saved.');}
 if($('boxes').checked&&p.grounded){for(const b of boxes){const q=b.platform;if(clock>=b.ready&&Math.abs(p.y+p.h-q.y)<1&&p.x+p.w>q.x+q.w/2-12&&p.x<q.x+q.w/2+12){ask(b);break;}}}
 if(p.grounded&&p.y+p.h<=platforms.at(-1).y+.1){won=true;message('Summit reached! You completed all nine zones. Restart to test again.');}
 camera+=(p.y-350-camera)*Math.min(1,dt*7);
}
function draw(){const zone=zoneAt(platforms,p.y+p.h);ctx.fillStyle=palette[zone];ctx.fillRect(0,0,640,600);
 for(let i=0;i<42;i++){const x=(i*137)%640,y=((i*97-camera*.15)%600+600)%600;ctx.fillStyle='#ffffff20';ctx.fillRect(x,y,3,3);}
 ctx.fillStyle='#ffffff09';ctx.font='bold 70px system-ui';ctx.fillText(String(zone+1).padStart(2,'0'),35,115);
 const visible=platforms.filter(q=>q.y-camera>-50&&q.y-camera<650);
 if($('guide').checked){ctx.strokeStyle='#8be8dd33';ctx.setLineDash([4,8]);ctx.beginPath();visible.forEach((q,i)=>i?ctx.lineTo(q.x+q.w/2,q.y-camera):ctx.moveTo(q.x+q.w/2,q.y-camera));ctx.stroke();ctx.setLineDash([]);}
 visible.forEach(q=>{const y=q.y-camera;ctx.fillStyle=q.checkpoint?'#69e6c3':q.moving?'#c8a1ef':q.double?'#f6bc59':'#8ca8bb';ctx.fillRect(q.x,y,q.w,12);ctx.fillStyle=q.checkpoint?'#2d8d83':'#3e5b74';ctx.fillRect(q.x,y+5,q.w,9);for(let x=q.x+32;x<q.x+q.w;x+=32){ctx.fillStyle='#122439';ctx.fillRect(x,y,1,14);}if(q.double){ctx.fillStyle='#f6bc59';ctx.font='10px system-ui';ctx.fillText('↑↑',q.x,q.y-camera-8);}if(q.moving){ctx.fillStyle='#d4b7f4';ctx.font='10px system-ui';ctx.fillText('↔',q.x,q.y-camera-8);}if(q.checkpoint){ctx.fillStyle='#b6f7dd';ctx.font='10px system-ui';ctx.fillText(q.y===0?'START':'CHECKPOINT',q.x,y-10);}});
 if($('boxes').checked)boxes.forEach(b=>{if(clock<b.ready||b===activeBox)return;const q=b.platform,x=q.x+q.w/2-12,y=q.y-camera-25;ctx.fillStyle='#f6bc59';ctx.fillRect(x,y,24,24);ctx.strokeStyle='#ffe3a0';ctx.strokeRect(x+3,y+3,18,18);ctx.fillStyle='#4b351d';ctx.font='bold 20px monospace';ctx.fillText('?',x+6,y+19);});
 const end=platforms.at(-1);ctx.fillStyle='#e3edfa';ctx.fillRect(end.x+90,end.y-camera-65,3,65);ctx.fillStyle='#63e6c2';ctx.fillRect(end.x+93,end.y-camera-65,30,20);
 const y=p.y-camera;ctx.fillStyle='#0005';ctx.fillRect(p.x+3,y+28,22,4);ctx.fillStyle='#ed987f';ctx.fillRect(p.x,y+5,22,23);ctx.fillRect(p.x-3,y,8,10);ctx.fillRect(p.x+17,y,8,10);ctx.fillStyle='#ffe0ba';ctx.fillRect(p.x+3,y+12,16,10);ctx.fillStyle='#142638';ctx.fillRect(p.x+4,y+10,4,4);ctx.fillRect(p.x+15,y+10,4,4);if(item){ctx.fillStyle='#ffd766';ctx.fillRect(p.x+23,y+12,8,8);}
 $('zone').textContent=ZONES[zone];$('height').textContent=Math.floor(p.best/32)+' m · best';$('jumps').textContent=(2-p.jumps)+' jumps';
}
function frame(t){let dt=Math.min((t-last)/1000,.05);last=t;while(dt>0){const d=Math.min(dt,1/120);update(d);dt-=d;}draw();requestAnimationFrame(frame);}requestAnimationFrame(frame);
