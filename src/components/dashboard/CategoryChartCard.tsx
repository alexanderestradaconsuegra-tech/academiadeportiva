"use client"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts"

export default function CategoryChartCard({
  title, subtitle, data, pointsLabel, scoreLabel,
}: {
  title: string
  subtitle: string
  data: { name: string; score: number; fill: string }[]
  pointsLabel: string
  scoreLabel: string
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
      <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{title}</h2>
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">{subtitle}</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: -8, bottom: 0 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} width={70} />
          <Tooltip
            contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 12 }}
            formatter={(v: number) => [`${v} ${pointsLabel}`, scoreLabel]}
          />
          <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={16}>
            {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
