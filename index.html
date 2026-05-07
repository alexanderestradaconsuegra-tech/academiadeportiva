import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

/* ══════════════════════════════════════════════
   CONFIG — CAMBIA ESTA URL A TU N8N
══════════════════════════════════════════════ */
const API = "https://TU-N8N.easypanel.host/webhook/sa";
/* ══════════════════════════════════════════════ */

/* ── API HELPER ─────────────────────────────── */
const apiFetch = async (path, method = "GET", body = null) => {
  const token = localStorage.getItem("sa_token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(API + path, {
    method, headers,
    body: body ? JSON.stringify(body) : null,
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
};

/* ── WHATSAPP HELPER ────────────────────────── */
const openWA = (telefono, mensaje) => {
  const clean = (telefono || "").replace(/\D/g, "");
  if (!clean) return;
  window.open(`https://wa.me/${clean}?text=${encodeURIComponent(mensaje)}`, "_blank");
};

/* ── FORMATO CLP ────────────────────────────── */
const fmtCLP = v => `$${Number(v || 0).toLocaleString("es-CL")}`;

/* ══════════════════════════════════════════════
   THEME
══════════════════════════════════════════════ */
const T = {
  bg: "#060f1c", surface: "#0c1a2e", card: "#101f35", cardHov: "#152540",
  border: "rgba(255,255,255,0.07)", borderG: "rgba(0,230,118,0.35)",
  green: "#00e676", orange: "#ff6b00", blue: "#00b4ff", purple: "#a855f7",
  text: "#e2eeff", muted: "#7a9ab8", dim: "#3d5a72", red: "#ff4455",
  yellow: "#ffd23f", grad: "linear-gradient(135deg,#00e676,#00b4ff)",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:${T.bg};color:${T.text};font-family:'Barlow',sans-serif}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${T.green}40;border-radius:2px}
.fade{animation:fi .3s ease}@keyframes fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.pulse{animation:pl 2s infinite}@keyframes pl{0%,100%{opacity:1}50%{opacity:.3}}
.glow{text-shadow:0 0 40px ${T.green}55}
.ch{transition:all .18s;cursor:pointer}.ch:hover{background:${T.cardHov}!important;border-color:${T.borderG}!important}
.bp{background:${T.green};color:#06111f;border:none;padding:10px 22px;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;border-radius:8px;cursor:pointer;letter-spacing:1px;text-transform:uppercase;transition:all .2s}
.bp:hover{background:#2dfb88}.bp:disabled{opacity:.5;cursor:not-allowed}
.bg{background:transparent;color:${T.text};border:1px solid ${T.border};padding:9px 18px;font-family:'Barlow',sans-serif;font-size:13px;border-radius:8px;cursor:pointer;transition:all .2s}
.bg:hover{border-color:${T.green};color:${T.green}}
.inp{background:${T.surface};border:1px solid ${T.border};border-radius:8px;padding:10px 14px;color:${T.text};font-size:13px;width:100%;outline:none;transition:all .2s}
.inp:focus{border-color:${T.green}}.inp::placeholder{color:${T.dim}}
.sel{background:${T.surface};border:1px solid ${T.border};border-radius:8px;padding:9px 14px;color:${T.text};font-size:13px;outline:none;width:100%;cursor:pointer}
.sel:focus{border-color:${T.green}}
.ni{display:flex;align-items:center;gap:10px;padding:9px 14px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;color:${T.muted};transition:all .18s}
.ni:hover{background:${T.card};color:${T.text}}.ni.act{background:${T.green}18;color:${T.green}}
.badge{padding:2px 9px;border-radius:20px;font-size:10px;font-weight:700;font-family:'Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.5px;display:inline-block}
.bg2{background:${T.green}20;color:${T.green};border:1px solid ${T.green}40}
.bo{background:${T.orange}20;color:${T.orange};border:1px solid ${T.orange}40}
.br{background:${T.red}20;color:${T.red};border:1px solid ${T.red}40}
.bb{background:${T.blue}20;color:${T.blue};border:1px solid ${T.blue}40}
.bp2{background:${T.purple}20;color:${T.purple};border:1px solid ${T.purple}40}
.bgr{background:${T.dim}20;color:${T.muted};border:1px solid ${T.dim}40}
.sc{background:${T.card};border:1px solid ${T.border};border-radius:12px;padding:18px;position:relative;overflow:hidden}
.sc::before{content:'';position:absolute;top:0;left:0;right:0;height:3px}
.scg::before{background:${T.green}}.sco::before{background:${T.orange}}.scb::before{background:${T.blue}}.scr::before{background:${T.red}}.scp::before{background:${T.purple}}
.av{border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Rajdhani',sans-serif;font-weight:700;flex-shrink:0}
table{border-collapse:collapse;width:100%}
th{color:${T.muted};font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;padding:8px 12px;text-align:left;border-bottom:1px solid ${T.border}}
td{padding:10px 12px;font-size:13px;border-bottom:1px solid rgba(255,255,255,.04)}
tr:last-child td{border-bottom:none}tr:hover td{background:rgba(0,230,118,.025)}
.prog{background:${T.border};border-radius:4px;height:5px;overflow:hidden}
.progf{height:100%;border-radius:4px}
.ovl{position:fixed;inset:0;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(6px)}
.mc{background:${T.surface};border:1px solid ${T.border};border-radius:16px;padding:28px;max-width:92vw;max-height:90vh;overflow-y:auto}
.hero-grid{background-image:radial-gradient(circle,rgba(0,230,118,.07) 1px,transparent 1px);background-size:40px 40px}
.sw{width:40px;height:22px;border-radius:11px;cursor:pointer;transition:background .2s;position:relative;flex-shrink:0}
.swk{width:16px;height:16px;background:white;border-radius:50%;position:absolute;top:3px;transition:left .2s}
.notif{position:fixed;top:62px;right:20px;z-index:600;border-radius:8px;padding:10px 18px;font-size:13px;animation:fi .3s ease}
.loader{display:flex;align-items:center;justify-content:center;padding:48px;color:${T.muted};font-size:14px}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px;color:${T.muted};gap:8px;font-size:14px}
`;

/* ── HELPERS ────────────────────────────────── */
const avColors = ["#00e676","#00b4ff","#ff6b00","#ff4455","#ffd23f","#a855f7","#f97316","#10b981"];
const aC = i => avColors[i % avColors.length];

const Badge = ({ t, children }) => {
  const m = { green:"bg2", orange:"bo", red:"br", blue:"bb", purple:"bp2", gray:"bgr" };
  return <span className={`badge ${m[t]||"bgr"}`}>{children}</span>;
};

const ST = ({ label, value, color, cls, icon, sub }) => (
  <div className={`sc ${cls}`}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
      <span style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:.5}}>{label}</span>
      <span style={{fontSize:18}}>{icon}</span>
    </div>
    <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:32,fontWeight:700,color,lineHeight:1}}>{value}</div>
    {sub && <div style={{fontSize:11,color:T.muted,marginTop:5}}>{sub}</div>}
  </div>
);

const Sec = ({ children }) => (
  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:600,color:T.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>{children}</div>
);

const Loader = () => <div className="loader">Cargando...</div>;

const Notif = ({ msg, type, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
  const c = type==="ok" ? T.green : type==="err" ? T.red : T.blue;
  return <div className="notif" style={{background:`${c}20`,border:`1px solid ${c}40`,color:c}}>
    {type==="ok"?"✓":type==="err"?"✕":"ℹ"} {msg}
  </div>;
};

/* ══════════════════════════════════════════════
   AUTH
══════════════════════════════════════════════ */
const AuthModal = ({ mode, onClose, onSuccess }) => {
  const [email, setEmail] = useState("autix");
  const [pass, setPass]   = useState("1234");
  const [name, setName]   = useState("");
  const [city, setCity]   = useState("");
  const [m, setM]         = useState(mode);
  const [err, setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  const doLogin = async () => {
    setLoading(true); setErr("");
    try {
      const data = await apiFetch("/login", "POST", { email, password: pass });
      localStorage.setItem("sa_token", data.token);
      localStorage.setItem("sa_academia", JSON.stringify(data.academia));
      onSuccess(data.academia);
    } catch {
      setErr("Credenciales incorrectas. Usuario: autix / Clave: 1234");
    }
    setLoading(false);
  };

  const doReg = async () => {
    if (!name || !email || !pass) { setErr("Completa todos los campos"); return; }
    setLoading(true); setErr("");
    try {
      const data = await apiFetch("/register", "POST", { nombre: name, ciudad: city, email, password: pass });
      localStorage.setItem("sa_token", data.token);
      localStorage.setItem("sa_academia", JSON.stringify(data.academia));
      onSuccess(data.academia);
    } catch {
      setErr("Error al registrar. Intenta con otro email.");
    }
    setLoading(false);
  };

  return (
    <div className="ovl" onClick={onClose}>
      <div className="mc fade" style={{width:420}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div>
            <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:22,fontWeight:700,letterSpacing:1}}>
              {m==="login"?"INGRESAR":"NUEVA ACADEMIA"}
            </div>
            <div style={{fontSize:12,color:T.muted,marginTop:2}}>
              {m==="login"?"Accede a tu plataforma":"14 días gratis"}
            </div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:20}}>✕</button>
        </div>

        {m==="register" && <>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:10,color:T.muted,display:"block",marginBottom:5,letterSpacing:.5}}>NOMBRE ACADEMIA</label>
            <input className="inp" placeholder="Academia Élite FC" value={name} onChange={e=>setName(e.target.value)}/>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:10,color:T.muted,display:"block",marginBottom:5,letterSpacing:.5}}>CIUDAD</label>
            <input className="inp" placeholder="Santiago" value={city} onChange={e=>setCity(e.target.value)}/>
          </div>
        </>}

        <div style={{marginBottom:14}}>
          <label style={{fontSize:10,color:T.muted,display:"block",marginBottom:5,letterSpacing:.5}}>USUARIO O EMAIL</label>
          <input className="inp" placeholder="autix" value={email} onChange={e=>setEmail(e.target.value)}/>
        </div>
        <div style={{marginBottom:22}}>
          <label style={{fontSize:10,color:T.muted,display:"block",marginBottom:5,letterSpacing:.5}}>CONTRASEÑA</label>
          <input className="inp" type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&doLogin()}/>
        </div>

        {err && <div style={{background:`${T.red}15`,border:`1px solid ${T.red}30`,borderRadius:8,padding:"10px 14px",fontSize:12,color:T.red,marginBottom:16}}>{err}</div>}

        <button className="bp" style={{width:"100%",padding:13,fontSize:14}} onClick={m==="login"?doLogin:doReg} disabled={loading}>
          {loading ? "..." : m==="login" ? "INGRESAR →" : "CREAR ACADEMIA →"}
        </button>

        <div style={{textAlign:"center",marginTop:16}}>
          <span style={{fontSize:12,color:T.muted}}>{m==="login"?"¿Sin cuenta?":"¿Ya tienes cuenta?"}</span>
          <button onClick={()=>{setM(m==="login"?"register":"login");setErr("")}}
            style={{background:"none",border:"none",color:T.green,cursor:"pointer",fontSize:12,marginLeft:6,fontWeight:600}}>
            {m==="login"?"Registrarse":"Ingresar"}
          </button>
        </div>
        {m==="login" && (
          <div style={{background:`${T.green}10`,border:`1px solid ${T.green}20`,borderRadius:8,padding:"10px 14px",fontSize:11,color:T.muted,marginTop:16}}>
            💡 Demo: <strong style={{color:T.text}}>autix</strong> / <strong style={{color:T.text}}>1234</strong>
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   LANDING
══════════════════════════════════════════════ */
const Landing = ({ onLogin, onReg }) => {
  const feats = [
    { ic:"⚽", t:"Deportistas",    d:"Registro por categoría, estado activo/lesionado y gestión simplificada" },
    { ic:"💳", t:"Pagos & Cuotas", d:"Control mensual con Mercado Pago y recordatorio directo a WhatsApp" },
    { ic:"🏆", t:"Torneos",        d:"Crea torneos, agrega partidos, consulta posición y próximos rivales" },
    { ic:"💼", t:"Nómina",         d:"Paga sueldos del cuerpo técnico y lleva historial de gastos mensual" },
    { ic:"📊", t:"Dashboard",      d:"Balance ingresos vs gastos, alertas de mora y resumen del mes" },
    { ic:"👤", t:"Portal Deportista", d:"El jugador entra con su usuario y ve su cuota, partido y estado" },
  ];

  const plans = [
    { n:"Starter", p:10, feats:["50 deportistas","Torneos y pagos","Portal deportista","Soporte email"] },
    { n:"Pro",     p:20, feats:["150 deportistas","Nómina completa","Dashboard avanzado","Soporte prioritario"], rec:true },
    { n:"Elite",   p:40, feats:["Ilimitados","Multi-sede","API propia","Soporte 24/7"] },
  ];

  return (
    <div style={{background:T.bg}}>
      <nav style={{position:"sticky",top:0,zIndex:50,background:`${T.bg}f2`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${T.border}`,padding:"0 24px",height:58,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,background:T.grad,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>⚽</div>
          <span style={{fontFamily:"'Rajdhani',sans-serif",fontSize:20,fontWeight:700,letterSpacing:2}}>SPORT<span style={{color:T.green}}>AGENT</span></span>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:10,color:T.dim}}>by <span style={{color:T.muted}}>Autix</span></span>
          <button className="bg" onClick={onLogin} style={{padding:"6px 16px",fontSize:12}}>Ingresar</button>
          <button className="bp" onClick={onReg}   style={{padding:"7px 18px",fontSize:12}}>Registrarse</button>
        </div>
      </nav>

      <section className="hero-grid" style={{padding:"80px 24px 70px",textAlign:"center",position:"relative",overflow:"hidden",minHeight:"90vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:`radial-gradient(circle,${T.green}0d 0%,transparent 70%)`,top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none"}}/>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:`${T.green}15`,border:`1px solid ${T.green}30`,borderRadius:20,padding:"5px 14px",marginBottom:22}}>
          <span className="pulse" style={{width:6,height:6,borderRadius:"50%",background:T.green,display:"inline-block"}}/>
          <span style={{fontSize:11,color:T.green,fontWeight:600,letterSpacing:1}}>PLATAFORMA Nº1 PARA ACADEMIAS DE FÚTBOL</span>
        </div>
        <h1 className="glow" style={{fontFamily:"'Rajdhani',sans-serif",fontSize:72,fontWeight:700,lineHeight:.9,letterSpacing:-2,marginBottom:22,textTransform:"uppercase"}}>
          GESTIONA TU<br/><span style={{color:T.green}}>ACADEMIA</span><br/>COMO ÉLITE
        </h1>
        <p style={{fontSize:16,color:T.muted,lineHeight:1.7,marginBottom:34,maxWidth:520}}>
          Deportistas, pagos, torneos, nómina y portal del deportista.<br/>
          Desde <strong style={{color:T.text}}>$10 USD/mes</strong>. Sin contratos.
        </p>
        <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:44}}>
          <button className="bp" onClick={onReg} style={{fontSize:14,padding:"12px 30px"}}>Comenzar 14 Días Gratis →</button>
          <button className="bg" onClick={onLogin} style={{fontSize:14,padding:"12px 28px"}}>Ver Demo</button>
        </div>
        <div style={{display:"flex",gap:40,justifyContent:"center",flexWrap:"wrap"}}>
          {[["98","Academias"],["4,200+","Deportistas"],["$0","Setup"],["Latam","Cobertura"]].map(([n,l])=>(
            <div key={l} style={{textAlign:"center"}}>
              <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:26,fontWeight:700,color:T.green}}>{n}</div>
              <div style={{fontSize:11,color:T.muted}}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{padding:"70px 24px",maxWidth:1100,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:50}}>
          <h2 style={{fontFamily:"'Rajdhani',sans-serif",fontSize:40,fontWeight:700,textTransform:"uppercase"}}>TODO EN <span style={{color:T.green}}>UN SOLO LUGAR</span></h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
          {feats.map((f,i)=>(
            <div key={i} className="sc ch" style={{padding:"24px 20px"}}>
              <div style={{fontSize:28,marginBottom:12}}>{f.ic}</div>
              <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:18,fontWeight:700,marginBottom:7}}>{f.t}</div>
              <div style={{fontSize:13,color:T.muted,lineHeight:1.65}}>{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{background:T.surface,padding:"60px 24px"}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:48}}>
            <h2 style={{fontFamily:"'Rajdhani',sans-serif",fontSize:40,fontWeight:700,textTransform:"uppercase"}}>PRECIOS <span style={{color:T.green}}>CLAROS</span></h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
            {plans.map((p,i)=>(
              <div key={i} style={{background:p.rec?`linear-gradient(135deg,${T.green}12,${T.blue}08)`:T.card,border:`${p.rec?2:1}px solid ${p.rec?T.green:T.border}`,borderRadius:14,padding:28,position:"relative"}}>
                {p.rec && <div style={{position:"absolute",top:14,right:14}}><Badge t="green">⭐ Popular</Badge></div>}
                <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:20,fontWeight:700,marginBottom:4}}>{p.n}</div>
                <div style={{display:"flex",alignItems:"baseline",gap:4,margin:"14px 0 18px"}}>
                  <span style={{fontSize:11,color:T.muted}}>USD</span>
                  <span style={{fontFamily:"'Rajdhani',sans-serif",fontSize:46,fontWeight:700,color:p.rec?T.green:T.text,lineHeight:1}}>{p.p}</span>
                  <span style={{fontSize:11,color:T.muted}}>/mes</span>
                </div>
                <div style={{borderTop:`1px solid ${T.border}`,paddingTop:14,marginBottom:18}}>
                  {p.feats.map((f,j)=>(
                    <div key={j} style={{display:"flex",gap:8,marginBottom:8,fontSize:13}}>
                      <span style={{color:T.green,flexShrink:0}}>✓</span>
                      <span style={{color:T.muted}}>{f}</span>
                    </div>
                  ))}
                </div>
                <button className={p.rec?"bp":"bg"} onClick={onReg} style={{width:"100%",padding:10,textAlign:"center",fontSize:13}}>Elegir {p.n}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{padding:"28px 24px",borderTop:`1px solid ${T.border}`,textAlign:"center"}}>
        <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:16,fontWeight:700,marginBottom:4}}>
          SPORT<span style={{color:T.green}}>AGENT</span>
          <span style={{color:T.dim,fontFamily:"'Barlow',sans-serif",fontSize:11,fontWeight:400,marginLeft:10}}>— Powered by Autix ©2025</span>
        </div>
      </footer>
    </div>
  );
};

/* ══════════════════════════════════════════════
   MODALES FORMULARIO
══════════════════════════════════════════════ */
const FormModal = ({ title, fields, onClose, onSave, loading }) => {
  const init = fields.reduce((a,f) => ({...a,[f.key]:f.default||""}), {});
  const [form, setForm] = useState(init);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  return (
    <div className="ovl" onClick={onClose}>
      <div className="mc fade" style={{width:440}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:20,fontWeight:700,letterSpacing:1}}>{title}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:20}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {fields.map(f => (
            <div key={f.key} style={{gridColumn:f.full?"1/-1":"auto"}}>
              <label style={{fontSize:10,color:T.muted,display:"block",marginBottom:5,letterSpacing:.5}}>{f.label}</label>
              {f.options
                ? <select className="sel" value={form[f.key]} onChange={e=>set(f.key,e.target.value)}>
                    {f.options.map(o=><option key={o}>{o}</option>)}
                  </select>
                : <input className="inp" type={f.type||"text"} placeholder={f.placeholder||""} value={form[f.key]} onChange={e=>set(f.key,e.target.value)}/>
              }
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:10,marginTop:22}}>
          <button className="bg" onClick={onClose} style={{flex:1}}>Cancelar</button>
          <button className="bp" onClick={()=>onSave(form)} style={{flex:2}} disabled={loading}>
            {loading?"Guardando...":"GUARDAR →"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   OVERVIEW TAB
══════════════════════════════════════════════ */
const OverviewTab = ({ academia }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/dashboard").then(d => setStats(d)).catch(()=>setStats(null)).finally(()=>setLoading(false));
  }, []);

  if (loading) return <Loader/>;

  const s = stats || {};
  const balance = (s.recaudado||0) - (s.nomina_total||0);

  return (
    <div className="fade">
      <div style={{marginBottom:22}}>
        <h1 style={{fontFamily:"'Rajdhani',sans-serif",fontSize:26,fontWeight:700}}>
          Bienvenido, <span style={{color:T.green}}>{academia.nombre||academia.name}</span>
        </h1>
        <p style={{color:T.muted,fontSize:13,marginTop:3}}>Resumen del mes actual</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
        <ST label="Deportistas Activos" value={s.activos||0}  color={T.green}  cls="scg" icon="👥" sub={`${s.lesionados||0} lesionados`}/>
        <ST label="Recaudado"  value={fmtCLP(s.recaudado||0)} color={T.blue}   cls="scb" icon="💰" sub={`${s.pagos_ok||0} pagos recibidos`}/>
        <ST label="Nómina"     value={fmtCLP(s.nomina_total||0)} color={T.purple} cls="scp" icon="💼" sub={`${s.nomina_pend||0} pendientes`}/>
        <ST label="Balance"    value={fmtCLP(balance)} color={balance>=0?T.green:T.red} cls={balance>=0?"scg":"scr"} icon="📈" sub="Ingresos − Nómina"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:20}}>
          <Sec>Estado de Pagos</Sec>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            {[
              ["Pagados",   s.pagos_ok||0,   T.green],
              ["Pendientes",s.pagos_pend||0, T.orange],
              ["Vencidos",  s.pagos_venc||0, T.red],
            ].map(([l,v,c])=>(
              <div key={l} style={{background:T.surface,borderRadius:10,padding:14,textAlign:"center"}}>
                <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:28,fontWeight:700,color:c}}>{v}</div>
                <div style={{fontSize:11,color:T.muted}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:20}}>
          <Sec>Alertas</Sec>
          {[
            s.pagos_pend>0  && { t:"warn", msg:`${s.pagos_pend} cuotas pendientes de cobro` },
            s.pagos_venc>0  && { t:"warn", msg:`${s.pagos_venc} cuotas vencidas` },
            s.nomina_pend>0 && { t:"warn", msg:`${s.nomina_pend} sueldos pendientes de pago` },
            s.torneos_activos>0 && { t:"ok", msg:`${s.torneos_activos} torneos en curso` },
          ].filter(Boolean).map((a,i)=>(
            <div key={i} style={{display:"flex",gap:10,padding:"9px 0",borderBottom:`1px solid rgba(255,255,255,.04)`,fontSize:13}}>
              <span>{a.t==="warn"?"⚠️":"✅"}</span>
              <span>{a.msg}</span>
            </div>
          ))}
          {(!s.pagos_pend && !s.nomina_pend) && (
            <div style={{color:T.muted,fontSize:13,textAlign:"center",paddingTop:16}}>✓ Todo al día</div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   DEPORTISTAS TAB
══════════════════════════════════════════════ */
const DeportistasTab = ({ onNotif }) => {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [search, setSearch]   = useState("");
  const [cat, setCat]         = useState("all");
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await apiFetch("/deportistas")); }
    catch { onNotif("Error cargando deportistas","err"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = data.filter(a => {
    const mc = cat==="all" || a.categoria===cat;
    const ms = (a.nombre||"").toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  });

  const del = async id => {
    if (!confirm("¿Eliminar este deportista?")) return;
    try {
      await apiFetch(`/deportistas/${id}`, "DELETE");
      onNotif("Deportista eliminado","ok");
      load();
    } catch { onNotif("Error al eliminar","err"); }
  };

  const toggleEstado = async (a) => {
    const nuevo = a.estado === "activo" ? "lesionado" : "activo";
    try {
      await apiFetch(`/deportistas/${a.id}`, "PUT", {...a, estado: nuevo});
      onNotif(`Estado cambiado a ${nuevo}`,"ok");
      load();
    } catch { onNotif("Error al actualizar","err"); }
  };

  const addDeportista = async form => {
    setSaving(true);
    try {
      await apiFetch("/deportistas", "POST", form);
      onNotif(`${form.nombre} agregado`,"ok");
      setShowAdd(false);
      load();
    } catch { onNotif("Error al guardar","err"); }
    setSaving(false);
  };

  const waReminder = (d) => {
    openWA(d.telefono, `Hola ${d.nombre.split(" ")[0]}, te recordamos que tu cuota mensual está pendiente. Por consultas escríbenos aquí.`);
  };

  const sbadge = s => s==="activo"?<Badge t="green">Activo</Badge>:s==="lesionado"?<Badge t="orange">Lesionado</Badge>:<Badge t="gray">{s}</Badge>;
  const fbadge = s => s==="pagado"?<Badge t="green">Pagada</Badge>:s==="vencido"?<Badge t="red">Vencida</Badge>:s==="pendiente"?<Badge t="orange">Pendiente</Badge>:<Badge t="gray">—</Badge>;

  const addFields = [
    { key:"nombre",    label:"NOMBRE COMPLETO",     full:true, placeholder:"Nombre Apellido" },
    { key:"edad",      label:"EDAD",                type:"number", placeholder:"15" },
    { key:"posicion",  label:"POSICIÓN",            options:["Delantero","Mediocampista","Defensa","Portero"] },
    { key:"categoria", label:"CATEGORÍA",           options:["Sub-13","Sub-15","Sub-17","Sub-20"] },
    { key:"telefono",  label:"TELÉFONO (apoderado)",full:true, placeholder:"+56 9..." },
    { key:"password",  label:"CONTRASEÑA ACCESO",   placeholder:"1234", default:"1234" },
  ];

  return (
    <div className="fade">
      <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap",alignItems:"center"}}>
        <input className="inp" placeholder="🔍 Buscar deportista..." value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:240}}/>
        <div style={{display:"flex",gap:6}}>
          {["all","Sub-17","Sub-15","Sub-13","Sub-20"].map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{
              padding:"7px 12px",borderRadius:8,border:`1px solid ${cat===c?T.green:T.border}`,
              background:cat===c?`${T.green}20`:"transparent",color:cat===c?T.green:T.muted,
              cursor:"pointer",fontSize:12,fontWeight:500,transition:"all .2s"
            }}>{c==="all"?"Todos":c}</button>
          ))}
        </div>
        <button className="bp" onClick={()=>setShowAdd(true)} style={{marginLeft:"auto",padding:"8px 18px",fontSize:12}}>+ Agregar</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
        {[["Total",filtered.length,T.text],["Activos",filtered.filter(a=>a.estado==="activo").length,T.green],
          ["Lesionados",filtered.filter(a=>a.estado==="lesionado").length,T.orange],["Al día",filtered.filter(a=>a.cuota_estado==="pagado").length,T.blue]
        ].map(([l,v,c])=>(
          <div key={l} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:12,textAlign:"center"}}>
            <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:28,fontWeight:700,color:c}}>{v}</div>
            <div style={{fontSize:11,color:T.muted}}>{l}</div>
          </div>
        ))}
      </div>

      {loading ? <Loader/> : filtered.length === 0 ? (
        <div className="empty">
          <span style={{fontSize:32}}>⚽</span>
          <span>No hay deportistas registrados</span>
          <button className="bp" onClick={()=>setShowAdd(true)} style={{padding:"8px 18px",fontSize:12,marginTop:8}}>Agregar primero</button>
        </div>
      ) : (
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
          <table>
            <thead><tr>{["Deportista","Categoría","Posición","Estado","Cuota","Acciones"].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((a,i)=>(
                <tr key={a.id}>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div className="av" style={{width:36,height:36,background:`${aC(i)}25`,color:aC(i),fontSize:12}}>
                        {(a.nombre||"?").slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{fontSize:13,fontWeight:600}}>{a.nombre}</div>
                        <div style={{fontSize:11,color:T.muted}}>{a.edad ? `${a.edad} años` : "—"} · {a.telefono||"Sin tel."}</div>
                      </div>
                    </div>
                  </td>
                  <td><Badge t="blue">{a.categoria||"—"}</Badge></td>
                  <td style={{color:T.muted,fontSize:12}}>{a.posicion||"—"}</td>
                  <td>{sbadge(a.estado)}</td>
                  <td>{fbadge(a.cuota_estado)}</td>
                  <td>
                    <div style={{display:"flex",gap:6}}>
                      <button className="bg" onClick={()=>toggleEstado(a)} style={{padding:"3px 10px",fontSize:11}} title="Cambiar estado">
                        {a.estado==="activo"?"🩹":"✓"}
                      </button>
                      {a.cuota_estado!=="pagado" && a.telefono && (
                        <button className="bg" onClick={()=>waReminder(a)}
                          style={{padding:"3px 10px",fontSize:11,color:"#25d366",borderColor:"#25d366"}} title="WhatsApp recordatorio">
                          WA
                        </button>
                      )}
                      <button className="bg" onClick={()=>del(a.id)} style={{padding:"3px 10px",fontSize:11,color:T.red,borderColor:T.red}}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && <FormModal title="NUEVO DEPORTISTA" fields={addFields} onClose={()=>setShowAdd(false)} onSave={addDeportista} loading={saving}/>}
    </div>
  );
};

/* ══════════════════════════════════════════════
   PAGOS TAB
══════════════════════════════════════════════ */
const PagosTab = ({ onNotif }) => {
  const now = new Date();
  const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const mesActual = meses[now.getMonth()];
  const anioActual = now.getFullYear();

  const [mes, setMes]   = useState(mesActual);
  const [anio, setAnio] = useState(anioActual);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await apiFetch(`/pagos?mes=${mes}&anio=${anio}`)); }
    catch { onNotif("Error cargando pagos","err"); }
    setLoading(false);
  }, [mes, anio]);

  useEffect(() => { load(); }, [load]);

  const markPaid = async (p, metodo="Transferencia") => {
    try {
      await apiFetch(`/pagos/${p.id}/pagar`, "PUT", { metodo });
      onNotif(`Pago de ${p.deportista} registrado`,"ok");
      load();
    } catch { onNotif("Error al registrar pago","err"); }
  };

  const waRemind = (p) => {
    openWA(p.telefono, `Hola ${p.deportista.split(" ")[0]}, te recordamos que tu cuota de ${mes} ${anio} está pendiente. Monto: ${fmtCLP(p.monto)}`);
  };

  const paid  = data.filter(p=>p.estado==="pagado");
  const pend  = data.filter(p=>p.estado!=="pagado");
  const total = paid.reduce((a,p)=>a+p.monto,0);

  const pie = [
    {name:"Pagado",value:paid.length,fill:T.green},
    {name:"Pendiente",value:data.filter(p=>p.estado==="pendiente").length,fill:T.orange},
    {name:"Vencido",value:data.filter(p=>p.estado==="vencido").length,fill:T.red},
  ].filter(d=>d.value>0);

  const sbadge = s => s==="pagado"?<Badge t="green">Pagado</Badge>:s==="vencido"?<Badge t="red">Vencido</Badge>:<Badge t="orange">Pendiente</Badge>;

  return (
    <div className="fade">
      {/* Filtros mes/año */}
      <div style={{display:"flex",gap:10,marginBottom:20,alignItems:"center"}}>
        <select className="sel" style={{width:140}} value={mes} onChange={e=>setMes(e.target.value)}>
          {meses.map(m=><option key={m}>{m}</option>)}
        </select>
        <select className="sel" style={{width:100}} value={anio} onChange={e=>setAnio(Number(e.target.value))}>
          {[2024,2025,2026].map(a=><option key={a}>{a}</option>)}
        </select>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
        <ST label="Recaudado"  value={fmtCLP(total)}   color={T.green}  cls="scg" icon="💰" sub={`${paid.length} de ${data.length}`}/>
        <ST label="Pagados"    value={paid.length}      color={T.green}  cls="scg" icon="✅"/>
        <ST label="Pendientes" value={data.filter(p=>p.estado==="pendiente").length} color={T.orange} cls="sco" icon="⏳"/>
        <ST label="Vencidos"   value={data.filter(p=>p.estado==="vencido").length}   color={T.red}    cls="scr" icon="🔴"/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16}}>
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
          <div style={{padding:"14px 18px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <Sec>Cuotas {mes} {anio}</Sec>
            {pend.length>0 && (
              <button className="bg" onClick={()=>onNotif("Abre WhatsApp en cada fila para recordar")} style={{padding:"6px 12px",fontSize:11}}>
                ℹ Ver pendientes
              </button>
            )}
          </div>
          {loading ? <Loader/> : data.length===0 ? (
            <div className="empty">
              <span>No hay cuotas para este período</span>
            </div>
          ) : (
            <table>
              <thead><tr>{["Deportista","Monto","Estado","Método","Fecha","Acciones"].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {data.map(p=>(
                  <tr key={p.id}>
                    <td style={{fontWeight:500}}>{p.deportista}</td>
                    <td style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600}}>{fmtCLP(p.monto)}</td>
                    <td>{sbadge(p.estado)}</td>
                    <td style={{color:T.muted,fontSize:12}}>{p.metodo||"—"}</td>
                    <td style={{color:T.muted,fontSize:12}}>{p.fecha_pago||"—"}</td>
                    <td>
                      <div style={{display:"flex",gap:6}}>
                        {p.estado!=="pagado" && <>
                          <button className="bg" onClick={()=>markPaid(p)} style={{padding:"3px 10px",fontSize:11,color:T.green,borderColor:T.green}}>
                            ✓ Pagar
                          </button>
                          {p.telefono && (
                            <button className="bg" onClick={()=>waRemind(p)}
                              style={{padding:"3px 10px",fontSize:11,color:"#25d366",borderColor:"#25d366"}}>
                              WA
                            </button>
                          )}
                        </>}
                        {p.estado==="pagado" && p.telefono && (
                          <button className="bg" onClick={()=>openWA(p.telefono,`Hola ${p.deportista.split(" ")[0]}, confirmamos tu pago de ${mes} ${anio} ✓`)}
                            style={{padding:"3px 10px",fontSize:11,color:"#25d366",borderColor:"#25d366"}}>
                            Confirmar WA
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:18}}>
            <Sec>Distribución</Sec>
            {pie.length > 0 && (
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={pie} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" stroke="none">
                    {pie.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                  </Pie>
                  <Tooltip contentStyle={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,fontSize:11}}/>
                </PieChart>
              </ResponsiveContainer>
            )}
            {pie.map((d,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginTop:7}}>
                <div style={{width:8,height:8,borderRadius:2,background:d.fill}}/>
                <span style={{fontSize:12,color:T.muted,flex:1}}>{d.name}</span>
                <span style={{fontSize:12,fontWeight:600}}>{d.value}</span>
              </div>
            ))}
          </div>

          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:18}}>
            <Sec>Resumen</Sec>
            {[["Total deportistas",data.length],["Recaudado",fmtCLP(total)],["Pendiente",fmtCLP(pend.reduce((a,p)=>a+p.monto,0))]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${T.border}40`,fontSize:13}}>
                <span style={{color:T.muted}}>{l}</span>
                <span style={{fontWeight:600}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   NÓMINA TAB
══════════════════════════════════════════════ */
const NominaTab = ({ onNotif }) => {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await apiFetch("/staff")); }
    catch { onNotif("Error cargando nómina","err"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const markPaid = async id => {
    try {
      await apiFetch(`/staff/${id}/pagar`, "PUT");
      onNotif("Sueldo registrado como pagado","ok");
      load();
    } catch { onNotif("Error al actualizar","err"); }
  };

  const markAllPaid = async () => {
    const pending = data.filter(s=>s.estado_pago==="pendiente");
    for (const s of pending) {
      await apiFetch(`/staff/${s.id}/pagar`, "PUT").catch(()=>{});
    }
    onNotif(`${pending.length} sueldos marcados como pagados`,"ok");
    load();
  };

  const del = async id => {
    if (!confirm("¿Eliminar este integrante?")) return;
    try {
      await apiFetch(`/staff/${id}`, "DELETE");
      onNotif("Integrante eliminado","ok");
      load();
    } catch { onNotif("Error al eliminar","err"); }
  };

  const waStaff = (s) => {
    openWA(s.telefono, `Hola ${s.nombre.split(" ")[0]}, tu sueldo de este mes ha sido procesado. ${fmtCLP(s.sueldo)} ✓`);
  };

  const addStaff = async form => {
    setSaving(true);
    try {
      await apiFetch("/staff", "POST", {...form, sueldo: Number(form.sueldo)||0});
      onNotif(`${form.nombre} agregado al cuerpo técnico`,"ok");
      setShowAdd(false); load();
    } catch { onNotif("Error al guardar","err"); }
    setSaving(false);
  };

  const totalNom = data.reduce((a,s)=>a+s.sueldo,0);
  const pend = data.filter(s=>s.estado_pago==="pendiente");
  const rolC = r => r.includes("DT")||r.includes("Asistente")?T.green:r.includes("Físic")||r.includes("Kines")?T.blue:r.includes("Admin")?T.purple:T.orange;

  const addFields = [
    { key:"nombre",       label:"NOMBRE COMPLETO",  full:true, placeholder:"Nombre Apellido" },
    { key:"rol",          label:"ROL / CARGO",       full:true, placeholder:"DT Principal, Kinesiólogo..." },
    { key:"categoria",    label:"CATEGORÍA",         options:["Sub-13","Sub-15","Sub-17","General","Admin"] },
    { key:"sueldo",       label:"SUELDO (CLP)",      type:"number", placeholder:"350000" },
    { key:"telefono",     label:"TELÉFONO",          placeholder:"+56 9..." },
    { key:"horas_semana", label:"HORAS/SEMANA",      type:"number", placeholder:"20", default:"20" },
  ];

  return (
    <div className="fade">
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
        <ST label="Total Nómina"  value={fmtCLP(totalNom)} color={T.purple} cls="scp" icon="💼"/>
        <ST label="Pagados"       value={data.filter(s=>s.estado_pago==="pagado").length} color={T.green} cls="scg" icon="✅"/>
        <ST label="Pendientes"    value={pend.length} color={pend.length>0?T.orange:T.green} cls={pend.length>0?"sco":"scg"} icon="⏳"/>
        <ST label="Sueldo Prom."  value={data.length?fmtCLP(Math.round(totalNom/data.length)):"—"} color={T.blue} cls="scb" icon="📊"/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16}}>
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
          <div style={{padding:"14px 18px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <Sec>Cuerpo Técnico</Sec>
            <div style={{display:"flex",gap:8}}>
              {pend.length>0 && <button className="bg" onClick={markAllPaid} style={{padding:"6px 12px",fontSize:11,color:T.green,borderColor:T.green}}>Pagar todos</button>}
              <button className="bp" onClick={()=>setShowAdd(true)} style={{padding:"6px 14px",fontSize:11}}>+ Agregar</button>
            </div>
          </div>
          {loading ? <Loader/> : data.length===0 ? (
            <div className="empty"><span>No hay staff registrado</span></div>
          ) : (
            <table>
              <thead><tr>{["Nombre","Rol","Categoría","Sueldo","Estado","Acciones"].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {data.map(s=>(
                  <tr key={s.id}>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div className="av" style={{width:34,height:34,background:`${rolC(s.rol)}20`,color:rolC(s.rol),fontSize:11}}>{(s.nombre||"?").slice(0,2).toUpperCase()}</div>
                        <div>
                          <div style={{fontSize:13,fontWeight:600}}>{s.nombre}</div>
                          <div style={{fontSize:11,color:T.muted}}>{s.telefono||"—"}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{color:rolC(s.rol),fontSize:12,fontWeight:600}}>{s.rol}</td>
                    <td><Badge t="blue">{s.categoria||"—"}</Badge></td>
                    <td style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600}}>{fmtCLP(s.sueldo)}</td>
                    <td>{s.estado_pago==="pagado"?<Badge t="green">Pagado</Badge>:<Badge t="orange">Pendiente</Badge>}</td>
                    <td>
                      <div style={{display:"flex",gap:6}}>
                        {s.estado_pago==="pendiente" && (
                          <button className="bg" onClick={()=>markPaid(s.id)} style={{padding:"3px 10px",fontSize:11,color:T.green,borderColor:T.green}}>✓ Pagar</button>
                        )}
                        {s.estado_pago==="pagado" && s.telefono && (
                          <button className="bg" onClick={()=>waStaff(s)} style={{padding:"3px 10px",fontSize:11,color:"#25d366",borderColor:"#25d366"}}>WA</button>
                        )}
                        <button className="bg" onClick={()=>del(s.id)} style={{padding:"3px 10px",fontSize:11,color:T.red,borderColor:T.red}}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:18}}>
          <Sec>Distribución Nómina</Sec>
          {data.map(s=>(
            <div key={s.id} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:12}}>
                <span style={{color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:120}}>{s.nombre}</span>
                <span style={{color:T.muted,flexShrink:0}}>{fmtCLP(s.sueldo)}</span>
              </div>
              <div className="prog">
                <div className="progf" style={{width:totalNom?`${Math.round((s.sueldo/totalNom)*100)}%`:"0%",background:rolC(s.rol)}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAdd && <FormModal title="NUEVO INTEGRANTE" fields={addFields} onClose={()=>setShowAdd(false)} onSave={addStaff} loading={saving}/>}
    </div>
  );
};

/* ══════════════════════════════════════════════
   TORNEOS TAB
══════════════════════════════════════════════ */
const TorneosTab = ({ onNotif }) => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [showAdd, setShowAdd]   = useState(false);
  const [showPartido, setShowPartido] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await apiFetch("/torneos")); }
    catch { onNotif("Error cargando torneos","err"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addTorneo = async form => {
    setSaving(true);
    try {
      await apiFetch("/torneos", "POST", form);
      onNotif(`Torneo "${form.nombre}" creado`,"ok");
      setShowAdd(false); load();
    } catch { onNotif("Error al crear torneo","err"); }
    setSaving(false);
  };

  const addPartido = async form => {
    setSaving(true);
    try {
      await apiFetch(`/torneos/${showPartido}/partidos`, "POST", form);
      onNotif("Partido agregado","ok");
      setShowPartido(null); load();
    } catch { onNotif("Error al agregar partido","err"); }
    setSaving(false);
  };

  const waConvocatoria = (t) => {
    if (!t.proximo_partido?.rival) return;
    const p = t.proximo_partido;
    openWA("", `⚽ CONVOCATORIA ${t.nombre}\n📅 ${p.fecha} a las ${p.hora}\n🆚 vs ${p.rival}\n📍 ${p.lugar}\n${p.direccion||""}\n\n¡Los esperamos!`);
  };

  const sbadge = s => s==="en_curso"?<Badge t="green">En curso</Badge>:s==="proximo"?<Badge t="blue">Próximo</Badge>:<Badge t="gray">Finalizado</Badge>;

  const torneoFields = [
    { key:"nombre",        label:"NOMBRE DEL TORNEO", full:true, placeholder:"Liga Regional Sub-17" },
    { key:"categoria",     label:"CATEGORÍA",          options:["Sub-13","Sub-15","Sub-17","Sub-20"] },
    { key:"total_equipos", label:"EQUIPOS",            type:"number", placeholder:"8", default:"8" },
    { key:"fecha_inicio",  label:"FECHA INICIO",       type:"date" },
    { key:"fecha_fin",     label:"FECHA FIN",          type:"date" },
  ];

  const partidoFields = [
    { key:"rival",    label:"RIVAL",          full:true, placeholder:"Colo-Colo Juvenil" },
    { key:"fecha",    label:"FECHA",          type:"date" },
    { key:"hora",     label:"HORA",           type:"time", default:"15:00" },
    { key:"lugar",    label:"CANCHA / RECINTO", full:true, placeholder:"Estadio Santa Laura" },
    { key:"direccion",label:"DIRECCIÓN",      full:true, placeholder:"Walker Martínez 1300, Santiago" },
  ];

  return (
    <div className="fade">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:22,fontWeight:700}}>Torneos & Competencias</div>
          <div style={{fontSize:12,color:T.muted}}>{data.filter(t=>t.status==="en_curso"||t.estado==="en_curso").length} activos</div>
        </div>
        <button className="bp" onClick={()=>setShowAdd(true)} style={{padding:"9px 18px",fontSize:12}}>+ Crear Torneo</button>
      </div>

      {loading ? <Loader/> : data.length===0 ? (
        <div className="empty">
          <span style={{fontSize:32}}>🏆</span>
          <span>No hay torneos registrados</span>
          <button className="bp" onClick={()=>setShowAdd(true)} style={{padding:"8px 18px",fontSize:12,marginTop:8}}>Crear primero</button>
        </div>
      ) : (
        <div style={{display:"grid",gap:14}}>
          {data.map(t=>(
            <div key={t.id} className="ch" style={{background:T.card,border:`1px solid ${expanded===t.id?T.green:T.border}`,borderRadius:12,overflow:"hidden",transition:"all .2s"}}
              onClick={()=>setExpanded(expanded===t.id?null:t.id)}>
              <div style={{padding:"18px 22px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:6,marginBottom:8}}>
                      {sbadge(t.estado)}
                      <Badge t="blue">{t.categoria||"—"}</Badge>
                    </div>
                    <h3 style={{fontFamily:"'Rajdhani',sans-serif",fontSize:18,fontWeight:700,marginBottom:4}}>{t.nombre}</h3>
                    <div style={{fontSize:12,color:T.muted}}>{t.fase||"—"} · {t.fecha_inicio||"—"} → {t.fecha_fin||"—"}</div>
                    {t.estado!=="proximo" && (
                      <div style={{display:"flex",gap:14,marginTop:10,fontSize:12}}>
                        <span style={{color:T.green}}>✓ {t.victorias}G</span>
                        <span style={{color:T.yellow}}>= {t.empates}E</span>
                        <span style={{color:T.red}}>✕ {t.derrotas}P</span>
                        <span style={{color:T.muted}}>⚽ {t.goles_favor}/{t.goles_contra}</span>
                      </div>
                    )}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    {t.posicion && (
                      <div style={{textAlign:"center",background:t.posicion===1?`${T.green}20`:T.surface,border:`1px solid ${t.posicion===1?T.green:T.border}`,borderRadius:10,padding:"8px 14px"}}>
                        <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:26,fontWeight:700,color:t.posicion===1?T.green:T.text,lineHeight:1}}>#{t.posicion}</div>
                        <div style={{fontSize:10,color:T.muted}}>de {t.total_equipos}</div>
                      </div>
                    )}
                    <div style={{fontSize:14,color:T.muted,transform:expanded===t.id?"rotate(180deg)":"rotate(0deg)",transition:"transform .2s"}}>▼</div>
                  </div>
                </div>
              </div>

              {expanded===t.id && (
                <div style={{background:T.surface,borderTop:`1px solid ${T.border}`,padding:"18px 22px"}} className="fade" onClick={e=>e.stopPropagation()}>
                  {t.proximo_partido?.rival ? (<>
                    <Sec>Próximo Partido</Sec>
                    <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",alignItems:"center",gap:20,marginBottom:14}}>
                      <div style={{textAlign:"center",background:T.card,borderRadius:10,padding:14}}>
                        <div style={{fontSize:22}}>⚽</div>
                        <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:14,fontWeight:700,marginTop:4}}>Tu Academia</div>
                      </div>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:22,fontWeight:700,color:T.green}}>VS</div>
                        <div style={{fontSize:11,color:T.muted,marginTop:2}}>{t.proximo_partido.fecha}</div>
                        <div style={{fontSize:12,color:T.green,fontWeight:600}}>{t.proximo_partido.hora}</div>
                      </div>
                      <div style={{textAlign:"center",background:T.card,borderRadius:10,padding:14}}>
                        <div style={{fontSize:22}}>🆚</div>
                        <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:14,fontWeight:700,marginTop:4}}>{t.proximo_partido.rival}</div>
                      </div>
                    </div>
                    <div style={{background:T.card,borderRadius:8,padding:"10px 14px",display:"flex",gap:10,alignItems:"center",marginBottom:14}}>
                      <span style={{fontSize:16}}>📍</span>
                      <div>
                        <div style={{fontSize:13,fontWeight:600}}>{t.proximo_partido.lugar}</div>
                        <div style={{fontSize:12,color:T.muted}}>{t.proximo_partido.direccion}</div>
                      </div>
                    </div>
                    <button className="bp" onClick={()=>waConvocatoria(t)} style={{padding:"9px 18px",fontSize:12}}>
                      📲 Enviar convocatoria WhatsApp
                    </button>
                  </>) : (
                    <div style={{textAlign:"center",padding:"16px 0",color:T.muted,fontSize:13}}>Sin partidos próximos registrados</div>
                  )}

                  <div style={{marginTop:16,paddingTop:16,borderTop:`1px solid ${T.border}40`}}>
                    <button className="bg" onClick={()=>{setShowPartido(t.id);}} style={{padding:"7px 16px",fontSize:12}}>
                      + Agregar Partido
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAdd && <FormModal title="CREAR TORNEO" fields={torneoFields} onClose={()=>setShowAdd(false)} onSave={addTorneo} loading={saving}/>}
      {showPartido && <FormModal title="AGREGAR PARTIDO" fields={partidoFields} onClose={()=>setShowPartido(null)} onSave={addPartido} loading={saving}/>}
    </div>
  );
};

/* ══════════════════════════════════════════════
   SETTINGS TAB
══════════════════════════════════════════════ */
const SettingsTab = ({ academia, onNotif }) => {
  const [wa, setWa]   = useState(true);
  const [em, setEm]   = useState(true);

  const Toggle = ({ val, set }) => (
    <div className="sw" style={{background:val?T.green:T.border}} onClick={()=>set(!val)}>
      <div className="swk" style={{left:val?21:3}}/>
    </div>
  );

  return (
    <div className="fade" style={{maxWidth:680}}>
      <div style={{marginBottom:22}}>
        <h2 style={{fontFamily:"'Rajdhani',sans-serif",fontSize:24,fontWeight:700}}>Configuración</h2>
        <p style={{color:T.muted,fontSize:13}}>Configura tu academia y preferencias</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:22}}>
          <Sec>Información de la Academia</Sec>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {[["NOMBRE",(academia.nombre||academia.name||"")],["CIUDAD",(academia.ciudad||"Santiago")],["CUOTA MENSUAL","25000"],["PLAN",(academia.plan||"starter").toUpperCase()]].map(([l,v])=>(
              <div key={l}>
                <label style={{fontSize:10,color:T.muted,display:"block",marginBottom:5,letterSpacing:.5}}>{l}</label>
                <input className="inp" defaultValue={v}/>
              </div>
            ))}
          </div>
          <button className="bp" onClick={()=>onNotif("Configuración guardada","ok")} style={{marginTop:18,padding:"9px 22px",fontSize:13}}>Guardar</button>
        </div>

        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:22}}>
          <Sec>WhatsApp (via wa.me)</Sec>
          <div style={{fontSize:13,color:T.muted,lineHeight:1.7,marginBottom:16}}>
            Los botones <strong style={{color:T.text}}>WA</strong> en pagos y nómina abren WhatsApp directamente con el mensaje listo.<br/>
            Solo necesitas tener el teléfono del deportista/staff registrado en el sistema.
          </div>
          {[
            [em, setEm, "Activar botones WhatsApp en Pagos",  "Aparece al lado de cada cuota pendiente"],
            [wa, setWa, "Activar botones WhatsApp en Nómina", "Aparece al confirmar un sueldo pagado"],
          ].map(([v,set,l,d],i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:i===0?`1px solid ${T.border}40`:"none"}}>
              <div>
                <div style={{fontSize:14,fontWeight:500}}>{l}</div>
                <div style={{fontSize:12,color:T.muted}}>{d}</div>
              </div>
              <Toggle val={v} set={set}/>
            </div>
          ))}
        </div>

        <div style={{background:`${T.green}08`,border:`1px solid ${T.green}20`,borderRadius:12,padding:20,display:"flex",gap:16,alignItems:"center"}}>
          <div style={{fontSize:28}}>⚡</div>
          <div>
            <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:16,fontWeight:700,marginBottom:4}}>
              Powered by <span style={{color:T.green}}>Autix</span>
            </div>
            <div style={{fontSize:13,color:T.muted}}>
              Stack: EasyPanel · n8n · PostgreSQL · React<br/>
              API: <span style={{color:T.dim,fontFamily:"monospace",fontSize:11}}>{API}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   DASHBOARD SHELL
══════════════════════════════════════════════ */
const Dashboard = ({ academia, onLogout }) => {
  const [tab, setTab]   = useState("overview");
  const [open, setOpen] = useState(true);
  const [notif, setNotif] = useState(null);

  const showN = (msg, type="ok") => setNotif({msg,type});

  const nav = [
    { id:"overview",    label:"Dashboard",     icon:"◈" },
    { id:"deportistas", label:"Deportistas",   icon:"👥" },
    { id:"pagos",       label:"Pagos",         icon:"💳" },
    { id:"nomina",      label:"Nómina",        icon:"💼" },
    { id:"torneos",     label:"Torneos",       icon:"🏆" },
    { id:"settings",    label:"Configuración", icon:"⚙"  },
  ];

  return (
    <div style={{display:"flex",height:"100vh",background:T.bg,overflow:"hidden"}}>
      <style>{CSS}</style>

      <aside style={{width:open?210:58,background:T.surface,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",transition:"width .25s ease",flexShrink:0,overflow:"hidden"}}>
        <div style={{padding:"16px 12px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:10,minHeight:56,whiteSpace:"nowrap"}}>
          <div style={{width:30,height:30,background:T.grad,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>⚽</div>
          {open && <span style={{fontFamily:"'Rajdhani',sans-serif",fontSize:16,fontWeight:700,letterSpacing:1}}>SPORT<span style={{color:T.green}}>AGENT</span></span>}
        </div>
        {open && (
          <div style={{padding:"12px 14px",borderBottom:`1px solid ${T.border}`}}>
            <div style={{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{academia.nombre||academia.name}</div>
            <div style={{fontSize:11,color:T.muted,marginTop:2}}>{academia.ciudad||"Chile"}</div>
            <div style={{marginTop:6}}><Badge t="green">✓ {(academia.plan||"starter").toUpperCase()}</Badge></div>
          </div>
        )}
        <nav style={{padding:"10px 8px",flex:1,overflowY:"auto"}}>
          {nav.map(item=>(
            <div key={item.id} className={`ni ${tab===item.id?"act":""}`} onClick={()=>setTab(item.id)} style={{justifyContent:open?"flex-start":"center"}}>
              <span style={{fontSize:14,flexShrink:0}}>{item.icon}</span>
              {open && <span>{item.label}</span>}
            </div>
          ))}
        </nav>
        <div style={{padding:"10px 8px",borderTop:`1px solid ${T.border}`}}>
          <button className="ni" onClick={onLogout} style={{width:"100%",border:"none",background:"none",cursor:"pointer",color:T.muted,justifyContent:open?"flex-start":"center"}}>
            <span style={{fontSize:14}}>↩</span>
            {open && <span>Salir</span>}
          </button>
        </div>
      </aside>

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"0 22px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>setOpen(!open)} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:18}}>☰</button>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:17,fontWeight:600,letterSpacing:1}}>
              {nav.find(n=>n.id===tab)?.label.toUpperCase()}
            </span>
          </div>
          <div className="av" style={{width:34,height:34,background:`${T.green}25`,color:T.green,fontSize:12}}>
            {((academia.nombre||academia.name||"?").slice(0,2).toUpperCase())}
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"24px 24px 48px"}} key={tab}>
          {tab==="overview"    && <OverviewTab    academia={academia}/>}
          {tab==="deportistas" && <DeportistasTab onNotif={showN}/>}
          {tab==="pagos"       && <PagosTab       onNotif={showN}/>}
          {tab==="nomina"      && <NominaTab      onNotif={showN}/>}
          {tab==="torneos"     && <TorneosTab     onNotif={showN}/>}
          {tab==="settings"    && <SettingsTab    academia={academia} onNotif={showN}/>}
        </div>
      </div>

      {notif && <Notif msg={notif.msg} type={notif.type} onDone={()=>setNotif(null)}/>}
    </div>
  );
};

/* ══════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════ */
export default function App() {
  const [view,  setView]  = useState("landing");
  const [auth,  setAuth]  = useState(null);
  const [acad,  setAcad]  = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("sa_academia");
    const token = localStorage.getItem("sa_token");
    if (saved && token) {
      try { setAcad(JSON.parse(saved)); setView("dash"); } catch {}
    }
  }, []);

  const login  = a  => { setAcad(a); setView("dash"); setAuth(null); };
  const logout = () => { setAcad(null); localStorage.removeItem("sa_token"); localStorage.removeItem("sa_academia"); setView("landing"); };

  return (
    <>
      <style>{CSS}</style>
      {view==="landing" && <Landing onLogin={()=>setAuth("login")} onReg={()=>setAuth("register")}/>}
      {view==="dash" && acad && <Dashboard academia={acad} onLogout={logout}/>}
      {auth && <AuthModal mode={auth} onClose={()=>setAuth(null)} onSuccess={login}/>}
    </>
  );
}
