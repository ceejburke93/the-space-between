import * as T from '@iwsdk/core';
import {batchStaticScenery} from '../batch-static';
/** Forest homes are seed pods with continuous roofs and arched doors, not cone huts. */
export function createLeafHabitat(){
 const root=new T.Group();root.name='LeafHabitat';
 const mesh=(parent:T.Object3D,name:string,g:T.BufferGeometry,color:number,x=0,y=0,z=0)=>{const m=new T.Mesh(g,new T.MeshStandardMaterial({color,roughness:.9}));m.name=name;m.position.set(x,y,z);parent.add(m);return m;};
 for(const x of [-.55,.54]){const home=new T.Group();home.name=x<0?'DeparturePod':'HomePod';home.position.set(x,1.02,-.69);root.add(home);
  mesh(home,'PodWalls',new T.LatheGeometry([[.065,0],[.076,.025],[.071,.085],[.049,.125],[0,.14]].map(([r,y])=>new T.Vector2(r,y)),24),0x746e4f);
  mesh(home,'OverhangingRoof',new T.LatheGeometry([[0,.225],[.028,.211],[.065,.178],[.113,.15],[.126,.142],[.115,.131],[.072,.144],[0,.154]].map(([r,y])=>new T.Vector2(r,y)),28),0x375e49);
  const door=new T.Shape();door.moveTo(-.022,.005);door.lineTo(-.022,.052);door.bezierCurveTo(-.022,.081,.022,.081,.022,.052);door.lineTo(.022,.005);door.closePath();mesh(home,'DoorRecess',new T.ShapeGeometry(door,16),0x263d33,0,0,.071);
  const frame=[new T.Vector3(-.025,.006,.073),new T.Vector3(-.025,.05,.073),new T.Vector3(0,.079,.073),new T.Vector3(.025,.05,.073),new T.Vector3(.025,.006,.073)];mesh(home,'DoorFrame',new T.TubeGeometry(new T.CatmullRomCurve3(frame),24,.003,5,false),0xb09c65);
  const window=mesh(home,'WarmWindow',new T.CircleGeometry(.014,20),0xcba66b,.04,.091,.054);(window.material as T.MeshStandardMaterial).emissive.setHex(0xcba66b);(window.material as T.MeshStandardMaterial).emissiveIntensity=.25;
  for(let i=0;i<4;i++){const step=mesh(home,'SteppingStone',new T.SphereGeometry(.023,10,6),0x768776,Math.sin(i)*.012,.004,.09+i*.034);step.scale.set(1,.12,.7);}
 }
 for(let i=0;i<12;i++){const fern=new T.Group();fern.position.set((i%2?1:-1)*(.36+(i%3)*.075),1.026,-.73-(i%4)*.027);root.add(fern);for(const side of [-1,1]){const frond=new T.Shape();frond.moveTo(0,0);frond.quadraticCurveTo(side*.024,.014,side*.04,.053);frond.quadraticCurveTo(side*.009,.043,0,0);const leaf=mesh(fern,'FernFrond',new T.ShapeGeometry(frond,12),i%2?0x427451:0x69916a);leaf.rotation.y=i*.7;}}
 batchStaticScenery(root);return root;
}
