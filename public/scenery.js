// Stable world coordinates, shared by rendering and regression tests.
export function sceneryCells(cameraX,speed,spacing,viewportWidth){
 const offset=cameraX*speed,start=Math.floor(offset/spacing)-2,end=Math.ceil((offset+viewportWidth)/spacing)+2;
 return Array.from({length:end-start+1},(_,i)=>({id:start+i,x:(start+i)*spacing-offset}));
}
export function backgroundState(platforms,x){
 let zone=0,start=0;
 for(const q of platforms){
  if(!q.checkpoint||q.tutorial||q.zone>=8)continue;
  const boundary=q.baseX+q.w/2;
  if(x>=boundary){zone=q.zone+1;start=boundary;}
 }
 if(zone===0)return {from:0,to:0,mix:0};
 const t=Math.max(0,Math.min(1,(x-start)/800));
 return {from:zone-1,to:zone,mix:t*t*(3-2*t)};
}
