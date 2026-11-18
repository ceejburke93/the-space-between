export interface HandPoint{x:number;y:number;z:number;}
const Y=1.02,Z=-.62;
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
/** Forgiving position-based gestures: no precise finger pose or handedness required. */
export class ElementRitual {
 stage=0;formation=0;complete=false;private dwell=0;private startHeight=Y;private angles:(number|null)[]=[null,null];private arc=0;private minArc=0;private maxArc=0;private owner=-1;
 get circlingHand(){return this.owner;}
 reset(){this.stage=0;this.formation=0;this.complete=false;this.dwell=0;this.arc=this.minArc=this.maxArc=0;this.owner=-1;this.angles[0]=this.angles[1]=null;}
 update(chapter:number,dt:number,hands:HandPoint[],present:boolean[]){
  const active=hands.filter((_,i)=>present[i]);if(!active.length){this.owner=-1;this.dwell=0;this.angles=[null,null];return;}
  if(chapter===2){
   if(this.owner>=0&&!present[this.owner]){this.owner=-1;this.angles=[null,null];}
   const centerY=Y+.11,centerZ=Z+.1;
   hands.forEach((p,i)=>{
    const radius=Math.hypot(p.x,p.y-centerY);
    if(!present[i]||radius<.07||radius>.33||Math.abs(p.z-centerZ)>.24){this.angles[i]=null;if(this.owner===i)this.owner=-1;return;}
    const angle=Math.atan2(p.y-centerY,p.x),previous=this.angles[i];this.angles[i]=angle;
    if(previous===null)return;
    const delta=Math.atan2(Math.sin(angle-previous),Math.cos(angle-previous));
    if(Math.abs(delta)>.35||Math.abs(delta)<.002)return;
    if(this.owner<0){this.owner=i;}
    if(this.owner===i){this.arc+=delta;this.minArc=Math.min(this.minArc,this.arc);this.maxArc=Math.max(this.maxArc,this.arc);}
   });
   this.formation=clamp((this.maxArc-this.minArc)/(Math.PI*1.6));this.complete=this.formation>=1;return;
  }
  const center=active.reduce((p,h)=>({x:p.x+h.x/active.length,y:p.y+h.y/active.length,z:p.z+h.z/active.length}),{x:0,y:0,z:0});
  const aligned=Math.abs(center.x)<.28&&Math.abs(center.z-(Z+.08))<.28;
  if(!aligned){this.dwell=0;return;}
  if(this.stage===0){
   const correct=chapter===1?center.y>Y-.15&&center.y<Y+.06&&Math.max(...active.map(h=>h.x))-Math.min(...active.map(h=>h.x))<.3:center.y>Y+.12&&center.y<Y+.4;
   this.dwell=correct?this.dwell+dt:0;
   if(this.dwell>.25){this.stage=1;this.startHeight=center.y;this.dwell=0;}return;
  }
  this.formation=clamp((chapter===1?center.y-this.startHeight:this.startHeight-center.y)/.15);
  const requiredFormation=chapter===3?.85:.92;
  this.dwell=this.formation>requiredFormation?this.dwell+dt:0;this.complete=this.dwell>.25;
 }
 supports(chapter:number,hands:HandPoint[],present:boolean[],travelerX:number){
  const active=hands.filter((_,i)=>present[i]);if(!active.length)return false;
  if(chapter===2)return active.some(p=>Math.hypot(p.x-travelerX,p.y-(Y+.07),p.z-Z)<.34);
  return active.every(p=>Math.abs(p.x)<.45&&Math.abs(p.z-(Z+.08))<.35&&(chapter===1?p.y>Y+.06&&p.y<Y+.5:p.y<Y+.14&&p.y>Y-.3));
 }
 prompt(chapter:number){
  if(chapter===1)return this.complete?'Hold the stream gently up':this.stage?'Lift gently to make a stream':'Place one hand beneath the droplet';
  if(chapter===2)return this.complete?'Let one hand follow the ember':'Trace a slow circle around the ember';
  return this.complete?'Rest one hand low to hold the stones':this.stage?'Press down gently to raise the stones':'Hold one hand above the stones';
 }
}
