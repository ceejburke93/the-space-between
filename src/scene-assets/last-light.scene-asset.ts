import * as T from '@iwsdk/core';
import {LAST_LIGHT_NODES,sampleLastLightStream} from '../last-light';
/** Garden-scale support asset; metres, Y up, island contact at Y=1.02.
 * Envelope X ±.38, Y 1.01–1.50, Z -.94–-.28. No lights or camera motion. */
export function createLastLight(){
 const root=new T.Group();root.name='LastLight';
 const moss=new T.MeshStandardMaterial({color:0x78a176,roughness:.9}),stone=new T.MeshStandardMaterial({color:0xb4ac92,roughness:1});
 const seedMat=new T.MeshStandardMaterial({color:0xffd596,emissive:0xffc478,emissiveIntensity:.25,roughness:.7});
 const add=(name:string,g:T.BufferGeometry,m:T.Material,x:number,y:number,z:number,parent:T.Object3D=root)=>{const mesh=new T.Mesh(g,m);mesh.name=name;mesh.position.set(x,y,z);parent.add(mesh);return mesh;};
 const rings=new T.InstancedMesh(new T.TorusGeometry(.040,.0024,5,40),new T.MeshBasicMaterial({color:0xffffff}),6);rings.name='Invitations';rings.userData.iwsdkPreviewBounds='exclude';root.add(rings);for(let i=0;i<6;i++){const n=LAST_LIGHT_NODES[i];rings.setMatrixAt(i,new T.Matrix4().makeTranslation(n.x,n.y,n.z));}rings.instanceMatrix.needsUpdate=true;
 const channel=new T.Group();channel.name='ChannelStone';channel.position.set(0,1.025,-.34);root.add(channel);
 const bowl=add('Bowl',new T.CylinderGeometry(.05,.032,.025,12),stone,0,0,0,channel);bowl.scale.z=.65;
 const pointer=add('Spout',new T.ConeGeometry(.018,.07,4),stone,0,.004,-.045,channel);pointer.rotation.x=-Math.PI/2;pointer.scale.y=.7;
 const pool=add('Pool',new T.CylinderGeometry(.048,.045,.012,24),new T.MeshStandardMaterial({color:0x6ebac8,emissive:0x397184,emissiveIntensity:.25,roughness:.4}),0,1.022,-.8);
 const drop=add('WaterInvitation',new T.SphereGeometry(.017,12,8),pool.material,0,1.14,-.8);drop.scale.y=1.5;
 const roots=new T.Group();roots.name='ClosedRoots';root.add(roots);
 for(let i=0;i<3;i++){const pts=[new T.Vector3(-.24,1.025,-.72+i*.016),new T.Vector3(-.15,1.065,-.72+i*.016),new T.Vector3(-.065,1.025,-.72+i*.016)];add('Root',new T.TubeGeometry(new T.CatmullRomCurve3(pts),12,.006,5,false),moss,0,0,0,roots);}
 const shelter=new T.Group();shelter.name='LeafShelter';root.add(shelter);
 for(const side of [-1,1]){const pts=[new T.Vector3(side*.23,1.023,-.62),new T.Vector3(side*.17,1.12,-.62),new T.Vector3(0,1.17,-.62)];add('GrowingBranch',new T.TubeGeometry(new T.CatmullRomCurve3(pts),14,.005,5,false),moss,0,0,0,shelter);}
 for(let i=0;i<5;i++){const a=(i-2)*.3;const leaf=add('ShelterLeaf',new T.SphereGeometry(.037,10,6),moss,Math.sin(a)*.13,1.17-Math.abs(a)*.04,-.62,shelter);leaf.scale.set(1,.16,1.1);leaf.rotation.z=-a;}
 const hearth=add('Hearth',new T.CylinderGeometry(.045,.05,.012,14),stone,0,1.025,-.52);
 add('HearthEmber',new T.IcosahedronGeometry(.017,1),new T.MeshStandardMaterial({color:0xffba78,emissive:0xffaa62,emissiveIntensity:.1}),0,1.043,-.52,root);
 const seed=add('LastSeed',new T.SphereGeometry(.016,12,8),seedMat,-.23,1.052,-.62);seed.scale.set(.8,1.2,.8);
 const petal=new T.InstancedMesh(new T.SphereGeometry(.025,10,6),new T.MeshStandardMaterial({color:0xf5d49c,emissive:0xe8ae71,emissiveIntensity:.2}),6);petal.name='HomeBloom';root.add(petal);
 const matrix=new T.Matrix4(),q=new T.Quaternion();for(let i=0;i<6;i++){const a=i*Math.PI/3;matrix.compose(new T.Vector3(.38+Math.cos(a)*.024,1.065,-.62+Math.sin(a)*.024),q,new T.Vector3(.8,.25,1));petal.setMatrixAt(i,matrix);}petal.instanceMatrix.needsUpdate=true;
 for(const name of ['Stream','WarmthLink']){const line=new T.Line(new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(new Float32Array(33*3),3)),new T.LineBasicMaterial({color:name==='Stream'?0x9ddbe7:0xffca88}));line.name=name;line.userData.iwsdkPreviewBounds='exclude';for(let i=0;i<33;i++)line.geometry.getAttribute('position').setXYZ(i,-.23+i/32*.46,1.035,-.62);root.add(line);}
 const aqueduct=new T.Group();aqueduct.name='EarthAqueduct';aqueduct.position.y=1.02;root.add(aqueduct);
 const point={x:0,y:0,z:0},vertices=[],indices=[];const rails:[T.Vector3[],T.Vector3[]]=[[],[]];for(let i=0;i<=40;i++){sampleLastLightStream(i/40,1,true,point);for(const side of [-1,1])vertices.push(point.x+side*.022,point.y-1.024,point.z);rails[0].push(new T.Vector3(point.x-.022,point.y-1.018,point.z));rails[1].push(new T.Vector3(point.x+.022,point.y-1.018,point.z));if(i<40){const n=i*2;indices.push(n,n+2,n+1,n+1,n+2,n+3);}}
 // Give the stone bed real thickness and closed edges for close inspection.
 const count=vertices.length/3,topIndices=indices.slice();for(let i=0;i<count;i++)vertices.push(vertices[i*3],vertices[i*3+1]-.006,vertices[i*3+2]);for(let i=0;i<topIndices.length;i+=3)indices.push(topIndices[i]+count,topIndices[i+2]+count,topIndices[i+1]+count);
 for(let i=0;i<40;i++){const a=i*2,b=a+2;indices.push(a,a+count,b,b,a+count,b+count,a+1,b+1,a+1+count,b+1,b+1+count,a+1+count);}const last=count-2;indices.push(0,1,count,1,1+count,count,last,last+count,last+1,last+1,last+count,last+1+count);
 const bed=new T.BufferGeometry();bed.setAttribute('position',new T.Float32BufferAttribute(vertices,3));bed.setIndex(indices);bed.computeVertexNormals();const channelBed=new T.Mesh(bed,stone);channelBed.name='RaisedChannelBed';aqueduct.add(channelBed);for(let i=0;i<2;i++){const rail=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(rails[i]),48,.0035,5,false),stone);rail.name='ChannelRim'+i;aqueduct.add(rail);}
 for(const z of [-.62,-.68]){const arch=new T.Mesh(new T.TorusGeometry(.23,.008,6,40,Math.PI),stone);arch.name='ShoreSupportedArch';arch.position.set(0,.005,z);arch.scale.y=.8;aqueduct.add(arch);}
 const lift=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(-.18,1.08,-.34),new T.Vector3(-.18,1.27,-.34),new T.Vector3(-.20,1.24,-.34),new T.Vector3(-.18,1.27,-.34),new T.Vector3(-.16,1.24,-.34)]),new T.LineBasicMaterial({color:0xd4c49a,transparent:true,opacity:.45}));lift.name='LiftRootsInvitation';root.add(lift);
 const storm=new T.Points(new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(new Float32Array(40*3),3)),new T.PointsMaterial({color:0xaac8cb,size:.004,transparent:true,opacity:.35,depthWrite:false}));storm.name='QuietStorm';storm.userData.iwsdkPreviewBounds='exclude';for(let i=0;i<40;i++)storm.geometry.getAttribute('position').setXYZ(i,-.38+(i/39)*.76,1.25+(i%7)*.035,-.9);root.add(storm);
 return root;
}
