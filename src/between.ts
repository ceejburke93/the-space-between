import { createSystem, UIKitMLAsset, Entity } from '@iwsdk/core';
import * as T from '@iwsdk/core';
import { RuntimeMetrics } from './runtime-metrics';
import { CosmicOpening } from './cosmic-opening';

const GOLD=0xf6d58c, Y=1.02, Z=-.62;
const leftEdge=new T.Vector3(-.23,Y,Z), rightEdge=new T.Vector3(.23,Y,Z);
const $=(id:string)=>document.getElementById(id)!;
const clamp=T.MathUtils.clamp;
export class BetweenSystem extends createSystem({}) {
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
 private anchors:T.Mesh[]=[]; private lanterns:T.Group[]=[]; private wisps:T.Sprite[]=[];
 private homeGlow!:T.PointLight; private halo!:T.Sprite; private ambiance:AudioBufferSourceNode|null=null;
 private root=new T.Group(); private creature=new T.Group(); private eyes=new T.Group();
 private torso=new T.Group(); private feet:T.Mesh[]=[]; private legs:T.Mesh[]=[];
 private guideCanvas=document.createElement('canvas'); private guideTexture!:T.CanvasTexture;
 private vrGuide!:T.Sprite; private guideKey=''; private guidePreview=false;
 private restartHold=0; private desktopFrame='';
 private bridgePoint=new T.Vector3();
 private anticipation=0; private arrived=0; private walking=false;
 private hands=[new T.Vector3(-.1,Y,Z+.12),new T.Vector3(.1,Y,Z+.12)];
 private markers:T.Group[]=[]; private strands:T.Line[]=[]; private motes!:T.Points;
 private homes:T.Group[]=[]; private progress=0; private steady=0; private phase='thread';
 private woven=false; private trackingLost=0; private drag=-1; private lastTime=0;
 private ray=new T.Raycaster(); private pointer=new T.Vector2(); private plane=new T.Plane(new T.Vector3(0,1,0),-Y);
 private sound:AudioContext|null=null; private soundOn=false; private noteIndex=0;
 private label!:T.Sprite; private sparkle=T.MathUtils.seededRandom;
 init(){
  const metricsObject=new T.Group();metricsObject.name='runtime-metrics';this.metrics=this.world.createTransformEntity(metricsObject).addComponent(RuntimeMetrics);
  this.scene.background=new T.Color('#102532'); this.scene.fog=new T.FogExp2('#102532',.07);
  this.scene.add(new T.HemisphereLight(0xc6e5de,0x314953,2));
  const light=new T.DirectionalLight(0xffd9a0,3); light.position.set(-2,4,2);this.scene.add(light);
  this.scene.add(this.root);
  this.makeIsland(-.48,false);this.makeIsland(.48,true);this.makeCreature();this.makeBridge();
  for(const edge of [leftEdge,rightEdge]){const ring=new T.Mesh(new T.TorusGeometry(.035,.002,6,40),new T.MeshBasicMaterial({color:GOLD,transparent:true,opacity:.65}));ring.rotation.x=-Math.PI/2;ring.position.copy(edge);ring.position.y+=.008;this.root.add(ring);this.anchors.push(ring);}
  for(let i=0;i<2;i++){const g=new T.Group(); const ring=new T.Mesh(new T.TorusGeometry(.035,.0018,6,40),new T.MeshBasicMaterial({color:GOLD,transparent:true,opacity:.8}));ring.rotation.x=-Math.PI/2;g.add(ring); const dot=new T.Mesh(new T.SphereGeometry(.008,10,8),new T.MeshBasicMaterial({color:0xfff1cb}));g.add(dot);this.root.add(g);this.markers.push(g);}
  // One draw call for the floating lights instead of 85 individual meshes.
  const motePositions:number[]=[],moteColors:number[]=[];
  for(let i=0;i<85;i++){motePositions.push((this.sparkle()-.5)*3,.5+this.sparkle()*1.5,-this.sparkle()*2);const color=new T.Color(i%3?GOLD:0x9edac6).multiplyScalar(.4+this.sparkle()*.6);moteColors.push(color.r,color.g,color.b);}
  const moteGeometry=new T.BufferGeometry();moteGeometry.setAttribute('position',new T.Float32BufferAttribute(motePositions,3));moteGeometry.setAttribute('color',new T.Float32BufferAttribute(moteColors,3));
  this.motes=new T.Points(moteGeometry,new T.PointsMaterial({size:.005,vertexColors:true,transparent:true,opacity:.65,depthWrite:false}));this.root.add(this.motes);
  for(let i=0;i<8;i++){const rock=new T.Mesh(new T.IcosahedronGeometry(.12+i*.012,0),new T.MeshStandardMaterial({color:0x263e48,roughness:1}));rock.position.set((i%2?1:-1)*(.8+i*.25),.1+i*.07,-1-i*.4);rock.scale.y=.4;this.root.add(rock);}
  this.label=this.makeLabel('A LITTLE TRUST GOES A LONG WAY');this.label.position.set(0,1.37,Z-.18);this.root.add(this.label);
  this.makeAtmosphere();this.batchIslands();this.makeVRGuide();this.installInput();this.reset();
  this.makeMenu();this.setupSpatialControls();
  const save=this.readSave();this.savedProgress=save.progress;this.soundOn=save.sound;this.reducedReach=save.reducedReach;this.assisted=save.assisted;
  $('sound').textContent=this.soundOn?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(this.soundOn));
  this.opening=new CosmicOpening(this.scene,()=>{this.writeSave();this.showMenu();});
  if(save.visited){this.opening.dismiss();this.showMenu();}else{this.root.visible=false;this.scene.background=new T.Color('#02050c');}
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&!this.opening.active)this.persistProgress();});
  window.addEventListener('pagehide',()=>{if(!this.opening.active)this.persistProgress();});
 }
 private mesh(geo:T.BufferGeometry,color:number,parent:T.Object3D,x=0,y=0,z=0){const m=new T.Mesh(geo,new T.MeshStandardMaterial({color,roughness:.8}));m.position.set(x,y,z);parent.add(m);return m;}
 private makeIsland(x:number,home:boolean){
  const g=new T.Group();g.position.set(x,Y-.025,Z);this.root.add(g);this.homes.push(g);
  const stone=this.mesh(new T.CylinderGeometry(.255,.13,.24,7),0x38515a,g,0,-.12);stone.rotation.y=.2;
  this.mesh(new T.CylinderGeometry(.26,.25,.035,32),0x668578,g);
  this.mesh(new T.CylinderGeometry(.235,.24,.009,32),0x91a181,g,0,.02);
  for(let i=0;i<12;i++){const a=i*2.4;this.mesh(new T.ConeGeometry(.01,.04,4),0x8eab89,g,Math.cos(a)*.21,.04,Math.sin(a)*.2);}
  const house=new T.Group();house.position.set(home?.06:-.07,.025,-.07);g.add(house);
  this.mesh(new T.CylinderGeometry(.062,.08,.13,7),home?0xc5b68b:0x8fa9a1,house,0,.065);
  const roof=this.mesh(new T.ConeGeometry(.11,.12,7),home?0x6e897b:0x597f80,house,0,.18);roof.rotation.y=.3;
  const door=this.mesh(new T.CircleGeometry(.027,24),0xffdb8c,house,0,.038,.073);(door.material as T.MeshStandardMaterial).emissive.setHex(GOLD);(door.material as T.MeshStandardMaterial).emissiveIntensity=home?1:.3;
  const point=new T.PointLight(GOLD,home?.14:.03,.5);point.position.set(0,.06,.12);house.add(point);if(home)this.homeGlow=point;
  for(let i=0;i<3;i++){const r=this.mesh(new T.IcosahedronGeometry(.035,0),0x3d5760,g,(i-1)*.1,-.24-i*.04,0);r.scale.y=1.5;}
 }
 private makeCreature(){
  this.root.add(this.creature);this.creature.add(this.torso);
  const body=this.mesh(new T.SphereGeometry(.032,12,10),0xa6c98a,this.torso,0,.034);body.scale.set(.8,1.2,.8);
  const leaf=this.mesh(new T.ConeGeometry(.033,.085,3),0x7baf7c,this.torso,0,.065,-.008);leaf.rotation.z=-.18;leaf.rotation.x=-.2;
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
  if(x<leftEdge.x||x>rightEdge.x)return Y-.0005;
  const t=(x-leftEdge.x)/(rightEdge.x-leftEdge.x)*32;
  const lo=Math.floor(t),f=t-lo;
  return Y+.003-T.MathUtils.lerp(Math.sin(lo/32*Math.PI),Math.sin(Math.min(lo+1,32)/32*Math.PI),f)*.018;
 }
 private animateCreature(dt:number,time:number,ready:boolean){
  const end=this.progress>=1;
  const x=T.MathUtils.lerp(-.28,.39,this.progress);
  const distance=this.progress*.67,stride=.045;
  this.creature.position.set(x,this.bridgeHeight(x),Z);
  this.creature.scale.setScalar(1);
  // Only the torso breathes and leans; its feet stay planted on the deck.
  this.torso.position.y=.011+(this.walking?Math.sin(distance/stride*Math.PI*4)*.0015:Math.sin(time*2.4)*.0006);
  this.torso.rotation.z=this.walking?Math.sin(distance/stride*Math.PI*2)*.025:0;
  this.torso.rotation.x=!ready&&this.progress>0&&!end?.12:0;
  let yaw=Math.PI/2;
  if(end){this.arrived+=dt;const head=this.root.worldToLocal(this.player.head.getWorldPosition(new T.Vector3()));yaw=Math.atan2(head.x-x,head.z-Z);this.torso.rotation.x=-Math.sin(Math.min(this.arrived,1)*Math.PI)*.13;}
  else if(this.progress===0&&this.anticipation===0){const target=this.woven?this.hands[1]:this.hands[0];yaw=Math.atan2(target.x-x,target.z-Z);}
  this.creature.rotation.y+=Math.atan2(Math.sin(yaw-this.creature.rotation.y),Math.cos(yaw-this.creature.rotation.y))*(1-Math.exp(-dt*4));
  this.eyes.scale.y=Math.sin(time*1.3)>.995?.15:1;
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
   const foot=this.feet[i];foot.position.set(fx,this.bridgeHeight(fx)+.0044+lift,Z+(i===0?-.014:.014));
   foot.rotation.y=Math.PI/2;
   const hip=this.root.worldToLocal(this.creature.localToWorld(new T.Vector3(i===0?-.014:.014,.026,0)));
   const ankle=foot.position.clone().add(new T.Vector3(0,.003,0));
   const leg=this.legs[i],direction=hip.clone().sub(ankle);
   leg.position.copy(hip).add(ankle).multiplyScalar(.5);leg.scale.y=direction.length();
   leg.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize());
  }
 }
 private makeBridge(){for(let i=0;i<15;i++){const line=new T.Line(new T.BufferGeometry().setFromPoints(Array.from({length:33},()=>new T.Vector3())),new T.LineBasicMaterial({color:i<2?0xffe7ab:0xcdbf8b,transparent:true,opacity:.5}));this.root.add(line);this.strands.push(line);}}
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
   const ridge=Array.from({length:25},(_,i)=>new T.Vector3((i-12)*.8,-.25+this.sparkle()*1.2+(i%2)*.3,z));
   for(let i=0;i<ridge.length-1;i++){const a=ridge[i],b=ridge[i+1];vertices.push(a.x,a.y,z,b.x,b.y,z,a.x,-3,z,b.x,b.y,z,b.x,-3,z,a.x,-3,z);}
   const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
   const mountain=new T.Mesh(geometry,new T.MeshBasicMaterial({color:[0x1a3740,0x203f48,0x24434c][layer],side:T.DoubleSide}));this.root.add(mountain);
  }
  // Dim, transparent cloud bands separate the near islands from the valley.
  const cloudCanvas=document.createElement('canvas');cloudCanvas.width=256;cloudCanvas.height=64;const ctx=cloudCanvas.getContext('2d')!;
  const gradient=ctx.createRadialGradient(128,32,0,128,32,128);gradient.addColorStop(0,'rgba(157,197,194,.3)');gradient.addColorStop(1,'rgba(157,197,194,0)');ctx.fillStyle=gradient;ctx.scale(1,.25);ctx.fillRect(0,0,256,256);
  const cloudTexture=new T.CanvasTexture(cloudCanvas);
  for(let i=0;i<10;i++){const w=new T.Sprite(new T.SpriteMaterial({map:cloudTexture,transparent:true,depthWrite:false,opacity:.35}));w.position.set((this.sparkle()-.5)*7,.1+this.sparkle()*.4,-1.5-this.sparkle()*4);w.scale.set(2+this.sparkle()*2,.35,1);w.userData.origin=w.position.x;this.root.add(w);this.wisps.push(w);}
  // Small planted details make the islands feel inhabited, with no downloaded artwork.
  this.homes.forEach((island,index)=>{
   for(let i=0;i<5;i++){
    const x=-.13+i*.055,z=.04+Math.sin(i)*.025;
    const stone=this.mesh(new T.SphereGeometry(.022,7,5),0xa5ab90,island,x,.027,z);stone.scale.set(1,.18,.7);
   }
   for(let i=0;i<9;i++){
    const angle=i*2.399, r=.13+(i%3)*.035,x=Math.cos(angle)*r,z=Math.sin(angle)*r;
    if(z<-.13)continue;
    this.mesh(new T.CylinderGeometry(.001,.002,.025,5),0x66846b,island,x,.04,z);
    const flower=this.mesh(new T.SphereGeometry(.005+(i%2)*.002,7,5),index?0xffdaa0:0xa8d3bd,island,x,.055,z);
    (flower.material as T.MeshStandardMaterial).emissive.setHex(index?GOLD:0x72c9b0);(flower.material as T.MeshStandardMaterial).emissiveIntensity=.8;
   }
   for(let i=0;i<3;i++){
    const tree=new T.Group();tree.position.set(-.13+i*.12,.02,-.14-Math.sin(i)*.02);island.add(tree);
    const trunk=this.mesh(new T.CylinderGeometry(.004,.007,.16,6),0x536e64,tree,0,.075);trunk.rotation.z=(i-1)*.12;
    for(let j=0;j<3;j++){const foliage=this.mesh(new T.IcosahedronGeometry(.055-j*.008,1),[0x477d73,0x669383,0x7da28b][j],tree,(j%2-.5)*.025,.12+j*.035,0);foliage.scale.set(.7,1.1,.6);}
   }
   // Trailing roots, attached firmly to the land above.
   for(let i=0;i<5;i++){
    const x=(i-2)*.065,points=[new T.Vector3(x,-.05,.13),new T.Vector3(x+.02,-.2,.12),new T.Vector3(x-.015,-.32-i*.013,.10)];
    const curve=new T.CatmullRomCurve3(points);this.mesh(new T.TubeGeometry(curve,8,.002,4,false),0x587c70,island);
   }
  });
  for(let i=0;i<7;i++){
   const g=new T.Group(),angle=i*1.7;g.position.set(Math.sin(angle)*(1.1+i*.08),.65+i*.12,-1.3-i*.32);g.userData.base=g.position.y;
   this.mesh(new T.CylinderGeometry(.013,.013,.024,6),0xf3d39a,g);this.mesh(new T.ConeGeometry(.02,.014,6),0x647e74,g,0,.018);
   glow(g,0,0,0,.2,0xffd69a,.6);this.root.add(g);this.lanterns.push(g);
  }
  this.halo=glow(this.root,-.28,Y+.025,Z,.14,GOLD,.3);
  // Marks of light on each shore reinforce the exact interaction locations.
  for(const edge of [leftEdge,rightEdge])glow(this.root,edge.x,edge.y+.008,edge.z,.12,GOLD,.3);
 }
 /** Combine static island meshes by lighting properties; preserve their colors per vertex. */
 private batchIslands(){
  for(const island of this.homes){
   island.updateWorldMatrix(true,true);
   const inverse=island.matrixWorld.clone().invert();
   const batches=new Map<string,{positions:number[];normals:number[];colors:number[];material:T.MeshStandardMaterial}>();
   const originals:T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>[]=[];
   island.traverse(object=>{
    if(!(object instanceof T.Mesh)||!(object.material instanceof T.MeshStandardMaterial))return;
    const material=object.material,key=`${material.emissive.getHex()}|${material.emissiveIntensity}|${material.side}`;
    let batch=batches.get(key);
    if(!batch){const mergedMaterial=material.clone();mergedMaterial.color.setHex(0xffffff);mergedMaterial.vertexColors=true;batch={positions:[],normals:[],colors:[],material:mergedMaterial};batches.set(key,batch);}
    let geometry=object.geometry.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,object.matrixWorld));
    if(geometry.index){const expanded=geometry.toNonIndexed();geometry.dispose();geometry=expanded;}
    const positions=geometry.getAttribute('position'),normals=geometry.getAttribute('normal');
    for(let i=0;i<positions.count;i++){batch.positions.push(positions.getX(i),positions.getY(i),positions.getZ(i));batch.normals.push(normals.getX(i),normals.getY(i),normals.getZ(i));batch.colors.push(material.color.r,material.color.g,material.color.b);}
    geometry.dispose();originals.push(object);
   });
   for(const original of originals){original.removeFromParent();original.geometry.dispose();original.material.dispose();}
   for(const batch of batches.values()){
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(batch.positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(batch.normals,3));geometry.setAttribute('color',new T.Float32BufferAttribute(batch.colors,3));geometry.computeBoundingSphere();island.add(new T.Mesh(geometry,batch.material));
   }
  }
 }
 private setupSpatialControls(){
  this.spatialMenu=this.world.requireSceneObject<UIKitMLAsset>('spatial-menu');
  this.spatialPause=this.world.requireSceneObject<UIKitMLAsset>('spatial-pause');
  this.spatialSettings=this.world.requireSceneObject<UIKitMLAsset>('spatial-settings');
  this.spatialDiscovery=this.world.requireSceneObject<UIKitMLAsset>('spatial-discovery');
  this.spatialSettings.document.setTargetDimensions(.4,.6);
  this.spatialDiscovery.document.setTargetDimensions(.32,.08);
  this.spatialMenu.document.setTargetDimensions(.4,.56);
  this.spatialPause.document.setTargetDimensions(.09,.058);
  this.spatialMenu.visible=false;this.spatialPause.visible=false;this.spatialSettings.visible=false;this.spatialDiscovery.visible=false;
  const listen=(panel:UIKitMLAsset,id:string,action:()=>void)=>{
   const element=panel.requireElementById(id);
   const click=()=>{this.activateSound();this.chime();action();};
   element.addEventListener('click',click);this.cleanupFuncs.push(()=>element.removeEventListener('click',click));
  };
  listen(this.spatialMenu,'settings',()=>{this.settingsOpen=true;});
  listen(this.spatialSettings,'settings-back',()=>{this.settingsOpen=false;});
  listen(this.spatialSettings,'place-world',()=>this.placeWorld());
  listen(this.spatialSettings,'raise-world',()=>this.adjustHeight(.05));
  listen(this.spatialSettings,'lower-world',()=>this.adjustHeight(-.05));
  listen(this.spatialSettings,'reach-toggle',()=>this.toggleComfort('reach'));
  listen(this.spatialSettings,'assist-toggle',()=>this.toggleComfort('assist'));
  listen(this.spatialDiscovery,'explore',()=>this.opening.advance());
  listen(this.spatialDiscovery,'skip-intro',()=>this.opening.finish());
  listen(this.spatialMenu,'play',()=>this.playFromMenu(true));
  listen(this.spatialMenu,'restart',()=>this.playFromMenu(false));
  listen(this.spatialMenu,'sound-toggle',()=>{this.soundOn=!this.soundOn;this.activateSound();$('sound').textContent=this.soundOn?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(this.soundOn));this.writeSave();this.syncSpatialLabels();});
  listen(this.spatialMenu,'exit',()=>this.world.exitXR());
  listen(this.spatialPause,'menu',()=>{this.persistProgress();this.showMenu();});
  this.syncSpatialLabels();
 }
 private syncSpatialLabels(){
  this.spatialSettings?.getElementById('reach-label')?.setProperties({text:`Reduced reach: ${this.reducedReach?'on':'off'}`});
  this.spatialSettings?.getElementById('assist-label')?.setProperties({text:`One-hand assist: ${this.assisted?'on':'off'}`});
  const reach=document.getElementById('desktop-reach'),assist=document.getElementById('desktop-assist');
  if(reach)reach.textContent=`Reduced reach: ${this.reducedReach?'on':'off'}`;if(assist)assist.textContent=`One-hand assist: ${this.assisted?'on':'off'}`;
  this.spatialMenu?.getElementById('restart')?.setProperties({display:this.savedProgress>0?'flex':'none'});
  this.spatialMenu?.getElementById('play-label')?.setProperties({text:this.savedProgress>0&&this.savedProgress<1?'Continue':'Play'});
  this.spatialMenu?.getElementById('sound-label')?.setProperties({text:this.soundOn?'Sound on':'Sound off'});
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
  this.spatialSettings.position.copy(this.spatialMenu.position);this.spatialSettings.quaternion.copy(this.spatialMenu.quaternion);
  this.spatialDiscovery.position.copy(head).addScaledVector(forward,.5);this.spatialDiscovery.position.y=head.y-.2;this.spatialDiscovery.lookAt(head.x,this.spatialDiscovery.position.y,head.z);
  this.spatialPause.position.copy(head).addScaledVector(forward,.44).addScaledVector(right,-.2);this.spatialPause.position.y=head.y-.3;
  this.spatialPause.lookAt(head.x,this.spatialPause.position.y,head.z);
 }
 private updateSpatialControls(){
  const immersive=this.renderer.xr.isPresenting;
  if(immersive&&!this.wasImmersive){this.placeWorld();this.placeSpatialControls();}this.wasImmersive=immersive;
  this.spatialMenu.visible=immersive&&this.menuOpen&&!this.settingsOpen&&!this.opening?.active;
  this.spatialSettings.visible=immersive&&this.menuOpen&&this.settingsOpen&&!this.opening?.active;
  this.spatialDiscovery.visible=immersive&&!!this.opening?.active;
  this.spatialPause.visible=immersive&&!this.menuOpen&&!this.opening?.active;
 }
 private readSave():{visited:boolean;progress:number;sound:boolean;reducedReach:boolean;assisted:boolean}{
  try{const value=JSON.parse(localStorage.getItem(this.saveKey)||'null');return {visited:value?.visited===true,progress:typeof value?.progress==='number'&&Number.isFinite(value.progress)?clamp(value.progress,0,1):0,sound:value?.sound===true,reducedReach:value?.reducedReach===true,assisted:value?.assisted===true};}catch{return {visited:false,progress:0,sound:false,reducedReach:false,assisted:false};}
 }
 private writeSave(){try{localStorage.setItem(this.saveKey,JSON.stringify({version:1,visited:true,progress:this.savedProgress,sound:this.soundOn,reducedReach:this.reducedReach,assisted:this.assisted}));this.saveAvailable=true;}catch{this.saveAvailable=false;}}
 private persistProgress(){if(!this.menuOpen)this.savedProgress=this.progress;this.writeSave();}
 private makeMenu(){
  const menu=document.createElement('section');menu.id='planet-menu';menu.setAttribute('aria-label','The Space Between main menu');menu.hidden=true;
  menu.innerHTML='<div class="menu-kicker">WELCOME TO THEIR LITTLE WORLD</div><h2>The Space Between</h2><p>A small traveler. A bridge only you can make.</p><button id="play-game">Play</button><button id="new-game">Start a new crossing</button><button id="replay-opening">Replay the discovery</button><small id="save-note"></small>';
  const comfort=document.createElement('details');comfort.innerHTML='<summary>Comfort & controls</summary><button id="desktop-reach">Reduced reach: off</button><button id="desktop-assist">One-hand assist: off</button><p>In VR, place the world while looking forward. Use Raise or Lower to suit your seat. Assisted play: hold one hand or controller near the left ring, then the right ring. Rest at either ring to resume.</p>';
  menu.append(comfort);
  const stats=document.createElement('details');stats.innerHTML='<summary>Performance check</summary><small id="performance-readout">Collecting frame measurements…</small>';menu.append(stats);
  document.body.append(menu);this.menuElement=menu;
  $('desktop-reach').onclick=()=>this.toggleComfort('reach');$('desktop-assist').onclick=()=>this.toggleComfort('assist');
  $('play-game').onclick=()=>this.playFromMenu(true);$('new-game').onclick=()=>this.playFromMenu(false);
  $('replay-opening').onclick=()=>{this.menuOpen=false;menu.hidden=true;document.body.classList.remove('at-menu');this.root.visible=false;this.scene.background=new T.Color('#02050c');this.opening.replay();};
  const button=document.createElement('button');button.textContent='Menu';button.id='return-menu';button.onclick=()=>{this.persistProgress();this.showMenu();};document.querySelector('.actions')!.append(button);this.menuButton=button;
 }
 private showMenu(){
  this.menuOpen=true;this.settingsOpen=false;this.syncSpatialLabels();if(this.renderer.xr.isPresenting)this.placeSpatialControls();this.guidePreview=false;this.menuHold=0;this.animateCreature(0,this.lastTime,false);this.root.visible=true;this.scene.background=new T.Color('#102532');this.menuElement.hidden=false;document.body.classList.add('at-menu');this.guideKey='';
  $('play-game').textContent=this.savedProgress>0&&this.savedProgress<1?'Continue crossing':'Play';
  $('new-game').hidden=this.savedProgress<=0;$('save-note').textContent=this.saveAvailable?(this.savedProgress>0&&this.savedProgress<1?`Crossing saved at ${Math.round(this.savedProgress*100)}% · on this browser`:'Your discovery is remembered on this browser'):'Saving is unavailable in this browser session';
 }
 private playFromMenu(resume:boolean){
  this.menuOpen=false;this.settingsOpen=false;this.menuElement.hidden=true;document.body.classList.remove('at-menu');this.reset();
  if(resume&&this.savedProgress>0&&this.savedProgress<1){this.progress=this.savedProgress;this.woven=true;this.anticipation=1.6;this.phase='wait';this.setText('WELCOME BACK','Your traveler waited for you.','Bring your hands or markers to the two shores to continue.','Your crossing is saved');}
  this.activateSound();this.savedProgress=this.progress;this.writeSave();this.guideKey='';
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
  (this.vrGuide.material as T.SpriteMaterial).opacity=1;
  document.body.classList.toggle('crossing',this.phase==='cross');
  this.label.visible=false;
  if(!this.vrGuide.visible)return;
  let title='Bring your hands near each other',hint='Keep both hands visible. Leave a little space between them.',step='01 / CATCH A THREAD';
  if(this.woven){title='Spread your hands toward the golden rings';hint='Rest your elbows near your body. The thread will find the shores.';step='02 / MAKE A BRIDGE';}
  if(this.phase==='test'){title='One brave step';hint='Hold gently while your traveler tests the bridge.';step='03 / A LITTLE COURAGE';}
  if(this.phase==='cross'){title='Your traveler trusts you';hint='Keep your hands near the rings. You can pause at any time.';step='03 / CROSSING';}
  if(this.phase==='wait'){title='Take your time. It will wait.';hint='Return your hands to the golden rings to continue.';step='03 / REST, THEN CONTINUE';}
  if(this.phase==='home'){title='A small act. A whole world.';hint='Use Menu to begin another crossing.';step='04 / HOME, AT LAST';}
  if(this.menuOpen){title='Welcome to The Space Between';hint='Bring hands near each other and hold to play or continue.';step='YOUR LITTLE WORLD IS WAITING';}
  if(!tracked){title='Let your hands come into view';hint='Hold both hands comfortably in front of you. Your progress is safe.';step='A MOMENT TO RECONNECT';}
  // A single readable prompt replaces the multi-line progress card in VR.
  if(this.assisted&&this.progress<1){title=!this.woven?(this.assistReturning?'Now rest at the right ring':'Rest one hand at the left ring'):this.walking?'Your traveler trusts you':'Rest at either ring to continue';}
  if(this.controllerInput)title=title.replace('your hands','your controllers').replace('one hand','one controller');
  if(!tracked)title=this.assisted?'Bring one hand or controller into view':'Bring both hands or controllers into view';
  const key=title;
  if(this.guideKey===key)return;this.guideKey=key;
  const ctx=this.guideCanvas.getContext('2d')!;ctx.clearRect(0,0,1536,512);
  ctx.fillStyle='rgba(13,30,40,.94)';ctx.beginPath();ctx.roundRect(6,140,1524,232,35);ctx.fill();
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
  const pick=(e:PointerEvent)=>{const r=canvas.getBoundingClientRect();this.pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.ray.setFromCamera(this.pointer,this.camera);const p=new T.Vector3();return this.ray.ray.intersectPlane(this.plane,p)?p:null;};
  canvas.addEventListener('pointerdown',e=>{if(this.renderer.xr.isPresenting||this.menuOpen||this.opening?.active)return;const p=pick(e);if(!p)return;const d=this.hands.map(h=>h.distanceTo(p));this.drag=d[0]<d[1]?0:1;this.hands[this.drag].copy(p);canvas.setPointerCapture(e.pointerId);this.activateSound();});
  canvas.addEventListener('pointermove',e=>{if(this.drag<0)return;const p=pick(e);if(p){p.x=clamp(p.x,-.6,.6);p.z=clamp(p.z,Z-.2,Z+.35);this.hands[this.drag].copy(p);}});
  canvas.addEventListener('pointerup',()=>this.drag=-1);canvas.addEventListener('pointercancel',()=>this.drag=-1);
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
  if(this.soundOn){this.sound??=new AudioContext();void this.sound.resume();
   if(!this.ambiance){const ctx=this.sound,buffer=ctx.createBuffer(1,ctx.sampleRate*4,ctx.sampleRate),data=buffer.getChannelData(0);let previous=0;for(let i=0;i<data.length;i++){previous=(previous+(.02*(Math.random()*2-1)))/1.02;data[i]=previous*2;}
    const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=450;gain.gain.value=.065;source.connect(filter).connect(gain).connect(ctx.destination);source.start();this.ambiance=source;
   }
  }else if(this.ambiance){this.ambiance.stop();this.ambiance.disconnect();this.ambiance=null;}
 }
 private chime(high=false){if(!this.soundOn||!this.sound)return;const ctx=this.sound;const t=ctx.currentTime;const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.value=(high?2:1)*[392,440,523.25,587.33,659.25][this.noteIndex++%5];gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.04,t+.03);gain.gain.exponentialRampToValueAtTime(.001,t+.7);const pan=ctx.createStereoPanner();pan.pan.value=T.MathUtils.lerp(-.55,.55,this.progress);osc.connect(gain).connect(pan).connect(ctx.destination);osc.start(t);osc.stop(t+.8);}
 private reset(){this.progress=0;this.steady=0;this.catchHold=0;this.shoreLatched=[false,false];this.handInitialized=[false,false];this.anticipation=0;this.arrived=0;this.walking=false;this.woven=false;this.phase='thread';this.trackingLost=0;this.assistHand=-1;this.assistReturning=false;this.assistDwell=0;this.hands[0].set(-.1,Y,Z+.12);this.hands[1].set(.1,Y,Z+.12);this.creature.position.set(-.28,Y+.015,Z);this.creature.rotation.y=Math.PI/2;this.setText('01 — FIND THE THREAD','Bring your hands together.','Drag the glowing markers close together. Then spread them toward the two shores.','Waiting for a little kindness');$('toast').textContent='';}
 private updateAssist(dt:number,tracked:boolean){
  if(!tracked){this.assistHand=-1;this.assistDwell=0;return false;}
  // The first tracked hand/controller owns the interaction until tracking is lost.
  if(!this.renderer.xr.isPresenting&&this.drag>=0)this.assistHand=this.drag;
  if(this.assistHand<0||!this.sourceTracked[this.assistHand])this.assistHand=this.sourceTracked[1]?1:0;
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
  this.metrics.setValue(RuntimeMetrics,'bridgeHeight',this.root.localToWorld(new T.Vector3(0,Y,Z)).y);this.metrics.setValue(RuntimeMetrics,'progress',this.progress);this.metrics.setValue(RuntimeMetrics,'worldScale',this.root.scale.x);this.metrics.setValue(RuntimeMetrics,'leftDistance',this.hands[1].distanceTo(leftEdge));this.metrics.setValue(RuntimeMetrics,'rightDistance',this.hands[1].distanceTo(rightEdge));this.metrics.setValue(RuntimeMetrics,'assisted',this.assisted);this.metrics.setValue(RuntimeMetrics,'woven',this.woven);
  this.statsClock+=dt;this.statsFrames++;this.statsCalls=Math.max(this.statsCalls,this.renderer.info.render.calls);this.statsTriangles=Math.max(this.statsTriangles,this.renderer.info.render.triangles);if(dt>1/60)this.statsSlow++;
  if(this.statsClock<3)return;
  this.metrics.setValue(RuntimeMetrics,'drawCalls',this.statsCalls);this.metrics.setValue(RuntimeMetrics,'triangles',this.statsTriangles);this.metrics.setValue(RuntimeMetrics,'callbacksPerSecond',this.statsFrames/this.statsClock);
  const readout=document.getElementById('performance-readout');
  if(readout)readout.textContent=`${this.renderer.xr.isPresenting?'Immersive runtime':'Desktop'}: ${(this.statsFrames/this.statsClock).toFixed(0)} callbacks/s; peak ${this.statsCalls} draw calls, ${this.statsTriangles.toLocaleString()} triangles; ${this.statsSlow} intervals over 16.7 ms in ${this.statsClock.toFixed(1)} s. Emulator results do not establish Quest performance. GPU timing and thermal testing need hardware.`;
  this.statsClock=0;this.statsFrames=0;this.statsCalls=0;this.statsTriangles=0;this.statsSlow=0;
 }
 private setText(step:string,title:string,hint:string,status:string){$('step').textContent=step;$('instruction').textContent=!this.renderer.xr.isPresenting&&title==='Bring your hands together.'?'Drag the two lights together.':!this.renderer.xr.isPresenting&&title==='Spread a little kindness.'?'Move one light to each shore.':title;$('hint').textContent=hint;$('status').textContent=status;}
 update(dt:number,time:number){
  this.measurePerformance(dt);dt=Math.min(dt,.05);this.lastTime=time;this.frameDesktop();this.updateSpatialControls();
  if(this.renderer.xr.isPresenting&&this.renderer.xr.getSession()?.visibilityState!=='visible'){this.walking=false;this.steady=0;return;}
  let tracked=true;
  if(this.renderer.xr.isPresenting){
   const frame=this.xrFrame,ref=this.renderer.xr.getReferenceSpace(),session=this.renderer.xr.getSession();let count=0;
   this.sourceTracked=[false,false];this.controllerInput=false;
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
    this.sourceTracked[i]=true;this.controllerInput||=!source.hand;count++;
   }
   tracked=this.assisted?count>=1:count===2;
   for(let i=0;i<2;i++)if(!this.sourceTracked[i])this.handInitialized[i]=false;
   if(tracked)this.trackingLost=0;else this.trackingLost+=dt;
  }else this.sourceTracked=[true,true];
  if(this.opening?.active){this.opening.update(dt,time,this.hands,tracked);return;}
  if(this.menuOpen){this.vrGuide.visible=false;this.label.visible=false;return;}
  this.saveClock+=dt;if(this.saveClock>1){this.saveClock=0;this.persistProgress();}
  const assistReady=this.assisted?this.updateAssist(dt,tracked):false;
  const sorted=[...this.hands].sort((a,b)=>a.x-b.x),a=sorted[0],b=sorted[1];
  const near=a.distanceTo(b)<.135;
  this.catchHold=near&&tracked&&!this.assisted?this.catchHold+dt:0;
  if(!this.woven&&this.catchHold>.15){this.woven=true;this.bridgeEnds[0].copy(a);this.bridgeEnds[1].copy(b);this.chime();this.setText('02 — MAKE A WAY','Spread a little kindness.','Move one marker to each glowing shore. Keep the path steady.','The thread remembers your hands');}
  const shoreHands=[a,b],edges=[leftEdge,rightEdge];
  for(let i=0;i<2;i++){
   const previous=this.shoreLatched[i];this.shoreLatched[i]=this.assisted?(this.woven&&tracked&&assistReady):(this.woven&&tracked&&shoreHands[i].distanceTo(edges[i])<(previous?.19:.14));
   if(this.shoreLatched[i]&&!previous)this.chime();
  }
  const match=this.shoreLatched.every(Boolean);
  const ready=this.woven&&match&&tracked;

  this.walking=false;
  if(ready){this.steady+=dt;
   if(this.progress===0&&this.steady>.35&&this.anticipation<1.6){
    this.anticipation+=dt;
    if(this.phase!=='test'){this.phase='test';this.chime();this.setText('03 — ONE BRAVE STEP','Is it safe?','Hold steady. Your traveler is testing the thread with one foot.','A little courage takes a moment');}
   }
   if(this.steady>.8&&(this.progress>0||this.anticipation>=1.6)&&this.progress<1){if(this.phase!=='cross'){this.phase='cross';this.chime();this.setText('03 — A LITTLE TRUST','You’re doing beautifully.','Keep the bridge in place. Your traveler is finding its courage.','Crossing, one small step at a time');}this.walking=true;const prev=Math.floor(this.progress*5);this.progress=clamp(this.progress+dt/9,0,1);if(Math.floor(this.progress*5)>prev)this.chime();}}
  else {this.steady=0;if((this.phase==='cross'||this.phase==='test')&&this.progress<1){this.phase='wait';this.setText('02 — HOLD THE THREAD','Take your time. It will wait.','Bring the markers back to the two shores. Your progress is safe.','A pause is part of the journey');}}
  if(this.progress>=1&&this.phase!=='home'){this.phase='home';this.chime(true);this.setText('04 — HOME, AT LAST','A small act. A whole world.','You held the space between. A little traveler found its way home.','Thank you for being here');}
  this.animateCreature(dt,time,ready);
  this.halo.position.copy(this.creature.position).add(new T.Vector3(0,.04,0));
  (this.halo.material as T.SpriteMaterial).opacity=.18+(ready?.12:0);
  this.homeGlow.intensity=.13+this.progress*.24;
  this.anchors.forEach((anchor,i)=>{const close=this.shoreLatched[i];const pulse=1+Math.sin(time*2+i)*.08;anchor.scale.setScalar(close?1.15:pulse);(anchor.material as T.MeshBasicMaterial).opacity=close?.95:.4;});
  this.lanterns.forEach((lantern,i)=>{lantern.position.y=lantern.userData.base+Math.sin(time*.4+i)*.015;});
  this.wisps.forEach((w,i)=>{w.position.x=w.userData.origin+Math.sin(time*.05+i)*.12;});
  this.markers.forEach((m,i)=>{m.position.copy(this.hands[i]);m.visible=this.sourceTracked[i];m.scale.setScalar(this.renderer.xr.isPresenting?.6:1);m.rotation.y=time*.3;(m.children[0] as T.Mesh<T.TorusGeometry,T.MeshBasicMaterial>).material.opacity=this.woven?.9:.45+Math.sin(time*3)*.15;});
  const snap=this.woven&&(match||this.progress>0);
  this.bridgeEnds.forEach((end,i)=>{const target=snap||this.shoreLatched[i]?edges[i]:shoreHands[i];if(!this.woven)end.copy(target);else end.lerp(target,1-Math.exp(-dt*16));});
  const start=snap?leftEdge:this.bridgeEnds[0],finish=snap?rightEdge:this.bridgeEnds[1];
  this.strands.forEach((line,i)=>{line.visible=this.woven;const positions=line.geometry.attributes.position;for(let j=0;j<33;j++){const t=j/32;const p=this.bridgePoint.lerpVectors(start,finish,t);const width=.055;
   if(i<7){p.z+=(i/6-.5)*width;p.y=snap?this.bridgeHeight(p.x)-.003:p.y-Math.sin(t*Math.PI)*.018; }
   else{const u=(i-7)/7;p.lerpVectors(start,finish,u);p.z+=(t-.5)*width;p.y=snap?this.bridgeHeight(p.x)-.003:p.y-Math.sin(u*Math.PI)*.018; }
   positions.setXYZ(j,p.x,p.y+.003,p.z);}positions.needsUpdate=true;line.geometry.computeBoundingSphere();(line.material as T.LineBasicMaterial).opacity=tracked?.65:.25;});
  this.motes.position.y=Math.sin(time*.3)*.008;
  this.updateGuide(tracked);
  $('progress').style.width=`${this.progress*100}%`;$('percent').textContent=`${Math.round(this.progress*100)}%`;
 }
}
