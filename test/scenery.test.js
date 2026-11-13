import {test} from 'node:test';
import assert from 'node:assert/strict';
import {map,expertRoutes,player,step,movePlatforms,WORLD} from '../public/physics.js';
import {backgroundState,sceneryCells} from '../public/scenery.js';
test('course advances right overall with local switchbacks, long roofs and five motifs per zone',()=>{
 const route=map().filter(q=>!q.safeFloor);
 assert.ok(route.filter((q,i)=>i&&q.baseX<route[i-1].baseX).length>=50);
 assert.ok(route.filter(q=>q.w>=240).length>=50);
 assert.ok(route.some((q,i)=>i&&q.y===route[i-1].y&&q.w>=240));
 for(let z=0;z<9;z++){
  const area=route.filter(q=>q.zone===z&&!q.tutorial);
  assert.equal(new Set(area.map(q=>q.pattern)).size,5);
  assert.ok(area.at(-1).x>area[0].x+2500);
 }
 assert.ok(route.at(-1).x<WORLD.width-500);
});
test('scenery retains world identity and subpixel motion across former modulo seams',()=>{
 for(const speed of [.035,.07,.105,.13,.25]){
  const a=sceneryCells(340/speed-.01,speed,340,960),b=sceneryCells(340/speed+.01,speed,340,960);
  for(const cell of a){const next=b.find(c=>c.id===cell.id);if(next)assert.ok(Math.abs(next.x-cell.x+.02*speed)<1e-8);}
 }
});
test('background transitions are continuous, horizontal, and include all nine distant environments',()=>{
 const route=map();assert.deepEqual(backgroundState(route,0),{from:0,to:0,mix:0});
 for(const q of route.filter(q=>q.checkpoint&&!q.tutorial&&q.zone<8)){
  const x=q.baseX+q.w/2;
  const left=backgroundState(route,x-.001),right=backgroundState(route,x+.001);
  assert.equal(left.to,q.zone);assert.equal(right.from,q.zone);assert.equal(right.to,q.zone+1);assert.ok(right.mix<1e-6);
  assert.equal(backgroundState(route,x+800).mix,1);
 }
});
test('optional ten-pixel expert routes have reachable transitions and do not replace the main path',()=>{
 const main=map(),branches=expertRoutes(main),all=[...main,...branches.flatMap(b=>b.supports)];
 assert.equal(branches.length,3);
 for(const branch of branches){
  assert.ok(branch.supports.every(q=>q.w===10&&q.expert));
  for(const s of branch.supports)assert.ok(!main.some(q=>q.y>s.y&&q.x<s.x+s.w&&q.x+q.w>s.x),'expert fall column must be clear');
  const path=[branch.from,...branch.supports,branch.to];
  for(let i=0;i<path.length-1;i++){
   let success=false;
   for(const second of [null,20,28,36,42,46]){
    const p=player(path[i]);p.x=path[i].x+path[i].w/2-p.w/2;const to=path[i+1];
    for(let t=0;t<260;t++){
     const d=to.x+to.w/2-p.x-p.w/2;
     step(p,{axis:Math.abs(d)<1?0:Math.sign(d),jump:t===0||t===second},1/120,all);
     if(t>5&&p.grounded&&Math.abs(p.y+p.h-to.y)<.01){success=true;break;}
    }
    if(success)break;
   }
   assert.ok(success,`expert zone ${branch.from.zone} transition ${i}`);
  }
 }
});

test('switchbacks offer actual lower recovery landings in each area',()=>{
 const route=map();let example;
 for(let zone=0;zone<9;zone++){
  const upper=route.find(q=>q.zone===zone&&!q.tutorial&&route.some(low=>low.zone===zone&&low.y>q.y&&low.x<q.x+q.w/2&&low.x+low.w>q.x+q.w/2));
  assert.ok(upper,`zone ${zone} needs overlapping landings`);example=upper;
 }
 const p=player(example);p.x=example.x+example.w/2-p.w/2;p.y=example.y+4;p.grounded=false;
 for(let i=0;i<240&&!p.grounded;i++)step(p,{axis:0,jump:false},1/120,route);
 assert.ok(p.grounded);assert.ok(p.y+p.h>example.y);assert.ok(p.y<560);
});
