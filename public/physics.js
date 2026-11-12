export const TILE = 32;
export const PHYSICS = {speed:220, acceleration:1800, gravity:1300, jump:470, coyote:.1, buffer:.1, terminal:900};
export const WORLD = {width:18000, killY:560};
export const STEPS_PER_ZONE = 40;
export const ZONES = ['City Streets','Cathedral Heights','Skyscraper Zone','Mountain Ascent','Frozen Peaks','Open Sky','Stratosphere','Outer Space','Moon Madness'];

export function map() {
 const route = [{x:0, baseX:0, y:0, w:1440, checkpoint:true, zone:0, tutorial:true, safeFloor:true, kind:0}];
 // Training objects sit over the starting floor: falling here is safe.
 const training = [[360,-40,96],[480,-100,80],[620,-224,64],[770,-270,32],[920,-322,80],[1060,-370,160]];
 for (const [i,[x,y,w]] of training.entries()) route.push({x,baseX:x,y,w,zone:0,tutorial:true,double:i===2,moving:i===4,phase:0,checkpoint:i===5,kind:i%4});
 let x=1140, y=-370, heading=1;
 for (let zone=0;zone<ZONES.length;zone++) {
  for (let n=1;n<=STEPS_PER_ZONE;n++) {
   const rest=n%10===0, checkpoint=n===STEPS_PER_ZONE;
   const double=n%7===4 || (zone>=3 && n%7===0);
   const rise=double?116+zone*2:[36,64,48,72,56,28,76][n%7];
   const distance=double?138+zone*3:[104,120,144,100,136,112,156][n%7];
   // Broad traversals with short reversals, rather than a narrow vertical shaft.
   const localDirection=n%12>=9?-1:1;
   if(x+heading*localDirection*distance>WORLD.width-300 || x+heading*localDirection*distance<200) heading*=-1;
   x+=heading*localDirection*distance; y-=rise;
   const w=checkpoint?192:rest?128:zone<2?[96,64,80,32][n%4]:[32,64,32,48][n%4];
   route.push({x:x-w/2,baseX:x-w/2,y,w,zone,checkpoint,double,
    moving:!rest&&!double&&n%9===0, phase:n*.7+zone, kind:n%4, rest});
  }
 }
 return route;
}
export function zoneStart(platforms,zone) {
 return zone===0?platforms[0]:platforms.find(p=>p.checkpoint&&!p.tutorial&&p.zone===zone-1);
}
export function movePlatforms(platforms,time,p) {
 for(const q of platforms) {
  if(!q.moving) continue;
  const old=q.x; q.x=q.baseX+Math.sin(time*1.2+q.phase)*18;
  if(p?.grounded&&Math.abs(p.y+p.h-q.y)<.1&&p.x+p.w>old&&p.x<old+q.w) p.x+=q.x-old;
 }
}
export function zoneAt(platforms,y) {
 let zone=0;
 for(const q of platforms) if(y<=q.y) zone=q.checkpoint&&!q.tutorial?Math.min(8,q.zone+1):q.zone;
 return zone;
}
export function player(platform) {
 return {x:platform.x+8,y:platform.y-28,vx:0,vy:0,w:22,h:28,grounded:true,jumps:0,coyote:.1,buffer:0,best:0,checkpoint:platform};
}
export function fellOut(p) {return p.y>WORLD.killY;}
export function respawn(p) {
 const next=player(p.checkpoint); next.best=p.best; return next;
}
export function step(p,input,dt,platforms) {
 p.buffer=Math.max(0,p.buffer-dt);
 p.coyote=p.grounded?PHYSICS.coyote:Math.max(0,p.coyote-dt);
 if(input.jump) p.buffer=PHYSICS.buffer;
 const target=input.axis*PHYSICS.speed;
 p.vx+=Math.max(-PHYSICS.acceleration*dt,Math.min(PHYSICS.acceleration*dt,target-p.vx));
 if(p.buffer>0&&(p.coyote>0||p.jumps<2)) {
  p.jumps=p.coyote>0?1:Math.max(1,p.jumps)+1;
  p.vy=-PHYSICS.jump;p.grounded=false;p.coyote=0;p.buffer=0;
 }
 const oldBottom=p.y+p.h,oldX=p.x;
 p.vy=Math.min(PHYSICS.terminal,p.vy+PHYSICS.gravity*dt);
 p.x=Math.max(0,Math.min(WORLD.width-p.w,p.x+p.vx*dt));p.y+=p.vy*dt;p.grounded=false;
 // Visible practice railing: contain beginners at street level, not climbers above it.
 const floor=platforms.find(q=>q.safeFloor);
 if(floor){
  const railX=floor.x+floor.w-12,railTop=floor.y-64;
  if(oldX+p.w<=railX+.01&&p.x+p.w>railX&&p.y+p.h>railTop&&p.y<floor.y+70)p.x=railX-p.w;
  else if(oldX>=railX+12-.01&&p.x<railX+12&&p.y+p.h>railTop&&p.y<floor.y+70)p.x=railX+12;
  if(p.vy>=0&&oldBottom<=railTop&&p.y+p.h>=railTop&&p.x+p.w>railX&&p.x<railX+12){p.y=railTop-p.h;p.vy=0;p.grounded=true;p.jumps=0;}
 }
 if(p.vy>=0) {
  let landing=null;
  for(const q of platforms) {
   if(oldBottom<=q.y+.01&&p.y+p.h>=q.y&&p.x+p.w>q.x&&p.x<q.x+q.w&&(!landing||q.y<landing.y)) landing=q;
  }
  if(landing) {
   p.y=landing.y-p.h;p.vy=0;p.grounded=true;p.jumps=0;
   // Landing on an older checkpoint must never erase the highest one reached.
   if(landing.checkpoint&&landing.y<p.checkpoint.y) p.checkpoint=landing;
  }
 }
 p.best=Math.max(p.best,-p.y-p.h);
 return p;
}
