import * as T from '@iwsdk/core';
/** Bake static scenery into a few colored meshes; animated objects remain independent. */
export function batchStaticScenery(group:T.Group){
 group.updateWorldMatrix(true,true);const inverse=group.matrixWorld.clone().invert();
 const batches=new Map<string,{positions:number[];normals:number[];colors:number[];material:T.MeshStandardMaterial}>();
 const originals:T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>[]=[];
 group.traverse(object=>{
  if(!(object instanceof T.Mesh)||!(object.material instanceof T.MeshStandardMaterial)||object.material.transparent)return;
  const material=object.material,key=`${material.emissive.getHex()}|${material.emissiveIntensity}|${material.roughness}`;
  let batch=batches.get(key);if(!batch){const copy=material.clone();copy.color.setHex(0xffffff);copy.vertexColors=true;batch={positions:[],normals:[],colors:[],material:copy};batches.set(key,batch);}
  let geometry=object.geometry.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,object.matrixWorld));if(geometry.index){const expanded=geometry.toNonIndexed();geometry.dispose();geometry=expanded;}
  const position=geometry.getAttribute('position'),normal=geometry.getAttribute('normal'),colors=material.vertexColors?geometry.getAttribute('color'):undefined;for(let i=0;i<position.count;i++){batch.positions.push(position.getX(i),position.getY(i),position.getZ(i));batch.normals.push(normal.getX(i),normal.getY(i),normal.getZ(i));batch.colors.push(material.color.r*(colors?colors.getX(i):1),material.color.g*(colors?colors.getY(i):1),material.color.b*(colors?colors.getZ(i):1));}geometry.dispose();originals.push(object);
 });
 originals.forEach(object=>{object.removeFromParent();object.geometry.dispose();object.material.dispose();});
 batches.forEach(batch=>{const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(batch.positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(batch.normals,3));geometry.setAttribute('color',new T.Float32BufferAttribute(batch.colors,3));geometry.computeBoundingSphere();group.add(new T.Mesh(geometry,batch.material));});
}
