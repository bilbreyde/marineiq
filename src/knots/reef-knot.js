// Reef Knot — joins two ends of the SAME rope around a sail or bundle
// Left rope (tan) and right rope (red) cross twice: left-over-right then right-over-left.
// viewBox "0 0 220 180"
//
// Mnemonic: left over right, then right over left → flat knot
// Warning: both tails must be on the same side; a granny knot jams under load.

export const reefKnotKnot = {
  id: 'reef-knot',
  viewBox: '0 0 220 180',

  fixed: [],

  segments: [
    // Left end, approaching from the left
    { id: 'left_in',   d: 'M 15 82 L 90 82',                                           stroke: '#7a5c0b', sw: 5 },
    // Right end, approaching from the right
    { id: 'right_in',  d: 'M 205 104 L 130 104',                                       stroke: '#B03020', sw: 5 },
    // First half knot: LEFT over RIGHT — left rope crosses to the right
    { id: 'half1',     d: 'M 90 82 C 110 82 115 96 130 104',                           stroke: '#7a5c0b', sw: 5 },
    // Right rope crosses to the left under the first half
    { id: 'half1_r',   d: 'M 130 104 C 112 104 108 90 90 82',                          stroke: '#B03020', sw: 4 },
    // Second half knot: RIGHT over LEFT — right rope crosses back right on top
    { id: 'half2',     d: 'M 90 104 C 108 104 114 90 130 82',                          stroke: '#B03020', sw: 5 },
    // Left rope crosses under back to the right
    { id: 'half2_l',   d: 'M 130 82 C 112 82 110 96 90 104',                           stroke: '#7a5c0b', sw: 4 },
    // Exits
    { id: 'left_out',  d: 'M 90 104 L 15 104',                                         stroke: '#7a5c0b', sw: 5 },
    { id: 'right_out', d: 'M 130 82 L 205 82',                                          stroke: '#B03020', sw: 5 },
  ],

  labels: [
    { id: 'lbl_left',   x: 20,  y: 78,  text: 'left end',    color: '#5a4200' },
    { id: 'lbl_right',  x: 155, y: 110, text: 'right end',   color: '#8B2020' },
    { id: 'lbl_h1',     x: 104, y: 118, text: 'L over R',    color: '#5a4200' },
    { id: 'lbl_h2',     x: 104, y: 68,  text: 'R over L',    color: '#8B2020' },
    { id: 'lbl_flat',   x: 94,  y: 140, text: 'flat = correct', color: '#27500A' },
  ],

  steps: [
    {
      label: 'Two ends laid out',
      instruction:
        'Hold both ends of the rope (or two separate ropes of the same diameter). The reef knot is only safe when joining two ends of the SAME rope — never use it as a bend for separate lines under load.',
      visible: ['left_in', 'right_in'],
      active:  ['left_in', 'right_in'],
      showLabels: ['lbl_left', 'lbl_right'],
    },
    {
      label: 'Left over right — first half',
      instruction:
        'Cross the LEFT end OVER the right end and tuck it underneath. Pull snug to form the first half knot. Mnemonic: "left over right."',
      visible: ['left_in', 'right_in', 'half1', 'half1_r'],
      active:  ['half1'],
      showLabels: ['lbl_left', 'lbl_right', 'lbl_h1'],
    },
    {
      label: 'Right over left — second half',
      instruction:
        'Now cross the RIGHT end OVER the left end and tuck underneath — this is the mirror of the first move. Mnemonic: "right over left." This is what separates a reef knot from a granny knot.',
      visible: ['left_in', 'right_in', 'half1', 'half1_r', 'half2', 'half2_l'],
      active:  ['half2'],
      showLabels: ['lbl_h1', 'lbl_h2'],
    },
    {
      label: 'Pull tight — check it is flat',
      instruction:
        'Pull both ends to tighten. A correct reef knot lies FLAT and symmetrical — both loops align. If it twists or looks uneven it is a granny knot; undo and retie. Only use for light, equal loads around a bundle.',
      visible: ['left_in', 'right_in', 'half1', 'half1_r', 'half2', 'half2_l', 'left_out', 'right_out'],
      active:  ['left_out', 'right_out'],
      showLabels: ['lbl_flat'],
    },
  ],
}
