/** Four compatible phrases share C major / A minor. The finale layers what was learned. */
export const TRUST_PHRASES=[[72,76,79,76],[69,72,76,79],[76,79,81,79],[48,55,60,64]] as const;
export class TrustScore {
 private enabled=false;
 setEnabled(on:boolean){this.enabled=on;if(this.master)this.master.gain.value=on?.65:0;}
 private context:AudioContext|null=null;private master:GainNode|null=null;private capture:MediaStreamAudioDestinationNode|null=null;private bar=-1;
 output(ctx:AudioContext,destination?:AudioNode){if(this.context!==ctx){this.context=ctx;this.master=ctx.createGain();this.master.gain.value=this.enabled?.65:0;this.master.connect(destination??ctx.destination);}return this.master!;}
 captureStream(ctx:AudioContext){this.output(ctx);if(!this.capture){this.capture=ctx.createMediaStreamDestination();this.master!.connect(this.capture);}return this.capture.stream;}
 phrase(chapter:number,at?:number,level=.8){
  const ctx=this.context;if(!this.enabled||!ctx||ctx.state!=='running')return;
  const start=at??ctx.currentTime,beat=60/84;
  TRUST_PHRASES[chapter].forEach((midi,i)=>{const t=start+[0,.5,1.25,1.75][i]*beat,osc=ctx.createOscillator(),gain=ctx.createGain(),pan=ctx.createStereoPanner();osc.type=chapter===3?'triangle':'sine';osc.frequency.value=440*2**((midi-69)/12);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.025*level,t+.025);gain.gain.exponentialRampToValueAtTime(.0001,t+(chapter===1?1.1:.85));pan.pan.value=[-.4,-.1,.15,.4][chapter];osc.connect(gain).connect(pan).connect(this.master!);osc.start(t);osc.stop(t+1.2);osc.onended=()=>{osc.disconnect();gain.disconnect();pan.disconnect();};});
 }
 finale(time:number,active:boolean){
  if(!active){this.bar=-1;return;}if(time<3||time>=22)return;
  const bar=Math.floor((time-3)/(4*60/84));if(bar===this.bar)return;this.bar=bar;
  const count=Math.min(4,1+Math.floor((time-3)/3));for(let chapter=0;chapter<count;chapter++)this.phrase(chapter,undefined,.5);
 }
}
