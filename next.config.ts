import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { NextConfig } from 'next';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const envFilePath = join(__dirname, '.env.local');
let defaultScriptId = process.env.NEXT_PUBLIC_DEFAULT_SCRIPT_ID || '';
let widgetUrl =
  process.env.NEXT_PUBLIC_WIDGET_URL || 'https://okamai-web.local';

if (existsSync(envFilePath)) {
  try {
    const content = readFileSync(envFilePath, 'utf-8');
    const defaultIdMatch = content.match(
      /^NEXT_PUBLIC_DEFAULT_SCRIPT_ID=(.*)$/m
    );
    if (defaultIdMatch?.[1]?.trim()) {
      defaultScriptId = defaultIdMatch[1].trim();
    }
    const widgetUrlMatch = content.match(/^NEXT_PUBLIC_WIDGET_URL=(.*)$/m);
    if (widgetUrlMatch?.[1]?.trim()) {
      widgetUrl = widgetUrlMatch[1].trim();
    }
  } catch (error) {
    console.warn('Failed to read demo-site .env.local:', error);
  }
}

const nextConfig: NextConfig = {
  // 開発環境とビルド環境でdistDirを分離
  distDir: process.env.NODE_ENV === 'production' ? '.next' : '.next-dev',
  // Turbopack の設定
  turbopack: {
    root: __dirname,
  },

  // 実験的機能の設定
  experimental: {
    webpackBuildWorker: false,
    optimizePackageImports: ['react', 'react-dom'],
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },

  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  compress: true,

  // 開発サーバーの設定
  devIndicators: {
    position: 'bottom-right',
  },

  // ホットリロードの設定
  onDemandEntries: {
    // ページをメモリに保持する時間（ミリ秒）
    maxInactiveAge: 25 * 1000,
    // 同時に保持するページ数
    pagesBufferLength: 2,
  },

  // 開発環境でのホットリロード設定
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    return config;
  },

  // 開発環境でのクロスオリジンリクエストを許可（Next.js 14では非推奨）
  // allowedDevOrigins: [
  //   'demo-site.local',
  //   'okamai-web.local',
  //   'client-console.local',
  //   'localhost',
  //   '127.0.0.1',
  // ],

  // Turbopackを使用するため、webpack設定は不要

  // パフォーマンス最適化（swcMinifyはNext.js 15でデフォルトで有効）

  // 画像最適化
  images: {
    unoptimized: true, // 開発環境では画像最適化を無効化
  },

  // React Strict Mode を無効化（hydration エラーを減らすため）
  reactStrictMode: false,

  env: {
    NEXT_PUBLIC_DEFAULT_SCRIPT_ID: defaultScriptId,
    NEXT_PUBLIC_WIDGET_URL: widgetUrl,
  },

  // コンパイラの設定（Turbopackとの互換性のため無効化）
  // compiler: {
  //   // 開発時の警告を抑制
  //   removeConsole: process.env.NODE_ENV === 'production',
  // },

  // CORS設定
  async headers() {
    return [
      {
        // APIルートに適用
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
      {
        // セキュリティヘッダー
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self'",
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
