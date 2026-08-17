"use client"
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts"

export function ProgressAreaChart({ data, pointsLabel, scoreLabel }: {
  data: { month: string; score: number }[]
  pointsLabel: string
  scoreLabel: string
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a3e635" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#a3e635" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
        <YAxis domain={[65, 95]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`${v} ${pointsLabel}`, scoreLabel]} />
        <Area type="monotone" dataKey="score" stroke="#a3e635" strokeWidth={2.5} fill="url(#cg)" dot={{ r: 4, fill: "#a3e635", strokeWidth: 0 }} activeDot={{ r: 6 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function CategoryBarChart({ data, pointsLabel }: {
  data: { name: string; score: number; fill: string }[]
  pointsLabel: string
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`${v} ${pointsLabel}`]} />
        <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={32}>
          {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function MonthlyEvolutionChart({ data, players, colors }: {
  data: Record<string, string | number>[]
  players: { id: string; name: string }[]
  colors: string[]
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
        <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 12 }} />
        <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        {players.map((p, i) => (
          <Line key={p.id} type="monotone" dataKey={p.name.split(" ")[0]} stroke={colors[i]} strokeWidth={2} dot={{ r: 3, strokeWidth: 0, fill: colors[i] }} activeDot={{ r: 5 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

export function ComparisonBarChart({ data, playerAName, playerBName }: {
  data: Record<string, string | number>[]
  playerAName?: string
  playerBName?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="attr" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 12 }} />
        <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        {playerAName && <Bar dataKey={playerAName.split(" ")[0]} fill="#a3e635" radius={[4, 4, 0, 0]} barSize={16} />}
        {playerBName && <Bar dataKey={playerBName.split(" ")[0]} fill="#10B981" radius={[4, 4, 0, 0]} barSize={16} />}
      </BarChart>
    </ResponsiveContainer>
  )
}

export function AttrRadarChart({ data, color }: {
  data: { subject: string; value: number }[]
  color: string
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid stroke="#E2E8F0" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748B" }} />
        <Radar dataKey="value" stroke={color} fill={color} fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: color, strokeWidth: 0 }} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
