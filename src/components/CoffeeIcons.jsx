// Inline (not <img>-referenced) so fill/stroke color can be driven by props —
// same rationale as TwinCrisp's ButtonSvgs.jsx. Path/viewBox data is
// byte-exact, script-extracted from the source Figma SVG (see
// assets/panel/coffeeIconPaths.js) — coordinates are left in the ORIGINAL
// (untranslated) space; each icon's own viewBox frames just that artwork,
// and the wrapping element is positioned on the panel via CSS.

import { D, VB, RECTS } from '../assets/panel/coffeeIconPaths.js'

export const ORANGE = '#f47522'
export const GRAY = '#9e9d9e'
export const BEAN_LIGHT = '#939598'
export const BEAN_DARK = '#414042'
export const PANEL_WHITE = '#f1f2f2'

const svgBase = { width: '100%', height: '100%', display: 'block', overflow: 'visible' }

export function BeanIcon({ color }) {
  return (
    <svg viewBox={VB.BEAN} style={svgBase}>
      <path d={D.BEAN_OUTER} fill={color} />
      <path d={D.BEAN_CREASE} fill={color} />
    </svg>
  )
}

// variant: 'regular' (single steam wisp) | 'bold' (double steam wisp)
export function MugIcon({ variant, color }) {
  const bold = variant === 'bold'
  const bodyD = bold ? D.MUG_BODY_BOLD : D.MUG_BODY
  const vb = bold ? VB.MUG_BOLD : VB.MUG_REGULAR
  const leaves = bold
    ? [D.MUG_LEAF_BOLD_1, D.MUG_LEAF_BOLD_2, D.MUG_LEAF_BOLD_3, D.MUG_LEAF_BOLD_4]
    : [D.MUG_LEAF_1, D.MUG_LEAF_2]
  return (
    <svg viewBox={vb} style={svgBase}>
      <path d={bodyD} fill={color} />
      {leaves.map((ld, i) => <path key={i} d={ld} fill={BEAN_LIGHT} />)}
    </svg>
  )
}

// variant: 'overice' (ice cubes) | 'coldbrew' (snowflake mark)
export function GlassIcon({ variant, color }) {
  if (variant === 'overice') {
    return (
      <svg viewBox={VB.GLASS_OVERICE} style={svgBase}>
        <path d={D.GLASS_BODY} fill="none" stroke={color} strokeWidth={1} strokeMiterlimit={10} />
        {RECTS.ICE_CUBES.map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={r.width} height={r.height} rx={r.rx} ry={r.ry}
            transform={r.transform} fill={color} />
        ))}
      </svg>
    )
  }
  return (
    <svg viewBox={VB.GLASS_COLDBREW} style={svgBase}>
      <path d={D.GLASS_BODY_COLDBREW} fill="none" stroke={color} strokeWidth={1} strokeMiterlimit={10} />
      <path d={D.COLDBREW_MARK} fill={color} />
    </svg>
  )
}

export function CupIcon({ size, color }) {
  switch (size) {
    case 8:
      return (
        <svg viewBox={VB.CUP8OZ} style={svgBase}>
          <path d={D.CUP8OZ_BODY} fill={color} />
        </svg>
      )
    case 10:
      return (
        <svg viewBox={VB.CUP10OZ} style={svgBase}>
          <path d={D.CUP10OZ_LID} fill="none" stroke={color} strokeWidth={0.75} strokeMiterlimit={10} />
          <path d={D.CUP10OZ_BODY} fill="none" stroke={color} strokeWidth={0.75} strokeMiterlimit={10} />
        </svg>
      )
    case 14:
      return (
        <svg viewBox={VB.CUP14OZ} style={svgBase}>
          <path d={D.CUP14OZ_BODY} fill={color} />
          {RECTS.CUP14_LINES.map((r, i) => <rect key={i} x={r.x} y={r.y} width={r.width} height={r.height} fill={color} />)}
          <path d={D.CUP14OZ_LID} fill={color} />
        </svg>
      )
    case 18:
      return (
        <svg viewBox={VB.CUP18OZ} style={svgBase}>
          <path d={D.CUP18OZ_BODY} fill={color} />
          {RECTS.CUP18_LINES.map((r, i) => <rect key={i} x={r.x} y={r.y} width={r.width} height={r.height} fill={color} />)}
          <path d={D.CUP18OZ_LID} fill={color} />
          <path d={D.CUP18OZ_HIGHLIGHT} fill="none" stroke={color} strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 12:
    default:
      return (
        <svg viewBox={VB.CUP12OZ} style={svgBase}>
          <path d={D.CUP12OZ_BODY} fill="none" stroke={color} strokeWidth={0.75} strokeMiterlimit={10} />
          <path d={D.CUP12OZ_LID} fill="none" stroke={color} strokeWidth={0.75} strokeMiterlimit={10} />
        </svg>
      )
  }
}

// level: 0=1/4, 1=1/2, 2=3/4, 3=Full
export function KettleIcon({ level }) {
  if (level === 0) {
    return (
      <svg viewBox={VB.KETTLE14} style={svgBase}>
        <path d={D.KETTLE_BODY} fill={GRAY} />
        <path d={D.KETTLE_FILL_14} fill={GRAY} />
      </svg>
    )
  }
  if (level === 1) {
    return (
      <svg viewBox={VB.KETTLE12} style={svgBase}>
        <path d={D.KETTLE_BODY_12} fill={GRAY} />
        <path d={D.KETTLE_FILL_12} fill={GRAY} />
      </svg>
    )
  }
  if (level === 2) {
    return (
      <svg viewBox={VB.KETTLE34} style={svgBase}>
        <path d={D.KETTLE_BODY_34} fill={GRAY} />
        <path d={D.KETTLE_FILL_34_L} fill={GRAY} />
        <path d={D.KETTLE_FILL_34_R} fill={GRAY} />
      </svg>
    )
  }
  return (
    <svg viewBox={VB.KETTLEFULL} style={svgBase}>
      <path d={D.KETTLE_FILL_FULL_L} fill={GRAY} />
      <path d={D.KETTLE_FILL_FULL_R} fill={GRAY} />
      <path d={D.KETTLE_BODY_FULL} fill={GRAY} />
    </svg>
  )
}

export function PowerIcon() {
  return (
    <svg viewBox={VB.POWER} style={svgBase}>
      <path d={D.POWER_GLYPH} fill="#fff" />
      <path d={D.POWER_TICK} fill="none" stroke="#fff" strokeWidth={0.75} strokeLinecap="round" />
    </svg>
  )
}

// slashed: true = idle/no schedule (drop + diagonal line), false = armed/active (drop only)
export function WaterDropIcon({ slashed = true, color = '#fff' }) {
  return (
    <svg viewBox={VB.WATERDROP} style={svgBase}>
      <path d={D.WATERDROP} fill="none" stroke={color} strokeWidth={0.75} strokeLinecap="round" strokeLinejoin="round" />
      {slashed && <line x1="608.46" y1="367.46" x2="619.39" y2="356.53" stroke={color} strokeWidth={0.75} strokeLinecap="round" />}
    </svg>
  )
}

// "start/stop" curved along the dial's ring (Figma node 125:3299 hand-places
// each letter with its own rotation; reproduced here as real vector text on
// an SVG arc so it stays crisp instead of an upscaled small raster export).
// viewBox matches the dial's own 144.24 x 143.98 local space so this can be
// positioned with the same box as the rest of the dial's layers.
export function StartStopLabel() {
  const cx = 72.12, cy = 71.99
  const r = 59
  const halfSpanDeg = 24
  const rad = (deg) => (deg * Math.PI) / 180
  const sx = cx - r * Math.sin(rad(halfSpanDeg))
  const sy = cy - r * Math.cos(rad(halfSpanDeg))
  const ex = cx + r * Math.sin(rad(halfSpanDeg))
  const ey = sy
  return (
    <svg viewBox="0 0 144.24 143.98" style={svgBase}>
      <defs>
        <path id="cm-startstop-arc" d={`M ${sx} ${sy} A ${r} ${r} 0 0 1 ${ex} ${ey}`} fill="none" />
      </defs>
      <text fontFamily="Bahnschrift, 'Segoe UI', system-ui, sans-serif" fontWeight="600" fontSize="9.55" fill="#f1f2f2">
        <textPath href="#cm-startstop-arc" startOffset="50%" textAnchor="middle">start/stop</textPath>
      </text>
    </svg>
  )
}

export function CuisinartLogo() {
  return (
    <svg viewBox={VB.LOGO} style={svgBase}>
      <defs>
        <linearGradient id="cm-logo-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#8c8e90" />
        </linearGradient>
      </defs>
      <path d={D.CUISINART_LOGO} fill="url(#cm-logo-grad)" />
    </svg>
  )
}

// The dial's metal bezel ring — a beveled torus shape with a top-light /
// bottom-dark vertical gradient, exactly as traced in the source (gradient
// stops sampled straight from the design's linear-gradient-2 def).
export function DialBezelRing() {
  return (
    <svg viewBox={VB.DIAL_RING} style={svgBase}>
      <defs>
        <linearGradient id="cm-dial-ring-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3e3e3" />
          <stop offset=".49" stopColor="#d9d9d9" />
          <stop offset=".87" stopColor="#767676" />
          <stop offset="1" stopColor="#535353" />
        </linearGradient>
      </defs>
      <path d={D.DIAL_BEZEL_RING} fill="url(#cm-dial-ring-grad)" />
    </svg>
  )
}
