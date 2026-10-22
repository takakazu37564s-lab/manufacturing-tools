/// <reference types="vite/client" />
import { useEffect, useState } from 'react';

type DrawingData = { drawingNumber: string; material: string; thickness: string; dimensions: string; quantity: string; notes: string };
const keys = ['drawingNumber', 'material', 'thickness', 'dimensions', 'quantity', 'notes'] as const;
const labels: Record<keyof DrawingData, string> = { drawingNumber: '図面番号', material: '材質', thickness: '板厚・肉厚', dimensions: '寸法', quantity: '数量', notes: 'その他の記載・注意事項' };
const empty = (): DrawingData => ({ drawingNumber: '', material: '', thickness: '', dimensions: '', quantity: '', notes: '' });
const endpoint = import.meta.env.VITE_DRAWING_API_URL as string | undefined;
const maxBytes = 10 * 1024 * 1024;
const accepted = ['application/pdf', 'image/jpeg', 'image/png'];
export function DrawingReader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [data, setData] = useState<DrawingData>(empty);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [error, setError] = useState('');
  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  function select(next?: File) {
    setData(empty()); setStatus('idle'); setError('');
    if (!next) { setFile(null); return; }
    if (!accepted.includes(next.type) && !/\.(pdf|jpe?g|png)$/i.test(next.name)) { setFile(null); setError('PDF・JPG・PNGの図面を選んでください。'); return; }
    if (next.size > maxBytes) { setFile(null); setError('ファイルは10MB以下にしてください。'); return; }
    setFile(next);
  }
  async function analyze() {
    if (!file || !endpoint || status === 'loading') return;
    setError(''); setStatus('loading');
    try {
      const form = new FormData(); form.append('file', file);
      const response = await fetch(endpoint, { method: 'POST', body: form });
      if (!response.ok) throw new Error('解析サーバーが応答しませんでした（HTTP ' + response.status + '）。');
      const json: unknown = await response.json();
      if (!json || typeof json !== 'object' || !('data' in json) || !json.data || typeof json.data !== 'object') throw new Error('解析結果の形式が正しくありません。');
      const record = json.data as Record<string, unknown>;
      const result = empty();
      for (const key of keys) {
        const value = record[key];
        if (value != null && typeof value !== 'string' && typeof value !== 'number') throw new Error('解析結果の形式が正しくありません。');
        result[key] = value == null ? '' : String(value);
      }
      setData(result); setStatus('done');
    } catch (err) {
      setStatus('idle'); setError(err instanceof Error ? err.message : '図面の解析に失敗しました。');
    }
  }
  return <section className="calculator drawing-reader" id="drawing-reader">
    <div className="section-heading"><div><span className="eyebrow">08 / DRAWING READER</span><h2>AI図面読み込み</h2><p>図面の内容を確認し、AI解析結果を編集できます。見積もり機能は今後追加予定です。</p></div><span className="drawing-phase">AI接続準備中</span></div>
    <div className="workspace"><div className="form"><h3><span>1</span> 図面ファイルを選択</h3>
      <label className="drawing-upload">PDF・JPG・PNG（最大10MB）<input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={e => select(e.target.files?.[0])}/></label>
      {file && <p className="drawing-file">選択中：{file.name}（{(file.size / 1024 / 1024).toFixed(2)} MB）</p>}
      <h3><span>2</span> AIで読み取る</h3>
      <button className="drawing-action" type="button" disabled={!file || !endpoint || status === 'loading'} onClick={analyze}>{status === 'loading' ? '解析中…' : 'AI解析を開始'}</button>
      {!endpoint && <p className="drawing-warning">現在は図面の選択・プレビューが利用できます。AI解析には安全な解析サーバーの接続設定が必要です。APIキーをこの画面に入力する必要はありません。</p>}
      {error && <p className="drawing-error" role="alert">{error}</p>}
      <p className="notice">機密図面は、送信先サーバーの管理・保存方針を確認するまでAI解析に送信しないでください。</p>
    </div><aside><div className="diagram drawing-preview"><div className="diagram-title">図面プレビュー <span>ブラウザー内で表示</span></div>
      {!file ? <div className="drawing-placeholder">ここに選択した図面が表示されます</div> : file.type === 'application/pdf' || /\.pdf$/i.test(file.name) ? <object data={preview} type="application/pdf" aria-label="PDF図面プレビュー"><p>PDFプレビューに対応していないブラウザーです。</p></object> : <img src={preview} alt="選択した図面のプレビュー"/>}
    </div></aside></div>
    <div className="drawing-output"><h3>読み取り結果 <small>{status === 'done' ? 'AI解析結果（要確認）' : '未解析'}</small></h3><p className="notice">AIの読み取りには誤りや抜けがあり得ます。原図と照合し、必要に応じて修正してください。</p>
      <div className="drawing-fields">{keys.map(key => <label key={key}>{labels[key]}{key === 'notes' || key === 'dimensions' ? <textarea rows={3} value={data[key]} onChange={e => setData(old => ({ ...old, [key]: e.target.value }))} placeholder="未入力"/> : <input type="text" value={data[key]} onChange={e => setData(old => ({ ...old, [key]: e.target.value }))} placeholder="未入力"/>}</label>)}</div>
    </div>
  </section>;
}
