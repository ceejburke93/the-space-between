import * as T from '@iwsdk/core';
import {batchStaticScenery} from '../batch-static';
/** Deck-grounded milestone patches, X -.70..-.30, Y=1.02, Z -.54..-.39.
 * Clear of the crossing and every puzzle anchor. Each patch grows from its soil pivot. */
export function createChapterRestoration(){
 const root=new T.Group();root.name='ChapterRestoration';
 const green=new T.MeshStandardMaterial({color:0x55966c,roughness:.86}),vein=new T.MeshStandardMaterial({color:0xa8c583,roughness:.8}),stone=new T.MeshStandardMaterial({color:0x64766b,roughness:.95}),water=new T.MeshStandardMaterial({color:0x62a9bd,roughness:.25,metalness:.08}),warm=new T.MeshStandardMaterial({color:0xe0a86d,emissive:0xc37b42,emissiveIntensity:.23,roughness:.8});
 const add=(parent:T.Object3D,name:string,geometry:T.BufferGeometry,material:T.Material,x=0,y=0,z=0)=>{const mesh=new T.Mesh(geometry,material);mesh.name=name;mesh.position.set(x,y,z);parent.add(mesh);return mesh;};
 const leaf=new T.Shape();leaf.moveTo(0,0);leaf.bezierCurveTo(-.020,.015,-.016,.042,0,.068);leaf.bezierCurveTo(.016,.042,.020,.015,0,0);
 const blade=new T.ExtrudeGeometry(leaf,{depth:.001,bevelEnabled:true,bevelSize:.0004,bevelThickness:.0004,bevelSegments:1,steps:1,curveSegments:8});
 for(let chapter=0;chapter<4;chapter++){
  const region=new T.Group();region.name='Restoration'+chapter;root.add(region);
  for(let i=0;i<3;i++){
   const patch=new T.Group();patch.name='Milestone'+i;patch.position.set(-.62+i*.12,1.02,i===1?-.43:-.48);region.add(patch);
   if(chapter===0){for(let j=0;j<5;j++){const frond=new T.Group();frond.rotation.y=j*Math.PI*2/5;patch.add(frond);const mesh=add(frond,'FernBlade',blade.clone(),green);mesh.rotation.x=-.5;const rib=add(frond,'AttachedMidrib',new T.CylinderGeometry(.0007,.001,.045,5),vein,0,.024,-.012);rib.rotation.x=-.5;}add(patch,'NewBud',new T.SphereGeometry(.006,10,6),vein,0,.020);}
   if(chapter===1){const pool=add(patch,'ShorePool',new T.CylinderGeometry(.042,.046,.003,24),water,0,.002);pool.scale.z=.65;for(let j=0;j<3;j++){const x=-.025+j*.018;add(patch,'RiverReed',new T.CylinderGeometry(.001,.002,.048+j*.008,5),green,x,.026,-.017);const tip=add(patch,'ReedHead',new T.SphereGeometry(.004,8,6),vein,x,.052+j*.008,-.017);tip.scale.y=1.6;}}
   if(chapter===2){const cup=add(patch,'WarmStone',new T.SphereGeometry(.033,12,8),stone,0,.009);cup.scale.set(1,.3,.7);const ember=add(patch,'ShelteredEmber',new T.LatheGeometry([[.001,0],[.012,.006],[.014,.018],[.006,.034],[.0003,.045]].map(([x,y])=>new T.Vector2(x,y)),12),warm,0,.012);ember.scale.z=.7;}
   if(chapter===3){for(let j=0;j<3;j++){const rock=add(patch,'SettledStone',new T.DodecahedronGeometry(.018-j*.003,0),stone,(j-1)*.014,.008+j*.011,0);rock.scale.y=.55;}const stem=add(patch,'CrackStem',new T.CylinderGeometry(.001,.0015,.033,5),green,.022,.018);add(patch,'StoneFlower',new T.SphereGeometry(.007,10,6),vein,.022,.037);}
   batchStaticScenery(patch);patch.children.forEach((part,j)=>part.name='RestoredSurface'+j);
  }
 }
 return root;
}
