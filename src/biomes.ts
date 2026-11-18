import * as T from '@iwsdk/core';
import assets from './assets';
import {habitatInfluence,habitatMilestones,habitatGrowthTarget} from './habitat-response';
/** Animated scenery stays separate from puzzle targets and saved gameplay. */
export class Biomes {
 private groups:T.Group[]=[];private last=-1;private warmStone:T.MeshStandardMaterial[]=[];
 private lampMaterials:T.MeshStandardMaterial[][]=[];
 private tufts:T.Object3D[][]=[];private trees:T.Object3D[][]=[];private patches:T.Object3D[][]=[];private glints:T.Mesh[][]=[];
 private touches=new Float32Array(6);private growth=new Float32Array(3);private cooldown=0;
 readonly brushPosition=new T.Vector3();brushSerial=0;response=0;restored=0;pathLight=0;
 constructor(private scene:T.Scene,root:T.Group,private homes:T.Group[],motes:T.Points,clouds:T.Sprite[]){
  for(const key of ['landscape-grass','landscape-water','landscape-fire','landscape-earth'] as const){
   const group=assets[key].clone(true);group.visible=false;root.add(group);this.groups.push(group);
   this.tufts.push(Array.from({length:6},(_,i)=>group.getObjectByName('TouchPlant'+i)!));
   this.patches.push(Array.from({length:3},(_,i)=>group.getObjectByName('Ecology'+i)!));
   const trees:T.Object3D[]=[];group.traverse(o=>{if(o.name.startsWith('SwayTree'))trees.push(o);});this.trees.push(trees);
   const glints=group.getObjectByName('RiverGlints')!.children as T.Mesh[];for(const g of glints)g.material=(g.material as T.Material).clone();this.glints.push(glints);
   const lamps:T.MeshStandardMaterial[]=[];this.patches[this.patches.length-1][2].traverse(o=>{if(o instanceof T.Mesh&&o.material instanceof T.MeshStandardMaterial){o.material=o.material.clone();o.material.transparent=true;o.material.depthWrite=false;lamps.push(o.material);}});this.lampMaterials.push(lamps);
  }
  // Only terrain warms: the lanterns retain their authored, bounded emission.
  for(const o of this.groups[2].children)if(o instanceof T.Mesh&&o.material instanceof T.MeshStandardMaterial){o.material=o.material.clone();this.warmStone.push(o.material);}
 }
 update(chapter:number,time:number,warmth:number,dt:number,hands:T.Vector3[],present:boolean[],completed:number,encounter:number,progress:number,ending:number,active:boolean){
  if(this.scene.background instanceof T.Color)this.scene.background.setHex(0x102532);
  if(this.scene.fog instanceof T.FogExp2){this.scene.fog.color.setHex(0x102532);this.scene.fog.density=.07;}
  for(const material of this.warmStone){material.emissive.setHex(0xd59462);material.emissiveIntensity=warmth*.10;}
  const earned=habitatMilestones(chapter,completed);
  if(this.last!==chapter){this.last=chapter;this.touches.fill(0);for(let i=0;i<3;i++)this.growth[i]=i<earned?1:0;this.groups.forEach((g,i)=>g.visible=i===chapter);for(const home of this.homes)for(let i=0;i<4;i++)home.getObjectByName('Habitat'+i)!.visible=i===chapter;}
  this.cooldown=Math.max(0,this.cooldown-dt);this.response=0;
  for(let i=0;i<6;i++){
   const tuft=this.tufts[chapter][i];let nearest=.13,hand=-1;
   if(active)for(let j=0;j<hands.length;j++)if(present[j]){const d=hands[j].distanceTo(tuft.position);if(d<nearest){nearest=d;hand=j;}}
   const influence=habitatInfluence(nearest),before=this.touches[i];this.touches[i]+=(influence-before)*(1-Math.exp(-dt*9));
   this.response=Math.max(this.response,this.touches[i]);
   const direction=hand>=0?(hands[hand].x>tuft.position.x?1:-1):i<3?1:-1;
   tuft.rotation.z=Math.sin(time*.8+i)*.018+direction*this.touches[i]*.30;
   tuft.rotation.x=Math.sin(time*.65+i)*.012+this.touches[i]*.10;
   if(influence>.45&&before<.3&&this.cooldown===0){this.brushSerial++;this.brushPosition.copy(tuft.position);this.cooldown=.65;}
  }
  for(let i=0;i<this.trees[chapter].length;i++)this.trees[chapter][i].rotation.z=Math.sin(time*.38+i*1.7)*.012;
  for(let i=0;i<this.glints[chapter].length;i++){const glint=this.glints[chapter][i];(glint.material as T.MeshBasicMaterial).opacity=.05+Math.pow(Math.max(0,Math.sin(time*.7+i*1.8)),6)*.20;glint.scale.x=.8+Math.sin(time*.5+i)*.18;}
  this.restored=0;
  for(let i=0;i<3;i++){
   const target=habitatGrowthTarget(i,earned,encounter,progress,ending,active);
   this.growth[i]+=(target-this.growth[i])*(1-Math.exp(-dt*3));const patch=this.patches[chapter][i];patch.visible=this.growth[i]>.01;
   if(i<2)patch.scale.y=Math.max(.001,this.growth[i]);else for(const material of this.lampMaterials[chapter])material.opacity=this.growth[i];
   if(this.growth[i]>.95)this.restored++;
  }
  this.pathLight=this.growth[2];
 }
}
