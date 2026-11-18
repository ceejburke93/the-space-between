import * as T from '@iwsdk/core';
import {puzzleNodes} from '../puzzle-challenge';
import {createCreatureBody} from './creatures.scene-asset';
export function createPuzzleBoard(){
 const root=new T.Group();root.name='PuzzleBoard';
 for(let ch=0;ch<4;ch++)for(let enc=1;enc<3;enc++){
  const board=new T.Group();board.name=`Puzzle${ch}${enc}`;root.add(board);const nodes=puzzleNodes(ch,enc);
  const rings=new T.InstancedMesh(new T.TorusGeometry(.032,.002,5,36),new T.MeshBasicMaterial({color:0xffffff}),nodes.length);rings.name='Targets';board.add(rings);
  const glyphs=new T.InstancedMesh(new T.IcosahedronGeometry(.013,0),new T.MeshStandardMaterial({color:0xffffff,roughness:.8}),nodes.length);glyphs.name='Glyphs';board.add(glyphs);
  const pieces=new T.InstancedMesh(new T.BoxGeometry(.05,.018,.04),new T.MeshStandardMaterial({color:0xa4ad91,roughness:.9}),3);pieces.name='PlacedStones';board.add(pieces);
 }
 for(const name of ['BranchDeck','StoneDeck']){const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(new Float32Array(66*3),3));const normals=new Float32Array(66*3);for(let i=0;i<66;i++)normals[i*3+1]=1;geometry.setAttribute('normal',new T.BufferAttribute(normals,3));const indices=[];for(let i=0;i<32;i++){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}geometry.setIndex(indices);const mesh=new T.Mesh(geometry,new T.MeshStandardMaterial({color:name==='BranchDeck'?0x608e72:0x9b9f89,roughness:.9,side:T.DoubleSide}));mesh.name=name;root.add(mesh);}
 const ledge=new T.Mesh(new T.BoxGeometry(.052,.012,.07),new T.MeshStandardMaterial({color:0xc1bea2,roughness:.9}));ledge.name='HighLedge';ledge.position.set(.04,1.082,-.62);root.add(ledge);
 const balances=new T.Group();balances.name='BalancePlatforms';root.add(balances);for(const side of [-1,1]){const plate=new T.Mesh(new T.BoxGeometry(.23,.012,.07),new T.MeshStandardMaterial({color:0x9ca28a,roughness:.9}));plate.name=side<0?'BalanceLeft':'BalanceRight';plate.position.set(side*.115,1.017,-.62);balances.add(plate);}
 const previewPoints=[];for(let i=0;i<33;i++){const t=i/32;previewPoints.push(new T.Vector3(-.23+t*.46,1.023-Math.sin(t*Math.PI)*.018,-.62-Math.sin(t*Math.PI)*.15));}const preview=new T.Line(new T.BufferGeometry().setFromPoints(previewPoints),new T.LineDashedMaterial({color:0x91b7a1,dashSize:.016,gapSize:.012,transparent:true,opacity:.4}));preview.computeLineDistances();preview.name='BranchPreview';root.add(preview);
 const rim=new T.Mesh(new T.TorusGeometry(.051,.002,5,40),new T.MeshBasicMaterial({color:0xb4e2e0}));rim.name='BasinRim';rim.rotation.x=-Math.PI/2;rim.position.set(0,1.06,-.52);root.add(rim);
 const spark=new T.Mesh(new T.SphereGeometry(.014,12,8),new T.MeshStandardMaterial({color:0xffc47e,emissive:0xffa45b,emissiveIntensity:.8}));spark.name='HeldSpark';root.add(spark);
 const rest=new T.Mesh(new T.CylinderGeometry(.05,.035,.012,18),new T.MeshStandardMaterial({color:0x6a9f9c,roughness:.8}));rest.name='WaterRest';rest.position.set(-.12,1.02,-.5);root.add(rest);
 const blossom=new T.Group();blossom.name='SeedBloom';blossom.position.set(.04,1.12,-.53);root.add(blossom);const stem=new T.Mesh(new T.CylinderGeometry(.002,.003,.06,5),new T.MeshStandardMaterial({color:0x719c71}));stem.position.y=.03;blossom.add(stem);const petals=new T.InstancedMesh(new T.SphereGeometry(.013,10,6),new T.MeshStandardMaterial({color:0xe8d4a5,roughness:.8}),6);blossom.add(petals);for(let i=0;i<6;i++){const a=i*Math.PI/3,m=new T.Matrix4().compose(new T.Vector3(Math.cos(a)*.016,.06,Math.sin(a)*.016),new T.Quaternion(),new T.Vector3(1,.35,1));petals.setMatrixAt(i,m);}petals.instanceMatrix.needsUpdate=true;
 const flow=new T.Line(new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(new Float32Array(17*3),3)),new T.LineBasicMaterial({color:0x9cd6e4,transparent:true,opacity:.7}));flow.name='SharedStream';root.add(flow);
 const held=new T.Mesh(new T.BoxGeometry(.05,.018,.04),new T.MeshStandardMaterial({color:0xd8ca99,roughness:.8}));held.name='HeldStone';root.add(held);
 const fluid=new T.Mesh(new T.CylinderGeometry(.05,.05,.04,24),new T.MeshStandardMaterial({color:0x6db7c9,emissive:0x305f70,emissiveIntensity:.2,roughness:.3}));fluid.name='BasinWater';fluid.position.set(0,1.035,-.52);root.add(fluid);
 const pool=new T.Mesh(new T.CylinderGeometry(.05,.05,.02,24),new T.MeshStandardMaterial({color:0x5fa3b8,roughness:.3}));pool.name='Reserve';pool.position.set(0,1.025,-.42);root.add(pool);
 const lilies=new T.Group();lilies.name='Lilies';root.add(lilies);for(const x of [-.12,.02,.17]){const lily=new T.Group();lily.position.set(x,1.015,-.77);lilies.add(lily);const pad=new T.Mesh(new T.CylinderGeometry(.036,.034,.005,20),new T.MeshStandardMaterial({color:0x4e8c6c,roughness:.8}));lily.add(pad);const flower=new T.Mesh(new T.IcosahedronGeometry(.012,1),new T.MeshStandardMaterial({color:0xf4d9a8,roughness:.8}));flower.position.y=.015;lily.add(flower);}
 const leaf=createCreatureBody(0);leaf.name='SeedkeeperFriend';leaf.position.set(-.24,1.025,-.76);root.add(leaf);for(const x of [-.01,.01]){const eye=new T.Mesh(new T.SphereGeometry(.0045,8,6),new T.MeshBasicMaterial({color:0x18302b}));eye.position.set(x,.046,.022);leaf.add(eye);}
 const wind=new T.Points(new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(new Float32Array(18*3),3)),new T.PointsMaterial({color:0xffd49b,size:.005,transparent:true,opacity:.55}));wind.name='Wind';root.add(wind);
 return root;
}
