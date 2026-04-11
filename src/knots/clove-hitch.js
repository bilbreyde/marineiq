// Clove Hitch — front elevation of a vertical post
// Two wraps that cross each other on the front of the post; tail exits from the X.
// viewBox "0 0 220 180"
//
// Post: rect x=97–123, y=5–175 (26px wide, centred at x=110)

export const cloveHitchKnot = {
  id: 'clove-hitch',
  viewBox: '0 0 220 180',

  fixed: [
    { type: 'rect', x: 97, y: 5, width: 26, height: 170, rx: 5, fill: '#9CA3AF', stroke: 'none' },
  ],

  segments: [
    // Line entering from the left
    { id: 'enter',     d: 'M 15 62 L 97 62',                                                    stroke: '#7a5c0b', sw: 5 },
    // First pass: goes right of post, curving down the right side
    { id: 'wrap_r',    d: 'M 123 62 C 165 62 170 90 123 94',                                    stroke: '#7a5c0b', sw: 5 },
    // Back cross: comes around behind, emerges on the left, then crosses OVER the first wrap
    { id: 'cross',     d: 'M 97 94 C 52 94 45 80 52 66 C 58 56 78 58 97 62',                   stroke: '#B03020', sw: 4 },
    // Tail: exits to the right from the crossing point
    { id: 'tail',      d: 'M 123 76 L 205 76',                                                  stroke: '#B03020', sw: 4 },
  ],

  labels: [
    { id: 'lbl_line',  x: 16,  y: 58,  text: 'line',          color: '#5a4200' },
    { id: 'lbl_post',  x: 130, y: 20,  text: 'post / rail',   color: '#444' },
    { id: 'lbl_x',     x: 60,  y: 80,  text: 'X crossing',    color: '#8B2020' },
    { id: 'lbl_tail',  x: 165, y: 72,  text: 'tail',          color: '#8B2020' },
  ],

  steps: [
    {
      label: 'Line to the post',
      instruction:
        'Bring the line up to the post, rail, or bollard. The clove hitch is most secure when the load pulls at roughly 90° to the post.',
      visible: ['enter'],
      active:  ['enter'],
      showLabels: ['lbl_line', 'lbl_post'],
    },
    {
      label: 'First pass — over and right',
      instruction:
        'Pass the line OVER the post from left to right, then bring it around the right side going down. This is the first of two wraps.',
      visible: ['enter', 'wrap_r'],
      active:  ['wrap_r'],
      showLabels: ['lbl_line', 'lbl_post'],
    },
    {
      label: 'Around the back — cross over',
      instruction:
        'Bring the line around the BACK of the post (right to left), then cross it OVER the first wrap on the front — this forms the X pattern. The second wrap holds the first in place.',
      visible: ['enter', 'wrap_r', 'cross'],
      active:  ['cross'],
      showLabels: ['lbl_x'],
    },
    {
      label: 'Tail under the X — pull tight',
      instruction:
        'Tuck the tail UNDERNEATH the crossing (the X) and pull both the standing part and tail firmly. For an unattended tie-off, add a half-hitch on the standing part as a safety.',
      visible: ['enter', 'wrap_r', 'cross', 'tail'],
      active:  ['tail'],
      showLabels: ['lbl_x', 'lbl_tail'],
    },
  ],
}
