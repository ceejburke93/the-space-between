import {OPENING_AUDIO,type OpeningCue} from './opening-audio';
/** World-anchored Web Audio, shared mix buses and bounded procedural voices.
 * No microphone, network audio or external samples. Sound starts only after user input. */
export interface AudioPoint{x:number;y:number;z:number;}
const AMBIENT_LEVELS=[.06,.18,.12,.15],AMBIENT_PULSES=[.7,1.1,1.7,.45];
interface Emitter {source:AudioBufferSourceNode;filter:BiquadFilterNode;gain:GainNode;panner:PannerNode;}
export class ImmersiveAudio {
 readonly music:GainNode;readonly effects:GainNode;readonly ambience:GainNode;readonly ui:GainNode;
 private duck:GainNode;private master:GainNode;private limiter:DynamicsCompressorNode;private analyser:AnalyserNode;private samples=new Float32Array(512);
 private habitatEmitter!:Emitter;private noise!:AudioBuffer;private rustleCount=0;
 private emitters:Emitter[]=[];private capture:MediaStreamAudioDestinationNode|null=null;
 private enabled=false;private focused=true;private voiceCount=0;private footClock=0;private meterClock=0;
 peak=0;rms=0;activeEmitters=0;
 get habitatGain(){return this.habitatEmitter.gain.gain.value;}get habitatX(){return this.habitatEmitter.panner.positionX.value;}get brushes(){return this.rustleCount;}
 get waterX(){return this.emitters[1].panner.positionX.value;}get waterZ(){return this.emitters[1].panner.positionZ.value;}get voices(){return this.voiceCount;}
 constructor(readonly context:AudioContext){
  const ctx=context;this.master=ctx.createGain();this.master.gain.value=0;this.limiter=ctx.createDynamicsCompressor();this.limiter.threshold.value=-6;this.limiter.knee.value=6;this.limiter.ratio.value=12;this.limiter.attack.value=.003;this.limiter.release.value=.2;
  this.analyser=ctx.createAnalyser();this.analyser.fftSize=512;this.master.connect(this.limiter).connect(this.analyser).connect(ctx.destination);
  this.music=this.bus(.65);this.duck=ctx.createGain();this.music.disconnect();this.music.connect(this.duck).connect(this.master);this.effects=this.bus(.8);this.ambience=this.bus(.75);this.ui=this.bus(.8);
  const buffer=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate),data=buffer.getChannelData(0);let seed=7919,previous=0;
  for(let i=0;i<data.length;i++){seed=(seed*1664525+1013904223)>>>0;previous=(previous+(seed/4294967296*2-1)*.08)/1.08;data[i]=previous;}
  for(let i=0;i<data.length;i++){const fade=Math.min(1,i/(ctx.sampleRate*.012),(data.length-1-i)/(ctx.sampleRate*.012));data[i]*=fade*fade*(3-2*fade);}
  this.noise=buffer;
  for(let i=0;i<4;i++){const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain(),panner=this.spatial();source.buffer=buffer;source.loop=true;filter.type=['highpass','bandpass','bandpass','lowpass'][i] as BiquadFilterType;filter.frequency.value=[1100,650,1700,190][i];filter.Q.value=i===1?.55:.7;gain.gain.value=0;source.connect(filter).connect(gain).connect(panner).connect(this.ambience);source.start(0,i*.63);this.emitters.push({source,filter,gain,panner});}
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain(),panner=this.spatial();source.buffer=buffer;source.loop=true;filter.type='bandpass';filter.frequency.value=520;filter.Q.value=.6;gain.gain.value=0;source.connect(filter).connect(gain).connect(panner).connect(this.ambience);source.start();this.habitatEmitter={source,filter,gain,panner};
 }
 /** A quiet stream lives in the ravine, separately from creature feedback. */
 habitat(position:AudioPoint,chapter:number,active:boolean){
  const e=this.habitatEmitter,t=this.context.currentTime,on=active&&chapter!==2;
  e.gain.gain.setTargetAtTime(on?Math.pow(10,(chapter===1?-18:-25)/20):0,t,.4);this.position(e.panner,position);
  if(on)this.activeEmitters++;
 }
 brush(chapter:number,position:AudioPoint,strength:number){
  const ctx=this.context;if(!this.enabled||!this.focused||ctx.state!=='running'||this.voiceCount>=8)return;
  this.voiceCount++;this.rustleCount++;const t=ctx.currentTime,source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain(),panner=this.spatial();
  source.buffer=this.noise;source.playbackRate.value=.92+(this.rustleCount%3)*.07;filter.type='bandpass';filter.frequency.value=[1500,850,1100,600][chapter];filter.Q.value=.55;
  gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(Math.pow(10,-25/20)*Math.max(.2,Math.min(1,strength)),t+.04);gain.gain.exponentialRampToValueAtTime(.0001,t+.32);
  panner.positionX.value=position.x;panner.positionY.value=position.y;panner.positionZ.value=position.z;source.connect(filter).connect(gain).connect(panner).connect(this.effects);source.start(t,(this.rustleCount%3)*.6);source.stop(t+.35);
  source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();panner.disconnect();this.voiceCount--;};
 }
 private bus(level:number){const gain=this.context.createGain();gain.gain.value=level;gain.connect(this.master);return gain;}
 private spatial(){const p=this.context.createPanner();p.panningModel='HRTF';p.distanceModel='inverse';p.refDistance=.35;p.maxDistance=8;p.rolloffFactor=.8;return p;}
 private position(p:PannerNode|AudioListener,v:AudioPoint){const t=this.context.currentTime;p.positionX.setTargetAtTime(v.x,t,.012);p.positionY.setTargetAtTime(v.y,t,.012);p.positionZ.setTargetAtTime(v.z,t,.012);}
 setEnabled(enabled:boolean){this.enabled=enabled;this.setFocused(this.focused);}
 setFocused(focused:boolean){this.focused=focused;this.master.gain.setTargetAtTime(this.enabled&&focused?.7:0,this.context.currentTime,.04);}
 captureStream(){if(!this.capture){this.capture=this.context.createMediaStreamDestination();this.analyser.connect(this.capture);}return this.capture.stream;}
 listen(position:AudioPoint,forward:AudioPoint,up:AudioPoint){
  const l=this.context.listener,t=this.context.currentTime;this.position(l,position);l.forwardX.setTargetAtTime(forward.x,t,.012);l.forwardY.setTargetAtTime(forward.y,t,.012);l.forwardZ.setTargetAtTime(forward.z,t,.012);l.upX.setTargetAtTime(up.x,t,.012);l.upY.setTargetAtTime(up.y,t,.012);l.upZ.setTargetAtTime(up.z,t,.012);
 }
 update(dt:number,time:number,chapter:number,worldActive:boolean,finale:boolean,flow:boolean,warmth:boolean,shelter:boolean,walking:boolean,positions:AudioPoint[]){
  const t=this.context.currentTime;this.activeEmitters=0;
  for(let i=0;i<4;i++){const on=worldActive&&(finale?(i===0?shelter:i===1?flow:i===2?warmth:true):i===chapter);if(on)this.activeEmitters++;const level=on?AMBIENT_LEVELS[i]*(.82+.18*Math.sin(time*AMBIENT_PULSES[i])):0;this.emitters[i].gain.gain.setTargetAtTime(level,t,.35);this.position(this.emitters[i].panner,positions[i]);}
  this.footClock+=dt;if(walking&&worldActive&&(chapter===0||chapter===3)&&this.footClock>.42){this.footClock=0;this.care(chapter,positions[chapter],.35);}
  this.meterClock+=dt;if(this.meterClock>.1){this.meterClock=0;this.analyser.getFloatTimeDomainData(this.samples);let peak=0,sum=0;for(let i=0;i<this.samples.length;i++){peak=Math.max(peak,Math.abs(this.samples[i]));sum+=this.samples[i]*this.samples[i];}this.peak=peak;this.rms=Math.sqrt(sum/this.samples.length);}
 }
 care(chapter:number,position:AudioPoint,strength=1){
  const ctx=this.context;if(!this.enabled||!this.focused||ctx.state!=='running'||this.voiceCount>=8)return;this.voiceCount++;const now=ctx.currentTime;this.duck.gain.cancelScheduledValues(now);this.duck.gain.setValueAtTime(this.duck.gain.value,now);this.duck.gain.linearRampToValueAtTime(.6,now+.025);this.duck.gain.setTargetAtTime(1,now+.2,.15);
  const source=ctx.createOscillator(),gain=ctx.createGain(),panner=this.spatial(),t=ctx.currentTime;source.type=chapter===3?'triangle':'sine';source.frequency.setValueAtTime([660,440,330,110][chapter],t);source.frequency.exponentialRampToValueAtTime([880,660,440,75][chapter],t+.18);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.025*strength,t+.018);gain.gain.exponentialRampToValueAtTime(.0001,t+.4);panner.positionX.value=position.x;panner.positionY.value=position.y;panner.positionZ.value=position.z;source.connect(gain).connect(panner).connect(this.effects);source.start(t);source.stop(t+.45);source.onended=()=>{source.disconnect();gain.disconnect();panner.disconnect();this.voiceCount--;};
 }
 /** A tiny spatial motif marks the planet reveal or the traveler's first trust. */
 openingCue(kind:OpeningCue,position:AudioPoint){
  const ctx=this.context,cue=OPENING_AUDIO[kind];
  if(!this.enabled||!this.focused||ctx.state!=='running')return;
  const panner=this.spatial();this.position(panner,position);panner.connect(this.effects);
  cue.frequencies.forEach((frequency,index)=>{
   if(this.voiceCount>=8)return;
   this.voiceCount++;const t=ctx.currentTime+index*cue.stagger,osc=ctx.createOscillator(),gain=ctx.createGain();
   osc.type='sine';osc.frequency.value=frequency;
   gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(10**(cue.peakDb/20),t+.09);gain.gain.setTargetAtTime(10**(-38/20),t+.2,.16);gain.gain.exponentialRampToValueAtTime(.0001,t+cue.noteDuration);
   osc.connect(gain).connect(panner);osc.start(t);osc.stop(t+cue.noteDuration+.03);
   osc.onended=()=>{osc.disconnect();gain.disconnect();this.voiceCount--;};
  });
  const last=cue.noteDuration+(cue.frequencies.length-1)*cue.stagger;window.setTimeout(()=>panner.disconnect(),(last+.2)*1000);
 }
 /** The bridge answers distinct player actions with a rising C-major thread. */
 threadNote(index:number,position:AudioPoint){
  const ctx=this.context;if(!this.enabled||!this.focused||ctx.state!=='running'||this.voiceCount>=8)return;
  const frequencies=[261.63,329.63,392,523.25],t=ctx.currentTime;this.voiceCount++;
  const osc=ctx.createOscillator(),gain=ctx.createGain(),panner=this.spatial();osc.type='sine';osc.frequency.value=frequencies[Math.max(0,Math.min(3,index))];
  this.position(panner,position);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(10**(-25/20),t+.07);gain.gain.exponentialRampToValueAtTime(.0001,t+.64);
  osc.connect(gain).connect(panner).connect(this.effects);osc.start(t);osc.stop(t+.68);osc.onended=()=>{osc.disconnect();gain.disconnect();panner.disconnect();this.voiceCount--;};
 }
 dispose(){for(const e of [...this.emitters,this.habitatEmitter]){e.source.stop();e.source.disconnect();e.filter.disconnect();e.gain.disconnect();e.panner.disconnect();}this.music.disconnect();this.duck.disconnect();this.effects.disconnect();this.ambience.disconnect();this.ui.disconnect();this.master.disconnect();this.limiter.disconnect();this.analyser.disconnect();this.capture?.disconnect();}
}
