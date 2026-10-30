import { World } from '@iwsdk/core';
import projectOptions from 'virtual:iwsdk-project';
import { BetweenSystem } from './between';
import './style.css';
World.create(document.getElementById('scene-container') as HTMLDivElement, projectOptions)
 .then(world => { world.registerSystem(BetweenSystem); document.querySelector('#loading')?.remove(); })
 .catch(error => { document.querySelector('#loading')!.textContent = 'The world could not load. Please refresh. ' + error.message; console.error(error); });
