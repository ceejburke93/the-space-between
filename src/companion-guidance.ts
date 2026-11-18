import type {LastLight} from './last-light';
import type {HandPoint} from './element-ritual';
export type CompanionNeed='water'|'roots'|'shelter'|'dry-hearth'|'warmth'|'rest'|'home';
/** Help follows unsuccessful approaches, never time spent resting or tracking loss. */
export class CompanionGuidance {
 need:CompanionNeed='water';attempts=0;requested=false;
 private armed=false;private inside=false;private dwell=0;private progress=-1;
 get level(){return this.requested?2:this.attempts>=4?2:this.attempts>=2?1:0;}
 reset(){this.need='water';this.attempts=0;this.armed=false;this.inside=false;this.dwell=0;this.progress=-1;}
 update(p:LastLight,dt:number,hands:HandPoint[],present:boolean[]){
  const need:CompanionNeed=p.released?'home':p.ready?'rest':!p.flow?'water':!p.roots?'roots':!p.shelter?'shelter':!p.dryHearth?'dry-hearth':'warmth';
  if(need!==this.need){this.need=need;this.attempts=0;this.armed=false;this.inside=false;this.dwell=0;}
  const progress=p.channel+Number(p.aqueduct)*4+p.anchors*8+Math.floor(p.formation*4)*32;
  if(progress!==this.progress){this.progress=progress;this.attempts=0;this.inside=false;this.dwell=0;}
  let any=false,near=false;
  for(let i=0;i<hands.length;i++)if(present[i]){any=true;const h=hands[i];near||=Math.hypot(h.x,h.y-1.10,h.z+.62)<.38;}
  if(!any){this.inside=false;this.dwell=0;return;}
  if(!near)this.armed=true;
  if(near&&this.armed){this.inside=true;this.dwell+=Math.max(0,Math.min(.1,dt));}
  else if(this.inside){if(this.dwell>=.45&&need!=='home'&&need!=='rest')this.attempts++;this.inside=false;this.dwell=0;}
 }
 text(p:LastLight,desktop=false){
  if(this.level===2){
   if(this.need==='water')return desktop?'Rest a light in Water’s ring; scroll up to lift the stream.':'Rest a hand in Water’s ring, then gently lift the stream.';
   if(this.need==='roots')return desktop?'At Roots, scroll up then down to press the stone.':'Above Roots, lower your hand to press Earth’s stone.';
   if(this.need==='shelter')return 'Rest at each Leaf ring, one after the other.';
   if(this.need==='dry-hearth')return desktop?'Press Garden, or rest low at Roots then scroll up to lift it.':'Press Garden, or rest low at Roots then lift the channel.';
   if(this.need==='warmth')return desktop?'Drag a light in a slow circle around Fire’s ember.':'Trace a slow circle around Fire’s ember.';
   if(this.need==='rest')return 'Let your hand rest outside the garden. The companions will carry the seed.';
   return p.prompt();
  }
  if(this.need==='home')return p.prompt();
  return this.need==='water'?'Water watches the waiting roots.':this.need==='roots'?'The stream is searching for the roots.':this.need==='shelter'?'Leaf reaches toward the last seed.':this.need==='dry-hearth'?'Fire curls away from the stream.':this.need==='warmth'?'Fire waits beside the sheltered seed.':'They look at one another. Ready.';
 }
}
