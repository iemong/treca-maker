# 調査リスト

技術スタック選定と実装にあたり、以下の項目について調査・確認が必要です。

## 1. TanStack Start on Cloudflare Workers
- **セットアップ**: TanStack StartをCloudflare Workersアダプターで動作させるための設定。
    - `vinxi` (TanStack Startのビルドツール) の設定確認。
    - Cloudflare固有のバインディング（KV, D1, AIなど）をServer Functionsから利用する方法。
    - *アクション*: 公式ドキュメントおよびサンプルプロジェクトを参照し、`bun create` コマンドで適切なテンプレートがあるか確認。

## 2. Gemini 3 Pro API Integration
- **API仕様**: Gemini 3 Pro (Google AI Studio / Vertex AI) のAPIエンドポイントとパラメータ仕様の確認。
- **Cloudflareからの呼び出し**: `fetch` APIを用いたリクエスト実装。
- **ストリーミング**: 生成速度向上のためのストリーミングレスポンスの実装可否。

## 3. 画像生成/加工の処理場所
- **処理負荷**: AIが生成したテキストを元に、ブラウザ（Canvas API）でカード画像を合成するか、サーバーサイド（Cloudflare Workers + OG Image生成ライブラリ等）で合成するか。
    - *アクション*: クライアントサイド（Reactコンポーネントを画像化）の方がサーバー負荷が低く、実装も容易だが、画質やデバイス依存の問題がないか検証が必要。

## 4. UIテーマ（黒基調）の実装
- **Shadcn/ui Dark Mode**: デフォルトのDark Modeをベースに、より深い黒（`#000000` や非常に暗いグレー）を使用するためのTailwind設定カスタマイズ。
    - *アクション*: `globals.css` の変数調整で実現可能か、カスタムテーマが必要か調査。
