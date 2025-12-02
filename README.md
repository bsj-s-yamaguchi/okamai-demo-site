# Demo Site

チャットウィジェットの動作確認用デモサイトです。

## 概要

このプロジェクトは、Okamai Webの動作確認を行うためのデモサイトです。クライアント企業が自社のサイトにチャットウィジェットを埋め込む際の参考として使用できます。

## 機能

- Okamai Webのiframe埋め込み
- チャットデータの収集
- 訪問者情報の収集
- API Gatewayへのデータ送信

## 技術スタック

- Next.js 16
- TypeScript
- Tailwind CSS
- React Hooks

## 開発

### セットアップ

```bash
bun install
```

### 開発サーバー起動

```bash
# 通常の開発サーバー
bun run dev

# dev3000を使用したデバッグモード（推奨）
bun run dev:debug
```

### ビルド

```bash
bun run build
```

### 本番サーバー起動

```bash
bun start
```

## dev3000（AI統合デバッグツール）

dev3000を使用すると、AIアシスタントとの統合デバッグ体験が可能になります：

```bash
# dev3000を使用してデバッグモードで起動
bun run dev:debug

# またはHTTPS版
bun run dev:debug:https
```

**dev3000の利点：**
- サーバーログ、ブラウザイベント、ネットワーク通信を一元管理
- AIアシスタントが自動でエラー情報を収集・解析
- エラー発生時の画面状態を自動キャプチャ
- MCP（Model Context Protocol）によるAI統合

**AIアシスタントとの統合：**
```bash
# Claude DesktopやCursorでMCP統合を有効化
claude mcp add --transport http --scope user dev3000 \
  http://localhost:3684/api/mcp/mcp
```

詳細情報: [dev3000.ai](https://dev3000.ai/)

## 環境変数

- `NEXT_PUBLIC_WIDGET_URL`: Okamai WebのURL
- `NEXT_PUBLIC_DEFAULT_SCRIPT_ID`: デフォルトのスクリプトID

## アクセス

- 開発環境: http://localhost:3000
- カスタムドメイン: https://demo-site.local
