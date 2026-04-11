// Anchor Hitch (Fisherman's Bend)
// Like a round turn, but the tail passes through BOTH loops before the half hitches.
// viewBox "0 0 220 200"
//
// Ring (anchor shackle) centred at (110, 52) radius 26.
// Key difference from Round Turn & Two Half Hitches: the tail goes through both wraps.

export const anchorHitchKnot = {
  id: 'anchor-hitch',
  viewBox: '0 0 220 200',

  fixed: [
    { type: 'circle', cx: 110, cy: 52, r: 26, fill: 'none', stroke: '#6B7280', strokeWidth: 5 },
  ],

  segments: [
    // Line approaching the anchor ring from the left (the rode)
    { id: 'approach', d: 'M 15 65 L 84 57',                                                       stroke: '#7a5c0b', sw: 5 },
    // First loop through/over the ring
    { id: 'turn1',    d: 'M 84 57 C 84 26 136 26 136 57',                                         stroke: '#7a5c0b', sw: 5 },
    // Second loop — completes the two-turn wrap around the ring
    { id: 'turn2',    d: 'M 136 57 C 160 57 163 80 136 82 C 112 85 84 78 84 57',                  stroke: '#7a5c0b', sw: 5 },
    // KEY STEP: tail goes through BOTH loops (not just the last one)
    { id: 'thru_both',d: 'M 84 57 C 72 50 68 40 74 33 C 80 26 94 28 98 36 C 104 46 100 56 108 56', stroke: '#B03020', sw: 4 },
    // First half hitch around the standing part
    { id: 'hitch1',   d: 'M 108 56 C 128 48 142 58 136 68 C 128 78 110 72 108 68',                stroke: '#B03020', sw: 4 },
    // Second half hitch — completes the locking; tail exits toward the anchor
    { id: 'hitch2',   d: 'M 108 68 C 115 82 130 88 148 95 L 200 115',                             stroke: '#B03020', sw: 4 },
  ],

  labels: [
    { id: 'lbl_ring',   x: 118, y: 22,  text: 'shackle / ring',  color: '#444' },
    { id: 'lbl_rode',   x: 16,  y: 60,  text: 'anchor rode',     color: '#5a4200' },
    { id: 'lbl_turn',   x: 138, y: 42,  text: 'two turns',       color: '#5a4200' },
    { id: 'lbl_thru',   x: 52,  y: 28,  text: 'through BOTH loops', color: '#8B2020' },
    { id: 'lbl_h1',     x: 138, y: 66,  text: '1st hitch',       color: '#8B2020' },
    { id: 'lbl_h2',     x: 138, y: 88,  text: '2nd hitch',       color: '#8B2020' },
  ],

  steps: [
    {
      label: 'Anchor rode to the shackle',
      instruction:
        'Bring the anchor rode to the anchor shackle or ring. The anchor hitch is the correct knot for this job — it grips harder as load increases and will not jam permanently like a figure-eight would.',
      visible: ['approach'],
      active:  ['approach'],
      showLabels: ['lbl_ring', 'lbl_rode'],
    },
    {
      label: 'First loop through the ring',
      instruction:
        'Pass the working end through the shackle (or around the ring) once. Take it all the way through — not just a bight.',
      visible: ['approach', 'turn1'],
      active:  ['turn1'],
      showLabels: ['lbl_ring', 'lbl_turn'],
    },
    {
      label: 'Second loop — two full turns',
      instruction:
        'Pass the working end through the ring a SECOND time, in the same direction. You now have two full loops around the ring. Keep both loops loose — the tail needs to pass through them in the next step.',
      visible: ['approach', 'turn1', 'turn2'],
      active:  ['turn2'],
      showLabels: ['lbl_turn'],
    },
    {
      label: 'Tail through BOTH loops — the key step',
      instruction:
        'Pass the tail through BOTH loops (not just the last one). This is what makes it an anchor hitch rather than a round turn — the tail locks both wraps together, preventing roll-out under surge loads.',
      visible: ['approach', 'turn1', 'turn2', 'thru_both'],
      active:  ['thru_both'],
      showLabels: ['lbl_thru'],
    },
    {
      label: 'First half hitch',
      instruction:
        'Tie a half hitch around the standing part. Slide it snug against the ring. The two loops are now captured; the half hitches are just belt-and-suspenders.',
      visible: ['approach', 'turn1', 'turn2', 'thru_both', 'hitch1'],
      active:  ['hitch1'],
      showLabels: ['lbl_h1'],
    },
    {
      label: 'Second half hitch — seize for permanent use',
      instruction:
        'Add a second half hitch and pull everything tight. For permanent installation (chain-to-shackle, mooring pennant), seize the tail to the standing part with whipping twine — tie this knot before you need it.',
      visible: ['approach', 'turn1', 'turn2', 'thru_both', 'hitch1', 'hitch2'],
      active:  ['hitch2'],
      showLabels: ['lbl_h2'],
    },
  ],
}
