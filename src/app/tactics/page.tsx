"use client"
import { useState, useRef, useCallback, useEffect } from "react"
import AppShell from "@/components/layout/AppShell"

// ── Types ──────────────────────────────────────────────────────────────────────
type Team = "home" | "away" | "ball"
interface Marker { id: string; x: number; y: number; team: Team; label?: string }
interface TLine  { id: string; type: "run" | "pass"; pts: [number,number][] }
interface Play   { id: string; name: string; markers: Marker[]; lines: TLine[] }
type Tool = "move" | "run" | "pass" | "home" | "away" | "ball" | "erase"

const SEG_MS  = 1200  // ms per pass segment
const RUN_MS  = 1800  // ms for all player runs
const HIT_R   = 4.5   // SVG units for hit detection
const KEY      = "tactics_v3"

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

const FMTS: Record<string,{x:number;y:number}[]> = {
  "4-3-3":   [{x:5,y:34},{x:20,y:9},{x:20,y:24},{x:20,y:44},{x:20,y:59},{x:40,y:17},{x:40,y:34},{x:40,y:51},{x:60,y:12},{x:60,y:34},{x:60,y:56}],
  "4-4-2":   [{x:5,y:34},{x:20,y:9},{x:20,y:24},{x:20,y:44},{x:20,y:59},{x:44,y:9},{x:44,y:27},{x:44,y:41},{x:44,y:59},{x:66,y:24},{x:66,y:44}],
  "3-5-2":   [{x:5,y:34},{x:20,y:17},{x:20,y:34},{x:20,y:51},{x:36,y:5},{x:40,y:20},{x:40,y:34},{x:40,y:48},{x:36,y:63},{x:64,y:24},{x:64,y:44}],
  "4-2-3-1": [{x:5,y:34},{x:19,y:9},{x:19,y:24},{x:19,y:44},{x:19,y:59},{x:36,y:24},{x:36,y:44},{x:52,y:12},{x:52,y:34},{x:52,y:56},{x:68,y:34}],
}

function loadPlays(): Play[] { try { return JSON.parse(localStorage.getItem(KEY)??"[]") } catch { return [] } }
function savePlays(p: Play[]) { localStorage.setItem(KEY, JSON.stringify(p)) }

// ── Pitch lines ────────────────────────────────────────────────────────────────
function PitchSVG() {
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

// ── Main ───────────────────────────────────────────────────────────────────────
export default function TacticsPage() {
  // ── Edit state (source of truth — never modified during animation)
  const [markers, setMarkers] = useState<Marker[]>([])
  const [lines,   setLines]   = useState<TLine[]>([])
  const [tool,    setTool]    = useState<Tool>("move")
  const [drawing, setDrawing] = useState<[number,number][]|null>(null)
  const [dragging,setDragging]= useState<string|null>(null)
  const [playName,setPlayName]= useState("Nueva jugada")
  const [plays,   setPlays]   = useState<Play[]>([])
  const [activeId,setActiveId]= useState<string|null>(null)

  // ── Animation state (overlaid on top, never touches edit state)
  const [animPos,  setAnimPos]  = useState<Record<string,[number,number]>|null>(null)
  const [animBall, setAnimBall] = useState<[number,number]|null>(null)
  const [playing,  setPlaying]  = useState(false)
  const [passStep, setPassStep] = useState(-1)
  const rafRef = useRef(0)

  useEffect(()=>{ setPlays(loadPlays()) },[])

  // ── SVG coords ────────────────────────────────────────────────────────────
  const svgRef = useRef<SVGSVGElement>(null)
  const toSVG = useCallback((cx:number,cy:number):[number,number]=>{
    const s=svgRef.current; if(!s) return [0,0]
    const p=s.createSVGPoint(); p.x=cx; p.y=cy
    const {x,y}=p.matrixTransform(s.getScreenCTM()!.inverse())
    return [Math.max(0,Math.min(105,x)), Math.max(0,Math.min(68,y))]
  },[])

  // ── Stop & reset animation completely ────────────────────────────────────
  const resetAnim = useCallback(()=>{
    cancelAnimationFrame(rafRef.current)
    setPlaying(false)
    setPassStep(-1)
    setAnimPos(null)
    setAnimBall(null)
  },[])

  // ── Play animation ────────────────────────────────────────────────────────
  function startPlay() {
    resetAnim()

    const passLines = lines.filter(l=>l.type==="pass")
    const runLines  = lines.filter(l=>l.type==="run")

    // snapshot original positions from edit state
    const origPos: Record<string,[number,number]> = {}
    for (const m of markers) origPos[m.id]=[m.x,m.y]

    const ball = markers.find(m=>m.team==="ball")
    const origBall:[number,number] = ball ? [ball.x,ball.y] : [52.5,34]

    // run assignments: closest player within 9 units
    const runMap: {id:string; pts:[number,number][]}[] = []
    for (const rl of runLines) {
      let best:Marker|null=null, bestD=9
      for (const m of markers) {
        if(m.team==="ball") continue
        const d=Math.hypot(m.x-rl.pts[0][0],m.y-rl.pts[0][1])
        if(d<bestD){bestD=d;best=m}
      }
      if(best) runMap.push({id:best.id, pts:rl.pts})
    }

    // pass chain: cursor starts at ball, follows each pass line in order
    let cursor:[number,number]=[...origBall]
    const passSegs:[number,number][][] = passLines.map(pl=>{
      const seg:[number,number][]=[cursor,...pl.pts]
      cursor=[...pl.pts[pl.pts.length-1]]
      return seg
    })

    const totalMs = passSegs.length>0 ? passSegs.length*SEG_MS : RUN_MS
    if(passSegs.length>0) setPassStep(0)
    setPlaying(true)

    const t0=performance.now()
    function frame(now:number){
      const el=now-t0
      const gt=Math.min(el/totalMs,1)

      // ball position
      let bp:[number,number]=[...origBall]
      if(passSegs.length>0){
        const si=Math.min(Math.floor(el/SEG_MS),passSegs.length-1)
        const st=Math.min((el-si*SEG_MS)/SEG_MS,1)
        bp=pathAt(passSegs[si],st)
        setPassStep(si)
      }

      // player positions
      const np:Record<string,[number,number]>={}
      for(const [id,pos] of Object.entries(origPos)){
        const ra=runMap.find(r=>r.id===id)
        np[id] = ra ? pathAt(ra.pts,gt) : pos
      }

      setAnimPos(np)
      setAnimBall(bp)

      if(gt<1){
        rafRef.current=requestAnimationFrame(frame)
      } else {
        // animation done: hold 800ms then reset
        setTimeout(()=>{ resetAnim() },800)
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
      if(hit) setDragging(hit.id)
    } else if(tool==="run"||tool==="pass"){
      setDrawing([pos])
    } else if(tool==="home"){
      setMarkers(ms=>[...ms,{id:uid(),x:pos[0],y:pos[1],team:"home",label:String(ms.filter(m=>m.team==="home").length+1)}])
    } else if(tool==="away"){
      setMarkers(ms=>[...ms,{id:uid(),x:pos[0],y:pos[1],team:"away",label:String(ms.filter(m=>m.team==="away").length+1)}])
    } else if(tool==="ball"){
      setMarkers(ms=>[...ms.filter(m=>m.team!=="ball"),{id:uid(),x:pos[0],y:pos[1],team:"ball"}])
    } else if(tool==="erase"){
      const hm=markers.find(m=>Math.hypot(m.x-pos[0],m.y-pos[1])<HIT_R)
      if(hm){ setMarkers(ms=>ms.filter(m=>m.id!==hm.id)); return }
      const hl=lines.find(l=>{
        const a=l.pts[0], b=l.pts[l.pts.length-1]
        return Math.hypot(a[0]-pos[0],a[1]-pos[1])<HIT_R||Math.hypot(b[0]-pos[0],b[1]-pos[1])<HIT_R
      })
      if(hl) setLines(ls=>ls.filter(l=>l.id!==hl.id))
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
      setLines(ls=>[...ls,{id:uid(),type:tool==="pass"?"pass":"run",pts:drawing}])
    }
    setDrawing(null)
  }

  // ── Formation ──────────────────────────────────────────────────────────────
  function applyFmt(key:string){
    const f=FMTS[key]; if(!f) return
    resetAnim()
    const ball=markers.find(m=>m.team==="ball")
    const nm:Marker[]=f.map((p,i)=>({id:uid(),x:p.x,y:p.y,team:"home",label:i===0?"P":String(i)}))
    if(ball) nm.push({...ball,id:uid()})
    setMarkers(nm); setLines([])
  }

  // ── Save/load ──────────────────────────────────────────────────────────────
  function save(){
    const p:Play={id:activeId??uid(),name:playName,markers,lines}
    const u=[...plays.filter(x=>x.id!==p.id),p]
    setPlays(u); setActiveId(p.id); savePlays(u)
  }
  function load(p:Play){ resetAnim(); setMarkers(p.markers); setLines(p.lines); setPlayName(p.name); setActiveId(p.id) }
  function del(id:string){
    const u=plays.filter(p=>p.id!==id); setPlays(u); savePlays(u)
    if(activeId===id){ resetAnim(); setMarkers([]); setLines([]); setActiveId(null) }
  }
  function newPlay(){ resetAnim(); setMarkers([]); setLines([]); setPlayName("Nueva jugada"); setActiveId(null) }

  // ── Display positions ──────────────────────────────────────────────────────
  const dispMarkers = markers.map(m=>animPos ? {...m, x:animPos[m.id]?.[0]??m.x, y:animPos[m.id]?.[1]??m.y} : m)
  const ballM       = dispMarkers.find(m=>m.team==="ball")
  const ballPos:[number,number]|null = animBall ?? (ballM?[ballM.x,ballM.y]:null)
  const passLines   = lines.filter(l=>l.type==="pass")

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

        <div className="flex flex-col xl:flex-row gap-4">
          {/* ── Pitch panel ── */}
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">

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
                  <select onChange={e=>{applyFmt(e.target.value);e.target.value=""}} defaultValue=""
                    className="text-xs border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                    <option value="" disabled>Formación…</option>
                    {Object.keys(FMTS).map(f=><option key={f} value={f}>{f}</option>)}
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
                style={{maxWidth:720,aspectRatio:"105/68",background:"linear-gradient(160deg,#1a6b3a,#1d7a40 50%,#1a6b3a)"}}>
                {/* grass stripes */}
                <div className="absolute inset-0 opacity-[0.12]"
                  style={{backgroundImage:"repeating-linear-gradient(90deg,transparent,transparent 55px,rgba(0,0,0,1) 55px,rgba(0,0,0,1) 110px)"}}/>

                <svg ref={svgRef} viewBox="0 0 105 68" className="absolute inset-0 w-full h-full"
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

                  <PitchSVG/>

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
                    <button onClick={resetAnim}
                      className="px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 transition-colors">
                      ↺ Reiniciar
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
                <button onClick={save}
                  className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors">
                  Guardar
                </button>
                <button onClick={newPlay}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Nueva
                </button>
              </div>
            </div>

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
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{p.name}</p>
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
