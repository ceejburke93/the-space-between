import {bevelBox} from './lib/hardsurface';
import * as T from '@iwsdk/core';
/** Four local transformations. Metres, Y up, ground Y=1.02.
 * Open center preserves hand targets and the existing horizon. */
export function createAwakenings(){
 const root=new T.Group();root.name='Awakenings';
 const mesh=(parent:T.Object3D,name:string,g:T.BufferGeometry,color:number,x:number,y:number,z:number,emissive=0)=>{const m=new T.Mesh(g,new T.MeshStandardMaterial({color,roughness:.8,emissive:color,emissiveIntensity:emissive}));m.name=name;m.position.set(x,y,z);parent.add(m);return m;};
 for(let chapter=0;chapter<4;chapter++){const region=new T.Group();region.name=`Awakening${chapter}`;root.add(region);
  if(chapter===0){
   for(let i=0;i<6;i++){const side=i%2?1:-1,pivot=new T.Group();pivot.name=`Canopy${i}`;pivot.position.set(side*(.63+Math.floor(i/2)*.16),1.43,-1.02-Math.floor(i/2)*.28);region.add(pivot);
    const leaf=mesh(pivot,'Leaf',new T.SphereGeometry(.2,14,8),i%2?0x75a784:0x9bbb83,side*-.15,.08,0);leaf.scale.set(1.5,.12,.65);leaf.rotation.z=side*-.25;
    mesh(pivot,'Branch',new T.CylinderGeometry(.007,.012,.32,6),0x668968,0,-.12,0);
   }
  }
  if(chapter===1){
   const stars=[[-.32,0,-1.5],[-.11,0,-1.75],[.11,0,-1.75],[.32,0,-1.5]];
   const points=stars.map(([x,,z])=>new T.Vector3(x,.728,z));
   const line=new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:0xb7e7e6,transparent:true,opacity:.7}));line.name='ReflectionLine';region.add(line);
   for(let i=0;i<4;i++)mesh(region,`ReflectionStar${i}`,new T.OctahedronGeometry(.023,0),0xc9e9df,points[i].x,.73,points[i].z,.7);
   for(let i=0;i<3;i++){const ring=new T.Mesh(new T.TorusGeometry(.2+i*.16,.003,4,56),new T.MeshBasicMaterial({color:0x95d4df,transparent:true,opacity:.35,depthWrite:false}));ring.name=`Ripple${i}`;ring.rotation.x=-Math.PI/2;ring.position.set(0,.725,-1.6);region.add(ring);}
  }
  if(chapter===2){
   for(let i=0;i<6;i++){const side=i%2?1:-1,points=[];for(let j=0;j<25;j++){const t=j/24;points.push(new T.Vector3(side*(.69+t*.52),.73+Math.sin(t*Math.PI)*(.22+(i%3)*.12),-.98-Math.floor(i/2)*.42-t*.35));}
    const line=new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:i%2?0xffc17b:0xe9a077,transparent:true,opacity:.85}));line.name=`Warmth${i}`;region.add(line);
   }
  }
  if(chapter===3){
   for(const side of [-1,1]){const wing=new T.Group();wing.name=side<0?'TerraceLeft':'TerraceRight';wing.position.set(side*.24,.92,-1.25);region.add(wing);
    for(let i=0;i<3;i++)mesh(wing,`Step${i}`,bevelBox(.3,.04,.12,.009,.014,3),0x9aa58e,0,i*.045,-i*.11);
   }
   const garden=new T.Group();garden.name='CommunalGarden';garden.position.set(0,.92,-1.36);region.add(garden);
   mesh(garden,'GardenGround',new T.CylinderGeometry(.24,.22,.03,24),0x78977b,0,-.01,0);
   const flowers=new T.InstancedMesh(new T.IcosahedronGeometry(.012,0),new T.MeshStandardMaterial({color:0xffd9a2,roughness:.8}),24);flowers.name='GardenFlowers';garden.add(flowers);
   for(let i=0;i<24;i++){const angle=i*2.399,r=.07+(i%4)*.035;flowers.setMatrixAt(i,new T.Matrix4().makeTranslation(Math.cos(angle)*r,.035,Math.sin(angle)*r));}flowers.instanceMatrix.needsUpdate=true;
   const pond=mesh(garden,'GardenPond',new T.CircleGeometry(.047,24),0x8fd4df,-.07,.008,.04,.15);pond.rotation.x=-Math.PI/2;
   mesh(garden,'GardenHearth',new T.ConeGeometry(.016,.05,7),0xffc283,.07,.027,.04,.6);
   mesh(garden,'GardenStone',new T.IcosahedronGeometry(.025,0),0xbab9a1,0,.02,-.055);
  }
 }
 return root;
}
