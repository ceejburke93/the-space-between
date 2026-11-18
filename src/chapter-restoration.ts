import * as T from '@iwsdk/core';
import assets from './assets';
/** A visible consequence of each encounter; saved gameplay remains the source of truth. */
export class ChapterRestoration {
 readonly group=assets['chapter-restoration'].clone(true);
 private regions=[0,1,2,3].map(i=>this.group.getObjectByName('Restoration'+i)!);
 private patches=this.regions.map(r=>[0,1,2].map(i=>r.getObjectByName('Milestone'+i)!));
 private sizes=[0,0,0];private chapter=-1;private encounter=-1;
 reset(){this.chapter=this.encounter=-1;}
 get visibleMilestones(){let n=0;if(this.group.visible&&this.chapter>=0)for(const patch of this.patches[this.chapter])if(patch.visible&&patch.scale.x>.5)n++;return n;}
 constructor(root:T.Group){root.add(this.group);this.group.visible=false;}
 update(chapter:number,encounter:number,progress:number,ending:number,dt:number,visible:boolean){
  this.group.visible=visible;if(!visible)return;
  if(chapter!==this.chapter||encounter!==this.encounter){this.chapter=chapter;this.encounter=encounter;for(let i=0;i<3;i++)this.sizes[i]=i<encounter?1:0;}
  for(let ch=0;ch<4;ch++)this.regions[ch].visible=ch===chapter;
  for(let i=0;i<3;i++){const target=i<encounter?1:i===encounter&&progress>=1?T.MathUtils.smoothstep(ending,.7,3):0;this.sizes[i]=T.MathUtils.lerp(this.sizes[i],target,1-Math.exp(-dt*5));const patch=this.patches[chapter][i];patch.visible=this.sizes[i]>.005;patch.scale.setScalar(Math.max(.001,this.sizes[i]));}
 }
}
