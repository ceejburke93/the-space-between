import type { HandPoint } from './element-ritual';
export const WEAVE_STRANDS=15,WEAVE_SAMPLES=33,WEAVE_VERTICES=WEAVE_STRANDS*WEAVE_SAMPLES;
/** Indexed segments preserve the original thread paths while sharing one draw. */
export function weaveIndices(){
 const indices=new Uint16Array(WEAVE_STRANDS*(WEAVE_SAMPLES-1)*2);let cursor=0;
 for(let strand=0;strand<WEAVE_STRANDS;strand++)for(let j=0;j<WEAVE_SAMPLES-1;j++){indices[cursor++]=strand*WEAVE_SAMPLES+j;indices[cursor++]=strand*WEAVE_SAMPLES+j+1;}
 return indices;
}
/** Write into the same preallocated buffer. Deck samples also drive the planted feet. */
export function updateWeave(positions:Float32Array,start:HandPoint,finish:HandPoint,snap:boolean,heightAt:(x:number)=>number){
 let cursor=0;
 for(let strand=0;strand<WEAVE_STRANDS;strand++)for(let j=0;j<WEAVE_SAMPLES;j++){
  const t=j/(WEAVE_SAMPLES-1),along=strand<7?t:(strand-7)/7;
  const x=start.x+(finish.x-start.x)*along,z=start.z+(finish.z-start.z)*along+(strand<7?(strand/6-.5)*.055:(t-.5)*.055);
  const y=snap?heightAt(x):start.y+(finish.y-start.y)*along-Math.sin(along*Math.PI)*.018+.003;
  positions[cursor++]=x;positions[cursor++]=y;positions[cursor++]=z;
 }
}
