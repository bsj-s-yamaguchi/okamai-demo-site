import fs from 'node:fs';
import path from 'node:path';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    // public/narikoma/index.html を読み込む
    const htmlPath = path.join(
      process.cwd(),
      'public',
      'narikoma',
      'index.html'
    );
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

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
