// Figure-Eight Stopper — single rope forming a figure-8 shape
// Tied at the free end of a sheet or halyard to prevent it running through a block.
// viewBox "0 0 200 220"
//
// Standing part (tan) enters from above; working end (red) forms the figure-eight body.

export const figureEightKnot = {
  id: 'figure-eight',
  viewBox: '0 0 200 220',

  fixed: [],

  segments: [
    // Standing part — goes up to the block / fairlead
    { id: 'sp',       d: 'M 100 15 L 100 50',                                           stroke: '#7a5c0b', sw: 5 },
    // Right lobe: cross the tail OVER the standing part (a P-shape forms)
    { id: 'r_lobe',   d: 'M 100 50 C 158 50 162 90 100 92',                             stroke: '#7a5c0b', sw: 5 },
    // Left lobe: take the tail BEHIND the standing part (completes the 8)
    { id: 'l_lobe',   d: 'M 100 92 C 40 92 42 52 100 52',                               stroke: '#B03020', sw: 4 },
    // Thread back: tail passes through the right lobe (original loop) from front to back
    { id: 'thread',   d: 'M 100 52 C 148 52 155 82 148 96 C 140 112 118 118 100 116',   stroke: '#B03020', sw: 4 },
    // Tail end — hangs below the knot
    { id: 'tail',     d: 'M 100 116 L 100 190',                                          stroke: '#B03020', sw: 4 },
  ],

  labels: [
    { id: 'lbl_block', x: 108, y: 35,  text: 'to block',   color: '#5a4200' },
    { id: 'lbl_loop',  x: 162, y: 72,  text: 'loop',       color: '#5a4200' },
    { id: 'lbl_tail',  x: 108, y: 178, text: 'tail',       color: '#8B2020' },
  ],

  steps: [
    {
      label: 'Rope to the block',
      instruction:
        'Hold the rope near the free end with the standing part going up to the block or fairlead. The figure-eight stopper is tied in the working end to prevent the rope running through.',
      visible: ['sp'],
      active:  ['sp'],
      showLabels: ['lbl_block'],
    },
    {
      label: 'Cross over — form the loop',
      instruction:
        'Cross the tail OVER the standing part, forming a loop. The tail should pass from left to right, with the standing part underneath. You now have a P-shape (or Q-shape depending on hand).',
      visible: ['sp', 'r_lobe'],
      active:  ['r_lobe'],
      showLabels: ['lbl_block', 'lbl_loop'],
    },
    {
      label: 'Around behind — complete the 8',
      instruction:
        'Take the tail around BEHIND the standing part. The rope now crosses itself, completing the figure-eight shape. You should see the "8" clearly at this point.',
      visible: ['sp', 'r_lobe', 'l_lobe'],
      active:  ['l_lobe'],
      showLabels: ['lbl_loop'],
    },
    {
      label: 'Thread through the original loop',
      instruction:
        'Pass the tail back through the ORIGINAL loop (the first loop you made) — entering from the front. The tail goes in from the same side it started, going downward through the loop.',
      visible: ['sp', 'r_lobe', 'l_lobe', 'thread'],
      active:  ['thread'],
      showLabels: ['lbl_loop', 'lbl_tail'],
    },
    {
      label: 'Pull tight',
      instruction:
        'Pull both the standing part and tail firmly. The knot should tighten into a clean figure-eight shape. Leave at least 5 cm of tail below the knot — too short and it can work loose underway.',
      visible: ['sp', 'r_lobe', 'l_lobe', 'thread', 'tail'],
      active:  ['tail'],
      showLabels: ['lbl_block', 'lbl_tail'],
    },
  ],
}
