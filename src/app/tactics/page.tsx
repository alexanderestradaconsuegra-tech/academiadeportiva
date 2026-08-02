"use client"
import { useState, useRef, useCallback, useEffect, useMemo } from "react"
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

const BALL_SPEED = 0.09   // pitch-units per ms — a struck pass
const RUN_SPEED  = 0.035  // pitch-units per ms — a player run (slower than the ball)
const MIN_SEG_MS = 300    // floor so very short taps/runs are still visible
const HIT_R      = 4.5    // SVG units for hit detection

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

  const roster = useMemo(() => category ? players.filter(p => p.category === category) : players, [players, category])

  // ── Undo history ─────────────────────────────────────────────────────────
  const histRef = useRef<{markers:Marker[];lines:TLine[]}[]>([])
  function pushHistory(m:Marker[],l:TLine[]){ histRef.current=[...histRef.current.slice(-29),{markers:m,lines:l}] }
  function undo(){
    const h=histRef.current; if(!h.length) return
    const prev=h[h.length-1]; histRef.current=h.slice(0,-1)
    setMarkers(prev.markers); setLines(prev.lines)
  }

  // ── Animation state (overlaid on top, never touches edit state)
  const [animPos,  setAnimPos]  = useState<Record<string,[number,number]>|null>(null)
  const [animBall, setAnimBall] = useState<[number,number]|null>(null)
  const [playing,  setPlaying]  = useState(false)
  const [passStep, setPassStep] = useState(-1)
  const rafRef = useRef(0)

  const dims = DIMS[format]

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
    setAnimPos(null)
    setAnimBall(null)
  },[])

  // ── Play animation ────────────────────────────────────────────────────────
  // Each pass segment and each run gets its own duration proportional to its
  // real drawn distance, so a short lay-off is quick and a long ball takes longer.
  function startPlay() {
    resetAnim()

    const passLines = lines.filter(l=>l.type==="pass")
    const runLines  = lines.filter(l=>l.type==="run")

    // snapshot original positions from edit state
    const origPos: Record<string,[number,number]> = {}
    for (const m of markers) origPos[m.id]=[m.x,m.y]

    const ball = markers.find(m=>m.team==="ball")
    const origBall:[number,number] = ball ? [ball.x,ball.y] : [dims.w/2, dims.h/2]

    // run assignments: closest player within 9 units, each moving at its own pace
    const runMap: {id:string; pts:[number,number][]; dur:number}[] = []
    for (const rl of runLines) {
      let best:Marker|null=null, bestD=9
      for (const m of markers) {
        if(m.team==="ball") continue
        const d=Math.hypot(m.x-rl.pts[0][0],m.y-rl.pts[0][1])
        if(d<bestD){bestD=d;best=m}
      }
      if(best) runMap.push({id:best.id, pts:rl.pts, dur:Math.max(MIN_SEG_MS, pathLength(rl.pts)/RUN_SPEED)})
    }

    // pass chain: cursor starts at ball, follows each pass line in the order
    // shown in the "Secuencia de la jugada" panel — each hop's duration scales
    // with its real distance instead of a fixed tick.
    let cursor:[number,number]=[...origBall]
    let segStart=0
    const passSegs:{pts:[number,number][]; start:number; dur:number}[] = passLines.map(pl=>{
      const seg:[number,number][]=[cursor,...pl.pts]
      cursor=[...pl.pts[pl.pts.length-1]]
      const dur=Math.max(MIN_SEG_MS, pathLength(seg)/BALL_SPEED)
      const entry={pts:seg, start:segStart, dur}
      segStart += dur
      return entry
    })

    const totalPassMs = passSegs.reduce((s,p)=>s+p.dur,0)
    const maxRunMs = runMap.reduce((m,r)=>Math.max(m,r.dur),0)
    const totalMs = Math.max(totalPassMs, maxRunMs, 600)

    if(passSegs.length>0) setPassStep(0)
    setPlaying(true)

    const t0=performance.now()
    function frame(now:number){
      const el=now-t0

      // ball position — locate the current segment by cumulative start time
      let bp:[number,number]=[...origBall]
      if(passSegs.length>0){
        let si=0
        while(si<passSegs.length-1 && el>=passSegs[si].start+passSegs[si].dur) si++
        const seg=passSegs[si]
        const st=seg.dur>0 ? Math.min((el-seg.start)/seg.dur,1) : 1
        bp=pathAt(seg.pts,st)
        setPassStep(si)
      }

      // player positions — each run holds at its final point once it finishes
      const np:Record<string,[number,number]>={}
      for(const [id,pos] of Object.entries(origPos)){
        const ra=runMap.find(r=>r.id===id)
        np[id] = ra ? pathAt(ra.pts, ra.dur>0 ? Math.min(el/ra.dur,1) : 1) : pos
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

    if(tool==="move"){
      const hit=markers.find(m=>Math.hypot(m.x-pos[0],m.y-pos[1])<HIT_R)
      if(hit){ pushHistory(markers,lines); setDragging(hit.id) }
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
      const hm=markers.find(m=>Math.hypot(m.x-pos[0],m.y-pos[1])<HIT_R)
      if(hm){ pushHistory(markers,lines); setMarkers(ms=>ms.filter(m=>m.id!==hm.id)); return }
      const hl=lines.find(l=>{
        const a=l.pts[0], b=l.pts[l.pts.length-1]
        return Math.hypot(a[0]-pos[0],a[1]-pos[1])<HIT_R||Math.hypot(b[0]-pos[0],b[1]-pos[1])<HIT_R
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
    resetAnim()
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
    resetAnim()
    setFormat(f)
    setMarkers([]); setLines([])
    const firstKey = Object.keys(f==="11"?FMTS11:FMTS7)[0]
    setFormationKey(firstKey)
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
    } else {
      const { data, error: err } = await (supabase as any).from("tactic_plays").insert(payload).select().single()
      if (err) setError("No se pudo guardar la jugada.")
      else if (data) setActiveId(data.id)
    }
    await loadPlays()
    setSaving(false)
  }
  function load(p:Play){
    resetAnim()
    setFormat(p.format); setCategory(p.category)
    setMarkers(p.markers); setLines(p.lines); setPlayName(p.name); setActiveId(p.id)
  }
  async function del(id:string){
    const { error: err } = await (supabase as any).from("tactic_plays").delete().eq("id", id)
    if (err) { setError("No se pudo eliminar la jugada."); return }
    if(activeId===id){ resetAnim(); setMarkers([]); setLines([]); setActiveId(null) }
    await loadPlays()
  }
  function newPlay(){ resetAnim(); setMarkers([]); setLines([]); setPlayName("Nueva jugada"); setActiveId(null) }

  // ── Display positions ──────────────────────────────────────────────────────
  const dispMarkers = markers.map(m=>animPos ? {...m, x:animPos[m.id]?.[0]??m.x, y:animPos[m.id]?.[1]??m.y} : m)
  const ballM       = dispMarkers.find(m=>m.team==="ball")
  const ballPos:[number,number]|null = animBall ?? (ballM?[ballM.x,ballM.y]:null)
  const passLines   = lines.filter(l=>l.type==="pass")
  const homeMarkers = markers.filter(m=>m.team==="home")

  // ── Tools config ──────────────────────────────────────────────────────────
  const TOOLS:{id:Tool;label:string;color:string}[]=[
    {id:"move",  label:"✋ Mover",      color:"slate"},
    {id:"run",   label:"→ Movimiento",  color:"sky"},
    {id:"pass",  label:"⚡ Pase",        color:"amber"},
    {id:"home",  label:"● Local",       color:"blue"},
    {id:"away",  label:"● Rival",       color:"red"},
    {id:"ball",  label:"○ Balón",       color:"white"},
    {id:"erase", label:"✕ Borrar",      color:"rose"},
  ]

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Tablero Táctico</h1>
          <p className="text-xs text-slate-500 mt-0.5">Dibuja jugadas y anima los movimientos</p>
        </div>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 dark:bg-red-500/10 rounded-xl px-3 py-2">{error}</div>
        )}

        <div className="flex flex-col xl:flex-row gap-4">
          {/* ── Pitch panel ── */}
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">

            {/* Format + category */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-wrap items-center gap-2">
              <div className="flex rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
                {(["7","11"] as Format[]).map(f=>(
                  <button key={f} onClick={()=>switchFormat(f)}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors ${format===f ? "bg-emerald-600 text-white" : "bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300"}`}>
                    ⚽ Fútbol {f}
                  </button>
                ))}
              </div>
              <select value={category ?? ""} onChange={e=>setCategory((e.target.value || null) as Category | null)}
                className="text-xs border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                {isCoach && <option value="">Todas las categorías</option>}
                {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={autoFillFromRoster} disabled={roster.length===0}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors">
                🧠 Cargar plantilla real
              </button>
              <button onClick={()=>setShowZones(z=>!z)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${showZones ? "bg-violet-600 text-white border-violet-600" : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600"}`}>
                🗺️ Zonas
              </button>
            </div>

            {/* Toolbar */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <div className="flex flex-wrap gap-2">
                {TOOLS.map(t=>(
                  <button key={t.id} onClick={()=>{ resetAnim(); setTool(t.id) }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      tool===t.id
                        ? "bg-blue-600 text-white border-blue-600 shadow ring-2 ring-blue-300"
                        : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50"
                    }`}>
                    {t.label}
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-2">
                  <select value={formationKey} onChange={e=>applyFmt(e.target.value)}
                    className="text-xs border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                    {Object.keys(format==="11"?FMTS11:FMTS7).map(f=><option key={f} value={f}>{f}</option>)}
                  </select>
                  <button onClick={()=>{ resetAnim(); setMarkers([]); setLines([]) }}
                    className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 text-slate-500 hover:text-red-500 hover:border-red-300">
                    Limpiar
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">
                {tool==="move"  && "Arrastra jugadores o el balón para reposicionarlos"}
                {tool==="run"   && "Dibuja la ruta de movimiento de un jugador (azul)"}
                {tool==="pass"  && "Dibuja la secuencia de pases — el balón los seguirá en orden (amarillo)"}
                {tool==="home"  && "Clic en la cancha para añadir jugador local (azul)"}
                {tool==="away"  && "Clic en la cancha para añadir jugador rival (rojo)"}
                {tool==="ball"  && "Clic en la cancha para colocar el balón"}
                {tool==="erase" && "Clic sobre un jugador o extremo de línea para borrarlo"}
              </p>
            </div>

            {/* Pitch */}
            <div className="p-4">
              <div className="relative mx-auto rounded-xl overflow-hidden shadow-lg"
                style={{maxWidth:720,aspectRatio:`${dims.w}/${dims.h}`,background:"linear-gradient(160deg,#1a6b3a,#1d7a40 50%,#1a6b3a)"}}>
                {/* grass stripes */}
                <div className="absolute inset-0 opacity-[0.12]"
                  style={{backgroundImage:"repeating-linear-gradient(90deg,transparent,transparent 55px,rgba(0,0,0,1) 55px,rgba(0,0,0,1) 110px)"}}/>

                <svg ref={svgRef} viewBox={`0 0 ${dims.w} ${dims.h}`} className="absolute inset-0 w-full h-full"
                  style={{cursor:tool==="move"?"grab":tool==="erase"?"crosshair":"crosshair",touchAction:"none"}}
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
                        stroke={l.type==="pass"?"#fbbf24":"#38bdf8"} strokeWidth={l.type==="pass"?0.9:0.75}
                        fill="none" strokeLinecap="round" strokeLinejoin="round"
                        markerEnd={l.type==="pass"?"url(#ap)":"url(#ar)"} opacity={0.9}/>
                      {l.type==="pass" && (()=>{
                        const mid=l.pts[Math.floor(l.pts.length/2)]
                        const idx=passLines.findIndex(p=>p.id===l.id)
                        const active=playing&&passStep===idx
                        return (
                          <g>
                            <circle cx={mid[0]} cy={mid[1]-3} r={2.3}
                              fill={active?"#fbbf24":"rgba(251,191,36,0.25)"}
                              stroke={active?"#f59e0b":"rgba(251,191,36,0.5)"} strokeWidth={0.3}/>
                            <text x={mid[0]} y={mid[1]-3} textAnchor="middle" dominantBaseline="middle"
                              fontSize={1.8} fontWeight="bold" fill={active?"#1e293b":"rgba(251,191,36,0.9)"}>
                              {idx+1}
                            </text>
                          </g>
                        )
                      })()}
                    </g>
                  ))}

                  {/* Drawing preview */}
                  {drawing&&drawing.length>=2&&(
                    <polyline points={drawing.map(p=>p.join(",")).join(" ")}
                      stroke={tool==="pass"?"#fbbf24":"#38bdf8"} strokeWidth={0.8}
                      fill="none" strokeLinecap="round" strokeDasharray="2 1.5" opacity={0.65}/>
                  )}

                  {/* Players */}
                  {dispMarkers.filter(m=>m.team!=="ball").map(m=>(
                    <g key={m.id}>
                      <ellipse cx={m.x} cy={m.y+3.8} rx={2.5} ry={0.7} fill="rgba(0,0,0,0.18)"/>
                      <circle cx={m.x} cy={m.y} r={3.4}
                        fill={m.team==="home"?"#1d4ed8":"#dc2626"} stroke="white" strokeWidth={0.6}/>
                      {m.label&&<text x={m.x} y={m.y+0.9} textAnchor="middle" dominantBaseline="middle"
                        fontSize={2.2} fontWeight="bold" fill="white" style={{userSelect:"none"}}>{m.label}</text>}
                    </g>
                  ))}

                  {/* Ball */}
                  {ballPos&&(
                    <g>
                      <ellipse cx={ballPos[0]} cy={ballPos[1]+2.5} rx={1.8} ry={0.55} fill="rgba(0,0,0,0.18)"/>
                      <circle cx={ballPos[0]} cy={ballPos[1]} r={2.4} fill="white" stroke="#cbd5e1" strokeWidth={0.4}/>
                      <circle cx={ballPos[0]} cy={ballPos[1]} r={2.4} fill="none" stroke="#94a3b8" strokeWidth={0.25} strokeDasharray="1.2 1.1"/>
                      <circle cx={ballPos[0]} cy={ballPos[1]} r={0.7} fill="#94a3b8"/>
                    </g>
                  )}
                </svg>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[10px] text-slate-400 font-medium">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-700 border-2 border-white shadow-sm inline-block"/>Local</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-600 border-2 border-white shadow-sm inline-block"/>Rival</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-white border-2 border-slate-300 shadow-sm inline-block"/>Balón</span>
                <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-sky-400 inline-block"/>Movimiento</span>
                <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-amber-400 inline-block"/>Pase (en orden)</span>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                {playing ? (
                  <button onClick={resetAnim}
                    className="px-6 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold shadow hover:bg-red-600 transition-colors">
                    ⏹ Detener
                  </button>
                ) : (
                  <>
                    <button onClick={startPlay}
                      disabled={lines.length===0&&markers.filter(m=>m.team!=="ball").length===0}
                      className="px-7 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      ▶ Ver jugada
                    </button>
                    <button onClick={undo}
                      disabled={histRef.current.length===0}
                      className="px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 disabled:opacity-30 transition-colors">
                      ↩ Deshacer
                    </button>
                    <button onClick={()=>{ resetAnim(); pushHistory(markers,lines); setMarkers([]); setLines([]) }}
                      className="px-4 py-2.5 rounded-xl border-2 border-red-200 bg-white dark:bg-slate-800 text-red-500 text-sm font-bold hover:bg-red-50 transition-colors">
                      ✕ Limpiar
                    </button>
                  </>
                )}
              </div>

              {/* Pass progress */}
              {passLines.length>1&&(
                <div className="flex items-center justify-center gap-2 mt-3">
                  <span className="text-xs text-slate-400 font-medium">Pases:</span>
                  {passLines.map((_,i)=>(
                    <div key={i} className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center border-2 transition-all ${
                      playing&&passStep===i ? "bg-amber-400 border-amber-500 text-slate-900 scale-125 shadow-md"
                        : playing&&passStep>i  ? "bg-amber-100 border-amber-300 text-amber-700"
                        : "bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-400"
                    }`}>{i+1}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Side panel ── */}
          <div className="xl:w-72 space-y-4">
            {/* Save */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
              <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-3">💾 Guardar jugada</h2>
              <input value={playName} onChange={e=>setPlayName(e.target.value)}
                placeholder="Nombre de la jugada"
                className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 mb-3 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-400"/>
              <div className="flex gap-2">
                <button onClick={save} disabled={saving}
                  className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {saving ? "Guardando…" : "Guardar"}
                </button>
                <button onClick={newPlay}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Nueva
                </button>
              </div>
            </div>

            {/* Roster assignment */}
            {homeMarkers.length>0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
                <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-3">👤 Jugadores en cancha</h2>
                {roster.length===0 && <p className="text-[11px] text-slate-400 mb-2">No hay jugadores en esta categoría todavía.</p>}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {homeMarkers.map(m=>(
                    <div key={m.id} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{m.label}</span>
                      <select value={m.player_id ?? ""} onChange={e=>assignPlayer(m.id, e.target.value || null)}
                        className="flex-1 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 dark:text-white">
                        <option value="">Sin asignar</option>
                        {roster.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            {(markers.length>0||lines.length>0)&&(
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Jugada actual</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {l:"Locales",     v:markers.filter(m=>m.team==="home").length, c:"text-blue-600"},
                    {l:"Rivales",     v:markers.filter(m=>m.team==="away").length, c:"text-red-500"},
                    {l:"Pases",       v:lines.filter(l=>l.type==="pass").length,   c:"text-amber-500"},
                    {l:"Movimientos", v:lines.filter(l=>l.type==="run").length,    c:"text-sky-500"},
                  ].map(s=>(
                    <div key={s.l} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5 text-center">
                      <p className={`text-lg font-black ${s.c}`}>{s.v}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Play sequence — this order is exactly what "Ver jugada" will follow */}
            {lines.length>0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
                <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-1">🎬 Secuencia de la jugada</h2>
                <p className="text-[10px] text-slate-400 mb-3">Este es el orden exacto que sigue la animación. Reordena con ↑↓.</p>
                <div className="space-y-1.5 mb-3">
                  {zoneAnalysis.map((z,i)=>(
                    <div key={z.id} className="flex items-center gap-1.5">
                      <div className="flex flex-col shrink-0">
                        <button onClick={()=>moveLine(z.id,-1)} disabled={i===0}
                          className="text-slate-400 hover:text-blue-600 disabled:opacity-20 leading-none text-[10px]">▲</button>
                        <button onClick={()=>moveLine(z.id,1)} disabled={i===zoneAnalysis.length-1}
                          className="text-slate-400 hover:text-blue-600 disabled:opacity-20 leading-none text-[10px]">▼</button>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 flex-1 min-w-0">
                        {z.type==="pass" ? "⚡" : "→"} {i+1}: <span className="font-semibold">{z.start.channel}</span> ({z.start.third}) → <span className="font-semibold">{z.end.channel}</span> ({z.end.third})
                      </p>
                      <button onClick={()=>deleteLine(z.id)}
                        className="w-6 h-6 shrink-0 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors text-xs">
                        ✕
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

            {/* Saved plays */}
            {plays.length>0&&(
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
                <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-3">📂 Jugadas guardadas</h2>
                <div className="space-y-2">
                  {plays.map(p=>(
                    <div key={p.id} onClick={()=>load(p)}
                      className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                        activeId===p.id
                          ? "border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700"
                          : "border-slate-100 dark:border-slate-700 hover:border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{p.name}</p>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">⚽{p.format}</span>
                          {p.category && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">{p.category}</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {p.markers.filter(m=>m.team==="home").length} loc · {p.markers.filter(m=>m.team==="away").length} riv · {p.lines.filter(l=>l.type==="pass").length} pases
                        </p>
                      </div>
                      <button onClick={e=>{e.stopPropagation();del(p.id)}}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors text-sm shrink-0">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
