import {test} from 'node:test';
import assert from 'node:assert/strict';
import {map,player,step,ZONES,PHYSICS,movePlatforms,zoneAt} from '../public/physics.js';
function attempt(index,secondJump=null,startTime=0){
 const route=map();movePlatforms(route,startTime);const from=route[index],to=route[index+1],p=player(from);p.x=from.x+from.w/2-p.w/2;
 for(let t=0;t<260;t++){
  movePlatforms(route,startTime+(t+1)/120,p);
  const delta=to.x+to.w/2-(p.x+p.w/2);
  step(p,{axis:Math.abs(delta)<2?0:Math.sign(delta),jump:t===0||t===secondJump},1/120,route);
  if(t>5&&p.grounded&&Math.abs(p.y+p.h-to.y)<.01)return true;
 }
 return false;
}
test('all 108 transitions reachable at four moving-platform phases',()=>{
 for(const phase of [0,1.3,2.7,4])for(let i=0;i<108;i++){
  const feasible=attempt(i,null,phase)||[24,30,36,42].some(t=>attempt(i,t,phase));
  assert.ok(feasible,`transition ${i} -> ${i+1}, phase ${phase}`);
 }
});
test('difficulty progresses: introduction needs one jump, later marked climbs require two',()=>{
 const route=map();for(let i=0;i<24;i++)assert.ok(attempt(i),`intro jump ${i}`);
 const climbs=route.flatMap((q,i)=>q.double?[i-1]:[]);assert.ok(climbs.length>=12);
 for(const i of climbs){assert.equal(attempt(i),false,`single jump must fail at ${i}`);assert.ok([24,30,36,42].some(t=>attempt(i,t)),`double jump ${i}`);}
 assert.ok(route.filter(q=>q.zone>=6&&q.w===32).length>route.filter(q=>q.zone<2&&q.w===32).length);
});
test('double jump works and third airborne jump is rejected',()=>{const route=map(),p=player(route[0]);step(p,{axis:0,jump:true},.01,route);step(p,{axis:0,jump:false},.15,route);step(p,{axis:0,jump:true},.01,route);assert.equal(p.jumps,2);const before=p.vy;step(p,{axis:0,jump:true},.01,route);assert.ok(p.vy>before);});
test('nine deterministic zones, checkpoints and moving supports',()=>{const route=map();assert.deepEqual(route,map());assert.equal(new Set(route.map(p=>p.zone)).size,ZONES.length);assert.equal(route.filter(p=>p.checkpoint).length,10);assert.ok(route.some(p=>p.moving));for(const q of route)assert.equal(zoneAt(route,q.y),q.zone);assert.equal(PHYSICS.coyote,.1);});
