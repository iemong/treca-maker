# 技術スタック

## Core
- **Runtime**: Bun
- **Framework**: TanStack Start (React)
    - Full-stack framework based on TanStack Router
- **Language**: TypeScript

## Styling & UI
- **Styling**: Tailwind CSS
- **UI Component Library**: shadcn/ui
- **Theme**: Dark Mode (遊戯王風の黒基調、カードを際立たせるデザイン)

## State Management & Async
- **State/Async**: TanStack Query (TanStack Startに統合/併用)

## Infrastructure & Hosting
- **Hosting**: Cloudflare Workers
    - TanStack Startの推奨デプロイ先
    - 静的アセットとServer Functionsを単一のWorkerで配信
- **Backend/Edge**: TanStack Start Server Functions (Cloudflare Workers上で動作)

## AI & Data
- **AI Model**: Gemini 3 Pro (Latest Model)
    - 高度な推論とマルチモーダル理解を活用
    - Cloudflare上のServer FunctionsからAPIを利用
- **Database**: IndexedDB (クライアントサイド保存)
    - Wrapper: Dexie.js

## Quality Assurance & Tooling
- **Linter/Formatter**: Biome (via Ultracite preset)
- **Git Hooks**: Lefthook
- **Testing**: Bun test
- **Methodology**: TDD (Test Driven Development)
