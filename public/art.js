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
function scene(ctx,zone,camera,w,h,alpha=1){
 ctx.save();ctx.globalAlpha=alpha;
 const [top,bottom]=themes[zone],gradient=ctx.createLinearGradient(0,0,0,h);gradient.addColorStop(0,top);gradient.addColorStop(1,bottom);ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
 if(zone<3){
  ellipse(ctx,w-140-camera.x*.015,100,40,40,'#f8e6b680');
  for(let layer=0;layer<2;layer++)for(let i=-1;i<18;i++){
   const width=80+layer*30, x=i*width-(camera.x*(.12+layer*.13)%width),height=70+(Math.abs(i*71+zone*83)%170);
   const y=h-height+layer*40;
   ctx.fillStyle=layer?'#1a364d44':'#29455e33';ctx.fillRect(x,y,width-7,height);
   if(zone===1)polygon(ctx,[[x,y],[x+width/2,y-65],[x+width-7,y]],'#4a496844');
   for(let yy=y+20;yy<h;yy+=28)for(let xx=x+10;xx<x+width-10;xx+=20){ctx.fillStyle='#e4e9d72a';ctx.fillRect(xx,yy,6,10);}
  }
 }else if(zone<6){
  for(let layer=0;layer<2;layer++)for(let i=-2;i<8;i++){
   const x=i*260-(camera.x*(.08+layer*.1)%260),peak=130+((i*i+layer*7)%4)*40;
   polygon(ctx,[[x,h],[x+160,peak+layer*170],[x+360,h]],layer?'#4b73885a':'#6f91a851');
   if(zone===4)polygon(ctx,[[x+115,peak+layer*170+80],[x+160,peak+layer*170],[x+207,peak+layer*170+82],[x+163,peak+layer*170+58]],'#effbff99');
  }
 }
 if(zone>=6){
  for(let i=0;i<80;i++){const x=((i*137-camera.x*.04)%w+w)%w,y=((i*83-camera.y*.03)%h+h)%h;ctx.fillStyle=i%3?'#e6eeff70':'#fff9cf';ctx.fillRect(x,y,i%3?2:3,2);}
  if(zone>=7){ellipse(ctx,w-180-camera.x*.006,140,67,67,'#5d9ac6');ellipse(ctx,w-194-camera.x*.006,130,34,49,'#89b7a5');ellipse(ctx,w-180-camera.x*.006,140,73,73,'#80b8e322');}
 }
 if(zone<7)for(let i=-1;i<7;i++){
  const x=i*220-(camera.x*.18%220),y=80+((i*i*29)%230);
  ellipse(ctx,x,y,48,12,'#fff8');ellipse(ctx,x+20,y-8,30,15,'#fff8');
 }
 if(zone===8){polygon(ctx,[[0,h],[w*.18,h-80],[w*.4,h-35],[w*.64,h-110],[w,h-40],[w,h]],'#9895a333');}
 ctx.restore();
}
export function drawBackground(ctx,platforms,zone,camera,w,h){
 scene(ctx,Math.max(0,zone-1),camera,w,h);
 const first=platforms.find(q=>q.zone===zone&&!q.tutorial);
 const blend=zone===0?1:Math.max(0,Math.min(1,(first.y-(camera.y+h*.62)+180)/360));
 scene(ctx,zone,camera,w,h,blend);
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
 ctx.fillStyle=q.checkpoint?'#74edbe':q.moving?'#d2b7ff':light;ctx.fillRect(x,y,w,4);
 if(q.checkpoint){ctx.fillStyle='#d8e9df';ctx.fillRect(x+w-18,y-37,2,37);polygon(ctx,[[x+w-16,y-37],[x+w+6,y-30],[x+w-16,y-24]],'#74edbe');}
 ctx.font='bold 10px system-ui';ctx.fillStyle='#f8e1a3';
 if(q.double)ctx.fillText('↑↑',x+w/2-7,y-12);
 if(q.moving){ctx.fillStyle='#e0ceff';ctx.fillText('↔',x+w/2-7,y-12);}
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
 const maxX=18000,scaleX=bw/maxX,scaleY=bh/(200-minY);
 const px=x=>bx+x*scaleX, py=y=>by+(y-minY)*scaleY;
 ctx.fillStyle='#0a1725d9';ctx.fillRect(bx-8,by-8,bw+16,bh+30);
 ctx.strokeStyle='#a0c2ce55';ctx.lineWidth=1;ctx.beginPath();platforms.forEach((q,i)=>i?ctx.lineTo(px(q.x),py(q.y)):ctx.moveTo(px(q.x),py(q.y)));ctx.stroke();
 for(const q of platforms.filter(q=>q.checkpoint)){ctx.fillStyle='#76e8be';ctx.fillRect(px(q.x)-2,py(q.y)-2,4,4);}
 ctx.strokeStyle='#a0d2e8';ctx.strokeRect(px(camera.x),py(camera.y),w*scaleX,h*scaleY);
 ellipse(ctx,px(p.x),py(p.y),3,3,'#ffb47e');ctx.fillStyle='#cbdae8';ctx.font='9px system-ui';ctx.fillText('ONE WORLD · '+Math.round(p.best/(-minY)*100)+'% HEIGHT',bx,by+bh+14);
}
