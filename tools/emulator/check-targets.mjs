import {deepStrictEqual} from 'node:assert';
import {readFileSync} from 'node:fs';
import {puzzleNodes} from '../../src/puzzle-challenge.ts';
const fixture=JSON.parse(readFileSync(new URL('./targets.json',import.meta.url),'utf8'));
const actual=Array.from({length:4},(_,chapter)=>[1,2].map(encounter=>puzzleNodes(chapter,encounter)));
deepStrictEqual(fixture,actual,'Emulator targets drifted from the game. Regenerate the fixture from puzzleNodes before replaying.');
console.log('Emulator target fixture matches all eight later encounters.');
