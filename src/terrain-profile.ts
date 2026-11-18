/** Planet surface in game-local meters. The central ravine preserves the bridge gap. */
export function terrainHeight(chapter:number,x:number,z:number):number {
 const bank=1-Math.exp(-Math.pow(Math.abs(x)/.64,3));
 const hills=.12*Math.sin(x*2.1+z*.8)+.08*Math.cos(z*2.4-x);
 const distance=Math.min(1,Math.max(0,(-z-1.3)/2));
 const shoulder=.38*Math.exp(-Math.pow((z+.62)/.72,2));
 const original=.08+bank*(.48+distance*.35+hills+shoulder)+.025*Math.sin(z*5+x*3)*(chapter===1?.4:1);
 // Broad shoulders join the huts to the woodland while the inner ravine remains deep.
 const t=Math.max(0,Math.min(1,(Math.abs(x)-.23)/.25));
 const shelf=.965*t*t*(3-2*t)*Math.exp(-Math.pow((z+.77)/.91,4));
 return Math.max(original,shelf);
}
/** Surface for a trail leaving a hut: exact deck height, then a short earthen ramp. */
export function habitatGround(chapter:number,x:number,z:number):number {
 const d=Math.hypot(Math.abs(x)-.48,z+.62),ground=terrainHeight(chapter,x,z);
 const blend=Math.max(0,Math.min(1,(d-.24)/.12));
 return d<.36?1.023*(1-blend)+ground*blend:ground;
}
export function trailPoint(side:number,t:number):{x:number;z:number} {
 return {x:side*(.64+t*.85+Math.sin(t*Math.PI)*.18),z:-.74-t*2.1};
}
