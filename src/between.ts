import {ChapterRestoration} from './chapter-restoration';
import {ChapterPresence,CHAPTER_BEATS,CHAPTER_RETURNS,CHAPTER_CROSSINGS,homeLight} from './chapter-polish';
import {WorldMemoryVisuals} from './world-memory-visuals';
import {WorldMemory,MEMORY_NODES} from './world-memory';
import {CompanionGuidance} from './companion-guidance';
import {ImmersiveAudio} from './immersive-audio';
import {LastLight,LAST_LIGHT_NODES,type LastLightSave} from './last-light';
import {LastLightVisuals} from './last-light-visuals';
import { WEAVE_VERTICES, weaveIndices, updateWeave } from './bridge-weave';
import { createSystem, UIKitMLAsset, Entity } from '@iwsdk/core';
import * as T from '@iwsdk/core';
import { RuntimeMetrics } from './runtime-metrics';
import { CHAPTERS, ENCOUNTERS, normalizeSave, resumeJourney, earnHomecoming, type JourneySave } from './journey';
import { PuzzleChallenge, puzzleNodes, type PuzzleSave } from './puzzle-challenge';
import { PuzzleVisuals } from './puzzle-visuals';
import { ElementRitual } from './element-ritual';
import { JourneyVisuals } from './journey-visuals';
import { Biomes } from './biomes';
import { ElementVisuals } from './element-visuals';
import assets from './assets';
import { HandMeeting } from './hand-meeting';
import { MenuPress } from './menu-press';
import { TrustScore } from './trust-score';
import { GameplayCapture } from './gameplay-capture';
import { CareFeedback } from './care-feedback';
import { Awakenings } from './awakenings';
import { Heartbeats } from './heartbeats';
import { LivingWorld } from './living-world';
import { CosmicOpening } from './cosmic-opening';

const GOLD=0xf6d58c, Y=1.02, Z=-.62;
const leftEdge=new T.Vector3(-.23,Y,Z), rightEdge=new T.Vector3(.23,Y,Z);
const developerToolsRequested=()=>{const query=new URLSearchParams(location.search);return query.get('devtools')==='1'||query.get('capture')==='1';};
const developerDiagnosticsRequested=()=>new URLSearchParams(location.search).get('devtools')==='1';
const $=(id:string)=>document.getElementById(id)!;
const clamp=T.MathUtils.clamp;
export class BetweenSystem extends createSystem({}) {
 private chapterPresence=new ChapterPresence();private restoration!:ChapterRestoration;private noPuzzleHands=[false,false];private board!:PuzzleVisuals;private savedPuzzle:PuzzleSave|undefined;private kindnesses=0;
 private meeting=new HandMeeting();private metLeaf=false;private leafChoice=0;private fireChoice=0;private meetingPoint=new T.Vector3();private music=new TrustScore();private leafHabitat!:T.Group;private phraseWoven=false;
 private logicSum=0;private logicPeak=0;private logicFrames=0;private logicClock=0;
 private care=new CareFeedback();private awakenings!:Awakenings;private gestureProgress=0;private feedbackMilestone=0;
 private memoryVisuals!:WorldMemoryVisuals;private memoryStage=-1;private memoryPlane=new T.Plane(new T.Vector3(0,0,1),.70);private memoryEarthPlane=new T.Plane(new T.Vector3(0,0,1),.48);private guidance=new CompanionGuidance();private lastLight=new LastLight();private savedLastLight:LastLightSave|undefined;private worldLegacy:LastLightSave|undefined;private lastLightVisuals!:LastLightVisuals;private finalHandsPresent=[false,false];private lastLightStage=-1;private lastLightChannel=0;private lastLightRaised=false;private controlProjection=new T.Vector3();private finalControlDrag=false;private finalControlPlane=new T.Plane(new T.Vector3(0,0,1),.34);
 private get lastLightActive(){return !this.menuOpen&&this.chapter===3&&this.encounter===2&&this.completed===12&&this.endingClock>=5;}
 private get memoryActive(){return this.lastLightActive&&this.lastLight.time>=24;}
 private heart=new Heartbeats();private living!:LivingWorld;private seedBloomed=false;private finaleSeen=false;private handOpen=[false,false];private giftChimed=false;private finaleNote=-1;
 private spatialJourney!:UIKitMLAsset;private journeyOpen=false;private journeyLevel=-1;
 private biomes!:Biomes;
 private chapter=0;private encounter=0;private completed=0;private challenge=new PuzzleChallenge();private savedChallenge=false;private endingClock=0;private savedEnding=0;private savedRitual=false;private completionAwarded=false;
 private ritual=new ElementRitual();private journeyVisuals!:JourneyVisuals;private elementVisuals!:ElementVisuals;
 private arms:T.Group[]=[];private confidence=0;private reaction='curious';private nextButton!:HTMLButtonElement;private spatialHomecoming!:UIKitMLAsset;
 private spatialSettings!:UIKitMLAsset;private spatialDiscovery!:UIKitMLAsset;private settingsOpen=false;
 private reducedReach=false;private assisted=false;private heightOffset=0;private controllerInput=false;
 private sourceTracked=[false,false];private assistHand=-1;private assistReturning=false;private assistDwell=0;
 private metrics!:Entity;
 private statsClock=0;private statsFrames=0;private statsCalls=0;private statsTriangles=0;private statsSlow=0;
 private spatialMenu!:UIKitMLAsset;private spatialPause!:UIKitMLAsset;private wasImmersive=false;
 private handInitialized=[false,false];private catchHold=0;private shoreLatched=[false,false];
 private bridgeEnds=[new T.Vector3(),new T.Vector3()];private palmTarget=new T.Vector3();
 private opening!:CosmicOpening;private menuOpen=false;private menuHold=0;private saveClock=0;
 private menuElement!:HTMLElement;private menuButton!:HTMLButtonElement;
 private savedProgress=0;private saveAvailable=true;
 private readonly saveKey='the-space-between-save-v1';
 private habitatSoundPoint=new T.Vector3();private habitatStreamPoint=new T.Vector3();private habitatBrushPlayed=0;
 private anchors:T.Mesh[]=[]; private lanterns:T.Group[]=[]; private wisps:T.Sprite[]=[];
 private homeGlow!:T.PointLight; private halo!:T.Sprite; private ambiance:AudioBufferSourceNode|null=null;
 private root=new T.Group(); private creature=new T.Group(); private eyes=new T.Group();
 private torso=new T.Group(); private feet:T.Mesh[]=[]; private legs:T.Mesh[]=[];
 private guideCanvas=document.createElement('canvas'); private guideTexture!:T.CanvasTexture;
 private vrGuide!:T.Sprite; private guideKey=''; private guidePreview=false;
 private restartHold=0; private desktopFrame='';
 private anticipation=0; private arrived=0; private walking=false;
 private hands=[new T.Vector3(-.1,Y,Z+.12),new T.Vector3(.1,Y,Z+.12)];
 private markers:T.Group[]=[]; private wovenBridge!:T.LineSegments<T.BufferGeometry,T.LineBasicMaterial>;private weavePositions=new Float32Array(WEAVE_VERTICES*3);private deckHeightAt=(x:number)=>this.bridgeHeight(x); private motes!:T.Points;
 private homes:T.Group[]=[]; private progress=0; private steady=0; private phase='thread';
 private woven=false; private trackingLost=0; private drag=-1; private lastTime=0;
 private ray=new T.Raycaster(); private pointer=new T.Vector2(); private plane=new T.Plane(new T.Vector3(0,1,0),-Y);private firePlane=new T.Plane(new T.Vector3(0,0,1),-(Z+.1));
 private audioScene:ImmersiveAudio|null=null;private audioPositions=[new T.Vector3(),new T.Vector3(),new T.Vector3(),new T.Vector3()];private audioListenerPosition=new T.Vector3();private audioForward=new T.Vector3();private audioUp=new T.Vector3();private audioOrientation=new T.Quaternion();
 private sound:AudioContext|null=null; private soundOn=false; private noteIndex=0;private openingCueStage=0;
 private audioCuePoint=new T.Vector3();
 private label!:T.Sprite; private sparkle=T.MathUtils.seededRandom;
 init(){
  const metricsObject=new T.Group();metricsObject.name='runtime-metrics';this.metrics=this.world.createTransformEntity(metricsObject).addComponent(RuntimeMetrics);
  this.scene.background=new T.Color('#102532'); this.scene.fog=new T.FogExp2('#102532',.07);
  this.scene.add(new T.HemisphereLight(0xc6e5de,0x314953,1.55));
  const light=new T.DirectionalLight(0xffd9a0,2.6); light.position.set(-2,4,2);this.scene.add(light);
  this.scene.add(this.root);
  this.makeIsland(-.48,false);this.makeIsland(.48,true);this.makeCreature();this.makeBridge();
  for(const edge of [leftEdge,rightEdge]){const ring=new T.Mesh(new T.TorusGeometry(.035,.002,6,40),new T.MeshBasicMaterial({color:GOLD,transparent:true,opacity:.65}));ring.rotation.x=-Math.PI/2;ring.position.copy(edge);ring.position.y+=.008;this.root.add(ring);this.anchors.push(ring);}
  for(let i=0;i<2;i++){const g=new T.Group(); const ring=new T.Mesh(new T.TorusGeometry(.035,.0018,6,40),new T.MeshBasicMaterial({color:GOLD,transparent:true,opacity:.8}));ring.rotation.x=-Math.PI/2;g.add(ring); const dot=new T.Mesh(new T.SphereGeometry(.008,10,8),new T.MeshBasicMaterial({color:0xfff1cb}));g.add(dot);this.root.add(g);this.markers.push(g);}
  // One draw call for the floating lights instead of 85 individual meshes.
  const motePositions:number[]=[],moteColors:number[]=[];
  for(let i=0;i<85;i++){motePositions.push((this.sparkle()-.5)*3,.5+this.sparkle()*1.5,-this.sparkle()*2);const color=new T.Color(i%3?GOLD:0x9edac6).multiplyScalar(.4+this.sparkle()*.6);moteColors.push(color.r,color.g,color.b);}
  const moteGeometry=new T.BufferGeometry();moteGeometry.setAttribute('position',new T.Float32BufferAttribute(motePositions,3));moteGeometry.setAttribute('color',new T.Float32BufferAttribute(moteColors,3));
  this.motes=new T.Points(moteGeometry,new T.PointsMaterial({size:.005,vertexColors:true,transparent:true,opacity:.65,depthWrite:false}));this.root.add(this.motes);

  this.label=this.makeLabel('A LITTLE TRUST GOES A LONG WAY');this.label.position.set(0,1.37,Z-.18);this.root.add(this.label);
  this.makeAtmosphere();this.biomes=new Biomes(this.scene,this.root,this.homes,this.motes,this.wisps);this.journeyVisuals=new JourneyVisuals(this.root);this.journeyVisuals.attachCargo(this.torso);this.elementVisuals=new ElementVisuals(this.root,this.torso,this.eyes);this.leafHabitat=assets['leaf-habitat'].clone(true);this.root.add(this.leafHabitat);this.living=new LivingWorld(this.root);this.restoration=new ChapterRestoration(this.root);this.awakenings=new Awakenings(this.root);this.board=new PuzzleVisuals(this.root);this.lastLightVisuals=new LastLightVisuals(this.root);this.memoryVisuals=new WorldMemoryVisuals(this.root);this.makeVRGuide();this.installInput();this.reset();
  this.makeMenu();this.setupSpatialControls();if(developerToolsRequested())new GameplayCapture(this.renderer.domElement,()=>{if(this.soundOn)this.activateSound();return this.soundOn?this.audioScene?.captureStream():undefined;});
  const save=this.readSave();this.worldLegacy=save.worldLegacy;this.savedLastLight=save.lastLight;this.lastLight=new LastLight(save.lastLight);this.savedPuzzle=save.puzzle;this.kindnesses=save.kindnesses??0;this.leafChoice=save.leafChoice??0;this.fireChoice=save.fireChoice??0;this.metLeaf=!!save.metLeaf;this.savedProgress=save.progress;this.soundOn=save.sound;this.reducedReach=save.reducedReach;this.assisted=save.assisted;this.chapter=save.chapter;this.encounter=save.encounter;this.completed=save.completed;this.savedChallenge=save.challengeDone;this.savedEnding=save.endingTime;this.savedRitual=save.ritualDone;this.seedBloomed=!!save.seedBloomed;this.finaleSeen=!!save.finaleSeen;this.heart.reset(this.seedBloomed,this.finaleSeen);
  $('sound').textContent=this.soundOn?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(this.soundOn));
  this.opening=new CosmicOpening(this.scene,()=>{this.writeSave();this.showMenu();});this.openingCueStage=this.opening.stageIndex;
  if(save.visited){this.opening.dismiss();this.showMenu();}else{this.root.visible=false;this.scene.background=new T.Color('#02050c');}
  document.addEventListener('visibilitychange',()=>{this.audioScene?.setFocused(document.visibilityState==='visible');if(document.visibilityState==='hidden'&&!this.opening.active)this.persistProgress();});
  this.cleanupFuncs.push(()=>{this.audioScene?.dispose();void this.sound?.close();});
  window.addEventListener('pagehide',()=>{if(!this.opening.active)this.persistProgress();});
 }
 private mesh(geo:T.BufferGeometry,color:number,parent:T.Object3D,x=0,y=0,z=0){const m=new T.Mesh(geo,new T.MeshStandardMaterial({color,roughness:.8}));m.position.set(x,y,z);parent.add(m);return m;}
 private makeIsland(x:number,home:boolean){
  const g=new T.Group();g.position.set(x,Y-.025,Z);g.userData.authoredHabitat=true;this.root.add(g);this.homes.push(g);
  for(let i=0;i<4;i++){const habitat=assets[(['island-grass','island-water','island-fire','island-earth'] as const)[i]].clone(true);habitat.name='Habitat'+i;habitat.visible=i===0;g.add(habitat);}
  const point=new T.PointLight(GOLD,home?.004:.002,.5);point.position.set(-.035,.09,.03);g.add(point);if(home)this.homeGlow=point;
 }
 private makeCreature(){
  this.root.add(this.creature);this.creature.add(this.torso);
  this.torso.add(assets['leaf-hero'].clone(true));
  for(const side of [-1,1]){const arm=new T.Group();arm.userData.common=true;arm.position.set(side*.025,.04,0);this.mesh(new T.CapsuleGeometry(.003,.021,3,5),0xa8c58a,arm,0,-.01,0);this.torso.add(arm);this.arms.push(arm);}
  this.torso.add(this.eyes);for(const x of [-.011,.011]){this.mesh(new T.SphereGeometry(.0055,12,8),0x172c2b,this.eyes,x,.046,.022);this.mesh(new T.SphereGeometry(.0018,6,6),0xffefcd,this.eyes,x-.001,.048,.027);}
  for(let i=0;i<2;i++){
   const foot=this.mesh(new T.SphereGeometry(.011,12,8),0x638764,this.root);foot.scale.set(.75,.4,1.35);this.feet.push(foot);
   const leg=this.mesh(new T.CylinderGeometry(.003,.004,1,8),0x73916a,this.root);this.legs.push(leg);
  }
  const glow=this.mesh(new T.SphereGeometry(.013,10,8),GOLD,this.torso,0,.025,.017);(glow.material as T.MeshStandardMaterial).emissive.setHex(GOLD);(glow.material as T.MeshStandardMaterial).emissiveIntensity=1.5;
  for(const x of [-1,1]){const points=[new T.Vector3(x*.01,.07,0),new T.Vector3(x*.02,.095,.005),new T.Vector3(x*.028,.1,.01)];const line=new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:0xaacb8e}));this.torso.add(line);this.mesh(new T.SphereGeometry(.003,6,5),GOLD,this.torso,x*.028,.1,.01);}
 }
 /** Same sampled profile for the woven deck and the planted feet. */
 private bridgeHeight(x:number){
  if(this.chapter===3)return this.encounter>0&&this.board?this.board.heightAt(x):Y+.003;
  if(x<leftEdge.x||x>rightEdge.x)return Y-.0005;
  const t=(x-leftEdge.x)/(rightEdge.x-leftEdge.x)*32;
  const lo=Math.floor(t),f=t-lo;
  return Y+.003-T.MathUtils.lerp(Math.sin(lo/32*Math.PI),Math.sin(Math.min(lo+1,32)/32*Math.PI),f)*.018;
 }
 private creatureDepth(x:number){return this.board&&this.encounter===2&&(this.chapter===0||this.chapter===1)?this.board.depthAt(x):Z;}
 private animateCreature(dt:number,time:number,ready:boolean){
  const end=this.progress>=1;
  let x=T.MathUtils.lerp(-.28,.39,this.progress);
  if(this.chapter===0&&this.progress===0&&!this.woven&&this.heart.meeting===1)x-=Math.sin(Math.min(1,this.heart.meetingTime/1.2)*Math.PI)*.035;
  const waterRest=this.chapter===1&&this.encounter===2&&this.challenge.phase>=1&&!this.challenge.complete;if(waterRest)x=-.12;
  const distance=this.progress*.67,stride=.045;
  if(this.chapter===1){this.meetingPoint.set(x,this.bridgeHeight(x),waterRest?Z+.12:this.creatureDepth(x));this.creature.position.lerp(this.meetingPoint,1-Math.exp(-dt*7));}else this.creature.position.set(x,this.bridgeHeight(x),this.creatureDepth(x));
  this.creature.scale.setScalar(1);
  const offered=this.chapter===0&&this.meeting.stage>=1&&this.meeting.stage<=3?this.meeting.owner:this.chapter===2?this.ritual.circlingHand:-1;
  let attention=offered>=0&&this.sourceTracked[offered]?this.hands[offered]:undefined;
  let nearest=2;
  for(let i=0;i<this.hands.length;i++){
   if(!this.sourceTracked[i])continue;
   const distance=this.hands[i].distanceTo(this.creature.position);
   if(distance<nearest){nearest=distance;if(offered<0||!this.sourceTracked[offered])attention=this.hands[i];}
  }
  this.confidence+=((ready?.65+this.care.quality*.35:this.woven?.5:.15)-this.confidence)*(1-Math.exp(-dt*2));
  this.reaction=this.chapter===0&&this.progress===0&&!this.woven&&this.heart.meeting===1?'shy':end?'grateful':this.walking?'brave':this.progress>0&&!ready?'waiting':nearest<.2?'noticing':this.anticipation>0?'testing':'curious';
  this.arms.forEach((arm,i)=>{const side=i===0?-1:1;arm.rotation.z=end&&this.endingClock<4?side*(.8+Math.sin(this.endingClock*5)*.25):this.walking?side*.2+Math.sin(distance/stride*Math.PI*2+i*Math.PI)*.12:side*(.25+this.confidence*.25);});
  for(const part of [...this.feet,...this.legs])part.visible=this.chapter===0||this.chapter===3;
  // Only the torso breathes and leans; its feet stay planted on the deck.
  this.torso.position.y=.011+(this.walking?Math.sin(distance/stride*Math.PI*4)*.0015:Math.sin(time*2.4)*.0006);
  this.torso.rotation.z=this.walking?Math.sin(distance/stride*Math.PI*2)*.025:0;
  this.torso.rotation.x=!ready&&this.progress>0&&!end?.12:nearest<.16&&!end?-.08:0;
  if(this.chapter===1||this.chapter===2)this.torso.position.y+=.018+Math.sin(time*2)*.003;
  if(!end){
   if(this.chapter===0&&this.heart.meeting>=2&&!this.woven)this.arms[1].rotation.x=-.8;
   else {this.arms[0].rotation.x=0;this.arms[1].rotation.x=0;}
   if(this.chapter===1){const ripple=Math.sin(time*3)*(.035-this.care.calm*.025);this.torso.scale.set(1+ripple,1-ripple,1);this.torso.rotation.z=Math.sin(time*3)*(.1-this.care.calm*.08);}
   else this.torso.scale.setScalar(1);
   if(this.chapter===2){this.torso.rotation.x=ready?-.08-this.care.quality*.06:.1;this.torso.scale.setScalar(.95+this.care.quality*.09);}
   if(this.chapter===3){this.torso.rotation.x=!ready?.19:.1-this.care.quality*.06;this.arms.forEach((arm,i)=>arm.rotation.z=(i?1:-1)*(ready?.55:.12));}
  }else{this.torso.scale.setScalar(1);this.arms[0].rotation.x=0;this.arms[1].rotation.x=0;}
  if(!end&&!this.walking){
   if(this.chapter===0&&this.woven){const test=Math.max(0,Math.sin(time*1.3));this.arms[1].rotation.x=-test*.45;this.torso.rotation.x=.06+test*.08;}
   if(this.chapter===1&&waterRest){this.torso.rotation.z=-.16;this.arms[1].rotation.x=-.6;this.reaction='sharing';}
   if(this.chapter===2&&!ready){this.arms[0].rotation.z=-.12;this.arms[1].rotation.z=.12;this.torso.scale.set(.92,.87,.92);this.reaction='sheltering';}
   if(this.chapter===3){this.arms[0].rotation.x=this.arms[1].rotation.x=ready?-.35:.3;this.reaction=ready?'supporting':'bracing';}
  }
  if(!end&&!this.walking&&this.encounter>0&&this.progress>=this.challenge.stopAt-.001&&!this.challenge.complete){
   if(this.chapter===0){this.reaction=this.challenge.phase===0?'resting':'offering';this.torso.rotation.x=this.challenge.phase===0?.06:-.08;this.arms[1].rotation.x=this.challenge.phase===0?-.12:-.55;}
   if(this.chapter===1){this.reaction=this.encounter===1?'settling':'sharing';this.torso.rotation.z=this.encounter===1?Math.sin(time*1.3)*.02:-.10;}
   if(this.chapter===2){this.reaction=this.challenge.heat<.65?'sheltering':'offering';this.torso.scale.setScalar(.88+this.challenge.heat*.12);}
   if(this.chapter===3){this.reaction='supporting';this.torso.rotation.x=.14;}
  }
  // A small held breath before contact, then a relaxed open posture. Feet remain independent.
  if(this.chapter===0&&this.encounter===0&&this.progress===0&&!this.woven&&this.meeting.stage>0&&this.meeting.stage<5){
   const trust=this.meeting.stage===3;
   this.reaction=trust?'trusting':this.meeting.stage===1?'hesitant':this.meeting.stage===2?'testing':'settling';
   this.torso.rotation.x=trust?-.12:this.meeting.stage===1?.10*(1-this.meeting.contact):.035;
   this.arms[0].rotation.z=trust?-.5:-.18;
   this.arms[1].rotation.x=trust?-.55:-.25*this.meeting.contact;
  }
  // Let each creature visibly answer the gesture that is forming its path.
  if(!end&&!this.woven&&this.progress===0&&attention){
   const response=this.ritual.formation;
   if(this.chapter===1&&this.ritual.stage===1){
    this.torso.position.y+=.012*response;
    this.arms[1].rotation.x=-.25-.45*response;this.reaction='rising';
   }else if(this.chapter===2&&response>0){
    this.torso.scale.setScalar(.92+.12*response);
    this.arms[1].rotation.z=.12+.35*response;this.reaction='warming';
   }else if(this.chapter===3&&this.ritual.stage===1){
    this.torso.rotation.x=.12+.12*response;
    this.arms[1].rotation.x=.15+.35*response;this.reaction='pressing';
   }
  }
  let yaw=Math.atan2(.01,this.creatureDepth(x+.01)-this.creatureDepth(x));
  if(end){this.arrived+=dt;const head=this.root.worldToLocal(this.player.head.getWorldPosition(new T.Vector3()));yaw=Math.atan2(head.x-x,head.z-this.creature.position.z);this.torso.rotation.x=-Math.sin(Math.min(this.arrived,1)*Math.PI)*.13;}
  else if(this.meeting.stage===3&&this.chapter===0&&this.progress===0&&!this.woven){const head=this.root.worldToLocal(this.player.head.getWorldPosition(this.meetingPoint));yaw=Math.atan2(head.x-x,head.z-this.creature.position.z);this.torso.rotation.x=-.12;}
  else if(attention&&this.progress===0&&this.anticipation===0){yaw=Math.atan2(attention.x-x,attention.z-this.creature.position.z);}
  this.creature.rotation.y+=Math.atan2(Math.sin(yaw-this.creature.rotation.y),Math.cos(yaw-this.creature.rotation.y))*(1-Math.exp(-dt*4));
  this.eyes.position.x=!end&&!this.walking&&attention?clamp((attention.x-x)*.018,-.004,.004):0;
  // A short, smooth blink; a softer gaze after arrival. Feet remain independent.
  const blinkPhase=(time+this.chapter*.63)%4.8,blink=Math.max(0,1-Math.abs(blinkPhase-.12)/.12);
  this.eyes.scale.y=(end?.92:1)*(1-blink*.88);
  this.creature.updateWorldMatrix(true,true);
  for(let i=0;i<2;i++){
   let fx=x, lift=0;
   if(this.progress>0&&!end){
    const offset=i*.5,cycle=distance/stride+offset,whole=Math.floor(cycle),phase=cycle-whole;
    // Stance occupies 60% of a step. Its world position is fixed while the body advances.
    const planted=-.28+(whole-offset)*stride+.012;
    const swing=clamp((phase-.6)/.4,0,1),smooth=swing*swing*(3-2*swing);
    fx=planted+stride*smooth;lift=Math.sin(swing*Math.PI)*.009;
   }else if(this.progress===0&&this.anticipation>0&&i===1){
    const reach=clamp(this.anticipation/.65,0,1);
    fx=x+.055*reach;lift=Math.sin(reach*Math.PI)*.012;
    if(this.anticipation>.8&&this.anticipation<1.25)lift+=Math.sin((this.anticipation-.8)/.45*Math.PI)*.003;
   }
   const foot=this.feet[i];foot.position.set(fx,this.bridgeHeight(fx)+.0044+lift,this.creatureDepth(fx)+(i===0?-.014:.014));
   if(i===1&&this.chapter===0&&this.progress===0&&!this.woven&&this.meeting.contact>0){this.meetingPoint.set(this.meeting.target.x,this.meeting.target.y,this.meeting.target.z);foot.position.lerp(this.meetingPoint,this.meeting.contact);}
   foot.rotation.y=Math.atan2(.01,this.creatureDepth(fx+.01)-this.creatureDepth(fx));
   const hip=this.root.worldToLocal(this.creature.localToWorld(new T.Vector3(i===0?-.014:.014,.026,0)));
   const ankle=foot.position.clone().add(new T.Vector3(0,.003,0));
   const leg=this.legs[i],direction=hip.clone().sub(ankle);
   leg.position.copy(hip).add(ankle).multiplyScalar(.5);leg.scale.y=direction.length();
   leg.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize());
  }
 }
 private makeBridge(){
  const geometry=new T.BufferGeometry(),colors=new Float32Array(WEAVE_VERTICES*3),color=new T.Color();
  for(let i=0;i<WEAVE_VERTICES;i++){color.setHex(i<66?0xffe7ab:0xcdbf8b);colors[i*3]=color.r;colors[i*3+1]=color.g;colors[i*3+2]=color.b;}
  geometry.setAttribute('position',new T.BufferAttribute(this.weavePositions,3).setUsage(T.DynamicDrawUsage));geometry.setAttribute('color',new T.BufferAttribute(colors,3));geometry.setIndex(new T.BufferAttribute(weaveIndices(),1));
  this.wovenBridge=new T.LineSegments(geometry,new T.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.5}));this.wovenBridge.name='woven-bridge';this.root.add(this.wovenBridge);
 }
 private makeLabel(text:string){const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d')!;ctx.font='24px sans-serif';ctx.textAlign='center';ctx.fillStyle='#cfc69e';ctx.fillText(text,512,72);const s=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c),transparent:true,depthTest:false}));s.scale.set(.65,.081,1);return s;}
 private glowTexture(){
  const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d')!;
  const gradient=ctx.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(255,242,192,.9)');gradient.addColorStop(.18,'rgba(255,219,145,.35)');gradient.addColorStop(1,'rgba(255,210,130,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);return new T.CanvasTexture(c);
 }
 private makeAtmosphere(){
  const texture=this.glowTexture();
  const glow=(parent:T.Object3D,x:number,y:number,z:number,size:number,color:number,opacity:number)=>{
   const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,color,transparent:true,opacity,depthWrite:false,blending:T.AdditiveBlending}));sprite.position.set(x,y,z);sprite.scale.setScalar(size);parent.add(sprite);return sprite;
  };
  // A still horizon and distant silhouettes establish depth without moving the viewer.
  const moon=glow(this.root,-1.7,1.5,-5.5,2.0,0xa8d8d2,.45);
  this.mesh(new T.SphereGeometry(.21,24,16),0xd0e1c8,this.root,-1.7,1.5,-5.5);
  for(let layer=0;layer<3;layer++){
   const vertices:number[]=[],z=-4-layer*2;
   const ridge=Array.from({length:65},(_,i)=>new T.Vector3((i-32)*.3,-.12+Math.sin(i*.22+layer)*.34+Math.sin(i*.09+layer*2)*.40,z));
   for(let i=0;i<ridge.length-1;i++){const a=ridge[i],b=ridge[i+1];vertices.push(a.x,a.y,z,b.x,b.y,z,a.x,-3,z,b.x,b.y,z,b.x,-3,z,a.x,-3,z);}
   const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
   const mountain=new T.Mesh(geometry,new T.MeshBasicMaterial({color:[0x1a3740,0x203f48,0x24434c][layer],side:T.DoubleSide}));mountain.userData.backdrop=true;this.root.add(mountain);
  }
  // Dim, transparent cloud bands separate the near islands from the valley.
  const cloudCanvas=document.createElement('canvas');cloudCanvas.width=256;cloudCanvas.height=64;const ctx=cloudCanvas.getContext('2d')!;
  const gradient=ctx.createRadialGradient(128,32,0,128,32,128);gradient.addColorStop(0,'rgba(157,197,194,.3)');gradient.addColorStop(1,'rgba(157,197,194,0)');ctx.fillStyle=gradient;ctx.scale(1,.25);ctx.fillRect(0,0,256,256);
  const cloudTexture=new T.CanvasTexture(cloudCanvas);
  for(let i=0;i<10;i++){const w=new T.Sprite(new T.SpriteMaterial({map:cloudTexture,transparent:true,depthWrite:false,opacity:.35}));w.position.set((this.sparkle()-.5)*7,.1+this.sparkle()*.4,-1.5-this.sparkle()*4);w.scale.set(2+this.sparkle()*2,.35,1);w.userData.origin=w.position.x;this.root.add(w);this.wisps.push(w);}
  this.halo=glow(this.root,-.28,Y+.025,Z,.14,GOLD,.3);
  // Marks of light on each shore reinforce the exact interaction locations.
  for(const edge of [leftEdge,rightEdge])glow(this.root,edge.x,edge.y+.008,edge.z,.12,GOLD,.3);
 }
 private setupSpatialControls(){
  this.spatialMenu=this.world.requireSceneObject<UIKitMLAsset>('spatial-menu');
  this.spatialJourney=this.world.requireSceneObject<UIKitMLAsset>('spatial-journey');this.spatialJourney.document.setTargetDimensions(.4,.56);this.spatialJourney.visible=false;
  this.spatialHomecoming=this.world.requireSceneObject<UIKitMLAsset>('spatial-homecoming');this.spatialHomecoming.document.setTargetDimensions(.32,.07);this.spatialHomecoming.visible=false;
  this.spatialPause=this.world.requireSceneObject<UIKitMLAsset>('spatial-pause');
  this.spatialSettings=this.world.requireSceneObject<UIKitMLAsset>('spatial-settings');
  this.spatialDiscovery=this.world.requireSceneObject<UIKitMLAsset>('spatial-discovery');
  this.spatialSettings.document.setTargetDimensions(.4,.68);
  this.spatialDiscovery.document.setTargetDimensions(.32,.08);
  this.spatialMenu.document.setTargetDimensions(.4,.56);
  this.spatialPause.document.setTargetDimensions(.09,.058);
  this.spatialMenu.visible=false;this.spatialPause.visible=false;this.spatialSettings.visible=false;this.spatialDiscovery.visible=false;
  const listen=(panel:UIKitMLAsset,id:string,action:()=>void)=>{
   const element=panel.requireElementById(id);
   const press=new MenuPress();
   const activate=()=>{if(!panel.visible)return;this.metrics?.setValue(RuntimeMetrics,'uiAction',id);this.activateSound();this.chime();action();};
   const down=(event:{pointerType:string;pointerId:number})=>{if(event.pointerType==='touch'&&panel.visible)press.down(event.pointerId,performance.now());};
   const up=(event:{pointerType:string;pointerId:number})=>{if(event.pointerType==='touch'&&press.release(event.pointerId,performance.now()))activate();};
   const cancel=()=>press.cancel();
   const click=(event:{pointerId:number})=>{if(press.click(event.pointerId,performance.now()))activate();};
   element.addEventListener('pointerdown',down);element.addEventListener('pointerup',up);element.addEventListener('pointercancel',cancel);element.addEventListener('click',click);
   this.cleanupFuncs.push(()=>{element.removeEventListener('pointerdown',down);element.removeEventListener('pointerup',up);element.removeEventListener('pointercancel',cancel);element.removeEventListener('click',click);});
  };
  listen(this.spatialHomecoming,'next-chapter',()=>this.continueJourney());
  listen(this.spatialMenu,'settings',()=>{this.settingsOpen=true;});
  listen(this.spatialSettings,'settings-back',()=>{this.settingsOpen=false;});
  listen(this.spatialSettings,'place-world',()=>this.placeWorld());
  listen(this.spatialSettings,'raise-world',()=>this.adjustHeight(.05));
  listen(this.spatialSettings,'lower-world',()=>this.adjustHeight(-.05));
  listen(this.spatialSettings,'reach-toggle',()=>this.toggleComfort('reach'));
  listen(this.spatialSettings,'assist-toggle',()=>this.toggleComfort('assist'));
  listen(this.spatialSettings,'guidance-toggle',()=>this.toggleGuidance());
  listen(this.spatialDiscovery,'explore',()=>this.opening.advance());
  listen(this.spatialDiscovery,'skip-intro',()=>this.opening.finish());
  listen(this.spatialMenu,'play',()=>this.playFromMenu(true));
  listen(this.spatialMenu,'revisit',()=>this.revisitPlanet());
  listen(this.spatialMenu,'restart',()=>{this.journeyOpen=true;this.journeyLevel=-1;this.syncJourneyPicker();});
  listen(this.spatialJourney,'journey-back',()=>{if(this.journeyLevel<0)this.journeyOpen=false;else{this.journeyLevel=-1;this.syncJourneyPicker();}});
  for(let i=0;i<4;i++)listen(this.spatialJourney,`journey-${i}`,()=>{if(this.journeyLevel<0){if(i*3>this.completed)return;this.journeyLevel=i;this.syncJourneyPicker();}else if(i<3&&this.journeyLevel*3+i<=this.completed)this.selectEncounter(this.journeyLevel,i);});
  listen(this.spatialMenu,'sound-toggle',()=>{this.soundOn=!this.soundOn;this.activateSound();$('sound').textContent=this.soundOn?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(this.soundOn));this.writeSave();this.syncSpatialLabels();});
  listen(this.spatialMenu,'exit',()=>this.world.exitXR());
  listen(this.spatialPause,'menu',()=>{this.persistProgress();this.showMenu();});
  this.syncSpatialLabels();
 }
 private toggleGuidance(){this.guidance.requested=!this.guidance.requested;this.guideKey='';this.syncSpatialLabels();}
 private revisitPlanet(){this.menuOpen=false;this.menuElement.hidden=true;document.body.classList.remove('at-menu');this.root.visible=false;this.scene.background=new T.Color('#02050c');this.openingCueStage=0;this.opening.setLegacy(this.worldLegacy?.released?(this.worldLegacy.aqueduct?1:2):0);this.opening.replay();}
 private nextLabel(){const ordinal=this.chapter*3+this.encounter;return ordinal===11?'Rest in your garden':`Next: ${ENCOUNTERS[Math.floor((ordinal+1)/3)][(ordinal+1)%3]}`;}
 private continueJourney(){if(this.chapter===3&&this.encounter===2&&this.completed===12){this.heart.finaleTime=24;this.finaleSeen=true;this.writeSave();}const next=this.chapter*3+this.encounter+1;if(next>=12)this.showMenu();else this.selectEncounter(Math.floor(next/3),next%3);}
 private primaryLabel(){if(this.savedProgress<1&&(this.savedProgress>0||this.savedRitual))return 'Continue';return this.completed===12?'Visit your garden':this.completed>this.chapter*3+this.encounter?`Next: ${ENCOUNTERS[Math.floor(this.completed/3)][this.completed%3]}`:this.savedProgress>0?'Continue':'Play';}
 private syncSpatialLabels(){
  const legacy=!!this.worldLegacy?.released;this.spatialMenu?.getElementById('revisit')?.setProperties({display:legacy?'flex':'none'});this.spatialMenu?.document.setTargetDimensions(.4,legacy?.64:.56);
  this.spatialMenu?.getElementById('journey-label')?.setProperties({text:`${CHAPTERS[this.chapter].element.toUpperCase()} / ${this.encounter+1} of 3`});
  this.spatialHomecoming?.getElementById('next-label')?.setProperties({text:this.nextLabel()});
  this.spatialSettings?.getElementById('reach-label')?.setProperties({text:`Reduced reach: ${this.reducedReach?'on':'off'}`});
  this.spatialSettings?.getElementById('assist-label')?.setProperties({text:`One-hand assist: ${this.assisted?'on':'off'}`});
  this.spatialSettings?.getElementById('guidance-label')?.setProperties({text:`Puzzle guidance: ${this.guidance.requested?'explicit':'gentle'}`});
  const guidance=document.getElementById('desktop-guidance');if(guidance)guidance.textContent=`Puzzle guidance: ${this.guidance.requested?'explicit':'gentle'}`;
  const reach=document.getElementById('desktop-reach'),assist=document.getElementById('desktop-assist');
  if(reach)reach.textContent=`Reduced reach: ${this.reducedReach?'on':'off'}`;if(assist)assist.textContent=`One-hand assist: ${this.assisted?'on':'off'}`;
  this.spatialMenu?.getElementById('restart')?.setProperties({display:'flex'});
  this.spatialMenu?.getElementById('play-label')?.setProperties({text:this.primaryLabel()});
  this.spatialMenu?.getElementById('sound-label')?.setProperties({text:this.soundOn?'Sound on':'Sound off'});
 }
 private selectEncounter(chapter:number,encounter:number){
  if(chapter*3+encounter>this.completed)return;
  if(chapter===3&&encounter===2)this.savedLastLight=undefined;this.chapter=chapter;this.encounter=encounter;this.savedProgress=0;this.savedRitual=false;this.savedEnding=0;this.savedChallenge=false;this.savedPuzzle=undefined;this.playFromMenu(false);
 }
 private syncJourneyPicker(){
  this.spatialJourney.getElementById('journey-title')?.setProperties({text:this.journeyLevel<0?'Your little world':CHAPTERS[this.journeyLevel].element.toUpperCase()});
  for(let i=0;i<4;i++){
   const hidden=this.journeyLevel>=0&&i===3,ordinal=this.journeyLevel<0?i*3:this.journeyLevel*3+i;
   this.spatialJourney.getElementById(`journey-${i}`)?.setProperties({display:hidden?'none':'flex'});
   if(!hidden)this.spatialJourney.getElementById(`journey-option-${i}`)?.setProperties({text:(this.journeyLevel<0?CHAPTERS[i].element.toUpperCase():ENCOUNTERS[this.journeyLevel][i])+ (ordinal>this.completed?' / locked':ordinal<this.completed?' / restored':'')});
  }
 }
 private toggleComfort(option:'reach'|'assist'){
  if(option==='reach'){this.reducedReach=!this.reducedReach;if(this.renderer.xr.isPresenting)this.placeWorld();}
  else{this.assisted=!this.assisted;this.assistHand=-1;this.assistReturning=false;this.assistDwell=0;}
  this.writeSave();this.syncSpatialLabels();
 }
 private adjustHeight(delta:number){
  const next=clamp(this.heightOffset+delta,-.25,.25);this.root.position.y+=next-this.heightOffset;this.heightOffset=next;this.root.updateMatrixWorld(true);
  this.handInitialized=[false,false];this.steady=0;
 }
 private placeWorld(){
  if(!this.renderer.xr.isPresenting)return;
  const head=this.player.head.getWorldPosition(new T.Vector3());
  const forward=this.player.head.getWorldDirection(new T.Vector3()).negate();forward.y=0;
  if(forward.lengthSq()<.001)forward.set(0,0,-1);else forward.normalize();
  const scale=this.reducedReach?.62:.8;
  this.root.scale.setScalar(scale);this.root.quaternion.setFromUnitVectors(new T.Vector3(0,0,-1),forward);
  const center=new T.Vector3(0,Y,Z).multiplyScalar(scale).applyQuaternion(this.root.quaternion);
  this.root.position.copy(head).addScaledVector(forward,this.reducedReach?.42:.55).sub(center);
  this.root.position.y-=this.reducedReach?.34:.4;this.root.position.y+=this.heightOffset;
  this.root.updateMatrixWorld(true);this.handInitialized=[false,false];this.steady=0;
  this.opening?.group.position.copy(this.root.position);this.opening?.group.quaternion.copy(this.root.quaternion);this.opening?.group.scale.copy(this.root.scale);
  this.placeSpatialControls();
 }
 private placeSpatialControls(){
  const head=this.player.head.getWorldPosition(new T.Vector3());
  const forward=this.player.head.getWorldDirection(new T.Vector3()).negate();forward.y=0;if(forward.lengthSq()<.001)forward.set(0,0,-1);else forward.normalize();
  const right=new T.Vector3().crossVectors(forward,new T.Vector3(0,1,0)).normalize();
  this.spatialMenu.position.copy(head).addScaledVector(forward,.44);this.spatialMenu.position.y=head.y-.12;
  this.spatialMenu.lookAt(head.x,this.spatialMenu.position.y,head.z);
  this.spatialJourney.position.copy(this.spatialMenu.position);this.spatialJourney.quaternion.copy(this.spatialMenu.quaternion);
  this.spatialSettings.position.copy(this.spatialMenu.position);this.spatialSettings.quaternion.copy(this.spatialMenu.quaternion);
  this.spatialDiscovery.position.copy(head).addScaledVector(forward,.5);this.spatialDiscovery.position.y=head.y-.2;this.spatialDiscovery.lookAt(head.x,this.spatialDiscovery.position.y,head.z);
  this.spatialHomecoming.position.copy(head).addScaledVector(forward,.5);this.spatialHomecoming.position.y=head.y-.28;this.spatialHomecoming.lookAt(head.x,this.spatialHomecoming.position.y,head.z);
  this.spatialPause.position.copy(head).addScaledVector(forward,.5).addScaledVector(right,.29);this.spatialPause.position.y=head.y-.07;
  this.spatialPause.quaternion.copy(this.spatialMenu.quaternion);
 }
 private updateSpatialControls(){
  const immersive=this.renderer.xr.isPresenting;
  if(immersive&&!this.wasImmersive){this.placeWorld();this.placeSpatialControls();}this.wasImmersive=immersive;
  this.spatialMenu.visible=immersive&&this.menuOpen&&!this.settingsOpen&&!this.journeyOpen&&!this.opening?.active;
  this.spatialJourney.visible=immersive&&this.menuOpen&&this.journeyOpen&&!this.opening?.active;
  this.spatialSettings.visible=immersive&&this.menuOpen&&this.settingsOpen&&!this.opening?.active;
  this.spatialDiscovery.visible=immersive&&!!this.opening?.active;
  this.spatialHomecoming.visible=immersive&&!this.memoryActive&&!this.menuOpen&&!this.opening?.active&&this.endingClock>=5&&(!(this.completed===12&&this.chapter===3&&this.encounter===2)||this.heart.finaleTime>=24);
  this.spatialPause.visible=immersive&&!this.menuOpen&&!this.opening?.active;
 }
 private readSave():JourneySave{try{return normalizeSave(JSON.parse(localStorage.getItem(this.saveKey)||'null'));}catch{return normalizeSave(null);}}
 private writeSave(){if(this.lastLight.released&&this.lastLight.time>=24)this.worldLegacy=this.lastLight.snapshot();this.savedLastLight=this.lastLight.snapshot();try{localStorage.setItem(this.saveKey,JSON.stringify({version:3,worldLegacy:this.worldLegacy,visited:true,progress:this.savedProgress,sound:this.soundOn,reducedReach:this.reducedReach,assisted:this.assisted,chapter:this.chapter,encounter:this.encounter,challengeDone:this.menuOpen?this.savedChallenge:this.challenge.complete,completed:this.completed,ritualDone:this.menuOpen?this.savedRitual:this.woven,endingTime:this.menuOpen?this.savedEnding:this.endingClock,seedBloomed:this.seedBloomed,finaleSeen:this.finaleSeen,leafChoice:this.leafChoice,fireChoice:this.fireChoice,metLeaf:this.metLeaf,puzzle:this.menuOpen?this.savedPuzzle:this.challenge.snapshot(),kindnesses:this.kindnesses,lastLight:this.savedLastLight}));this.saveAvailable=true;}catch{this.saveAvailable=false;}}
 private persistProgress(){if(!this.menuOpen){this.savedProgress=this.progress;this.savedRitual=this.woven;this.savedEnding=this.endingClock;this.savedChallenge=this.challenge.complete;this.savedPuzzle=this.challenge.snapshot();}this.writeSave();}
 private makeMenu(){
  const menu=document.createElement('section');menu.id='planet-menu';menu.setAttribute('aria-label','The Space Between main menu');menu.hidden=true;
  menu.innerHTML='<div class="menu-kicker">WELCOME TO THEIR LITTLE WORLD</div><h2>The Space Between</h2><p>Four elements. A world to care for.</p><button id="play-game">Play</button><button id="new-game">Restart this chapter</button><button id="replay-opening">Replay the discovery</button><small id="save-note"></small>';
  const comfort=document.createElement('details');comfort.innerHTML='<summary>Comfort & controls</summary><button id="desktop-reach">Reduced reach: off</button><button id="desktop-assist">One-hand assist: off</button><button id="desktop-guidance">Puzzle guidance: gentle</button><p>In VR, place the world while looking forward. Use Raise or Lower to suit your seat. Assisted play: hold one hand or controller near the left ring, then the right ring. Rest at either ring to resume.</p>';
  menu.append(comfort);
  const journey=document.createElement('details');journey.innerHTML='<summary>Your journey</summary><div id="journey-list"></div>';menu.append(journey);
  if(developerDiagnosticsRequested()){const stats=document.createElement('details');stats.innerHTML='<summary>Performance check</summary><small id="performance-readout">Collecting frame measurements…</small>';menu.append(stats);}
  document.body.append(menu);this.menuElement=menu;
  $('desktop-guidance').onclick=()=>this.toggleGuidance();$('desktop-reach').onclick=()=>this.toggleComfort('reach');$('desktop-assist').onclick=()=>this.toggleComfort('assist');
  $('play-game').onclick=()=>this.playFromMenu(true);$('new-game').onclick=()=>this.playFromMenu(false);
  $('replay-opening').onclick=()=>this.revisitPlanet();
  this.nextButton=document.createElement('button');this.nextButton.id='next-journey';this.nextButton.hidden=true;this.nextButton.onclick=()=>this.continueJourney();document.querySelector('.actions')!.append(this.nextButton);
  const button=document.createElement('button');button.textContent='Menu';button.id='return-menu';button.onclick=()=>{this.persistProgress();this.showMenu();};document.querySelector('.actions')!.append(button);this.menuButton=button;
 }
 private showMenu(){
  this.menuOpen=true;document.body.classList.remove('garden-rest');this.settingsOpen=false;this.journeyOpen=false;this.syncSpatialLabels();if(this.renderer.xr.isPresenting)this.placeSpatialControls();this.guidePreview=false;this.menuHold=0;this.animateCreature(0,this.lastTime,false);this.root.visible=true;this.scene.background=new T.Color('#102532');this.menuElement.hidden=false;document.body.classList.add('at-menu');this.guideKey='';
  const list=$('journey-list');list.replaceChildren();for(let c=0;c<4;c++){for(let e=0;e<3;e++){const choice=document.createElement('button');choice.textContent=ENCOUNTERS[c][e]+(c*3+e<this.completed?' / restored':c*3+e>this.completed?' / locked':'');choice.disabled=c*3+e>this.completed;choice.onclick=()=>this.selectEncounter(c,e);list.append(choice);}}
  $('play-game').textContent=this.primaryLabel();this.nextButton.hidden=true;
  $('new-game').hidden=this.savedProgress<=0;$('replay-opening').textContent=this.worldLegacy?.released?'Revisit your planet':'Replay the discovery';$('save-note').textContent=this.saveAvailable?(this.savedProgress>0&&this.savedProgress<1?`Crossing saved at ${Math.round(this.savedProgress*100)}% · on this browser`:`${CHAPTERS[this.chapter].element.toUpperCase()} / ${ENCOUNTERS[this.chapter][this.encounter]} / ${this.completed} of 12 kindnesses`):'Saving is unavailable in this browser session';
 }
 private playFromMenu(resume:boolean){
  const restored=resume?resumeJourney({version:3,worldLegacy:this.worldLegacy,visited:true,progress:this.savedProgress,sound:this.soundOn,reducedReach:this.reducedReach,assisted:this.assisted,chapter:this.chapter,encounter:this.encounter,completed:this.completed,ritualDone:this.savedRitual,challengeDone:this.savedChallenge,endingTime:this.savedEnding,seedBloomed:this.seedBloomed,finaleSeen:this.finaleSeen,leafChoice:this.leafChoice,fireChoice:this.fireChoice,metLeaf:this.metLeaf,puzzle:this.savedPuzzle,kindnesses:this.kindnesses,lastLight:this.savedLastLight}):null;
  if(restored){this.chapter=restored.chapter;this.encounter=restored.encounter;}
  const progress=restored?.progress??0,ritual=restored?.ritualDone??false,ending=restored?.endingTime??0,challenge=restored?.challengeDone??false;
  this.menuOpen=false;this.settingsOpen=false;this.journeyOpen=false;this.menuElement.hidden=true;document.body.classList.remove('at-menu');this.reset();if(!resume)this.heart.finaleTime=0;
  this.challenge=new PuzzleChallenge(this.chapter,this.encounter,restored?.puzzle);this.challenge.complete=!!challenge||this.encounter===0;
  if(challenge&&(!restored?.puzzle||restored.puzzle.chapter!==this.chapter||restored.puzzle.encounter!==this.encounter))this.challenge.restoreLegacyCompletion();this.progress=progress;this.woven=!!ritual||progress>0;this.ritual.complete=this.woven;this.ritual.formation=this.woven?1:0;this.endingClock=ending;this.care.restore(this.woven);this.care.reveal=ending>=5&&this.completed>=(this.chapter+1)*3?1:0;this.completionAwarded=this.completed>this.chapter*3+this.encounter;
  if(progress>0){this.anticipation=1.6;this.phase=progress===1?'home':'wait';}
  this.activateSound();this.savedProgress=this.progress;this.savedRitual=this.woven;this.savedEnding=this.endingClock;this.writeSave();this.syncSpatialLabels();this.guideKey='';
 }
 private makeVRGuide(){
  this.guideCanvas.width=1536;this.guideCanvas.height=512;
  this.guideTexture=new T.CanvasTexture(this.guideCanvas);
  this.vrGuide=new T.Sprite(new T.SpriteMaterial({map:this.guideTexture,transparent:true,depthTest:true}));
  this.vrGuide.scale.set(.96,.32,1);this.vrGuide.position.set(0,1.4,-1.1);
  this.vrGuide.visible=false;this.root.add(this.vrGuide);
  const button=document.createElement('button');button.id='guide-preview';button.textContent='Preview VR guide';
  button.setAttribute('aria-pressed','false');document.querySelector('.actions')!.append(button);
  button.onclick=()=>{this.guidePreview=!this.guidePreview;button.setAttribute('aria-pressed',String(this.guidePreview));button.textContent=this.guidePreview?'Hide VR guide':'Preview VR guide';this.guideKey='';};
 }
 private updateGuide(tracked:boolean){
  const immersive=this.renderer.xr.isPresenting;
  this.vrGuide.visible=immersive||this.guidePreview;
  (this.vrGuide.material as T.SpriteMaterial).opacity=this.heart.finaleTime>=24&&this.completed===12&&this.chapter===3&&this.encounter===2&&this.progress===1&&!this.guidance.requested?0:1;
  document.body.classList.toggle('crossing',this.phase==='cross');
  this.label.visible=false;
  const prompt=this.currentPrompt(tracked);$('instruction').textContent=prompt;
  if(!this.vrGuide.visible)return;
  let title=this.currentPrompt(tracked);
  const key=title;
  if(this.guideKey===key)return;this.guideKey=key;
  const ctx=this.guideCanvas.getContext('2d')!;ctx.clearRect(0,0,1536,512);
  ctx.fillStyle=['rgba(13,34,29,.94)','rgba(15,35,51,.94)','rgba(51,29,36,.94)','rgba(34,42,38,.94)'][this.chapter];ctx.beginPath();ctx.roundRect(6,140,1524,232,35);ctx.fill();
  ctx.textAlign='center';ctx.fillStyle='#faf5e7';ctx.font='52px sans-serif';ctx.fillText(title,768,274,1420);
  this.guideTexture.needsUpdate=true;
 }
 private frameDesktop(){
  if(this.renderer.xr.isPresenting)return;
  const key=window.innerWidth+'x'+window.innerHeight;
  if(this.desktopFrame===key)return;this.desktopFrame=key;
  const narrow=window.innerWidth<=900,aspect=window.innerWidth/window.innerHeight;
  const distance=narrow?Math.max(2.25,.87/(Math.tan(T.MathUtils.degToRad(24))*aspect)):2.0;
  const x=0;
  this.camera.position.set(x,1+distance*.30,Z+distance*.954);
  this.camera.lookAt(x,1,Z);this.camera.updateProjectionMatrix();
 }
 private installInput(){
  const canvas=this.renderer.domElement;
  const pick=(e:PointerEvent)=>{if(this.drag<0)this.finalControlDrag=false;const r=canvas.getBoundingClientRect();this.pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.ray.setFromCamera(this.pointer,this.camera);const p=new T.Vector3();if(this.memoryActive&&!this.lastLight.memory.blooming){if(this.drag<0){let best=.075;for(const n of MEMORY_NODES){if(n.id==='memory-water'&&this.lastLight.memory.watered||n.id==='memory-fire'&&(!this.lastLight.memory.watered||this.lastLight.memory.warmed)||n.id==='memory-earth'&&this.lastLight.memory.supported)continue;this.meetingPoint.set(n.x,n.y,n.z);const d=this.ray.ray.distanceToPoint(this.meetingPoint);if(d<best){best=d;p.copy(this.meetingPoint);this.finalControlDrag=n.id==='memory-earth';}}if(best<.075)return p;}return this.ray.ray.intersectPlane(this.finalControlDrag?this.memoryEarthPlane:this.memoryPlane,p)?p:null;}if(this.lastLightActive&&!this.lastLight.released&&(this.drag<0||this.finalControlDrag||!(this.lastLight.shelter&&this.lastLight.dryHearth))){let best=.07,hit=false,control=false;for(const n of LAST_LIGHT_NODES){if(this.lastLight.shelter&&this.lastLight.dryHearth&&!n.id.startsWith('channel-'))continue;this.meetingPoint.set(n.x,n.y,n.z);const d=this.ray.ray.distanceToPoint(this.meetingPoint);if(d<best){best=d;p.copy(this.meetingPoint);hit=true;control=n.id.startsWith('channel-');}}if(hit){if(this.drag<0)this.finalControlDrag=control;return p;}}if(this.encounter>0&&!this.challenge.complete&&this.progress>=this.challenge.stopAt-.001){let best=.07;let hit=false;for(const n of puzzleNodes(this.chapter,this.encounter))if(this.challenge.nodeActive(n.id)){this.meetingPoint.set(n.x,n.y,n.z);const d=this.ray.ray.distanceToPoint(this.meetingPoint);if(d<best){best=d;p.copy(this.meetingPoint);hit=true;}}if(hit)return p;}return this.ray.ray.intersectPlane(this.lastLightActive&&this.finalControlDrag?this.finalControlPlane:this.chapter===2||this.lastLightActive?this.firePlane:this.plane,p)?p:null;};
  canvas.addEventListener('pointerdown',e=>{if(this.renderer.xr.isPresenting||this.menuOpen||this.opening?.active)return;const p=pick(e);if(!p)return;const d=this.hands.map(h=>h.distanceTo(p));this.drag=d[0]<d[1]?0:1;if(this.chapter!==2&&!this.lastLightActive&&!(this.encounter>0&&this.progress>=this.challenge.stopAt-.001&&!this.challenge.complete))p.y=this.hands[this.drag].y;else p.y=clamp(p.y,Y-.23,Y+.38);if(this.assisted)this.assistHand=this.drag;this.hands[this.drag].copy(p);canvas.setPointerCapture(e.pointerId);this.activateSound();});
  canvas.addEventListener('pointermove',e=>{if(this.drag<0)return;const p=pick(e);if(p){p.x=clamp(p.x,-.6,.6);p.z=clamp(p.z,Z-.2,Z+.35);if(this.chapter!==2&&!this.lastLightActive&&!(this.encounter>0&&this.progress>=this.challenge.stopAt-.001&&!this.challenge.complete))p.y=this.hands[this.drag].y;else p.y=clamp(p.y,Y-.23,Y+.38);this.hands[this.drag].copy(p);}});
  canvas.addEventListener('pointerup',()=>this.drag=-1);canvas.addEventListener('pointercancel',()=>this.drag=-1);
  canvas.addEventListener('wheel',event=>{if(this.renderer.xr.isPresenting||this.menuOpen||this.opening?.active||((this.chapter===0||this.chapter===2)&&!(this.encounter>0&&this.progress>=this.challenge.stopAt-.001&&!this.challenge.complete)&&this.progress<1))return;event.preventDefault();const indices=this.assisted?[this.drag>=0?this.drag:1]:[0,1];for(const i of indices)this.hands[i].y=clamp(this.hands[i].y-event.deltaY*.0006,Y-.23,Y+.38);},{passive:false});
  $('reset').onclick=()=>{if(this.opening?.active)this.opening.finish();else this.reset();};$('sound').onclick=()=>{this.soundOn=!this.soundOn;this.activateSound();$('sound').textContent=this.soundOn?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(this.soundOn));if(!this.opening?.active)this.persistProgress();};
  let vrSupported=false;
  if(navigator.xr){void navigator.xr.isSessionSupported('immersive-vr').then(supported=>{vrSupported=supported;}).catch(()=>{});}
  $('toast').setAttribute('role','status');$('toast').setAttribute('aria-live','polite');
  $('xr').onclick=()=>{
   this.activateSound();
   if(!navigator.xr||!vrSupported){$('toast').textContent='VR needs a compatible headset browser or the Meta XR emulator. This desktop preview supports mouse practice—use Preview VR guide to see the in-world instructions.';return;}
   $('toast').textContent='Opening VR… Please respond to your browser’s VR prompt.';
   try{this.world.launchXR();window.setTimeout(()=>{if(!this.renderer.xr.isPresenting)$('toast').textContent='VR did not start. Check that your headset is connected and the browser allows immersive VR. You can continue in desktop practice.';},10000);}catch(e){$('toast').textContent='VR could not start. Check your headset connection and browser support.';console.error(e);}
  };
  this.renderer.xr.addEventListener('sessionstart',()=>{this.statsClock=0;this.statsFrames=0;this.statsCalls=0;this.statsTriangles=0;this.statsSlow=0;document.body.classList.add('xr');$('toast').textContent='';this.drag=-1;this.handInitialized=[false,false];this.steady=0;this.catchHold=0;});this.renderer.xr.addEventListener('sessionend',()=>{if(!this.opening?.active)this.persistProgress();this.statsClock=0;this.statsFrames=0;this.statsCalls=0;this.statsTriangles=0;this.statsSlow=0;document.body.classList.remove('xr');this.desktopFrame='';this.root.position.set(0,0,0);this.root.quaternion.identity();this.root.scale.setScalar(1);this.root.updateMatrixWorld(true);this.opening.group.position.set(0,0,0);this.opening.group.quaternion.identity();this.opening.group.scale.setScalar(1);this.wasImmersive=false;this.handInitialized=[false,false];this.steady=0;});
 }
 private activateSound(){
  this.music.setEnabled(this.soundOn);
  if(this.soundOn){this.sound??=new AudioContext();this.audioScene??=new ImmersiveAudio(this.sound);this.music.output(this.sound,this.audioScene.music);void this.sound.resume();}
  this.audioScene?.setEnabled(this.soundOn);
 }
 private updateAudio(dt:number,time:number){
  const audio=this.audioScene;if(!audio)return;
  const viewer=this.renderer.xr.isPresenting?this.player.head:this.camera;viewer.getWorldPosition(this.audioListenerPosition);viewer.getWorldQuaternion(this.audioOrientation);this.audioForward.set(0,0,-1).applyQuaternion(this.audioOrientation);this.audioUp.set(0,1,0).applyQuaternion(this.audioOrientation);audio.listen(this.audioListenerPosition,this.audioForward,this.audioUp);
  const final=this.lastLightActive;
  this.root.updateWorldMatrix(true,false);
  for(let i=0;i<4;i++){const p=this.audioPositions[i];if(final)p.set(i===3?(this.lastLight.channel===1?-.18:.18):0,i===0?1.17:1.05,i===1?-.8:i===2?-.52:i===3?-.34:-.62);else p.copy(this.creature.position);p.applyMatrix4(this.root.matrixWorld);}
  const session=this.renderer.xr.getSession();audio.setFocused(document.visibilityState==='visible'&&(!session||session.visibilityState==='visible'));
  audio.update(dt,time,this.chapter,!this.menuOpen&&!this.opening?.active,final,this.lastLight.flow,this.lastLight.warmth,this.lastLight.shelter,this.walking,this.audioPositions);
  this.habitatStreamPoint.set(0,.10,-1.05).applyMatrix4(this.root.matrixWorld);
  audio.habitat(this.habitatStreamPoint,this.chapter,!this.menuOpen&&!this.opening?.active);
  if(this.biomes&&this.habitatBrushPlayed!==this.biomes.brushSerial){this.habitatBrushPlayed=this.biomes.brushSerial;this.habitatSoundPoint.copy(this.biomes.brushPosition).applyMatrix4(this.root.matrixWorld);audio.brush(this.chapter,this.habitatSoundPoint,this.biomes.response);}
  this.metrics.setValue(RuntimeMetrics,'habitatRustles',audio.brushes);this.metrics.setValue(RuntimeMetrics,'habitatWaterGain',audio.habitatGain);
  this.metrics.setValue(RuntimeMetrics,'audioPeak',audio.peak);this.metrics.setValue(RuntimeMetrics,'audioRms',audio.rms);this.metrics.setValue(RuntimeMetrics,'audioEmitters',audio.activeEmitters);this.metrics.setValue(RuntimeMetrics,'audioListenerX',audio.context.listener.positionX.value);this.metrics.setValue(RuntimeMetrics,'audioListenerZ',audio.context.listener.positionZ.value);this.metrics.setValue(RuntimeMetrics,'audioForwardX',audio.context.listener.forwardX.value);this.metrics.setValue(RuntimeMetrics,'audioWaterX',audio.waterX);this.metrics.setValue(RuntimeMetrics,'audioWaterZ',audio.waterZ);this.metrics.setValue(RuntimeMetrics,'audioVoices',audio.voices);
 }
 private chime(high=false,panPosition?:number){if(!this.soundOn||!this.sound)return;const ctx=this.sound;const t=ctx.currentTime;const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.value=[1,.84,1.26,.67][this.chapter]*(high?2:1)*[392,440,523.25,587.33,659.25][this.noteIndex++%5];gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.04,t+.03);gain.gain.exponentialRampToValueAtTime(.001,t+.7);const pan=ctx.createStereoPanner();pan.pan.value=panPosition??T.MathUtils.lerp(-.55,.55,this.progress);osc.connect(gain).connect(pan).connect(this.audioScene?.ui??this.music.output(ctx));osc.start(t);osc.stop(t+.8);osc.onended=()=>{osc.disconnect();gain.disconnect();pan.disconnect();};}
 private updateHeartbeats(dt:number,time:number){
  let nearest=Infinity,giftHand=-1;
  for(let i=0;i<2;i++)if(this.sourceTracked[i]){const distance=this.hands[i].distanceTo(this.living.giftPosition);if(distance<nearest){nearest=distance;giftHand=i;}}
  const noticing=this.sourceTracked.some((present,i)=>present&&this.hands[i].distanceTo(this.creature.position)<.22);
  this.heart.notice(dt,noticing,this.chapter===0&&this.progress===0&&!this.woven);
  const bloomed=this.heart.gift(dt,this.chapter===0&&this.encounter===0&&this.progress===1&&this.endingClock>2,nearest,giftHand>=0?this.hands[giftHand].y:0,giftHand>=0&&this.handOpen[giftHand]);
  if(bloomed){this.seedBloomed=true;this.chime(true);this.writeSave();}
  if(this.heart.giftStage===1&&!this.giftChimed){this.giftChimed=true;this.chime();}
  const finalActive=this.lastLightActive;
  for(let i=0;i<2;i++)this.finalHandsPresent[i]=this.sourceTracked[i]&&(!this.assisted||i===this.assistHand);
  if(finalActive){if(this.lastLight.released&&this.lastLight.time>=23.9&&this.lastLight.memory.arrival===0&&this.worldLegacy?.memory)this.lastLight.memory=new WorldMemory(this.worldLegacy.memory);this.lastLight.update(dt,this.hands,this.finalHandsPresent);this.guidance.update(this.lastLight,dt,this.hands,this.finalHandsPresent);if(this.lastLight.channel!==this.lastLightChannel||this.lastLight.aqueduct!==this.lastLightRaised){this.lastLightChannel=this.lastLight.channel;this.lastLightRaised=this.lastLight.aqueduct;this.chime(false,this.lastLight.channel===1?-.45:.45);this.audioScene?.care(3,this.audioPositions[3]);}this.heart.finaleTime=this.lastLight.released?this.lastLight.time:0;if(this.lastLight.stage!==this.lastLightStage){this.lastLightStage=this.lastLight.stage;$('step').textContent='THE LAST LIGHT';this.chime();const element=this.lastLight.stage<=2?1:this.lastLight.stage===3?0:this.lastLight.stage===4?2:3;this.audioScene?.care(element,this.audioPositions[element]);this.persistProgress();}}
  this.lastLightVisuals.update(this.lastLight,finalActive,dt,time,this.guidance);this.memoryVisuals.update(this.lastLight,finalActive,time);
  if(this.memoryActive){const m=this.lastLight.memory,stage=Number(m.watered)+Number(m.warmed)+Number(m.supported)+Number(m.growth>=6);if(stage!==this.memoryStage){this.memoryStage=stage;if(stage>0)this.chime(true);this.persistProgress();}this.metrics.setValue(RuntimeMetrics,'memoryWatered',m.watered);this.metrics.setValue(RuntimeMetrics,'memoryWarmed',m.warmed);this.metrics.setValue(RuntimeMetrics,'memorySupported',m.supported);this.metrics.setValue(RuntimeMetrics,'memoryGrowth',m.growth);this.metrics.setValue(RuntimeMetrics,'memoryLesson',m.lesson);}
  if(finalActive&&this.lastLight.time>=24&&!this.finaleSeen){this.finaleSeen=true;this.writeSave();}
  if(finalActive){const beat=Math.min(4,Math.floor(Math.max(0,this.heart.finaleTime-3)/3));if(beat!==this.finaleNote){this.finaleNote=beat;this.chime(beat===4);}this.nextButton.hidden=true;}
  document.body.classList.toggle('explicit-memory',this.memoryActive&&this.guidance.requested);
  document.body.classList.toggle('garden-rest',finalActive&&this.heart.finaleTime>=24);
  this.living.update(this.chapter,this.completed,this.woven,this.progress,this.endingClock,time,this.hands,this.sourceTracked,this.heart.giftStage,this.heart.bloomTime,finalActive?(this.lastLight.released?Math.max(.01,this.lastLight.time):.01):0,this.gestureProgress,this.care.quality,this.care.completion,this.assisted,this.assistReturning,this.ritual.stage,this.leafChoice,this.fireChoice,this.encounter);
  if(finalActive){this.living.coordinateLastLight(this.lastLight,time,this.guidance);this.living.rememberTogether(this.lastLight,time);}
  this.music.finale(this.heart.finaleTime,finalActive&&this.soundOn);
  if(finalActive&&!this.renderer.xr.isPresenting){this.controlProjection.set(-.18,1.08,-.34).project(this.camera);this.metrics.setValue(RuntimeMetrics,'rootControlX',(this.controlProjection.x+1)*this.renderer.domElement.clientWidth/2);this.metrics.setValue(RuntimeMetrics,'rootControlY',(1-this.controlProjection.y)*this.renderer.domElement.clientHeight/2);}
  const activeHand=this.hands[this.assistHand<0?1:this.assistHand];this.metrics.setValue(RuntimeMetrics,'activeHandX',activeHand.x);this.metrics.setValue(RuntimeMetrics,'activeHandY',activeHand.y);this.metrics.setValue(RuntimeMetrics,'activeHandZ',activeHand.z);
  this.metrics.setValue(RuntimeMetrics,'companionFireCurl',this.living.fireCurl);this.metrics.setValue(RuntimeMetrics,'companionEarthReach',this.living.earthReach);
  this.metrics.setValue(RuntimeMetrics,'guidanceLevel',this.guidance.level);this.metrics.setValue(RuntimeMetrics,'guidanceAttempts',this.guidance.attempts);this.metrics.setValue(RuntimeMetrics,'companionNeed',this.guidance.need);
  this.metrics.setValue(RuntimeMetrics,'lastLightAqueduct',this.lastLight.aqueduct);this.metrics.setValue(RuntimeMetrics,'lastLightStage',this.lastLight.stage);this.metrics.setValue(RuntimeMetrics,'lastLightChannel',this.lastLight.channel);this.metrics.setValue(RuntimeMetrics,'lastLightFormation',this.lastLight.formation);
  this.metrics.setValue(RuntimeMetrics,'puzzlePhase',this.challenge.phase);this.metrics.setValue(RuntimeMetrics,'puzzleMask',this.challenge.mask);this.metrics.setValue(RuntimeMetrics,'puzzleFill',this.challenge.fill);this.metrics.setValue(RuntimeMetrics,'puzzleReserve',this.challenge.reserve);this.metrics.setValue(RuntimeMetrics,'puzzleStop',this.challenge.stopAt);this.metrics.setValue(RuntimeMetrics,'puzzleSelected',this.challenge.selected);this.metrics.setValue(RuntimeMetrics,'puzzleHeat',this.challenge.heat);
  this.metrics.setValue(RuntimeMetrics,'contactError',this.meeting.contact>.99?this.feet[1].position.distanceTo(this.meetingPoint.set(this.meeting.target.x,this.meeting.target.y,this.meeting.target.z)):-1);this.metrics.setValue(RuntimeMetrics,'handMeeting',this.meeting.stage);this.metrics.setValue(RuntimeMetrics,'leafChoice',this.leafChoice);this.metrics.setValue(RuntimeMetrics,'fireChoice',this.fireChoice);
  this.awakenings.update(this.chapter,this.care.reveal,time);
  this.metrics.setValue(RuntimeMetrics,'gestureProgress',this.gestureProgress);this.metrics.setValue(RuntimeMetrics,'careQuality',this.care.quality);this.metrics.setValue(RuntimeMetrics,'calm',this.care.calm);this.metrics.setValue(RuntimeMetrics,'awakening',this.care.reveal);
  this.metrics.setValue(RuntimeMetrics,'meeting',this.heart.meeting);this.metrics.setValue(RuntimeMetrics,'giftStage',this.heart.giftStage);this.metrics.setValue(RuntimeMetrics,'finaleTime',this.heart.finaleTime);
 }
 private currentPrompt(tracked:boolean){
  if(this.memoryActive&&this.guidance.requested){const m=this.lastLight.memory;return m.blooming?'Watch what Leaf passes on.':!m.watered?(this.renderer.xr.isPresenting?'Lift a little water beside the drooping seed.':'At the drooping seed, scroll up to lift water.'):!m.warmed?'Trace a slow circle around the little seed.':this.renderer.xr.isPresenting?'Press gently above the small stone beside Earth.':'At Earth’s small stone, scroll up, then down.';}
  if(this.progress>=1&&this.completed===12&&this.chapter===3&&this.encounter===2)return this.guidance.text(this.lastLight,!this.renderer.xr.isPresenting);
  if(this.progress>=1&&this.chapter===0&&this.encounter===0&&!this.seedBloomed&&this.endingClock>2)return this.heart.giftStage===0?'A seed, for you. Bring one hand close.':this.renderer.xr.isPresenting?'Open your hand, or gently lift the seed.':'Lift the seed light with the wheel.';
  if(this.progress>=1)return this.endingClock<2?'Home. You can rest your hands now.':this.endingClock<5?CHAPTER_RETURNS[this.chapter][this.encounter]:this.encounter===2?CHAPTERS[this.chapter].ending:CHAPTER_RETURNS[this.chapter][this.encounter];
  if(this.chapter===0&&this.encounter===0&&this.progress===0&&!this.woven&&tracked&&this.meeting.stage<5)return this.meeting.stage===0?(this.renderer.xr.isPresenting?'Offer one hand beside the little traveler.':'Move one light beside the little traveler.'):this.meeting.stage<4?(this.renderer.xr.isPresenting?'A little trust. Let your hand rest here.':'A little trust. Rest the light here.'):this.meeting.trusted?'It knows you now. Bring the lights together.':'Give it a moment. You can offer again.';
  if(tracked&&this.progress===0&&!this.woven&&this.meeting.stage===0&&this.ritual.stage===0&&this.ritual.formation===0&&this.chapterPresence.settling>.35&&!this.guidance.requested)return CHAPTER_BEATS[this.chapter][this.encounter];
  if(!tracked){const needed=this.chapter===0&&!this.assisted?'both hands':'one hand';return this.controllerInput?`Let ${needed==='both hands'?'both controllers':'one controller'} come into view`:`Let ${needed} come into view`;}
  if(this.progress>=this.challenge.stopAt&&this.encounter>0&&!this.challenge.complete){const prompt=this.challenge.prompt(this.chapter,this.encounter,this.assisted);return this.controllerInput?prompt.replace('your hands','your controllers').replace('one hand','one controller'):prompt;}
  let prompt:string;
  if(this.chapter>0){prompt=this.ritual.prompt(this.chapter);if(!this.renderer.xr.isPresenting&&!this.woven){if(this.chapter===1&&this.ritual.stage>0)prompt='Scroll up gently to lift the stream';if(this.chapter===3)prompt=this.ritual.stage?'Scroll down gently to raise the stones':'Scroll up to place the lights above the stones';if(this.chapter===2)prompt='Drag one light slowly around the ember';}}
  else if(this.assisted)prompt=!this.woven?(this.assistReturning?'Now rest at the right ring':'Rest one hand at the left ring'):this.walking?'Your traveler trusts you':'Rest at either ring to continue';
  else prompt=!this.woven?(this.renderer.xr.isPresenting?'Bring your hands near each other':'Drag the two lights together'):this.walking?'Your traveler trusts you':this.phase==='test'?'One brave step':'Spread your hands toward the golden rings';
  return this.controllerInput?prompt.replace('your hands','your controllers').replace('one hand','one controller'):prompt;
 }
 private reset(){this.restoration?.reset();this.chapterPresence.reset();this.memoryStage=-1;this.guidance.reset();this.lastLight=new LastLight(this.savedLastLight);this.lastLightStage=-1;this.lastLightChannel=this.lastLight.channel;this.lastLightRaised=this.lastLight.aqueduct;this.meeting.reset();this.phraseWoven=false;this.care.reset();this.feedbackMilestone=0;this.gestureProgress=0;this.heart.reset(this.seedBloomed,this.finaleSeen);this.giftChimed=false;this.finaleNote=-1;this.challenge=new PuzzleChallenge(this.chapter,this.encounter);this.ritual=new ElementRitual();this.endingClock=0;this.completionAwarded=this.completed>this.chapter*3+this.encounter;this.confidence=0;this.nextButton&&(this.nextButton.hidden=true);this.progress=0;this.steady=0;this.catchHold=0;this.shoreLatched=[false,false];this.handInitialized=[false,false];this.anticipation=0;this.arrived=0;this.walking=false;this.woven=false;this.phase='thread';this.trackingLost=0;this.assistHand=-1;this.assistReturning=false;this.assistDwell=0;this.hands[0].set(-.1,Y,Z+.12);this.hands[1].set(.1,Y,Z+.12);this.creature.position.set(-.28,Y+.015,Z);this.creature.rotation.y=Math.PI/2;this.setText('01 — FIND THE THREAD','Bring your hands together.','Drag the glowing markers close together. Then spread them toward the two shores.','Waiting for a little kindness');$('toast').textContent='';}
 private updateAssist(dt:number,tracked:boolean){
  if(!tracked){this.assistHand=-1;this.assistDwell=0;return false;}
  // The first tracked hand/controller owns the interaction until tracking is lost.
  if(!this.renderer.xr.isPresenting&&this.drag>=0)this.assistHand=this.drag;
  if(this.assistHand<0||!this.sourceTracked[this.assistHand])this.assistHand=this.sourceTracked[0]&&(!this.sourceTracked[1]||this.hands[0].distanceTo(leftEdge)<this.hands[1].distanceTo(leftEdge))?0:1;
  const point=this.hands[this.assistHand];
  if(!this.woven){
   const edge=this.assistReturning?rightEdge:leftEdge;
   this.assistDwell=point.distanceTo(edge)<.16?this.assistDwell+dt:0;
   if(this.assistDwell>.35){this.assistDwell=0;if(!this.assistReturning)this.assistReturning=true;else{this.woven=true;this.bridgeEnds[0].copy(leftEdge);this.bridgeEnds[1].copy(rightEdge);this.chime();}}
   return false;
  }
  return Math.min(point.distanceTo(leftEdge),point.distanceTo(rightEdge))<.19;
 }
 private measurePerformance(dt:number){
  if(dt<=0||!Number.isFinite(dt))return;
  this.metrics.setValue(RuntimeMetrics,'bridgeHeight',this.root.localToWorld(new T.Vector3(0,Y,Z)).y);this.metrics.setValue(RuntimeMetrics,'encounter',this.encounter);this.metrics.setValue(RuntimeMetrics,'challengeDone',this.challenge.complete);this.metrics.setValue(RuntimeMetrics,'chapter',this.chapter);this.metrics.setValue(RuntimeMetrics,'completed',this.completed);this.metrics.setValue(RuntimeMetrics,'formation',this.ritual.formation);this.metrics.setValue(RuntimeMetrics,'endingTime',this.endingClock);this.metrics.setValue(RuntimeMetrics,'progress',this.progress);this.metrics.setValue(RuntimeMetrics,'worldScale',this.root.scale.x);this.metrics.setValue(RuntimeMetrics,'leftDistance',this.hands[1].distanceTo(leftEdge));this.metrics.setValue(RuntimeMetrics,'rightDistance',this.hands[1].distanceTo(rightEdge));this.metrics.setValue(RuntimeMetrics,'assisted',this.assisted);this.metrics.setValue(RuntimeMetrics,'woven',this.woven);
  this.statsClock+=dt;this.statsFrames++;this.statsCalls=Math.max(this.statsCalls,this.renderer.info.render.calls);this.statsTriangles=Math.max(this.statsTriangles,this.renderer.info.render.triangles);if(dt>1/60)this.statsSlow++;
  if(this.statsClock<3)return;
  this.metrics.setValue(RuntimeMetrics,'drawCalls',this.statsCalls);this.metrics.setValue(RuntimeMetrics,'triangles',this.statsTriangles);this.metrics.setValue(RuntimeMetrics,'callbacksPerSecond',this.statsFrames/this.statsClock);
  const readout=document.getElementById('performance-readout');
  if(readout)readout.textContent=`${this.renderer.xr.isPresenting?'Immersive runtime':'Desktop'}: ${(this.statsFrames/this.statsClock).toFixed(0)} callbacks/s; peak ${this.statsCalls} draw calls, ${this.statsTriangles.toLocaleString()} triangles; game logic ${(this.metrics.getValue(RuntimeMetrics,'logicMs')??0).toFixed(2)} ms avg / ${(this.metrics.getValue(RuntimeMetrics,'logicPeakMs')??0).toFixed(2)} ms peak (render/GPU excluded); ${this.statsSlow} intervals over 16.7 ms in ${this.statsClock.toFixed(1)} s. Emulator results do not establish Quest performance. GPU timing and thermal testing need hardware.`;
  this.statsClock=0;this.statsFrames=0;this.statsCalls=0;this.statsTriangles=0;this.statsSlow=0;
 }
 private setText(step:string,title:string,hint:string,status:string){$('step').textContent=step;$('instruction').textContent=!this.renderer.xr.isPresenting&&title==='Bring your hands together.'?'Drag the two lights together.':!this.renderer.xr.isPresenting&&title==='Spread a little kindness.'?'Move one light to each shore.':title;$('hint').textContent=hint;$('status').textContent=status;}
 update(dt:number,time:number){
  const logicStarted=performance.now();
  this.measurePerformance(dt);dt=Math.min(dt,.05);this.lastTime=time;this.frameDesktop();this.updateSpatialControls();
  if(this.renderer.xr.isPresenting&&this.renderer.xr.getSession()?.visibilityState!=='visible'){this.walking=false;this.steady=0;return;}
  let tracked=true;
  if(this.renderer.xr.isPresenting){
   const frame=this.xrFrame,ref=this.renderer.xr.getReferenceSpace(),session=this.renderer.xr.getSession();let count=0;
   this.sourceTracked=[false,false];this.handOpen=[false,false];this.controllerInput=false;
   if(frame&&ref&&session)for(const source of session.inputSources){
    const i=source.handedness==='left'?0:source.handedness==='right'?1:-1;if(i<0||this.sourceTracked[i])continue;
    const wrist=source.hand?.get('wrist');
    const pose=source.hand?(wrist?frame.getJointPose?.(wrist,ref):null):(source.gripSpace?frame.getPose(source.gripSpace,ref):null);
    if(!pose)continue;
    this.palmTarget.set(pose.transform.position.x,pose.transform.position.y,pose.transform.position.z);
    const palm=source.hand?.get('middle-finger-metacarpal'),palmPose=palm?frame.getJointPose?.(palm,ref):null;
    if(palmPose)this.palmTarget.lerp(new T.Vector3(palmPose.transform.position.x,palmPose.transform.position.y,palmPose.transform.position.z),.65);
    this.palmTarget.applyMatrix4(this.player.matrixWorld);this.root.worldToLocal(this.palmTarget);
    if(!this.handInitialized[i]){this.hands[i].copy(this.palmTarget);this.handInitialized[i]=true;}else this.hands[i].lerp(this.palmTarget,1-Math.exp(-dt*18));
    const tip=source.hand?.get('index-finger-tip'),tipPose=tip?frame.getJointPose?.(tip,ref):null;this.handOpen[i]=!!tipPose&&Math.hypot(tipPose.transform.position.x-pose.transform.position.x,tipPose.transform.position.y-pose.transform.position.y,tipPose.transform.position.z-pose.transform.position.z)>.1;
    this.sourceTracked[i]=true;this.controllerInput||=!source.hand;count++;
   }
   tracked=this.assisted||this.chapter===2?count>=1:count===2;
   for(let i=0;i<2;i++)if(!this.sourceTracked[i])this.handInitialized[i]=false;
   if(tracked)this.trackingLost=0;else this.trackingLost+=dt;
  }else this.sourceTracked=[true,true];
  this.updateAudio(dt,time);
  if(this.opening?.active){this.opening.update(dt,time,this.hands,tracked);if(this.opening.stageIndex>this.openingCueStage){this.openingCueStage=this.opening.stageIndex;if(this.opening.stageIndex===2)this.audioScene?.openingCue('planetReveal',{x:0,y:1.15,z:-1.6});}this.metrics.setValue(RuntimeMetrics,'planetMemoryVisible',this.opening.memoryVisible);this.metrics.setValue(RuntimeMetrics,'planetLegacy',this.opening.memoryRoute);return;}
  this.leafHabitat.visible=false;
  this.biomes.update(this.chapter,time,this.chapter===2?this.care.reveal:0,dt,this.hands,this.sourceTracked,this.completed,this.encounter,this.progress,this.endingClock,!this.menuOpen);
  this.elementVisuals.update(this.chapter,this.ritual.formation,this.woven,time,this.encounter===2&&this.challenge.complete,this.care.quality);this.journeyVisuals.update(this.completed,this.chapter,this.encounter,this.endingClock,time,this.progress>=this.challenge.stopAt&&this.encounter>0&&!this.challenge.complete&&((this.chapter===0&&this.encounter===2)||(this.chapter===1&&this.encounter===2)||(this.chapter===2)),this.chapter===0&&this.encounter===2?this.challenge.complete:this.woven,this.kindnesses);
  this.journeyVisuals.greetingRing.visible=false;
  if(this.chapter===2&&this.encounter>0)this.journeyVisuals.greetingRing.position.set(this.encounter===2&&this.challenge.stage?.36:.0416,Y+(this.encounter===1?.25:.075),Z+.04);
  if(this.menuOpen){this.restoration.group.visible=false;this.memoryVisuals.group.visible=false;this.lastLightVisuals.group.visible=false;this.board.group.visible=false;this.awakenings.group.visible=false;this.living.group.visible=false;this.vrGuide.visible=false;this.label.visible=false;return;}this.living.group.visible=true;this.awakenings.group.visible=true;
  this.saveClock+=dt;if(this.saveClock>1){this.saveClock=0;this.persistProgress();}
  if(this.assisted&&this.chapter>0&&(this.assistHand<0||!this.sourceTracked[this.assistHand]||(!this.woven&&this.ritual.stage===0&&this.ritual.formation===0))){const center=new T.Vector3(0,Y+.08,Z+.08);this.assistHand=this.sourceTracked[0]&&(!this.sourceTracked[1]||this.hands[0].distanceTo(center)<this.hands[1].distanceTo(center))?0:1;}
  const assistReady=this.assisted&&this.chapter===0?this.updateAssist(dt,tracked):false;
  const ritualPresent=this.sourceTracked.map((present,i)=>present&&(!this.assisted||i===this.assistHand));
  const sorted=[...this.hands].sort((a,b)=>a.x-b.x),a=sorted[0],b=sorted[1];
  const near=a.distanceTo(b)<.135;
  this.catchHold=near&&tracked&&!this.assisted?this.catchHold+dt:0;
  if(this.chapter===0&&!this.woven&&this.catchHold>.15){this.woven=true;this.bridgeEnds[0].copy(a);this.bridgeEnds[1].copy(b);this.chime();this.audioCuePoint.copy(a).lerp(b,.5).applyMatrix4(this.root.matrixWorld);this.audioScene?.threadNote(0,this.audioCuePoint);this.setText('02 — MAKE A WAY','Spread a little kindness.','Move one marker to each glowing shore. Keep the path steady.','The thread remembers your hands');}
  if(this.chapter>0&&!this.woven&&tracked){this.ritual.update(this.chapter,dt,this.hands,ritualPresent);if(this.ritual.complete){this.woven=true;this.bridgeEnds[0].copy(leftEdge);this.bridgeEnds[1].copy(rightEdge);this.chime();}}
  const shoreHands=[a,b],edges=[leftEdge,rightEdge];
  for(let i=0;i<2;i++){
   const previous=this.shoreLatched[i];this.shoreLatched[i]=this.assisted?(this.woven&&tracked&&assistReady):(this.woven&&tracked&&shoreHands[i].distanceTo(edges[i])<(previous?.19:.14));
   if(this.shoreLatched[i]&&!previous){this.chime();this.audioCuePoint.copy(edges[i]).applyMatrix4(this.root.matrixWorld);this.audioScene?.threadNote(i+1,this.audioCuePoint);}
  }
  const match=this.shoreLatched.every(Boolean);
  const ready=this.woven&&tracked&&(this.challenge.supportLatched||(this.chapter===0?match:this.ritual.supports(this.chapter,this.hands,ritualPresent,T.MathUtils.lerp(-.28,.39,this.progress))));

  this.gestureProgress=this.woven?1:this.chapter===0?(this.assisted?(this.assistReturning?.5:0)+this.assistDwell/.35*.5:Math.min(1,this.catchHold/.15)):this.ritual.formation;
  this.care.update(dt,this.hands,ritualPresent,ready,this.woven,this.chapter,this.encounter,this.endingClock,this.completed);
  const feedbackStep=Math.floor(this.gestureProgress*4);if(feedbackStep>this.feedbackMilestone){this.feedbackMilestone=feedbackStep;if(feedbackStep<4){this.chime();this.audioScene?.care(this.chapter,this.audioPositions[this.chapter],.5);}}
  const challengeActive=this.progress>=this.challenge.stopAt&&this.progress<1&&this.encounter>0&&!this.challenge.complete;
  if(challengeActive){this.challenge.update(this.chapter,this.encounter,dt,this.hands,tracked?ritualPresent:this.noPuzzleHands,ready,this.assisted);if(this.challenge.complete){if(this.challenge.mastery)this.kindnesses|=1<<this.chapter;if(this.chapter===0&&this.encounter===1)this.leafChoice=this.challenge.choice;if(this.chapter===2&&this.encounter===1)this.fireChoice=this.challenge.choice;this.care.completion=1;this.chime();this.audioScene?.care(this.chapter,this.audioPositions[this.chapter]);this.music.phrase(this.chapter);this.persistProgress();}}
  this.walking=false;
  if(ready&&!challengeActive){this.steady+=dt;
   if(this.progress===0&&this.steady>.35&&this.anticipation<1.6){
    this.anticipation+=dt;
    if(this.phase!=='test'){this.phase='test';this.chime();this.setText('03 — ONE BRAVE STEP','Is it safe?','Hold steady. Your traveler is testing the thread with one foot.','A little courage takes a moment');}
   }
   if(this.steady>.8&&(this.progress>0||this.anticipation>=1.6)&&this.progress<1){if(this.phase!=='cross'){this.phase='cross';this.chime();const crossing=CHAPTER_CROSSINGS[this.chapter];this.setText(`03 — ${crossing.step}`,crossing.title,crossing.hint,crossing.status);}this.walking=true;const prev=Math.floor(this.progress*5);this.progress=Math.min(this.encounter>0&&!this.challenge.complete?this.challenge.stopAt:1,clamp(this.progress+dt/[9,10,8,11][this.chapter]*(1+this.care.quality*.08),0,1));if(Math.floor(this.progress*5)>prev)this.chime();}}
  else {this.steady=0;if((this.phase==='cross'||this.phase==='test')&&this.progress<1){this.phase='wait';this.setText('02 — HOLD THE THREAD','Take your time. It will wait.','Bring the markers back to the two shores. Your progress is safe.','A pause is part of the journey');}}
  if(this.progress>=1&&this.phase!=='home'){this.phase='home';this.chime(true);if(this.chapter===0&&this.encounter===0){this.audioCuePoint.copy(rightEdge).applyMatrix4(this.root.matrixWorld);this.audioScene?.threadNote(3,this.audioCuePoint);}this.setText('04 — HOME, AT LAST','A small act. A whole world.','You held the space between. A little traveler found its way home.','Thank you for being here');}
  if(this.progress>=1){this.endingClock=Math.min(7,this.endingClock+dt);if(this.endingClock>=5&&!this.completionAwarded){this.completed=earnHomecoming(this.completed,this.chapter,this.encounter);this.completionAwarded=true;if(this.challenge.mastery)this.kindnesses|=1<<this.chapter;this.savedProgress=1;this.savedEnding=this.endingClock;this.writeSave();this.syncSpatialLabels();this.chime(true);this.music.phrase(this.chapter);}this.nextButton.hidden=this.endingClock<5;this.nextButton.textContent=this.nextLabel();}
  this.meeting.update(dt,this.hands,this.sourceTracked,this.chapter===0&&this.encounter===0&&this.progress===0&&!this.woven);
  if(this.meeting.stage===3&&!this.metLeaf){this.metLeaf=true;this.chime(true);this.music.phrase(0);this.audioScene?.openingCue('firstKindness',this.audioPositions[0]);this.writeSave();}
  if(this.woven&&!this.phraseWoven){this.phraseWoven=true;this.music.phrase(this.chapter);}
  this.updateHeartbeats(dt,time);this.chapterPresence.update(this.chapter,this.encounter,dt);this.restoration.update(this.chapter,this.encounter,this.progress,this.endingClock,dt,true);if(challengeActive)this.living.focusPuzzle(this.challenge,time);
  this.board.update(this.challenge,dt,time,challengeActive,!this.menuOpen&&this.woven,this.hands,ritualPresent,this.deckHeightAt);
  this.animateCreature(dt,time,ready);
  const finale=this.chapter===3&&this.encounter===2&&this.completed===12&&this.endingClock>=5;
  if(finale){this.board.group.visible=false;this.creature.visible=false;this.feet.forEach(p=>p.visible=false);this.legs.forEach(p=>p.visible=false);this.journeyVisuals.friend.visible=false;this.elementVisuals.group.visible=false;}
  else{this.creature.visible=true;this.elementVisuals.group.visible=!(this.chapter===3&&this.encounter>0&&this.woven);}
  this.markers.forEach(m=>m.visible=!finale||!this.lastLight.released);
  this.halo.visible=!finale;
  this.halo.position.copy(this.creature.position).add(new T.Vector3(0,.04,0));
  (this.halo.material as T.SpriteMaterial).opacity=.18+(ready?.08:0)+this.care.quality*.08;
  this.homeGlow.intensity=homeLight(this.completed,this.progress,this.endingClock);
  this.anchors.forEach((anchor,i)=>{const close=this.shoreLatched[i];const pulse=1+Math.sin(time*2+i)*.08;anchor.scale.setScalar(close?1.15:pulse);(anchor.material as T.MeshBasicMaterial).opacity=close?.95:.4;});
  this.lanterns.forEach((lantern,i)=>{lantern.position.y=lantern.userData.base+Math.sin(time*.4+i)*.015;});
  this.wisps.forEach((w,i)=>{w.position.x=w.userData.origin+Math.sin(time*.05+i)*.12;});
  this.markers.forEach((m,i)=>{m.position.copy(this.hands[i]);m.visible=this.sourceTracked[i]&&(!finale||!this.lastLight.released||this.memoryActive&&!this.lastLight.memory.blooming);m.scale.setScalar(this.renderer.xr.isPresenting?.6:1);m.rotation.y=time*.3;(m.children[0] as T.Mesh<T.TorusGeometry,T.MeshBasicMaterial>).material.opacity=this.woven?.9:.45+Math.sin(time*3)*.15;});
  const snap=this.woven&&(this.chapter>0||match||this.progress>0);
  this.bridgeEnds.forEach((end,i)=>{const target=snap||this.shoreLatched[i]?edges[i]:shoreHands[i];if(!this.woven)end.copy(target);else end.lerp(target,1-Math.exp(-dt*16));});
  const start=snap?leftEdge:this.bridgeEnds[0],finish=snap?rightEdge:this.bridgeEnds[1];
  this.wovenBridge.visible=this.woven&&this.chapter===0&&!(this.encounter===2&&this.challenge.choice===2);
  if(this.wovenBridge.visible){updateWeave(this.weavePositions,start,finish,snap,this.deckHeightAt);this.wovenBridge.geometry.attributes.position.needsUpdate=true;this.wovenBridge.geometry.computeBoundingSphere();this.wovenBridge.material.opacity=tracked?.65:.25;}
  this.motes.position.y=Math.sin(time*.3)*.008;
  this.metrics.setValue(RuntimeMetrics,'habitatResponse',this.biomes.response);this.metrics.setValue(RuntimeMetrics,'habitatRestored',this.biomes.restored);this.metrics.setValue(RuntimeMetrics,'habitatPathLight',this.biomes.pathLight);
  this.metrics.setValue(RuntimeMetrics,'homeResidentElement',this.journeyVisuals.residentElement);this.metrics.setValue(RuntimeMetrics,'homeResidentModel',this.journeyVisuals.residentModel);this.metrics.setValue(RuntimeMetrics,'giftOffered',this.living.giftOffered);this.metrics.setValue(RuntimeMetrics,'chapterRestored',this.restoration.visibleMilestones);this.metrics.setValue(RuntimeMetrics,'welcomeLight',this.homeGlow.intensity);this.metrics.setValue(RuntimeMetrics,'puzzleInvitations',this.living.puzzleInvitations);
  this.updateGuide(tracked);
  $('progress').style.width=`${this.progress*100}%`;$('percent').textContent=`${Math.round(this.progress*100)}%`;
  const logicMs=performance.now()-logicStarted;this.logicSum+=logicMs;this.logicPeak=Math.max(this.logicPeak,logicMs);this.logicFrames++;this.logicClock+=dt;
  if(this.logicClock>=3){this.metrics.setValue(RuntimeMetrics,'logicMs',this.logicSum/this.logicFrames);this.metrics.setValue(RuntimeMetrics,'logicPeakMs',this.logicPeak);this.logicSum=0;this.logicPeak=0;this.logicFrames=0;this.logicClock=0;}
 }
}
