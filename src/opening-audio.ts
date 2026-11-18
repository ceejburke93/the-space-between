/** Short, restrained procedural cues for the first minutes; no external recordings. */
export const OPENING_AUDIO={
 planetReveal:{frequencies:[261.63,329.63,392],peakDb:-23,noteDuration:.92,stagger:.3},
 firstKindness:{frequencies:[392,523.25],peakDb:-25,noteDuration:.72,stagger:.2},
} as const;
export type OpeningCue=keyof typeof OPENING_AUDIO;
