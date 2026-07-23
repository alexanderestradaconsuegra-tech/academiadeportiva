interface MetrikasLogoProps {
  className?: string
  height?: number
  variant?: "full" | "icon"
  theme?: "dark" | "light"
}

const GREEN = "#6DD230"

export default function MetrikasLogo({
  className = "",
  height = 32,
  variant = "full",
  theme = "dark",
}: MetrikasLogoProps) {
  const letterColor = theme === "dark" ? "white" : "#1e293b"
  const sw = 1.5

  if (variant === "icon") {
    return (
      <svg viewBox="0 0 56 52" height={height} className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Metrikas">
        <line x1="3" y1="8" x2="3" y2="49" stroke={letterColor} strokeWidth={sw} />
        <line x1="3" y1="8" x2="14" y2="8" stroke={letterColor} strokeWidth={sw} />
        <line x1="14" y1="8" x2="14" y2="49" stroke={letterColor} strokeWidth={sw} />
        <line x1="3" y1="49" x2="14" y2="49" stroke={letterColor} strokeWidth={sw} />
        <line x1="14" y1="8" x2="28" y2="36" stroke={letterColor} strokeWidth={sw} />
        <polygon points="28,36 42,8 53,8 28,49" fill={GREEN} />
        <line x1="42" y1="8" x2="53" y2="8" stroke={letterColor} strokeWidth={sw} />
        <line x1="53" y1="8" x2="53" y2="49" stroke={letterColor} strokeWidth={sw} />
        <line x1="42" y1="49" x2="53" y2="49" stroke={letterColor} strokeWidth={sw} />
        <line x1="42" y1="8" x2="42" y2="49" stroke={letterColor} strokeWidth={sw} />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 380 52" height={height} className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Metrikas">
      {/* M */}
      <line x1="3" y1="8" x2="3" y2="49" stroke={letterColor} strokeWidth={sw} />
      <line x1="3" y1="8" x2="14" y2="8" stroke={letterColor} strokeWidth={sw} />
      <line x1="14" y1="8" x2="14" y2="49" stroke={letterColor} strokeWidth={sw} />
      <line x1="3" y1="49" x2="14" y2="49" stroke={letterColor} strokeWidth={sw} />
      <line x1="14" y1="8" x2="28" y2="36" stroke={letterColor} strokeWidth={sw} />
      <polygon points="28,36 42,8 53,8 28,49" fill={GREEN} />
      <line x1="42" y1="8" x2="53" y2="8" stroke={letterColor} strokeWidth={sw} />
      <line x1="53" y1="8" x2="53" y2="49" stroke={letterColor} strokeWidth={sw} />
      <line x1="42" y1="49" x2="53" y2="49" stroke={letterColor} strokeWidth={sw} />
      <line x1="42" y1="8" x2="42" y2="49" stroke={letterColor} strokeWidth={sw} />
      {/* E */}
      <line x1="66" y1="8" x2="66" y2="49" stroke={letterColor} strokeWidth={sw} />
      <line x1="66" y1="8" x2="88" y2="8" stroke={letterColor} strokeWidth={sw} />
      <line x1="66" y1="28.5" x2="84" y2="28.5" stroke={letterColor} strokeWidth={sw} />
      <line x1="66" y1="49" x2="88" y2="49" stroke={letterColor} strokeWidth={sw} />
      {/* T */}
      <line x1="96" y1="8" x2="122" y2="8" stroke={letterColor} strokeWidth={sw} />
      <line x1="109" y1="8" x2="109" y2="49" stroke={letterColor} strokeWidth={sw} />
      {/* R */}
      <line x1="130" y1="8" x2="130" y2="49" stroke={letterColor} strokeWidth={sw} />
      <line x1="130" y1="8" x2="148" y2="8" stroke={letterColor} strokeWidth={sw} />
      <path d="M148,8 Q155,8 155,18 Q155,28 148,28 L130,28" stroke={letterColor} strokeWidth={sw} fill="none" />
      <line x1="144" y1="28" x2="156" y2="49" stroke={letterColor} strokeWidth={sw} />
      {/* I */}
      <line x1="166" y1="8" x2="178" y2="8" stroke={letterColor} strokeWidth={sw} />
      <line x1="172" y1="8" x2="172" y2="49" stroke={letterColor} strokeWidth={sw} />
      <line x1="166" y1="49" x2="178" y2="49" stroke={letterColor} strokeWidth={sw} />
      {/* K */}
      <line x1="187" y1="8" x2="187" y2="49" stroke={letterColor} strokeWidth={sw} />
      <line x1="187" y1="28.5" x2="210" y2="8" stroke={letterColor} strokeWidth={sw} />
      <line x1="187" y1="28.5" x2="210" y2="49" stroke={letterColor} strokeWidth={sw} />
      <polygon points="187,28.5 210,8 210,18 196,28.5" fill={GREEN} />
      {/* A */}
      <line x1="220" y1="49" x2="235" y2="8" stroke={letterColor} strokeWidth={sw} />
      <line x1="235" y1="8" x2="250" y2="49" stroke={letterColor} strokeWidth={sw} />
      <line x1="225" y1="35" x2="245" y2="35" stroke={letterColor} strokeWidth={sw} />
      {/* S */}
      <path d="M272,14 Q272,8 263,8 L258,8 Q249,8 249,18 Q249,28 260,28 Q271,28 271,39 Q271,49 261,49 L256,49 Q247,49 247,43" stroke={letterColor} strokeWidth={sw} fill="none" strokeLinecap="round" />
    </svg>
  )
}
