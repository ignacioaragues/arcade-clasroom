export const TILE = 32;
export const PHYSICS = {speed:220, acceleration:1800, gravity:1300, jump:470, coyote:.1, buffer:.1, terminal:900};
export const WORLD = {width:64000, killY:560};
export const STEPS_PER_ZONE = 40;
export const ZONES = ['City Streets','Cathedral Heights','Skyscraper Zone','Mountain Ascent','Frozen Peaks','Open Sky','Stratosphere','Outer Space','Moon Madness'];

export function map() {
 const route = [{x:0, baseX:0, y:0, w:1440, checkpoint:true, zone:0, tutorial:true, safeFloor:true, kind:0}];
 // Training objects sit over the starting floor: falling here is safe.
 const training = [[360,-40,96],[480,-100,80],[620,-224,64],[770,-270,32],[920,-322,80],[1060,-370,160]];
 for (const [i,[x,y,w]] of training.entries()) route.push({x,baseX:x,y,w,zone:0,tutorial:true,double:i===2,moving:i===4,phase:0,checkpoint:i===5,kind:i%4});
 let x=1140, y=-370;
 // Each motif has a different rhythm; the course never folds back on itself.
 const motifs=[
  {name:'Roof terraces',steps:[[144,28],[176,20],[152,36],[168,24],[132,56],[180,20],[140,48],[152,32]]},
  {name:'Chimney run',steps:[[112,64],[104,56],[124,72],[108,48],[148,122],[112,48],[128,64],[156,28]]},
  {name:'Balcony climb',steps:[[96,72],[104,64],[128,124],[112,56],[96,76],[136,120],[112,48],[160,28]]},
  {name:'Long crossing',steps:[[184,16],[192,12],[160,32],[172,24],[176,116],[188,16],[168,28],[176,20]]},
  {name:'Moving rhythm',steps:[[144,36],[152,32],[128,64],[144,40],[148,120],[136,48],[156,28],[168,24]]}
 ];
 for(let zone=0;zone<ZONES.length;zone++) {
  for(let n=0;n<STEPS_PER_ZONE;n++) {
   const motif=motifs[Math.floor(n/8)],k=n%8;
   const [distance,rise]=motif.steps[k];
   const double=rise>85,rest=k===7,checkpoint=n===STEPS_PER_ZONE-1;
   x+=distance;y-=rise;
   const w=checkpoint?192:rest?128:zone<2?[80,64,80,48][k%4]:[32,64,32,48][k%4];
   route.push({x:x-w/2,baseX:x-w/2,y,w,zone,checkpoint,double,pattern:motif.name,
    moving:!rest&&!double&&motif.name==='Moving rhythm'&&k%3===1,phase:n*.7+zone,kind:(Math.floor(n/8)+k)%4,rest});
  }
 }

 return route;
}
export function expertRoutes(route){
 // Optional precision detours above three of the long, low main-route crossings.
 return [3,5,7].map(zone=>{
  const run=route.filter(q=>!q.tutorial&&q.zone===zone),from=run[24],to=run[28];
  const supports=[65,125,155,175].map((rise,i)=>({
   x:from.x+from.w/2+140*(i+1)-5,baseX:from.x+from.w/2+140*(i+1)-5,
   y:from.y-rise,w:10,zone,kind:i%4,expert:true
  }));
  return {from,to,supports};
 });
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
