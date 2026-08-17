"use client"
import { AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function ScoreEvolutionChart({ data, generalScoreLabel }: {
  data: { date: string; score: number }[]
  generalScoreLabel: string
}) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 20, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#84cc16" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis domain={[60, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`${v} pts`]} />
        <Area type="monotone" dataKey="score" stroke="#84cc16" strokeWidth={2.5} fill="url(#pg)" dot={{ fill: "#84cc16", r: 4, strokeWidth: 0 }} name={generalScoreLabel} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function AttributeRadarChart({ data }: { data: { subject: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} margin={{ top: 15, right: 30, bottom: 15, left: 30 }}>
        <PolarGrid stroke="#E2E8F0" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748B" }} />
        <Radar name="Score" dataKey="value" stroke="#84cc16" fill="#84cc16" fillOpacity={0.15} strokeWidth={2} dot={{ r: 4, fill: "#84cc16", strokeWidth: 0 }} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
