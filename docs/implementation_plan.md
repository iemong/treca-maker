# 実装計画

## Goal Description
画像とタイトルからAI (Gemini 3 Pro) を活用してトレーディングカードを生成するWebアプリケーションを構築する。
フレームワークとして **TanStack Start** を採用し、**Cloudflare Workers** 上で動作するフルスタックアプリケーションとする。
将来的な拡張性を考慮し、AIプロンプトは疎結合に設計する。

## User Review Required
> [!IMPORTANT]
> **TanStack Startの構成**: ファイルベースルーティング (`app/routes`) と Server Functions を活用します。デプロイ先は **Cloudflare Workers** です。

## Proposed Changes

### Project Setup
#### [NEW] [app.config.ts](file:///Users/iemong/IdeaProjects/treca-maker/app.config.ts)
- TanStack Start (Vinxi) の設定ファイル
- Cloudflare Workers 向けの設定（`server.preset: 'cloudflare-module'` 等）

#### [NEW] [package.json](file:///Users/iemong/IdeaProjects/treca-maker/package.json)
- 依存関係: `@tanstack/start`, `@tanstack/react-router`, `@tanstack/react-query`, `tailwindcss`, `shadcn/ui`, `zod`, `dexie`
- Dev依存関係: `lefthook`, `ultracite` (or `@biomejs/biome` with ultracite config)

#### [NEW] [lefthook.yml](file:///Users/iemong/IdeaProjects/treca-maker/lefthook.yml)
- Git Hooksの設定
- pre-commit: BiomeによるLint/Format実行 (Ultraciteルール)

#### [NEW] [biome.json](file:///Users/iemong/IdeaProjects/treca-maker/biome.json)
- Ultraciteプリセットを適用したBiome設定

#### [NEW] [wrangler.jsonc](file:///Users/iemong/IdeaProjects/treca-maker/wrangler.jsonc)
- Cloudflare Workers の設定ファイル（静的アセットの配信設定など）

#### [NEW] [.dev.vars](file:///Users/iemong/IdeaProjects/treca-maker/.dev.vars)
- ローカル開発用の環境変数（Gemini APIキー等）の設定
- ※Gitにはコミットしない

### Backend (Server Functions)
#### [NEW] [app/server/gemini.ts](file:///Users/iemong/IdeaProjects/treca-maker/app/server/gemini.ts)
- Gemini 3 Pro APIを呼び出す Server Function (`createJsonObject` 等を使用)
- プロンプトビルダーの呼び出し

#### [NEW] [app/server/prompt-builder.ts](file:///Users/iemong/IdeaProjects/treca-maker/app/server/prompt-builder.ts)
- プロンプトの各パーツ（ルール、評価基準、フォーマット）を結合するユーティリティ
- 疎結合設計により、将来的なルール変更に対応

### Frontend (Core & DB)
#### [NEW] [app/lib/db.ts](file:///Users/iemong/IdeaProjects/treca-maker/app/lib/db.ts)
- Dexie.jsを用いたIndexedDBの初期化とスキーマ定義

### Frontend (Routes & Components)
#### [NEW] [app/routes/__root.tsx](file:///Users/iemong/IdeaProjects/treca-maker/app/routes/__root.tsx)
- ルートレイアウト。ヘッダー、フッター、Global CSS (`app/index.css`) の読み込み
- **Dark Theme** (黒基調) の適用

#### [NEW] [app/routes/index.tsx](file:///Users/iemong/IdeaProjects/treca-maker/app/routes/index.tsx)
- トップページ（LP的な役割も兼ねる）

#### [NEW] [app/routes/generate.tsx](file:///Users/iemong/IdeaProjects/treca-maker/app/routes/generate.tsx)
- カード生成ページ
- 画像アップロード、タイトル、**画像説明**の入力フォーム -> Server Function呼び出し -> 結果表示

#### [NEW] [app/routes/collection.tsx](file:///Users/iemong/IdeaProjects/treca-maker/app/routes/collection.tsx)
- コレクション一覧ページ
- IndexedDBからのデータ読み出しと表示

#### [NEW] [app/components/CardView.tsx](file:///Users/iemong/IdeaProjects/treca-maker/app/components/CardView.tsx)
- 生成されたカードを表示するコンポーネント
- **Canvas描画**: HTML5 Canvas APIを使用してカードデザイン（枠、画像、テキスト）を描画する
- 画像エクスポート機能の実装（`canvas.toDataURL` 等）

## Verification Plan

### Automated Tests
- **Unit Tests (Bun test)**:
    - `app/server/prompt-builder.ts`: プロンプト生成ロジックのテスト
    - `app/lib/db.ts`: DBスキーマと操作のテスト

### Manual Verification
- `bun run dev` でローカルサーバーを起動
- **生成フロー**: 画像アップロード -> AI生成 -> 表示 -> DB保存 が一通りの流れとして動作するか確認
- **テーマ確認**: 黒基調のUIが意図通り適用されているか確認
- **デプロイ確認**: Cloudflare Workersへのデプロイ（プレビュー）が成功するか確認
