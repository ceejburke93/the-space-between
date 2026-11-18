import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MenuPress } from '../src/menu-press.ts';
test('a fingertip release requires its own deliberate press',()=>{
 const p=new MenuPress();assert.equal(p.release(1,20),false);
 p.down(1,100);assert.equal(p.release(2,200),false);
 p.down(1,300);assert.equal(p.release(1,650),true);
 assert.equal(p.release(1,700),false);
});
test('touch release and synthesized click activate once; other pointers still click',()=>{
 const p=new MenuPress();p.down(1,100);assert.equal(p.release(1,450),true);
 assert.equal(p.click(1,451),false);assert.equal(p.click(2,451),true);
 assert.equal(p.click(1,1300),true);
});
test('cancelled and long-held touches do not activate',()=>{
 const p=new MenuPress();p.down(1,100);p.cancel();assert.equal(p.release(1,200),false);
 p.down(1,300);assert.equal(p.release(1,1100),false);
});
