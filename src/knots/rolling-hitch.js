// Rolling Hitch — attaches a line to another under load
// The loaded line is fixed (grey). Working rope wraps around it: two wraps toward the load, one away.
// viewBox "0 0 220 190"
//
// Load direction is to the RIGHT. Two wraps go to the right (load side) first.

export const rollingHitchKnot = {
  id: 'rolling-hitch',
  viewBox: '0 0 220 190',

  fixed: [
    // The loaded line — horizontal, carrying load to the right
    { type: 'line', x1: 8, y1: 95, x2: 212, y2: 95, stroke: '#6B7280', strokeWidth: 9, strokeLinecap: 'round' },
  ],

  segments: [
    // Working rope enters from above
    { id: 'enter',  d: 'M 80 30 L 80 95',                                               stroke: '#7a5c0b', sw: 5 },
    // First wrap — toward the load (going right then around and back)
    { id: 'wrap1',  d: 'M 80 95 C 55 95 52 72 80 68 C 108 64 108 88 80 88',             stroke: '#7a5c0b', sw: 5 },
    // Second wrap — also toward the load (the double wrap is what gives the grip)
    { id: 'wrap2',  d: 'M 80 88 C 52 88 48 62 78 58 C 106 54 110 78 80 78',             stroke: '#B03020', sw: 4 },
    // Single wrap on the other side (away from load)
    { id: 'cross',  d: 'M 80 78 C 108 78 112 95 80 95',                                  stroke: '#B03020', sw: 4 },
    // Tail tucks under the last wrap and exits
    { id: 'tail',   d: 'M 80 95 C 80 118 100 130 125 140 L 190 158',                    stroke: '#B03020', sw: 4 },
  ],

  labels: [
    { id: 'lbl_load',   x: 145, y: 88,  text: 'load →',          color: '#444' },
    { id: 'lbl_enter',  x: 85,  y: 45,  text: 'working rope',    color: '#5a4200' },
    { id: 'lbl_w1',     x: 30,  y: 80,  text: '1st wrap',        color: '#5a4200' },
    { id: 'lbl_w2',     x: 28,  y: 62,  text: '2nd wrap (load side)', color: '#8B2020' },
    { id: 'lbl_cross',  x: 112, y: 85,  text: 'cross wrap',      color: '#8B2020' },
    { id: 'lbl_tail',   x: 148, y: 155, text: 'tail',            color: '#8B2020' },
  ],

  steps: [
    {
      label: 'Working rope at the loaded line',
      instruction:
        'Bring the working rope alongside the loaded line. The rolling hitch is used to take strain off a jammed winch or sheet while you sort the problem — you need to tie it WHILE the loaded line is under tension.',
      visible: ['enter'],
      active:  ['enter'],
      showLabels: ['lbl_load', 'lbl_enter'],
    },
    {
      label: 'First wrap — toward the load',
      instruction:
        'Wrap the working rope around the loaded line once, moving TOWARD the direction of load. This first wrap should go in the load direction — that is what gives the hitch its grip.',
      visible: ['enter', 'wrap1'],
      active:  ['wrap1'],
      showLabels: ['lbl_load', 'lbl_w1'],
    },
    {
      label: 'Second wrap — same direction',
      instruction:
        'Make a SECOND wrap in the same direction (toward the load). This double wrap on the load side is what separates a rolling hitch from a clove hitch — and what makes it grip instead of slide.',
      visible: ['enter', 'wrap1', 'wrap2'],
      active:  ['wrap2'],
      showLabels: ['lbl_w2'],
    },
    {
      label: 'Cross wrap — one wrap away from load',
      instruction:
        'Make one single wrap on the AWAY-FROM-LOAD side. This traps the double wrap and locks the hitch. The working rope now crosses over its own wraps.',
      visible: ['enter', 'wrap1', 'wrap2', 'cross'],
      active:  ['cross'],
      showLabels: ['lbl_cross'],
    },
    {
      label: 'Tail under — pull snug toward load',
      instruction:
        'Tuck the tail under the last wrap and pull snug in the direction of load. Transfer the load to the working rope (e.g., make it fast to a winch), then ease the jammed original line. The double wrap grips; a single wrap slides.',
      visible: ['enter', 'wrap1', 'wrap2', 'cross', 'tail'],
      active:  ['tail'],
      showLabels: ['lbl_load', 'lbl_tail'],
    },
  ],
}
