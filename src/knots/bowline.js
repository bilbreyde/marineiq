// Bowline interactive knot data
// Segments are SVG path segments. Each step controls which are visible and which is active (glowing).
// Coordinate system: viewBox "0 0 220 190"
//
// Layout:
//   Standing part — enters from top at x=95, straight down to y=78
//   Small loop    — oval to the right, x 95–132, y 56–100
//   Large fixed loop — big U below the small loop, y 100–178
//   Tail (red)    — goes up from large loop right side, arcs behind standing, comes back down

export const bowlineKnot = {
  id: 'bowline',
  viewBox: '0 0 220 190',

  // ── Rope segments ─────────────────────────────────────────────────────────
  segments: [
    {
      id: 'sp',
      d: 'M 95 15 L 95 78',
      stroke: '#7a5c0b',
      sw: 5,
    },
    {
      // Small overhand loop — oval to the right of the standing part
      id: 'sl',
      d: 'M 95 78 C 95 56 132 56 132 78 C 132 100 95 100 95 78',
      stroke: '#7a5c0b',
      sw: 5,
    },
    {
      // Large fixed loop — the useful output of the knot
      id: 'll',
      d: 'M 95 100 C 92 178 150 178 148 100',
      stroke: '#7a5c0b',
      sw: 5,
    },
    {
      // Tail: rises from right side of large loop upward, past the small loop
      id: 't_up',
      d: 'M 148 100 L 148 53',
      stroke: '#B03020',
      sw: 4,
    },
    {
      // Tail: sweeps left and around behind the standing part
      id: 't_arc',
      d: 'M 148 53 C 148 22 58 22 64 60 C 66 70 78 76 95 76',
      stroke: '#B03020',
      sw: 4,
    },
    {
      // Tail: exits back down through the small loop
      id: 't_dn',
      d: 'M 95 76 C 98 88 112 96 128 100',
      stroke: '#B03020',
      sw: 4,
    },
  ],

  // ── Anatomy labels ─────────────────────────────────────────────────────────
  labels: [
    { id: 'lbl_sp',   x: 50,  y: 46,  text: 'standing part', color: '#5a4200' },
    { id: 'lbl_sl',   x: 134, y: 78,  text: 'small loop',    color: '#5a4200' },
    { id: 'lbl_ll',   x: 152, y: 158, text: 'fixed loop',    color: '#5a4200' },
    { id: 'lbl_tail', x: 152, y: 68,  text: 'tail',          color: '#8B2020' },
  ],

  // ── Steps ──────────────────────────────────────────────────────────────────
  steps: [
    {
      label: 'The rope',
      instruction:
        'Start with the rope laid out. The standing part is the main body — it runs to whatever you\'re securing to. Decide how large the finished loop needs to be before you begin.',
      visible: ['sp'],
      active:  ['sp'],
      showLabels: ['lbl_sp'],
    },
    {
      label: 'Form the small loop',
      instruction:
        'Make a small overhand loop in the standing part, turning clockwise so the standing part crosses over itself. This is "the hole" — it stays fixed while the tail weaves through it.',
      visible: ['sp', 'sl'],
      active:  ['sl'],
      showLabels: ['lbl_sp', 'lbl_sl'],
    },
    {
      label: 'Shape the fixed loop',
      instruction:
        'Bring the working end back up to the right of the small loop. The large U-shape below is the finished loop — its size is set now. Hold it in place with your non-dominant hand.',
      visible: ['sp', 'sl', 'll'],
      active:  ['ll'],
      showLabels: ['lbl_sp', 'lbl_sl', 'lbl_ll'],
    },
    {
      label: 'Rabbit out of the hole',
      instruction:
        'Pass the tail up through the small loop from below — the rabbit comes out of the hole. The tail should exit above the small loop on the right side.',
      visible: ['sp', 'sl', 'll', 't_up'],
      active:  ['t_up'],
      showLabels: ['lbl_sp', 'lbl_sl', 'lbl_ll', 'lbl_tail'],
    },
    {
      label: 'Around the tree',
      instruction:
        'Take the tail around behind the standing part — the rabbit goes around the tree. Sweep left, pass behind the standing part, and come out on the left side of it.',
      visible: ['sp', 'sl', 'll', 't_up', 't_arc'],
      active:  ['t_arc'],
      showLabels: ['lbl_sp', 'lbl_sl', 'lbl_ll', 'lbl_tail'],
    },
    {
      label: 'Back in the hole — tighten',
      instruction:
        'Pass the tail back down through the small loop — the rabbit goes back in the hole. Hold the fixed loop with one hand and pull both the standing part and tail with the other. The small loop closes; the fixed loop cannot slip.',
      visible: ['sp', 'sl', 'll', 't_up', 't_arc', 't_dn'],
      active:  ['t_dn'],
      showLabels: ['lbl_sp', 'lbl_sl', 'lbl_ll', 'lbl_tail'],
    },
  ],
}
