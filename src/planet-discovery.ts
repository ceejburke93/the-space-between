/** Detail unfolds with apparent planet size rather than elapsed time. */
export function discoveryDetail(scale:number){return Math.max(0,Math.min(1,(scale-.10)/.28));}
