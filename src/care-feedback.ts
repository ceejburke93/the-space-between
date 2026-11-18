import type { HandPoint } from './element-ritual';
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
/** Care adds expression and a small positive bonus, never a new failure condition. */
export class CareFeedback {
 quality=0;calm=0;speed=0;completion=0;reveal=0;private previous:HandPoint[]=[{x:0,y:0,z:0},{x:0,y:0,z:0}];private seen=[false,false];private wasWoven=false;
 restore(woven:boolean){this.wasWoven=woven;this.completion=0;}
 reset(){this.quality=0;this.calm=0;this.speed=0;this.completion=0;this.reveal=0;this.seen=[false,false];this.wasWoven=false;}
 update(dt:number,hands:HandPoint[],present:boolean[],supported:boolean,woven:boolean,chapter:number,encounter:number,ending:number,completed:number){
  const duration=Math.max(.001,Math.min(dt,.1));let speed=0,count=0;
  for(let i=0;i<2;i++){
   if(present[i]){const p=hands[i],last=this.previous[i];if(this.seen[i]){const distance=Math.hypot(p.x-last.x,p.y-last.y,p.z-last.z);if(distance<.25){speed+=distance/duration;count++;}}last.x=p.x;last.y=p.y;last.z=p.z;}
   this.seen[i]=present[i];
  }
  this.speed+=(Math.min(2,count?speed/count:0)-this.speed)*(1-Math.exp(-duration*8));
  const tracked=present.some(Boolean),gentle=tracked&&this.speed<.32;
  const target=tracked?(gentle?.65:0)+(supported?.35:0):0;
  this.quality+=(target-this.quality)*(1-Math.exp(-duration*2));
  this.calm+=(tracked&&gentle&&supported?duration*.35:-duration*.2);this.calm=clamp(this.calm);
  if(woven&&!this.wasWoven)this.completion=1;else this.completion=Math.max(0,this.completion-duration/.95);
  this.wasWoven=woven;
  // Replays unfold again; a restored region is already grown on other encounters.
  if(encounter===2&&ending>1.5)this.reveal=Math.min(1,this.reveal+duration/5.5);
  else this.reveal=encounter===2?0:completed>=(chapter+1)*3?1:0;
 }
}
