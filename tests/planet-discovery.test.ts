import {test} from 'node:test';
import assert from 'node:assert/strict';
import {discoveryDetail} from '../src/planet-discovery.ts';
test('planet detail follows zoom size and remains hidden at distant scale',()=>{assert.equal(discoveryDetail(.035),0);assert.ok(discoveryDetail(.18)>0);assert.equal(discoveryDetail(.46),1);let prior=0;for(let scale=0;scale<=.6;scale+=.01){const detail=discoveryDetail(scale);assert.ok(detail>=prior&&detail>=0&&detail<=1);prior=detail;}});
