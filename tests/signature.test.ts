import { ElementRitual } from "../src/element-ritual.ts";

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HandMeeting } from '../src/hand-meeting.ts';
import { EncounterChallenge } from '../src/encounter-challenge.ts';
import { rememberedCrossing } from '../src/finale-memory.ts';
import { normalizeSave } from '../src/journey.ts';
const palm={x:-.25,y:1.04,z:-.58},absent={x:0,y:0,z:0};
test('offered hand reaches contact, receives a glance and returns safely to land',()=>{const m=new HandMeeting();for(let i=0;i<62;i++)m.update(.05,[palm,absent],[true,false],true);assert.equal(m.stage,5);assert.equal(m.contact,0);assert.equal(m.target.y,palm.y+.0044);});
test('losing or withdrawing a hand retracts the testing foot instead of holding it in space',()=>{const m=new HandMeeting();for(let i=0;i<20;i++)m.update(.05,[palm,absent],[true,false],true);assert.ok(m.contact>0);for(let i=0;i<15;i++)m.update(.05,[palm,absent],[false,false],true);assert.equal(m.stage,0);assert.equal(m.contact,0);for(let i=0;i<62;i++)m.update(.05,[absent,palm],[false,true],true);assert.equal(m.trusted,true);assert.equal(m.stage,5);});
test('meeting remains optional when the player forms the thread first',()=>{const m=new HandMeeting();m.update(.1,[palm,absent],[true,false],true);m.update(1,[palm,absent],[true,false],false);assert.equal(m.contact,0);});
test('Leaf accepts a deliberate pause or a longer steady perch as equal solutions',()=>{for(const supported of [false,true]){const c=new EncounterChallenge();for(let i=0;i<30&&!c.complete;i++)c.update(0,1,.05,[palm,absent],[true,false],supported,true);assert.equal(c.complete,true);assert.equal(c.choice,supported?2:1);}});
test('Fire accepts shelter above or a cup below, but not an unrelated distant hand',()=>{for(const [y,choice] of [[1.28,1],[1.0,2]]){const c=new EncounterChallenge();for(let i=0;i<14;i++)c.update(2,1,.05,[{x:.04,y,z:-.58},absent],[true,false],true,true);assert.equal(c.complete,true);assert.equal(c.choice,choice);}const c=new EncounterChallenge();c.update(2,1,1,[{x:1,y:1,z:1},absent],[true,false],true,true);assert.equal(c.complete,false);});
test('switching between solutions does not combine partial dwell into an accidental choice',()=>{const c=new EncounterChallenge();c.update(0,1,.4,[palm,absent],[true,false],false,true);c.update(0,1,.9,[palm,absent],[true,false],true,true);assert.equal(c.complete,false);});
test('remembered perch has an actual pause together and all companions eventually get home',()=>{assert.equal(rememberedCrossing(0,18,2),rememberedCrossing(0,19,2));assert.equal(rememberedCrossing(1,19,2),rememberedCrossing(1,19.8,2));for(let actor=0;actor<4;actor++)for(const choice of [0,1,2])assert.equal(rememberedCrossing(actor,24,choice),1);});
test('choice memories survive normalization; corrupt values cannot invent a solution',()=>{const s=normalizeSave({version:3,completed:12,leafChoice:2,fireChoice:1,metLeaf:true});assert.equal(s.leafChoice,2);assert.equal(s.fireChoice,1);assert.equal(s.metLeaf,true);assert.equal(normalizeSave({leafChoice:55,fireChoice:'cup'}).fireChoice,0);});

test('Leaf waits before testing a palm and an early withdrawal never jumps toward it',()=>{
 const m=new HandMeeting();m.update(.1,[palm,absent],[true,false],true);assert.equal(m.contact,0);
 m.update(.3,[palm,absent],[true,false],true);const before=m.contact;assert.ok(before>0&&before<1);
 m.update(.05,[palm,absent],[false,false],true);assert.ok(m.contact<=before);
});

test('Water and Earth cues match the one-hand motions',()=>{const r=new ElementRitual();assert.match(r.prompt(1),/one hand/);assert.match(r.prompt(3),/one hand/);});
