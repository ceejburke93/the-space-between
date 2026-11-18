import * as T from '@iwsdk/core';
import assets from './assets';
/** Scene animation changes only local scenery; sky, lighting and camera stay still. */
export class Awakenings {
 readonly group=assets.awakenings.clone(true);
 constructor(root:T.Group){
  this.group.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line){o.material=(o.material as T.Material).clone();if(o instanceof T.Line)o.geometry=o.geometry.clone();}});root.add(this.group);
 }
 update(chapter:number,reveal:number,time:number){
  this.group.children.forEach((region,i)=>region.visible=i===chapter&&reveal>0);
  const region=this.group.children[chapter],smooth=reveal*reveal*(3-2*reveal);
  if(chapter===0){for(let i=0;i<6;i++){const pivot=region.children[i],side=i%2?1:-1;const opening=Math.max(0,Math.min(1,(reveal-i*.055)/.7));pivot.rotation.z=side*(1-opening)*1.15;pivot.scale.setScalar(.2+opening*.8);}}
  if(chapter===1){for(const item of region.children){if(item.name.startsWith('ReflectionStar')){const index=Number(item.name.slice(-1));const t=Math.max(0,Math.min(1,reveal*1.6-index*.18));item.scale.setScalar(Math.max(.001,t));item.position.y=.73+Math.sin(time*.8+index)*.0015;}else if(item instanceof T.Line){item.geometry.setDrawRange(0,Math.floor(reveal*4));(item.material as T.LineBasicMaterial).opacity=smooth*.65;}else{item.scale.setScalar(.2+smooth*.8);(item as T.Mesh<T.BufferGeometry,T.MeshBasicMaterial>).material.opacity=smooth*.3;}}}
  if(chapter===2){region.children.forEach((item,i)=>{const line=item as T.Line;const t=Math.max(0,Math.min(1,reveal*1.5-i*.1));line.geometry.setDrawRange(0,Math.floor(t*25));(line.material as T.LineBasicMaterial).opacity=.4+t*.45;});}
  if(chapter===3){region.getObjectByName('TerraceLeft')!.position.x=-.24-smooth*.23;region.getObjectByName('TerraceRight')!.position.x=.24+smooth*.23;const garden=region.getObjectByName('CommunalGarden')!;garden.scale.setScalar(Math.max(.001,smooth));garden.position.y=.84+smooth*.08;}
 }
}
