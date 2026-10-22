# ものづくり計算室

製造業向けの日本語計算ツール集。React / TypeScript / Viteを使用し、PC・スマートフォンに対応しています。外部APIや認証情報は不要です。

## 開発

Node.js 22.12以上（検証環境：24.19）を使用してください。

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

`npm run dev` は開発サーバー、`npm run preview` はビルド済み `dist` の確認用サーバーです。

## 実装内容

- 材料重量計算：板・丸棒・丸パイプ・角パイプ
- 材料選択またはカスタム密度、寸法（mm）、数量から単重・合計重量（kg）を即時計算
- 寸法模式図、入力チェック、使用密度、概算表示
- その他の6計算機能およびAI図面見積もりは準備中（AI接続なし）

計算ロジックは `src/weight.ts`、Vitestによる単体テストは `src/weight.test.ts`、UIは `src/main.tsx` に分離しています。

重量（kg）＝断面積（mm²）×長さ（mm）×密度（g/cm³）÷1,000,000。
角パイプは角部の丸みを含まない理想断面です。結果は理論的な概算で、実測重量を保証しません。密度の初期値は鉄・一般鋼7.85、SUS304 7.93、アルミニウム2.70、銅8.96 g/cm³です。

## GitHubへの保存

ソース、設定、`package-lock.json` をコミットしてください。`node_modules` と `dist` は `.gitignore` で除外しています。
