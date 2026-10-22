import { describe, expect, it } from 'vitest';
import { calculateTriangle } from './trigonometry';
describe('right triangle calculator', () => {
  it('calculates 3-4-5 triangle', () => {
    const r = calculateTriangle({ mode: 'legs', base: 3, height: 4, hypotenuse: 0, angle: 0 });
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.hypotenuse).toBeCloseTo(5); expect(r.angle).toBeCloseTo(53.130102354); }
  });
  it('calculates from hypotenuse and angle', () => {
    const r = calculateTriangle({ mode: 'hypotenuseAngle', base: 0, height: 0, hypotenuse: 10, angle: 30 });
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.height).toBeCloseTo(5); expect(r.base).toBeCloseTo(8.660254); }
  });
  it('calculates from base and angle', () => {
    const r = calculateTriangle({ mode: 'baseAngle', base: 10, height: 0, hypotenuse: 0, angle: 45 });
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.height).toBeCloseTo(10); expect(r.hypotenuse).toBeCloseTo(Math.sqrt(200)); }
  });
  it('rejects invalid values', () => {
    expect(calculateTriangle({ mode: 'legs', base: 0, height: 3, hypotenuse: 0, angle: 0 }).ok).toBe(false);
    expect(calculateTriangle({ mode: 'baseAngle', base: 10, height: 0, hypotenuse: 0, angle: 90 }).ok).toBe(false);
    expect(calculateTriangle({ mode: 'hypotenuseAngle', base: 0, height: 0, hypotenuse: NaN, angle: 30 }).ok).toBe(false);
  });
});
