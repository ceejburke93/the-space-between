import type { HandPoint } from './element-ritual';
/** A foot tests an offered palm. Movement away always returns safely to land. */
export class HandMeeting {
 stage=0;time=0;owner=-1;contact=0;target={x:-.25,y:1.04,z:-.58};
 trusted=false;
 private retreatContact=0;
 reset(){this.trusted=false;this.stage=0;this.time=0;this.owner=-1;this.contact=0;this.retreatContact=0;}
 update(dt:number,hands:HandPoint[],present:boolean[],eligible:boolean){
  if(!eligible){this.contact=Math.max(0,this.contact-dt*3);return;}
  if(this.stage===0){for(let i=0;i<2;i++){const p=hands[i];if(present[i]&&Math.abs(p.x+.28)<.1&&p.y>1.015&&p.y<1.14&&Math.abs(p.z+.62)<.12){this.owner=i;this.stage=1;this.time=0;break;}}}
  if(this.stage===0||this.stage===5)return;
  const p=hands[this.owner];const available=present[this.owner]&&Math.hypot(p.x+.28,p.y-1.05,p.z+.62)<.16;
  if(!available&&this.stage<4){this.retreatContact=this.contact;this.stage=4;this.time=0;}
  if(available){this.target.x=p.x;this.target.y=p.y+.0044;this.target.z=p.z;}
  this.time+=dt;
  if(this.stage===1){const reach=Math.max(0,Math.min(1,(this.time-.25)/.55));this.contact=reach*reach*(3-2*reach);if(this.time>=.8){this.stage=2;this.time=0;}}
  else if(this.stage===2){this.contact=1;if(this.time>.65){this.stage=3;this.trusted=true;this.time=0;}}
  else if(this.stage===3){this.contact=1;if(this.time>1){this.retreatContact=this.contact;this.stage=4;this.time=0;}}
  else if(this.stage===4){const release=Math.min(1,this.time/.6);this.contact=this.retreatContact*(1-release*release*(3-2*release));if(this.time>=.6){this.stage=this.trusted?5:0;this.owner=-1;this.contact=0;}}
 }
}
