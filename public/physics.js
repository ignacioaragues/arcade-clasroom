export const TILE=32;
export const PHYSICS={speed:220,acceleration:1800,gravity:1300,jump:470,coyote:.1,buffer:.1};
export const ZONES=['City Streets','Cathedral Heights','Skyscraper Zone','Mountain Ascent','Frozen Peaks','Open Sky','Stratosphere','Outer Space','Moon Madness'];
export function map(){
 const platforms=[{x:48,y:0,w:544,checkpoint:true,zone:0}];
 // Fixed route with increasingly narrow landings and deliberate double-jump climbs.
 let x=112,y=0;
 for(let i=1;i<=108;i++){
  const zone=Math.min(8,Math.floor((i-1)/12));
  const checkpoint=i%12===0;
  const double=zone>=3&&i%4===2;
  const rise=double?112+Math.min(zone,8)*2:60+Math.min(zone,4)*4;
  const distance=zone<2?64:88+Math.min(zone,8)*6;
  const direction=i%8<4?1:-1;
  x=Math.max(48,Math.min(528,x+direction*distance));y-=rise;
  const w=checkpoint?128:zone<2?96:zone<4?(i%3===0?TILE:64):(i%3===0?64:TILE);
  const moving=zone>=6&&!checkpoint&&!double&&i%4===0;
  platforms.push({x:checkpoint?Math.max(32,x-32):x,baseX:checkpoint?Math.max(32,x-32):x,y,w,checkpoint,zone,double,moving,phase:i*.7});
 }
 return platforms;
}
export function movePlatforms(platforms,time,p){
 for(const q of platforms){if(!q.moving)continue;const old=q.x;q.x=q.baseX+Math.sin(time*1.2+q.phase)*18;
  if(p?.grounded&&Math.abs(p.y+p.h-q.y)<.1&&p.x+p.w>old&&p.x<old+q.w)p.x+=q.x-old;
 }
}
export function zoneAt(platforms,y){
 let zone=0;
 for(const q of platforms){if(-y>=-q.y)zone=q.zone;}
 return zone;
}
export function player(p){return {x:p.x+8,y:p.y-28,vx:0,vy:0,w:22,h:28,grounded:true,jumps:0,coyote:.1,buffer:0,best:0,checkpoint:p};}
export function step(p,input,dt,platforms){
 p.buffer=Math.max(0,p.buffer-dt);p.coyote=p.grounded?PHYSICS.coyote:Math.max(0,p.coyote-dt);
 if(input.jump)p.buffer=PHYSICS.buffer;
 const target=input.axis*PHYSICS.speed;
 p.vx+=Math.max(-PHYSICS.acceleration*dt,Math.min(PHYSICS.acceleration*dt,target-p.vx));
 if(p.buffer>0&&(p.coyote>0||p.jumps<2)){
  p.jumps=p.coyote>0?1:Math.max(1,p.jumps)+1;p.vy=-PHYSICS.jump;p.grounded=false;p.coyote=0;p.buffer=0;
 }
 const oldBottom=p.y+p.h;
 p.vy+=PHYSICS.gravity*dt;p.x=Math.max(0,Math.min(640-p.w,p.x+p.vx*dt));p.y+=p.vy*dt;p.grounded=false;
 if(p.vy>=0){
  for(const q of platforms){if(oldBottom<=q.y+.01&&p.y+p.h>=q.y&&p.x+p.w>q.x&&p.x<q.x+q.w){p.y=q.y-p.h;p.vy=0;p.grounded=true;p.jumps=0;if(q.checkpoint)p.checkpoint=q;break;}}
 }
 p.best=Math.max(p.best,-p.y-p.h);
 return p;
}
