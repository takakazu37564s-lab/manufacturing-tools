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

## インストール不要でブラウザーから使う（GitHub Pages）

GitHub Pagesで静的サイトとして公開できます。PCへのNode.jsのインストールやAPIキーは不要です。計算はブラウザー内で実行されます。

### 初回の操作（リポジトリ管理者）

1. GitHubでこのリポジトリの **Settings → Pages** を開きます。
2. **Build and deployment → Source** で **GitHub Actions** を選びます。
3. **Actions** タブを開き、左側の **GitHub Pages に公開** を選びます。Actionsが無効の場合は有効にしてください。
4. **Run workflow** を押し、ブランチ **main** を選んで、もう一度 **Run workflow** を押します。この操作で公開が始まります。
5. 数分待ち、実行結果が緑色になったら、実行結果の **deploy** に表示されるURLを開きます。

標準の公開先（公開が完了するまでは開けません）：
https://takakazu37564s-lab.github.io/manufacturing-tools/

GitHub Freeでの無料公開は公開リポジトリを前提とします。非公開リポジトリの場合は、SettingsでPagesの利用条件・プランを確認してください。公開リポジトリへの変更はソースコードも公開するため、内容を確認してから判断してください。通常のPagesサイトはURLを知っている人なら閲覧できます。

公開後はURLをブラウザーで開くだけで利用でき、スマートフォンでも同じURLを使用できます。初期値（板・鉄・長さ1000 mm・幅100 mm・厚さ10 mm・数量1）で単重と合計が7.85 kgになり、数量2で合計が15.7 kgになることを確認してください。

### 更新・トラブル対応

- mainに変更を保存した後、同じ **Run workflow** の操作で再公開します。pushだけでは公開しない設定です。
- 404の場合：Actionsの成功とSettings → Pagesの公開URLを確認し、数分待って再度開いてください。
- 失敗の場合：Actionsの赤い実行結果を開いて失敗したステップを確認してください。Pages未設定の場合は上記のSourceを確認します。
- 停止する場合：Settings → Pagesの **Unpublish site** を使用します。

公開処理は `.github/workflows/deploy-pages.yml` にあります。既存の計算機能を変更せず、公開用ビルドだけで `/manufacturing-tools/` を指定し、JavaScriptとCSSの配信先を合わせています。ローカル開発の設定はそのままです。
