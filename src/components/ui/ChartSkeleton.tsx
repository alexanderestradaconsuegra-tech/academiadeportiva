export default function ChartSkeleton({ height = 200, className = "" }: { height?: number; className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800 ${className}`}
      style={{ height }}
    />
  )
}
