import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { calculateWeight, materials, shapeNames, type Shape, type WeightInput } from './weight';
import { calculateTriangle, type TriangleInput } from './trigonometry';
import './style.css';
const tools = [ ['▱', '材料重量計算', '形状と材質から重量を算出'], ['∠', '三角関数計算', '角度・辺の長さをすばやく確認'], ['◒', '配合比計算', '配合比から必要な量を算出'], ['⚙', '切削条件計算', '加工に合わせた切削条件を確認'], ['▤', '定尺材の取り数計算', '材料から取れる個数を算出'], ['◷', '成形数量・時間計算', '生産数と所要時間を見積もり'], ['↻', '回転数・周速計算', '回転数と周速を相互に変換'], ['✧', 'AI図面見積もり', '図面から見積もりをサポート'] ];
const fields = { length: '長さ L', width: '幅 W', height: '高さ H', diameter: '外径 D', thickness: '肉厚 t' };
function Diagram({ shape }: { shape: Shape }) {
  return <svg viewBox="0 0 320 180" role="img" aria-label={`${shapeNames[shape]}の寸法図（模式図）`}>
    <defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse"><path d="M6 0 L0 3 L6 6" fill="none" stroke="#65848a"/></marker></defs>
    {shape === 'plate' ? <g><path d="M65 65 L210 40 L265 80 L120 108 Z M65 65 V90 L120 134 L265 105 V80 M120 108 V134"/><text x="62" y="125">板厚 t</text><text x="226" y="49">幅 W</text></g> : shape === 'squarePipe' ? <g><path d="M80 60 L180 40 L245 75 L145 100 Z M80 60 V120 L145 150 L245 125 V75 M145 100 V150"/><path d="M155 105 L234 85 V117 L155 136 Z"/><text x="252" y="111">H</text><text x="189" y="151">W</text><text x="105" y="112">t</text></g> : <g><path d="M80 65 L225 40 M80 125 L225 100"/><ellipse cx="80" cy="95" rx="25" ry="30"/><path d="M225 40 A25 30 0 0 1 225 100"/>{shape === 'roundPipe' && <ellipse cx="80" cy="95" rx="16" ry="21"/>}<path d="M43 65 V125" markerStart="url(#arrow)" markerEnd="url(#arrow)"/><text x="19" y="100">D</text>{shape === 'roundPipe' && <text x="109" y="98">t</text>}</g>}
    <path d="M90 157 L235 130" markerStart="url(#arrow)" markerEnd="url(#arrow)"/><text x="158" y="165">長さ L</text>
  </svg>;
}
function TriangleCalculator() {
  const [mode, setMode] = useState<TriangleInput['mode']>('legs');
  const [values, setValues] = useState({ base: '100', height: '50', hypotenuse: '100', angle: '30' });
  const change = (key: keyof typeof values, value: string) => setValues(old => ({ ...old, [key]: value }));
  const numeric = (key: keyof typeof values) => values[key].trim() === '' ? NaN : Number(values[key]);
  const result = calculateTriangle({ mode, base: numeric('base'), height: numeric('height'), hypotenuse: numeric('hypotenuse'), angle: numeric('angle') });
  const format = (n: number) => n.toLocaleString('ja-JP', { maximumFractionDigits: 6 });
  const field = (key: keyof typeof values, label: string, unit: string) => <label key={key}>{label}<div className="input-unit"><input type="number" step="any" value={values[key]} onChange={e => change(key, e.target.value)}/><span>{unit}</span></div></label>;
  return <section className="calculator triangle-calculator" id="trigonometry"><div className="section-heading"><div><span className="eyebrow">02 / TRIGONOMETRY</span><h2>三角関数計算</h2><p>直角三角形の辺の長さと角度を計算できます。</p></div><span className="live"><i/> リアルタイム計算</span></div>
    <div className="workspace"><div className="form"><h3><span>1</span> 計算方法を選択</h3><div className="triangle-modes">{([['legs','底辺と高さ'],['hypotenuseAngle','斜辺と角度'],['baseAngle','底辺と角度']] as const).map(([value,label]) => <button key={value} aria-pressed={mode===value} onClick={()=>setMode(value)}>{label}</button>)}</div><h3><span>2</span> 数値を入力</h3><div className="inputs">{mode==='legs' ? <>{field('base','底辺 a','mm')}{field('height','高さ b','mm')}</> : mode==='hypotenuseAngle' ? <>{field('hypotenuse','斜辺 c','mm')}{field('angle','角度 θ','°')}</> : <>{field('base','底辺 a','mm')}{field('angle','角度 θ','°')}</>}</div><p className="notice">角度 θ は底辺と斜辺の間の角度です。寸法の単位は mm です。</p></div>
    <aside><div className="diagram triangle-diagram"><div className="diagram-title">直角三角形の模式図 <span>単位：mm</span></div><svg viewBox="0 0 320 180" role="img" aria-label="底辺a、高さb、斜辺c、底辺と斜辺の間の角度θ"><path d="M55 145 L260 145 L260 30 Z" fill="#e4eef0" stroke="#65848a" strokeWidth="2"/><path d="M245 145 L245 130 L260 130" fill="none" stroke="#65848a"/><text x="151" y="164">底辺 a</text><text x="264" y="90">高さ b</text><text x="120" y="73">斜辺 c</text><text x="86" y="139">θ</text></svg></div>
    <div className="result" aria-live="polite"><div className="result-heading">計算結果<span>直角三角形</span></div>{result.ok ? <div className="triangle-results">{([['底辺 a',result.base,'mm'],['高さ b',result.height,'mm'],['斜辺 c',result.hypotenuse,'mm'],['角度 θ',result.angle,'°'],['もう一方の角度',result.otherAngle,'°']] as const).map(([label,value,unit])=><div key={label}><span>{label}</span><strong>{format(value)} <small>{unit}</small></strong></div>)}</div> : <div className="errors" role="alert">{result.error}</div>}</div></aside></div>
    <details><summary>計算式について</summary><p>斜辺 c＝√(a²＋b²)、角度 θ＝atan2(b, a)×180/π。斜辺と角度からは a＝c×cosθ、b＝c×sinθ。底辺と角度からは b＝a×tanθ、c＝a÷cosθ。</p></details></section>;
}
function App() {
  const [shape, setShape] = useState<Shape>('plate');
  const [material, setMaterial] = useState('0');
  const [values, setValues] = useState({ density: '7.85', length: '1000', width: '100', height: '50', diameter: '50', thickness: '10', quantity: '1' });
  const set = (key: keyof typeof values, value: string) => setValues(old => ({ ...old, [key]: value }));
  const input = { shape, ...Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim() === '' ? NaN : Number(v)])) } as WeightInput;
  const result = calculateWeight(input);
  const keys: (keyof typeof fields)[] = shape === 'plate' ? ['length', 'width', 'thickness'] : shape === 'bar' ? ['length', 'diameter'] : shape === 'roundPipe' ? ['length', 'diameter', 'thickness'] : ['length', 'width', 'height', 'thickness'];
  const format = (n: number) => n < 0.0001 ? n.toExponential(3) : n.toLocaleString('ja-JP', { maximumFractionDigits: 4 });
  return <><header><div className="brand"><span className="logo">▦</span><span>ものづくり計算室<small>MANUFACTURING TOOLS</small></span></div><span className="header-note">現場の計算を、もっと手軽に。</span></header>
  <main><section className="intro"><span className="eyebrow">TOOLS FOR YOUR WORKSHOP</span><h1>ものづくりに、<br className="mobile"/>確かな数字を。</h1><p>材料の重量から加工条件まで。製造現場で役立つ計算ツール。</p></section>
  <nav className="tool-grid" aria-label="計算ツール一覧">{tools.map(([icon, title, desc], i) => i < 2 ? <a className="tool active" href={i === 0 ? '#calculator' : '#trigonometry'} key={title}><span className="tool-icon">{icon}</span><span><b>{title}</b><small>{desc}</small></span><span className="chevron">↗</span></a> : <div className="tool upcoming" key={title}><span className="tool-icon">{icon}</span><span><b>{title}</b><small>{desc}</small></span><span className="badge">準備中</span></div>)}</nav>
  <section className="calculator" id="calculator"><div className="section-heading"><div><span className="eyebrow">01 / MATERIAL WEIGHT</span><h2>材料重量計算</h2><p>材質と寸法を入力すると、重量をすぐに計算できます。</p></div><span className="live"><i/> リアルタイム計算</span></div>
  <div className="workspace"><div className="form"><h3><span>1</span> 形状を選択</h3><div className="shape-tabs" role="group" aria-label="材料形状">{(Object.keys(shapeNames) as Shape[]).map(s => <button key={s} aria-pressed={shape === s} onClick={() => setShape(s)}>{shapeNames[s]}</button>)}</div>
  <h3><span>2</span> 材質・寸法を入力</h3><div className="inputs"><label className="full">材質<select value={material} onChange={e => { setMaterial(e.target.value); if(e.target.value !== 'custom') set('density', String(materials[Number(e.target.value)].density)); }}>{materials.map((m,i) => <option key={m.name} value={i}>{m.name}</option>)}<option value="custom">カスタム密度</option></select></label>
  <label className="full">材料密度<div className="input-unit"><input type="number" min="0" step="any" value={values.density} readOnly={material !== 'custom'} onChange={e => set('density', e.target.value)}/><span>g/cm³</span></div><small>密度を直接指定する場合は「カスタム密度」を選択</small></label>
  {keys.map(key => <label key={key}>{key === 'thickness' && shape === 'plate' ? '板厚 t' : key === 'diameter' && shape === 'bar' ? '直径 D' : fields[key]}<div className="input-unit"><input type="number" min="0" step="any" value={values[key]} onChange={e => set(key, e.target.value)}/><span>mm</span></div></label>)}
  <label>数量<div className="input-unit"><input type="number" min="1" step="1" value={values.quantity} onChange={e => set('quantity', e.target.value)}/><span>個</span></div></label></div></div>
  <aside><div className="diagram"><div className="diagram-title">{shapeNames[shape]}の寸法図 <span>単位：mm</span></div><Diagram shape={shape}/><small>寸法記号を示す模式図です（縮尺は実寸と異なります）。</small></div>
  <div className="result" aria-live="polite" aria-atomic="true"><div className="result-heading">計算結果<span>概算</span></div>{result.ok ? <><div className="unit-result"><span>1個当たりの重量</span><b>{format(result.unit)} <small>kg</small></b></div><div className="total-result"><span>合計重量 <small>× {values.quantity} 個</small></span><strong>{format(result.total)} <small>kg</small></strong></div></> : <div className="errors" role="alert"><b>入力内容を確認してください</b><ul>{result.errors.map(error => <li key={error}>{error}</li>)}</ul></div>}<div className="density-note">使用密度：{Number.isFinite(input.density) ? values.density : '—'} g/cm³</div></div>
  <p className="notice">ⓘ 計算結果は理論値に基づく概算です。実際の重量は材質の組成、寸法公差、角部の丸みなどにより異なります。</p></aside></div>
  <details><summary>計算式・単位について</summary><p>重量（kg）＝断面積（mm²）×長さ（mm）×密度（g/cm³）÷1,000,000。合計重量＝1個当たりの重量×数量。</p><p>板：W×t ／ 丸棒：πD²÷4 ／ 丸パイプ：π［D²−(D−2t)²］÷4 ／ 角パイプ：W×H−(W−2t)(H−2t)。角パイプの角部は直角として計算します。</p></details></section>
  <TriangleCalculator/>
  <footer><span>▦ ものづくり計算室</span><span>毎日のものづくりを支える、小さな道具箱。</span></footer></main></>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
