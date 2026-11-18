import type { HandPoint } from './element-ritual';
import { EncounterChallenge } from './encounter-challenge.ts';
const Y=1.02,Z=-.62,near=(a:HandPoint,b:HandPoint,r=.075)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)<r;
export interface PuzzleSave {chapter:number;encounter:number;phase:number;choice:number;mask:number;fill:number;reserve:number;heat:number;growth:number[];pieces:number[];selected:number;}
/** Later encounters combine learned motions. Every latch is reversible or safely resumable. */
export class PuzzleChallenge {
 complete=false;phase=0;choice=0;mask=0;fill=0;reserve=1;heat=1;pieces=[-1,-1,-1];selected=-1;wind=1;private clock=0;private dwell=0;private target=-1;private legacy=new EncounterChallenge();
 readonly chapter:number;readonly encounter:number;private feedbackClock=0;
 constructor(chapter=0,encounter=0,saved?:PuzzleSave){this.chapter=chapter;this.encounter=encounter;if(chapter===3&&encounter===2)this.pieces=[-1,-1,2];if(saved&&saved.chapter===chapter&&saved.encounter===encounter){this.phase=saved.phase;this.choice=saved.choice;this.mask=saved.mask;this.fill=saved.fill;this.reserve=saved.reserve;this.heat=saved.heat;this.pieces=[...saved.pieces];this.selected=saved.selected;this.growth.splice(0,3,...saved.growth);}this.complete=encounter===0;}
 get mastery(){return this.encounter===2&&(this.chapter===0?this.choice===1:this.chapter===1||this.chapter===2?this.mask===7:this.pieces[0]===2);}
 private say(message:string){this.message=message;this.feedbackClock=2.5;}
 nodeActive(id:string){
  if(this.complete)return false;
  if(this.chapter===0)return this.encounter===1?this.phase===1&&id==='seed':this.phase===0?id==='fork':this.phase===1?id==='direct'||id==='sheltered':this.phase===2?id===(this.choice===1?'seed-shelter':'perch'):id==='lantern';
  if(this.chapter===1)return this.encounter===1?id==='basin':this.phase===0?id==='water-rest':this.phase===1?id==='redirect':id.startsWith('lily-')||id==='pool'||id==='restore';
  if(this.chapter===2)return this.encounter===1?this.phase===1:this.phase===0?id==='receive':id.startsWith('lamp-');
  return this.encounter===1?id===(this.phase===0?'balance-left':'balance-right'):this.phase<2?id.startsWith('piece-')||(this.selected>=0&&id.startsWith('slot-')):id===(this.phase===2?'widen-left':'widen-right');
 }
 restoreLegacyCompletion(){this.complete=true;if(this.encounter===2){if(this.chapter===0){this.choice=2;this.phase=3;}if(this.chapter===1){this.mask=1;this.growth[0]=1;this.fill=.4;this.reserve=.6;this.phase=3;}if(this.chapter===2){this.mask=5;this.heat=1;this.phase=1;}if(this.chapter===3){this.pieces=[0,1,2];this.phase=3;}}}
 get stage(){return this.phase;}
 get stopAt(){return this.complete?1:this.chapter===3?(this.encounter===1?(this.phase===0?.32:.66):.30):.48;}
 get supportLatched(){return this.complete||(this.chapter===3&&this.encounter===1&&this.phase>0);}
 snapshot():PuzzleSave{return {chapter:this.chapter,encounter:this.encounter,phase:this.phase,choice:this.choice,mask:this.mask,fill:this.fill,reserve:this.reserve,heat:this.heat,growth:[...this.growth],pieces:[...this.pieces],selected:this.selected};}
 readonly growth=[0,0,0];message='';
 private at(id:string,hands:HandPoint[],present:boolean[]){const node=puzzleNodes(this.chapter,this.encounter).find(n=>n.id===id);return !!node&&hands.some((h,i)=>present[i]&&near(h,node));}
 private hold(id:string,dt:number,duration=.6){const key=stringKey(id);if(this.target!==key){this.target=key;this.dwell=0;}this.dwell+=dt;if(this.dwell<duration)return false;this.dwell=0;this.target=-1;return true;}
 update(chapter:number,encounter:number,dt:number,hands:HandPoint[],present:boolean[],supported:boolean,assisted:boolean){
  if(this.complete)return;dt=Math.min(.1,Math.max(0,dt));if(!present.some(Boolean)){this.dwell=0;this.target=-1;this.legacy.update(chapter,encounter,0,hands,[false,false],false,assisted);return;}
  this.clock+=dt;this.wind=Math.floor(this.clock/4)%2?1:-1;this.feedbackClock=Math.max(0,this.feedbackClock-dt);if(!this.feedbackClock)this.message='';
  const at=(id:string)=>this.at(id,hands,present),hold=(id:string,d=.6)=>this.hold(id,dt,d);let engaged=false;
  if(chapter===0&&encounter===1){
   if(this.phase===0){this.legacy.update(chapter,encounter,dt,hands,present,supported,assisted);this.choice=this.legacy.choice;if(this.legacy.complete)this.phase=1;return;}
   if(at('seed')){engaged=true;if(hold('seed'))this.complete=true;}
  }
  if(chapter===0&&encounter===2){
   if(this.phase===0&&at('fork')){engaged=true;if(hold('fork'))this.phase=1;}
   else if(this.phase===1){for(const [id,choice] of [['direct',1],['sheltered',2]] as const)if(at(id)){engaged=true;if(hold(id)){this.choice=choice;this.phase=2;}break;}}
   else if(this.phase===2&&at(this.choice===1?'seed-shelter':'perch')){engaged=true;if(hold('route-help',this.choice===1?.8:.65))this.phase=3;}
   else if(this.phase===3&&at('lantern')){engaged=true;if(hold('lantern'))this.complete=true;}
  }
  if(chapter===1&&encounter===1){
   let height=0,count=0;for(let i=0;i<hands.length;i++)if(present[i]&&Math.abs(hands[i].x)<.25&&Math.abs(hands[i].z-(Z+.1))<.2){height+=hands[i].y;count++;}
   if(count){engaged=true;height/=count;
    if(height>Y+.26){this.fill=Math.max(0,this.fill-dt*.3);this.say('Spilled water returns to the pool.');}
    else if(height>Y+.10&&height<Y+.24){this.fill=Math.min(1,this.fill+dt*.35);if(this.fill>.95){this.fill=.72;this.say('The basin overflowed; its water returns to the pool.');}}
    else if(height<Y+.06&&this.fill>=.6){if(this.fill>.9){this.fill=.9;this.say('Excess water flows back into the pool.');}if(hold('settle',.7))this.complete=true;}
   }this.reserve=1-this.fill;
  }
  if(chapter===1&&encounter===2){
   if(this.phase===0&&at('water-rest')){engaged=true;if(hold('water-rest'))this.phase=1;}
   else if(this.phase===1&&at('redirect')){engaged=true;if(hold('redirect'))this.phase=2;}
   else if(this.phase>=2){
    for(let i=0;i<3;i++)if(at(`lily-${i}`)){engaged=true;this.selected=i;const amount=Math.min(dt*.35,this.reserve,(1-this.growth[i])*.4);this.growth[i]+=amount/.4;this.fill+=amount;this.reserve=Math.max(0,1-this.fill);if(this.growth[i]>=.999)this.mask|=1<<i;break;}
    if(at('pool')){engaged=true;if(hold('pool',.5)){this.fill=Math.max(0,this.fill-.4);this.reserve=1-this.fill;}}
    if(at('restore')){engaged=true;if(this.mask&&this.reserve>=.19){if(hold('restore',.7)){this.phase=3;this.complete=true;}}else this.say(this.mask?'The crossing needs some water back in the pool.':'Water needs a lily; Leaf needs water to grow one.');}
   }
  }
  if(chapter===2&&encounter===1){
   if(this.phase===0){this.legacy.update(chapter,encounter,dt,hands,present,supported,assisted);this.choice=this.legacy.choice;if(this.legacy.complete){this.phase=1;this.heat=.6;}return;}
   const resting=at('warm-rest')||at('next-shelter');this.heat=Math.max(.2,Math.min(1,this.heat+dt*(resting?.8:-.12)));
   if(at('next-shelter')){engaged=true;if(this.heat>=.65&&hold('next-shelter',.7))this.complete=true;}
  }
  if(chapter===2&&encounter===2){
   if(this.phase===0&&at('receive')){engaged=true;if(hold('receive'))this.phase=1;}
   else if(this.phase===1){for(let i=0;i<3;i++)if(at(`lamp-${i}`)){
    engaged=true;if(this.mask&(1<<i))this.heat=Math.min(1,this.heat+dt*.8);
    else if(i===2&&!this.mask)this.say('The home lantern is beyond the flame’s current warmth.');
    else if(this.heat<.65)this.say('A lit lantern can restore the flame’s warmth.');
    else if(hold(`lamp-${i}`,.55)){this.mask|=1<<i;this.heat=.25;}
    if((this.mask&4)&&(this.mask&3)&&this.heat>.8)this.complete=true;break;
   }}
  }
  if(chapter===3&&encounter===1){const id=this.phase===0?'balance-left':'balance-right';if(at(id)){engaged=true;if(hold(id,.7)){if(this.phase===0)this.phase=1;else this.complete=true;}}}
  if(chapter===3&&encounter===2){
   if(this.phase<2){
    for(let i=0;i<3;i++)if(at(`piece-${i}`)){engaged=true;if(hold(`piece-${i}`,.45))this.selected=i;break;}
    if(this.selected>=0)for(let i=0;i<3;i++)if(at(`slot-${i}`)){engaged=true;if(hold(`slot-${i}`,.55)){for(let j=0;j<3;j++)if(this.pieces[j]===this.selected)this.pieces[j]=-1;this.pieces[i]=this.selected;this.selected=-1;if(this.pieces[1]===1&&((this.pieces[0]===0&&this.pieces[2]===2)||(this.pieces[0]===2&&this.pieces[2]===0)))this.phase=2;else if(this.pieces.every(p=>p>=0))this.say('The route cannot reach that ledge yet. Stones can be moved.');}break;}
   }else if(!assisted&&present.filter(Boolean).length===2&&Math.abs(hands[0].x-hands[1].x)>.43){engaged=true;if(hold('widen'))this.complete=true;}
   else {const id=this.phase===2?'widen-left':'widen-right';if(at(id)){engaged=true;if(hold(id)){if(this.phase===2)this.phase=3;else this.complete=true;}}}
  }
  if(!engaged){this.dwell=0;this.target=-1;}
 }
 prompt(chapter:number,encounter:number,assisted:boolean){
  if(this.message)return this.message;
  if(chapter===0)return encounter===1?(this.phase?'Bring a hand to the seed. Let it bloom.':'Let it pause, or hold steady to offer a perch.'):["Rest at the fork to see two paths.","Choose the short path or the sheltered branch.",this.choice===1?'Shield the seed from the wind.':'Offer a resting perch on the sheltered branch.','Light the home lantern to guide the seed.'][this.phase];
  if(chapter===1)return encounter===1?(this.fill<.6?'The basin needs a steady water level.':'Enough water. Let the basin settle.'):["Give Water a safe place to rest.","Guide the stream toward Leaf.","One lily makes a way. A whole garden is an extra kindness.","Restore the stream."][this.phase];
  if(chapter===2)return encounter===1?(this.phase?'Carry its warmth to the next shelter. Rest if it dims.':'Shelter above, or cup beneath the spark.'):(this.phase?'Bring warmth home. Every lit lantern offers a refuge.':'Bring one hand close to receive the spark.');
  return encounter===1?(this.phase?'The weight has shifted to the right platform.':'The left platform tips beneath its traveler.'):this.phase>=2?(assisted?(this.phase===2?'Sweep toward the left anchor.':'Now widen toward the right anchor.'):'Spread your hands to anchor the route.'):this.selected<0?'The route needs height, support and a place to rest.':'Place the stone on a ledge. You can move it again.';
 }
}
function stringKey(value:string){let key=0;for(let i=0;i<value.length;i++)key=(key*31+value.charCodeAt(i))|0;return key;}
export interface PuzzleNode extends HandPoint{id:string;kind:string;}
const node=(id:string,x:number,y:number,z:number,kind='ring'):PuzzleNode=>({id,x,y:Y+y,z:Z+z,kind});
const NODES:ReadonlyArray<ReadonlyArray<readonly PuzzleNode[]>>=[
 [[],[node('seed',.04,.14,.09,'seed')],[node('fork',-.12,.12,.1),node('direct',.18,.11,.1),node('sheltered',-.06,.13,-.18),node('seed-shelter',.04,.23,.02),node('perch',.04,.04,-.15),node('lantern',.27,.15,.06,'lamp')]],
 [[],[node('basin',0,.17,.1,'basin')],[node('water-rest',-.12,.05,.12),node('redirect',-.2,.15,-.12),node('lily-0',-.12,.10,-.15,'seed'),node('lily-1',.02,.10,-.15,'seed'),node('lily-2',.17,.10,-.15,'seed'),node('pool',0,.03,.2,'basin'),node('restore',.19,.22,.12)]],
 [[],[node('warm-rest',.04,.08,.04,'lamp'),node('next-shelter',.22,.14,-.12,'lamp')],[node('receive',.0416,.075,.04),node('lamp-0',-.16,.08,.07,'lamp'),node('lamp-1',.10,.2,-.12,'lamp'),node('lamp-2',.27,.1,.08,'lamp')]],
 [[],[node('balance-left',-.16,.01,.08,'stone'),node('balance-right',.16,.09,.08,'stone')],[node('piece-0',-.18,.15,.28,'wide'),node('piece-1',0,.15,.28,'tall'),node('piece-2',.18,.15,.28,'flat'),node('slot-0',-.12,.05,-.06,'slot'),node('slot-1',.04,.10,-.06,'slot'),node('slot-2',.18,.05,-.06,'slot'),node('widen-left',-.22,.03,.08),node('widen-right',.22,.03,.08)]],
];
export function puzzleNodes(chapter:number,encounter:number){return NODES[chapter]?.[encounter]??[];}
export function normalizePuzzle(value:unknown):PuzzleSave|undefined{
 if(!value||typeof value!=='object')return;const v=value as Record<string,unknown>;if(!Number.isInteger(v.chapter)||!Number.isInteger(v.encounter)||(v.chapter as number)<0||(v.chapter as number)>3||!((v.encounter===1)||(v.encounter===2)))return;const number=(key:string,min:number,max:number,fallback=0)=>typeof v[key]==='number'&&Number.isFinite(v[key])?Math.max(min,Math.min(max,v[key] as number)):fallback;
 const chapter=Math.floor(number('chapter',0,3)),encounter=Math.floor(number('encounter',1,2,1)),maxPhase=encounter===1?1:chapter===0||chapter===1||chapter===3?3:1;
 const pieces=Array.isArray(v.pieces)?v.pieces.slice(0,3).map(p=>Number.isInteger(p)&&p>=-1&&p<=2?p:-1):[-1,-1,-1];while(pieces.length<3)pieces.push(-1);for(let i=1;i<3;i++)if(pieces[i]>=0&&pieces.slice(0,i).includes(pieces[i]))pieces[i]=-1;
 const rawGrowth=v.growth;const growth=Array.isArray(rawGrowth)?Array.from({length:3},(_,i)=>typeof rawGrowth[i]==='number'&&Number.isFinite(rawGrowth[i])?Math.max(0,Math.min(1,rawGrowth[i])):0):[0,0,0];
 return {chapter,encounter,growth,phase:Math.floor(number('phase',0,maxPhase)),choice:Math.floor(number('choice',0,2)),mask:Math.floor(number('mask',0,7)),fill:number('fill',0,1),reserve:number('reserve',0,1,1),heat:number('heat',.2,1,1),pieces,selected:Math.floor(number('selected',-1,2,-1))};
}
/** Common ramp profile for both the stone deck and the creature's planted feet. */
const DECK_XS=[-.23,-.12,.014,.066,.18,.23];
const riseNode=(i:number,r:readonly number[])=>i===0||i===5?0:i===1?r[0]:i===4?r[2]:r[1];
export function deckRiseAt(x:number,rises:readonly number[]){
 if(x<=-.23||x>=.23)return 0;const xs=DECK_XS;for(let i=0;i<5;i++)if(x<=xs[i+1]){const a=riseNode(i,rises),b=riseNode(i+1,rises);return a+(b-a)*(x-xs[i])/(xs[i+1]-xs[i]);}return 0;
}
