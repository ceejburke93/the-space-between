/** Some XR touch pointers emit down/up without synthesizing click. */
export class MenuPress {
 private pointer=-1;
 private began=0;
 private releasedPointer=-1;
 private releasedAt=-Infinity;
 down(pointer:number,now:number){this.pointer=pointer;this.began=now;}
 cancel(){this.pointer=-1;}
 release(pointer:number,now:number){
  const accepted=this.pointer===pointer&&now-this.began>=0&&now-this.began<800;
  this.cancel();
  if(accepted){this.releasedPointer=pointer;this.releasedAt=now;}
  return accepted;
 }
 click(pointer:number,now:number){return pointer!==this.releasedPointer||now-this.releasedAt>=800;}
}
