import { useState } from 'react';

type Mode = 'ratio' | 'percent';
type Unit = 'g' | 'kg';
const format = (n: number) => n.toLocaleString('ja-JP', { maximumFractionDigits: 3 });

export function MixRatioCalculator() {
  const [mode, setMode] = useState<Mode>('ratio');
  const [unit, setUnit] = useState<Unit>('g');
  const [values, setValues] = useState(['3', '2', '1']);
  const [total, setTotal] = useState('1200');
  const numbers = values.map(value => value.trim() === '' ? NaN : Number(value));
  const amount = total.trim() === '' ? NaN : Number(total);
  const sum = numbers.reduce((a, b) => a + b, 0);
  const valid = numbers.every(n => Number.isFinite(n) && n >= 0) && Number.isFinite(amount) && amount >= 0 && sum > 0;
  const percentValid = mode !== 'percent' || Math.abs(sum - 100) < 0.000001;
  const ready = valid && percentValid;
  function changeMode(next: Mode) {
    setMode(next);
    setValues(next === 'percent' ? ['50', '30', '20'] : ['3', '2', '1']);
  }
  return <section className="calculator mix-calculator" id="mix-ratio">
    <div className="section-heading"><div><span className="eyebrow">03 / MIXING RATIO</span><h2>配合比計算</h2><p>3種類の材料を、比率または％から自動計算できます。</p></div><span className="live"><i/> リアルタイム計算</span></div>
    <div className="workspace"><div className="form">
      <h3><span>1</span> 入力方法を選択</h3>
      <div className="mix-modes" role="group" aria-label="配合の入力方法"><button type="button" aria-pressed={mode === 'ratio'} onClick={() => changeMode('ratio')}>比率で入力</button><button type="button" aria-pressed={mode === 'percent'} onClick={() => changeMode('percent')}>％で入力</button></div>
      <h3><span>2</span> 3種類の材料を入力</h3>
      <div className="mix-inputs">{values.map((value, index) => <label key={index}>材料{['A','B','C'][index]}{mode === 'percent' ? '（％）' : ' の比率'}<div className="input-unit"><input type="number" min="0" step="any" value={value} onChange={e => setValues(old => old.map((v, i) => i === index ? e.target.value : v))}/><span>{mode === 'percent' ? '％' : '比'}</span></div></label>)}</div>
      <h3><span>3</span> 合計量を入力</h3>
      <div className="mix-total-input"><label>作りたい合計量<div className="input-unit"><input type="number" min="0" step="any" value={total} onChange={e => setTotal(e.target.value)}/><span>{unit}</span></div></label><label>単位<select value={unit} onChange={e => setUnit(e.target.value as Unit)}><option value="g">g（グラム）</option><option value="kg">kg（キログラム）</option></select></label></div>
      <p className="notice">比率入力では各値の合計に応じて按分します。％入力では合計が100％の場合だけ計算します。単位を切り替えると入力値の数値はそのままです。</p>
    </div><aside>
      <div className="result mix-result" aria-live="polite"><div className="result-heading">計算結果<span>{mode === 'ratio' ? '比率' : '百分率'}</span></div>
        {ready ? <><div className="triangle-results">{numbers.map((n, i) => <div key={i}><span>材料{['A','B','C'][i]}</span><strong>{format(amount * n / sum)} <small>{unit}</small></strong></div>)}</div><div className="total-result"><span>合計量</span><strong>{format(amount)} <small>{unit}</small></strong></div></> : <div className="errors" role="alert">{!valid ? '比率と合計量に0以上の数値を入力してください。比率の合計は0より大きくしてください。' : '％の合計が ' + format(sum) + '％です。100％になるよう調整してください。'}</div>}
      </div>
      <p className="notice">小数点以下は表示時に丸めています。丸めにより表示値の合計が合計量とわずかに異なる場合があります。</p>
    </aside></div>
    <details><summary>計算式について</summary><p>比率入力：各材料量＝合計量×各材料の比率÷比率の合計。％入力：各材料量＝合計量×各材料の％÷100。</p></details>
  </section>;
}
