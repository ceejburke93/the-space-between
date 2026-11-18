import assets from './assets';
import {discoveryDetail} from './planet-discovery';
import * as T from '@iwsdk/core';
export class CosmicOpening {
 readonly group=new T.Group();private memory=assets['planet-memory'].clone(true);private legacyRoute=0;private planet=assets['discovery-planet'].clone(true);private closeGeography=this.planet.getObjectByName('CloseGeography')!;private stage=0;private scale=.02;private armed=false;private cooldown=0;private exiting=0;private title:T.Sprite;private caption:T.Sprite;
 private advanceButton:HTMLButtonElement;private skipButton:HTMLButtonElement;
 private autoClock=0;private manualReplay=false;
 active=true;
 constructor(private scene:T.Scene,private complete:()=>void){
  scene.add(this.group);const positions=[];const random=T.MathUtils.seededRandom;
  for(let i=0;i<700;i++)positions.push((random()-.5)*18,(random()-.5)*12+1,-2-random()*14);
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  this.group.add(new T.Points(geometry,new T.PointsMaterial({color:0xdce9f6,size:.022,transparent:true,opacity:.9,sizeAttenuation:true,fog:false})));
  this.memory.visible=false;this.planet.add(this.memory);this.planet.position.set(0,1.15,-1.6);this.group.add(this.planet);
  this.planet.traverse(o=>{const mesh=o as T.Mesh;if(mesh.material&&!Array.isArray(mesh.material))mesh.material=mesh.material.clone();});
  const sun=new T.PointLight(0xffdfad,6,15);sun.position.set(-2,3,2);this.group.add(sun);
  for(let i=0;i<4;i++){const p=new T.Mesh(new T.SphereGeometry(.05+i*.02,16,12),new T.MeshStandardMaterial({color:[0x9c7d9e,0xb69068,0x69859c,0x6b8f83][i]}));p.position.set((i%2?1:-1)*(1.4+i*.4),1.3+(i%3)*.5,-3-i);this.group.add(p);}
  this.title=this.label('EVERY SMALL LIFE HAS A WORLD',1.1);this.title.position.set(0,1.85,-1.7);this.group.add(this.title);
  this.caption=this.label('Spread hands, or choose Explore closer',1.0);this.caption.position.set(0,1.5,-1.7);this.group.add(this.caption);
  this.advanceButton=document.createElement('button');this.advanceButton.id='explore-closer';this.advanceButton.textContent='Explore closer ↗';this.advanceButton.onclick=()=>this.advance();
  this.skipButton=document.createElement('button');this.skipButton.id='skip-discovery';this.skipButton.textContent='Meet the traveler';this.skipButton.onclick=()=>this.finish();
  document.querySelector('.actions')!.append(this.advanceButton,this.skipButton);
  window.addEventListener('wheel',e=>{if(this.active&&e.deltaY<0&&this.cooldown<=0)this.advance();},{passive:true});
  this.group.traverse(o=>{const m=(o as T.Mesh).material;if(m&&!Array.isArray(m))m.userData.openingOpacity=m.opacity;});
  this.showUI();
 }
 get memoryVisible(){return this.memory.visible;}
 get stageIndex(){return this.stage;}
 get memoryRoute(){return this.legacyRoute;}
 setLegacy(route:number){this.legacyRoute=route;this.memory.getObjectByName('RaisedLegacy')!.visible=route===1;this.memory.getObjectByName('GardenLegacy')!.visible=route===2;}
 private label(text:string,width:number){const c=document.createElement('canvas');c.width=1536;c.height=128;const ctx=c.getContext('2d')!;ctx.fillStyle='#dce8dc';ctx.font='56px sans-serif';ctx.textAlign='center';ctx.fillText(text,768,78);const sprite=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c),transparent:true}));sprite.scale.set(width,width/12,1);return sprite;}
 private showUI(){document.body.classList.add('cosmos');document.querySelector('h1')!.textContent=['A universe of small beginnings.','Somewhere, a little world is waiting.','A whole world. Full of little lives.'][Math.min(this.stage,2)];document.getElementById('story')!.textContent='Bring your hands near each other, then spread them to explore.';document.getElementById('step')!.textContent=`DISCOVERY ${Math.min(this.stage+1,3)} / 3`;document.getElementById('instruction')!.textContent='Scroll up to explore';document.getElementById('hint')!.textContent='Desktop: scroll up or choose Explore closer. You can skip at any time.';document.getElementById('status')!.textContent='Your hands unfold the universe';document.getElementById('percent')!.textContent='';}
 dismiss(){this.active=false;this.group.visible=false;this.advanceButton.hidden=true;this.skipButton.hidden=true;document.body.classList.remove('cosmos','planet-close');document.querySelector('h1')!.innerHTML='Hold a little world <em>together.</em>';document.getElementById('story')!.textContent='Two shores. One small traveler. Your hands make the way.';}
 replay(){this.manualReplay=true;this.autoClock=0;this.stage=0;this.scale=.02;this.armed=false;this.cooldown=0;this.exiting=0;this.active=true;this.group.visible=true;this.group.traverse(o=>{const material=(o as T.Mesh).material;if(material&&!Array.isArray(material))material.opacity=material.userData.openingOpacity??1;});this.advanceButton.hidden=false;this.skipButton.hidden=false;this.showUI();}
 advance(){if(!this.active||this.cooldown>0)return;this.stage++;this.cooldown=.9;this.armed=false;if(this.stage>=3){this.finish();return;}this.showUI();}
 finish(){if(this.exiting||!this.active)return;this.exiting=.001;this.advanceButton.hidden=true;this.skipButton.hidden=true;}
 update(dt:number,time:number,hands:T.Vector3[],tracked:boolean){
  if(!this.active)return;if(!this.manualReplay&&!this.exiting){this.autoClock+=dt;if(this.autoClock>(this.stage===2?3.8:2.6)){this.autoClock=0;this.advance();}}this.cooldown=Math.max(0,this.cooldown-dt);
  const gap=hands[0].distanceTo(hands[1]);if(tracked&&gap<.16)this.armed=true;if(tracked&&this.armed&&gap>.34)this.advance();
  this.scale=T.MathUtils.lerp(this.scale,[.035,.18,.46][Math.min(this.stage,2)],1-Math.exp(-dt*2.5));this.planet.scale.setScalar(this.scale);this.planet.rotation.y=Math.sin(time*.08)*.12;
  const detail=discoveryDetail(this.scale);this.memory.visible=this.legacyRoute>0&&detail>.15;this.closeGeography.visible=detail>.02;this.closeGeography.traverse(o=>{const m=(o as T.Mesh).material;if(m&&!Array.isArray(m)){m.transparent=detail<1;m.opacity=detail;}});this.planet.getObjectByName('CloudLayers')!.rotation.y=time*.008;
  const closeView=this.stage===2&&detail>.85;document.body.classList.toggle('planet-close',closeView);this.caption.visible=document.body.classList.contains('xr')&&!closeView;this.title.visible=document.body.classList.contains('xr')&&!closeView;
  if(this.exiting){this.exiting+=dt;const alpha=Math.max(0,1-this.exiting/1.1);this.group.traverse(o=>{const material=(o as T.Mesh).material;if(material&&!Array.isArray(material)){material.transparent=true;material.opacity=alpha*(material.userData.openingOpacity??1)*(material.userData.discoveryDetail?detail:1);}});if(this.exiting>=1.1){this.active=false;this.group.visible=false;document.body.classList.remove('cosmos','planet-close');document.querySelector('h1')!.innerHTML='Hold a little world <em>together.</em>';document.getElementById('story')!.textContent='Two shores. One small traveler. Your hands make the way.';this.complete();}}
 }
}
