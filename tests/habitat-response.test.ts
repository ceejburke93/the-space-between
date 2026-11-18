import {test} from 'node:test';
import assert from 'node:assert/strict';
import {habitatInfluence,habitatMilestones,habitatGrowthTarget} from '../src/habitat-response.ts';
import {terrainHeight,habitatGround,trailPoint} from '../src/terrain-profile.ts';
test('scenery touch is bounded and fades continuously outside reach',()=>{
 assert.equal(habitatInfluence(0),1);assert.equal(habitatInfluence(.13),0);assert.equal(habitatInfluence(2),0);
 let last=1;for(let d=0;d<.15;d+=.001){const v=habitatInfluence(d);assert.ok(v>=0&&v<=last);last=v;}
});
test('saved ecological changes survive replay and never unlock the next region',()=>{
 assert.deepEqual([0,1,2,3].map(c=>habitatMilestones(c,5)),[3,2,0,0]);
 assert.equal(habitatGrowthTarget(1,2,0,0,0,true),1);
 assert.equal(habitatGrowthTarget(2,2,0,0,0,true),0);
});
test('each homecoming reveals only its own new milestone, gradually',()=>{
 assert.equal(habitatGrowthTarget(0,0,0,.99,7,true),0);
 assert.equal(habitatGrowthTarget(0,0,0,1,.8,true),0);
 assert.ok(Math.abs(habitatGrowthTarget(0,0,0,1,2.3,true)-.5)<1e-9);
 assert.equal(habitatGrowthTarget(0,0,0,1,3.8,true),1);
 assert.equal(habitatGrowthTarget(1,0,0,1,7,true),0);
 assert.equal(habitatGrowthTarget(0,0,0,1,7,false),0);
});
test('hut trails join broad banks and stay outside the puzzle opening',()=>{
 for(let c=0;c<4;c++)for(const side of [-1,1]){
  assert.ok(terrainHeight(c,side*.65,-.77)>.94);
  let previous=habitatGround(c,side*.64,-.74);
  for(let i=0;i<=100;i++){const p=trailPoint(side,i/100),y=habitatGround(c,p.x,p.z);assert.ok(Math.abs(p.x)>.6);assert.ok(Math.abs(y-previous)<.08,'Trail must not jump off a pedestal');previous=y;}
 }
});
