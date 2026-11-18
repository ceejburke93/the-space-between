import assets from './assets';
import * as T from '@iwsdk/core';
const Y=1.02,Z=-.62,GOLD=0xf6d58c;
const RESIDENT_COLORS=[0xa6c98a,0x85d0e0,0xffc26c,0xb9a58b];
/** Small, world-anchored rewards. No camera effects or screen-filling particles. */
export class JourneyVisuals {
 readonly group=new T.Group();readonly friend=new T.Group();readonly seed=new T.Group();readonly lantern=new T.Group();readonly greetingRing:T.Mesh;
 private pond!:T.Mesh;private hearth!:T.Mesh;private cairn=new T.Group();
 private memories:T.Points;private stars:T.Mesh[]=[];private paths:T.Line[]=[];private blossoms:T.InstancedMesh;private doors:T.Mesh[]=[];
 private head=new T.Group();private arms:T.Mesh[]=[];private residentFeet:T.Mesh[]=[];
 private residents:T.Group[]=[];private residentChapter=-1;
 get residentElement(){for(let i=0;i<this.residents.length;i++)if(this.residents[i].visible)return i;return -1;}
 get residentModel(){const i=this.residentElement;return i<0?'':this.residents[i].name;}

 constructor(root:T.Group){
  root.add(this.group);
  const mesh=(geometry:T.BufferGeometry,color:number,parent:T.Object3D,x=0,y=0,z=0)=>{const result=new T.Mesh(geometry,new T.MeshStandardMaterial({color,roughness:.8}));result.position.set(x,y,z);parent.add(result);return result;};
  this.friend.name='HomeResident';this.friend.position.set(.53,Y,Z+.015);this.group.add(this.friend);this.friend.add(this.head);
  for(const id of ['leaf-hero','water-hero','fire-hero','earth-hero'] as const){const body=assets[id].clone(true);body.scale.setScalar(.85);body.visible=false;this.head.add(body);this.residents.push(body);}
  for(const x of [-.008,.008])mesh(new T.SphereGeometry(.004,8,6),0x20342e,this.head,x,.043,.019);
  for(const x of [-.012,.012]){const foot=mesh(new T.SphereGeometry(.008,8,6),0x6a8866,this.friend,x,.004,.008);foot.scale.y=.5;this.residentFeet.push(foot);}
  for(const x of [-1,1]){const arm=mesh(new T.CapsuleGeometry(.003,.023,3,5),0xa0bf8e,this.head,x*.026,.034);arm.rotation.z=x*.7;this.arms.push(arm);}
  for(let i=0;i<4;i++){
   const star=mesh(new T.IcosahedronGeometry(.012,0),GOLD,this.group,[-.3,-.1,.1,.3][i],1.72+[0,.12,.12,0][i],-1.55);(star.material as T.MeshStandardMaterial).emissive.setHex(GOLD);(star.material as T.MeshStandardMaterial).emissiveIntensity=1.5;this.stars.push(star);
   if(i>0){const path=new T.Line(new T.BufferGeometry().setFromPoints([this.stars[i-1].position,star.position]),new T.LineBasicMaterial({color:GOLD,transparent:true,opacity:.55}));this.paths.push(path);this.group.add(path);}
   const door=new T.Mesh(new T.CircleGeometry(.026,24),new T.MeshBasicMaterial({color:GOLD,transparent:true,opacity:.1}));door.position.set(i===2?-.55:.54,Y+.063,Z+.003);if(i===2)door.position.z=Z+.003;this.group.add(door);this.doors.push(door);
  }
  const memoryPositions:number[]=[];for(let chapter=0;chapter<4;chapter++)for(let i=0;i<3;i++){const angle=i/3*Math.PI*2;memoryPositions.push([-.3,-.1,.1,.3][chapter]+Math.cos(angle)*.027,1.72+[0,.12,.12,0][chapter]+Math.sin(angle)*.027,-1.54);}
  this.memories=new T.Points(new T.BufferGeometry().setFromPoints(Array.from({length:12},(_,i)=>new T.Vector3(...memoryPositions.slice(i*3,i*3+3) as [number,number,number]))),new T.PointsMaterial({color:GOLD,size:.006}));this.group.add(this.memories);
  const stems=new T.InstancedMesh(new T.CylinderGeometry(.001,.0015,.032,4),new T.MeshStandardMaterial({color:0x7fa782,roughness:.8}),9);this.group.add(stems);
  this.blossoms=new T.InstancedMesh(new T.IcosahedronGeometry(.009,0),new T.MeshStandardMaterial({color:0xffffff,roughness:.8}),9);this.group.add(this.blossoms);
  for(let i=0;i<9;i++){const x=.38+(i%3)*.06,z=Z+.07+Math.floor(i/3)*.035;stems.setMatrixAt(i,new T.Matrix4().makeTranslation(x,Y+.021,z));this.blossoms.setMatrixAt(i,new T.Matrix4().makeTranslation(x,Y+.04,z));this.blossoms.setColorAt(i,new T.Color(i%2?0xffd799:0xc4dcc3));}stems.instanceMatrix.needsUpdate=true;this.blossoms.instanceMatrix.needsUpdate=true;
  mesh(new T.IcosahedronGeometry(.016,1),0xddb077,this.seed,0,0,0);mesh(new T.ConeGeometry(.008,.024,3),0x8fb989,this.seed,.008,.016,0);
  const lamp=mesh(new T.SphereGeometry(.017,10,8),0xffda91,this.lantern);(lamp.material as T.MeshStandardMaterial).emissive.setHex(GOLD);(lamp.material as T.MeshStandardMaterial).emissiveIntensity=.3;
  const hoop=mesh(new T.TorusGeometry(.021,.002,5,16),0x8a9277,this.lantern,0,.014,0);
  this.pond=mesh(new T.CircleGeometry(.05,24),0x7fcbd6,this.group,.48,Y+.006,Z+.14);this.pond.rotation.x=-Math.PI/2;
  this.hearth=mesh(new T.ConeGeometry(.025,.065,7),0xffc07b,this.group,-.48,Y+.04,Z+.09);(this.hearth.material as T.MeshStandardMaterial).emissive.setHex(0xffad55);(this.hearth.material as T.MeshStandardMaterial).emissiveIntensity=1.2;
  this.cairn.position.set(.65,Y,Z+.07);this.group.add(this.cairn);for(let i=0;i<3;i++){const rock=mesh(new T.IcosahedronGeometry(.025-i*.004,0),0xb8b49d,this.cairn,0,.012+i*.026);rock.scale.y=.6;}
  this.greetingRing=new T.Mesh(new T.TorusGeometry(.044,.002,5,32),new T.MeshBasicMaterial({color:GOLD,transparent:true,opacity:.8}));this.group.add(this.greetingRing);
 }
 attachCargo(torso:T.Group){torso.add(this.seed,this.lantern);this.seed.position.set(0,.028,.04);this.lantern.position.set(0,.032,.04);}
 update(total:number,chapter:number,encounter:number,ending:number,time:number,challenge:boolean,lanternLit:boolean,kindnesses=0){
  if(this.residentChapter!==chapter){
   this.residentChapter=chapter;for(let i=0;i<4;i++)this.residents[i].visible=i===chapter;
   for(const arm of this.arms)(arm.material as T.MeshStandardMaterial).color.setHex(RESIDENT_COLORS[chapter]);
   for(const foot of this.residentFeet){foot.visible=chapter===0||chapter===3;(foot.material as T.MeshStandardMaterial).color.setHex(RESIDENT_COLORS[chapter]);}
  }
  const completed=Math.floor(total/3);this.memories.geometry.setDrawRange(0,total);
  const reveal=completed>chapter?1:T.MathUtils.clamp((ending-2.5)/2,0,1);
  this.stars.forEach((star,i)=>{star.visible=i<completed||(i===chapter&&encounter===2&&ending>2.5);star.scale.setScalar(i<completed?1:Math.max(.001,reveal));});
  this.paths.forEach((line,i)=>line.visible=i+1<completed||(i+1===chapter&&encounter===2&&ending>3.8));
  this.blossoms.visible=!!(kindnesses&(1<<chapter)); // Optional puzzle kindnesses grow an extra flower patch.
  this.doors.forEach((door,i)=>{door.visible=i<completed||(i===chapter&&ending>0);(door.material as T.MeshBasicMaterial).opacity=i<completed?.8:.15+T.MathUtils.clamp(ending/3,0,1)*.65;});
  this.friend.visible=ending>.9||total>0;
  this.head.position.y=this.friend.visible?(chapter===1||chapter===2?.015+Math.sin(time*2)*.002:Math.sin(time*2)*.001):0;
  this.friend.rotation.y=ending<2?-.8:0;
  this.arms[0].rotation.z=-.7-(ending>1&&ending<4?Math.sin(ending*5)*.3:0);
  this.seed.visible=chapter===0&&encounter>0;this.lantern.visible=false;
  this.pond.visible=completed>=2||(chapter===1&&ending>2);this.hearth.visible=completed>=3||(chapter===2&&ending>2);this.cairn.visible=completed>=4||(chapter===3&&ending>2);
  const light=this.lantern.children[0] as T.Mesh<T.SphereGeometry,T.MeshStandardMaterial>;light.material.emissiveIntensity=lanternLit?2:.25;
  this.greetingRing.visible=challenge;this.greetingRing.position.set(.0416,Y+.075,Z+.04);this.greetingRing.scale.setScalar(1+Math.sin(time*2)*.08);
 }
}
