"use client"
import { useState, useRef, useCallback, useEffect } from "react"

// ── Types ──────────────────────────────────────────────────────────────────────
type MarkerTeam = "home" | "away" | "ball"
interface Marker { id: string; x: number; y: number; team: MarkerTeam; label?: string }
interface TLine { id: string; type: "run" | "pass"; points: [number, number][]; order?: number }
interface SavedPlay { id: string; name: string; markers: Marker[]; lines: TLine[] }
type Tool = "move" | "run" | "pass" | "home" | "away" | "ball" | "erase"

const ASSIGN_RADIUS = 9
const SEG_MS = 1100
const RUN_MS = 1600
const SAVED_KEY = "tactics_v2"

function uid() { return Math.random().toString(36).slice(2, 9) }

function lerp(a: [number,number], b: [number,number], t: number): [number,number] {
  return [a[0] + (b[0]-a[0])*t, a[1] + (b[1]-a[1])*t]
}

function pathAt(pts: [number,number][], t: number): [number,number] {
  if (pts.length < 2) return pts[0]
  const dists = pts.slice(1).map((p,i) => Math.hypot(p[0]-pts[i][0], p[1]-pts[i][1]))
  const total = dists.reduce((s,d) => s+d, 0)
  let rem = t * total
  for (let i = 0; i < dists.length; i++) {
    if (rem <= dists[i] || i === dists.length-1) return lerp(pts[i], pts[i+1], Math.min(rem/dists[i],1))
    rem -= dists[i]
  }
  return pts[pts.length-1]
}

const FORMATIONS: Record<string, {x:number;y:number}[]> = {
  "4-3-3": [
    {x:5,y:34},
    {x:20,y:9},{x:20,y:24},{x:20,y:44},{x:20,y:59},
    {x:40,y:17},{x:40,y:34},{x:40,y:51},
    {x:60,y:12},{x:60,y:34},{x:60,y:56},
  ],
  "4-4-2": [
    {x:5,y:34},
    {x:20,y:9},{x:20,y:24},{x:20,y:44},{x:20,y:59},
    {x:44,y:9},{x:44,y:27},{x:44,y:41},{x:44,y:59},
    {x:66,y:24},{x:66,y:44},
  ],
  "3-5-2": [
    {x:5,y:34},
    {x:20,y:17},{x:20,y:34},{x:20,y:51},
    {x:36,y:5},{x:40,y:20},{x:40,y:34},{x:40,y:48},{x:36,y:63},
    {x:64,y:24},{x:64,y:44},
  ],
  "4-2-3-1": [
    {x:5,y:34},
    {x:19,y:9},{x:19,y:24},{x:19,y:44},{x:19,y:59},
    {x:36,y:24},{x:36,y:44},
    {x:52,y:12},{x:52,y:34},{x:52,y:56},
    {x:68,y:34},
  ],
}

function loadPlays(): SavedPlay[] {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]") } catch { return [] }
}
function savePlays(p: SavedPlay[]) { localStorage.setItem(SAVED_KEY, JSON.stringify(p)) }

// ── Pitch SVG ──────────────────────────────────────────────────────────────────
function Pitch() {
  const c = "rgba(255,255,255,0.5)"
  const w = 0.35
  return (
    <g stroke={c} strokeWidth={w} fill="none">
      {/* outer */}
      <rect x="2" y="2" width="101" height="64" rx="0.5"/>
      {/* halfway */}
      <line x1="52.5" y1="2" x2="52.5" y2="66"/>
      {/* centre circle + spot */}
      <circle cx="52.5" cy="34" r="9.15"/>
      <circle cx="52.5" cy="34" r="0.6" fill={c}/>
      {/* left penalty box */}
      <rect x="2" y="13.84" width="16.5" height="40.32"/>
      {/* left 6-yard */}
      <rect x="2" y="24.84" width="5.5" height="18.32"/>
      {/* left goal */}
      <rect x="0.3" y="29.68" width="1.7" height="8.64"/>
      {/* left penalty spot */}
      <circle cx="11" cy="34" r="0.5" fill={c}/>
      {/* left arc */}
      <path d="M18.5,26.2 A9.15,9.15 0 0 1 18.5,41.8" strokeDasharray="1.8 1"/>
      {/* right penalty box */}
      <rect x="86.5" y="13.84" width="16.5" height="40.32"/>
      {/* right 6-yard */}
      <rect x="97.5" y="24.84" width="5.5" height="18.32"/>
      {/* right goal */}
      <rect x="103" y="29.68" width="1.7" height="8.64"/>
      {/* right penalty spot */}
      <circle cx="94" cy="34" r="0.5" fill={c}/>
      {/* right arc */}
      <path d="M86.5,26.2 A9.15,9.15 0 0 0 86.5,41.8" strokeDasharray="1.8 1"/>
      {/* corner arcs */}
      <path d="M2,4 A2,2 0 0 1 4,2"/>
      <path d="M101,2 A2,2 0 0 1 103,4"/>
      <path d="M103,64 A2,2 0 0 1 101,66"/>
      <path d="M4,66 A2,2 0 0 1 2,64"/>
    </g>
  )
}

// ── Arrow defs ──────────────────────────────────────────────────────────────────
function Defs() {
  return (
    <defs>
      <marker id="arr-run" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
        <path d="M0,0.5 L4.5,2.5 L0,4.5 Z" fill="#38bdf8"/>
      </marker>
      <marker id="arr-pass" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
        <path d="M0,0.5 L4.5,2.5 L0,4.5 Z" fill="#fbbf24"/>
      </marker>
      <filter id="glow">
        <feGaussianBlur stdDeviation="1.2" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function TacticsPage() {
  const [plays, setPlays] = useState<SavedPlay[]>([])
  const [markers, setMarkers] = useState<Marker[]>([])
  const [lines, setLines] = useState<TLine[]>([])
  const [tool, setTool] = useState<Tool>("move")
  const [drawing, setDrawing] = useState<[number,number][]|null>(null)
  const [dragging, setDragging] = useState<string|null>(null)
  const [playName, setPlayName] = useState("Nueva jugada")
  const [activeId, setActiveId] = useState<string|null>(null)

  // animation
  const [playing, setPlaying] = useState(false)
  const [animM, setAnimM] = useState<Marker[]|null>(null)
  const [animBall, setAnimBall] = useState<[number,number]|null>(null)
  const [passStep, setPassStep] = useState(-1)
  const rafRef = useRef(0)

  useEffect(() => { setPlays(loadPlays()) }, [])

  const svgRef = useRef<SVGSVGElement>(null)
  const toSVG = useCallback((cx: number, cy: number): [number,number] => {
    const s = svgRef.current; if (!s) return [0,0]
    const p = s.createSVGPoint(); p.x = cx; p.y = cy
    const {x,y} = p.matrixTransform(s.getScreenCTM()!.inverse())
    return [Math.max(0,Math.min(105,x)), Math.max(0,Math.min(68,y))]
  }, [])

  // ── Animation ──────────────────────────────────────────────────────────────
  function stopAnim(reset=false) {
    cancelAnimationFrame(rafRef.current)
    setPlaying(false); setPassStep(-1)
    if (reset) { setAnimM(null); setAnimBall(null) }
  }

  function playAnim() {
    // Always cancel and reset before starting — prevents stale state on repeat plays
    cancelAnimationFrame(rafRef.current)
    setAnimM(null)
    setAnimBall(null)
    setPassStep(-1)
    setPlaying(false)

    const passLines = lines.filter(l => l.type === "pass")
    const runLines  = lines.filter(l => l.type === "run")

    // run assignments: nearest player within radius
    const runMap: {markerId:string; pts:[number,number][]}[] = []
    for (const rl of runLines) {
      let best: Marker|null = null; let bestD = ASSIGN_RADIUS
      for (const m of markers) {
        if (m.team==="ball") continue
        const d = Math.hypot(m.x-rl.points[0][0], m.y-rl.points[0][1])
        if (d < bestD) { bestD=d; best=m }
      }
      if (best) runMap.push({markerId: best.id, pts: rl.points})
    }

    // pass chain: ball travels pass1→pass2→pass3 sequentially
    const ball = markers.find(m=>m.team==="ball")
    let cursor: [number,number] = ball ? [ball.x,ball.y] : passLines[0]?.points[0] ?? [52,34]
    const passSegs: [number,number][][] = []
    for (const pl of passLines) {
      passSegs.push([cursor, ...pl.points])
      cursor = pl.points[pl.points.length-1]
    }

    const totalMs = passSegs.length > 0 ? passSegs.length * SEG_MS : RUN_MS
    const origM = markers.map(m=>({...m}))
    const origBall: [number,number] = ball ? [ball.x,ball.y] : [52,34]

    setPlaying(true)
    if (passSegs.length>0) setPassStep(0)

    const t0 = performance.now()
    function frame(now: number) {
      const el = now - t0
      const gt = Math.min(el/totalMs, 1)

      // ball: sequential segments
      let bpos: [number,number] = origBall
      if (passSegs.length>0) {
        const si = Math.min(Math.floor(el/SEG_MS), passSegs.length-1)
        const st = Math.min((el - si*SEG_MS)/SEG_MS, 1)
        bpos = pathAt(passSegs[si], st)
        setPassStep(si)
      }

      // players: all run over full duration
      const nm = origM.map(m => {
        const ra = runMap.find(r=>r.markerId===m.id)
        if (!ra) return m
        const pos = pathAt(ra.pts, gt)
        return {...m, x:pos[0], y:pos[1]}
      })

      setAnimBall(bpos); setAnimM(nm)

      if (gt < 1) {
        rafRef.current = requestAnimationFrame(frame)
      } else {
        setPlaying(false); setPassStep(-1)
        setTimeout(()=>{ setAnimM(null); setAnimBall(null) }, 1000)
      }
    }
    rafRef.current = requestAnimationFrame(frame)
  }

  // ── Pointer ────────────────────────────────────────────────────────────────
  function onDown(e: React.PointerEvent<SVGSVGElement>) {
    if (playing) return
    const pos = toSVG(e.clientX, e.clientY)
    e.currentTarget.setPointerCapture(e.pointerId)

    if (tool === "move") {
      const hit = markers.find(m=>Math.hypot(m.x-pos[0],m.y-pos[1])<4.5)
      if (hit) setDragging(hit.id)
    } else if (tool === "run" || tool === "pass") {
      setDrawing([pos])
    } else if (tool === "home") {
      setMarkers(ms=>[...ms,{id:uid(),x:pos[0],y:pos[1],team:"home",label:String(ms.filter(m=>m.team==="home").length+1)}])
    } else if (tool === "away") {
      setMarkers(ms=>[...ms,{id:uid(),x:pos[0],y:pos[1],team:"away",label:String(ms.filter(m=>m.team==="away").length+1)}])
    } else if (tool === "ball") {
      setMarkers(ms=>[...ms.filter(m=>m.team!=="ball"),{id:uid(),x:pos[0],y:pos[1],team:"ball"}])
    } else if (tool === "erase") {
      // remove nearest marker or nearest line endpoint
      const hm = markers.find(m=>Math.hypot(m.x-pos[0],m.y-pos[1])<4)
      if (hm) { setMarkers(ms=>ms.filter(m=>m.id!==hm.id)); return }
      const hl = lines.find(l=>Math.hypot(l.points[0][0]-pos[0],l.points[0][1]-pos[1])<4 || Math.hypot(l.points[l.points.length-1][0]-pos[0],l.points[l.points.length-1][1]-pos[1])<4)
      if (hl) setLines(ls=>ls.filter(l=>l.id!==hl.id))
    }
  }

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    if (playing) return
    const pos = toSVG(e.clientX, e.clientY)
    if (dragging) setMarkers(ms=>ms.map(m=>m.id===dragging?{...m,x:pos[0],y:pos[1]}:m))
    else if (drawing) setDrawing(d=>[...d!,pos])
  }

  function onUp() {
    if (dragging) { setDragging(null); return }
    if (drawing && drawing.length>=2) {
      const passCount = lines.filter(l=>l.type==="pass").length
      setLines(ls=>[...ls,{id:uid(),type:tool==="pass"?"pass":"run",points:drawing,order:tool==="pass"?passCount+1:undefined}])
    }
    setDrawing(null)
  }

  // ── Formation ──────────────────────────────────────────────────────────────
  function applyFormation(key: string) {
    const f = FORMATIONS[key]; if (!f) return
    const ball = markers.find(m=>m.team==="ball")
    const nm: Marker[] = f.map((p,i)=>({id:uid(),x:p.x,y:p.y,team:"home",label:i===0?"P":String(i)}))
    if (ball) nm.push(ball)
    setMarkers(nm); setLines([])
  }

  // ── Persist ────────────────────────────────────────────────────────────────
  function save() {
    const play: SavedPlay = {id:activeId??uid(),name:playName,markers,lines}
    const updated = [...plays.filter(p=>p.id!==play.id),play]
    setPlays(updated); setActiveId(play.id); savePlays(updated)
  }
  function load(p: SavedPlay) { setMarkers(p.markers); setLines(p.lines); setPlayName(p.name); setActiveId(p.id); stopAnim(true) }
  function del(id: string) {
    const u = plays.filter(p=>p.id!==id); setPlays(u); savePlays(u)
    if (activeId===id) { setMarkers([]); setLines([]); setActiveId(null) }
  }
  function newPlay() { setMarkers([]); setLines([]); setPlayName("Nueva jugada"); setActiveId(null); stopAnim(true) }

  // ── Display ────────────────────────────────────────────────────────────────
  const dm = animM ?? markers
  const ball = dm.find(m=>m.team==="ball")
  const bp: [number,number]|null = animBall ?? (ball?[ball.x,ball.y]:null)
  const passLines = lines.filter(l=>l.type==="pass")

  // ── Tool config ────────────────────────────────────────────────────────────
  const TOOLS: {id:Tool;label:string;icon:string;color:string;desc:string}[] = [
    {id:"move",  label:"Mover",      icon:"✋", color:"bg-slate-700",  desc:"Arrastra jugadores y balón"},
    {id:"run",   label:"Movimiento", icon:"→",  color:"bg-sky-600",    desc:"Dibuja ruta del jugador (azul)"},
    {id:"pass",  label:"Pase",       icon:"⚡", color:"bg-amber-500",  desc:"Dibuja secuencia de pases (amarillo)"},
    {id:"home",  label:"+ Local",    icon:"●",  color:"bg-blue-700",   desc:"Añade jugador local"},
    {id:"away",  label:"+ Rival",    icon:"●",  color:"bg-red-600",    desc:"Añade jugador rival"},
    {id:"ball",  label:"+ Balón",    icon:"○",  color:"bg-white text-slate-800", desc:"Coloca el balón"},
    {id:"erase", label:"Borrar",     icon:"✕",  color:"bg-rose-600",   desc:"Clic sobre elemento para borrar"},
  ]

  return (
    <div className="min-h-screen bg-slate-100 pb-24 md:pb-0 md:pl-64">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Tablero Táctico</h1>
            <p className="text-xs text-slate-500 mt-0.5">Diseña jugadas y anima los movimientos del equipo</p>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-4">

          {/* ── Pitch panel ── */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

            {/* Toolbar */}
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <div className="flex flex-wrap items-center gap-2">
                {TOOLS.map(t => (
                  <button key={t.id} onClick={()=>setTool(t.id)}
                    title={t.desc}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      tool===t.id
                        ? "ring-2 ring-offset-1 ring-blue-500 border-blue-500 bg-blue-600 text-white shadow"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}>
                    <span className="text-sm leading-none">{t.icon}</span>
                    {t.label}
                  </button>
                ))}

                <div className="ml-auto flex items-center gap-2">
                  <select onChange={e=>applyFormation(e.target.value)} defaultValue=""
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-blue-400">
                    <option value="" disabled>Formación…</option>
                    {Object.keys(FORMATIONS).map(f=><option key={f} value={f}>{f}</option>)}
                  </select>
                  <button onClick={()=>{setMarkers([]);setLines([])}}
                    className="px-3 py-1.5 rounded-lg text-xs border border-slate-200 bg-white text-slate-500 hover:text-red-500 hover:border-red-200 transition-colors font-semibold">
                    Limpiar todo
                  </button>
                </div>
              </div>

              {/* Active tool hint */}
              <p className="text-[10px] text-slate-400 mt-1.5">
                {TOOLS.find(t=>t.id===tool)?.desc}
                {tool==="pass" && passLines.length>0 && <span className="ml-2 text-amber-500 font-semibold">· {passLines.length} pase{passLines.length>1?"s":""} dibujado{passLines.length>1?"s":""} (se animan en orden)</span>}
              </p>
            </div>

            {/* Pitch */}
            <div className="p-4">
              <div className="relative mx-auto rounded-xl overflow-hidden shadow-lg" style={{maxWidth:"720px",aspectRatio:"105/68",background:"linear-gradient(160deg,#1a6b3a 0%,#1d7a40 50%,#1a6b3a 100%)"}}>
                {/* grass stripes */}
                <div className="absolute inset-0 opacity-20" style={{backgroundImage:"repeating-linear-gradient(90deg,transparent,transparent 60px,rgba(0,0,0,0.15) 60px,rgba(0,0,0,0.15) 120px)"}}/>

                <svg ref={svgRef} viewBox="0 0 105 68" className="absolute inset-0 w-full h-full"
                  style={{cursor: tool==="move"?"grab":tool==="erase"?"crosshair":"crosshair"}}
                  onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}>
                  <Defs/>
                  <Pitch/>

                  {/* Committed lines */}
                  {lines.map(line => (
                    <g key={line.id}>
                      <polyline
                        points={line.points.map(p=>p.join(",")).join(" ")}
                        stroke={line.type==="pass"?"#fbbf24":"#38bdf8"}
                        strokeWidth={line.type==="pass"?0.9:0.75}
                        fill="none" strokeLinecap="round" strokeLinejoin="round"
                        markerEnd={`url(#arr-${line.type})`}
                        opacity={0.9}
                        strokeDasharray={line.type==="pass"?"none":"none"}
                      />
                      {/* pass order badge */}
                      {line.type==="pass" && line.order && (() => {
                        const mid = line.points[Math.floor(line.points.length/2)]
                        const isActive = passStep === (line.order-1)
                        return (
                          <g>
                            <circle cx={mid[0]} cy={mid[1]-3} r={2.4}
                              fill={isActive?"#fbbf24":"rgba(251,191,36,0.3)"}
                              stroke={isActive?"#f59e0b":"rgba(251,191,36,0.5)"} strokeWidth={0.3}
                            />
                            <text x={mid[0]} y={mid[1]-3} textAnchor="middle" dominantBaseline="middle"
                              fontSize={1.9} fontWeight="bold"
                              fill={isActive?"#1e293b":"rgba(251,191,36,0.9)"}>
                              {line.order}
                            </text>
                          </g>
                        )
                      })()}
                    </g>
                  ))}

                  {/* Drawing preview */}
                  {drawing && drawing.length>=2 && (
                    <polyline points={drawing.map(p=>p.join(",")).join(" ")}
                      stroke={tool==="pass"?"#fbbf24":"#38bdf8"} strokeWidth={0.8}
                      fill="none" strokeLinecap="round" strokeDasharray="2 1.5" opacity={0.7}
                    />
                  )}

                  {/* Players */}
                  {dm.filter(m=>m.team!=="ball").map(m=>{
                    const isHome = m.team==="home"
                    return (
                      <g key={m.id} style={{cursor:tool==="move"?"grab":tool==="erase"?"pointer":"default"}}>
                        {/* shadow */}
                        <ellipse cx={m.x} cy={m.y+4} rx={2.8} ry={0.8} fill="rgba(0,0,0,0.15)"/>
                        {/* body */}
                        <circle cx={m.x} cy={m.y} r={3.5}
                          fill={isHome?"#1d4ed8":"#dc2626"}
                          stroke="white" strokeWidth={0.6}
                          filter={playing&&animM?"url(#glow)":"none"}
                        />
                        {/* number */}
                        {m.label && (
                          <text x={m.x} y={m.y+0.9} textAnchor="middle" dominantBaseline="middle"
                            fontSize={2.3} fontWeight="bold" fill="white" style={{userSelect:"none"}}>
                            {m.label}
                          </text>
                        )}
                      </g>
                    )
                  })}

                  {/* Ball */}
                  {bp && (
                    <g>
                      <ellipse cx={bp[0]} cy={bp[1]+2.8} rx={2} ry={0.6} fill="rgba(0,0,0,0.15)"/>
                      <circle cx={bp[0]} cy={bp[1]} r={2.5} fill="white" stroke="#e2e8f0" strokeWidth={0.4}/>
                      {/* pentagon pattern */}
                      <circle cx={bp[0]} cy={bp[1]} r={2.5} fill="none" stroke="#94a3b8" strokeWidth={0.25} strokeDasharray="1.3 1.1"/>
                      <circle cx={bp[0]} cy={bp[1]} r={0.8} fill="#94a3b8"/>
                    </g>
                  )}
                </svg>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-3 px-1 text-[10px] text-slate-400 font-medium">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-700 inline-block border-2 border-white shadow-sm"/>Local</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-600 inline-block border-2 border-white shadow-sm"/>Rival</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-white border-2 border-slate-300 inline-block shadow-sm"/>Balón</span>
                <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-sky-400 inline-block"/>Movimiento jugador</span>
                <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-amber-400 inline-block"/>Secuencia de pases</span>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3 mt-4">
                {playing ? (
                  <button onClick={()=>stopAnim(true)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold shadow-lg hover:bg-red-600 transition-colors">
                    ⏹ Detener
                  </button>
                ) : (
                  <>
                    <button onClick={playAnim}
                      disabled={lines.length===0 && markers.filter(m=>m.team!=="ball").length===0}
                      className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      ▶ Ver jugada completa
                    </button>
                    <button onClick={()=>stopAnim(true)}
                      title="Volver al inicio"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-600 text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors">
                      ↺ Reiniciar
                    </button>
                  </>
                )}
              </div>

              {/* Pass sequence progress */}
              {passLines.length > 1 && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <span className="text-xs text-slate-400 font-medium">Pases:</span>
                  {passLines.map((_,i) => (
                    <div key={i} className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center border-2 transition-all duration-200 ${
                      playing && passStep===i ? "bg-amber-400 border-amber-500 text-slate-900 scale-125 shadow-md"
                        : playing && passStep>i ? "bg-amber-100 border-amber-300 text-amber-700"
                        : "bg-slate-100 border-slate-200 text-slate-400"
                    }`}>{i+1}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Side panel ── */}
          <div className="xl:w-72 space-y-4">

            {/* Save */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
              <h2 className="text-sm font-bold text-slate-800 mb-3">💾 Guardar jugada</h2>
              <input value={playName} onChange={e=>setPlayName(e.target.value)}
                placeholder="Nombre de la jugada"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 mb-3 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <div className="flex gap-2">
                <button onClick={save}
                  className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors">
                  Guardar
                </button>
                <button onClick={newPlay}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors">
                  Nueva
                </button>
              </div>
            </div>

            {/* Stats */}
            {(markers.length>0||lines.length>0) && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Jugada actual</h2>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {label:"Locales",    val:markers.filter(m=>m.team==="home").length, color:"text-blue-600"},
                    {label:"Rivales",    val:markers.filter(m=>m.team==="away").length, color:"text-red-600"},
                    {label:"Pases",      val:lines.filter(l=>l.type==="pass").length,   color:"text-amber-600"},
                    {label:"Movimientos",val:lines.filter(l=>l.type==="run").length,    color:"text-sky-600"},
                  ].map(s=>(
                    <div key={s.label} className="bg-slate-50 rounded-xl p-2.5 text-center">
                      <p className={`text-lg font-black ${s.color}`}>{s.val}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved plays */}
            {plays.length>0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <h2 className="text-sm font-bold text-slate-800 mb-3">📂 Jugadas guardadas</h2>
                <div className="space-y-2">
                  {plays.map(p=>(
                    <div key={p.id} onClick={()=>load(p)}
                      className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                        activeId===p.id ? "border-blue-300 bg-blue-50" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                      }`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {p.markers.filter(m=>m.team==="home").length} loc · {p.markers.filter(m=>m.team==="away").length} riv · {p.lines.filter(l=>l.type==="pass").length} pases
                        </p>
                      </div>
                      <button onClick={e=>{e.stopPropagation();del(p.id)}}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors text-sm">
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
    </div>
  )
}
