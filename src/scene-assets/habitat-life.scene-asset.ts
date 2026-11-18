import * as T from '@iwsdk/core';
import {habitatGround,terrainHeight,trailPoint} from '../terrain-profile';
import {createNatureModel} from './nature-kit.scene-asset';
import {batchStaticScenery} from '../batch-static';
/** Ground-relative path ribbons, separate from the puzzle crossing. */
export function createHabitatTrail(chapter:number,side:number,start=0,end=1,lit=false){
 const p:number[]=[],idx:number[]=[];for(let i=0;i<=50;i++){
  const t=start+(end-start)*i/50,{x,z}=trailPoint(side,t),w=lit?.018:.038;
  for(const edge of [-1,1]){const xx=x+edge*w;p.push(xx,habitatGround(chapter,xx,z)+(lit?.009:.005),z);}
  if(i<50){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();
 const m=new T.Mesh(g,new T.MeshStandardMaterial({color:lit?0xb6a477:[0x8c8667,0x9aaca0,0x80736b,0xaaa38b][chapter],roughness:1,emissive:lit?0xc4954c:0,emissiveIntensity:lit?.22:0}));m.name=lit?'LanternLitPath':'WindingHutPath';return m;
}
/** Localized life: six hand-height tufts, three saved ecological milestones and river glints. */
export function createHabitatLife(chapter:number){
 const root=new T.Group();root.name='HabitatLife';
 for(let i=0;i<6;i++){
  const tuft=new T.Group();tuft.name='TouchPlant'+i;const side=i<3?-1:1;
  tuft.position.set(side*(.57+(i%3)*.035),1.023,-.49+(i%3)*.025);
  const plant=createNatureModel(chapter===2?'bare':'grass',chapter);plant.scale.setScalar(chapter===2?.026:.11);tuft.add(plant);root.add(tuft);
 }
 for(let stage=0;stage<3;stage++){
  const patch=new T.Group();patch.name='Ecology'+stage;root.add(patch);
  if(stage<2){
   const side=stage===0?-1:1,cx=side*.78,cz=stage===0?-1.00:-1.10;patch.position.set(cx,terrainHeight(chapter,cx,cz),cz);
   for(let i=0;i<9;i++){
    const a=i*2.399,r=.055+Math.sqrt(i/9)*.12,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;
    const plant=createNatureModel(chapter===2?'rock':chapter===3?(i%3?'grass':'slab'):i%3?'grass':'bush',chapter);
    plant.scale.setScalar(chapter===2?.08+i%3*.02:.09+i%3*.025);plant.position.set(x-cx,terrainHeight(chapter,x,z)-patch.position.y,z-cz);patch.add(plant);
    if(stage===1){const bud=new T.Mesh(new T.SphereGeometry(.009,8,6),new T.MeshStandardMaterial({color:[0xc0b77e,0x9ad5d0,0xd49d69,0xb1c298][chapter],emissive:chapter===2?0xa86537:0,emissiveIntensity:.2,roughness:.8}));bud.name='GardenBud';bud.position.copy(plant.position);bud.position.y+=.045;patch.add(bud);}
   }
  }else{
   const metal=new T.MeshStandardMaterial({color:0x685e48,roughness:.9}),glow=new T.MeshStandardMaterial({color:0xe1c18a,emissive:0xdfa853,emissiveIntensity:.7,roughness:.7});
   for(const side of [-1,1]){
    patch.add(createHabitatTrail(chapter,side,0,.55,true));
    for(let i=0;i<2;i++){const {x,z}=trailPoint(side,.08+i*.30),y=habitatGround(chapter,x+side*.065,z);const lamp=new T.Group();lamp.name='RootedPathLantern';lamp.position.set(x+side*.065,y,z);patch.add(lamp);
     const stem=new T.Mesh(new T.CylinderGeometry(.005,.008,.08,6),metal);stem.name='LampStem';stem.position.y=.04;lamp.add(stem);
     const pod=new T.Mesh(new T.LatheGeometry([[.004,0],[.019,.012],[.021,.03],[.012,.045],[.002,.05]].map(([r,y])=>new T.Vector2(r,y)),12),glow);pod.name='LampSeed';pod.position.y=.075;lamp.add(pod);
    }
   }
  }
  batchStaticScenery(patch);patch.children.forEach((m,i)=>m.name='EcologySurface'+i);
 }
 const glints=new T.Group();glints.name='RiverGlints';root.add(glints);
 if(chapter!==2)for(let i=0;i<12;i++){
  const z=.3-i*.42,x=Math.sin(z*1.35)*.105;const mesh=new T.Mesh(new T.PlaneGeometry(.025+i%3*.009,.004),new T.MeshBasicMaterial({color:0xb5d6cf,transparent:true,opacity:.15,depthWrite:false}));mesh.name='WaterGlint'+i;mesh.rotation.x=-Math.PI/2;mesh.position.set(x,terrainHeight(chapter,x,z)+.012,z);glints.add(mesh);
 }
 return root;
}
