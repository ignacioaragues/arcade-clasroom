import {test} from 'node:test';
import assert from 'node:assert/strict';
import {map,player,step,ZONES,PHYSICS,movePlatforms,zoneAt,zoneStart,fellOut,respawn,WORLD,STEPS_PER_ZONE} from '../public/physics.js';
function attempt(index,secondJump=null,startTime=0){
 const route=map();movePlatforms(route,startTime);const from=route[index],to=route[index+1],p=player(from);p.x=index===0?to.x+to.w/2-80:from.x+from.w/2-p.w/2;
 for(let t=0;t<260;t++){
  movePlatforms(route,startTime+(t+1)/120,p);
  const delta=to.x+to.w/2-(p.x+p.w/2);
  step(p,{axis:Math.abs(delta)<2?0:Math.sign(delta),jump:t===0||t===secondJump},1/120,route);
  if(t>5&&p.grounded&&Math.abs(p.y+p.h-to.y)<.01)return true;
 }
 return false;
}
test('every training and route transition is reachable at four moving-platform phases',()=>{
 for(const phase of [0,1.3,2.7,4])for(let i=0;i<map().length-1;i++){
  const feasible=attempt(i,null,phase)||[20,28,36,42,46].some(t=>attempt(i,t,phase));
  assert.ok(feasible,`transition ${i} -> ${i+1}, phase ${phase}`);
 }
});
test('difficulty progresses: introduction needs one jump, later marked climbs require two',()=>{
 const route=map();for(let i=0;i<2;i++)assert.ok(attempt(i),`intro jump ${i}`);
 const climbs=route.flatMap((q,i)=>q.double?[i-1]:[]);assert.ok(climbs.length>=12);
 for(const i of climbs){assert.equal(attempt(i),false,`single jump must fail at ${i}`);assert.ok([20,28,36,42,46].some(t=>attempt(i,t)),`double jump ${i}`);}
 assert.ok(route.filter(q=>q.zone>=6&&q.w===32).length>route.filter(q=>q.zone<2&&q.w===32).length);
});
test('double jump works and third airborne jump is rejected',()=>{const route=map(),p=player(route[0]);step(p,{axis:0,jump:true},.01,route);step(p,{axis:0,jump:false},.15,route);step(p,{axis:0,jump:true},.01,route);assert.equal(p.jumps,2);const before=p.vy;step(p,{axis:0,jump:true},.01,route);assert.ok(p.vy>before);});
test('nine deterministic zones, checkpoints and moving supports',()=>{const route=map();assert.deepEqual(route,map());assert.equal(new Set(route.map(p=>p.zone)).size,ZONES.length);assert.equal(route.filter(p=>p.checkpoint).length,11);assert.ok(route.some(p=>p.moving));for(const q of route)assert.equal(zoneAt(route,q.y),q.checkpoint&&!q.tutorial?Math.min(8,q.zone+1):q.zone);assert.equal(PHYSICS.coyote,.1);});

test('broad world, extended areas and safe ground tutorial',()=>{
 const route=map();assert.ok(Math.max(...route.map(q=>q.x))-Math.min(...route.map(q=>q.x))>10000);
 for(let z=0;z<9;z++)assert.equal(route.filter(q=>q.zone===z&&!q.tutorial).length,STEPS_PER_ZONE);
 assert.ok(route.filter(q=>q.tutorial).length>=7);assert.equal(zoneStart(route,8).zone,7);
});
test('falling far below checkpoint does not teleport and can land on lower platforms',()=>{
 const route=map(),cp=zoneStart(route,8),p=player(cp);p.y=cp.y+1500;p.grounded=false;
 assert.equal(fellOut(p),false);step(p,{axis:0,jump:false},1/120,route);assert.ok(p.y>cp.y+1400);
 const low=route.find(q=>q.checkpoint&&q.zone===2),drop=player(low);drop.checkpoint=cp;drop.y-=100;drop.grounded=false;
 for(let i=0;i<120;i++)step(drop,{axis:0,jump:false},1/120,route);
 assert.equal(drop.y+drop.h,low.y);assert.equal(drop.checkpoint,cp);
});
test('only crossing the absolute map bottom triggers respawn, preserving record and checkpoint',()=>{
 const route=map(),p=player(zoneStart(route,5));p.best=12000;p.y=WORLD.killY+1;
 assert.equal(fellOut(p),true);const next=respawn(p);assert.equal(next.checkpoint,p.checkpoint);assert.equal(next.y,p.checkpoint.y-28);assert.equal(next.best,12000);
});

test('practice floor has no left gap and right railing contains street-level movement',()=>{
 const route=map(),floor=route[0],p=player(floor);assert.equal(floor.x,0);
 for(let i=0;i<180;i++)step(p,{axis:-1,jump:false},1/120,route);
 assert.equal(p.x,0);assert.equal(p.y+p.h,0);
 p.x=floor.w-80;
 for(let i=0;i<180;i++)step(p,{axis:1,jump:false},1/120,route);
 assert.ok(p.x+p.w<=floor.w-12);assert.equal(p.y+p.h,0);assert.equal(fellOut(p),false);
 p.x=floor.w-30;p.y=-200;p.grounded=false;p.vy=-100;
 for(let i=0;i<25;i++)step(p,{axis:1,jump:false},1/120,route);
 assert.ok(p.x>floor.w,'climbers can leave above the railing');
});
