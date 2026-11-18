import type {HandPoint} from './element-ritual';
const Y=1.02,Z=-.62;
const near=(a:HandPoint,b:HandPoint,r=.18)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)<r;
/** One new interaction layered onto the chapter's original gesture. */
export class EncounterChallenge {
 complete=false;stage=0;choice=0;private lastChoice=0;private dwell=0;private baseline:number|null=null;
 update(chapter:number,encounter:number,dt:number,hands:HandPoint[],present:boolean[],supported:boolean,assisted:boolean){
  if(encounter===0){this.complete=true;return;}
  const active=hands.filter((_,i)=>present[i]);if(!active.length){this.dwell=0;return;}
  const centerY=active.reduce((sum,p)=>sum+p.y/active.length,0);this.baseline??=centerY;
  const traveler={x:.0416,y:Y+.075,z:Z+.04},home={x:.36,y:Y+.075,z:Z+.04};let correct=false,duration=.55;
  if(chapter===0){correct=encounter===1?true:active.some(p=>near(p,traveler));if(encounter===1){duration=supported?1.25:.55;this.choice=supported?2:1;}}
  if(chapter===1)correct=encounter===1?centerY<Y+.055:active.some(p=>near(p,traveler));
  if(chapter===2){
   if(encounter===1){const above=active.some(p=>Math.abs(p.x-traveler.x)<.2&&Math.abs(p.z-traveler.z)<.22&&p.y>Y+.18&&p.y<Y+.4);const below=active.some(p=>Math.abs(p.x-traveler.x)<.18&&Math.abs(p.z-traveler.z)<.2&&p.y>Y-.12&&p.y<Y+.015);correct=above||below;this.choice=above?1:below?2:0;}
   else correct=active.some(p=>near(p,this.stage?home:traveler));
  }
  if(chapter===3){
   if(encounter===1)correct=active.some(p=>p.y<(this.baseline??Y)-.075);
   else if(assisted||active.length===1)correct=active.some(p=>this.stage?p.x>.17:p.x<-.17);
   else correct=Math.max(...active.map(p=>p.x))-Math.min(...active.map(p=>p.x))>.43;
  }
  if(this.choice!==this.lastChoice){this.dwell=0;this.lastChoice=this.choice;}
  this.dwell=correct?this.dwell+dt:0;
  if(this.dwell>=duration){this.dwell=0;if(encounter===2&&((chapter===2)||(chapter===3&&(assisted||active.length===1)))&&this.stage===0)this.stage=1;else this.complete=true;}
 }
 prompt(chapter:number,encounter:number,assisted:boolean){
  if(chapter===0)return encounter===1?'Let it pause, or hold steady to offer a perch.':'Bring one hand close to its lantern';
  if(chapter===1)return encounter===1?'Lower the stream a little. Let it settle.':'Bring one hand close to share a drop';
  if(chapter===2)return encounter===1?'Shelter above, or cup your hand beneath the spark':this.stage?'Carry the spark toward the right shore':'Bring one hand close to receive its spark';
  return encounter===1?'Press a little lower to steady the stone':assisted?(this.stage?'Sweep gently toward the right shore':'Sweep gently toward the left shore'):'Spread your hands to widen the path';
 }
}
