// Cleat Hitch — top-down view of a horn cleat
// Dock line enters from the left; round turn at base, figure-eight over horns, locking hitch.
// viewBox "0 0 220 175"
//
// Cleat body centred at (110, 82): rect 78–142 x 74–90, left horn ellipse at (86,82), right at (134,82)

export const cleatHitchKnot = {
  id: 'cleat-hitch',
  viewBox: '0 0 220 175',

  // ── Structural elements (always visible) ──────────────────────────────────
  fixed: [
    { type: 'rect',    x: 78,  y: 74,  width: 64, height: 16, rx: 4,  fill: '#6B7280', stroke: 'none' },
    { type: 'ellipse', cx: 86, cy: 82, rx: 11,    ry: 8,              fill: '#4B5563', stroke: 'none' },
    { type: 'ellipse', cx: 134,cy: 82, rx: 11,    ry: 8,              fill: '#4B5563', stroke: 'none' },
  ],

  // ── Rope segments ─────────────────────────────────────────────────────────
  segments: [
    // Dock line approaching from the pier (left)
    { id: 'dock',  d: 'M 15 108 L 78 108',                                     stroke: '#7a5c0b', sw: 5 },
    // Full round turn around the base of the cleat (between the horns)
    { id: 'turn',  d: 'M 78 108 C 55 108 55 62 110 62 C 165 62 165 108 142 108', stroke: '#7a5c0b', sw: 5 },
    // First figure-eight diagonal: from right, crossing to the far (right) horn
    { id: 'diag1', d: 'M 142 108 C 158 108 150 74 134 74',                      stroke: '#B03020', sw: 4 },
    // Second figure-eight diagonal: from right horn back across to near (left) horn
    { id: 'diag2', d: 'M 134 74 C 110 56 88 74 86 74',                          stroke: '#B03020', sw: 4 },
    // Locking hitch: final half-hitch twist that grips under itself
    { id: 'lock',  d: 'M 86 74 C 62 74 58 108 86 96 C 100 90 108 82 108 82',    stroke: '#B03020', sw: 4, dash: '5 3' },
  ],

  // ── Labels ────────────────────────────────────────────────────────────────
  labels: [
    { id: 'lbl_dock', x: 16,  y: 102, text: 'dock line',  color: '#5a4200' },
    { id: 'lbl_base', x: 96,  y: 58,  text: 'base turn',  color: '#5a4200' },
    { id: 'lbl_far',  x: 148, y: 70,  text: 'far horn',   color: '#8B2020' },
    { id: 'lbl_near', x: 50,  y: 70,  text: 'near horn',  color: '#8B2020' },
    { id: 'lbl_lock', x: 50,  y: 140, text: 'lock',       color: '#8B2020' },
  ],

  // ── Steps ─────────────────────────────────────────────────────────────────
  steps: [
    {
      label: 'Dock line in',
      instruction:
        'Lead the dock line in toward the cleat. Leave enough slack to complete the wraps — roughly three times the cleat length.',
      visible: ['dock'],
      active:  ['dock'],
      showLabels: ['lbl_dock'],
    },
    {
      label: 'Round turn at the base',
      instruction:
        'Take a full round turn around the BASE of the cleat (the body between the horns). This is where the load is carried — the wraps over the horns are just for locking.',
      visible: ['dock', 'turn'],
      active:  ['turn'],
      showLabels: ['lbl_dock', 'lbl_base'],
    },
    {
      label: 'First diagonal — far horn',
      instruction:
        'Cross over diagonally to the FAR horn (the one away from where the line comes from). This starts the figure-eight pattern.',
      visible: ['dock', 'turn', 'diag1'],
      active:  ['diag1'],
      showLabels: ['lbl_dock', 'lbl_base', 'lbl_far'],
    },
    {
      label: 'Cross back — near horn',
      instruction:
        'Cross back diagonally to the NEAR horn, completing the figure-eight. Both tail ends should now form an X over the cleat horns.',
      visible: ['dock', 'turn', 'diag1', 'diag2'],
      active:  ['diag2'],
      showLabels: ['lbl_far', 'lbl_near'],
    },
    {
      label: 'Locking hitch — pull snug',
      instruction:
        'Finish with a locking half-hitch: twist the line so it crosses UNDER itself as it goes over the horn. Pull the whole thing snug. The line should hold without slipping even under load.',
      visible: ['dock', 'turn', 'diag1', 'diag2', 'lock'],
      active:  ['lock'],
      showLabels: ['lbl_near', 'lbl_lock'],
    },
  ],
}
