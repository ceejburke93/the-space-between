import * as T from '@iwsdk/core';
import {LoftSurface,sampleRange} from './lib/hardsurface';
/** Continuous Y-up bodies, plus points on their actual skin for attached detail. */
export function creatureSurface(sections:{y:number;rx:number;depth:number;cx?:number}[],segments=24){
 const surface=LoftSurface.tube(sections.map(s=>({z:s.y,halfW:s.rx,hUp:s.depth,hDown:s.depth,cx:s.cx??0,cy:0,power:2})));
 const geometry=surface.build(sampleRange(sections[0].y,sections[sections.length-1].y,33),segments,true);geometry.rotateX(-Math.PI/2);
 return {geometry,point:(y:number,angle:number,offset=.0005)=>{const p=surface.point(y,angle);return new T.Vector3(p.x,p.z,-p.y+offset);}};
}
export function paintSkin(geometry:T.BufferGeometry,low:number,high:number,height:number,warmFront=false){
 const positions=geometry.getAttribute('position'),colors=new Float32Array(positions.count*3),a=new T.Color(low),b=new T.Color(high),c=new T.Color(),heart=new T.Color(0xffd395);
 for(let i=0;i<positions.count;i++){const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);c.copy(a).lerp(b,T.MathUtils.clamp(y/height,0,1));if(warmFront){const heat=Math.max(0,1-Math.abs(x)/.027)*Math.max(0,1-Math.abs(y-.03)/.04)*Math.max(0,z/.018);c.lerp(heart,Math.min(.8,heat));}colors.set([c.r,c.g,c.b],i*3);}
 geometry.setAttribute('color',new T.BufferAttribute(colors,3));
}
/** Same deformed sphere is used by stone, moss and mineral inlays. */
export function stonePoint(x:number,y:number,z:number,offset=0){const shape=1+Math.sin(x*95+y*58)*Math.sin(z*70)*.045;const scale=shape+offset;return new T.Vector3(x*scale*.96,y*scale*1.13+.037,z*scale*.84);}
export function shapeStone(geometry:T.BufferGeometry,offset=0){const p=geometry.getAttribute('position');for(let i=0;i<p.count;i++){const v=stonePoint(p.getX(i),p.getY(i),p.getZ(i),offset);p.setXYZ(i,v.x,v.y,v.z);}geometry.computeVertexNormals();}
