import {createHabitatLife} from './scene-assets/habitat-life.scene-asset';
import {createNatureModel} from './scene-assets/nature-kit.scene-asset';
import {createChapterRestoration} from './scene-assets/chapter-restoration.scene-asset';
import {createWorldMemory} from './scene-assets/world-memory.scene-asset';
import {createDiscoveryPlanet,createPlanetMemory} from './scene-assets/discovery-planet.scene-asset';
import {createIslandWorld,createRegionLandscape} from './scene-assets/island-world.scene-asset';
import {createLastLight} from './scene-assets/last-light.scene-asset';
import {createPuzzleBoard} from './scene-assets/puzzle-board.scene-asset';
import { createCreatureBody } from './scene-assets/creatures.scene-asset';
import { createLeafHabitat } from './scene-assets/leaf-habitat.scene-asset';
import { createAwakenings } from './scene-assets/awakenings.scene-asset';
import { createLivingWorld } from './scene-assets/living-world.scene-asset';
import { AssetType, defineAssets } from '@iwsdk/core';
export default defineAssets({
 'habitat-life':createHabitatLife(0),
 'nature-oak':createNatureModel('oak'),'nature-rock':createNatureModel('rock'),'nature-grass':createNatureModel('grass'),
 'discovery-planet':createDiscoveryPlanet(),
 'planet-memory':createPlanetMemory(),
 'island-grass':createIslandWorld(0),'island-water':createIslandWorld(1),'island-fire':createIslandWorld(2),'island-earth':createIslandWorld(3),
 'landscape-grass':createRegionLandscape(0),'landscape-water':createRegionLandscape(1),'landscape-fire':createRegionLandscape(2),'landscape-earth':createRegionLandscape(3),
 'chapter-restoration':createChapterRestoration(),
 'world-memory':createWorldMemory(),
 'last-light':createLastLight(),
 'puzzle-board':createPuzzleBoard(),
 'leaf-hero':createCreatureBody(0),
 'water-hero':createCreatureBody(1),
 'fire-hero':createCreatureBody(2),
 'earth-hero':createCreatureBody(3),
 'leaf-habitat':createLeafHabitat(),
 'awakenings':createAwakenings(),
 'living-world':createLivingWorld(),
 'planet-menu':{url:`${import.meta.env.BASE_URL}ui/planet-menu.uikitml`,type:AssetType.UIKitML},
 'comfort-settings':{url:`${import.meta.env.BASE_URL}ui/settings.uikitml`,type:AssetType.UIKitML},
 'discovery-controls':{url:`${import.meta.env.BASE_URL}ui/discovery.uikitml`,type:AssetType.UIKitML},
 'journey-picker':{url:`${import.meta.env.BASE_URL}ui/journey.uikitml`,type:AssetType.UIKitML},
 'homecoming':{url:`${import.meta.env.BASE_URL}ui/homecoming.uikitml`,type:AssetType.UIKitML},
 'pause-menu':{url:`${import.meta.env.BASE_URL}ui/pause.uikitml`,type:AssetType.UIKitML},
});
