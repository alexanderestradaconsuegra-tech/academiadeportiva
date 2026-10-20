import { describe, it, expect } from "vitest"
import { normalize, matchScore, rankItems } from "../search"

describe("normalize", () => {
  it("drops accents and case", () => {
    expect(normalize("  Peñalolén TÁCTICO ")).toBe("penalolen tactico")
  })
})

describe("matchScore", () => {
  it("finds text regardless of accents", () => {
    expect(matchScore("Tablero Táctico", "tactico")).toBeGreaterThan(0)
    expect(matchScore("UC Peñalolén", "pena")).toBeGreaterThan(0)
  })

  it("needs every word of the query", () => {
    expect(matchScore("Juan Carlos", "juan car")).toBeGreaterThan(0)
    expect(matchScore("Juan Carlos", "juan pedro")).toBe(0)
  })

  it("ranks a prefix above a word start above anywhere", () => {
    expect(matchScore("Pagos", "pag")).toBe(3)
    expect(matchScore("Registrar pago", "pag")).toBe(2)
    expect(matchScore("Compagina", "pag")).toBe(1)
  })

  it("an empty query matches everything", () => {
    expect(matchScore("Lo que sea", "   ")).toBe(1)
  })
})

describe("rankItems", () => {
  const names = ["Bastian Estrada", "Thiago Estrada", "Juan Carlos", "Carlos Cuevas"]

  it("puts better matches first and keeps order on ties", () => {
    expect(rankItems(names, "carlos", n => n)).toEqual(["Carlos Cuevas", "Juan Carlos"])
    expect(rankItems(names, "estrada", n => n)).toEqual(["Bastian Estrada", "Thiago Estrada"])
  })

  it("respects the limit", () => {
    expect(rankItems(names, "", n => n, 2)).toHaveLength(2)
  })
})
