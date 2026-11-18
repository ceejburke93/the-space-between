import * as T from '@iwsdk/core';
import {createCreatureBody} from './creatures.scene-asset';
import {batchStaticScenery} from '../batch-static';
/** Root-local metres, deck contact Y=1.02. Garden envelope X -.34...56, Z -.79..-.38.
 * Petals articulate at their attached stem; learner feet contact the island deck. */
export function createWorldMemory(){
 const root=new T.Group();root.name='WorldMemory';
 const stone=new T.MeshStandardMaterial({color:0xb7b094,roughness:.9}),green=new T.MeshStandardMaterial({color:0x7fad80,roughness:.8}),blue=new T.MeshStandardMaterial({color:0x80cbd8,emissive:0x498e9c,emissiveIntensity:.25,roughness:.35}),warm=new T.MeshStandardMaterial({color:0xf3c582,emissive:0xefab65,emissiveIntensity:.3});
 const add=(p:T.Object3D,name:string,g:T.BufferGeometry,m:T.Material,x=0,y=0,z=0)=>{const mesh=new T.Mesh(g,m);mesh.name=name;mesh.position.set(x,y,z);p.add(mesh);return mesh;};
 for(const raised of [true,false]){
  const village=new T.Group();village.name=raised?'ArchSettlement':'RiverGarden';root.add(village);
  for(let i=0;i<(raised?2:3);i++){
   const x=raised?(i===0?-.29:.29):.26+i*.045,z=raised?-.70:-.46-i*.035;
   if(raised){const home=add(village,'Dwelling',new T.SphereGeometry(.022,10,8),stone,x,1.035,z);home.scale.y=.65;const roof=add(village,'LivingRoof',new T.SphereGeometry(.026,10,6,0,Math.PI*2,0,Math.PI/2),green,x,1.045,z);add(village,'Door',new T.SphereGeometry(.006,8,6),warm,x,1.035,z+.021).scale.set(1,1.2,.25);}
   else {const pts=[new T.Vector3(x-.018,1.023,z),new T.Vector3(x,1.06,z+.005),new T.Vector3(x+.01,1.07,z)];add(village,'BankPlant',new T.TubeGeometry(new T.CatmullRomCurve3(pts),8,.002,4,false),green);const leaf=add(village,'BankLeaf',new T.SphereGeometry(.014,8,6),green,x+.008,1.05,z);leaf.scale.set(1,.2,1.5);add(village,'BankFlower',new T.SphereGeometry(.008,8,6),warm,x+.01,1.071,z);}
  }batchStaticScenery(village);
 }
 const water=new T.Line(new T.BufferGeometry().setFromPoints(Array.from({length:25},(_,i)=>{const t=i/24;return new T.Vector3(.24+Math.sin(t*Math.PI)*.11,1.026,-.43-t*.27);})),new T.LineBasicMaterial({color:0x8ed6df}));water.name='SeedTributary';root.add(water);
 add(root,'SupportStone',new T.CylinderGeometry(.025,.03,.012,8),stone,.40,1.026,-.48);
 for(let i=0;i<3;i++)add(root,'TeachingStone',new T.CylinderGeometry(.018,.020,.004,8),stone,.32+i*.05,1.022,-.64);
 const bud=new T.Group();bud.name='SharedFlower';bud.position.set(.25,1.022,-.70);root.add(bud);
 add(bud,'MineralCalyx',new T.CylinderGeometry(.024,.029,.012,8),stone,0,.006);
 add(bud,'LivingStem',new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(0,.01,0),new T.Vector3(.004,.038,0),new T.Vector3(0,.07,0)]),12,.003,5,false),green);
 add(bud,'RiverHeart',new T.SphereGeometry(.012,12,8),blue,0,.074);
 for(let i=0;i<6;i++){const pivot=new T.Group();pivot.name='Petal'+i;pivot.position.y=.068;pivot.rotation.y=i*Math.PI/3;bud.add(pivot);const leaf=add(pivot,'LeafPetal',new T.SphereGeometry(.020,12,8),green,0,.004,.019);leaf.scale.set(.65,.17,1.3);const vein=add(pivot,'WarmVein',new T.CylinderGeometry(.0009,.0009,.025,6),warm,0,.008,.019);vein.rotation.x=Math.PI/2;}
 const learner=new T.Group();learner.name='Newcomer';learner.position.set(.29,1.022,-.73);root.add(learner);const body=createCreatureBody(0);body.name='LearnerBody';body.scale.setScalar(.48);learner.add(body);
 for(const side of [-1,1]){add(learner,'Eye',new T.SphereGeometry(.002,8,6),new T.MeshBasicMaterial({color:0x173831}),side*.0045,.022,.012);add(learner,'Foot'+side,new T.SphereGeometry(.004,8,6),stone,side*.006,.004,.004).scale.y=.5;const arm=add(learner,'LearnerArm'+side,new T.CylinderGeometry(.0018,.0018,.014,6),green,side*.014,.017);arm.rotation.z=side*.3;}
 let surface=0;root.traverse(o=>{if(o instanceof T.Mesh&&!o.name)o.name='MemorySurface'+surface++;});
 return root;
}
