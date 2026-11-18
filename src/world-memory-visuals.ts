import * as T from '@iwsdk/core';
import assets from './assets';
import type {LastLight} from './last-light';
/** Small, persistent consequences on the existing decks. No camera or light changes. */
export class WorldMemoryVisuals {
 readonly group=assets['world-memory'].clone(true);
 private arches=this.group.getObjectByName('ArchSettlement')!;private garden=this.group.getObjectByName('RiverGarden')!;
 private flower=this.group.getObjectByName('SharedFlower')!;private learner=this.group.getObjectByName('Newcomer')!;private body=this.group.getObjectByName('LearnerBody')!;
 private petals=[0,1,2,3,4,5].map(i=>this.group.getObjectByName('Petal'+i)!);
 private water=this.group.getObjectByName('SeedTributary')!;
 private feet=[-1,1].map(i=>this.group.getObjectByName('Foot'+i)!);
 constructor(root:T.Group){root.add(this.group);this.group.visible=false;}
 update(p:LastLight,active:boolean,time:number){
  const m=p.memory;this.group.visible=active&&p.released&&p.time>=24;if(!this.group.visible)return;
  this.arches.visible=!!p.aqueduct;this.garden.visible=!p.aqueduct;this.water.visible=m.watered;
  const growth=T.MathUtils.smoothstep(m.growth,0,6);
  const bloom=.35+growth*1.05;
  this.flower.scale.setScalar(bloom*(1+Math.sin(time*.72)*growth*.02));
  this.flower.rotation.z=m.watered?Math.sin(time*.38)*growth*.035:.28;
  for(const petal of this.petals)petal.rotation.x=-(1-growth)*1.15;
  const arriving=T.MathUtils.smoothstep(m.arrival,0,3),lesson=m.lesson;
  const walking=lesson>8?T.MathUtils.smoothstep(lesson,8,14):0;
  this.learner.position.set(m.blooming?.29+walking*.16:.52-arriving*.23,1.022,m.blooming?-.64:-.73);
  this.learner.rotation.y=m.blooming?Math.PI/2:Math.PI;this.body.rotation.x=m.blooming?-.06:!m.watered?.2:!m.warmed?.1:0;
  const moving=!m.blooming&&arriving<1||walking>0&&walking<1;
  for(let i=0;i<2;i++){const step=Math.sin(time*7+i*Math.PI);this.feet[i].position.y=.004+(moving?Math.max(0,step)*.004:0);this.feet[i].position.z=.004+(moving?step*.006:0);}
  for(const side of [-1,1])this.learner.getObjectByName('LearnerArm'+side)!.rotation.x=m.blooming&&lesson>4&&lesson<8?-.65:!m.watered?-.35:0;
 }
}
