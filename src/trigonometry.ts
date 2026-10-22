export type TriangleInput = { mode: 'legs' | 'hypotenuseAngle' | 'baseAngle'; base: number; height: number; hypotenuse: number; angle: number };
export function calculateTriangle(input: TriangleInput) {
  const { mode } = input;
  const positive = (n: number) => Number.isFinite(n) && n > 0;
  let base: number, height: number, hypotenuse: number, angle: number;
  if (mode === 'legs') {
    if (!positive(input.base) || !positive(input.height)) return { ok: false as const, error: '底辺と高さに0より大きい数値を入力してください。' };
    base = input.base; height = input.height;
    hypotenuse = Math.hypot(base, height);
    angle = Math.atan2(height, base) * 180 / Math.PI;
  } else {
    if (!Number.isFinite(input.angle) || input.angle <= 0 || input.angle >= 90) return { ok: false as const, error: '角度は0°より大きく90°より小さい値にしてください。' };
    angle = input.angle;
    const rad = angle * Math.PI / 180;
    if (mode === 'hypotenuseAngle') {
      if (!positive(input.hypotenuse)) return { ok: false as const, error: '斜辺に0より大きい数値を入力してください。' };
      hypotenuse = input.hypotenuse;
      base = hypotenuse * Math.cos(rad);
      height = hypotenuse * Math.sin(rad);
    } else {
      if (!positive(input.base)) return { ok: false as const, error: '底辺に0より大きい数値を入力してください。' };
      base = input.base;
      height = base * Math.tan(rad);
      hypotenuse = base / Math.cos(rad);
    }
  }
  if (![base, height, hypotenuse, angle].every(Number.isFinite)) return { ok: false as const, error: '計算範囲を超えました。入力値を小さくしてください。' };
  return { ok: true as const, base, height, hypotenuse, angle, otherAngle: 90 - angle };
}
