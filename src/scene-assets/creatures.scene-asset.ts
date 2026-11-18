import {batchStaticScenery} from '../batch-static';
import {creatureSurface,paintSkin,shapeStone,stonePoint} from './creature-surfaces';
import * as T from '@iwsdk/core';
const mat=(color:number,glow=0)=>new T.MeshStandardMaterial({color,roughness:.72,emissive:color,emissiveIntensity:glow});
/** Sculpted bodies share the existing foot plane, eye and arm anchors. +Z is front. */
export function createCreatureBody(chapter:number){
 const root=new T.Group();root.name=['LeafPod','RiverDrop','BraveFlame','MossStone'][chapter];
 const add=(name:string,g:T.BufferGeometry,m:T.Material,x=0,y=0,z=0)=>{const mesh=new T.Mesh(g,m);mesh.name=name;mesh.position.set(x,y,z);root.add(mesh);return mesh;};
 if(chapter===0){
  add('SeedBody',new T.LatheGeometry(new T.SplineCurve([[.0003,0],[.014,.003],[.024,.017],[.027,.035],[.019,.054],[.0003,.064]].map(([x,y])=>new T.Vector2(x,y))).getPoints(28),24),mat(0x648b62));
  const leaf=new T.Shape();leaf.moveTo(0,0);leaf.bezierCurveTo(-.026,.018,-.039,.065,-.008,.092);leaf.bezierCurveTo(.029,.073,.032,.026,0,0);
  const crown=add('LivingLeaf',new T.ExtrudeGeometry(leaf,{depth:.003,bevelEnabled:true,bevelThickness:.0015,bevelSize:.0015,bevelSegments:2,steps:1,curveSegments:12}),mat(0x39775a),0,.023,-.014);crown.rotation.z=-.16;
  const vein=[new T.Vector3(0,.006,.0056),new T.Vector3(-.002,.044,.0056),new T.Vector3(-.008,.084,.0056)];const midrib=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(vein),16,.001,4,false),mat(0xa5ba74));midrib.name='LeafVein';crown.add(midrib);
  const branches=new T.Group();branches.name='LeafBranchVeins';crown.add(branches);const branchMaterial=(midrib.material as T.Material).clone();
  for(let i=0;i<3;i++)for(const side of [-1,1]){const y=.025+i*.019,x=-.002-i*.002;const points=[new T.Vector3(x,y,.0049),new T.Vector3(x+side*.006,y+.006,.0049),new T.Vector3(x+side*(.012-i*.002),y+.010,.0049)];const vein=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),8,.00045,4,false),branchMaterial);vein.name='BranchVein';branches.add(vein);}
  batchStaticScenery(branches);branches.children[0].name='AttachedBranchVeins';
  const body=root.getObjectByName('SeedBody') as T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>;paintSkin(body.geometry,0x4c7255,0x9ab178,.07);body.material.color.setHex(0xffffff);body.material.vertexColors=true;
  for(const side of [-1,1]){const cheek=add('Cheek',new T.SphereGeometry(.004,8,6),mat(0xc4a679),side*.017,.036,.019);cheek.scale.set(1,.5,.3);}
 }
 if(chapter===1){
  const water=creatureSurface([{y:.004,rx:.002,depth:.002},{y:.012,rx:.019,depth:.017},{y:.029,rx:.028,depth:.024},{y:.048,rx:.024,depth:.021},{y:.065,rx:.012,depth:.011,cx:.002},{y:.089,rx:.0006,depth:.0006,cx:.009}]);
  paintSkin(water.geometry,0x28677f,0xa9d8d9,.089);
  add('WaterBody',water.geometry,new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.28,metalness:.02,emissive:0x315a68,emissiveIntensity:.09}));
  const currents=new T.Group();currents.name='SurfaceCurrents';root.add(currents);
  const currentMat=mat(0xb0dedc,.12);for(let k=0;k<2;k++){const points=[];for(let j=0;j<18;j++){const t=j/17;points.push(water.point(.015+t*.055,-Math.PI/2+(-.65+k*.85)*(1-t),.0006));}const current=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),20,.0008,4,false),currentMat);current.name='AttachedCurrent';currents.add(current);}
  batchStaticScenery(currents);currents.children[0].name='AttachedCurrents';
 }
 if(chapter===2){
  const fire=creatureSurface([{y:.005,rx:.004,depth:.004},{y:.015,rx:.024,depth:.017,cx:.002},{y:.034,rx:.027,depth:.019},{y:.054,rx:.015,depth:.012,cx:-.006},{y:.073,rx:.007,depth:.005,cx:-.003},{y:.097,rx:.0006,depth:.0006,cx:.012}]);
  paintSkin(fire.geometry,0xa64e30,0xffd49a,.10,true);
  const flameMat=new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.5,emissive:0xe8a15b,emissiveIntensity:.20});add('FlameBody',fire.geometry,flameMat);
  const tongue=creatureSurface([{y:.013,rx:.006,depth:.006,cx:-.016},{y:.028,rx:.010,depth:.009,cx:-.025},{y:.044,rx:.007,depth:.005,cx:-.029},{y:.063,rx:.0005,depth:.0005,cx:-.021}],18);
  paintSkin(tongue.geometry,0xb05d33,0xffd49a,.07,true);add('WarmHeart',tongue.geometry,flameMat);
 }
 if(chapter===3){
  const geometry=new T.SphereGeometry(.032,24,18);shapeStone(geometry);paintSkin(geometry,0x706b60,0xb5ac93,.078);
  add('StoneBody',geometry,new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.96}));
  const cap=new T.SphereGeometry(.032,24,9,0,Math.PI*2,0,1.08),p=cap.getAttribute('position');
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z,x),phi=Math.acos(T.MathUtils.clamp(y/.032,-1,1)),edge=phi/1.08,scallop=phi+Math.sin(a*5+.4)*.075*edge*edge;const r=.032*Math.sin(scallop);const v=stonePoint(Math.cos(a)*r,.032*Math.cos(scallop),Math.sin(a)*r,.028);p.setXYZ(i,v.x,v.y,v.z);}cap.computeVertexNormals();paintSkin(cap,0x3c6950,0x83a46a,.09);add('MossCap',cap,new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:1}));
  const mineral=mat(0xc4ba98);for(const side of [-1,1]){const points=[];for(let j=0;j<14;j++){const t=j/13,phi=1.22+t*.93,angle=side*(.66+Math.sin(t*Math.PI)*.14);points.push(stonePoint(Math.sin(angle)*Math.sin(phi)*.032,Math.cos(phi)*.032,Math.cos(angle)*Math.sin(phi)*.032,.022));}add('StoneSeam',new T.TubeGeometry(new T.CatmullRomCurve3(points),16,.0008,4,false),mineral);}
 }
 return root;
}
