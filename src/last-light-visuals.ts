import type {CompanionGuidance} from './companion-guidance';
import * as T from '@iwsdk/core';
import assets from './assets';
import {LastLight,LAST_LIGHT_NODES,sampleLastLightStream} from './last-light';
/** All effects remain inside the established tabletop; the camera and sky stay still. */
export class LastLightVisuals {
 readonly group=assets['last-light'].clone(true);
 private rings=this.group.getObjectByName('Invitations') as T.InstancedMesh;
 private stone=this.group.getObjectByName('ChannelStone')!;private roots=this.group.getObjectByName('ClosedRoots')!;
 private shelter=this.group.getObjectByName('LeafShelter')!;private seed=this.group.getObjectByName('LastSeed') as T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>;
 private ember=this.group.getObjectByName('HearthEmber') as T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>;
 private stream=this.group.getObjectByName('Stream') as T.Line<T.BufferGeometry,T.LineBasicMaterial>;
 private warmth=this.group.getObjectByName('WarmthLink') as T.Line<T.BufferGeometry,T.LineBasicMaterial>;
 private storm=this.group.getObjectByName('QuietStorm') as T.Points<T.BufferGeometry,T.PointsMaterial>;
 private matrix=new T.Matrix4();private position=new T.Vector3();private scale=new T.Vector3();private q=new T.Quaternion();private color=new T.Color();
 private aqueduct=this.group.getObjectByName('EarthAqueduct')!;private lift=this.group.getObjectByName('LiftRootsInvitation')!;private raised=0;private flowPoint={x:0,y:0,z:0};
 private route=0;private opening=0;private labels:T.Sprite[]=[];
 constructor(root:T.Group){
  for(const mesh of [this.stream,this.warmth,this.storm]){mesh.geometry=mesh.geometry.clone();mesh.material=mesh.material.clone();}
  this.seed.material=this.seed.material.clone();this.ember.material=this.ember.material.clone();this.group.visible=false;root.add(this.group);
  for(let i=0;i<2;i++){const c=document.createElement('canvas');c.width=192;c.height=64;const ctx=c.getContext('2d')!;ctx.fillStyle='#f5e5be';ctx.font='38px sans-serif';ctx.textAlign='center';ctx.fillText(i===0?'Roots':'Garden',96,45);const label=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c),depthTest:true}));label.scale.set(.12,.04,1);label.position.set(i===0?-.18:.18,1.14,-.34);this.group.add(label);this.labels.push(label);}

 }
 update(p:LastLight,active:boolean,dt:number,time:number,guidance:CompanionGuidance){
  this.group.visible=active;if(!active)return;
  this.raised=T.MathUtils.lerp(this.raised,p.aqueduct?1:0,1-Math.exp(-dt*5));this.aqueduct.visible=this.raised>.01;this.aqueduct.scale.y=Math.max(.001,this.raised);this.lift.visible=!p.released&&guidance.level>0&&p.channel===1&&!p.aqueduct;
  this.route=T.MathUtils.lerp(this.route,p.channel===2?1:0,1-Math.exp(-dt*6));this.opening=T.MathUtils.lerp(this.opening,p.roots?1:0,1-Math.exp(-dt*4));
  this.stone.position.x=T.MathUtils.lerp(this.stone.position.x,p.channel===1?-.18:p.channel===2?.18:0,1-Math.exp(-dt*6));
  this.stone.rotation.y=p.channel===2?-.8:.8;this.stone.position.y=1.025+this.raised*.09;this.roots.position.y=-this.opening*.055;this.shelter.visible=p.shelter;
  this.rings.visible=!p.released;for(const label of this.labels)label.visible=!p.released;
  for(let i=0;i<6;i++){
   const n=LAST_LIGHT_NODES[i],need=guidance.need,on=i<2&&(need==='roots'||need==='dry-hearth')||i===2&&need==='water'||i===3&&need==='shelter'&&!(p.anchors&1)||i===4&&need==='shelter'&&!(p.anchors&2)||i===5&&need==='warmth';
   this.position.set(n.x,n.y,n.z);this.q.setFromAxisAngle(T.Object3D.DEFAULT_UP,0);if(i!==5)this.q.setFromAxisAngle(this.position.set(1,0,0),-Math.PI/2);this.position.set(n.x,n.y,n.z);
   this.scale.setScalar(on?(i===5?4:1)*(guidance.level>0?1+Math.sin(time*1.7)*.08:1):.001);this.matrix.compose(this.position,this.q,this.scale);this.rings.setMatrixAt(i,this.matrix);
   this.color.setHex(i===0&&p.channel===1||i===1&&p.channel===2?0xb4d99e:i===2?0x9edee8:i===5?0xffc08a:0xeacb91);this.rings.setColorAt(i,this.color);
  }this.rings.instanceMatrix.needsUpdate=true;if(this.rings.instanceColor)this.rings.instanceColor.needsUpdate=true;this.rings.computeBoundingSphere();
  this.group.getObjectByName('WaterInvitation')!.visible=!p.flow;
  this.stream.visible=p.flow;this.stream.material.color.setHex(p.cooling?0x9edee8:0x8dc7d3);
  const stream=this.stream.geometry.getAttribute('position'),warm=this.warmth.geometry.getAttribute('position');
  for(let i=0;i<33;i++){const t=i/32;sampleLastLightStream(t,p.channel,false,this.flowPoint);const groundX=this.flowPoint.x,groundY=this.flowPoint.y,groundZ=this.flowPoint.z;if(this.raised>.001){sampleLastLightStream(t,1,true,this.flowPoint);this.flowPoint.x=T.MathUtils.lerp(groundX,this.flowPoint.x,this.raised);this.flowPoint.y=T.MathUtils.lerp(groundY,this.flowPoint.y,this.raised);this.flowPoint.z=T.MathUtils.lerp(groundZ,this.flowPoint.z,this.raised);}stream.setXYZ(i,this.flowPoint.x,this.flowPoint.y,this.flowPoint.z);warm.setXYZ(i,-.23+t*.61,1.038+Math.sin(t*Math.PI)*.025,-.62);}
  stream.needsUpdate=warm.needsUpdate=true;this.stream.geometry.computeBoundingSphere();this.warmth.geometry.computeBoundingSphere();this.warmth.visible=p.warmth;
  this.ember.material.emissiveIntensity=p.warmth?1.3:p.cooling?.03:.15+p.formation*.7;this.ember.scale.setScalar(p.cooling?.5:p.warmth?1.4:1);
  const crossing=p.released?T.MathUtils.clamp((p.time-15)/8,0,1):0;this.seed.position.set(-.23+crossing*.61,1.052,-.62);this.seed.material.emissiveIntensity=p.warmth?.8:.15;this.seed.rotation.z=Math.sin(time*1.3)*.08;
  this.group.getObjectByName('HomeBloom')!.visible=p.released&&p.time>=23;
  const points=this.storm.geometry.getAttribute('position'),fade=p.released?Math.max(0,1-p.time/12):1;this.storm.material.opacity=fade*.32;
  for(let i=0;i<40;i++){const u=(time*.08+i*.618)%1;points.setXYZ(i,-.38+u*.76,1.22+(i%7)*.035,-.86-(i%3)*.025);}
  points.needsUpdate=true;this.storm.geometry.computeBoundingSphere();
 }
}
