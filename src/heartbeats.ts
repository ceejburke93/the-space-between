/** Emotional beats are optional invitations: never another gate on progression. */
export class Heartbeats {
 meeting=0; meetingTime=0; giftStage=0; giftHold=0; bloomTime=0; finaleTime=0;
 private giftHeight=0;
 reset(bloomed:boolean,finaleSeen:boolean){this.meeting=0;this.meetingTime=0;this.giftStage=bloomed?2:0;this.giftHold=0;this.bloomTime=bloomed?8:0;this.finaleTime=finaleSeen?24:0;}
 notice(dt:number,near:boolean,active:boolean){
  if(!active)return;
  if(this.meeting===0&&near){this.meeting=1;this.meetingTime=0;}
  if(this.meeting===1){this.meetingTime+=dt;if(this.meetingTime>1.2){this.meeting=2;this.meetingTime=0;}}
  else if(this.meeting===2&&near){this.meetingTime+=dt;if(this.meetingTime>.8)this.meeting=3;}
 }
 gift(dt:number,eligible:boolean,distance:number,height:number,open:boolean){
  if(!eligible||this.giftStage===2){if(this.giftStage===2)this.bloomTime+=dt;return false;}
  if(this.giftStage===0){this.giftHold=distance<.12?this.giftHold+dt:0;if(this.giftHold>.35){this.giftStage=1;this.giftHeight=height;this.giftHold=0;}}
  else if(distance<.2){this.giftHold+=dt;if(this.giftHold>.4&&(open||height>this.giftHeight+.045)){this.giftStage=2;this.bloomTime=0;return true;}}
  else this.giftHold=0;
  return false;
 }
 finale(dt:number,active:boolean){if(active)this.finaleTime=Math.min(24,this.finaleTime+dt);return this.finaleTime>=24;}
}
