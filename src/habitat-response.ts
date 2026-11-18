/** Gentle scenery response, independent of puzzle progress or hand gestures. */
export function habitatInfluence(distance:number):number {
 const t=Math.max(0,Math.min(1,1-distance/.13));
 return t*t*(3-2*t);
}
/** Completed encounters remain visible when revisiting their chapter. */
export function habitatMilestones(chapter:number,completed:number):number {
 return Math.max(0,Math.min(3,Math.floor(completed)-chapter*3));
}
export function habitatGrowthTarget(stage:number,earned:number,encounter:number,progress:number,ending:number,active:boolean):number {
 if(stage<earned)return 1;
 if(!active||stage!==encounter||progress<1)return 0;
 const t=Math.max(0,Math.min(1,(ending-.8)/3));return t*t*(3-2*t);
}
