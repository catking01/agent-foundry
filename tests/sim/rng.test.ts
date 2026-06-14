import { describe, it, expect } from 'vitest'
import { mulberry32, tickRng, randInt, randElement, clamp } from '../../src/sim/rng'

describe('mulberry32', () => {
  it('produces deterministic output for the same seed', () => {
    const rng1 = mulberry32(42)
    const rng2 = mulberry32(42)

    const seq1 = Array.from({ length: 10 }, () => rng1())
    const seq2 = Array.from({ length: 10 }, () => rng2())

    expect(seq1).toEqual(seq2)
  })

  it('produces different output for different seeds', () => {
    const rng1 = mulberry32(42)
    const rng2 = mulberry32(99)

    const seq1 = Array.from({ length: 5 }, () => rng1())
    const seq2 = Array.from({ length: 5 }, () => rng2())

    expect(seq1).not.toEqual(seq2)
  })

  it('returns values in [0, 1)', () => {
    const rng = mulberry32(123)
    for (let i = 0; i < 100; i++) {
      const val = rng()
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThan(1)
    }
  })
})

describe('tickRng', () => {
  it('different ticks produce different sequences', () => {
    const rng1 = tickRng(42, 0)
    const rng2 = tickRng(42, 1)

    const v1 = rng1()
    const v2 = rng2()
    expect(v1).not.toEqual(v2)
  })

  it('same seed+tick produces same value', () => {
    const v1 = tickRng(42, 5)()
    const v2 = tickRng(42, 5)()
    expect(v1).toEqual(v2)
  })
})

describe('randInt', () => {
  it('returns values within range', () => {
    const rng = mulberry32(42)
    for (let i = 0; i < 100; i++) {
      const val = randInt(rng, 1, 6)
      expect(val).toBeGreaterThanOrEqual(1)
      expect(val).toBeLessThanOrEqual(6)
    }
  })
})

describe('randElement', () => {
  it('returns an element from the array', () => {
    const rng = mulberry32(42)
    const arr = ['a', 'b', 'c']
    for (let i = 0; i < 20; i++) {
      const val = randElement(rng, arr)
      expect(arr).toContain(val)
    }
  })
})

describe('clamp', () => {
  it('clamps values', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(15, 0, 10)).toBe(10)
  })
})
