"use client"
import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Blows an element up to fill the screen for showing something to a group —
 * a tactics board held up at the side of a pitch, mid-match.
 *
 * Two mechanisms on purpose:
 *
 * 1. The real Fullscreen API, which also hides the browser's own chrome.
 * 2. A plain fixed-overlay fallback, because iPhone Safari doesn't support
 *    fullscreen on arbitrary elements at all — only on <video>. Coaches are
 *    heavily on iPhones, so treating that as "unsupported" would mean the
 *    feature simply doesn't exist for half of them.
 *
 * The caller styles the element from `active`; this hook only decides when.
 */

interface FullscreenCapableElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void
}
interface FullscreenCapableDocument extends Document {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void> | void
}

export function usePresentationMode<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [active, setActive] = useState(false)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  // A board that dims and locks 40 seconds into a team talk is useless, so
  // hold the screen awake for as long as it's on show. Best-effort: the API
  // is missing on some browsers and rejects when the tab isn't visible.
  const acquireWakeLock = useCallback(async () => {
    try {
      if (!("wakeLock" in navigator)) return
      wakeLockRef.current = await navigator.wakeLock.request("screen")
    } catch {
      /* sin wake lock el tablero igual funciona */
    }
  }, [])

  const releaseWakeLock = useCallback(() => {
    wakeLockRef.current?.release().catch(() => {})
    wakeLockRef.current = null
  }, [])

  const enter = useCallback(async () => {
    setActive(true)
    void acquireWakeLock()
    const el = ref.current as FullscreenCapableElement | null
    if (!el) return
    try {
      if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: "hide" })
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen()
    } catch {
      // Denied or unsupported — the overlay alone still fills the screen.
    }
  }, [acquireWakeLock])

  const exit = useCallback(() => {
    setActive(false)
    releaseWakeLock()
    const doc = document as FullscreenCapableDocument
    try {
      if (doc.fullscreenElement && doc.exitFullscreen) void doc.exitFullscreen()
      else if (doc.webkitFullscreenElement && doc.webkitExitFullscreen) void doc.webkitExitFullscreen()
    } catch {
      /* ya estaba fuera */
    }
  }, [releaseWakeLock])

  const toggle = useCallback(() => { if (active) exit(); else void enter() }, [active, enter, exit])

  // Leaving fullscreen through the browser's own gesture (swipe, Esc on the
  // native control) has to take the overlay with it, or the page stays stuck
  // in a presentation state the user already dismissed.
  useEffect(() => {
    function onFsChange() {
      const doc = document as FullscreenCapableDocument
      const stillFs = !!(doc.fullscreenElement || doc.webkitFullscreenElement)
      if (!stillFs && active) { setActive(false); releaseWakeLock() }
    }
    document.addEventListener("fullscreenchange", onFsChange)
    document.addEventListener("webkitfullscreenchange", onFsChange)
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange)
      document.removeEventListener("webkitfullscreenchange", onFsChange)
    }
  }, [active, releaseWakeLock])

  // Esc closes the overlay-only mode, where the browser has no native exit.
  useEffect(() => {
    if (!active) return
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") exit() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [active, exit])

  // The lock is dropped whenever the tab is hidden; take it back on return.
  useEffect(() => {
    if (!active) return
    function onVisible() { if (document.visibilityState === "visible") void acquireWakeLock() }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [active, acquireWakeLock])

  useEffect(() => () => releaseWakeLock(), [releaseWakeLock])

  return { ref, active, enter, exit, toggle }
}
