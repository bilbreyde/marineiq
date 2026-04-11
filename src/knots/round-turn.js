// Round Turn & Two Half Hitches
// Rope approaches a ring, wraps twice (round turn), then two half hitches around the standing part.
// viewBox "0 0 220 195"
//
// Ring centred at (110, 55) radius 28. Standing part exits to the right.
// Half hitches tie around the standing part on the left of the ring.

export const roundTurnKnot = {
  id: 'round-turn',
  viewBox: '0 0 220 195',

  fixed: [
    { type: 'circle', cx: 110, cy: 55, r: 28, fill: 'none', stroke: '#6B7280', strokeWidth: 5 },
  ],

  segments: [
    // Line approaching the ring from the left
    { id: 'approach', d: 'M 15 65 L 82 57',                                                     stroke: '#7a5c0b', sw: 5 },
    // First loop through/over the ring
    { id: 'turn1',    d: 'M 82 57 C 82 27 138 27 138 57',                                       stroke: '#7a5c0b', sw: 5 },
    // Second loop — completes the round turn (1.5 wraps around the ring)
    { id: 'turn2',    d: 'M 138 57 C 162 57 165 80 138 82 C 114 85 82 78 82 57',                stroke: '#7a5c0b', sw: 5 },
    // First half hitch: tail loops around the standing part
    { id: 'hitch1',   d: 'M 82 57 C 55 57 48 72 55 82 C 60 90 74 84 82 82',                    stroke: '#B03020', sw: 4 },
    // Second half hitch: same motion, slides along and locks the first
    { id: 'hitch2',   d: 'M 82 82 C 50 82 44 98 56 108 C 64 116 78 106 82 100 L 195 115',      stroke: '#B03020', sw: 4 },
  ],

  labels: [
    { id: 'lbl_ring',  x: 118, y: 22,  text: 'ring / rail',     color: '#444' },
    { id: 'lbl_turn',  x: 140, y: 42,  text: 'round turn',      color: '#5a4200' },
    { id: 'lbl_h1',    x: 30,  y: 70,  text: '1st hitch',       color: '#8B2020' },
    { id: 'lbl_h2',    x: 28,  y: 100, text: '2nd hitch',       color: '#8B2020' },
    { id: 'lbl_tail',  x: 155, y: 118, text: 'tail →',          color: '#8B2020' },
  ],

  steps: [
    {
      label: 'Line to the ring',
      instruction:
        'Bring the line up to the ring, rail, or shackle. The round turn takes all the load — the half hitches are just the locking mechanism.',
      visible: ['approach'],
      active:  ['approach'],
      showLabels: ['lbl_ring'],
    },
    {
      label: 'First loop through the ring',
      instruction:
        'Pass the working end through (or over) the ring and back around — one full loop. The round turn needs TWO loops; the second one distributes load and adds friction.',
      visible: ['approach', 'turn1'],
      active:  ['turn1'],
      showLabels: ['lbl_ring', 'lbl_turn'],
    },
    {
      label: 'Second loop — full round turn',
      instruction:
        'Make a second loop around the ring in the same direction. The rope now wraps one-and-a-half times. The round turn can bear the full load while you tie the half hitches calmly.',
      visible: ['approach', 'turn1', 'turn2'],
      active:  ['turn2'],
      showLabels: ['lbl_turn'],
    },
    {
      label: 'First half hitch',
      instruction:
        'Cross the tail over the standing part and pass it underneath — this is a half hitch. Slide it snug against the ring. The round turn holds the load; this hitch starts the locking.',
      visible: ['approach', 'turn1', 'turn2', 'hitch1'],
      active:  ['hitch1'],
      showLabels: ['lbl_h1'],
    },
    {
      label: 'Second half hitch — done',
      instruction:
        'Repeat: cross the tail over the standing part and pass it underneath. Slide both hitches together against the ring and pull firm. For extra security, add a third half hitch.',
      visible: ['approach', 'turn1', 'turn2', 'hitch1', 'hitch2'],
      active:  ['hitch2'],
      showLabels: ['lbl_h2', 'lbl_tail'],
    },
  ],
}
