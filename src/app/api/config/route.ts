import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 環境変数を動的に取得（.env.localファイルまたはprocess.envから）
    let scriptId = process.env.NEXT_PUBLIC_DEFAULT_SCRIPT_ID || '';

    // .env.localファイルが存在する場合は、そこから最新の値を読み込む
    const envPath = join(process.cwd(), '.env.local');
    if (existsSync(envPath)) {
      try {
        const envContent = readFileSync(envPath, 'utf-8');
        const scriptIdMatch = envContent.match(
          /NEXT_PUBLIC_DEFAULT_SCRIPT_ID=(.+)/
        );
        if (scriptIdMatch?.[1]?.trim()) {
          scriptId = scriptIdMatch[1].trim();
        }
      } catch (fileError) {
        console.warn('Failed to read .env.local file:', fileError);
        // ファイル読み込みに失敗した場合はprocess.envの値を使用
      }
    }

    // エージェント設定からテーマカラーを取得
    let themeColor = '#3B82F6'; // デフォルトの青色
    let themePreset = 'blue';
    let buttonType = 'auto'; // デフォルト値
    let chatDisplayType = 'widget'; // デフォルト値

    if (scriptId) {
      const headerList = await headers();
      const forwardedProto =
        headerList.get('x-forwarded-proto') ??
        (headerList.get('host')?.includes('localhost') ? 'http' : 'https');
      const forwardedHost =
        headerList.get('x-forwarded-host') ?? headerList.get('host');
      const requestOrigin = forwardedHost
        ? `${forwardedProto}://${forwardedHost}`
        : process.env.NEXT_PUBLIC_DEMO_SITE_ORIGIN || 'https://demo-site.local';

      try {
        const appApiBase =
          process.env.NEXT_PUBLIC_APP_API_URL || 'https://app-api:8001';
        const agentResponse = await fetch(
          `${appApiBase}/api/web/script?id=${scriptId}&origin=${encodeURIComponent(
            requestOrigin
          )}`
        );
        if (agentResponse.ok) {
          const agentData = await agentResponse.json();
          themeColor = agentData.data?.themeColor || '#3B82F6';
          themePreset = agentData.data?.themePreset || 'blue';
          buttonType = agentData.data?.buttonType || 'auto';
          chatDisplayType = agentData.data?.chatDisplayType || 'widget';
        }
      } catch (error) {
        console.error('Failed to fetch agent config:', error);
      }
    }

    // widgetBaseUrlを決定（環境変数が設定されていない場合のフォールバック）
    let widgetBaseUrl = process.env.NEXT_PUBLIC_WIDGET_URL;
    if (!widgetBaseUrl) {
      // Vercel環境の場合は本番URLを使用
      if (process.env.VERCEL || process.env.VERCEL_ENV) {
        widgetBaseUrl = 'https://agent.dev.okamai.ai';
      } else {
        // ローカル開発環境の場合はローカルURLを使用
        widgetBaseUrl = 'https://okamai-web.local';
      }
    }

    return NextResponse.json({
      scriptId,
      themeColor,
      themePreset,
      buttonType,
      chatDisplayType,
      widgetBaseUrl,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to read config:', error);

    // widgetBaseUrlを決定（環境変数が設定されていない場合のフォールバック）
    let widgetBaseUrl = process.env.NEXT_PUBLIC_WIDGET_URL;
    if (!widgetBaseUrl) {
      // Vercel環境の場合は本番URLを使用
      if (process.env.VERCEL || process.env.VERCEL_ENV) {
        widgetBaseUrl = 'https://agent.dev.okamai.ai';
      } else {
        // ローカル開発環境の場合はローカルURLを使用
        widgetBaseUrl = 'https://okamai-web.local';
      }
    }

    return NextResponse.json({
      scriptId: '',
      themeColor: '#3B82F6',
      themePreset: 'blue',
      buttonType: 'auto',
      chatDisplayType: 'widget',
      widgetBaseUrl,
      timestamp: new Date().toISOString(),
      error: 'Failed to read config, using fallback script ID',
    });
  }
}
