import { describe, expect, it } from 'vitest'
import {
  applyDragToNozzle,
  clampNozzlePosition,
  computeCenterOfMass,
  computeCollapseThreshold,
  computeConeSinkY,
  computeLeanAngle,
  computeLeanAxis,
  computeOffset,
  creamTopY,
  isCollapsed,
  lerp,
  tickGame,
} from './physics'

describe('computeCenterOfMass', () => {
  it('returns origin for empty input', () => {
    expect(computeCenterOfMass([])).toEqual({ x: 0, z: 0 })
  })

  it('returns the average XZ across points', () => {
    const com = computeCenterOfMass([
      { x: 0, z: 0 },
      { x: 2, z: 4 },
      { x: 4, z: 2 },
    ])
    expect(com.x).toBeCloseTo(2)
    expect(com.z).toBeCloseTo(2)
  })

  it('uses only x/z fields, ignoring others', () => {
    const com = computeCenterOfMass([
      { x: 1, z: 1, y: 999 } as never,
      { x: -1, z: -1, y: -999 } as never,
    ])
    expect(com.x).toBeCloseTo(0)
    expect(com.z).toBeCloseTo(0)
  })

  it('handles a single point', () => {
    expect(computeCenterOfMass([{ x: 3, z: -2 }])).toEqual({ x: 3, z: -2 })
  })
})

describe('computeOffset', () => {
  it('is zero for the origin', () => {
    expect(computeOffset({ x: 0, z: 0 })).toBe(0)
  })

  it('returns euclidean distance', () => {
    expect(computeOffset({ x: 3, z: 4 })).toBeCloseTo(5)
  })

  it('respects a custom cone center', () => {
    expect(computeOffset({ x: 1, z: 1 }, { x: 1, z: 0 })).toBeCloseTo(1)
  })
})

describe('computeCollapseThreshold', () => {
  it('returns base at zero height', () => {
    expect(computeCollapseThreshold(0, 1, 0.5)).toBeCloseTo(1)
  })

  it('decreases as height grows', () => {
    const a = computeCollapseThreshold(1, 1, 0.5)
    const b = computeCollapseThreshold(5, 1, 0.5)
    expect(a).toBeGreaterThan(b)
    expect(b).toBeGreaterThan(0)
  })

  it('treats negative heights as zero', () => {
    expect(computeCollapseThreshold(-3, 1, 0.5)).toBeCloseTo(1)
  })

  it('stays positive for very large heights', () => {
    expect(computeCollapseThreshold(1000, 1, 0.5)).toBeGreaterThan(0)
  })
})

describe('isCollapsed', () => {
  it('is true when offset exceeds threshold', () => {
    expect(isCollapsed(0.6, 0.5)).toBe(true)
  })
  it('is false when offset equals the threshold', () => {
    expect(isCollapsed(0.5, 0.5)).toBe(false)
  })
  it('is false when offset is below threshold', () => {
    expect(isCollapsed(0.4, 0.5)).toBe(false)
  })
})

describe('computeLeanAngle', () => {
  it('is zero with zero offset', () => {
    expect(computeLeanAngle(0, 1, 1)).toBe(0)
  })
  it('is offset * factor while below max', () => {
    expect(computeLeanAngle(0.5, 1, 2)).toBeCloseTo(0.5)
  })
  it('caps at max', () => {
    expect(computeLeanAngle(10, 1, 0.4)).toBeCloseTo(0.4)
  })
  it('does not return negative angles', () => {
    expect(computeLeanAngle(-1, 1, 1)).toBe(0)
  })
})

describe('computeLeanAxis', () => {
  it('is perpendicular to the CoM offset direction', () => {
    const axis = computeLeanAxis({ x: 1, z: 0 })
    expect(axis.x).toBeCloseTo(0)
    expect(Math.abs(axis.z)).toBeCloseTo(1)
  })
  it('is unit length for any non-zero offset', () => {
    const axis = computeLeanAxis({ x: 3, z: 4 })
    expect(Math.sqrt(axis.x ** 2 + axis.z ** 2)).toBeCloseTo(1)
  })
  it('falls back to a default unit axis at the origin', () => {
    const axis = computeLeanAxis({ x: 0, z: 0 })
    expect(Math.sqrt(axis.x ** 2 + axis.z ** 2)).toBeCloseTo(1)
  })
})

describe('clampNozzlePosition', () => {
  it('preserves positions inside the radius', () => {
    expect(clampNozzlePosition(0.5, 0.5, 1)).toEqual({ x: 0.5, z: 0.5 })
  })
  it('clamps onto the boundary along the same direction', () => {
    const r = clampNozzlePosition(3, 4, 1)
    expect(r.x).toBeCloseTo(0.6)
    expect(r.z).toBeCloseTo(0.8)
    expect(Math.sqrt(r.x ** 2 + r.z ** 2)).toBeCloseTo(1)
  })
  it('returns the origin when input is the origin', () => {
    expect(clampNozzlePosition(0, 0, 1)).toEqual({ x: 0, z: 0 })
  })
  it('treats non-positive radii as zero', () => {
    expect(clampNozzlePosition(2, 2, 0)).toEqual({ x: 0, z: 0 })
  })
})

describe('computeConeSinkY', () => {
  it('is zero before reaching the start height', () => {
    expect(computeConeSinkY(1, 2, 0.5, 1)).toBe(0)
  })
  it('grows negatively past the start height', () => {
    expect(computeConeSinkY(3, 2, 0.5, 1)).toBeCloseTo(-0.5)
  })
  it('clamps to -maxSink', () => {
    expect(computeConeSinkY(100, 2, 0.5, 1)).toBeCloseTo(-1)
  })
})

describe('applyDragToNozzle', () => {
  it('translates pixel deltas into world deltas', () => {
    const r = applyDragToNozzle({ x: 0, z: 0 }, 100, 50, 0.01, 5)
    expect(r.x).toBeCloseTo(1)
    expect(r.z).toBeCloseTo(0.5)
  })
  it('clamps to the circular bound', () => {
    const r = applyDragToNozzle({ x: 0.9, z: 0 }, 100, 0, 0.01, 1)
    expect(Math.sqrt(r.x ** 2 + r.z ** 2)).toBeCloseTo(1)
  })
  it('is a no-op for zero delta', () => {
    expect(applyDragToNozzle({ x: 0.3, z: -0.2 }, 0, 0, 0.01, 1)).toEqual({ x: 0.3, z: -0.2 })
  })
})

describe('creamTopY', () => {
  it('starts at baseY when elapsed is zero', () => {
    expect(creamTopY(0, 1, 1.4)).toBeCloseTo(1.4)
  })
  it('rises proportionally to elapsed time', () => {
    expect(creamTopY(2, 0.5, 1)).toBeCloseTo(2)
  })
  it('does not go below baseY for negative elapsed', () => {
    expect(creamTopY(-3, 1, 1.4)).toBeCloseTo(1.4)
  })
})

describe('tickGame', () => {
  it('emits no points when interval has not elapsed', () => {
    const r = tickGame({
      dt: 0.01,
      elapsed: 0,
      nozzleXZ: { x: 0, z: 0 },
      pointTimer: 0,
      pointInterval: 1 / 30,
      riseRate: 1,
      baseY: 0,
    })
    expect(r.emitted).toHaveLength(0)
    expect(r.elapsed).toBeCloseTo(0.01)
  })

  it('emits one point per interval at the current nozzle XZ', () => {
    const r = tickGame({
      dt: 1 / 30,
      elapsed: 0,
      nozzleXZ: { x: 0.2, z: -0.3 },
      pointTimer: 0,
      pointInterval: 1 / 30,
      riseRate: 1,
      baseY: 0,
    })
    expect(r.emitted).toHaveLength(1)
    expect(r.emitted[0].x).toBeCloseTo(0.2)
    expect(r.emitted[0].z).toBeCloseTo(-0.3)
    expect(r.emitted[0].y).toBeGreaterThan(0)
  })

  it('emits multiple points for a long dt without infinite loops', () => {
    const r = tickGame({
      dt: 1, // way bigger than interval
      elapsed: 0,
      nozzleXZ: { x: 0, z: 0 },
      pointTimer: 0,
      pointInterval: 1 / 30,
      riseRate: 1,
      baseY: 0,
    })
    expect(r.emitted.length).toBeGreaterThan(1)
    expect(r.emitted.length).toBeLessThanOrEqual(8)
  })

  it('advances the elapsed time and topY', () => {
    const r = tickGame({
      dt: 0.5,
      elapsed: 1,
      nozzleXZ: { x: 0, z: 0 },
      pointTimer: 0,
      pointInterval: 1 / 30,
      riseRate: 2,
      baseY: 1.4,
    })
    expect(r.elapsed).toBeCloseTo(1.5)
    expect(r.topY).toBeCloseTo(1.4 + 1.5 * 2)
  })
})

describe('lerp', () => {
  it('returns the start when t = 0', () => {
    expect(lerp(2, 8, 0)).toBeCloseTo(2)
  })
  it('returns the end when t = 1', () => {
    expect(lerp(2, 8, 1)).toBeCloseTo(8)
  })
  it('returns the midpoint at t = 0.5', () => {
    expect(lerp(2, 8, 0.5)).toBeCloseTo(5)
  })
})
