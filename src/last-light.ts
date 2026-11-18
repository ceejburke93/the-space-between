import {WorldMemory,normalizeWorldMemory,type WorldMemorySave} from './world-memory.ts';
import {ElementRitual,type HandPoint} from './element-ritual.ts';
export interface LastLightSave {channel:number;memory?:WorldMemorySave;aqueduct?:boolean;anchors:number;flow:boolean;roots:boolean;shelter:boolean;warmth:boolean;released:boolean;time:number;}
export const LAST_LIGHT_NODES=[
 {id:'channel-roots',x:-.18,y:1.08,z:-.34}, {id:'channel-garden',x:.18,y:1.08,z:-.34},
 {id:'water',x:0,y:1.02,z:-.80}, {id:'leaf-left',x:-.23,y:1.13,z:-.62},
 {id:'leaf-right',x:.23,y:1.13,z:-.62}, {id:'ember',x:0,y:1.13,z:-.52},
] as const;
/** Reversible routing, latched help and a deliberate handoff. Tracking loss is never a release. */
export class LastLight {
 memory=new WorldMemory();
 aqueduct=false;private liftArmed=false;private liftHold=0;
 channel=0;flow=false;roots=false;shelter=false;warmth=false;released=false;time=0;
 private earthArmed=0;private water=new ElementRitual();private fire=new ElementRitual();
 private waterPresent=[false,false];private dwell=0;private rootHold=0;private heatHold=0;private releaseHold=0;anchors=0;private leafTarget=0;private leafHold=0;
 constructor(saved?:LastLightSave){if(saved){const {memory,...rest}=saved;Object.assign(this,rest);this.memory=new WorldMemory(memory);}}
 get ready(){return this.roots&&this.shelter&&this.warmth&&this.dryHearth;}
 get dryHearth(){return this.channel===2||(this.channel===1&&this.aqueduct);}
 get formation(){return this.fire.formation;}
 get stage(){return this.released?5:this.ready?4:this.shelter?3:this.roots?2:this.flow?1:0;}
 get cooling(){return this.flow&&this.channel===1&&!this.aqueduct;}
 snapshot():LastLightSave{return {memory:this.memory.snapshot(),channel:this.channel,aqueduct:this.aqueduct,anchors:this.anchors,flow:this.flow,roots:this.roots,shelter:this.shelter,warmth:this.warmth,released:this.released,time:this.time};}
 update(dt:number,hands:HandPoint[],present:boolean[]){
  dt=Math.max(0,Math.min(.1,dt));if(this.released){this.time=Math.min(24,this.time+dt);if(this.time>=24)this.memory.update(dt,hands,present);return;}
  let any=false;for(let i=0;i<hands.length;i++)any||=!!present[i];
  if(!any){this.dwell=this.releaseHold=this.rootHold=this.heatHold=this.leafHold=0;this.earthArmed=0;this.liftArmed=false;this.liftHold=0;this.water.update(1,0,hands,present);this.fire.update(2,0,hands,present);return;}
  let earth=0,leaf=0,away=true,liftLow=false,liftHigh=false,liftColumn=false;
  for(let i=0;i<hands.length;i++)if(present[i]){
   const h=hands[i];if(Math.hypot(h.x,h.y-1.10,h.z+.62)<.37)away=false;
   for(let side=1;side<=2;side++){const x=side===1?-.18:.18;if(Math.hypot(h.x-x,h.z+.34)<.075){if(h.y>.92&&h.y<1.42)away=false;if(h.y>1.19&&h.y<1.42)this.earthArmed=side;if(h.y<1.12&&h.y>.92&&this.earthArmed===side)earth=side;}}
   if(Math.hypot(h.x+.18,h.z+.34)<.075&&h.y>.92&&h.y<1.42){liftColumn=true;liftLow||=h.y<1.12;liftHigh||=h.y>1.23;}
   if(this.roots&&!this.shelter){if(Math.hypot(h.x+.23,h.y-1.13,h.z+.62)<.085)leaf|=1;if(Math.hypot(h.x-.23,h.y-1.13,h.z+.62)<.085)leaf|=2;}
  }
  this.dwell=earth?this.dwell+dt:0;if(this.dwell>.3){this.channel=earth;this.aqueduct=false;this.dwell=0;this.earthArmed=0;}
  if(this.channel===1&&!this.aqueduct&&liftColumn){
   if(!this.liftArmed){this.liftHold=liftLow?this.liftHold+dt:0;if(this.liftHold>.3){this.liftArmed=true;this.liftHold=0;}}
   else {this.liftHold=liftHigh?this.liftHold+dt:0;if(this.liftHold>.4){this.aqueduct=true;this.liftArmed=false;this.liftHold=0;this.earthArmed=0;}}
  }else {this.liftArmed=false;this.liftHold=0;}
  // Water keeps the lifted stream flowing while the player turns to another creature.
  if(!this.flow){const waterPresent=this.waterPresent;for(let i=0;i<hands.length;i++)waterPresent[i]=!!present[i]&&Math.abs(hands[i].x)<.10&&Math.abs(hands[i].z+.80)<.09;this.water.update(1,dt,hands,waterPresent);if(this.water.complete)this.flow=true;}
  this.rootHold=this.flow&&this.channel===1?this.rootHold+dt:0;if(this.rootHold>.8)this.roots=true;
  if(leaf){if(this.leafTarget!==leaf){this.leafTarget=leaf;this.leafHold=0;}this.leafHold+=dt;if(this.leafHold>.35)this.anchors|=leaf;}else this.leafHold=0;
  if(this.anchors===3)this.shelter=true;
  if(this.shelter&&!this.warmth){this.fire.update(2,dt,hands,present);this.heatHold=this.fire.complete&&this.dryHearth?this.heatHold+dt:0;if(this.heatHold>.7)this.warmth=true;}
  this.releaseHold=this.ready&&away?this.releaseHold+dt:0;
  if(this.releaseHold>.9){this.released=true;this.time=0;}
 }
 prompt(){return this.released?(this.time<15?'You can rest. They have it now.':this.time<24?'Together, they make a way.':'A little kindness. A world that remembers.'):this.ready?'Let your hand rest outside the garden. The companions will carry the seed.':!this.flow?'The last seed is waiting. Water needs a way to the roots.':!this.roots?'The stream cannot reach the roots from here.':!this.shelter?'The roots have opened. Leaf can grow a shelter.':this.cooling?'Water can go around the hearth—or Earth can lift it above.':!this.channel?'Earth can give the stream another way.':'A sheltered hearth. A circle of warmth can wake the seed.';}
}
export function normalizeLastLight(value:unknown):LastLightSave|undefined{
 if(!value||typeof value!=='object')return;const v=value as Record<string,unknown>;
 const channel=v.channel===1||v.channel===2?v.channel:0,aqueduct=channel===1&&v.aqueduct===true,flow=v.flow===true,roots=flow&&v.roots===true,shelter=roots&&v.shelter===true,warmth=shelter&&v.warmth===true,released=(channel===2||aqueduct)&&warmth&&v.released===true;
 const anchors=shelter?3:roots&&Number.isInteger(v.anchors)?Math.max(0,Math.min(3,v.anchors as number)):0;
 return {memory:released?normalizeWorldMemory(v.memory):undefined,channel,aqueduct,anchors,flow,roots,shelter,warmth,released,time:released&&typeof v.time==='number'&&Number.isFinite(v.time)?Math.max(0,Math.min(24,v.time)):0};
}

/** One profile drives both the raised stone bed and the visible water. */
const AQUEDUCT_PATH=[[0,1.035,-.80],[-.12,1.045,-.72],[-.05,1.22,-.62],[.05,1.22,-.50],[.24,1.035,-.43]] as const;
export function sampleLastLightStream(t:number,channel:number,raised:boolean,out:HandPoint){
 t=Math.max(0,Math.min(1,t));if(channel===1&&raised){const u=t*4,i=Math.min(3,Math.floor(u)),f=u-i,a=AQUEDUCT_PATH[i],b=AQUEDUCT_PATH[i+1];out.x=a[0]+(b[0]-a[0])*f;out.y=a[1]+(b[1]-a[1])*f;out.z=a[2]+(b[2]-a[2])*f;}
 else {out.x=channel===0?0:Math.sin(t*Math.PI)*(channel===2?.30:-.14);out.y=1.035+Math.sin(t*Math.PI)*.012;out.z=-.80+t*(channel===0?.46:channel===2?.35:.28);}return out;
}
