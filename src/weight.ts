export type Shape = 'plate' | 'bar' | 'roundPipe' | 'squarePipe';
export type WeightInput = { shape: Shape; density: number; length: number; width: number; height: number; diameter: number; thickness: number; quantity: number };
export type WeightResult = { ok: true; unit: number; total: number } | { ok: false; errors: string[] };
export const shapeNames: Record<Shape, string> = { plate: '板', bar: '丸棒', roundPipe: '丸パイプ', squarePipe: '角パイプ' };
export const materials = [ { name: '鉄・一般鋼', density: 7.85 }, { name: 'ステンレス（SUS304）', density: 7.93 }, { name: 'アルミニウム', density: 2.7 }, { name: '銅', density: 8.96 } ];
export function calculateWeight(v: WeightInput): WeightResult {
  const errors: string[] = [];
  const positive = (n: number, label: string) => { if (!Number.isFinite(n) || n <= 0) errors.push(`${label}は0より大きい数値を入力してください。`); };
  positive(v.density, '材料密度'); positive(v.length, '長さ');
  if (!Number.isSafeInteger(v.quantity) || v.quantity <= 0) errors.push('数量は1以上の安全な整数を入力してください。');
  if (v.shape === 'plate' || v.shape === 'squarePipe') positive(v.width, '幅');
  if (v.shape === 'squarePipe') positive(v.height, '高さ');
  if (v.shape === 'bar' || v.shape === 'roundPipe') positive(v.diameter, '直径');
  if (v.shape !== 'bar') positive(v.thickness, v.shape === 'plate' ? '板厚' : '肉厚');
  if (v.shape === 'roundPipe' && 2 * v.thickness >= v.diameter) errors.push('肉厚は外径の半分未満にしてください。');
  if (v.shape === 'squarePipe' && 2 * v.thickness >= Math.min(v.width, v.height)) errors.push('肉厚は幅・高さの半分未満にしてください。');
  if (!(v.shape in shapeNames)) errors.push('形状を選択してください。');
  if (errors.length) return { ok: false, errors };
  let area: number;
  switch (v.shape) {
    case 'plate': area = v.width * v.thickness; break;
    case 'bar': area = Math.PI * v.diameter ** 2 / 4; break;
    case 'roundPipe': area = Math.PI * (v.diameter ** 2 - (v.diameter - 2 * v.thickness) ** 2) / 4; break;
    case 'squarePipe': area = v.width * v.height - (v.width - 2 * v.thickness) * (v.height - 2 * v.thickness); break;
  }
  const unit = area * v.length * v.density / 1_000_000;
  const total = unit * v.quantity;
  if (!Number.isFinite(total) || total <= 0) return { ok: false, errors: ['計算可能な範囲を超えています。入力値を見直してください。'] };
  return { ok: true, unit, total };
}
