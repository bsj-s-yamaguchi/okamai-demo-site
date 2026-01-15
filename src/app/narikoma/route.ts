import fs from 'node:fs';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { join } from 'node:path';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    // 環境変数を取得（.env.localファイルまたはprocess.envから）
    let widgetUrl =
      process.env.NEXT_PUBLIC_WIDGET_URL || 'https://okamai-web.local';

    // .env.localファイルが存在する場合は、そこから最新の値を読み込む
    const envPath = join(process.cwd(), '.env.local');
    if (existsSync(envPath)) {
      try {
        const envContent = readFileSync(envPath, 'utf-8');
        const widgetUrlMatch = envContent.match(
          /^NEXT_PUBLIC_WIDGET_URL=(.*)$/m
        );
        if (widgetUrlMatch?.[1]?.trim()) {
          widgetUrl = widgetUrlMatch[1].trim();
        }
      } catch (fileError) {
        console.warn('Failed to read .env.local file:', fileError);
        // ファイル読み込みに失敗した場合はprocess.envの値を使用
      }
    }

    // public/narikoma/index.html を読み込む
    const htmlPath = path.join(
      process.cwd(),
      'public',
      'narikoma',
      'index.html'
    );
    let htmlContent = fs.readFileSync(htmlPath, 'utf-8');

    // 環境変数をHTMLに注入
    htmlContent = htmlContent.replace(/{{NEXT_PUBLIC_WIDGET_URL}}/g, widgetUrl);

    // HTMLをレスポンスとして返す
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error reading narikoma HTML:', error);
    return new NextResponse('Error loading narikoma page', { status: 500 });
  }
}
