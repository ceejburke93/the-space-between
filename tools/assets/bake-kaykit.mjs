// Bake the selected glTF atlas samples into vertex colors for static batching.
// Usage: node tools/assets/bake-kaykit.mjs /path/to/free-pack
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const root=process.argv[2];if(!root)throw Error('Supply the extracted KayKit free pack folder');
const selected=['Tree_1_A_Color1','Tree_2_B_Color1','Tree_3_A_Color1','Tree_Bare_1_A_Color1','Bush_2_A_Color1','Rock_1_A_Color1','Rock_2_A_Color1','Grass_1_A_Color1'];
const dir='public/models/kaykit-forest';fs.mkdirSync(dir,{recursive:true});
const {data: pixels,info}=await sharp(path.join(root,'Assets/gltf/forest_texture.png')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const output={};
for(const name of selected){
 const file=path.join(root,'Assets/gltf',name+'.gltf'),g=JSON.parse(fs.readFileSync(file)),bin=fs.readFileSync(path.join(root,'Assets/gltf',g.buffers[0].uri));
 const read=id=>{const a=g.accessors[id],v=g.bufferViews[a.bufferView],n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type],size={5126:4,5125:4,5123:2,5121:1}[a.componentType],f={5126:'readFloatLE',5125:'readUInt32LE',5123:'readUInt16LE',5121:'readUInt8'}[a.componentType];return Array.from({length:a.count*n},(_,i)=>bin[f]((v.byteOffset||0)+(a.byteOffset||0)+Math.floor(i/n)*(v.byteStride||n*size)+(i%n)*size));};
 const pos=[],normal=[],colors=[];
 for(const primitive of g.meshes[0].primitives){const p=read(primitive.attributes.POSITION),n=read(primitive.attributes.NORMAL),uv=read(primitive.attributes.TEXCOORD_0),idx=read(primitive.indices);for(const i of idx){pos.push(...p.slice(i*3,i*3+3));normal.push(...n.slice(i*3,i*3+3));const x=Math.max(0,Math.min(info.width-1,Math.floor(uv[i*2]*info.width))),y=Math.max(0,Math.min(info.height-1,Math.floor(uv[i*2+1]*info.height)));for(let c=0;c<3;c++){const s=pixels[(y*info.width+x)*4+c]/255;colors.push(s<=.04045?s/12.92:Math.pow((s+.055)/1.055,2.4));}}}
 const round=a=>a.map(v=>Math.round(v*100000)/100000);output[name]={positions:round(pos),normals:round(normal),colors:round(colors)};
 fs.copyFileSync(file,path.join(dir,name+'.gltf'));fs.copyFileSync(path.join(root,'Assets/gltf',name+'.bin'),path.join(dir,name+'.bin'));
 const ys=pos.filter((_,i)=>i%3===1);console.log(name,idxCount(pos),Math.min(...ys),Math.max(...ys));
}
function idxCount(p){return p.length/9+' triangles';}
fs.copyFileSync(path.join(root,'Assets/gltf/forest_texture.png'),path.join(dir,'forest_texture.png'));fs.copyFileSync(path.join(root,'License.txt'),path.join(dir,'License.txt'));
fs.writeFileSync('src/scene-assets/kaykit-data.json',JSON.stringify(output));
