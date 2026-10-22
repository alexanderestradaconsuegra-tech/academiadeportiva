"use client"
import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { usePresentationMode } from "@/lib/usePresentationMode"
import { Hand, Route, Zap, Circle, Eraser, Undo2, Maximize2, Grid3x3, Play, Square, Save, Plus, Users, Check, Trash2 } from "lucide-react"
import AppShell from "@/components/layout/AppShell"
import { useApp } from "@/context/AppContext"
import { supabase } from "@/lib/supabase"
import type { Category, Position } from "@/lib/types"

// ── Types ──────────────────────────────────────────────────────────────────────
type Team = "home" | "away" | "ball"
type Format = "7" | "11"
interface Marker { id: string; x: number; y: number; team: Team; label?: string; player_id?: string }
interface TLine  { id: string; type: "run" | "pass"; pts: [number,number][] }
interface Play   { id: string; name: string; format: Format; category: Category | null; markers: Marker[]; lines: TLine[] }
type Tool = "move" | "run" | "pass" | "home" | "away" | "ball" | "erase"

const BALL_SPEED = 0.09   // pitch-units per ms — a struck pass, at "Rápida" (1x)
const RUN_SPEED  = 0.035  // pitch-units per ms — a player run (slower than the ball), at "Rápida" (1x)
const MIN_SEG_MS = 300    // floor so very short taps/runs are still visible
const HIT_R      = 4.5    // SVG units for hit detection, at fútbol-11 scale

type SpeedTier = "1x" | "2x" | "3x"
const SPEED_MULT: Record<SpeedTier, number> = { "1x": 0.35, "2x": 0.7, "3x": 1.05 }

function pathLength(pts: [number,number][]): number {
  return pts.slice(1).reduce((s,p,i) => s + Math.hypot(p[0]-pts[i][0], p[1]-pts[i][1]), 0)
}

function uid()  { return Math.random().toString(36).slice(2, 9) }

function pathAt(pts: [number,number][], t: number): [number,number] {
  if (pts.length < 2) return pts[0]
  const lens = pts.slice(1).map((p,i) => Math.hypot(p[0]-pts[i][0], p[1]-pts[i][1]))
  const total = lens.reduce((s,d)=>s+d, 0)
  if (total === 0) return pts[0]
  let rem = Math.min(t,1) * total
  for (let i=0; i<lens.length; i++) {
    if (rem <= lens[i]+1e-9 || i===lens.length-1) {
      const f = lens[i]>0 ? Math.min(rem/lens[i],1) : 1
      return [pts[i][0]+(pts[i+1][0]-pts[i][0])*f, pts[i][1]+(pts[i+1][1]-pts[i][1])*f]
    }
    rem -= lens[i]
  }
  return pts[pts.length-1]
}

// ── Formations ─────────────────────────────────────────────────────────────────
const DIMS: Record<Format, { w: number; h: number }> = {
  "11": { w: 105, h: 68 },
  "7":  { w: 64,  h: 42 },
}

const FMTS11: Record<string,{x:number;y:number}[]> = {
  "4-3-3":   [{x:5,y:34},{x:20,y:9},{x:20,y:24},{x:20,y:44},{x:20,y:59},{x:40,y:17},{x:40,y:34},{x:40,y:51},{x:60,y:12},{x:60,y:34},{x:60,y:56}],
  "4-4-2":   [{x:5,y:34},{x:20,y:9},{x:20,y:24},{x:20,y:44},{x:20,y:59},{x:44,y:9},{x:44,y:27},{x:44,y:41},{x:44,y:59},{x:66,y:24},{x:66,y:44}],
  "3-5-2":   [{x:5,y:34},{x:20,y:17},{x:20,y:34},{x:20,y:51},{x:36,y:5},{x:40,y:20},{x:40,y:34},{x:40,y:48},{x:36,y:63},{x:64,y:24},{x:64,y:44}],
  "4-2-3-1": [{x:5,y:34},{x:19,y:9},{x:19,y:24},{x:19,y:44},{x:19,y:59},{x:36,y:24},{x:36,y:44},{x:52,y:12},{x:52,y:34},{x:52,y:56},{x:68,y:34}],
}

// Fútbol 7: GK + 6 outfield players, common youth-academy shapes
const FMTS7: Record<string,{x:number;y:number}[]> = {
  "3-2-1": [{x:6,y:21},{x:18,y:7},{x:18,y:21},{x:18,y:35},{x:36,y:13},{x:36,y:29},{x:50,y:21}],
  "2-3-1": [{x:6,y:21},{x:18,y:12},{x:18,y:30},{x:34,y:6},{x:34,y:21},{x:34,y:36},{x:50,y:21}],
  "2-2-2": [{x:6,y:21},{x:18,y:12},{x:18,y:30},{x:34,y:12},{x:34,y:30},{x:48,y:12},{x:48,y:30}],
  "3-1-2": [{x:6,y:21},{x:18,y:7},{x:18,y:21},{x:18,y:35},{x:34,y:21},{x:48,y:10},{x:48,y:32}],
}

const CATEGORIES: Category[] = ["Sub-10","Sub-12","Sub-14","Sub-16","Sub-18","Juvenil","Senior"]

// ── Zones: thirds (defensive→attacking) and channels (wing→half-space→center) ──
const THIRDS   = ["Defensiva","Media","Ofensiva"] as const
const CHANNELS = ["Banda Izq","Medio Izq","Centro","Medio Der","Banda Der"] as const
type Third = typeof THIRDS[number]
type Channel = typeof CHANNELS[number]

function zoneOf(x:number, y:number, dims:{w:number;h:number}): { third: Third; channel: Channel } {
  const third = THIRDS[Math.min(2, Math.floor((x/dims.w)*3))]
  const channel = CHANNELS[Math.min(4, Math.floor((y/dims.h)*5))]
  return { third, channel }
}

// Defensive→attacking rank used to auto-fill real players into formation slots
const POS_RANK: Partial<Record<Position, number>> = {
  "Defensa Central": 1, "Lateral Derecho": 1, "Lateral Izquierdo": 1,
  "Mediocampista Defensivo": 2, "Mediocampista Central": 2,
  "Mediocampista Ofensivo": 3, "Extremo Derecho": 3, "Extremo Izquierdo": 3,
  "Delantero Centro": 4, "Segundo Delantero": 4,
}

// ── Pitch lines ────────────────────────────────────────────────────────────────
function Pitch11SVG() {
  const s="rgba(255,255,255,0.5)", w=0.35
  return (
    <g stroke={s} strokeWidth={w} fill="none">
      <rect x="2" y="2" width="101" height="64"/>
      <line x1="52.5" y1="2" x2="52.5" y2="66"/>
      <circle cx="52.5" cy="34" r="9.15"/>
      <circle cx="52.5" cy="34" r="0.6" fill={s}/>
      <rect x="2"    y="13.84" width="16.5" height="40.32"/>
      <rect x="2"    y="24.84" width="5.5"  height="18.32"/>
      <rect x="0.3"  y="29.68" width="1.7"  height="8.64"/>
      <circle cx="11" cy="34" r="0.5" fill={s}/>
      <path d="M18.5,26.2 A9.15,9.15 0 0 1 18.5,41.8" strokeDasharray="1.8 1"/>
      <rect x="86.5" y="13.84" width="16.5" height="40.32"/>
      <rect x="97.5" y="24.84" width="5.5"  height="18.32"/>
      <rect x="103"  y="29.68" width="1.7"  height="8.64"/>
      <circle cx="94" cy="34" r="0.5" fill={s}/>
      <path d="M86.5,26.2 A9.15,9.15 0 0 0 86.5,41.8" strokeDasharray="1.8 1"/>
      <path d="M2,4   A2,2 0 0 1 4,2"/>
      <path d="M101,2 A2,2 0 0 1 103,4"/>
      <path d="M103,64 A2,2 0 0 1 101,66"/>
      <path d="M4,66  A2,2 0 0 1 2,64"/>
    </g>
  )
}

function Pitch7SVG() {
  const s="rgba(255,255,255,0.5)", w=0.3
  return (
    <g stroke={s} strokeWidth={w} fill="none">
      <rect x="2" y="2" width="60" height="38"/>
      <line x1="32" y1="2" x2="32" y2="40"/>
      <circle cx="32" cy="21" r="6"/>
      <circle cx="32" cy="21" r="0.5" fill={s}/>
      <rect x="2" y="9" width="10" height="24"/>
      <circle cx="9" cy="21" r="0.4" fill={s}/>
      <path d="M12,15.5 A6,6 0 0 1 12,26.5" strokeDasharray="1.5 0.8"/>
      <rect x="52" y="9" width="10" height="24"/>
      <circle cx="55" cy="21" r="0.4" fill={s}/>
      <path d="M52,15.5 A6,6 0 0 0 52,26.5" strokeDasharray="1.5 0.8"/>
    </g>
  )
}

function ZoneGrid({ dims }: { dims: { w: number; h: number } }) {
  const { w, h } = dims
  const s = "rgba(167,139,250,0.55)"
  return (
    <g>
      <g stroke={s} strokeWidth={0.25} strokeDasharray="1.4 1.2">
        <line x1={w/3}   y1={0} x2={w/3}   y2={h} />
        <line x1={2*w/3} y1={0} x2={2*w/3} y2={h} />
        <line x1={0} y1={h/5}   x2={w} y2={h/5} />
        <line x1={0} y1={2*h/5} x2={w} y2={2*h/5} />
        <line x1={0} y1={3*h/5} x2={w} y2={3*h/5} />
        <line x1={0} y1={4*h/5} x2={w} y2={4*h/5} />
      </g>
      <g fill={s} fontSize={h*0.045} fontWeight="bold" textAnchor="middle">
        <text x={w/6}     y={h-1}>Defensiva</text>
        <text x={w/2}     y={h-1}>Media</text>
        <text x={5*w/6}   y={h-1}>Ofensiva</text>
      </g>
    </g>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function TacticsPage() {
  const { players, teamSettings, currentUser } = useApp()
  const isCoach = currentUser?.role === "coach"
  const academyId = teamSettings?.id ?? null

  // ── Edit state (source of truth — never modified during animation)
  const [markers, setMarkers] = useState<Marker[]>([])
  const [lines,   setLines]   = useState<TLine[]>([])
  const [tool,    setTool]    = useState<Tool>("move")
  const [drawing, setDrawing] = useState<[number,number][]|null>(null)
  const [dragging,setDragging]= useState<string|null>(null)
  const [playName,setPlayName]= useState("Nueva jugada")
  const [plays,   setPlays]   = useState<Play[]>([])
  const [activeId,setActiveId]= useState<string|null>(null)
  const [format,  setFormat]  = useState<Format>("11")
  const [category,setCategory]= useState<Category | null>(null)
  const [formationKey, setFormationKey] = useState<string>("4-3-3")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [showZones, setShowZones] = useState(false)
  const [speedTier, setSpeedTier] = useState<SpeedTier>("1x")

  const roster = useMemo(() => category ? players.filter(p => p.category === category) : players, [players, category])

  // ── Undo history ─────────────────────────────────────────────────────────
  const histRef = useRef<{markers:Marker[];lines:TLine[]}[]>([])
  const [undoCount, setUndoCount] = useState(0)
  function pushHistory(m:Marker[],l:TLine[]){
    histRef.current=[...histRef.current.slice(-29),{markers:m,lines:l}]
    setUndoCount(histRef.current.length)
  }
  function undo(){
    const h=histRef.current; if(!h.length) return
    const prev=h[h.length-1]; histRef.current=h.slice(0,-1)
    setUndoCount(histRef.current.length)
    setMarkers(prev.markers); setLines(prev.lines)
  }

  // Short-lived message on the pitch ("start the run on a player", "saved").
  const [notice, setNotice] = useState("")
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  function flash(msg: string) {
    setNotice(msg)
    clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(""), 3500)
  }

  // What was last saved/opened, to warn before throwing away unsaved work.
  const savedRef = useRef("")

  // ── Animation state (overlaid on top, never touches edit state)
  const [animPos,  setAnimPos]  = useState<Record<string,[number,number]>|null>(null)
  const [animBall, setAnimBall] = useState<[number,number]|null>(null)
  const [playing,  setPlaying]  = useState(false)
  const [passStep, setPassStep] = useState(-1)
  const [activeStep, setActiveStep] = useState(-1) // index into `lines` of whatever step (pass OR run) is currently playing
  const rafRef = useRef(0)

  const dims = DIMS[format]
  // Fútbol 7's pitch is drawn in a smaller viewBox (64 vs 105 units wide), so
  // marker/ball sizes and hit-testing radius scale down with it — otherwise
  // discs sized for the 11-a-side pitch look oversized on the smaller one.
  const scale = dims.w / 105
  const hitR = HIT_R * scale

  // ── Zone analysis ─────────────────────────────────────────────────────────
  const zoneAnalysis = useMemo(() => lines.map(l => ({
    id: l.id,
    type: l.type,
    start: zoneOf(l.pts[0][0], l.pts[0][1], dims),
    end: zoneOf(l.pts[l.pts.length-1][0], l.pts[l.pts.length-1][1], dims),
  })), [lines, dims])

  const zoneInsights = useMemo(() => {
    if (zoneAnalysis.length === 0) return []
    const msgs: string[] = []
    const touched = new Set(zoneAnalysis.flatMap(z => [z.start.channel, z.end.channel]))
    if (!touched.has("Banda Izq") && !touched.has("Banda Der")) {
      msgs.push("⚠️ La jugada no usa las bandas — todo pasa por el medio.")
    }
    const channelCounts: Record<string, number> = {}
    zoneAnalysis.forEach(z => {
      channelCounts[z.start.channel] = (channelCounts[z.start.channel] ?? 0) + 1
      channelCounts[z.end.channel]   = (channelCounts[z.end.channel]   ?? 0) + 1
    })
    const total = zoneAnalysis.length * 2
    const top = Object.entries(channelCounts).sort((a,b)=>b[1]-a[1])[0]
    if (top && top[1] / total >= 0.6) {
      msgs.push(`📍 La jugada se concentra en el carril "${top[0]}".`)
    }
    if (zoneAnalysis.some(z => z.start.third === "Defensiva" && z.end.third === "Ofensiva")) {
      msgs.push("🚀 Progresión directa: de zona defensiva a ofensiva.")
    }
    return msgs
  }, [zoneAnalysis])

  // A board that opens empty leaves a new coach not knowing where to start:
  // open with the default formation and the ball on the centre spot.
  function seedMarkers(f: Format, key: string): Marker[] {
    const dict = f === "11" ? FMTS11 : FMTS7
    const d = DIMS[f]
    return [
      ...(dict[key] ?? []).map((p, i) => ({ id: uid(), x: p.x, y: p.y, team: "home" as Team, label: i === 0 ? "P" : String(i) })),
      { id: uid(), x: d.w / 2, y: d.h / 2, team: "ball" as Team },
    ]
  }
  function snapshotOf(m: Marker[], l: TLine[], name: string) { return JSON.stringify({ m, l, name }) }
  const dirty = (markers.length > 0 || lines.length > 0) && snapshotOf(markers, lines, playName) !== savedRef.current
  function confirmDiscard(): boolean {
    return !dirty || window.confirm("Tienes cambios sin guardar en esta jugada. ¿Continuar y descartarlos?")
  }

  useEffect(() => {
    const seeded = seedMarkers("11", "4-3-3")
    setMarkers(seeded)
    savedRef.current = snapshotOf(seeded, [], "Nueva jugada")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") { e.preventDefault(); undo() }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── DB load/save ──────────────────────────────────────────────────────────
  const loadPlays = useCallback(async () => {
    if (!academyId) return
    const { data, error: err } = await (supabase as any)
      .from("tactic_plays")
      .select("*")
      .eq("academy_id", academyId)
      .order("updated_at", { ascending: false })
    if (err) { setError("No se pudieron cargar las jugadas guardadas."); return }
    if (data) setPlays(data.map((r: any): Play => ({
      id: r.id, name: r.name, format: r.format, category: r.category, markers: r.markers ?? [], lines: r.lines ?? [],
    })))
  }, [academyId])

  useEffect(() => { loadPlays() }, [loadPlays])

  // ── SVG coords ────────────────────────────────────────────────────────────
  // Pantalla completa para mostrarle el tablero al equipo en la cancha.
  const presentation = usePresentationMode<HTMLDivElement>()

  // Turning the phone sideways is the signal that the coach wants the pitch
  // to fill the screen: enter presentation mode by itself, leave it when the
  // phone goes back upright. A mode the user chose by hand is left alone.
  const autoPresenting = useRef(false)
  useEffect(() => {
    const mq = window.matchMedia("(orientation: landscape) and (max-height: 520px)")
    const apply = () => {
      if (mq.matches && !presentation.active) { autoPresenting.current = true; void presentation.enter() }
      else if (!mq.matches && autoPresenting.current) { autoPresenting.current = false; presentation.exit() }
    }
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const svgRef = useRef<SVGSVGElement>(null)
  const toSVG = useCallback((cx:number,cy:number):[number,number]=>{
    const s=svgRef.current; if(!s) return [0,0]
    const p=s.createSVGPoint(); p.x=cx; p.y=cy
    const {x,y}=p.matrixTransform(s.getScreenCTM()!.inverse())
    return [Math.max(0,Math.min(dims.w,x)), Math.max(0,Math.min(dims.h,y))]
  },[dims.w, dims.h])

  // ── Stop & reset animation completely ────────────────────────────────────
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const resetAnim = useCallback(()=>{
    cancelAnimationFrame(rafRef.current)
    clearTimeout(holdTimeoutRef.current)
    setPlaying(false)
    setPassStep(-1)
    setActiveStep(-1)
    setAnimPos(null)
    setAnimBall(null)
  },[])

  // ── Play animation ────────────────────────────────────────────────────────
  // One shared clock drives everything, in the exact order shown (and
  // reorderable) in the "Secuencia de la jugada" panel — a run and a pass
  // can be freely interleaved: step 2 never starts until step 1 finishes,
  // whether both are passes, both are runs, or a mix. Each step's duration
  // still scales with its real drawn distance.
  function startPlay() {
    resetAnim()

    // snapshot original positions from edit state
    const origPos: Record<string,[number,number]> = {}
    for (const m of markers) origPos[m.id]=[m.x,m.y]

    const ball = markers.find(m=>m.team==="ball")
    const origBall:[number,number] = ball ? [ball.x,ball.y] : [dims.w/2, dims.h/2]

    const speedMult = SPEED_MULT[speedTier]

    let ballCursor:[number,number] = [...origBall]
    const playerCursor: Record<string,[number,number]> = { ...origPos }
    let clock = 0

    const passSegs: {pts:[number,number][]; start:number; dur:number; lineIdx:number}[] = []
    // Keyed by player id so a player can have more than one run — each new
    // run for the same player chains from where the previous one left them.
    const runSegsByPlayer: Record<string, {pts:[number,number][]; start:number; dur:number; lineIdx:number}[]> = {}

    lines.forEach((line, lineIdx) => {
      if (line.type === "pass") {
        const seg:[number,number][] = [ballCursor, ...line.pts]
        const dur = Math.max(MIN_SEG_MS, pathLength(seg)/(BALL_SPEED*speedMult))
        passSegs.push({ pts: seg, start: clock, dur, lineIdx })
        ballCursor = [...line.pts[line.pts.length-1]]
        clock += dur
      } else {
        // closest player (by their position at THIS point in the timeline,
        // not their original spot) within 9 units, scaled to the pitch
        let bestId: string|null = null, bestD = 9*scale
        for (const m of markers) {
          if (m.team === "ball") continue
          const pos = playerCursor[m.id]
          const d = Math.hypot(pos[0]-line.pts[0][0], pos[1]-line.pts[0][1])
          if (d < bestD) { bestD = d; bestId = m.id }
        }
        if (bestId) {
          const dur = Math.max(MIN_SEG_MS, pathLength(line.pts)/(RUN_SPEED*speedMult))
          ;(runSegsByPlayer[bestId] ??= []).push({ pts: line.pts, start: clock, dur, lineIdx })
          playerCursor[bestId] = [...line.pts[line.pts.length-1]]
          clock += dur
        }
      }
    })

    const totalMs = Math.max(clock, 600)
    const stepTimeline = [...passSegs, ...Object.values(runSegsByPlayer).flat()].sort((a,b)=>a.start-b.start)

    if (passSegs.length>0) setPassStep(0)
    if (stepTimeline.length>0) setActiveStep(stepTimeline[0].lineIdx)
    setPlaying(true)

    const t0=performance.now()
    function frame(now:number){
      const el=now-t0

      // ball position — locate the current/most-recent pass segment; holds
      // at its last drop-off point while a run plays before the next pass
      let bp:[number,number]=[...origBall]
      if(passSegs.length>0){
        let si=0
        while(si<passSegs.length-1 && el>=passSegs[si].start+passSegs[si].dur) si++
        const seg=passSegs[si]
        const st=seg.dur>0 ? Math.min(Math.max((el-seg.start)/seg.dur,0),1) : 1
        bp = el<seg.start ? seg.pts[0] : pathAt(seg.pts,st)
        setPassStep(si)
      }

      // player positions — each holds until their next run's turn comes up,
      // moves along it, then holds at its end until any further run
      const np:Record<string,[number,number]>={}
      for(const [id,pos] of Object.entries(origPos)){
        const segs = runSegsByPlayer[id]
        if(!segs || segs.length===0){ np[id]=pos; continue }
        let cur = segs[0]
        for (const s of segs) { if (el>=s.start) cur=s; else break }
        const st = cur.dur>0 ? Math.min(Math.max((el-cur.start)/cur.dur,0),1) : 1
        np[id] = pathAt(cur.pts, st)
      }

      // which step (pass or run) is currently "live", for the badges/panel
      if (stepTimeline.length>0) {
        let ti=0
        while(ti<stepTimeline.length-1 && el>=stepTimeline[ti].start+stepTimeline[ti].dur) ti++
        setActiveStep(stepTimeline[ti].lineIdx)
      }

      setAnimPos(np)
      setAnimBall(bp)

      if(el<totalMs){
        rafRef.current=requestAnimationFrame(frame)
      } else {
        // animation done: hold 800ms then reset (timeout is cleared by resetAnim
        // if a new play starts before it fires, so it can't cut a later replay short)
        holdTimeoutRef.current = setTimeout(()=>{ resetAnim() },800)
      }
    }
    rafRef.current=requestAnimationFrame(frame)
  }

  // ── Pointer handlers ──────────────────────────────────────────────────────
  function onDown(e:React.PointerEvent<SVGSVGElement>){
    if(playing) return
    const pos=toSVG(e.clientX,e.clientY)
    e.currentTarget.setPointerCapture(e.pointerId)

    if(tool==="move"||tool==="home"||tool==="away"||tool==="ball"){
      const hit=markers.find(m=>Math.hypot(m.x-pos[0],m.y-pos[1])<hitR)
      if(hit){ pushHistory(markers,lines); setDragging(hit.id); return }
    }
    if(tool==="move"){
      return
    } else if(tool==="run"||tool==="pass"){
      setDrawing([pos])
    } else if(tool==="home"){
      pushHistory(markers,lines)
      setMarkers(ms=>[...ms,{id:uid(),x:pos[0],y:pos[1],team:"home",label:String(ms.filter(m=>m.team==="home").length+1)}])
    } else if(tool==="away"){
      pushHistory(markers,lines)
      setMarkers(ms=>[...ms,{id:uid(),x:pos[0],y:pos[1],team:"away",label:String(ms.filter(m=>m.team==="away").length+1)}])
    } else if(tool==="ball"){
      pushHistory(markers,lines)
      setMarkers(ms=>[...ms.filter(m=>m.team!=="ball"),{id:uid(),x:pos[0],y:pos[1],team:"ball"}])
    } else if(tool==="erase"){
      const hm=markers.find(m=>Math.hypot(m.x-pos[0],m.y-pos[1])<hitR)
      if(hm){ pushHistory(markers,lines); setMarkers(ms=>ms.filter(m=>m.id!==hm.id)); return }
      const hl=lines.find(l=>{
        const a=l.pts[0], b=l.pts[l.pts.length-1]
        return Math.hypot(a[0]-pos[0],a[1]-pos[1])<hitR||Math.hypot(b[0]-pos[0],b[1]-pos[1])<hitR
      })
      if(hl){ pushHistory(markers,lines); setLines(ls=>ls.filter(l=>l.id!==hl.id)) }
    }
  }

  function onMove(e:React.PointerEvent<SVGSVGElement>){
    if(playing) return
    const pos=toSVG(e.clientX,e.clientY)
    if(dragging) setMarkers(ms=>ms.map(m=>m.id===dragging?{...m,x:pos[0],y:pos[1]}:m))
    else if(drawing) setDrawing(d=>[...d!,pos])
  }

  function onUp(){
    if(dragging){ setDragging(null); return }
    if(drawing&&drawing.length>=2&&tool==="run"){
      const start=drawing[0]
      const onPlayer=markers.some(m=>m.team!=="ball"&&Math.hypot(m.x-start[0],m.y-start[1])<9*scale)
      if(!onPlayer){ setDrawing(null); flash("Empieza el movimiento encima de un jugador para que se mueva."); return }
    }
    if(drawing&&drawing.length>=2){
      pushHistory(markers,lines)
      setLines(ls=>[...ls,{id:uid(),type:tool==="pass"?"pass":"run",pts:drawing}])
    }
    setDrawing(null)
  }

  // ── Formation ──────────────────────────────────────────────────────────────
  function applyFmt(key:string){
    const dict = format==="11" ? FMTS11 : FMTS7
    const f=dict[key]; if(!f) return
    if(lines.length>0 && !window.confirm("Cambiar la formación borra las flechas dibujadas. ¿Continuar? (Puedes deshacer)")) return
    resetAnim()
    pushHistory(markers,lines)
    setFormationKey(key)
    const ball=markers.find(m=>m.team==="ball")
    const nm:Marker[]=f.map((p,i)=>({id:uid(),x:p.x,y:p.y,team:"home",label:i===0?"P":String(i)}))
    if(ball) nm.push({...ball,id:uid()})
    setMarkers(nm); setLines([])
  }

  // Auto-fill the current formation slots with real players from the roster,
  // mapping defensive→attacking position rank onto defensive→attacking slot order.
  function autoFillFromRoster(){
    const dict = format==="11" ? FMTS11 : FMTS7
    const slots = dict[formationKey]; if(!slots) return
    resetAnim()
    pushHistory(markers,lines)

    const gk = roster.find(p=>p.position==="Portero")
    const outfield = roster
      .filter(p=>p.position!=="Portero")
      .sort((a,b)=>(POS_RANK[a.position]??3)-(POS_RANK[b.position]??3))
    const outfieldSlots = slots.slice(1).sort((a,b)=>a.x-b.x)

    const nm: Marker[] = [{ id: uid(), x: slots[0].x, y: slots[0].y, team: "home", label: "P", player_id: gk?.id }]
    outfieldSlots.forEach((slot, i) => {
      nm.push({ id: uid(), x: slot.x, y: slot.y, team: "home", label: String(i+1), player_id: outfield[i]?.id })
    })

    const ball=markers.find(m=>m.team==="ball")
    if(ball) nm.push({...ball,id:uid()})
    setMarkers(nm); setLines([])
  }

  function assignPlayer(markerId: string, playerId: string | null) {
    setMarkers(ms => ms.map(m => m.id === markerId ? { ...m, player_id: playerId ?? undefined } : m))
  }

  // Reorder a step in the play sequence — this is the actual chaining order used
  // by startPlay(), so moving a step here changes what "Ver jugada" will do.
  function moveLine(id: string, dir: -1 | 1) {
    if (playing) return
    setLines(ls => {
      const idx = ls.findIndex(l => l.id === id)
      const swapIdx = idx + dir
      if (idx < 0 || swapIdx < 0 || swapIdx >= ls.length) return ls
      const copy = [...ls]
      ;[copy[idx], copy[swapIdx]] = [copy[swapIdx], copy[idx]]
      return copy
    })
  }
  function deleteLine(id: string) {
    if (playing) return
    pushHistory(markers, lines)
    setLines(ls => ls.filter(l => l.id !== id))
  }

  function switchFormat(f: Format) {
    if (f === format) return
    if (!confirmDiscard()) return
    resetAnim()
    histRef.current = []; setUndoCount(0)
    setFormat(f)
    const firstKey = Object.keys(f==="11"?FMTS11:FMTS7)[0]
    setFormationKey(firstKey)
    setMarkers(seedMarkers(f, firstKey)); setLines([])
  }

  // ── Save/load ──────────────────────────────────────────────────────────────
  async function save(){
    if (!academyId) return
    setSaving(true); setError("")
    const payload = { name: playName, format, category, markers, lines, academy_id: academyId }
    if (activeId) {
      const { error: err } = await (supabase as any).from("tactic_plays")
        .update({ ...payload, updated_at: new Date().toISOString() }).eq("id", activeId)
      if (err) setError("No se pudo guardar la jugada.")
      else { savedRef.current = snapshotOf(markers, lines, playName); flash("Jugada guardada ✓") }
    } else {
      const { data, error: err } = await (supabase as any).from("tactic_plays").insert(payload).select().single()
      if (err) setError("No se pudo guardar la jugada.")
      else if (data) { setActiveId(data.id); savedRef.current = snapshotOf(markers, lines, playName); flash("Jugada guardada ✓") }
    }
    await loadPlays()
    setSaving(false)
  }
  function load(p:Play){
    if (p.id !== activeId && !confirmDiscard()) return
    resetAnim()
    histRef.current = []; setUndoCount(0)
    savedRef.current = snapshotOf(p.markers, p.lines, p.name)
    setFormat(p.format); setCategory(p.category)
    setMarkers(p.markers); setLines(p.lines); setPlayName(p.name); setActiveId(p.id)
  }
  async function del(id:string){
    const name = plays.find(p => p.id === id)?.name ?? "esta jugada"
    if (!window.confirm(`¿Eliminar "${name}"? Esto no se puede deshacer.`)) return
    const { error: err } = await (supabase as any).from("tactic_plays").delete().eq("id", id)
    if (err) { setError("No se pudo eliminar la jugada."); return }
    if(activeId===id){ resetAnim(); const seeded = seedMarkers(format, formationKey); setMarkers(seeded); setLines([]); setActiveId(null); setPlayName("Nueva jugada"); savedRef.current = snapshotOf(seeded, [], "Nueva jugada") }
    await loadPlays()
  }
  function newPlay(){
    if (!confirmDiscard()) return
    resetAnim()
    histRef.current = []; setUndoCount(0)
    const seeded = seedMarkers(format, formationKey)
    setMarkers(seeded); setLines([]); setPlayName("Nueva jugada"); setActiveId(null)
    savedRef.current = snapshotOf(seeded, [], "Nueva jugada")
  }
  function clearArrows(){
    if (lines.length === 0) return
    resetAnim(); pushHistory(markers, lines); setLines([])
  }

  // ── Display positions ──────────────────────────────────────────────────────
  const dispMarkers = markers.map(m=>animPos ? {...m, x:animPos[m.id]?.[0]??m.x, y:animPos[m.id]?.[1]??m.y} : m)
  const ballM       = dispMarkers.find(m=>m.team==="ball")
  const ballPos:[number,number]|null = animBall ?? (ballM?[ballM.x,ballM.y]:null)
  const homeMarkers = markers.filter(m=>m.team==="home")

  // ── Tools config ──────────────────────────────────────────────────────────
  const dot = (cls: string) => <span className={`w-3.5 h-3.5 rounded-full border-2 shadow-sm inline-block ${cls}`} />
  const TOOLS: { id: Tool; label: string; icon: React.ReactNode; hint: string }[] = [
    { id: "move",  label: "Mover",      icon: <Hand size={15} />,  hint: "Arrastra un jugador o el balón para cambiarlo de lugar." },
    { id: "pass",  label: "Pase",       icon: <Zap size={15} />,   hint: "Traza el pase desde donde está el balón. Los pases se juegan en el orden en que los dibujas." },
    { id: "run",   label: "Movimiento", icon: <Route size={15} />, hint: "Traza el recorrido empezando encima del jugador que se desplaza." },
    { id: "home",  label: "Local",      icon: dot("bg-blue-700 border-white"),  hint: "Toca la cancha para agregar un jugador de tu equipo. Toca uno que ya está para moverlo." },
    { id: "away",  label: "Rival",      icon: dot("bg-red-600 border-white"),   hint: "Toca la cancha para agregar un rival. Toca uno que ya está para moverlo." },
    { id: "ball",  label: "Balón",      icon: dot("bg-white border-slate-300"), hint: "Toca la cancha para poner el balón." },
    { id: "erase", label: "Borrar",     icon: <Eraser size={15} />, hint: "Toca un jugador, o el inicio o final de una flecha, para borrarlo." },
  ]
  const GROUPS: { title: string; ids: Tool[] }[] = [
    { title: "", ids: ["move"] },
    { title: "Dibujar", ids: ["pass", "run"] },
    { title: "Agregar", ids: ["home", "away", "ball"] },
    { title: "", ids: ["erase"] },
  ]
  const toolHint = TOOLS.find(t => t.id === tool)?.hint ?? ""
  const playerName = (id?: string) => id ? players.find(p => p.id === id)?.name.split(" ")[0] : undefined
  const pick = (id: Tool) => { resetAnim(); setTool(id) }

  // Three-step guide: what a coach does here, with what's already done ticked.
  const steps = [
    { n: 1, label: "Ubica a tus jugadores", done: markers.some(m => m.team !== "ball") },
    { n: 2, label: "Dibuja pases y movimientos", done: lines.length > 0 },
    { n: 3, label: "Pulsa Ver jugada", done: false },
  ]

  const selectCls = "h-9 text-xs border border-slate-200 dark:border-slate-600 rounded-lg px-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-3 md:px-4 pt-3 md:pt-6 pb-28 md:pb-6 space-y-4">
        <div className="hidden md:flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Tablero Táctico</h1>
            <p className="text-xs text-slate-500 mt-0.5">Arma la jugada, dibújala y muéstrasela a tu equipo animada.</p>
          </div>
          <ol className="hidden md:flex flex-wrap items-center gap-2 text-xs">
            {steps.map(st => (
              <li key={st.n} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${st.done ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400" : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"}`}>
                {st.done ? <Check size={12} /> : <span className="font-bold">{st.n}</span>} {st.label}
              </li>
            ))}
          </ol>
        </div>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 dark:bg-red-500/10 rounded-xl px-3 py-2">{error}</div>
        )}

        <div className="flex flex-col xl:flex-row gap-4">
          {/* ── Pitch panel ── */}
          <div className="flex-1 min-w-0 flex flex-col md:block bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">

            {/* Set-up: what kind of match and who plays */}
            <div className="order-3 md:order-none px-3 md:px-4 py-3 border-t md:border-t-0 md:border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-wrap items-center gap-2">
              <div className="flex rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
                {(["7","11"] as Format[]).map(f=>(
                  <button key={f} onClick={()=>switchFormat(f)}
                    className={`h-9 px-3 text-xs font-bold transition-colors ${format===f ? "bg-emerald-600 text-white" : "bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300"}`}>
                    Fútbol {f}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                Formación
                <select value={formationKey} onChange={e=>applyFmt(e.target.value)} className={selectCls}>
                  {Object.keys(format==="11"?FMTS11:FMTS7).map(f=><option key={f} value={f}>{f}</option>)}
                </select>
              </label>
              <select value={category ?? ""} onChange={e=>setCategory((e.target.value || null) as Category | null)} className={selectCls} aria-label="Categoría">
                {isCoach && <option value="">Todas las categorías</option>}
                {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={autoFillFromRoster} disabled={roster.length===0}
                title="Pone a tus jugadores reales en la formación según su posición"
                className="h-9 px-3 inline-flex items-center gap-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors">
                <Users size={14} /> Usar mis jugadores
              </button>
              <button onClick={()=>setShowZones(z=>!z)} aria-pressed={showZones}
                title="Divide la cancha en tercios y carriles"
                className={`h-9 px-3 inline-flex items-center gap-1.5 text-xs font-bold rounded-lg border transition-colors ${showZones ? "bg-violet-600 text-white border-violet-600" : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600"}`}>
                <Grid3x3 size={14} /> Zonas
              </button>
              <button onClick={presentation.toggle}
                className="ml-auto h-9 px-3 inline-flex items-center gap-1.5 text-xs font-bold rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity">
                <Maximize2 size={14} /> Pantalla completa
              </button>
            </div>

            {/* Tools, grouped by what they do */}
            <div
              className="fixed md:static inset-x-0 z-30 md:z-auto bg-white/95 dark:bg-slate-900/95 md:bg-transparent md:dark:bg-transparent backdrop-blur md:backdrop-blur-none border-t md:border-t-0 md:border-b border-slate-200 dark:border-slate-800 px-2 py-2 md:px-4 md:py-3"
              style={{ bottom: "calc(51px + max(12px, env(safe-area-inset-bottom)))" }}
            >
              <div className="flex md:flex-wrap items-end gap-x-2 md:gap-x-4 gap-y-2 overflow-x-auto md:overflow-visible no-scrollbar">
                {GROUPS.map((g, gi) => (
                  <div key={gi} className="shrink-0">
                    {g.title && <p className="hidden md:block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">{g.title}</p>}
                    <div className="flex gap-1.5">
                      {g.ids.map(id => {
                        const t = TOOLS.find(x => x.id === id)!
                        return (
                          <button key={id} onClick={() => pick(id)} aria-pressed={tool===id}
                            className={`h-10 md:h-9 px-3 shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              tool===id
                                ? "bg-blue-600 text-white border-blue-600 shadow ring-2 ring-blue-300 dark:ring-blue-500/40"
                                : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
                            }`}>
                            {t.icon} {t.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
                <button onClick={undo} disabled={undoCount===0} title="Deshacer (Ctrl+Z)"
                  className="md:ml-auto h-10 md:h-9 px-3 shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-30 transition-colors">
                  <Undo2 size={14} /> Deshacer
                </button>
              </div>
              <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400 mt-2">{toolHint}</p>
              {/* Phones: fade on the right edge says the bar scrolls sideways */}
              <div aria-hidden className="md:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white dark:from-slate-900" />
            </div>

            {/* Pitch */}
            <div
              ref={presentation.ref}
              className={presentation.active
                ? "pres-root fixed inset-0 z-[100] bg-black flex flex-col p-2 sm:p-4"
                : "order-1 md:order-none p-2 md:p-4"}
            >
              {!presentation.active && <p className="md:hidden text-xs text-slate-500 dark:text-slate-400 mb-2 px-1">{toolHint}</p>}
              {presentation.active && (
                <div className="pres-rail shrink-0">
                <div className="pres-head w-full flex items-center justify-between gap-2 mb-2 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-white/90 truncate">{playName}</span>
                    {category && <span className="text-[10px] text-white/50 shrink-0">{category}</span>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {playing ? (
                      <button onClick={resetAnim} className="h-10 px-4 inline-flex items-center gap-1.5 rounded-xl bg-white/15 text-white text-xs font-bold">
                        <Square size={14} /> Detener
                      </button>
                    ) : (
                      <button onClick={startPlay} disabled={lines.length===0}
                        className="h-10 px-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold disabled:opacity-40">
                        <Play size={14} /> Ver jugada
                      </button>
                    )}
                    <button onClick={presentation.exit} className="h-10 px-4 rounded-xl bg-white/15 text-white text-xs font-bold">
                      Salir
                    </button>
                  </div>
                </div>

                {/* Drawing tools stay reachable while presenting: a board you can
                    only look at is a slideshow. This is where a coach draws the
                    instruction mid-talk. */}
                <div className="pres-tools w-full flex flex-wrap items-center gap-1.5 mb-2 shrink-0">
                  {TOOLS.map(tItem => (
                    <button key={tItem.id} onClick={() => pick(tItem.id)}
                      className={`h-10 px-3 inline-flex items-center gap-1.5 rounded-xl text-[11px] font-bold transition-colors ${
                        tool===tItem.id ? "bg-white text-slate-900" : "bg-white/15 text-white/80"
                      }`}>
                      {tItem.icon} {tItem.label}
                    </button>
                  ))}
                  <button onClick={undo} disabled={undoCount===0}
                    className="h-10 px-3 inline-flex items-center gap-1.5 rounded-xl bg-white/15 text-white/80 text-[11px] font-bold ml-auto disabled:opacity-30">
                    <Undo2 size={14} /> Deshacer
                  </button>
                </div>
                </div>
              )}
              <div className={presentation.active ? "pres-stage" : "contents"}>
              <div className={presentation.active
                  ? "relative rounded-lg overflow-hidden shadow-2xl"
                  : "relative mx-auto rounded-xl overflow-hidden shadow-lg"}
                style={presentation.active
                  ? {aspectRatio:`${dims.w}/${dims.h}`,width:`min(100cqw, calc(100cqh * ${dims.w / dims.h}))`,background:"linear-gradient(160deg,#1a6b3a,#1d7a40 50%,#1a6b3a)"}
                  : {maxWidth:720,aspectRatio:`${dims.w}/${dims.h}`,background:"linear-gradient(160deg,#1a6b3a,#1d7a40 50%,#1a6b3a)"}}>
                {/* grass stripes */}
                <div className="absolute inset-0 opacity-[0.12]"
                  style={{backgroundImage:"repeating-linear-gradient(90deg,transparent,transparent 55px,rgba(0,0,0,1) 55px,rgba(0,0,0,1) 110px)"}}/>

                {notice && (
                  <div role="status" className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 z-10 max-w-[90%] text-center bg-slate-900/85 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow">
                    {notice}
                  </div>
                )}

                <svg ref={svgRef} viewBox={`0 0 ${dims.w} ${dims.h}`} className="absolute inset-0 w-full h-full"
                  style={{cursor:tool==="move"?"grab":"crosshair",touchAction:"none"}}
                  onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}>

                  <defs>
                    <marker id="ar" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                      <path d="M0,0.5 L4.5,2.5 L0,4.5 Z" fill="#38bdf8"/>
                    </marker>
                    <marker id="ap" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                      <path d="M0,0.5 L4.5,2.5 L0,4.5 Z" fill="#fbbf24"/>
                    </marker>
                  </defs>

                  {format==="11" ? <Pitch11SVG/> : <Pitch7SVG/>}
                  {showZones && <ZoneGrid dims={dims}/>}

                  {/* Lines */}
                  {lines.map((l,li)=>(
                    <g key={l.id}>
                      <polyline points={l.pts.map(p=>p.join(",")).join(" ")}
                        stroke={l.type==="pass"?"#fbbf24":"#38bdf8"} strokeWidth={(l.type==="pass"?0.9:0.75)*scale}
                        fill="none" strokeLinecap="round" strokeLinejoin="round"
                        markerEnd={l.type==="pass"?"url(#ap)":"url(#ar)"} opacity={0.9}/>
                      {(()=>{
                        // Step number badge — shown on every line (pass or run) so the
                        // shared play order is visible on the pitch, not just in the side panel.
                        const mid=l.pts[Math.floor(l.pts.length/2)]
                        const active=playing&&activeStep===li
                        const passColor = l.type==="pass"
                        const fillIdle = passColor ? "rgba(251,191,36,0.25)" : "rgba(56,189,248,0.25)"
                        const strokeIdle = passColor ? "rgba(251,191,36,0.5)" : "rgba(56,189,248,0.5)"
                        const fillActive = passColor ? "#fbbf24" : "#38bdf8"
                        const strokeActive = passColor ? "#f59e0b" : "#0ea5e9"
                        const textIdle = passColor ? "rgba(251,191,36,0.9)" : "rgba(56,189,248,0.9)"
                        return (
                          <g>
                            <circle cx={mid[0]} cy={mid[1]-3*scale} r={2.3*scale}
                              fill={active?fillActive:fillIdle}
                              stroke={active?strokeActive:strokeIdle} strokeWidth={0.3*scale}/>
                            <text x={mid[0]} y={mid[1]-3*scale} textAnchor="middle" dominantBaseline="middle"
                              fontSize={1.8*scale} fontWeight="bold" fill={active?"#1e293b":textIdle}>
                              {li+1}
                            </text>
                          </g>
                        )
                      })()}
                    </g>
                  ))}

                  {/* Drawing preview */}
                  {drawing&&drawing.length>=2&&(
                    <polyline points={drawing.map(p=>p.join(",")).join(" ")}
                      stroke={tool==="pass"?"#fbbf24":"#38bdf8"} strokeWidth={0.8*scale}
                      fill="none" strokeLinecap="round" strokeDasharray="2 1.5" opacity={0.65}/>
                  )}

                  {/* Players — with the real player's first name when assigned */}
                  {dispMarkers.filter(m=>m.team!=="ball").map(m=>{
                    const name = playerName(m.player_id)
                    return (
                      <g key={m.id}>
                        <ellipse cx={m.x} cy={m.y+3.8*scale} rx={2.5*scale} ry={0.7*scale} fill="rgba(0,0,0,0.18)"/>
                        <circle cx={m.x} cy={m.y} r={3.4*scale}
                          fill={m.team==="home"?"#1d4ed8":"#dc2626"} stroke="white" strokeWidth={0.6*scale}/>
                        {m.label&&<text x={m.x} y={m.y+0.9*scale} textAnchor="middle" dominantBaseline="middle"
                          fontSize={2.2*scale} fontWeight="bold" fill="white" style={{userSelect:"none"}}>{m.label}</text>}
                        {name&&<text x={m.x} y={m.y+5.9*scale} textAnchor="middle" dominantBaseline="middle"
                          fontSize={1.9*scale} fontWeight="bold" fill="white" stroke="rgba(0,0,0,0.55)" strokeWidth={0.45*scale}
                          paintOrder="stroke" style={{userSelect:"none",pointerEvents:"none"}}>{name}</text>}
                      </g>
                    )
                  })}

                  {/* Ball */}
                  {ballPos&&(
                    <g>
                      <ellipse cx={ballPos[0]} cy={ballPos[1]+2.5*scale} rx={1.8*scale} ry={0.55*scale} fill="rgba(0,0,0,0.18)"/>
                      <circle cx={ballPos[0]} cy={ballPos[1]} r={2.4*scale} fill="white" stroke="#cbd5e1" strokeWidth={0.4*scale}/>
                      <circle cx={ballPos[0]} cy={ballPos[1]} r={2.4*scale} fill="none" stroke="#94a3b8" strokeWidth={0.25*scale} strokeDasharray="1.2 1.1"/>
                      <circle cx={ballPos[0]} cy={ballPos[1]} r={0.7*scale} fill="#94a3b8"/>
                    </g>
                  )}
                </svg>
              </div>

              </div>

              {/* Playback */}
              <div className={`flex-wrap items-center justify-center gap-3 mt-4 ${presentation.active ? "hidden" : "flex"}`}>
                {playing ? (
                  <button onClick={resetAnim}
                    className="h-11 px-6 inline-flex items-center gap-2 rounded-xl bg-red-500 text-white text-sm font-bold shadow hover:bg-red-600 transition-colors">
                    <Square size={15} /> Detener
                  </button>
                ) : (
                  <>
                    <button onClick={startPlay} disabled={lines.length===0}
                      title={lines.length===0 ? "Dibuja al menos un pase o movimiento" : undefined}
                      className="h-11 px-7 inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <Play size={15} /> Ver jugada
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Velocidad</span>
                      <div className="flex rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden">
                        {(["1x","2x","3x"] as SpeedTier[]).map(t=>(
                          <button key={t} onClick={()=>setSpeedTier(t)} aria-pressed={speedTier===t}
                            className={`h-11 px-3 text-xs font-bold transition-colors ${speedTier===t ? "bg-slate-700 text-white" : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300"}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={clearArrows} disabled={lines.length===0}
                      title="Quita pases y movimientos; los jugadores quedan donde están"
                      className="h-11 px-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:text-red-500 hover:border-red-300 disabled:opacity-30 transition-colors">
                      <Trash2 size={15} /> Borrar flechas
                    </button>
                  </>
                )}
              </div>

              {/* Legend */}
              <div className={`flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-3 text-[11px] text-slate-400 font-medium ${presentation.active ? "hidden" : "flex"}`}>
                <span className="flex items-center gap-1.5">{dot("bg-blue-700 border-white")}Local</span>
                <span className="flex items-center gap-1.5">{dot("bg-red-600 border-white")}Rival</span>
                <span className="flex items-center gap-1.5">{dot("bg-white border-slate-300")}Balón</span>
                <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-amber-400 inline-block"/>Pase</span>
                <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-sky-400 inline-block"/>Movimiento</span>
                <span>Los números indican el orden</span>
              </div>
            </div>
          </div>

          {/* ── Side panel ── */}
          <div className="xl:w-80 shrink-0 space-y-4">
            {/* Save */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-800 dark:text-white">Esta jugada</h2>
                {dirty
                  ? <span className="text-[10px] font-semibold text-amber-600">Sin guardar</span>
                  : activeId && <span className="text-[10px] font-semibold text-emerald-600 inline-flex items-center gap-1"><Check size={11} /> Guardada</span>}
              </div>
              <input value={playName} onChange={e=>setPlayName(e.target.value)}
                placeholder="Nombre de la jugada" aria-label="Nombre de la jugada"
                className="w-full h-10 text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 mb-3 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-400"/>
              <div className="flex gap-2">
                <button onClick={save} disabled={saving}
                  className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  <Save size={14} /> {saving ? "Guardando…" : "Guardar"}
                </button>
                <button onClick={newPlay}
                  className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <Plus size={14} /> Nueva
                </button>
              </div>
            </div>

            {/* Saved plays — what a coach comes back for */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
              <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Mis jugadas</h2>
              {plays.length === 0 ? (
                <p className="text-xs text-slate-400">Aún no tienes jugadas guardadas. Arma una y pulsa Guardar.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {plays.map(p=>(
                    <div key={p.id}
                      className={`flex items-center gap-2 rounded-xl border transition-all ${
                        activeId===p.id
                          ? "border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700"
                          : "border-slate-100 dark:border-slate-700 hover:border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}>
                      <button onClick={()=>load(p)} className="flex-1 min-w-0 text-left p-3">
                        <span className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-800 dark:text-white truncate">{p.name}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">F{p.format}</span>
                          {p.category && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">{p.category}</span>}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          {p.lines.filter(l=>l.type==="pass").length} pases · {p.lines.filter(l=>l.type==="run").length} movimientos
                        </span>
                      </button>
                      <button onClick={()=>del(p.id)} aria-label={`Eliminar ${p.name}`}
                        className="w-9 h-9 mr-1.5 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Play sequence — this order is exactly what "Ver jugada" will follow */}
            {lines.length>0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
                <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Orden de la jugada</h2>
                <p className="text-[11px] text-slate-400 mb-3">Así se reproduce. Cambia el orden con las flechas.</p>
                <div className="space-y-1.5 mb-3">
                  {zoneAnalysis.map((z,i)=>(
                    <div key={z.id} className="flex items-center gap-1.5">
                      <div className="flex flex-col shrink-0">
                        <button onClick={()=>moveLine(z.id,-1)} disabled={i===0} aria-label="Subir"
                          className="text-slate-400 hover:text-blue-600 disabled:opacity-20 leading-none text-[11px] px-1">▲</button>
                        <button onClick={()=>moveLine(z.id,1)} disabled={i===zoneAnalysis.length-1} aria-label="Bajar"
                          className="text-slate-400 hover:text-blue-600 disabled:opacity-20 leading-none text-[11px] px-1">▼</button>
                      </div>
                      <span className={`w-5 h-5 shrink-0 rounded-full text-[10px] font-bold flex items-center justify-center ${z.type==="pass" ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"}`}>{i+1}</span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 flex-1 min-w-0">
                        <span className="font-semibold">{z.type==="pass" ? "Pase" : "Movimiento"}</span>: {z.start.channel} → {z.end.channel}
                        <span className="text-slate-400"> ({z.end.third})</span>
                      </p>
                      <button onClick={()=>deleteLine(z.id)} aria-label="Quitar paso"
                        className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                {zoneInsights.length>0 && (
                  <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {zoneInsights.map((m,i)=><p key={i} className="text-[11px] text-slate-500 dark:text-slate-400">{m}</p>)}
                  </div>
                )}
              </div>
            )}

            {/* Roster assignment — optional, folded */}
            {homeMarkers.length>0 && (
              <details className="group bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
                <summary className="cursor-pointer list-none flex items-center justify-between text-sm font-bold text-slate-800 dark:text-white [&::-webkit-details-marker]:hidden">
                  Poner nombres a los jugadores
                  <span className="text-xs text-slate-400 font-normal">{homeMarkers.filter(m=>m.player_id).length}/{homeMarkers.length}</span>
                </summary>
                <div className="mt-3">
                  {roster.length===0 && <p className="text-[11px] text-slate-400 mb-2">No hay jugadores en esta categoría todavía.</p>}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {homeMarkers.map(m=>(
                      <div key={m.id} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{m.label}</span>
                        <select value={m.player_id ?? ""} onChange={e=>assignPlayer(m.id, e.target.value || null)}
                          className="flex-1 h-9 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 bg-white dark:bg-slate-800 dark:text-white">
                          <option value="">Sin asignar</option>
                          {roster.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
