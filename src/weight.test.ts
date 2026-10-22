import { describe, it, expect } from 'vitest';
import { calculateWeight, type WeightInput } from './weight';
const base: WeightInput = { shape: 'plate', density: 7.85, length: 1000, width: 100, height: 50, diameter: 100, thickness: 10, quantity: 3 };
function valid(input: Partial<WeightInput>) { const result = calculateWeight({ ...base, ...input }); if (!result.ok) throw new Error(result.errors.join()); return result; }
describe('材料重量（mm・g/cm³ → kg）', () => {
  it('板の単重と数量による合計', () => { const r = valid({}); expect(r.unit).toBeCloseTo(7.85); expect(r.total).toBeCloseTo(23.55); });
  it('丸棒', () => expect(valid({ shape: 'bar' }).unit).toBeCloseTo(Math.PI * 2.5 * 7.85));
  it('丸パイプの中空断面', () => expect(valid({ shape: 'roundPipe' }).unit).toBeCloseTo(Math.PI * 0.9 * 7.85));
  it('角パイプの中空断面', () => expect(valid({ shape: 'squarePipe' }).unit).toBeCloseTo(20.41));
  it('小数寸法と密度', () => expect(valid({ width: 10.5, thickness: 0.5, length: 100, density: 2.7, quantity: 1 }).unit).toBeCloseTo(0.0014175));
  it.each([0, -1, NaN, Infinity])('不正な必須数値 %s', n => expect(calculateWeight({ ...base, length: n }).ok).toBe(false));
  it.each([0, -2, 1.5, Infinity, Number.MAX_SAFE_INTEGER + 1])('不正な数量 %s', quantity => expect(calculateWeight({ ...base, quantity }).ok).toBe(false));
  it.each(['roundPipe', 'squarePipe'] as const)('%sの内寸が0以下', shape => expect(calculateWeight({ ...base, shape, thickness: 50 }).ok).toBe(false));
  it('丸棒では使用しない寸法を検証しない', () => expect(valid({ shape: 'bar', thickness: NaN, width: NaN }).unit).toBeGreaterThan(0));
  it('密度の不正値', () => expect(calculateWeight({ ...base, density: -1 }).ok).toBe(false));
  it('オーバーフロー', () => expect(calculateWeight({ ...base, length: Number.MAX_VALUE }).ok).toBe(false));
});
