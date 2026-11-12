import React, { useState } from 'react';

const fmt = (n: number, digits = 3) => Number.isFinite(n) ? n.toLocaleString('ja-JP', { maximumFractionDigits: digits }) : '—';
const positive = (...xs: number[]) => xs.every(x => Number.isFinite(x) && x > 0);
const numeric = (s: string) => s.trim() === '' ? NaN : Number(s);
const mm1000 = (n: number) => Math.round(n * 1000);

function NumberField({label, value, set, unit, min = 0}: {label:string;value:string;set:(v:string)=>void;unit:string;min?:number}) {
  return <label>{label}<div className="input-unit"><input type="number" min={min} step="any" value={value} onWheel={e=>e.currentTarget.blur()} onFocus={e=>e.currentTarget.select()} onClick={e=>e.currentTarget.select()} onChange={e=>set(e.target.value)}/><span>{unit}</span></div></label>;
}
function Output({rows, error}: {rows:[string,string,string][];error?:string}) {
  return <aside><div className="result" aria-live="polite"><div className="result-heading">計算結果<span>概算</span></div>{error ? <div className="errors" role="alert">{error}</div> : <div className="triangle-results">{rows.map(([label,value,unit])=><div key={label}><span>{label}</span><strong>{value} <small>{unit}</small></strong></div>)}</div>}</div></aside>;
}
function Section({id,index,title,description,children,rows,error,note}: {id:string;index:string;title:string;description:string;children:React.ReactNode;rows:[string,string,string][];error?:string;note:string}) {
 return <section className="calculator" id={id}><div className="section-heading"><div><span className="eyebrow">{index} / WORKSHOP CALCULATOR</span><h2>{title}</h2><p>{description}</p></div><span className="live"><i/> リアルタイム計算</span></div><div className="workspace"><div className="form"><h3><span>1</span> 条件を入力</h3><div className="inputs">{children}</div></div><Output rows={rows} error={error}/></div><p className="notice">ⓘ {note}</p></section>;
}
export function CuttingCalculator() {
 const [diameter,D]=useState('10'),[speed,V]=useState('100'),[teeth,Z]=useState('4'),[feed,F]=useState('0.05');
 const d=numeric(diameter),v=numeric(speed),z=numeric(teeth),f=numeric(feed);
 const valid=positive(d,v,z,f) && Number.isInteger(z);
 const rpm=1000*v/(Math.PI*d), feedRate=rpm*z*f;
 return <Section id="cutting" index="04" title="切削条件計算" description="工具径・切削速度・刃数・1刃当たりの送りから回転数と送り速度を算出します。" error={!valid?'すべて正の数値を入力し、刃数は整数にしてください。':undefined} rows={ [['主軸回転数',fmt(rpm,1),'min⁻¹'],['テーブル送り速度',fmt(feedRate,1),'mm/min']] } note="回転数＝1000×切削速度÷(π×工具径)、送り速度＝回転数×刃数×1刃当たりの送り。工具・被削材に適した推奨条件は別途確認してください。"><NumberField label="工具径 D" value={diameter} set={D} unit="mm"/><NumberField label="切削速度 V" value={speed} set={V} unit="m/min"/><NumberField label="刃数 z" value={teeth} set={Z} unit="刃"/><NumberField label="1刃当たりの送り fz" value={feed} set={F} unit="mm/刃"/></Section>;
}
export function StockCalculator() {
 const [stock,S]=useState('4000'),[part,P]=useState('350'),[kerf,K]=useState('3'),[trim,T]=useState('0'),[pieces,Q]=useState('1');
 const s=numeric(stock),p=numeric(part),k=numeric(kerf),t=numeric(trim),q=numeric(pieces);
 const valid=positive(s,p,q)&&Number.isInteger(q)&&Number.isFinite(k)&&k>=0&&Number.isFinite(t)&&t>=0&&s>=t;
 const usable=mm1000(s)-mm1000(t);
 const count=valid?Math.max(0,Math.floor((usable+mm1000(k))/(mm1000(p)+mm1000(k)))):0;
 const rem=Math.max(0,usable-count*mm1000(p)-Math.max(0,count-1)*mm1000(k))/1000;
 const needed=(q*mm1000(p)+Math.max(0,q-1)*mm1000(k)+mm1000(t))/1000;
 const requiredBars=valid&&count>0?Math.ceil(q/count):0;
 return <Section id="stock-yield" index="05" title="定尺材の取り数計算" description="定尺材から取れる個数と残材を計算します。" error={!valid?'長さと必要個数は正の数、切断幅と端材は0以上で入力してください。':undefined} rows={ [['取り数',fmt(count,0),'個'],['残材長さ',fmt(rem),'mm'],['指定個数に必要な長さ',fmt(needed),'mm'],['指定個数を取れるか',valid&&count>=q?'可能':'不足',''],['必要本数',count>0?fmt(requiredBars,0):'取り数0','本']] } note="切断幅は部品と部品の間にのみ計上します。端部切り落としなどの追加切断ロスは「端材・余裕」に含めてください。"><NumberField label="定尺材の長さ" value={stock} set={S} unit="mm"/><NumberField label="部品1個の長さ" value={part} set={P} unit="mm"/><NumberField label="切断幅（刃厚）" value={kerf} set={K} unit="mm"/><NumberField label="端材・余裕（合計）" value={trim} set={T} unit="mm"/><NumberField label="必要個数" value={pieces} set={Q} unit="個"/></Section>;
}
export function ProductionCalculator() {
 const [seconds,S]=useState('45'),[quantity,Q]=useState('100'),[setup,T]=useState('15'),[machines,M]=useState('1');
 const sec=numeric(seconds),qty=numeric(quantity),setupMin=numeric(setup),m=numeric(machines);
 const valid=positive(sec,qty,m)&&Number.isInteger(qty)&&Number.isInteger(m)&&Number.isFinite(setupMin)&&setupMin>=0;
 const processing=sec*qty/m/60,total=processing+setupMin;
 return <Section id="production" index="06" title="成形数量・時間計算" description="1個当たりの加工時間と数量から、必要な生産時間を見積もります。" error={!valid?'加工秒数・数量・機械台数は正の数、段取り時間は0以上で入力してください。':undefined} rows={ [['加工時間',fmt(processing,1),'分'],['段取り込み合計',fmt(total,1),'分'],['段取り込み合計（時間）',fmt(total/60,2),'時間'],['8時間当たりの理論生産数',fmt(Math.floor(8*3600/sec*m),0),'個']] } note="機械は同じ速度で並列稼働すると仮定します。段取り時間は全体で1回分。休憩・停止・歩留まりは含みません。"><NumberField label="1個当たり加工時間" value={seconds} set={S} unit="秒/個"/><NumberField label="生産数量" value={quantity} set={Q} unit="個"/><NumberField label="段取り時間（全体）" value={setup} set={T} unit="分"/><NumberField label="並列稼働台数" value={machines} set={M} unit="台"/></Section>;
}
export function RotationCalculator() {
 const [mode,M]=useState<'speed'|'rpm'>('speed'),[diameter,D]=useState('100'),[rpm,R]=useState('1000'),[speed,V]=useState('100');
 const d=numeric(diameter),n=numeric(rpm),v=numeric(speed);
 const valid=positive(d,mode==='speed'?v:n);
 const calculated=mode==='speed'?1000*v/(Math.PI*d):Math.PI*d*n/1000;
 return <section className="calculator" id="rotation"><div className="section-heading"><div><span className="eyebrow">07 / ROTATION</span><h2>回転数・周速計算</h2><p>直径・回転数・周速を相互に変換します。</p></div><span className="live"><i/> リアルタイム計算</span></div><div className="workspace"><div className="form"><h3><span>1</span> 計算方法を選択</h3><div className="triangle-modes"><button aria-pressed={mode==='speed'} onClick={()=>M('speed')}>周速から回転数</button><button aria-pressed={mode==='rpm'} onClick={()=>M('rpm')}>回転数から周速</button></div><h3><span>2</span> 数値を入力</h3><div className="inputs"><NumberField label="回転直径 D" value={diameter} set={D} unit="mm"/>{mode==='speed'?<NumberField label="周速 V" value={speed} set={V} unit="m/min"/>:<NumberField label="回転数 n" value={rpm} set={R} unit="min⁻¹"/>}</div></div><Output error={!valid?'直径と入力値は正の数にしてください。':undefined} rows={[[mode==='speed'?'回転数':'周速',fmt(calculated,2),mode==='speed'?'min⁻¹':'m/min']]}/></div><p className="notice">ⓘ 周速（m/min）＝π×直径（mm）×回転数（min⁻¹）÷1000。</p></section>;
}
