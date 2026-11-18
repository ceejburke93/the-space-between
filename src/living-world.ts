import {puzzleNodes,type PuzzleChallenge} from './puzzle-challenge';
import type {CompanionGuidance} from './companion-guidance';
import type {LastLight} from './last-light';
import { rememberedCrossing } from './finale-memory';
import * as T from '@iwsdk/core';
import assets from './assets';
/** Runtime animation owns only the named articulated parts of the model. */
export class LivingWorld {
 puzzleInvitations=0;readonly group=assets['living-world'].clone(true);
 private feedback=this.group.getObjectByName('GestureFeedback')!;private formationRing=this.group.getObjectByName('FormationRing') as T.Mesh<T.BufferGeometry,T.MeshBasicMaterial>;private completionRing=this.group.getObjectByName('CompletionRing') as T.Mesh<T.BufferGeometry,T.MeshBasicMaterial>;
 private gift=this.group.getObjectByName('Gift')!;private bloom=this.group.getObjectByName('Bloom')!;
 private flowers=this.group.getObjectByName('Flowers') as T.InstancedMesh;
 private cues=this.group.getObjectByName('FireflyCues')!;private flies=this.group.getObjectByName('Fireflies') as T.Points;
 private roots=this.group.getObjectByName('ReachingRoots')!;private links=this.group.getObjectByName('ChapterLinks')!;
 private shelter=this.group.getObjectByName('SharedShelter')!;private cast=this.group.getObjectByName('Finale')!;
 private actors=[0,1,2,3].map(i=>this.cast.getObjectByName(`Companion${i}`)!);
 private bodies=this.actors.map(a=>a.children[0]);private actorArms=this.actors.map(a=>[-1,1].map(side=>a.getObjectByName(`Arm${side}`)!));
 get fireCurl(){return this.bodies[2].scale.y/.86;}
 get earthReach(){return this.actorArms[3][0].rotation.x;}
 private bridge=this.group.getObjectByName('TogetherBridge')!;private point=new T.Vector3();
 get giftOffered(){return this.gift.visible;}
 readonly giftPosition=new T.Vector3(.39,1.13,-.54);
 constructor(root:T.Group){this.formationRing.geometry=this.formationRing.geometry.clone();this.formationRing.material=this.formationRing.material.clone();this.completionRing.material=this.completionRing.material.clone();this.flies.material=(this.flies.material as T.PointsMaterial).clone();this.flies.geometry=this.flies.geometry.clone();root.add(this.group);}
 /** Friends keep contributing after a hand leaves; their poses point toward the cause. */
 coordinateLastLight(p:LastLight,time:number,guidance:CompanionGuidance){
  if(p.released)return;
  for(let i=0;i<4;i++){
   const actor=this.actors[i],body=this.bodies[i];
   const x=i===0?-.29:i===1?-.11:i===2?.12:.34,z=i===0?-.65:i===1?-.79:i===2?-.52:-.49;
   actor.position.set(x,1.027+(i===1||i===2?.018:0),z);
   const helping=i===0?p.shelter:i===1?p.flow:i===2?p.warmth:p.channel>0;
   // Each friend looks at the thing it affects, then occasionally checks its partner.
   const glance=Math.sin(time*.65+i)>.65;
   let targetX=i===0?-.23:i===1?-.23:i===2?0:(p.channel===2?.18:-.18);
   let targetZ=i===1?-.62:i===3?-.34:i===2?-.52:-.62;
   if(p.ready){targetX=glance?0:(i<2?.12:-.29);targetZ=glance?-.34:-.62;}
   else if(i===3&&p.cooling&&glance){targetX=.12;targetZ=-.52;}
   actor.rotation.y=Math.atan2(targetX-x,targetZ-z);actor.rotation.z=0;
   body.scale.setScalar(.86);body.rotation.x=0;
   if(i===0){body.rotation.x=p.roots?(p.shelter?-.06:.12):.04;body.scale.y*=p.roots?1: .92;}
   if(i===1){body.rotation.x=p.flow?-.18:-.06;body.scale.x*=1+Math.sin(time*2)*.025;}
   if(i===2){const curl=p.cooling?.65:1;body.scale.set(.86*(p.cooling?.86:1),.86*curl,.86);body.rotation.x=p.cooling?.22:-.06;}
   if(i===3)body.rotation.x=p.aqueduct?-.08:.16;
   for(let j=0;j<2;j++){
    const arm=this.actorArms[i][j],side=j===0?-1:1;
    arm.rotation.x=i===3?(p.aqueduct?-.9:p.cooling&&Math.sin(time*.8)>0?-.65:.3):i===2&&p.cooling?.4:helping?-.8:i===0&&p.roots?-.55:-.15;
    arm.rotation.z=side*(i===2&&p.cooling?.12:helping?.5:.25)+Math.sin(time*1.5+i)*.025;
   }
  }
  // A clearer, local demonstration appears only after unsuccessful approaches.
  this.cues.visible=guidance.level>0&&!p.ready;
  if(this.cues.visible){
   const positions=this.flies.geometry.getAttribute('position');
   const alternate=Math.floor(time/6)%2===0;
   for(let i=0;i<24;i++){
    const u=(i/24+time*.13)%1,need=guidance.need;
    if(need==='water')this.point.set(0,1.02+u*.22,-.8);
    else if(need==='roots')this.point.set(-.18,1.28-u*.22,-.34);
    else if(need==='shelter')this.point.set(p.anchors===1?.23:p.anchors===2?-.23:alternate?-.23:.23,1.135+Math.sin(u*Math.PI)*.015,-.62);
    else if(need==='dry-hearth')this.point.set(alternate?.18:-.18,alternate?1.28-u*.22:1.06+u*.22,-.34);
    else this.point.set(Math.cos(u*Math.PI*2)*.16,1.13+Math.sin(u*Math.PI*2)*.16,-.52);
    positions.setXYZ(i,this.point.x,this.point.y,this.point.z);
   }
   positions.needsUpdate=true;this.flies.geometry.computeBoundingSphere();
  }
 }

 /** The player’s patience becomes a lesson between companions, without a prompt. */
 rememberTogether(p:LastLight,time:number){
  if(!p.released||p.time<24)return;const m=p.memory,a=T.MathUtils.smoothstep(m.arrival,0,3);
  for(let i=0;i<4;i++){
   const actor=this.actors[i],x=i===0?.25:i===1?.33:i===2?.34:.43,z=i===0?-.64:i===1?-.76:i===2?-.63:-.49;
   actor.position.x+=(x-actor.position.x)*a;actor.position.z+=(z-actor.position.z)*a;
   actor.rotation.y=Math.atan2(.25-actor.position.x,-.70-actor.position.z);
   const lesson=i===0&&m.blooming&&m.lesson>3&&m.lesson<9;
   if(lesson)actor.rotation.y=Math.atan2(.29-actor.position.x,-.64-actor.position.z);
   for(let j=0;j<2;j++){const arm=this.actorArms[i][j];arm.rotation.x=lesson?-.85:i===1&&m.watered?-.6:i===2&&m.warmed?-.5:i===3&&m.supported?.25:-.15;arm.rotation.z=(j===0?-1:1)*(lesson?.6:.3);}
  }
 }
 /** All valid choices receive the same invitation; inactive targets stay quiet. */
 focusPuzzle(p:PuzzleChallenge,time:number){
  if(p.complete)return;const nodes=puzzleNodes(p.chapter,p.encounter);let count=0;for(const n of nodes)if(p.nodeActive(n.id))count++;
  this.puzzleInvitations=count;this.feedback.visible=false;this.cues.visible=count>0;if(!count)return;
  const points=this.flies.geometry.getAttribute('position');
  for(let i=0;i<24;i++){let which=i%count;for(const n of nodes)if(p.nodeActive(n.id)&&which--===0){const angle=time*.85+i*2.399;points.setXYZ(i,n.x+Math.cos(angle)*.026,n.y+.012+Math.sin(angle*.7)*.004,n.z+Math.sin(angle)*.026);break;}}
  points.needsUpdate=true;this.flies.geometry.computeBoundingSphere();
 }
 update(chapter:number,completed:number,woven:boolean,progress:number,ending:number,time:number,hands:T.Vector3[],present:boolean[],giftStage:number,bloomTime:number,finaleTime:number,formation=0,quality=0,pulse=0,assisted=false,assistReturning=false,ritualStage=0,leafChoice=0,fireChoice=0,encounter=0){
  this.puzzleInvitations=0;this.feedback.visible=progress<1;this.feedback.position.set(0,1.1,-.54);
  if(chapter===0&&!woven){if(assisted)this.feedback.position.set(assistReturning?.23:-.23,1.032,-.62);else{let n=0;this.feedback.position.set(0,0,0);for(let i=0;i<2;i++)if(present[i]){this.feedback.position.add(hands[i]);n++;}if(n)this.feedback.position.multiplyScalar(1/n);else this.feedback.position.set(0,1.04,-.54);}}
  if(chapter===1)this.feedback.position.y=ritualStage?1.18:1.02;
  if(chapter===2){this.feedback.position.y=1.13;if(woven)this.feedback.position.x=-.28+progress*.67;}
  if(chapter===3)this.feedback.position.y=ritualStage?1.05:1.22;
  this.formationRing.rotation.x=chapter===2?0:-Math.PI/2;
  this.formationRing.scale.setScalar(chapter===2&&!woven?3.5:1);
  this.formationRing.geometry.setDrawRange(0,!woven&&formation>0?Math.max(3,Math.floor(this.formationRing.geometry.index!.count*formation/3)*3):Infinity);
  this.formationRing.material.color.setHex([0xc8e6a5,0xa5e4ec,0xffc37c,0xd2ccb0][chapter]);
  this.formationRing.material.opacity=woven?.2+quality*.45:.25+formation*.65;
  this.completionRing.rotation.copy(this.formationRing.rotation);this.completionRing.visible=pulse>0;this.completionRing.scale.setScalar(1+(1-pulse)*3);this.completionRing.material.opacity=pulse*.85;
  (this.flies.material as T.PointsMaterial).size=.005+quality*.003;
  this.gift.visible=chapter===0&&encounter===0&&ending>2&&giftStage<2;this.gift.position.copy(this.giftPosition);this.gift.rotation.y=time;
  if(giftStage===1){for(let i=0;i<2;i++)if(present[i]&&hands[i].distanceTo(this.giftPosition)<.2){this.gift.position.copy(hands[i]);this.gift.position.y+=.025;break;}}
  this.bloom.visible=giftStage===2;this.bloom.position.set(.48,1.025,-.52);this.bloom.scale.setScalar(Math.max(.001,Math.min(1,bloomTime/1.5)));
  for(let i=0;i<6;i++)this.bloom.getObjectByName(`PetalPivot${i}`)!.rotation.x=-(1-Math.min(1,bloomTime/2))*.9;
  this.flowers.count=giftStage===2?Math.min(36,Math.floor(bloomTime*9)):0;
  this.roots.visible=chapter===0&&!woven;this.roots.scale.x=1+Math.sin(time*1.5)*.045;
  this.cues.visible=progress<1&&(chapter===0||!woven||chapter===2);
  const positions=this.flies.geometry.getAttribute('position');
  for(let i=0;i<24;i++){
   const u=i/23,phase=time*.8+u*Math.PI*2;
   if(chapter===0){if(woven)this.point.set(-.23+((u+time*.1)%1)*.46,1.04,-.62);else{const a=present[0]?hands[0]:this.point.set(-.1,1.02,-.5);const b=present[1]?hands[1]:a;const targetX=assisted?this.feedback.position.x:(a.x+b.x)/2,targetY=assisted?this.feedback.position.y:(a.y+b.y)/2,targetZ=assisted?this.feedback.position.z:(a.z+b.z)/2;this.point.set(targetX+Math.cos(phase)*.045,targetY+.025+Math.sin(phase)*.012,targetZ+Math.sin(phase)*.045);}}
   else if(chapter===1)this.point.set(Math.sin(phase)*.035,1.00+((u+time*.2)%1)*.22,-.54);
   else if(chapter===2){if(woven)this.point.set(-.28+progress*.67+Math.cos(phase)*.025,1.11+Math.sin(phase)*.025,-.58);else this.point.set(Math.cos(phase)*.16,1.13+Math.sin(phase)*.16,-.52);}
   else this.point.set(Math.sin(phase)*.035,1.24-((u+time*.2)%1)*.22,-.54);
   positions.setXYZ(i,this.point.x,this.point.y,this.point.z);
  }positions.needsUpdate=true;this.flies.geometry.computeBoundingSphere();
  this.links.children.forEach((link,i)=>{link.visible=completed>=(i+1)*3;link.scale.x=completed>(i+1)*3||chapter>i?1:Math.min(1,.2+Math.max(0,ending-2)*.2);});
  this.shelter.visible=completed===12;
  this.cast.visible=finaleTime>0;this.bridge.visible=finaleTime>3;
  const t=finaleTime;
  this.bridge.children.forEach((strand,i)=>{if(strand.name==='StoneAnchor'){strand.visible=t>12;strand.scale.set(Math.max(.001,Math.min(1,(t-12)/2)),1,1.4);}else{strand.visible=t>3+i*3;strand.scale.x=Math.max(.001,Math.min(1,(t-3-i*3)/2));}});
  this.cast.children.forEach((actor,i)=>{if(actor===this.bridge||actor.name==='MemoryShelter')return;this.bodies[i].scale.setScalar(.86);this.bodies[i].rotation.x=0;let walk=rememberedCrossing(i,t,leafChoice);if(leafChoice===2&&i<2){const oldHold=i===0?.43:.505,newHold=i===0?.29/.65:.14/.535;walk=walk<=oldHold?walk/oldHold*newHold:newHold+(walk-oldHold)/(1-oldHold)*(1-newHold);}const start=i===0?-.29:i===1?-.11:i===2?.12:.34;const x=start+(.36+i*.065-start)*walk;actor.position.set(x,1.027+(i===1||i===2?.018+Math.sin(time*2+i)*.003:0),-.62+(i%2)*.012);actor.rotation.y=walk<1?Math.PI/2:0;
   const workZ=i===0?-.65:i===1?-.79:i===2?-.52:-.49;actor.position.z=workZ+(actor.position.z-workZ)*walk;
   for(const side of [-1,1]){const arm=actor.getObjectByName(`Arm${side}`)!;arm.rotation.z=side*(t<15?.8:.35)+Math.sin(time*2+i)*.08;arm.position.y=i===2&&t>16&&t<23?(fireChoice===2?.015:.075):.032;arm.rotation.x=i===0&&leafChoice===2&&t>17&&t<20?-.9:0;}
   if(i===1&&leafChoice===2&&t>19&&t<20)actor.rotation.z=-.15;else actor.rotation.z=0;
   if(i===2&&t>16&&t<23){const waterProgress=rememberedCrossing(1,t,leafChoice);const oldHold=.505,newHold=.14/.535,waterWalk=leafChoice===2?(waterProgress<=oldHold?waterProgress/oldHold*newHold:newHold+(waterProgress-oldHold)/(1-oldHold)*(1-newHold)):waterProgress;actor.position.x=T.MathUtils.lerp(actor.position.x,-.11+.535*waterWalk+.065,T.MathUtils.smoothstep(t,16,17));actor.position.z=-.60;}
   let footIndex=0;for(const part of actor.children)if(part.name==='Foot'){const step=Math.sin(time*7+footIndex++*Math.PI);part.position.y=.007+(walk>0&&walk<1?Math.max(0,step)*.007:0);part.position.z=.008+(walk>0&&walk<1?step*.012:0);}
  });
  const shelter=this.cast.getObjectByName('MemoryShelter')!;shelter.visible=t>16&&t<23;const water=this.cast.getObjectByName('Companion1')!;shelter.position.set(water.position.x,1.027+(fireChoice===2?.035:.085),water.position.z+.008);shelter.rotation.z=fireChoice===2?Math.PI:0;
 }
}
