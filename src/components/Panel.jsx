import { useRef, useEffect } from 'react'
import {
  BeanIcon, MugIcon, GlassIcon, CupIcon, KettleIcon, PowerIcon, CuisinartLogo, StartStopLabel,
  DialBrewRing, GRAY, LIT_WHITE,
} from './CoffeeIcons.jsx'
import panelTexture from '../assets/Images/BackDrop.png'
import dialMetal from '../assets/panel/dial-metal.png'
import dialFace from '../assets/panel/dial-face.svg'
import dialFaceGlow from '../assets/panel/dial-face-glow.svg'
import dialRingOutline from '../assets/panel/dial-ring-outline.svg'
import dialDripstop from '../assets/panel/dial-dripstop.svg'

export const ROAST_LEVELS = ['Light', 'Medium', 'Dark']
// Each roast bean's own unselected icon tint (text label stays plain gray).
const ROAST_ICON_NEUTRAL = ['#939598', '#6d6a6d', '#414042']
export const STYLES = ['Regular', 'Bold', 'Over Ice', 'Cold Brew']
export const CUP_SIZES = [8, 10, 12, 14, 18]
export const WATER_LEVELS = ['1/4', '1/3', '3/4', 'Full']

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
// Radial layout per Figma node 155:3139 "SINGLE SERVES OPTION": bottoms
// (not tops) are what line up in pairs, since each cup icon's own height
// differs — 8oz/18oz share the lowest line, 10oz/14oz share a line above
// that, and 12oz peaks highest at the crown of the arc. Carafe options
// (KETTLE_SLOT) are separate and already correct — left untouched.
const CUP_SLOT = {
  8: [212.73, 95.94, 50, 42],
  10: [254.73, 72.81, 50, 42],
  12: [313.23, 51.49, 50, 42],
  14: [371.73, 72.81, 50, 42],
  18: [413.73, 95.94, 50, 42],
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
const DIAL_CAPTION_BOX = [26.58, 43.82, 59.18, 7]
const DIAL_DRIPSTOP_BOX = [66.72, 109.91, 10.93, 11.38]
// AM/PM indicator (Figma node 125:3297): sits just under the digits,
// right of center. Measured directly off that node's own screenshot since
// get_metadata doesn't expand these as separate text nodes.
const DIAL_AMPM_BOX = [95, 90.5, 32, 7]

const ADD_WATER_SLOT = [212, 355, 66, 34]
const ADD_BEANS_SLOT = [301, 355, 66, 34]
const EMPTY_BASKET_SLOT = [385, 355, 66, 34]

// Exact Figma "CUISINART LOGO" node: x=183.98, y=431.12, w=309.37, h=51.72
const LOGO_BOX = [183.98, 431.12, 309.37, 51.72]

// ---- Permanent (pad-printed / physical) pill chrome — always visible
// regardless of power state; only the backlit label text inside dims. ----
function Pill({ boxRect, side, staticPill, onClick, children }) {
  const cls = ['cm-pill']
  if (side === 'left') cls.push('cm-pill-left')
  if (side === 'right') cls.push('cm-pill-right')
  if (staticPill) cls.push('cm-pill-static')
  if (onClick) cls.push('cm-hit')
  return <div className={cls.join(' ')} style={box(...boxRect)} onClick={onClick}>{children}</div>
}

// underlineColor/underlineBlink drive the small backlit pill under each
// label — grey while off (or "on but idle" for Delay Brew/Clock/Pre-Ground/
// Clean/Keep Warm), white when active, and blinking white while a
// roast/style choice is actively being cycled.
function PillLabel({ large, underlineColor, underlineBlink, children }) {
  return (
    <>
      <span className={large ? 'cm-pill-header-label' : 'cm-pill-label'}>{children}</span>
      <span
        className={'cm-pill-underline' + (underlineBlink ? ' cm-blink' : '')}
        style={{ background: underlineColor }}
      />
    </>
  )
}

// The dial is one continuous ring of 9 stops — 5 cup sizes then 4 carafe
// levels — with exactly one lit at a time: 8oz -> 10oz -> 12oz -> 14oz ->
// 18oz -> 1/4 -> 1/3 -> 3/4 -> Full -> (wraps back to 8oz).
export const SIZE_RING_LENGTH = CUP_SIZES.length + WATER_LEVELS.length

const pad2 = (n) => String(n).padStart(2, '0')

export default function Panel({
  on, roastIndex, styleIndex, sizeIndex, onTogglePower, onCycleRoast, onCycleStyle, onDial,
  displayTime, blinkHour, blinkMinute, blinkAmPm, delayScheduled, onPressDelayBrew, onPressClock, onDialClick,
  brewing, armedSelector, roastLocked, styleLocked, sizeLocked, preGroundSelected,
  cleanFlash, keepWarmOn, editingDelay, editingClock,
  onPressPreGround, onPressClean, onPressKeepWarm,
}) {
  const wheelAccum = useRef(0)

  const handleWheel = (e) => {
    if (!on) return
    e.preventDefault()
    wheelAccum.current += e.deltaY
    const threshold = 40
    while (Math.abs(wheelAccum.current) >= threshold) {
      onDial(wheelAccum.current > 0 ? 1 : -1)
      wheelAccum.current += wheelAccum.current > 0 ? -threshold : threshold
    }
  }

  useEffect(() => {
    const handleKey = (e) => {
      if (!on) return
      if (e.key === 'ArrowUp') { e.preventDefault(); onDial(1) }
      else if (e.key === 'ArrowDown') { e.preventDefault(); onDial(-1) }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [on, onDial])

  // Backlit-group opacity: fully off (invisible) when unpowered.
  const backlit = { opacity: on ? 1 : 0, transition: 'opacity .2s' }
  // Add Water/Beans/Basket read as dimmed indicators even when lit.
  const backlitDim = { opacity: on ? 0.5 : 0, transition: 'opacity .2s' }

  // Pill underline colors — grey when off. Roast/Style stay white once
  // touched (blinking while that one is the actively-being-cycled control,
  // solid once a different action commits it). Pre-Ground and Roast are
  // mutually exclusive, so each greys the other's underline out while
  // selected. Clean/Keep Warm/Delay Brew/Clock stay grey-while-on until
  // their own trigger lights them, and never blink.
  const roastUnderline = !on || preGroundSelected ? GRAY : LIT_WHITE
  const roastUnderlineBlink = on && armedSelector === 'roast' && !preGroundSelected
  const styleUnderline = !on ? GRAY : LIT_WHITE
  const styleUnderlineBlink = on && armedSelector === 'style'
  const preGroundUnderline = on && preGroundSelected ? LIT_WHITE : GRAY
  const cleanUnderline = on && cleanFlash ? LIT_WHITE : GRAY
  const keepWarmUnderline = on && keepWarmOn ? LIT_WHITE : GRAY
  const delayUnderline = on && editingDelay ? LIT_WHITE : GRAY
  const clockUnderline = on && editingClock ? LIT_WHITE : GRAY

  return (
    <div className="panelwrap">
      <div className="panel" onWheel={handleWheel}>
        <div className="panel-shell">
          <img className="panel-texture" src={panelTexture} alt="" draggable={false} />
        </div>

        {/* ---- Roast (permanent button; cycles Light/Medium/Dark on press) ---- */}
        <Pill boxRect={ROAST_PILL} staticPill onClick={() => on && onCycleRoast()}>
          <PillLabel large underlineColor={roastUnderline} underlineBlink={roastUnderlineBlink}>Roast</PillLabel>
        </Pill>
        {ROAST_LEVELS.map((name, i) => {
          const active = roastIndex === i && !preGroundSelected
          const iconColor = active ? LIT_WHITE : ROAST_ICON_NEUTRAL[i]
          const textColor = active ? LIT_WHITE : GRAY
          const dimmed = (roastLocked || preGroundSelected) && !active
          const top = BEAN_ICON[1] + ROAST_ROW_SPACING * i - (ROAST_ROW_H - BEAN_ICON[3]) / 2
          return (
            <div key={name} className="cm-option-row" style={{ ...box(BEAN_ICON[0], top, 150, ROAST_ROW_H), gap: 11, transition: 'opacity .2s', opacity: !on ? 0 : dimmed ? 0.2 : 1 }}>
              <div className="cm-option-icon" style={{ width: BEAN_ICON[2], height: BEAN_ICON[3] }}><BeanIcon color={iconColor} /></div>
              <span className="cm-option-label" style={{ color: textColor }}>{name}</span>
            </div>
          )
        })}

        {/* ---- Style (permanent button; cycles Regular/Bold/Over Ice/Cold Brew) ---- */}
        <Pill boxRect={STYLE_PILL} staticPill onClick={() => on && onCycleStyle()}>
          <PillLabel large underlineColor={styleUnderline} underlineBlink={styleUnderlineBlink}>Style</PillLabel>
        </Pill>
        {STYLES.map((name, i) => {
          const active = styleIndex === i
          const color = active ? LIT_WHITE : GRAY
          const dimmed = styleLocked && !active
          const iconBox = i < 2 ? MUG_ICON : GLASS_ICON
          const icon = i === 0 ? <MugIcon variant="regular" color={color} />
            : i === 1 ? <MugIcon variant="bold" color={color} />
            : i === 2 ? <GlassIcon variant="overice" color={color} />
            : <GlassIcon variant="coldbrew" color={color} />
          const top = iconBox[1] + STYLE_ROW_SPACING * (i < 2 ? i : i - 2) - (STYLE_ROW_H - iconBox[3]) / 2
          return (
            <div key={name} className="cm-option-row" style={{ ...box(iconBox[0], top, 150, STYLE_ROW_H), gap: 11, transition: 'opacity .2s', opacity: !on ? 0 : dimmed ? 0.2 : 1 }}>
              <div className="cm-option-icon" style={{ width: iconBox[2], height: iconBox[3] }}>{icon}</div>
              <span className="cm-option-label" style={{ color }}>{name}</span>
            </div>
          )
        })}

        {/* ---- Cup size (dial-driven, positions 0-4 of the single ring) ---- */}
        {CUP_SIZES.map((size, i) => {
          const active = sizeIndex === i
          const color = active ? LIT_WHITE : GRAY
          const dimmed = sizeLocked && !active
          const iconBox = CUP_ICON_BOX[size]
          const slot = CUP_SLOT[size]
          return (
            <div key={size} className="cm-cup" style={{ ...box(...slot), transition: 'opacity .2s', opacity: !on ? 0 : dimmed ? 0.2 : 1 }}>
              <div style={{ width: iconBox[2], height: iconBox[3] }}><CupIcon size={size} color={color} /></div>
              <span className="cm-cup-label" style={{ color }}>{size}<span className="cm-cup-oz">oz</span></span>
            </div>
          )
        })}

        {/* ---- Reservoir gauge (dial-driven, positions 5-8 of the single ring) ---- */}
        {WATER_LEVELS.map((label, i) => {
          const active = sizeIndex === CUP_SIZES.length + i
          const color = active ? LIT_WHITE : GRAY
          const dimmed = sizeLocked && !active
          return (
            <div key={label} className="cm-kettle" style={{ ...box(...KETTLE_SLOT[i]), transition: 'opacity .2s', opacity: !on ? 0 : dimmed ? 0.2 : 1 }}>
              <div style={{ width: KETTLE_ICON_BOX[i][2], height: KETTLE_ICON_BOX[i][3] }}><KettleIcon level={i} color={color} /></div>
              <span className="cm-kettle-label" style={{ color }}>{label}</span>
            </div>
          )
        })}

        {/* ---- Power (permanent; always visible so you can turn it on) ---- */}
        <div className="cm-power cm-hit" style={box(...POWER_BOX)} onClick={onTogglePower}>
          <div className="cm-power-inner" />
          <div className="cm-power-icon"><PowerIcon /></div>
        </div>

        {/* ---- Pre-Ground (alternative to picking a roast level; selecting
             it dims all three roast options to 20%) ---- */}
        <Pill boxRect={PREGROUND_PILL} staticPill onClick={() => on && onPressPreGround()}>
          <PillLabel underlineColor={preGroundUnderline}>Pre-Ground</PillLabel>
        </Pill>

        {/* ---- Add Water / Add Beans / Empty Basket (backlit indicators) ---- */}
        <div className="cm-caption-2l" style={{ ...box(...ADD_WATER_SLOT), ...backlitDim }}>Add<br />Water</div>
        <div className="cm-caption-2l" style={{ ...box(...ADD_BEANS_SLOT), ...backlitDim }}>Add<br />Beans</div>
        <div className="cm-caption-2l" style={{ ...box(...EMPTY_BASKET_SLOT), ...backlitDim }}>Empty<br />Basket</div>

        {/* ---- Clean / Keep Warm (press flashes the underline pill white
             for 5 seconds) ---- */}
        <Pill boxRect={CLEAN_PILL} side="left" staticPill onClick={() => on && onPressClean()}>
          <PillLabel underlineColor={cleanUnderline}>Clean</PillLabel>
        </Pill>
        <Pill boxRect={KEEPWARM_PILL} side="right" staticPill onClick={() => on && onPressKeepWarm()}>
          <PillLabel underlineColor={keepWarmUnderline}>Keep Warm</PillLabel>
        </Pill>

        {/* ---- Delay Brew / Clock (permanent chrome; press to arm hour/minute
             editing on the dial — see onPressDelayBrew/onPressClock) ---- */}
        <Pill boxRect={DELAYBREW_PILL} side="left" onClick={() => on && onPressDelayBrew()}>
          <PillLabel underlineColor={delayUnderline}>Delay Brew</PillLabel>
        </Pill>
        <Pill boxRect={CLOCK_PILL} side="right" onClick={() => on && onPressClock()}>
          <PillLabel underlineColor={clockUnderline}>Clock</PillLabel>
        </Pill>

        {/* ---- Dial: metal ring + face are permanent (physical hardware);
             everything printed/lit on the face is backlit. Scroll or
             Up/Down arrows cycle cup size + carafe level together — or, while
             setting the clock/delay brew, adjust whichever of hour/minute is
             currently blinking. Clicking the dial confirms that step. ---- */}
        <div className="cm-dial cm-hit" style={box(...DIAL_BOX)} onClick={() => on && onDialClick()}>
          <img className="cm-dial-layer" style={box(...DIAL_METAL_BOX)} src={dialMetal} alt="" draggable={false} />
          <img className="cm-dial-layer" style={box(...DIAL_FACE_INNER_BOX)} src={dialFace} alt="" draggable={false} />
          <img className="cm-dial-layer" style={box(...DIAL_FACE_INNER_BOX)} src={dialFaceGlow} alt="" draggable={false} />
          <img className="cm-dial-layer" style={box(...DIAL_RING_OUTLINE_BOX)} src={dialRingOutline} alt="" draggable={false} />
          {brewing && (
            <div className="cm-dial-layer cm-dial-brew-ring" style={box(...DIAL_RING_OUTLINE_BOX)}>
              <DialBrewRing />
            </div>
          )}
          <div style={{ ...box(0, 0, 144.24, 143.98), ...backlit }}>
            <div className="cm-dial-digits-wrap" style={box(...DIAL_FACE_INNER_BOX)}>
              <span className={'cm-dial-digits' + (blinkHour ? ' cm-blink' : '')}>{pad2(displayTime.h)}</span>
              <span className="cm-dial-digits">:</span>
              <span className={'cm-dial-digits' + (blinkMinute ? ' cm-blink' : '')}>{pad2(displayTime.m)}</span>
            </div>
            <div className="cm-dial-ampm-wrap" style={box(...DIAL_AMPM_BOX)}>
              {['AM', 'PM'].map((label) => {
                const lit = displayTime.ampm === label
                return (
                  <span key={label} className={'cm-dial-ampm' + (lit ? ' cm-dial-ampm-lit' : '') + (lit && blinkAmPm ? ' cm-blink' : '')}>
                    {label}
                  </span>
                )
              })}
            </div>
            <div className="cm-dial-caption" style={{ ...box(...DIAL_CAPTION_BOX), opacity: delayScheduled ? 1 : 0 }}>Delay Brew Scheduled</div>
            <img className="cm-dial-layer" style={box(...DIAL_DRIPSTOP_BOX)} src={dialDripstop} alt="" draggable={false} />
            <div className="cm-dial-layer" style={box(0, 0, 144.24, 143.98)}><StartStopLabel /></div>
          </div>
        </div>

        {/* ---- Cuisinart wordmark on the brushed-steel base plate (permanent) ---- */}
        <div className="cm-logo" style={box(...LOGO_BOX)}><CuisinartLogo /></div>
      </div>
    </div>
  )
}
