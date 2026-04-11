// Sheet Bend — joins two lines of different diameters
// Tan (thick) rope forms a bight; red (thin) rope weaves through it.
// viewBox "0 0 220 190"
//
// Key rule: both tail ends must exit on the SAME side or the knot is dangerously weak.

export const sheetBendKnot = {
  id: 'sheet-bend',
  viewBox: '0 0 220 190',

  fixed: [],

  segments: [
    // Thick rope left leg of bight
    { id: 'thick_l',   d: 'M 15 78 L 92 78',                                          stroke: '#7a5c0b', sw: 7 },
    // Thick rope: the U-curve of the bight
    { id: 'thick_u',   d: 'M 92 78 C 132 78 138 114 92 114',                          stroke: '#7a5c0b', sw: 7 },
    // Thick rope right leg (returns left)
    { id: 'thick_r',   d: 'M 92 114 L 15 114',                                        stroke: '#7a5c0b', sw: 7 },
    // Thin rope: approaches from right, passes UP through the bight from below
    { id: 'thin_up',   d: 'M 200 60 L 92 60 C 65 60 64 78 92 78',                    stroke: '#B03020', sw: 4 },
    // Thin rope: goes AROUND BEHIND both legs of the bight
    { id: 'thin_round',d: 'M 92 78 C 92 122 158 122 172 94',                          stroke: '#B03020', sw: 4 },
    // Thin rope: tucks back UNDER ITS OWN STANDING PART (not under the bight)
    { id: 'thin_lock', d: 'M 172 94 C 190 72 180 58 162 60',                          stroke: '#B03020', sw: 4 },
  ],

  labels: [
    { id: 'lbl_thick',  x: 20,  y: 74,  text: 'thick rope',     color: '#5a4200' },
    { id: 'lbl_bight',  x: 142, y: 96,  text: 'bight',          color: '#5a4200' },
    { id: 'lbl_thin',   x: 155, y: 56,  text: 'thin rope',      color: '#8B2020' },
    { id: 'lbl_behind', x: 148, y: 125, text: 'behind both',    color: '#8B2020' },
    { id: 'lbl_lock',   x: 155, y: 88,  text: 'under own sp',   color: '#8B2020' },
  ],

  steps: [
    {
      label: 'Bight in the thick rope',
      instruction:
        'Form a bight (U-shape) in the THICKER rope. The thick rope does not get tied — it just provides the structure. Hold the bight open with one hand.',
      visible: ['thick_l', 'thick_u', 'thick_r'],
      active:  ['thick_u'],
      showLabels: ['lbl_thick', 'lbl_bight'],
    },
    {
      label: 'Thin rope up through the bight',
      instruction:
        'Pass the thinner rope UP through the bight from below. The thin rope enters the bottom of the U and emerges out the top — it should come through the centre of the bight.',
      visible: ['thick_l', 'thick_u', 'thick_r', 'thin_up'],
      active:  ['thin_up'],
      showLabels: ['lbl_thick', 'lbl_thin'],
    },
    {
      label: 'Around behind BOTH legs',
      instruction:
        'Take the thin rope around behind BOTH legs of the bight. This is the critical move — it must go behind the entire thick-rope bight, not just one leg.',
      visible: ['thick_l', 'thick_u', 'thick_r', 'thin_up', 'thin_round'],
      active:  ['thin_round'],
      showLabels: ['lbl_bight', 'lbl_behind'],
    },
    {
      label: 'Under its own standing part — pull tight',
      instruction:
        'Tuck the thin rope back UNDER ITS OWN STANDING PART (not under the thick rope bight). This locks the knot. Both tail ends must exit on the SAME side — check this before loading the line.',
      visible: ['thick_l', 'thick_u', 'thick_r', 'thin_up', 'thin_round', 'thin_lock'],
      active:  ['thin_lock'],
      showLabels: ['lbl_lock'],
    },
  ],
}
