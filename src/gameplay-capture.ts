/** Optional capture tool records actual rendered gameplay and the live game mix. */
export class GameplayCapture {
 private recorder:MediaRecorder|null=null;private chunks:BlobPart[]=[];private url='';private timer=0;
 constructor(canvas:HTMLCanvasElement,audio:()=>MediaStream|undefined){
  const query=new URLSearchParams(location.search);
  if(!import.meta.env.DEV&&!query.has('capture')&&!query.has('devtools'))return;
  const panel=document.createElement('div');panel.id='capture-tools';panel.style.cssText='position:fixed;right:12px;bottom:12px;z-index:100;display:flex;gap:8px;align-items:center';
  const button=document.createElement('button'),save=document.createElement('a'),status=document.createElement('span');button.textContent='Record gameplay';button.id='capture-toggle';save.hidden=true;save.textContent='Save recording';save.style.color='#ffe0a1';status.style.cssText='font:11px sans-serif;color:#ffe0a1';status.setAttribute('role','status');panel.append(button,save,status);document.body.append(panel);
  button.onclick=()=>{
   if(this.recorder?.state==='recording'){this.recorder.stop();return;}
   try{
    if(typeof MediaRecorder==='undefined'||!canvas.captureStream)throw new Error('Recording is unavailable in this browser.');
    const stream=canvas.captureStream(30),sound=audio();sound?.getAudioTracks().forEach(track=>stream.addTrack(track));
    const mime=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(type=>MediaRecorder.isTypeSupported(type));
    this.chunks=[];save.hidden=true;this.recorder=new MediaRecorder(stream,{...(mime?{mimeType:mime}:{}),videoBitsPerSecond:6000000});
    this.recorder.ondataavailable=e=>{if(e.data.size)this.chunks.push(e.data);};
    this.recorder.onstop=()=>{window.clearTimeout(this.timer);if(this.url)URL.revokeObjectURL(this.url);this.url=URL.createObjectURL(new Blob(this.chunks,{type:this.recorder!.mimeType}));save.href=this.url;save.download='the-space-between-gameplay.webm';save.hidden=false;button.textContent='Record gameplay';status.textContent='Recorded actual gameplay';stream.getVideoTracks().forEach(t=>t.stop());};
    this.recorder.start(1000);button.textContent='Stop recording';status.textContent=sound?'Recording game + live sound':'Recording game (sound off)';this.timer=window.setTimeout(()=>{if(this.recorder?.state==='recording')this.recorder.stop();},90000);
   }catch(error){status.textContent=error instanceof Error?error.message:'Could not start recording.';}
  };
 }
}
