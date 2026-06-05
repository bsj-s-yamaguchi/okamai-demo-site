import fs, { existsSync, readFileSync } from 'node:fs';
import path, { join } from 'node:path';
import { type NextRequest, NextResponse } from 'next/server';

function readEnvValue(key: string, fallback: string): string {
  let value = process.env[key] || fallback;

  // .env.local が存在する場合は最新の値を読み込む（narikoma と同方式）
  const envPath = join(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    try {
      const envContent = readFileSync(envPath, 'utf-8');
      const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
      if (match?.[1]?.trim()) {
        value = match[1].trim();
      }
    } catch (fileError) {
      console.warn('Failed to read .env.local file:', fileError);
    }
  }

  return value;
}

export async function GET(_request: NextRequest) {
  try {
    const widgetUrl = readEnvValue(
      'NEXT_PUBLIC_WIDGET_URL',
      process.env.VERCEL || process.env.VERCEL_ENV
        ? 'https://agent.dev.okamai.ai'
        : 'https://okamai-web.local'
    );
    const scriptId = readEnvValue('NEXT_PUBLIC_DEFAULT_SCRIPT_ID', '');

    // public/itoshima/index.html を読み込む
    const htmlPath = path.join(
      process.cwd(),
      'public',
      'itoshima',
      'index.html'
    );
    let htmlContent = fs.readFileSync(htmlPath, 'utf-8');

    // 環境変数をHTMLに注入
    htmlContent = htmlContent
      .replace(/{{WIDGET_URL}}/g, widgetUrl)
      .replace(/{{SCRIPT_ID}}/g, scriptId);

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error reading itoshima HTML:', error);
    return new NextResponse('Error loading itoshima page', { status: 500 });
  }
}
