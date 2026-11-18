import * as T from '@iwsdk/core';
import {batchStaticScenery} from '../batch-static';
import {terrainHeight} from '../terrain-profile';
import {createHabitatLife,createHabitatTrail} from './habitat-life.scene-asset';
import {createNatureModel,NatureKind} from './nature-kit.scene-asset';
const LAND=[0x789b70,0x7ba7aa,0x675459,0x949982],ROCK=[0x425a4c,0x466372,0x3d3540,0x6b7164];
/** Authored habitat kit. Deck contact stays at local Y=.025, radius .26m. */
export function createIslandWorld(chapter=0){
 const root=new T.Group();root.name=['LivingGlade','TidalHaven','EmberHollow','StoneSanctuary'][chapter];
 const mats=new Map<string,T.MeshStandardMaterial>();
 const mat=(color:number,glow=0)=>{const key=color+':'+glow;if(!mats.has(key))mats.set(key,new T.MeshStandardMaterial({color,roughness:.86,emissive:glow?color:0,emissiveIntensity:glow}));return mats.get(key)!;};
 const mesh=(name:string,g:T.BufferGeometry,color:number,x=0,y=0,z=0,glow=0,parent:T.Object3D=root)=>{const m=new T.Mesh(g,mat(color,glow));m.name=name;m.position.set(x,y,z);parent.add(m);return m;};
 const profile=[new T.Vector2(.38,-1.02),new T.Vector2(.34,-.72),new T.Vector2(.27,-.36),new T.Vector2(.23,-.22),new T.Vector2(.225,-.13),new T.Vector2(.25,-.045),new T.Vector2(.26,.006)];
 const cliff=new T.LatheGeometry(new T.SplineCurve(profile).getPoints(24),48),p=cliff.getAttribute('position');for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z,x),f=1+Math.sin(a*5+y*13)*.055+Math.sin(a*9-y*8)*.025+Math.sin(y*105)*.018;p.setXYZ(i,x*f,y,z*f);}cliff.computeVertexNormals();mesh('WeatheredCliff',cliff,ROCK[chapter]);
 const deck=new T.CylinderGeometry(.258,.264,.023,48),dp=deck.getAttribute('position');for(let i=0;i<dp.count;i++){const x=dp.getX(i),z=dp.getZ(i),a=Math.atan2(z,x),f=1+.012*Math.sin(a*5)+.012*Math.sin(a*9);dp.setX(i,x*f);dp.setZ(i,z*f);}deck.computeVertexNormals();mesh('LivingDeck',deck,LAND[chapter],0,.0135);
 for(let j=0;j<3;j++){const rim=mesh('ErodedStratum',new T.TorusGeometry(.25-j*.038,.009,5,48),j%2?ROCK[chapter]:LAND[chapter],0,-.035-j*.075);rim.rotation.x=Math.PI/2;rim.scale.y=.94;}
 // Low planting and stepping stones leave the bridge-facing half clear.
 for(let i=0;i<12;i++){const a=i*2.399,r=.18+(i%3)*.018,x=Math.cos(a)*r,z=Math.sin(a)*r;if(z<-.12)continue;const stone=mesh('ShoreStone',new T.SphereGeometry(.018+(i%2)*.006,10,7),chapter===2?0x82655e:0xb1b39a,x,.027,z);stone.scale.set(1,.22,.7);}
 // Grounded contact shading is authored into vertex colors, with no screen-space pass.
 const shade=new T.CircleGeometry(.105,40),shadePos=shade.getAttribute('position'),shadeColors=new Float32Array(shadePos.count*3),shadeColor=new T.Color(),soil=new T.Color(LAND[chapter]),dark=new T.Color(0x2c4036);for(let i=0;i<shadePos.count;i++){shadeColor.copy(i===0?dark:soil);shadeColors.set([shadeColor.r,shadeColor.g,shadeColor.b],i*3);}shade.setAttribute('color',new T.BufferAttribute(shadeColors,3));const contact=new T.Mesh(shade,new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.86,emissiveIntensity:0}));contact.name='HomeContactShade';contact.rotation.x=-Math.PI/2;contact.position.set(-.035,.0252,-.10);root.add(contact);
 const house=new T.Group();house.name='ElementHome';house.position.set(-.035,.025,-.10);root.add(house);
 const walls=mesh('RoundedWalls',new T.LatheGeometry([[.064,0],[.073,.025],[.068,.09],[.05,.135],[.012,.15]].map(([r,y])=>new T.Vector2(r,y)),28),[0x827c59,0x91b6b8,0x765654,0xb4ad90][chapter],0,0,0,0,house);
 const roofProfile=chapter===1?[[0,.23],[.025,.218],[.074,.181],[.108,.142],[.105,.13],[.064,.145],[0,.16]]:chapter===2?[[0,.225],[.027,.215],[.068,.17],[.102,.145],[.103,.133],[.06,.15],[0,.163]]:[[0,.23],[.032,.215],[.084,.177],[.117,.147],[.12,.134],[.075,.15],[0,.165]];
 const roofGeometry=chapter===3?new T.SphereGeometry(.09,28,14,0,Math.PI*2,0,Math.PI/2):new T.LatheGeometry(roofProfile.map(([r,y])=>new T.Vector2(Math.max(.0003,r),y)),32);
 if(chapter===1){const p=roofGeometry.getAttribute('position');for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=p.getY(i),f=1+.10*Math.sin(Math.atan2(z,x)*5)*Math.sin(Math.max(0,y-.13)*Math.PI/.10);p.setX(i,x*f);p.setZ(i,z*f);}roofGeometry.computeVertexNormals();}
 const roof=mesh('SculptedRoof',roofGeometry,[0x3e6950,0x4f8394,0x483d47,0x717d67][chapter],0,chapter===3?.13:0,0,0,house);if(chapter===3)roof.scale.y=.9;
 if(chapter===2){const chimney=mesh('WarmChimney',new T.CylinderGeometry(.016,.022,.045,14),0x826455,0,.221,0,0,house);const rim=mesh('ChimneyRim',new T.TorusGeometry(.016,.003,5,20),0xb78b65,0,.244,0,0,house);rim.rotation.x=Math.PI/2;}

 const doorway=new T.Shape();doorway.moveTo(-.022,0);doorway.lineTo(-.022,.048);doorway.bezierCurveTo(-.022,.08,.022,.08,.022,.048);doorway.lineTo(.022,0);doorway.closePath();mesh('WarmDoorway',new T.ShapeGeometry(doorway,16),0xe7c58a,0,.006,.069,.35,house);
 const arch=[new T.Vector3(-.026,.004,.072),new T.Vector3(-.026,.05,.072),new T.Vector3(0,.084,.072),new T.Vector3(.026,.05,.072),new T.Vector3(.026,.004,.072)];mesh('CarvedDoorFrame',new T.TubeGeometry(new T.CatmullRomCurve3(arch),24,.0035,6,false),0xc3ad79,0,0,0,0,house);
 for(const side of [-1,1]){const window=mesh('InsetWindow',new T.CircleGeometry(.011,20),0xf1d69a,side*.0375,.086,.0575,.6,house);window.rotation.y=side*.58;}
 for(let i=0;i<4;i++){const step=mesh('WornDoorstep',new T.SphereGeometry(.025,12,7),0x9b9d83,-.035+Math.sin(i)*.004,.03,-.005+i*.035);step.scale.set(1,.13,.55);}
 for(let i=0;i<4;i++){
  const a=i*1.5+.25,x=Math.cos(a)*.18,z=-.1+Math.sin(a)*.075;
  const plant=createNatureModel(chapter===2?'bare':chapter===3?'slab':'bush',chapter);plant.scale.setScalar(chapter===2?.035:.065);plant.position.set(x,.025,z);root.add(plant);
 }
 // Chapter-specific construction details attach to the hut wall or roof.
 for(const side of [-1,1]){
  const sill=mesh('WindowSill',new T.BoxGeometry(.028,.006,.012),0xa59776,side*.038,.072,.060,0,house);sill.rotation.y=side*.58;
 }

 if(chapter===1){const lip=mesh('RainwaterBasin',new T.TorusGeometry(.028,.005,6,24),0x6d9da7,.105,.034,-.10);lip.rotation.x=Math.PI/2;const pool=mesh('CollectedRain',new T.CircleGeometry(.026,24),0x6dabb7,.105,.035,-.10);pool.rotation.x=-Math.PI/2;}
 if(chapter===3){for(let i=0;i<3;i++)mesh('FoundationCourse',new T.CylinderGeometry(.074,.077,.012,12),0x928d77,0,.012+i*.025,0,0,house);}
 for(let i=0;i<4;i++){const a=i*1.6;const pts=[new T.Vector3(Math.cos(a)*.20,-.02,Math.sin(a)*.20),new T.Vector3(Math.cos(a+.12)*.19,-.16,Math.sin(a+.12)*.19),new T.Vector3(Math.cos(a+.2)*.12,-.29,Math.sin(a+.2)*.12)];mesh('ClingingRoot',new T.TubeGeometry(new T.CatmullRomCurve3(pts),14,.003,5,false),chapter===1?0x7baca5:0x758a66);}
 // Roof ribs are attached to the actual rotational roof profile.
 for(let i=0;i<(chapter===3||chapter===1?0:8);i++){const a=i*Math.PI/4,pts=roofProfile.slice(1,4).map(([r,y])=>new T.Vector3(Math.cos(a)*(r+.0015),y,Math.sin(a)*(r+.0015)));mesh('RoofSeam',new T.TubeGeometry(new T.CatmullRomCurve3(pts),12,.0012,4,false),chapter===2?0x997058:0x90a181,0,0,0,0,house);}
 batchStaticScenery(root);root.children.forEach((m,i)=>m.name='HabitatSurface'+i);return root;
}
/** Continuous planetary valley. All props are sampled onto the same ground surface. */
export function createRegionLandscape(chapter:number){
 const root=new T.Group();root.name=['RootedWoodland','RiverValley','BasaltValley','WeatheredHighlands'][chapter];
 const positions:number[]=[],colors:number[]=[],indices:number[]=[],nx=120,nz=100;
 const low=new T.Color([0x334e40,0x344f55,0x302c34,0x565b4f][chapter]),high=new T.Color([0x718366,0x72968d,0x61555c,0xa3a38a][chapter]),c=new T.Color();
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
  const x=-6+i*12/nx,z=2-j*10/nz,y=terrainHeight(chapter,x,z);positions.push(x,y,z);
  c.copy(low).lerp(high,T.MathUtils.clamp(y*.7+.12*Math.sin(x*13+z*9),0,1));colors.push(c.r,c.g,c.b);
 }
 // The Z axis runs backwards, so this winding faces upward.
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,d=a+nx+1;indices.push(a,b,d,b,d+1,d);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();
 const ground=new T.Mesh(geo,new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:1}));ground.name='ContinuousPlanetSurface';root.add(ground);
 // A meandering stream / cooling fissure sits on the ravine floor, below the puzzle.
 const ribbon:number[]=[],ri:number[]=[],width=chapter===1?.14:chapter===2?.018:.045;
 for(let i=0;i<=90;i++){const z=1.9-i*.105,cx=Math.sin(z*1.35)*.105;for(const side of [-1,1]){const x=cx+side*width;ribbon.push(x,terrainHeight(chapter,x,z)+.006,z);}if(i<90){const a=i*2;ri.push(a,a+1,a+2,a+1,a+3,a+2);}}
 const rg=new T.BufferGeometry();rg.setAttribute('position',new T.Float32BufferAttribute(ribbon,3));rg.setIndex(ri);rg.computeVertexNormals();
 const stream=new T.Mesh(rg,new T.MeshStandardMaterial({color:chapter===2?0xb2754d:0x487b83,roughness:chapter===2?.9:.32,emissive:chapter===2?0x9b4e25:0,emissiveIntensity:.13}));stream.name=chapter===2?'CoolingFissure':'ValleyStream';root.add(stream);
 const moving:T.Object3D[]=[];
 for(const side of [-1,1])root.add(createHabitatTrail(chapter,side));
 const plant=(kind:NatureKind,x:number,z:number,scale:number,angle=0)=>{const m=createNatureModel(kind,chapter);m.position.set(x,terrainHeight(chapter,x,z)-.005,z);m.scale.setScalar(scale);m.rotation.y=angle;root.add(m);return m;};
 for(let i=0;i<32;i++){
  const cluster=Math.floor(i/4),side=cluster%2?1:-1,row=Math.floor(i/2),a=i*2.399,r=.10+(i%4)*.075,x=side*(1.30+.30*Math.sin(cluster*1.7))+Math.cos(a)*r,z=-1.55-Math.floor(cluster/2)*.93+Math.sin(a)*r;
  if(chapter===0){const tree=plant(i%3===0?'spire':'oak',x,z,.13+(i%4)*.025,i*2.4);if(i%4===0){tree.name='SwayTree'+i;moving.push(tree);}}
  if(chapter===1){if(i%4===0){const tree=plant('willow',x,z,.14,i);tree.name='SwayTree'+i;moving.push(tree);}plant(i%2?'grass':'rock',side*(.23+(row%4)*.22),z,.15+(i%3)*.06,i);}
  if(chapter===2){const basalt=plant(i%3?'rock':'slab',x,z,.35+(i%4)*.10,i);basalt.scale.y*=1.8;if(i%5===0)plant('bare',x+.13,z,.12,i);}
  if(chapter===3){const stone=plant(i%3?'rock':'slab',x,z,.35+(i%4)*.14,i);stone.scale.set(stone.scale.x*1.4,stone.scale.y*.8,stone.scale.z);if(i%4===0)plant('bush',x+.2,z,.18,i);}
 }
 // Near-bank detail stays below the hand interaction plane and outside the gap.
 for(let i=0;i<24;i++){const side=i%2?1:-1,x=side*(.38+(i%4)*.18),z=.25-Math.floor(i/4)*.31;plant(chapter===2||chapter===3?'slab':i%3?'grass':'bush',x,z,.07+(i%3)*.025,i);}
 // Exposed roots follow the valley bank; they never cross the puzzle opening.
 if(chapter===0)for(const side of [-1,1])for(let j=0;j<3;j++){
  const points:T.Vector3[]=[];for(let k=0;k<12;k++){const t=k/11,x=side*(.8-t*.54),z=-1.12+j*.16+Math.sin(t*3)*.04;points.push(new T.Vector3(x,terrainHeight(chapter,x,z)+.007,z));}
  const rootlet=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),22,.006-j*.001,5,false),new T.MeshStandardMaterial({color:0x8b8660,roughness:1}));rootlet.name='ExposedBankRoot';root.add(rootlet);
 }
 for(const tree of moving)tree.removeFromParent();
 batchStaticScenery(root);root.children.forEach((m,i)=>m.name='GroundedLandscapeSurface'+i);
 for(const tree of moving)root.add(tree);
 root.add(createHabitatLife(chapter));return root;
}
