import assets from './assets';
import * as T from '@iwsdk/core';
const Y=1.02,Z=-.62;
export class ElementVisuals {
 readonly group=new T.Group();private looks:T.Group[]=[];private originals:T.Object3D[];
 private common:T.Object3D[];private lastChapter=-1;
 private river:T.Mesh;private firePath:T.Points;private stonePath=new T.Group();private arrow:T.Line;private orbit:T.Line;private stoneInstances:T.InstancedMesh;
 constructor(root:T.Group,torso:T.Group,eyes:T.Group){
  root.add(this.group);this.common=torso.children.filter(child=>child.userData.common);this.originals=torso.children.filter(child=>child!==eyes&&!child.userData.common);
  const mesh=(geo:T.BufferGeometry,color:number,parent:T.Object3D,x=0,y=0,z=0)=>{const m=new T.Mesh(geo,new T.MeshStandardMaterial({color,roughness:.8}));m.position.set(x,y,z);parent.add(m);return m;};
  for(let i=1;i<4;i++){const body=assets[(['water-hero','fire-hero','earth-hero'] as const)[i-1]].clone(true);body.traverse(object=>{if(object instanceof T.Mesh)object.material=(object.material as T.Material).clone();});torso.add(body);this.looks.push(body);}
  const points=Array.from({length:25},(_,i)=>{const t=i/24;return new T.Vector3(-.23+t*.46,Y+.003-Math.sin(t*Math.PI)*.018,Z);});
  this.river=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),32,.025,8,false),new T.MeshStandardMaterial({color:0x8fdbe6,emissive:0x367e95,emissiveIntensity:.3,transparent:true,opacity:.65,roughness:.3}));this.group.add(this.river);
  this.firePath=new T.Points(new T.BufferGeometry().setFromPoints(points),new T.PointsMaterial({color:0xffd098,size:.009}));this.group.add(this.firePath);
  this.group.add(this.stonePath);this.stonePath.position.z=Z;mesh(new T.BoxGeometry(.49,.012,.055),0x9d9b84,this.stonePath,0,Y-.003,0);
  this.stoneInstances=new T.InstancedMesh(new T.CylinderGeometry(.033,.028,.014,7),new T.MeshStandardMaterial({color:0xb6b29b,roughness:.8}),9);for(let i=0;i<9;i++)this.stoneInstances.setMatrixAt(i,new T.Matrix4().makeTranslation(-.23+i*.0575,Y-.004,0));this.stoneInstances.instanceMatrix.needsUpdate=true;this.stonePath.add(this.stoneInstances);
  this.arrow=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(0,Y-.05,Z+.08),new T.Vector3(0,Y+.2,Z+.08),new T.Vector3(-.025,Y+.165,Z+.08),new T.Vector3(0,Y+.2,Z+.08),new T.Vector3(.025,Y+.165,Z+.08)]),new T.LineBasicMaterial({color:0xafe3e8,transparent:true,opacity:.6}));this.group.add(this.arrow);
  this.orbit=new T.Line(new T.BufferGeometry().setFromPoints(Array.from({length:65},(_,i)=>new T.Vector3(Math.cos(i/64*Math.PI*2)*.16,Y+.11+Math.sin(i/64*Math.PI*2)*.16,Z+.1))),new T.LineBasicMaterial({color:0xffc282,transparent:true,opacity:.5}));this.group.add(this.orbit);
 }
 update(chapter:number,formation:number,woven:boolean,time:number,widened=false,care=0){
  if(this.lastChapter!==chapter){this.lastChapter=chapter;this.common.forEach(group=>group.traverse(object=>{if(object instanceof T.Mesh&&object.material instanceof T.MeshStandardMaterial)object.material.color.setHex([0xa6c98a,0x85d0e0,0xffc26c,0xb9a58b][chapter]);}));}
  this.originals.forEach(o=>o.visible=chapter===0);this.looks.forEach((o,i)=>o.visible=chapter===i+1);
  this.river.visible=chapter===1&&(woven||formation>.02);this.river.scale.x=woven?1:Math.max(.001,formation);
  const ember=this.looks[1].children[0] as T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>;ember.material.emissiveIntensity=.22+care*.28;
  this.firePath.visible=chapter===2&&woven;
  this.stonePath.visible=chapter===3;this.stoneInstances.position.y=-(1-(woven?1:formation))*.08;this.stonePath.scale.z=T.MathUtils.lerp(this.stonePath.scale.z,widened?1.6:1,.08);
  this.arrow.visible=(chapter===1||chapter===3)&&!woven;this.arrow.scale.y=chapter===3?-1:1;this.arrow.position.y=chapter===3?2*Y+.12:0;
  this.orbit.visible=chapter===2&&!woven;this.orbit.geometry.setDrawRange(0,Math.max(5,Math.round(65*(1-formation))));
 }
}
