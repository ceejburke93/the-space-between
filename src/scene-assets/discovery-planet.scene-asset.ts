import {sampleLastLightStream} from '../last-light';
import * as T from '@iwsdk/core';
import {batchStaticScenery} from '../batch-static';
/** Continuous spherical geography shared by terrain and attached close-up landmarks. */
function land(x:number,y:number,z:number){return Math.sin(x*3.7+z*2.1)*.47+Math.cos(y*4.1-z*2.4)*.32+Math.sin(x*7.3+y*3.4+z)*.15+Math.sin(x*19+y*9)*Math.sin(z*15-y*8)*.055;}
function radius(n:T.Vector3){const h=land(n.x,n.y,n.z);return 1+Math.max(0,h-.05)*.055+Math.max(0,h-.45)*Math.abs(Math.sin(n.x*22+n.z*13))*.07;}
export function createDiscoveryPlanet(){
 const root=new T.Group();root.name='LivingPlanet';
 const sphere=new T.SphereGeometry(1,112,72),p=sphere.getAttribute('position'),colors=new Float32Array(p.count*3),n=new T.Vector3(),color=new T.Color();
 const deep=new T.Color(0x245574),shallow=new T.Color(0x569ba3),coast=new T.Color(0xb4b38a),forest=new T.Color(0x56856b),high=new T.Color(0xbac0aa);
 for(let i=0;i<p.count;i++){n.set(p.getX(i),p.getY(i),p.getZ(i)).normalize();const h=land(n.x,n.y,n.z),r=radius(n);p.setXYZ(i,n.x*r,n.y*r,n.z*r);if(h<0)color.copy(deep).lerp(shallow,T.MathUtils.clamp((h+.28)/.28,0,1));else if(h<.07)color.copy(shallow).lerp(coast,h/.07);else if(h<.18)color.copy(coast).lerp(forest,(h-.07)/.11);else color.copy(forest).lerp(high,T.MathUtils.clamp((h-.45)*2.2,0,1));if(h>.18&&h<.55)color.multiplyScalar(.91+.09*Math.sin(n.x*25+n.y*11)*Math.sin(n.z*19));if(Math.abs(n.y)>.88)color.lerp(high,(Math.abs(n.y)-.88)/.12);colors.set([color.r,color.g,color.b],i*3);}
 sphere.setAttribute('color',new T.BufferAttribute(colors,3));sphere.computeVertexNormals();const terrain=new T.Mesh(sphere,new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.88}));terrain.name='ContinentsAndSeas';root.add(terrain);
 const details=new T.Group();details.name='CloseGeography';root.add(details);
 const green=new T.MeshStandardMaterial({color:0x4b795b,roughness:.9}),stone=new T.MeshStandardMaterial({color:0xb4af94,roughness:.9}),warm=new T.MeshStandardMaterial({color:0xe6c88a,emissive:0xe6c88a,emissiveIntensity:.4});
 for(let region=0;region<4;region++){
  let best=-9;const normal=new T.Vector3();for(let j=0;j<80;j++){const a=j*2.399+region,lat=(j%9-4)*.13,lon=(region-1.5)*.43+Math.sin(a)*.18,v=new T.Vector3(Math.sin(lon)*Math.cos(lat),Math.sin(lat),Math.cos(lon)*Math.cos(lat)),score=land(v.x,v.y,v.z)-Math.abs(lat)*.15;if(score>best){best=score;normal.copy(v);}}
  const site=new T.Group();site.name=['ForestHome','TidalHome','WarmHome','StoneHome'][region];site.position.copy(normal).multiplyScalar(radius(normal));site.quaternion.setFromUnitVectors(T.Object3D.DEFAULT_UP,normal);details.add(site);
  for(let j=0;j<7;j++){const a=j*2.399,r=.025+(j%3)*.018;const crown=new T.Mesh(new T.SphereGeometry(.012,8,6),green);crown.name='ForestCrown';crown.position.set(Math.cos(a)*r,.014,Math.sin(a)*r);crown.scale.set(1,1.5,1);site.add(crown);}
  for(const side of [-1,1]){const home=new T.Mesh(new T.SphereGeometry(.017,12,8),stone);home.name='LittleDwelling';home.position.set(side*.022,.013,.015);home.scale.set(1,.8,1);site.add(home);const roof=new T.Mesh(new T.SphereGeometry(.021,12,6,0,Math.PI*2,0,Math.PI/2),green);roof.name='DwellingRoof';roof.position.set(side*.022,.022,.015);site.add(roof);const window=new T.Mesh(new T.SphereGeometry(.004,8,6),warm);window.name='HomeLight';window.position.set(side*.022,.014,.032);site.add(window);}
  if(region===1){const lake=new T.Mesh(new T.CircleGeometry(.037,24),new T.MeshStandardMaterial({color:0x82c4c7,roughness:.25}));lake.name='MountainLake';lake.rotation.x=-Math.PI/2;lake.position.set(.04,.003,-.02);site.add(lake);}
  if(region===2){const rock=new T.Mesh(new T.ConeGeometry(.035,.05,12),stone);rock.name='WarmCrater';rock.position.set(-.045,.015,-.035);site.add(rock);}
  if(region===3){const arch=new T.Mesh(new T.TorusGeometry(.025,.005,5,20,Math.PI),stone);arch.name='StoneArch';arch.position.set(.04,.012,-.03);site.add(arch);}
 }
 let surfaceIndex=0;batchStaticScenery(details);details.traverse(o=>{if(o instanceof T.Mesh){o.name='SurfaceDetail'+surfaceIndex++;o.material=(o.material as T.Material).clone();(o.material as T.Material).userData.discoveryDetail=true;}});
 const clouds=new T.InstancedMesh(new T.SphereGeometry(1,12,8),new T.MeshBasicMaterial({color:0xdce8df,transparent:true,opacity:.25,depthWrite:false}),28);clouds.name='CloudLayers';const matrix=new T.Matrix4(),q=new T.Quaternion();
 for(let i=0;i<28;i++){const lat=Math.sin(i*2.1)*1.08,lon=i*2.399;n.set(Math.cos(lat)*Math.sin(lon),Math.sin(lat),Math.cos(lat)*Math.cos(lon));q.setFromUnitVectors(T.Object3D.DEFAULT_UP,n);matrix.compose(n.clone().multiplyScalar(1.075),q,new T.Vector3(.12+(i%4)*.035,.009,.055+(i%3)*.015));clouds.setMatrixAt(i,matrix);}clouds.instanceMatrix.needsUpdate=true;root.add(clouds);
 const air=new T.Mesh(new T.SphereGeometry(1.10,48,32),new T.MeshBasicMaterial({color:0x9dd4e3,transparent:true,opacity:.065,side:T.BackSide,depthWrite:false}));air.name='Atmosphere';root.add(air);return root;
}

/** The same local water profile becomes a surface-attached mark on the planet. */
export function createPlanetMemory(){
 const root=new T.Group();root.name='PlanetMemory';
 const water=new T.MeshBasicMaterial({color:0xa2e0d9}),home=new T.MeshBasicMaterial({color:0xf3d69d});
 for(const raised of [true,false]){
  const group=new T.Group();group.name=raised?'RaisedLegacy':'GardenLegacy';root.add(group);
  const points:T.Vector3[]=[];
  for(let i=0;i<=48;i++){const point={x:0,y:0,z:0};sampleLastLightStream(i/48,raised?1:2,raised,point);const n=new T.Vector3(point.x,.04+(point.z+.8)*.9,1).normalize();points.push(n.multiplyScalar(radius(n)+.008+(point.y-1.035)*.15));}
  const stream=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),48,.004,5,false),water);stream.name='RememberedWaterway';group.add(stream);
  for(let i=0;i<5;i++){const p=points[8+i*7],normal=p.clone().normalize(),site=new T.Group();site.name='NewSettlement';site.position.copy(normal).multiplyScalar(radius(normal)+.008);site.quaternion.setFromUnitVectors(T.Object3D.DEFAULT_UP,normal);group.add(site);const dwelling=new T.Mesh(new T.SphereGeometry(.012,8,6),home);dwelling.name='WarmWindow';dwelling.position.set(i%2?.02:-.02,.008,0);dwelling.scale.set(1,.7,1);site.add(dwelling);}
  batchStaticScenery(group);
 }
 return root;
}
