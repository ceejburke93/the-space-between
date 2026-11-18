import * as T from '@iwsdk/core';
import assets from './assets';
import {PuzzleChallenge,puzzleNodes,deckRiseAt} from './puzzle-challenge';
const Y=1.02,Z=-.62;
export class PuzzleVisuals {
 readonly group=assets['puzzle-board'].clone(true);private matrix=new T.Matrix4();private color=new T.Color();private scale=new T.Vector3();private position=new T.Vector3();private rotation=new T.Quaternion();private identity=new T.Quaternion();private up=new T.Vector3(1,0,0);
 private bloom=0;private spark=this.group.getObjectByName('HeldSpark') as T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>;private flow=this.group.getObjectByName('SharedStream') as T.Line;
 private branchBlend=0;private tilts=[0,0];private rises=[0,0,0];private chapter=-1;private encounter=-1;
 private branch=this.group.getObjectByName('BranchDeck') as T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>;private stone=this.group.getObjectByName('StoneDeck') as T.Mesh;
 private basin=this.group.getObjectByName('BasinWater') as T.Mesh;private reserve=this.group.getObjectByName('Reserve') as T.Mesh;private held=this.group.getObjectByName('HeldStone') as T.Mesh;
 private lilies=this.group.getObjectByName('Lilies')!;private friend=this.group.getObjectByName('SeedkeeperFriend')!;private wind=this.group.getObjectByName('Wind') as T.Points;
 private labels:T.Sprite[]=[];
 constructor(root:T.Group){this.group.visible=false;this.branch.geometry=this.branch.geometry.clone();this.branch.material=this.branch.material.clone();this.stone.geometry=this.stone.geometry.clone();this.wind.geometry=this.wind.geometry.clone();this.spark.material=this.spark.material.clone();this.flow.geometry=this.flow.geometry.clone();root.add(this.group);
  for(const text of ['Wide','Tall','Flat']){const c=document.createElement('canvas');c.width=160;c.height=48;const ctx=c.getContext('2d')!;ctx.fillStyle='#f4e9cf';ctx.font='30px sans-serif';ctx.textAlign='center';ctx.fillText(text,80,34);const sprite=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c),depthTest:true}));sprite.scale.set(.09,.027,1);this.group.add(sprite);this.labels.push(sprite);}
 }
 depthAt(x:number){const t=T.MathUtils.clamp((x+.23)/.46,0,1);return Z-Math.sin(t*Math.PI)*.15*this.branchBlend;}
 heightAt(x:number){if(this.chapter===3&&this.encounter===1&&x>=-.23&&x<=.23){const i=x<0?0:1,center=i===0?-.115:.115;return Y-.003+.006/Math.cos(this.tilts[i])+(x-center)*Math.tan(this.tilts[i]);}return Y+.003+deckRiseAt(x,this.rises);}
 update(p:PuzzleChallenge,dt:number,time:number,active:boolean,visible:boolean,hands:T.Vector3[],present:boolean[],height:(x:number)=>number){
  this.group.visible=visible&&p.encounter>0;if(!this.group.visible)return;
  if(this.chapter!==p.chapter||this.encounter!==p.encounter){this.chapter=p.chapter;this.encounter=p.encounter;this.branchBlend=0;this.rises.fill(0);this.tilts.fill(0);}
  const branching=p.encounter===2&&((p.chapter===0&&p.choice===2)||(p.chapter===1&&p.mask!==0));this.branchBlend=T.MathUtils.lerp(this.branchBlend,branching?1:0,1-Math.exp(-dt*5));
  const balances=this.group.getObjectByName('BalancePlatforms')!;balances.visible=p.chapter===3&&p.encounter===1;for(let i=0;i<2;i++){const target=balances.visible&&!p.complete&&p.phase===i?(i===0?.08:-.08):0;this.tilts[i]=T.MathUtils.lerp(this.tilts[i],target,1-Math.exp(-dt*5));balances.children[i].rotation.z=this.tilts[i];}
  this.group.getObjectByName('BranchPreview')!.visible=p.chapter===0&&p.encounter===2&&!p.choice;
  this.group.getObjectByName('BasinRim')!.visible=p.chapter===1&&p.encounter===1;
  const isStone=p.chapter===3&&p.encounter===2;
  for(let i=0;i<3;i++){const target=isStone&&p.pieces[i]>=0?[.008,.065,.022][p.pieces[i]]:0;this.rises[i]=T.MathUtils.lerp(this.rises[i],target,1-Math.exp(-dt*5));}
  for(let ch=0;ch<4;ch++)for(let e=1;e<3;e++)this.group.getObjectByName(`Puzzle${ch}${e}`)!.visible=ch===p.chapter&&e===p.encounter;
  const board=this.group.getObjectByName(`Puzzle${p.chapter}${p.encounter}`)!,rings=board.getObjectByName('Targets') as T.InstancedMesh,glyphs=board.getObjectByName('Glyphs') as T.InstancedMesh,placed=board.getObjectByName('PlacedStones') as T.InstancedMesh,nodes=puzzleNodes(p.chapter,p.encounter);
  this.rotation.setFromAxisAngle(this.up,-Math.PI/2);
  nodes.forEach((n,i)=>{const enabled=active&&p.nodeActive(n.id),done=(n.id.startsWith('lamp-')&&(p.mask&(1<<Number(n.id.slice(-1)))))||(n.id.startsWith('lily-')&&(p.mask&(1<<Number(n.id.slice(-1)))))||(n.id==='lantern'&&p.complete);const show=enabled||done||(!p.complete&&active&&n.id.startsWith('slot-'));
   this.position.set(n.x,n.y,n.z);this.scale.setScalar(show?(enabled?1:.65):.001);this.matrix.compose(this.position,this.rotation,this.scale);rings.setMatrixAt(i,this.matrix);this.color.setHex(done?0x90c59c:enabled?0xefc985:0x668c89);rings.setColorAt(i,this.color);
   let nearby=false;for(let h=0;h<hands.length;h++)if(present[h]&&Math.hypot(hands[h].x-n.x,hands[h].y-n.y,hands[h].z-n.z)<.10)nearby=true;if(enabled&&nearby){this.color.setHex(0xffebba);this.scale.setScalar(1.12);this.matrix.compose(this.position,this.rotation,this.scale);rings.setMatrixAt(i,this.matrix);rings.setColorAt(i,this.color);}
   const kind=n.kind;this.scale.set(kind==='wide'?2:1,kind==='tall'?2:kind==='flat'?.4:1,1);this.scale.multiplyScalar(show?1:.001);this.position.y+=.012;this.matrix.compose(this.position,this.identity,this.scale);glyphs.setMatrixAt(i,this.matrix);glyphs.setColorAt(i,this.color);
  });rings.instanceMatrix.needsUpdate=true;glyphs.instanceMatrix.needsUpdate=true;rings.computeBoundingSphere();glyphs.computeBoundingSphere();if(rings.instanceColor)rings.instanceColor.needsUpdate=true;if(glyphs.instanceColor)glyphs.instanceColor.needsUpdate=true;
  this.group.getObjectByName('HighLedge')!.visible=isStone;
  placed.visible=isStone;for(let i=0;i<3;i++){this.position.set([-.12,.04,.18][i],Y-.006+this.rises[i]/2,Z);this.scale.set(p.pieces[i]===0?1.6:1,Math.max(.01,(.012+this.rises[i])/.018),1.5);if(p.pieces[i]<0)this.scale.setScalar(.001);this.matrix.compose(this.position,this.identity,this.scale);placed.setMatrixAt(i,this.matrix);}placed.instanceMatrix.needsUpdate=true;placed.computeBoundingSphere();
  this.branch.visible=this.branchBlend>.001;this.stone.visible=isStone;this.branch.material.color.setHex(p.chapter===1?0x5b9fad:0x608e72);
  for(const mesh of [this.branch,this.stone])if(mesh.visible){const positions=mesh.geometry.getAttribute('position');for(let i=0;i<33;i++){const x=-.23+i/32*.46,z=mesh===this.branch?this.depthAt(x):Z,y=mesh===this.stone?this.heightAt(x):height(x);positions.setXYZ(i*2,x,y,z-.035);positions.setXYZ(i*2+1,x,y,z+.035);}positions.needsUpdate=true;mesh.geometry.computeBoundingSphere();}
  this.basin.visible=p.chapter===1&&p.encounter===1;this.basin.scale.y=Math.max(.02,p.fill*1.8);this.reserve.visible=p.chapter===1&&p.encounter===2;this.reserve.scale.y=Math.max(.03,p.reserve*2);
  this.lilies.visible=p.chapter===1&&p.encounter===2;this.lilies.children.forEach((l,i)=>l.scale.setScalar(Math.max(.03,p.growth[i])));this.friend.visible=this.lilies.visible&&p.phase>=1;this.friend.rotation.y=.6+Math.sin(time)*.1;
  this.group.getObjectByName('WaterRest')!.visible=p.chapter===1&&p.encounter===2;
  this.bloom=T.MathUtils.lerp(this.bloom,p.chapter===0&&p.encounter===1&&p.complete?1:0,1-Math.exp(-dt*4));const flower=this.group.getObjectByName('SeedBloom')!;flower.visible=this.bloom>.01;flower.scale.setScalar(Math.max(.001,this.bloom));
  this.spark.visible=p.chapter===2&&p.phase===1&&!p.complete;this.spark.material.emissiveIntensity=.2+p.heat;this.spark.scale.setScalar(.65+p.heat*.35);for(let i=0;i<2;i++)if(this.spark.visible&&present[i]){this.spark.position.copy(hands[i]);this.spark.position.y+=.03;break;}
  this.flow.visible=p.chapter===1&&p.encounter===2&&p.phase>=2&&!p.complete;if(this.flow.visible){const points=this.flow.geometry.getAttribute('position'),target=puzzleNodes(1,2).find(n=>n.id===`lily-${Math.max(0,p.selected)}`)!;for(let i=0;i<17;i++){const t=i/16;points.setXYZ(i,-.2+(target.x+.2)*t,Y+.08+Math.sin(t*Math.PI)*.035,-.74+(target.z+.74)*t);}points.needsUpdate=true;this.flow.geometry.computeBoundingSphere();}
  this.held.visible=isStone&&p.selected>=0;for(let i=0;i<2;i++)if(this.held.visible&&present[i]){this.held.position.copy(hands[i]);this.held.position.y+=.025;this.held.scale.set(p.selected===0?1.6:1,p.selected===1?3:p.selected===2?.5:1,1);break;}
  this.labels.forEach((label,i)=>{label.visible=isStone&&active&&p.phase<2;label.position.set([-.18,0,.18][i],Y+.10,Z+.28);});
  this.wind.visible=(p.chapter===0&&p.encounter===2&&p.choice===1)||(p.chapter===2&&p.encounter>0&&!p.complete);if(this.wind.visible){const positions=this.wind.geometry.getAttribute('position');for(let i=0;i<18;i++)positions.setXYZ(i,((i/18+time*.12)%1-.5)*.65*p.wind,Y+.14+Math.sin(i)*.05,Z-.02+Math.cos(i)*.04);positions.needsUpdate=true;this.wind.geometry.computeBoundingSphere();}
 }
}
