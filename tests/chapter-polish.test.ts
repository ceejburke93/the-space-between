import {test} from 'node:test';
import assert from 'node:assert/strict';
import {homeLight,ChapterPresence} from '../src/chapter-polish.ts';
test('the welcome light stays bounded at full completion and rejects corrupt progress',()=>{assert.ok(homeLight(12,1,7)<=.012);assert.ok(homeLight(12,1,7)>homeLight(0,0,0));assert.equal(homeLight(Infinity,NaN,-1),homeLight(0,0,0));assert.equal(homeLight(999,999,999),homeLight(12,1,3));});
test('arrival presentation restarts on a new encounter or replay without gating interaction',()=>{const p=new ChapterPresence();for(let i=0;i<80;i++)p.update(0,0,.1);assert.equal(p.settling,0);p.update(0,1,.05);assert.ok(p.settling>.9);p.reset();assert.equal(p.settling,1);});
