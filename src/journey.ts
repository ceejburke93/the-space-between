import {normalizeLastLight,type LastLightSave} from './last-light.ts';
import { normalizePuzzle, type PuzzleSave } from './puzzle-challenge.ts';
/** Save rules stay independent of rendering and browser state. */
export const CHAPTERS=[
 {element:'grass',name:'First Light',color:0xa6c98a,ending:'A little kindness takes root.'},
 {element:'water',name:'A River Remembers',color:0x8ed4e3,ending:'You gave the water a way home.'},
 {element:'fire',name:'A Small, Brave Flame',color:0xffbb75,ending:'Even a small light can warm a world.'},
 {element:'earth',name:'Where We Belong',color:0xc3ab8c,ending:'Four elements. One living world.'},
] as const;
export const ENCOUNTERS=[['First Light','A Seed of Trust','A Sheltered Way'],['A River Remembers','Still Waters','Share the Rain'],['A Small, Brave Flame','Shelter a Spark','Pass the Flame'],['The First Stone','A Gentle Weight','A Place for Everyone']] as const;
export interface JourneySave {worldLegacy?:LastLightSave;lastLight?:LastLightSave;puzzle?:PuzzleSave;kindnesses?:number;leafChoice?:number;fireChoice?:number;metLeaf?:boolean;seedBloomed?:boolean;finaleSeen?:boolean;version:3;visited:boolean;progress:number;sound:boolean;reducedReach:boolean;assisted:boolean;chapter:number;encounter:number;completed:number;ritualDone:boolean;challengeDone:boolean;endingTime:number;}
const finite=(value:unknown,fallback=0)=>typeof value==='number'&&Number.isFinite(value)?value:fallback;
export function normalizeSave(value:unknown):JourneySave{
 const v=value&&typeof value==='object'?value as Record<string,unknown>:{};
 const progress=Math.max(0,Math.min(1,finite(v.progress)));
 const legacy=v.version!==3;
 const oldCompleted=progress===1?1:0;
 const completed=Math.max(0,Math.min(12,Math.floor(finite(v.completed,oldCompleted)*(v.version===2?3:1))));
 const requested=v.version===3?Math.floor(finite(v.chapter))*3+Math.floor(finite(v.encounter)):Math.min(completed,11);
 const ordinal=Math.max(0,Math.min(11,completed,requested));
 const lastLight=normalizeLastLight(v.lastLight),archive=normalizeLastLight(v.worldLegacy)??lastLight;
 return {worldLegacy:archive?.released&&archive.time>=24?archive:undefined,lastLight,puzzle:normalizePuzzle(v.puzzle),kindnesses:Math.floor(Math.max(0,Math.min(15,finite(v.kindnesses)))),leafChoice:v.leafChoice===1||v.leafChoice===2?v.leafChoice:0,fireChoice:v.fireChoice===1||v.fireChoice===2?v.fireChoice:0,metLeaf:v.metLeaf===true,seedBloomed:v.seedBloomed===true,finaleSeen:v.finaleSeen===true,version:3,visited:v.visited===true,progress:legacy&&progress===1?0:progress,sound:v.sound===true,reducedReach:v.reducedReach===true,assisted:v.assisted===true,chapter:Math.floor(ordinal/3),encounter:ordinal%3,completed,ritualDone:v.ritualDone===true,challengeDone:v.challengeDone===true,endingTime:Math.max(0,Math.min(7,finite(v.endingTime)))};
}
/** Replays cannot award duplicate progress, and chapters cannot be skipped. */
export function earnHomecoming(completed:number,chapter:number,encounter=0){return chapter*3+encounter===completed?Math.min(12,completed+1):completed;}
/** Prefer an unfinished replay over advancing to the next unlocked encounter. */
export function resumeJourney(save:JourneySave):JourneySave{
 if(save.progress<1&&(save.progress>0||save.ritualDone))return save;
 if(save.completed===12)return {...save,chapter:3,encounter:2,progress:1,ritualDone:true,challengeDone:true,endingTime:7};
 if(save.completed>save.chapter*3+save.encounter)return {...save,chapter:Math.floor(save.completed/3),encounter:save.completed%3,progress:0,ritualDone:false,challengeDone:false,endingTime:0};
 return save;
}
