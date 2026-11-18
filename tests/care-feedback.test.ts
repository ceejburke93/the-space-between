import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CareFeedback } from '../src/care-feedback.ts';
const hands=[{x:0,y:1.2,z:-.54},{x:0,y:1.2,z:-.54}];
function tick(c:CareFeedback,n=80,moving=false,present=true){for(let i=0;i<n;i++)c.update(.05,[{...hands[0],x:moving?(i%2)*.035:0},hands[1]],[present,false],true,true,1,0,0,0);}
test('slow supported movement builds calm; faster movement only reduces the positive bonus',()=>{
 const slow=new CareFeedback(),fast=new CareFeedback();tick(slow);tick(fast,80,true);assert.ok(slow.calm>.9);assert.ok(slow.quality>.95);assert.ok(fast.quality<slow.quality);assert.ok(fast.quality>=0);
});
test('tracking loss cannot build calm, and reacquiring at a new position is not a speed spike',()=>{
 const c=new CareFeedback();tick(c);tick(c,80,false,false);assert.ok(c.calm<.3);c.update(.05,[{x:4,y:5,z:6},hands[1]],[true,false],true,true,1,0,0,0);assert.ok(c.speed<.1);
});
test('formation pulses once, completed checkpoint restoration does not replay the pulse',()=>{
 const c=new CareFeedback();tick(c,1);assert.equal(c.completion,1);tick(c,30);assert.equal(c.completion,0);c.reset();c.restore(true);tick(c,1);assert.equal(c.completion,0);
});
test('each region unfolds after its third homecoming; other encounters retain its restored scenery',()=>{
 for(let chapter=0;chapter<4;chapter++){const c=new CareFeedback();c.update(.05,hands,[true,false],true,true,chapter,2,0,12);assert.equal(c.reveal,0);for(let i=0;i<120;i++)c.update(.05,hands,[true,false],true,true,chapter,2,2,chapter*3+2);assert.equal(c.reveal,1);c.reset();c.update(.05,hands,[true,false],false,false,chapter,0,0,(chapter+1)*3);assert.equal(c.reveal,1);}
});
