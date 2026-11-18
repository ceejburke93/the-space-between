import {test} from 'node:test';
import assert from 'node:assert/strict';
import {terrainHeight} from '../src/terrain-profile.ts';
test('planet terrain keeps the bridge ravine open and outcrops embedded',()=>{
 for(let c=0;c<4;c++){
  for(let x=-.22;x<=.22;x+=.02)assert.ok(terrainHeight(c,x,-.62)<.25,'Central valley must stay well below the crossing');
  for(const x of [-.48,.48])assert.ok(terrainHeight(c,x,-.62)>.015,'Cliff base must intersect the planet');
  for(let x=-.75;x<.76;x+=.05)for(let z=-.8;z<-.4;z+=.05)assert.ok(terrainHeight(c,x,z)<.99,'Ground must not bury the deck or feet');
  for(let x=-6;x<=6;x+=.25)for(let z=-8;z<=2;z+=.25){const y=terrainHeight(c,x,z);assert.ok(Number.isFinite(y)&&y>0&&y<1.4);}
 }
});
