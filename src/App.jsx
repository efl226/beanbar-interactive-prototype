import { useState, useCallback, useRef } from 'react'
import Panel, { ROAST_LEVELS, STYLES, CUP_SIZES, SIZE_RING_LENGTH } from './components/Panel.jsx'

const wrap = (v, lo, hi) => (v > hi ? lo : v < lo ? hi : v)

// 12-hour {h,m,ampm} <-> minutes-since-midnight, used only by the
// "continuous" clock-setting mode to cycle the whole 24h day in one pass.
const to24 = ({ h, m, ampm }) => (h % 12) * 60 + m + (ampm === 'PM' ? 720 : 0)
const from24 = (total) => {
  const t = ((total % 1440) + 1440) % 1440
  const h24 = Math.floor(t / 60)
  const m = t % 60
  const h = h24 % 12 === 0 ? 12 : h24 % 12
  return { h, m, ampm: h24 >= 12 ? 'PM' : 'AM' }
}

export default function App() {
  const [on, setOn] = useState(false)
  const [roastIndex, setRoastIndex] = useState(1)  // Medium
  const [styleIndex, setStyleIndex] = useState(2)  // Over Ice
  const [sizeIndex, setSizeIndex] = useState(2)    // 12oz

  // Two testable clock-setting behaviors, switched via the tabs above the
  // panel: 'stepped' arms hour, then minute, then AM/PM as three separate
  // dial-confirmed steps. 'continuous' is a single step that cycles the
  // whole 24h day in 15-minute increments (so e.g. going from 1:00 AM to
  // 1:00 PM means dialing all the way around, not jumping AM/PM directly).
  const [clockMode, setClockMode] = useState('stepped') // 'stepped' | 'continuous'

  // Clock + Delay Brew share one editing flow: press a pill to arm the
  // first step (blinking), dial to adjust, click the dial to confirm and
  // move to the next step, ending on a final dial click. Both start at
  // 00:00 AM until set; the display always shows the persistent clock
  // except while actively setting clock or delay brew.
  const [clock, setClock] = useState({ h: 0, m: 0, ampm: 'AM' })
  const [delay, setDelay] = useState({ h: 0, m: 0, ampm: 'AM' })
  const [delayScheduled, setDelayScheduled] = useState(false)
  const [editing, setEditing] = useState(null)    // null | 'clock' | 'delay'
  const [editPart, setEditPart] = useState(null)  // null | 'hour' | 'minute' | 'ampm' | 'time'

  const onSelectClockMode = useCallback((mode) => {
    setClockMode(mode)
    setEditing(null)
    setEditPart(null)
  }, [])

  // Brewing: clicking the dial while not editing clock/delay starts a brew
  // (only once roast, style and size are all selected), showing a pulsing
  // ring for a fixed 5s demo duration.
  const [brewing, setBrewing] = useState(false)
  const brewTimeoutRef = useRef(null)
  const brewedCarafeRef = useRef(false) // was a carafe (not single-serve) size selected when this brew started

  // Pill underline state. armedSelector is whichever of roast/style was most
  // recently pressed and hasn't yet been "committed" by a different action —
  // that one's underline blinks; any previously-touched one goes solid white.
  // *Locked flags gate the option rows' 20% dim-the-rest-of-the-group look,
  // and reset (along with everything else here) when a brew finishes or the
  // machine powers off.
  const [armedSelector, setArmedSelector] = useState(null) // null | 'roast' | 'style'
  const [roastLocked, setRoastLocked] = useState(false)
  const [styleLocked, setStyleLocked] = useState(false)
  const [sizeLocked, setSizeLocked] = useState(false)
  const [preGroundSelected, setPreGroundSelected] = useState(false)
  const [cleanFlash, setCleanFlash] = useState(false)
  const cleanTimeoutRef = useRef(null)

  // Keep Warm can't be turned on by pressing it — it only comes on by
  // itself after a completed carafe brew (1/4-Full, not a single-serve cup
  // size). From there the only manual action available is turning it back
  // off, and even that's blocked while Clean is running.
  const [keepWarmOn, setKeepWarmOn] = useState(false)

  // Re-arming a different selector (or clearing to null) is the "confirm"
  // moment for whichever of roast/style was previously armed — that's when
  // its pill stops blinking AND its option row dimming kicks in. Re-pressing
  // the *same* one just keeps it blinking/uncommitted.
  const armSelector = useCallback((next) => {
    if (armedSelector === 'roast' && next !== 'roast') setRoastLocked(true)
    if (armedSelector === 'style' && next !== 'style') setStyleLocked(true)
    setArmedSelector(next)
  }, [armedSelector])

  const resetSelectionState = () => {
    setArmedSelector(null)
    setRoastLocked(false)
    setStyleLocked(false)
    setSizeLocked(false)
    setPreGroundSelected(false)
    clearTimeout(cleanTimeoutRef.current)
    setCleanFlash(false)
  }

  const onTogglePower = useCallback(() => {
    setOn((v) => !v)
    clearTimeout(brewTimeoutRef.current)
    setBrewing(false)
    setKeepWarmOn(false)
    setEditing(null)
    setEditPart(null)
    resetSelectionState()
  }, [])

  const onCycleRoast = useCallback(() => {
    setRoastIndex((i) => (i + 1) % ROAST_LEVELS.length)
    setPreGroundSelected(false)
    armSelector('roast')
  }, [armSelector])

  const onCycleStyle = useCallback(() => {
    setStyleIndex((i) => (i + 1) % STYLES.length)
    armSelector('style')
  }, [armSelector])

  const onPressPreGround = useCallback(() => {
    setPreGroundSelected(true)
    armSelector(null)
  }, [armSelector])

  const onPressClean = useCallback(() => {
    armSelector(null)
    setCleanFlash(true)
    clearTimeout(cleanTimeoutRef.current)
    cleanTimeoutRef.current = setTimeout(() => setCleanFlash(false), 5000)
  }, [armSelector])

  // Keep Warm has no manual "on" — pressing it can only turn it off, and
  // only when Clean isn't currently running.
  const onPressKeepWarm = useCallback(() => {
    if (cleanFlash) return
    setKeepWarmOn(false)
  }, [cleanFlash])

  const onPressDelayBrew = useCallback(() => {
    if (editing !== null) return // ignore while already mid-edit of something
    armSelector(null)
    setEditing('delay')
    setEditPart(clockMode === 'continuous' ? 'time' : 'hour')
    setDelay((d) => (d.h ? d : { h: 1, m: d.m || 1, ampm: d.ampm || 'AM' }))
    setDelayScheduled(false)
  }, [editing, armSelector, clockMode])

  const onPressClock = useCallback(() => {
    if (editing !== null) return
    armSelector(null)
    setEditing('clock')
    setEditPart(clockMode === 'continuous' ? 'time' : 'hour')
    setClock((c) => (c.h ? c : { h: 1, m: c.m || 1, ampm: c.ampm || 'AM' }))
  }, [editing, armSelector, clockMode])

  const onDial = useCallback((dir) => {
    if (editing === 'clock' || editing === 'delay') {
      const setter = editing === 'clock' ? setClock : setDelay
      if (clockMode === 'continuous') {
        setter((t) => from24(to24(t) + (dir > 0 ? 15 : -15)))
      } else {
        setter((t) => {
          if (editPart === 'hour') return { ...t, h: wrap(t.h + dir, 1, 12) }
          if (editPart === 'minute') return { ...t, m: wrap(t.m + dir, 1, 60) }
          return { ...t, ampm: dir > 0 ? 'PM' : 'AM' }
        })
      }
    } else {
      setSizeIndex((i) => (i + dir + SIZE_RING_LENGTH) % SIZE_RING_LENGTH)
      setSizeLocked(true)
      armSelector(null)
    }
  }, [editing, editPart, clockMode, armSelector])

  const canBrew = (roastLocked || preGroundSelected) && styleLocked && sizeLocked

  const onDialClick = useCallback(() => {
    if (!editing) {
      armSelector(null)
      if (!canBrew) return
      brewedCarafeRef.current = sizeIndex >= CUP_SIZES.length
      setBrewing(true)
      clearTimeout(brewTimeoutRef.current)
      brewTimeoutRef.current = setTimeout(() => {
        setBrewing(false)
        if (brewedCarafeRef.current) setKeepWarmOn(true)
        resetSelectionState()
      }, 5000)
      return
    }
    if (clockMode === 'continuous') {
      if (editing === 'delay') setDelayScheduled(true)
      setEditing(null)
      setEditPart(null)
      return
    }
    if (editPart === 'hour') {
      setEditPart('minute')
    } else if (editPart === 'minute') {
      setEditPart('ampm')
    } else {
      if (editing === 'delay') setDelayScheduled(true)
      setEditing(null)
      setEditPart(null)
    }
  }, [editing, editPart, canBrew, sizeIndex, armSelector, clockMode])

  const displayTime = editing === 'delay' ? delay : clock

  return (
    <div className="pp">
      <div className="pp-center">
        <div className="brand">
          <h1>BeanBar<b>.</b></h1>
          <span className="tag">console</span>
        </div>
        <div className="clock-mode-tabs">
          <button
            type="button"
            className={'clock-mode-tab' + (clockMode === 'stepped' ? ' active' : '')}
            onClick={() => onSelectClockMode('stepped')}
          >
            Version 1 · Hour → Min → AM/PM
          </button>
          <button
            type="button"
            className={'clock-mode-tab' + (clockMode === 'continuous' ? ' active' : '')}
            onClick={() => onSelectClockMode('continuous')}
          >
            Version 2 · 24h Continuous Dial
          </button>
        </div>
        <Panel
          on={on}
          roastIndex={roastIndex}
          styleIndex={styleIndex}
          sizeIndex={sizeIndex}
          onTogglePower={onTogglePower}
          onCycleRoast={onCycleRoast}
          onCycleStyle={onCycleStyle}
          onDial={onDial}
          displayTime={displayTime}
          blinkHour={editing !== null && (editPart === 'hour' || editPart === 'time')}
          blinkMinute={editing !== null && (editPart === 'minute' || editPart === 'time')}
          blinkAmPm={editing !== null && (editPart === 'ampm' || editPart === 'time')}
          delayScheduled={delayScheduled}
          onPressDelayBrew={onPressDelayBrew}
          onPressClock={onPressClock}
          onDialClick={onDialClick}
          brewing={brewing}
          armedSelector={armedSelector}
          roastLocked={roastLocked}
          styleLocked={styleLocked}
          sizeLocked={sizeLocked}
          preGroundSelected={preGroundSelected}
          cleanFlash={cleanFlash}
          keepWarmOn={keepWarmOn}
          editingDelay={editing === 'delay'}
          editingClock={editing === 'clock'}
          onPressPreGround={onPressPreGround}
          onPressClean={onPressClean}
          onPressKeepWarm={onPressKeepWarm}
        />
      </div>
    </div>
  )
}
