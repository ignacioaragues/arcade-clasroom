import {WORLD} from './physics.js';
import {backgroundState,sceneryCells} from './scenery.js';
// Original procedural art. Collision surfaces are the flat, visible top edges.
const themes = [
 ['#5199b4','#bde2d9','#db9473','#795346'],
 ['#5b698e','#c0b6cd','#b5a6c0','#615976'],
 ['#387eab','#b2d2df','#67bed2','#35597b'],
 ['#547d80','#c9d9bc','#a6ad81','#656e57'],
 ['#7aabc7','#e4f3f0','#dcf9fc','#6cadd0'],
 ['#468ecb','#cee7f1','#f5f3e6','#93c8df'],
 ['#24395c','#637aa3','#d9b478','#596c83'],
 ['#0d1531','#2d4162','#afb9cc','#52627f'],
 ['#292a4b','#625c7d','#d9d5c9','#8b8997']
];
function polygon(ctx,points,color) {ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
function ellipse(ctx,x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
function scene(ctx,zone,camera,w,h){
 const [top,bottom]=themes[zone],gradient=ctx.createLinearGradient(0,0,0,h);
 gradient.addColorStop(0,top);gradient.addColorStop(1,bottom);ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
 if(zone<7){
  ellipse(ctx,w*.74,100,38,38,zone<3?'#fff0bc':'#eff9ff');
  // Absolute world IDs keep each mountain/cloud/building stable as the camera crosses a tile.
  for(const layer of [0,1])for(const c of sceneryCells(camera.x,.035+layer*.035,340,w)){
   const peak=170+hash(c.id+31)*120,base=h-45+layer*60;
   polygon(ctx,[[c.x-40,base],[c.x+180,peak],[c.x+390,base]],layer?'#6d939a66':'#75a3aa55');
   if(zone>=3&&zone<=4)polygon(ctx,[[c.x+135,peak+65],[c.x+180,peak],[c.x+226,peak+67],[c.x+183,peak+44]],'#f1f9f4bb');
  }
  for(const c of sceneryCells(camera.x,.105,230,w)){
   const y=65+hash(c.id+7)*145;ellipse(ctx,c.x,y,43,11,'#fff8');ellipse(ctx,c.x+20,y-9,28,16,'#fff8');
  }
 }
 if(zone<3){
  // Distant coastal city: water, stone skyline and a closer layer of lived-in buildings.
  ctx.fillStyle='#499fae44';ctx.fillRect(0,h*.72,w,h*.28);
  for(const c of sceneryCells(camera.x,.13,86,w))building(ctx,c.x,h*.80,77,65+hash(c.id)*120,zone,c.id,true);
  for(const c of sceneryCells(camera.x,.25,136,w))building(ctx,c.x,h+35,124,140+hash(c.id+9)*170,zone,c.id,false);
 }else if(zone===3||zone===4){
  for(const c of sceneryCells(camera.x,.19,240,w)){
   const peak=250+hash(c.id)*140;
   polygon(ctx,[[c.x-30,h],[c.x+110,peak],[c.x+285,h]],zone===4?'#7ca4bc':'#69866d');
   if(zone===4)polygon(ctx,[[c.x+70,peak+70],[c.x+110,peak],[c.x+151,peak+72],[c.x+110,peak+50]],'#edfaff');
   else for(let n=0;n<3;n++)pine(ctx,c.x+30+n*42,h-10-n*8,45+n*8);
  }
 }else if(zone===5){
  for(const c of sceneryCells(camera.x,.14,400,w)){
   const y=h*.68+hash(c.id)*100;ellipse(ctx,c.x,y,100,23,'#e0f4f1');ellipse(ctx,c.x+42,y-15,65,28,'#f6fcf4');
   ellipse(ctx,c.x+160,150,44,16,'#ebc494');ctx.fillStyle='#765c55';ctx.fillRect(c.x+145,172,26,9);
  }
 }
 if(zone>=6){
  for(const c of sceneryCells(camera.x,.035,180,w))for(let n=0;n<7;n++){
   const x=c.x+hash(c.id*11+n)*180,y=hash(c.id*19+n+27)*h;
   ctx.fillStyle=n%3?'#c9daee':'#fff2c7';ctx.fillRect(x,y,n%3?1:2,2);
  }
  if(zone===6)for(const c of sceneryCells(camera.x,.11,420,w)){
   const y=170+hash(c.id)*180;ellipse(ctx,c.x,y,24,32,'#b6bdc5');ctx.strokeStyle='#d2c7b0';ctx.beginPath();ctx.moveTo(c.x-12,y+22);ctx.lineTo(c.x,y+58);ctx.lineTo(c.x+12,y+22);ctx.stroke();ctx.fillStyle='#98866c';ctx.fillRect(c.x-6,y+56,12,10);
  }
  if(zone>=7){ellipse(ctx,w*.73,160,70,70,'#66a6cb');ellipse(ctx,w*.71,146,30,45,'#94b9a1');ellipse(ctx,w*.73,160,76,76,'#8bc4dc22');}
  if(zone===8)for(const c of sceneryCells(camera.x,.16,280,w)){
   polygon(ctx,[[c.x-20,h],[c.x+80,h-90],[c.x+160,h-55],[c.x+300,h]],'#8b879e');ellipse(ctx,c.x+90,h-26,36,10,'#66647e');
  }
 }
}
function hash(n){const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);}
function pine(ctx,x,y,height){ctx.fillStyle='#586d57';ctx.fillRect(x-3,y-height,6,height);polygon(ctx,[[x,y-height-20],[x-20,y-12],[x+20,y-12]],'#42675f');}
function building(ctx,x,base,w,height,zone,id,far){
 const y=base-height;
 ctx.fillStyle=far?'#a4c7c2':zone===0?'#d29d7d':zone===1?'#a99caa':'#5791aa';ctx.fillRect(x,y,w,height);
 ctx.fillStyle=far?'#7eabaa':zone===0?'#ae7764':'#68778e';ctx.fillRect(x-3,y-5,w+6,6);
 if(zone===1||id%5===0){polygon(ctx,[[x-4,y-5],[x+w/2,y-40],[x+w+4,y-5]],far?'#79a8a6':'#9d776d');}
 for(let yy=y+16;yy<base-12;yy+=29)for(let xx=x+12;xx<x+w-12;xx+=24){
  ctx.fillStyle=far?'#cee0cd':'#396d72';ctx.fillRect(xx,yy,10,16);ctx.fillStyle=far?'#bed6c8':'#f1d3a0';ctx.fillRect(xx-2,yy+16,14,3);
  if(!far){ctx.fillStyle='#85a093';ctx.fillRect(xx-4,yy+1,3,14);ctx.fillRect(xx+11,yy+1,3,14);}
 }
 if(!far&&zone===0){
  ctx.fillStyle='#bb756a';ctx.fillRect(x+5,y+height*.55,w-10,14);
  for(let i=5;i<w-5;i+=18){ctx.fillStyle='#f4d9b1';ctx.fillRect(x+i,y+height*.55,8,14);}
  if(id%3===0){ctx.fillStyle='#b38d71';ctx.fillRect(x+w*.6,y-25,12,20);ctx.fillStyle='#f4dcb5';ctx.fillRect(x+w*.6-3,y-28,18,4);}
 }
}
let blendCanvas=null;
export function drawBackground(ctx,platforms,zone,camera,w,h){
 const state=backgroundState(platforms,camera.x+w*.4);
 scene(ctx,state.from,camera,w,h);
 if(state.mix>0){
  if(!blendCanvas){blendCanvas=document.createElement('canvas');}
  if(blendCanvas.width!==w||blendCanvas.height!==h){blendCanvas.width=w;blendCanvas.height=h;}
  scene(blendCanvas.getContext('2d'),state.to,camera,w,h);
  // Composite complete opaque scenes, not every individual translucent primitive.
  ctx.save();ctx.globalAlpha=state.mix;ctx.drawImage(blendCanvas,0,0);ctx.restore();
 }
}
export function drawPlatform(ctx,q){
 const [,,light,dark]=themes[q.zone],{x,y,w}=q;
 const kind=q.kind||0;
 ctx.fillStyle=dark;
 if(q.tutorial&&q.y===0){
  ctx.fillStyle='#394853';ctx.fillRect(x,y,w,70);ctx.fillStyle='#b6b6a1';ctx.fillRect(x,y,w,9);
  ctx.fillStyle='#6ae3bd';ctx.fillRect(x+w-12,y-64,12,64);ctx.fillStyle='#234f50';ctx.fillRect(x+w-8,y-58,4,55);ctx.fillStyle='#e5f1e8';ctx.font='10px system-ui';ctx.fillText('PRACTICE BOUNDARY · CLIMB ABOVE',x+w-240,y-80);
  for(let i=x+20;i<x+w;i+=70){ctx.fillStyle='#f0d088';ctx.fillRect(i,y+36,35,4);}return;
 }
 switch(q.zone){
 case 0: // Brick, awnings, crates, and rooftop water tanks.
  if(kind===1){polygon(ctx,[[x,y],[x+w,y],[x+w+8,y+20],[x-8,y+20]],'#d27469');for(let i=0;i<w;i+=20){ctx.fillStyle='#f5d7ad';ctx.fillRect(x+i,y,9,20);}ctx.fillStyle=dark;ctx.fillRect(x+5,y+20,5,23);ctx.fillRect(x+w-10,y+20,5,23);}
  else{ctx.fillRect(x,y,w,kind===2?48:28);ctx.strokeStyle='#e4b39066';for(let j=10;j<35;j+=12){ctx.beginPath();ctx.moveTo(x,y+j);ctx.lineTo(x+w,y+j);ctx.stroke();}for(let i=12;i<w;i+=24){ctx.fillStyle='#e4b39066';ctx.fillRect(x+i,y+2,2,24);}if(kind===3){ctx.fillStyle='#526371';ctx.fillRect(x+w*.25,y+6,w*.5,35);}}
  if(kind!==1&&w>=48){ctx.fillStyle='#f0d9b0';ctx.fillRect(x+6,y+9,Math.min(16,w-12),18);ctx.fillStyle='#397877';ctx.fillRect(x+9,y+12,Math.min(10,w-18),12);ctx.fillStyle='#719d73';ctx.fillRect(x+2,y+28,25,5);}
  if(kind===3&&w>=48){ctx.fillStyle='#566773';ctx.fillRect(x+w/2-14,y+9,28,34);ellipse(ctx,x+w/2,y+12,14,6,'#88918a');ctx.fillStyle='#c2b58d';ctx.fillRect(x+w/2-11,y+44,3,10);ctx.fillRect(x+w/2+8,y+44,3,10);}
  break;
 case 1: // Gothic corbels, arches and suspended bells.
  ctx.fillRect(x,y,w,12);polygon(ctx,[[x+4,y+12],[x+w-4,y+12],[x+w*.65,y+45],[x+w*.35,y+45]],dark);
  ctx.strokeStyle='#d9c9df';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x+w/2,y+30,Math.min(w/3,17),Math.PI,0);ctx.stroke();
  if(kind===2){ctx.fillStyle='#d7b276';ctx.fillRect(x+w/2-8,y+18,16,12);ctx.fillRect(x+w/2-12,y+30,24,4);}break;
 case 2: // Steel beams and glass facades.
  ctx.fillRect(x,y,w,10);ctx.fillStyle='#386b8b';ctx.fillRect(x+3,y+10,w-6,35);
  if(kind%2){ctx.strokeStyle=light;ctx.beginPath();ctx.moveTo(x,y+32);ctx.lineTo(x+w,y+10);ctx.moveTo(x,y+10);ctx.lineTo(x+w,y+32);ctx.stroke();}
  else for(let i=8;i<w;i+=18){ctx.fillStyle='#a9d8df99';ctx.fillRect(x+i,y+14,10,15);}break;
 case 3: // Irregular rock outcrops / rope bridges.
  if(kind===1){ctx.fillRect(x,y,w,8);for(let i=0;i<w;i+=12){ctx.fillStyle='#beaa7a';ctx.fillRect(x+i,y,9,12);}ctx.strokeStyle='#cdbb8d';ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+w/2,y+35,x+w,y);ctx.stroke();}
  else polygon(ctx,[[x,y],[x+w,y],[x+w-3,y+15],[x+w*.7,y+37],[x+w*.3,y+44],[x+6,y+20]],dark);break;
 case 4: // Snow shelves with icicles.
  polygon(ctx,[[x,y],[x+w,y],[x+w-6,y+20],[x+w*.7,y+42],[x+w*.5,y+17],[x+w*.25,y+32],[x,y+16]],dark);
  ctx.fillStyle='#e9fcff';ctx.fillRect(x-2,y,w+4,7);for(let i=7;i<w;i+=18)polygon(ctx,[[x+i,y+12],[x+i+8,y+12],[x+i+3,y+28]],'#b9e6f1');break;
 case 5: // Clouds and airships.
  if(kind%2){polygon(ctx,[[x,y],[x+w,y],[x+w-9,y+20],[x+12,y+20]],'#af8871');ctx.fillStyle='#f7ddaa';ctx.fillRect(x+w/2-7,y+4,14,10);ellipse(ctx,x+w/2,y+29,w*.48,12,'#e5b779');}
  else{ellipse(ctx,x+w/2,y+12,w/2+5,14,'#e5f3f8');ellipse(ctx,x+w*.27,y+7,w*.23,10,'#fff');ellipse(ctx,x+w*.65,y+6,w*.25,11,'#fff');}break;
 case 6: // Weather instruments, balloons and copper gondolas.
  ctx.fillRect(x,y,w,12);ctx.strokeStyle='#e8c78e';ctx.beginPath();ctx.moveTo(x+6,y+10);ctx.lineTo(x+w/2,y+55);ctx.lineTo(x+w-6,y+10);ctx.stroke();ellipse(ctx,x+w/2,y+32,14,20,'#d9c299');break;
 case 7: // Space station trusses and solar panels.
  ctx.fillRect(x,y,w,12);ctx.fillStyle='#456391';ctx.fillRect(x-8,y+16,w+16,19);ctx.strokeStyle='#8ab3d4';for(let i=-8;i<w+8;i+=12){ctx.strokeRect(x+i,y+16,12,19);}ctx.fillStyle='#a2aeba';ctx.fillRect(x+w/2-4,y+12,8,29);break;
 case 8: // Crater rock and lunar modules.
  if(kind%2){polygon(ctx,[[x,y],[x+w,y],[x+w-4,y+24],[x+6,y+29]],dark);ellipse(ctx,x+w*.35,y+16,8,4,'#4d4c67');ellipse(ctx,x+w*.72,y+10,5,3,'#64617b');}
  else{ctx.fillStyle='#b9bcc1';ctx.fillRect(x,y,w,23);ctx.fillStyle='#5f7d9e';ctx.fillRect(x+7,y+8,Math.max(6,w-14),8);ctx.fillStyle='#b0a883';ctx.fillRect(x+3,y+23,4,17);ctx.fillRect(x+w-7,y+23,4,17);}break;
 }
 // Readable, exact collision edge across every prop silhouette.
 ctx.fillStyle=q.expert?'#ffd28b':q.checkpoint?'#74edbe':q.moving?'#d2b7ff':light;ctx.fillRect(x,y,w,4);
 if(q.checkpoint){ctx.fillStyle='#d8e9df';ctx.fillRect(x+w-18,y-37,2,37);polygon(ctx,[[x+w-16,y-37],[x+w+6,y-30],[x+w-16,y-24]],'#74edbe');}
 ctx.font='bold 10px system-ui';ctx.fillStyle='#f8e1a3';
 if(q.expert){ctx.fillStyle='#ffcf86';ctx.fillText('◆',x,y-10);}
 if(q.double)ctx.fillText('↑↑',x+w/2-7,y-12);
 if(q.moving){ctx.fillStyle='#e0ceff';ctx.fillText('↔',x+w/2-7,y-12);}
 if(q.expert&&q.kind===0){ctx.fillStyle='#ffcf86';ctx.fillText('EXPERT · PRECISION',x-30,y-30);}
 if(q.checkpoint){ctx.fillStyle='#c4ffdc';ctx.fillText('CHECKPOINT',x,y-10);}
}
export function drawTutorial(ctx){
 const signs=[{x:80,y:-100,w:190,title:'01 · FIND YOUR FEET',text:'A / D or ← → to move'},
 {x:325,y:-170,w:180,title:'02 · JUMP',text:'Space · land on the ledge'},
 {x:565,y:-345,w:190,title:'03 · DOUBLE JUMP',text:'Space again while in the air'},
 {x:845,y:-420,w:180,title:'04 · TIME YOUR LANDING',text:'↔ moving · ↑↑ two jumps'}];
 for(const s of signs){ctx.fillStyle='#172b42e8';ctx.fillRect(s.x,s.y,s.w,54);ctx.fillStyle='#68e8c5';ctx.fillRect(s.x,s.y,3,54);ctx.font='bold 10px system-ui';ctx.fillText(s.title,s.x+12,s.y+19);ctx.fillStyle='#e2edf5';ctx.font='11px system-ui';ctx.fillText(s.text,s.x+12,s.y+38);}
 ctx.fillStyle='#e8f3eb';ctx.font='bold 13px system-ui';ctx.fillText('SAFE PRACTICE FLOOR  →  THE CONTINUOUS CLIMB',80,-15);
}
export function drawOverview(ctx,platforms,p,camera,w,h){
 const bx=w-220,by=18,bw=202,bh=90, minY=platforms.at(-1).y-200;
 const maxX=WORLD.width,scaleX=bw/maxX,scaleY=bh/(200-minY);
 const px=x=>bx+x*scaleX, py=y=>by+(y-minY)*scaleY;
 ctx.fillStyle='#0a1725d9';ctx.fillRect(bx-8,by-8,bw+16,bh+30);
 ctx.strokeStyle='#a0c2ce55';ctx.lineWidth=1;ctx.beginPath();platforms.forEach((q,i)=>i?ctx.lineTo(px(q.x),py(q.y)):ctx.moveTo(px(q.x),py(q.y)));ctx.stroke();
 for(const q of platforms.filter(q=>q.checkpoint)){ctx.fillStyle='#76e8be';ctx.fillRect(px(q.x)-2,py(q.y)-2,4,4);}
 ctx.strokeStyle='#a0d2e8';ctx.strokeRect(px(camera.x),py(camera.y),w*scaleX,h*scaleY);
 ellipse(ctx,px(p.x),py(p.y),3,3,'#ffb47e');ctx.fillStyle='#cbdae8';ctx.font='9px system-ui';ctx.fillText('ONE WORLD · '+Math.round(p.best/(-minY)*100)+'% HEIGHT',bx,by+bh+14);
}
