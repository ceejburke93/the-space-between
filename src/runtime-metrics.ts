import { createComponent, Types } from '@iwsdk/core';
/** Read-only development telemetry, available through the IWSDK inspector. */
export const RuntimeMetrics=createComponent('RuntimeMetrics',{
 progress:{type:Types.Float32,default:0},
 drawCalls:{type:Types.Float32,default:0},
 triangles:{type:Types.Float32,default:0},
 callbacksPerSecond:{type:Types.Float32,default:0},
 bridgeHeight:{type:Types.Float32,default:0},
 worldScale:{type:Types.Float32,default:1},
 leftDistance:{type:Types.Float32,default:0},
 rightDistance:{type:Types.Float32,default:0},
 assisted:{type:Types.Boolean,default:false},
 woven:{type:Types.Boolean,default:false},
},'Development measurements; emulator timing is not a hardware certification');
