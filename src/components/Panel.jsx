import {
  BeanIcon, MugIcon, GlassIcon, CupIcon, KettleIcon, PowerIcon, CuisinartLogo, StartStopLabel,
  ORANGE, GRAY, BEAN_LIGHT, BEAN_DARK,
} from './CoffeeIcons.jsx'
import panelTexture from '../assets/panel/panel-texture.png'
import dialMetal from '../assets/panel/dial-metal.png'
import dialFace from '../assets/panel/dial-face.svg'
import dialFaceGlow from '../assets/panel/dial-face-glow.svg'
import dialRingOutline from '../assets/panel/dial-ring-outline.svg'
import dialDisplay from '../assets/panel/dial-display.svg'
import dialDripstop from '../assets/panel/dial-dripstop.svg'

// Static reference labels for this look-only pass. Selected states below
// (Medium / Over Ice / 12oz / 10:00 AM) are fixed to match the reference
// screenshot exactly — not driven by any interaction.
const ROAST_LEVELS = ['Light', 'Medium', 'Dark']
const STYLES = ['Regular', 'Bold', 'Over Ice', 'Cold Brew']
const CUP_SIZES = [8, 10, 12, 14, 18]
const WATER_LEVELS = ['1/4', '1/3', '3/4', 'Full']

const SELECTED_ROAST = 1     // Medium
const SELECTED_STYLE = 2     // Over Ice
const SELECTED_CUP = 2       // 12oz
const CLOCK_TIME = { h: 10, m: '00', ampm: 'AM' }

// All coordinates below are px, absolute within the panel's fixed
// 678.24 x 519.12 canvas — script-extracted directly from the source design
// (Ethan_Next Gen Grind and Brew_UI.svg / assets/reference/beanbar-panel-source.svg),
// with the panel's own top-left offset (274.77, 133.5) already subtracted.
// The panel backdrop + Cuisinart logo position were cross-checked directly
// against the Figma "BACKDROP" node (678.24 x 519.12; logo at 183.98,431.12,
// 309.37x51.72) and match exactly.
const box = (left, top, width, height) => ({ position: 'absolute', left, top, width, height })

const ROAST_PILL = [46.55, 67.51, 95.68, 35.74]
const STYLE_PILL = [535.6, 67.51, 95.68, 35.74]

const BEAN_ICON = [62.3, 125.02, 11.11, 11.12]
const ROAST_ROW_SPACING = 36.09
const ROAST_ROW_H = 18

const MUG_ICON = [545.87, 124.55, 13.06, 10.8]
const GLASS_ICON = [547.01, 196.44, 7.78, 10.8]
const STYLE_ROW_SPACING = 36.0
const STYLE_ROW_H = 18

const CUP_ICON_BOX = {
  8: [228.52, 109.17, 18.17, 10.31],
  10: [279.01, 75.13, 15.05, 13.24],
  12: [330.86, 56.16, 16.51, 16.99],
  14: [384.81, 68.72, 12.5, 20.32],
  18: [438.63, 98.37, 16.97, 22.13],
}
const CUP_SLOT = {
  8: [212, 106, 50, 42],
  10: [262, 72, 50, 42],
  12: [314, 53, 50, 42],
  14: [368, 66, 50, 42],
  18: [422, 96, 50, 42],
}

const KETTLE_ICON_BOX = [
  [240.4, 242.86, 19.59, 18.98],
  [298.01, 267.53, 19.59, 18.98],
  [360.48, 267.22, 19.59, 18.98],
  [416.08, 242.83, 19.59, 18.98],
]
const KETTLE_SLOT = [
  [225, 240, 50, 46],
  [283, 265, 50, 46],
  [345, 265, 50, 46],
  [401, 240, 50, 46],
]

// Power is 36x36 (Figma node 121:2087). Bottom-aligned with the
// Pre-Ground/Clean/Keep Warm pill row (those sit at y=347.61, h=33.88,
// so their shared bottom edge is 381.49); power's top is set so its own
// bottom lands on that same line.
const PREGROUND_PILL = [96.55, 347.61, 81.97, 33.88]
const BOTTOM_ROW_BASELINE = PREGROUND_PILL[1] + PREGROUND_PILL[3]
const POWER_BOX = [56, BOTTOM_ROW_BASELINE - 36, 36, 36]

const CLEAN_PILL = [506.66, 347.61, 62.3, 33.88]
const KEEPWARM_PILL = [568.96, 347.61, 62.3, 33.88]

const DELAYBREW_PILL = [206.99, 170.86, 62.3, 33.88]
const CLOCK_PILL = [408.65, 170.86, 62.3, 33.88]

// Exact Figma "DIAL" node (147:2582): 144.24 x 143.98, at absolute
// (266.74, 114.17). Sub-layer boxes below are that node's own child
// insets (Rectangle / Group / Vector / FOUR SEG / DELAY BREW / DRIP STOP)
// converted from percent-insets to px against this container.
const DIAL_BOX = [266.74, 114.17, 144.24, 143.98]
const DIAL_METAL_BOX = [0, 0.32, 144.24, 143.29]
const DIAL_FACE_INNER_BOX = [9.72, 8.8, 126.38, 126.37]
const DIAL_RING_OUTLINE_BOX = [0.17, 0, 143.99, 143.98]
const DIAL_DISPLAY_BOX = [26.58, 54.09, 92.92, 42.94]
const DIAL_CAPTION_BOX = [26.58, 43.82, 59.18, 7]
const DIAL_DRIPSTOP_BOX = [66.72, 109.91, 10.93, 11.38]

const ADD_WATER_SLOT = [212, 355, 66, 34]
const ADD_BEANS_SLOT = [301, 355, 66, 34]
const EMPTY_BASKET_SLOT = [385, 355, 66, 34]

// Exact Figma "CUISINART LOGO" node: x=183.98, y=431.12, w=309.37, h=51.72
const LOGO_BOX = [183.98, 431.12, 309.37, 51.72]

function Pill({ boxRect, side, staticPill, children }) {
  const cls = ['cm-pill']
  if (side === 'left') cls.push('cm-pill-left')
  if (side === 'right') cls.push('cm-pill-right')
  if (staticPill) cls.push('cm-pill-static')
  return <div className={cls.join(' ')} style={box(...boxRect)}>{children}</div>
}

function PillLabel({ large, children }) {
  return (
    <>
      <span className={large ? 'cm-pill-header-label' : 'cm-pill-label'}>{children}</span>
      <span className="cm-pill-underline" />
    </>
  )
}

export default function Panel() {
  return (
    <div className="panelwrap">
      <div className="panel">
        <div className="panel-shell">
          <img className="panel-texture" src={panelTexture} alt="" draggable={false} />
        </div>

        {/* ---- Roast ---- */}
        <Pill boxRect={ROAST_PILL} staticPill>
          <PillLabel large>Roast</PillLabel>
        </Pill>
        {ROAST_LEVELS.map((name, i) => {
          const neutral = i === 0 ? BEAN_LIGHT : i === 2 ? BEAN_DARK : GRAY
          const active = SELECTED_ROAST === i
          const color = active ? ORANGE : neutral
          const top = BEAN_ICON[1] + ROAST_ROW_SPACING * i - (ROAST_ROW_H - BEAN_ICON[3]) / 2
          return (
            <div key={name} className="cm-option-row" style={{ ...box(BEAN_ICON[0], top, 150, ROAST_ROW_H), gap: 11 }}>
              <div className="cm-option-icon" style={{ width: BEAN_ICON[2], height: BEAN_ICON[3] }}><BeanIcon color={color} /></div>
              <span className={'cm-option-label' + (active ? ' active' : '')}>{name}</span>
            </div>
          )
        })}

        {/* ---- Style ---- */}
        <Pill boxRect={STYLE_PILL} staticPill>
          <PillLabel large>Style</PillLabel>
        </Pill>
        {STYLES.map((name, i) => {
          const active = SELECTED_STYLE === i
          const color = active ? ORANGE : GRAY
          const iconBox = i < 2 ? MUG_ICON : GLASS_ICON
          const icon = i === 0 ? <MugIcon variant="regular" color={color} />
            : i === 1 ? <MugIcon variant="bold" color={color} />
            : i === 2 ? <GlassIcon variant="overice" color={color} />
            : <GlassIcon variant="coldbrew" color={color} />
          const top = iconBox[1] + STYLE_ROW_SPACING * (i < 2 ? i : i - 2) - (STYLE_ROW_H - iconBox[3]) / 2
          return (
            <div key={name} className="cm-option-row" style={{ ...box(iconBox[0], top, 150, STYLE_ROW_H), gap: 11 }}>
              <div className="cm-option-icon" style={{ width: iconBox[2], height: iconBox[3] }}>{icon}</div>
              <span className={'cm-option-label' + (active ? ' active' : '')}>{name}</span>
            </div>
          )
        })}

        {/* ---- Cup size ---- */}
        {CUP_SIZES.map((size, i) => {
          const active = SELECTED_CUP === i
          const color = active ? ORANGE : GRAY
          const iconBox = CUP_ICON_BOX[size]
          const slot = CUP_SLOT[size]
          return (
            <div key={size} className="cm-cup" style={box(...slot)}>
              <div style={{ width: iconBox[2], height: iconBox[3] }}><CupIcon size={size} color={color} /></div>
              <span className={'cm-cup-label' + (active ? ' active' : '')}>{size}<span className="cm-cup-oz">oz</span></span>
            </div>
          )
        })}

        {/* ---- Reservoir gauge (informational only, never recolored) ---- */}
        {WATER_LEVELS.map((label, i) => (
          <div key={label} className="cm-kettle" style={box(...KETTLE_SLOT[i])}>
            <div style={{ width: KETTLE_ICON_BOX[i][2], height: KETTLE_ICON_BOX[i][3] }}><KettleIcon level={i} /></div>
            <span className="cm-kettle-label">{label}</span>
          </div>
        ))}

        {/* ---- Power ---- */}
        <div className="cm-power" style={box(...POWER_BOX)}>
          <div className="cm-power-inner" />
          <div className="cm-power-icon"><PowerIcon /></div>
        </div>

        {/* ---- Pre-Ground ---- */}
        <Pill boxRect={PREGROUND_PILL}>
          <PillLabel>Pre-Ground</PillLabel>
        </Pill>

        {/* ---- Add Water / Add Beans / Empty Basket ---- */}
        <div className="cm-caption-2l" style={box(...ADD_WATER_SLOT)}>Add<br />Water</div>
        <div className="cm-caption-2l" style={box(...ADD_BEANS_SLOT)}>Add<br />Beans</div>
        <div className="cm-caption-2l" style={box(...EMPTY_BASKET_SLOT)}>Empty<br />Basket</div>

        {/* ---- Clean / Keep Warm ---- */}
        <Pill boxRect={CLEAN_PILL} side="left">
          <PillLabel>Clean</PillLabel>
        </Pill>
        <Pill boxRect={KEEPWARM_PILL} side="right">
          <PillLabel>Keep Warm</PillLabel>
        </Pill>

        {/* ---- Delay Brew / Clock ---- */}
        <Pill boxRect={DELAYBREW_PILL} side="left">
          <PillLabel>Delay Brew</PillLabel>
        </Pill>
        <Pill boxRect={CLOCK_PILL} side="right">
          <PillLabel>Clock</PillLabel>
        </Pill>

        {/* ---- Dial (assets pulled directly from Figma node 147:2582) ---- */}
        <div className="cm-dial" style={box(...DIAL_BOX)}>
          <img className="cm-dial-layer" style={box(...DIAL_METAL_BOX)} src={dialMetal} alt="" draggable={false} />
          <img className="cm-dial-layer" style={box(...DIAL_FACE_INNER_BOX)} src={dialFace} alt="" draggable={false} />
          <img className="cm-dial-layer" style={box(...DIAL_FACE_INNER_BOX)} src={dialFaceGlow} alt="" draggable={false} />
          <img className="cm-dial-layer" style={box(...DIAL_RING_OUTLINE_BOX)} src={dialRingOutline} alt="" draggable={false} />
          <img className="cm-dial-layer" style={box(...DIAL_DISPLAY_BOX)} src={dialDisplay} alt="" draggable={false} />
          <div className="cm-dial-caption" style={box(...DIAL_CAPTION_BOX)}>Delay Brew Scheduled</div>
          <img className="cm-dial-layer" style={box(...DIAL_DRIPSTOP_BOX)} src={dialDripstop} alt="" draggable={false} />
          <div className="cm-dial-layer" style={box(0, 0, 144.24, 143.98)}><StartStopLabel /></div>
        </div>

        {/* ---- Cuisinart wordmark on the brushed-steel base plate ---- */}
        <div className="cm-logo" style={box(...LOGO_BOX)}><CuisinartLogo /></div>
      </div>
    </div>
  )
}
