import { createCreatureBody } from './creatures.scene-asset';
import * as T from '@iwsdk/core';
/** Root-local metres, Y up, creatures face +Z. Islands contact Y=1.02.
 * Named, articulated support asset: seed, petals, cues, chapter links and final cast.
 * No lights, camera, DOM or random state. */
export function createLivingWorld(){
 const root=new T.Group();root.name='LivingWorld';
 const material=(color:number,glow=0)=>new T.MeshStandardMaterial({color,roughness:.8,emissive:color,emissiveIntensity:glow});
 const gold=material(0xffd895,.65),green=material(0x92c495),blue=material(0x8dd6e2,.25),orange=material(0xffb66b,.5),stone=material(0xbeb39b);
 const add=(parent:T.Object3D,name:string,geo:T.BufferGeometry,mat:T.Material,x=0,y=0,z=0)=>{const m=new T.Mesh(geo,mat);m.name=name;m.position.set(x,y,z);parent.add(m);return m;};
 const group=(name:string)=>{const g=new T.Group();g.name=name;root.add(g);return g;};
 const gift=group('Gift');gift.position.set(.39,1.13,-.54);add(gift,'Seed',new T.IcosahedronGeometry(.013,1),gold);
 const bloom=group('Bloom');
 add(bloom,'Stem',new T.CylinderGeometry(.002,.003,.055,6),green,0,.027);
 for(let i=0;i<6;i++){const pivot=new T.Group();pivot.name=`PetalPivot${i}`;pivot.position.y=.055;pivot.rotation.y=i*Math.PI/3;bloom.add(pivot);const petal=add(pivot,`Petal${i}`,new T.SphereGeometry(.017,10,6),i%2?gold:green,0,.004,.017);petal.scale.set(.6,.25,1.25);}
 add(bloom,'Heart',new T.SphereGeometry(.009,8,6),gold,0,.06);
 const wave=group('FlowerWave');const flowers=new T.InstancedMesh(new T.ConeGeometry(.012,.026,5),gold,36);flowers.name='Flowers';wave.add(flowers);
 for(let i=0;i<36;i++){const a=i*2.399,r=.035+Math.sqrt(i/35)*.19;flowers.setMatrixAt(i,new T.Matrix4().makeTranslation(.48+Math.cos(a)*r,1.045,-.62+Math.sin(a)*r));}flowers.instanceMatrix.needsUpdate=true;
 const feedback=group('GestureFeedback');const ring=new T.Mesh(new T.TorusGeometry(.045,.0025,5,48),new T.MeshBasicMaterial({color:0xffdf9a,transparent:true,opacity:.8,depthWrite:false}));ring.name='FormationRing';feedback.add(ring);const pulse=ring.clone();pulse.name='CompletionRing';pulse.material=ring.material.clone();feedback.add(pulse);
 const cues=group('FireflyCues');const p=new Float32Array(24*3);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(p,3));const flies=new T.Points(geo,new T.PointsMaterial({color:0xffdc9a,size:.007,transparent:true,opacity:.8,depthWrite:false}));flies.name='Fireflies';cues.add(flies);
 const roots=group('ReachingRoots');for(let i=0;i<3;i++){const points=[new T.Vector3(-.35,1.025,-.66+i*.035),new T.Vector3(-.27,1.035,-.66+i*.035),new T.Vector3(-.2,1.025,-.66+i*.035)];add(roots,`Root${i}`,new T.TubeGeometry(new T.CatmullRomCurve3(points),8,.003,4,false),green);}
 // Each restored chapter contributes a physical cause to the next region.
 const links=group('ChapterLinks');
 for(let i=0;i<3;i++){const link=new T.Group();link.name=`Link${i}`;links.add(link);const pts=Array.from({length:18},(_,j)=>new T.Vector3(-.68+j/17*1.36,1.025,-.82-Math.sin(j/17*Math.PI)*(.06+i*.025)));
  add(link,'Channel',new T.TubeGeometry(new T.CatmullRomCurve3(pts),24,.004+i*.0015,5,false),[green,blue,orange][i]);}
 const shelter=group('SharedShelter');shelter.position.set(.48,1.02,-.77);for(const x of [-.08,.08])add(shelter,'Pillar',new T.CylinderGeometry(.012,.018,.12,6),stone,x,.06);const arch=add(shelter,'Arch',new T.TorusGeometry(.08,.013,6,18,Math.PI),stone,0,.12);arch.rotation.z=0;
 const finale=group('Finale');
 for(let i=0;i<4;i++){const actor=new T.Group();actor.name=`Companion${i}`;finale.add(actor);const mat=[green,blue,orange,stone][i];
  const body=createCreatureBody(i);body.scale.setScalar(.86);actor.add(body);
  for(const x of [-.009,.009])add(actor,'Eye',new T.SphereGeometry(.004,8,6),material(0x18302f),x,.043,.022);
  for(const x of [-1,1]){const arm=add(actor,`Arm${x}`,new T.CapsuleGeometry(.003,.02,3,5),mat,x*.027,.032);arm.rotation.z=x*.6;}
  if(i===0||i===3)for(const x of [-.01,.01]){const foot=add(actor,'Foot',new T.SphereGeometry(.008,8,6),stone,x,.004,.008);foot.scale.y=.5;}
 }
 const memoryShelter=new T.Mesh(new T.TorusGeometry(.046,.0016,4,32,Math.PI),new T.MeshBasicMaterial({color:0xffd3a1,transparent:true,opacity:.6}));memoryShelter.name='MemoryShelter';finale.add(memoryShelter);
 const bridge=new T.Group();bridge.name='TogetherBridge';finale.add(bridge);
 for(let i=0;i<4;i++){const strand=add(bridge,`ElementStrand${i}`,new T.BoxGeometry(.46,.006,.012),[green,blue,orange,stone][i],0,1.027,-.645+i*.016);}
 for(const x of [-.23,.23])add(bridge,'StoneAnchor',new T.CylinderGeometry(.025,.03,.018,7),stone,x,1.024,-.62);
 return root;
}
