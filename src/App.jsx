import { useState, useCallback, useRef } from 'react'
import Panel, { ROAST_LEVELS, STYLES, CUP_SIZES, SIZE_RING_LENGTH } from './components/Panel.jsx'

const wrap = (v, lo, hi) => (v > hi ? lo : v < lo ? hi : v)

export default function App() {
  const [on, setOn] = useState(false)
  const [roastIndex, setRoastIndex] = useState(1)  // Medium
  const [styleIndex, setStyleIndex] = useState(2)  // Over Ice
  const [sizeIndex, setSizeIndex] = useState(2)    // 12oz

  // Clock + Delay Brew share one editing flow: press a pill to arm hour
  // (blinking), dial to adjust 1-12, click the dial to confirm and move to
  // minute (blinking), dial to adjust 1-60, click the dial to confirm and
  // move to AM/PM (blinking the lit half), dial to flip it, click the dial
  // to finish. Both start at 00:00 AM until set; the display always shows
  // the persistent clock except while actively setting clock or delay brew.
  const [clock, setClock] = useState({ h: 0, m: 0, ampm: 'AM' })
  const [delay, setDelay] = useState({ h: 0, m: 0, ampm: 'AM' })
  const [delayScheduled, setDelayScheduled] = useState(false)
  const [editing, setEditing] = useState(null)    // null | 'clock' | 'delay'
  const [editPart, setEditPart] = useState(null)  // null | 'hour' | 'minute' | 'ampm'

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
    setEditPart('hour')
    setDelay((d) => (d.h ? d : { h: 1, m: d.m || 1, ampm: d.ampm || 'AM' }))
    setDelayScheduled(false)
  }, [editing, armSelector])

  const onPressClock = useCallback(() => {
    if (editing !== null) return
    armSelector(null)
    setEditing('clock')
    setEditPart('hour')
    setClock((c) => (c.h ? c : { h: 1, m: c.m || 1, ampm: c.ampm || 'AM' }))
  }, [editing, armSelector])

  const onDial = useCallback((dir) => {
    if (editing === 'clock' || editing === 'delay') {
      const setter = editing === 'clock' ? setClock : setDelay
      setter((t) => {
        if (editPart === 'hour') return { ...t, h: wrap(t.h + dir, 1, 12) }
        if (editPart === 'minute') return { ...t, m: wrap(t.m + dir, 1, 60) }
        return { ...t, ampm: dir > 0 ? 'PM' : 'AM' }
      })
    } else {
      setSizeIndex((i) => (i + dir + SIZE_RING_LENGTH) % SIZE_RING_LENGTH)
      setSizeLocked(true)
      armSelector(null)
    }
  }, [editing, editPart, armSelector])

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
    if (editPart === 'hour') {
      setEditPart('minute')
    } else if (editPart === 'minute') {
      setEditPart('ampm')
    } else {
      if (editing === 'delay') setDelayScheduled(true)
      setEditing(null)
      setEditPart(null)
    }
  }, [editing, editPart, canBrew, sizeIndex, armSelector])

  const displayTime = editing === 'delay' ? delay : clock

  return (
    <div className="pp">
      <div className="pp-center">
        <div className="brand">
          <h1>BeanBar<b>.</b></h1>
          <span className="tag">console</span>
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
          blinkHour={editing !== null && editPart === 'hour'}
          blinkMinute={editing !== null && editPart === 'minute'}
          blinkAmPm={editing !== null && editPart === 'ampm'}
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
