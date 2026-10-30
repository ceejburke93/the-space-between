import { AssetType, defineAssets } from '@iwsdk/core';
export default defineAssets({
 'planet-menu':{url:`${import.meta.env.BASE_URL}ui/planet-menu.uikitml`,type:AssetType.UIKitML},
 'comfort-settings':{url:`${import.meta.env.BASE_URL}ui/settings.uikitml`,type:AssetType.UIKitML},
 'discovery-controls':{url:`${import.meta.env.BASE_URL}ui/discovery.uikitml`,type:AssetType.UIKitML},
 'pause-menu':{url:`${import.meta.env.BASE_URL}ui/pause.uikitml`,type:AssetType.UIKitML},
});
