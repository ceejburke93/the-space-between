import {ElementRitual,type HandPoint} from './element-ritual.ts';
export interface WorldMemorySave {watered:boolean;warmed:boolean;supported:boolean;growth:number;lesson:number;arrival?:number;}
export const MEMORY_NODES=[{id:'memory-water',x:.25,y:1.02,z:-.70},{id:'memory-earth',x:.40,y:1.24,z:-.48},{id:'memory-fire',x:.25,y:1.13,z:-.70}] as const;
/** An optional quiet request. Familiar gestures work sequentially with either hand. */
export class WorldMemory {
 arrival=0;watered=false;warmed=false;supported=false;growth=0;lesson=0;
 private tracked=false;private water=new ElementRitual();private fire=new ElementRitual();private earth=new ElementRitual();
 private local=[{x:0,y:0,z:0},{x:0,y:0,z:0}];private valid=[false,false];
 constructor(saved?:WorldMemorySave){if(saved)Object.assign(this,saved);}
 get blooming(){return this.watered&&this.warmed&&this.supported;}
 snapshot():WorldMemorySave{return {arrival:this.arrival,watered:this.watered,warmed:this.warmed,supported:this.supported,growth:this.growth,lesson:this.lesson};}
 update(dt:number,hands:HandPoint[],present:boolean[]){
  dt=Math.max(0,Math.min(.1,dt));this.arrival=Math.min(3,this.arrival+dt);if(this.blooming){this.growth=Math.min(8,this.growth+dt);this.lesson=Math.min(18,this.lesson+dt);return;}
  const tracked=!!present[0]||!!present[1];if(!tracked&&this.tracked){if(!this.watered)this.water.reset();if(!this.warmed)this.fire.reset();if(!this.supported)this.earth.reset();}this.tracked=tracked;
  for(let i=0;i<2;i++){const h=hands[i];this.valid[i]=!!present[i]&&!!h&&Math.abs(h.x-.25)<(this.watered?.23:.11)&&Math.abs(h.z+.70)<.1;if(h){this.local[i].x=h.x-.25;this.local[i].y=h.y;this.local[i].z=h.z+.16;}}
  if(!this.watered){this.water.update(1,dt,this.local,this.valid);this.watered=this.water.complete;}
  else if(!this.warmed){this.fire.update(2,dt,this.local,this.valid);this.warmed=this.fire.complete;}
  if(!this.supported){for(let i=0;i<2;i++){const h=hands[i];this.valid[i]=!!present[i]&&!!h&&Math.abs(h.x-.40)<.08&&Math.abs(h.z+.48)<.08;if(h){this.local[i].x=h.x-.40;this.local[i].y=h.y;this.local[i].z=h.z;}}this.earth.update(3,dt,this.local,this.valid);this.supported=this.earth.complete;}
 }
}
export function normalizeWorldMemory(value:unknown):WorldMemorySave|undefined{
 if(!value||typeof value!=='object')return;const v=value as Record<string,unknown>,watered=v.watered===true,warmed=watered&&v.warmed===true,supported=v.supported===true,blooming=watered&&warmed&&supported;
 const bounded=(n:unknown,max:number)=>typeof n==='number'&&Number.isFinite(n)?Math.max(0,Math.min(max,n)):0;
 return {arrival:bounded(v.arrival,3),watered,warmed,supported,growth:blooming?bounded(v.growth,8):0,lesson:blooming?bounded(v.lesson,18):0};
}
