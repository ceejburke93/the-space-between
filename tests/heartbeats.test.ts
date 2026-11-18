import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Heartbeats } from '../src/heartbeats.ts';
import { normalizeSave } from '../src/journey.ts';
test('meeting retreats once then reaches, without requiring a gesture to progress',()=>{
 const h=new Heartbeats();h.notice(.1,true,true);assert.equal(h.meeting,1);h.notice(1.3,false,true);assert.equal(h.meeting,2);h.notice(.9,true,true);assert.equal(h.meeting,3);
});
test('seed requires receiving before opening or lifting, and cannot bloom on tracking loss',()=>{
 const h=new Heartbeats();assert.equal(h.gift(1,true,Infinity,0,true),false);h.gift(.4,true,.05,1.1,false);assert.equal(h.giftStage,1);assert.equal(h.gift(1,true,Infinity,1.3,true),false);assert.equal(h.gift(.5,true,.05,1.16,false),true);assert.equal(h.giftStage,2);assert.equal(h.gift(.5,true,.05,1.16,true),false);
});
test('open hand is an alternative to lifting and restored seeds stay bloomed',()=>{
 const h=new Heartbeats();h.gift(.4,true,.05,1.1,false);assert.equal(h.gift(.5,true,.05,1.1,true),true);h.reset(true,false);assert.equal(h.giftStage,2);assert.ok(h.bloomTime>=8);
});
test('finale pauses outside the final garden and returns to the completed tableau',()=>{
 const h=new Heartbeats();h.finale(20,false);assert.equal(h.finaleTime,0);assert.equal(h.finale(23,true),false);assert.equal(h.finale(1,true),true);h.reset(false,true);assert.equal(h.finaleTime,24);
});
test('new optional memories survive save normalization without changing old progress',()=>{
 const old=normalizeSave({version:3,completed:5,chapter:1,encounter:2});assert.equal(old.seedBloomed,false);const restored=normalizeSave({...old,seedBloomed:true,finaleSeen:true});assert.equal(restored.seedBloomed,true);assert.equal(restored.completed,5);
});
