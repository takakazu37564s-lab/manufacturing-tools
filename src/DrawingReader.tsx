/// <reference types="vite/client" />
import React, { useEffect, useState } from 'react';

type DrawingFields = { material: string; thickness: string; length: string; width: string; quantity: string; notes: string };
const empty: DrawingFields = { material: '', thickness: '', length: '', width: '', quantity: '', notes: '' };
const labels: Record<keyof DrawingFields, string> = { material: '材質', thickness: '板厚 (mm)', length: '長さ (mm)', width: '幅 (mm)', quantity: '数量 (個)', notes: '図面の注記・確認事項' };
const endpoint = import.meta.env.VITE_DRAWING_API_URL as string | undefined;
const maxBytes = 10 * 1024 * 1024;
const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
export default function DrawingReader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [fields, setFields] = useState<DrawingFields>(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const choose = (candidate?: File) => {
    setError(''); setDone(false); setFields(empty);
    if (!candidate) { setFile(null); return; }
    if (!allowed.includes(candidate.type)) { setFile(null); setError('PDF・PNG・JPG形式を選択してください。'); return; }
    if (candidate.size > maxBytes) { setFile(null); setError('ファイルは10MB以下にしてください。'); return; }
    setFile(candidate);
  };
  const analyze = async () => {
    if (!file || busy) return;
    if (!endpoint) { setError('AI接続は未設定です。管理者による安全な解析サーバーの設定が必要です。'); return; }
    setBusy(true); setError(''); setDone(false);
    try {
      const data = new FormData(); data.append('drawing', file);
      const response = await fetch(endpoint, { method: 'POST', body: data });
      if (!response.ok) throw new Error('AI解析に失敗しました。接続設定やファイルを確認してください。');
      const result: unknown = await response.json();
      if (!result || typeof result !== 'object' || !('fields' in result) || !result.fields || typeof result.fields !== 'object') throw new Error('解析結果の形式が正しくありません。');
      const raw = result.fields as Record<string, unknown>;
      setFields(Object.fromEntries(Object.keys(empty).map(key => [key, typeof raw[key] === 'string' || typeof raw[key] === 'number' ? String(raw[key]) : ''])) as DrawingFields);
      setDone(true);
    } catch (e) { setError(e instanceof Error ? e.message : '読み込みに失敗しました。'); }
    finally { setBusy(false); }
  };
  return <section className="calculator drawing-reader" id="drawing-reader">
    <div className="section-heading"><div><span className="eyebrow">08 / AI DRAWING READER</span><h2>AI図面読み込み</h2><p>図面から寸法・材質・数量などを読み取り、確認・修正できます。</p></div><span className="live">接続設定が必要</span></div>
    <div className="workspace"><div className="form"><h3><span>1</span> 図面を選択</h3><label className="drawing-upload">PDF・PNG・JPG（10MB以下）<input type="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" onChange={e => choose(e.target.files?.[0])}/></label>
      {file && <p className="drawing-filename">選択中：{file.name}</p>}
      <button className="drawing-action" disabled={!file || busy || !endpoint} onClick={analyze}>{busy ? '解析中…' : 'AIで図面を読み取る'}</button>
      {!endpoint && <p className="drawing-warning">現在は図面の選択・表示まで利用できます。AI解析には、安全なサーバー接続の設定が必要です。APIキーをこの画面に入力しないでください。</p>}
      <p className="notice">取引先の図面など機密情報は、送信先と利用条件を確認するまでアップロードしないでください。AIの読み取り結果は必ず原図と照合してください。</p>
      {error && <p className="drawing-error" role="alert">{error}</p>}
    </div><aside><div className="diagram drawing-preview"><div className="diagram-title">図面プレビュー</div>{preview && file ? file.type === 'application/pdf' ? <iframe title="図面PDFプレビュー" src={preview}/> : <img alt="選択した図面" src={preview}/> : <p>図面を選択すると、ここに表示されます。</p>}</div></aside></div>
    <div className="drawing-output"><h3><span>2</span> 読み取り結果の確認・修正 {done && <small>AI解析結果</small>}</h3><div className="inputs">{(Object.keys(empty) as (keyof DrawingFields)[]).map(key => <label key={key} className={key==='notes' ? 'full' : ''}>{labels[key]}{key==='notes' ? <textarea rows={3} value={fields[key]} onChange={e => setFields(old => ({ ...old, [key]: e.target.value }))}/> : <div className="input-unit"><input type="text" value={fields[key]} onChange={e => setFields(old => ({ ...old, [key]: e.target.value }))}/></div>}</label>)}</div><p className="notice">空欄は未確認です。AIが読み取れなかった値を推測で補完しないでください。見積もり計算はこの機能に含まれません。</p></div>
  </section>;
}
