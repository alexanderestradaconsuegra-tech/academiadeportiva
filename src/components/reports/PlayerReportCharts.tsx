"use client"
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from "recharts"

export function SkillsRadarChart({ title, data }: { title: string; data: { subject: string; value: number }[] }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 text-center">{title}</h2>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data}>
          <PolarGrid stroke="#E2E8F0" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748B" }} />
          <Radar dataKey="value" stroke="#0B5CFF" fill="#0B5CFF" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: "#0B5CFF", strokeWidth: 0 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AttrsBarChart({ data, pointsLabel }: { data: { label: string; value: number; fill: string }[]; pointsLabel: string }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: -8, bottom: 0 }}>
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} width={65} />
        <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`${v} ${pointsLabel}`]} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={14}>
          {data.map((a, i) => <Cell key={i} fill={a.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
