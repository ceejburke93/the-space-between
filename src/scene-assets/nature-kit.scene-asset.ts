import * as T from '@iwsdk/core';
import data from './kaykit-data.json';
export type NatureKind='oak'|'spire'|'willow'|'bare'|'bush'|'rock'|'slab'|'grass';
const ids={oak:'Tree_1_A_Color1',spire:'Tree_2_B_Color1',willow:'Tree_3_A_Color1',bare:'Tree_Bare_1_A_Color1',bush:'Bush_2_A_Color1',rock:'Rock_1_A_Color1',slab:'Rock_2_A_Color1',grass:'Grass_1_A_Color1'} as const;
/** KayKit CC0 geometry, +Y up, original meter units. Roots deliberately embed below zero. */
export function createNatureModel(kind:NatureKind,chapter=0){
 const d=data[ids[kind]],g=new T.BufferGeometry();
 g.setAttribute('position',new T.Float32BufferAttribute(d.positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(d.normals,3));const colors=d.colors.slice();
 for(let i=0;i<colors.length;i+=3){const luminance=colors[i]*.2126+colors[i+1]*.7152+colors[i+2]*.0722;for(let c=0;c<3;c++)colors[i+c]=colors[i+c]*.68+luminance*.32;}
 g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeBoundingSphere();
 const mesh=new T.Mesh(g,new T.MeshStandardMaterial({color:[0xb0b7a5,0xa6c9c7,0x756e72,0xc4baa0][chapter],vertexColors:true,roughness:.92}));mesh.name='KayKit_'+kind;return mesh;
}
