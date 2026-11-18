/** Shared chapter rhythm: recognition, practice, then a meaningful combination. */
export const CHAPTER_BEATS=[
 ['Offer a little patience.','A pause can be part of the way.','Two paths. The same kindness.'],
 ['Let the stream find its shape.','Stillness makes room for movement.','A little water can help two lives.'],
 ['Give a small flame room to grow.','Warmth travels best with shelter.','A refuge can pass its warmth onward.'],
 ['Let the stones settle.','Support follows the changing weight.','Every shape has somewhere to belong.'],
] as const;
const bounded=(v:number,max:number)=>Math.max(0,Math.min(max,Number.isFinite(v)?v:0));
/** Doorway illumination must stay small at this tabletop's physical scale. */
export function homeLight(completed:number,progress:number,ending:number){
 return .004+bounded(completed,12)*.0003+bounded(progress,1)*.002+bounded(ending,3)*.0005;
}
export class ChapterPresence {
 arrival=0;private chapter=-1;private encounter=-1;
 reset(){this.arrival=0;this.chapter=this.encounter=-1;}
 update(chapter:number,encounter:number,dt:number){if(this.chapter!==chapter||this.encounter!==encounter){this.chapter=chapter;this.encounter=encounter;this.arrival=0;}this.arrival=Math.min(6,this.arrival+Math.max(0,Math.min(.1,dt)));}
 get settling(){return Math.max(0,1-this.arrival/3);}
}

export const CHAPTER_RETURNS=[
 ['It took the last step by itself.','A moment of rest became new courage.','Your chosen path is part of its home.'],
 ['The stream has found its way.','Still water made a safe crossing.','Water found enough to share.'],
 ['A small warmth has a home.','The shelter kept its promise.','One light became a chain of refuges.'],
 ['The stones are ready to carry life.','A changing weight found steady support.','Different shapes. A place for everyone.'],
] as const;

/** A distinct, quiet recognition beat as each element carries its traveler home. */
export const CHAPTER_CROSSINGS=[
 {step:'A LITTLE TRUST',title:'You gave them room to choose.',hint:'Keep the thread steady as they find their courage.',status:'Crossing, one small step at a time'},
 {step:'THE STREAM HOLDS',title:'The water found a way through.',hint:'Keep the stream steady as your traveler follows.',status:'Flowing, one gentle step at a time'},
 {step:'CARRY THE WARMTH',title:'Your shelter lets the spark travel.',hint:'Keep the ember near as it finds its refuge.',status:'Warmth carried, one small step at a time'},
 {step:'STEADY GROUND',title:'Your stones hold as the weight shifts.',hint:'Stay nearby while your traveler crosses.',status:'Crossing, one careful step at a time'},
] as const;
