const clamp=(n:number)=>Math.max(0,Math.min(1,n));
/** The perch choice becomes a visible pause together; otherwise Leaf patiently waits. */
export function rememberedCrossing(actor:number,time:number,leafChoice:number){
 if(leafChoice===2&&(actor===0||actor===1)){
  const start=actor===0?15:17,hold=actor===0?.43:.505;
  if(time<start+2)return clamp((time-start)/2)*hold;
  if(time<20)return hold;
  return hold+(1-hold)*clamp((time-20)/3);
 }
 return clamp((time-(leafChoice===1?16:15))/7);
}
