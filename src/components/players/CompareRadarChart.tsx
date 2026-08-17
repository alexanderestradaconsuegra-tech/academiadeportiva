"use client"
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend } from "recharts"

export default function CompareRadarChart({
  data, nameA, nameB,
}: {
  data: Record<string, string | number>[]
  nameA: string
  nameB: string
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
        <PolarGrid stroke="#E2E8F0" className="dark:stroke-slate-700" />
        <PolarAngleAxis dataKey="attr" tick={{ fontSize: 11, fill: "#94A3B8" }} />
        <Radar name={nameA} dataKey="A" stroke="#84cc16" fill="#84cc16" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: "#84cc16" }} />
        <Radar name={nameB} dataKey="B" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: "#8B5CF6" }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
