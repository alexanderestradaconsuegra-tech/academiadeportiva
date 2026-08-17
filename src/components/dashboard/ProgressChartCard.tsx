"use client"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"

export default function ProgressChartCard({
  title, subtitle, progressTrend, progressData, pointsLabel, scoreLabel,
}: {
  title: string
  subtitle: string
  progressTrend: number | null
  progressData: { month: string; score: number }[]
  pointsLabel: string
  scoreLabel: string
}) {
  return (
    <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        {progressTrend !== null && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${progressTrend >= 0 ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" : "text-red-500 bg-red-50 dark:bg-red-500/10"}`}>
            {progressTrend >= 0 ? "↑" : "↓"} {progressTrend >= 0 ? "+" : ""}{progressTrend} pts
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={progressData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#84cc16" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
          <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
            formatter={(v: number) => [`${v} ${pointsLabel}`, scoreLabel]}
          />
          <Area type="monotone" dataKey="score" stroke="#84cc16" strokeWidth={2.5} fill="url(#colorScore)" dot={{ fill: "#84cc16", strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: "#84cc16" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
