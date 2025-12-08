'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

// windowオブジェクトの型定義を拡張
declare global {
  interface Window {
    okamaiWebLoaded?: () => void;
  }
}

export default function Home() {
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [scriptId, setScriptId] = useState('');
  const [domainVerificationStatus, setDomainVerificationStatus] = useState<
    'pending' | 'success' | 'failed'
  >('pending');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [customFields] = useState({
    aa: 'カスタムフィールドCaaa',
    ddd: 'カスタムフィールドDbbb',
  });
  const [widgetBaseUrl, setWidgetBaseUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      // クライアントサイド: Vercel環境を検出
      if (
        window.location.hostname.includes('vercel.app') ||
        window.location.hostname.includes('vercel.com')
      ) {
        return (
          process.env.NEXT_PUBLIC_WIDGET_URL || 'https://agent.dev.okamai.ai'
        );
      }
    }
    // サーバーサイドまたはローカル環境
    return process.env.NEXT_PUBLIC_WIDGET_URL || 'https://okamai-web.local';
  });
  const [configLoaded, setConfigLoaded] = useState(false);

  // クライアントサイドかどうかを判定
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 設定を動的に読み込む
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const config = await response.json();
          setScriptId(config.scriptId || '');
          setWidgetBaseUrl(
            config.widgetBaseUrl ||
              process.env.NEXT_PUBLIC_WIDGET_URL ||
              (typeof window !== 'undefined' &&
              window.location.hostname.includes('vercel.app')
                ? 'https://agent.dev.okamai.ai'
                : 'https://okamai-web.local')
          );
          setConfigLoaded(true);
          console.log('Config loaded:', config);
        } else {
          console.error('Failed to fetch config:', response.status);
          setConfigLoaded(true);
        }
      } catch (error) {
        console.error('Error fetching config:', error);
        setConfigLoaded(true);
      }
    };

    fetchConfig();
  }, []);

  const chatPlusInfo = {
    companyName: 'デモユーザ',
    tel: '00000',
    chatId: 'df902aae_2',
  };

  useEffect(() => {
    // スクリプトで作成されたiframeの読み込み状態を監視
    const checkIframeLoaded = () => {
      const iframe = document.getElementById(
        'okamai-web-iframe'
      ) as HTMLIFrameElement;
      if (iframe?.contentWindow) {
        setIsIframeLoaded(true);
        return true; // iframeが見つかった場合はtrueを返す
      }
      return false; // iframeが見つからない場合はfalseを返す
    };

    // 初期チェック
    if (checkIframeLoaded()) {
      return; // 既にiframeが存在する場合は早期リターン
    }

    // より短い間隔でチェック（iframeが動的に作成されるため）
    const interval = setInterval(() => {
      if (checkIframeLoaded()) {
        clearInterval(interval); // iframeが見つかったらインターバルを停止
        console.log('✅ iframe found and loaded successfully');
      } else {
        // デバッグ用：定期的にiframeの状態をログ出力
        const iframe = document.getElementById(
          'okamai-web-iframe'
        ) as HTMLIFrameElement;
        if (iframe && !iframe.contentWindow) {
          console.log('🔄 iframe exists but contentWindow not ready yet');
        }
      }
    }, 100); // 100msに短縮

    // タイムアウト設定
    const timeout = setTimeout(() => {
      clearInterval(interval);
      console.warn('Iframe loading timeout, forcing state update');
      console.log('Debug info:', {
        scriptId,
        iframeExists: !!document.getElementById('okamai-web-iframe'),
        iframeContentWindow: !!(
          document.getElementById('okamai-web-iframe') as HTMLIFrameElement
        )?.contentWindow,
        bodyChildren: document.body.children.length,
      });
      setIsIframeLoaded(true); // タイムアウト時は強制的に状態を更新
    }, 5000); // 5秒に延長

    // グローバルイベントリスナーを設定
    window.okamaiWebLoaded = () => {
      clearInterval(interval);
      clearTimeout(timeout);
      setIsIframeLoaded(true);
    };

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      window.okamaiWebLoaded = undefined;
    };
  }, [scriptId]);

  // ドメイン検証の状態を監視
  useEffect(() => {
    // コンソールメッセージを監視してドメイン検証の状態を判定
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      const message = args.join(' ');
      if (message.includes('Okamai Web: ドメイン検証成功')) {
        setDomainVerificationStatus('success');
        setVerificationMessage(
          'ドメイン検証が成功しました。ウィジェットが表示されます。'
        );
      }
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      const message = args.join(' ');
      if (
        message.includes(
          'Okamai Web: このドメインでは埋め込みが許可されていません'
        )
      ) {
        setDomainVerificationStatus('failed');
        setVerificationMessage(
          'このドメインでは埋め込みが許可されていません。管理画面でドメインを追加してください。'
        );
      } else if (message.includes('Okamai Web: ドメイン検証に失敗しました')) {
        setDomainVerificationStatus('failed');
        setVerificationMessage(
          'ドメイン検証に失敗しました。スクリプトIDを確認してください。'
        );
      }
      originalError.apply(console, args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, [isIframeLoaded]);

  // iframeの読み込みをもってドメイン検証成功として扱う
  useEffect(() => {
    if (isIframeLoaded && domainVerificationStatus === 'pending') {
      setDomainVerificationStatus('success');
      setVerificationMessage('ウィジェットの読み込みを確認しました。');
    }
  }, [isIframeLoaded, domainVerificationStatus]);

  return (
    <>
      {/* ウィジェットスクリプト */}
      {configLoaded && scriptId && (
        <Script
          key={scriptId}
          src={`${widgetBaseUrl}/widget.js?id=${scriptId}&aa=${encodeURIComponent(customFields.aa)}&ddd=${encodeURIComponent(customFields.ddd)}`}
          strategy="afterInteractive"
          onLoad={() => {
            console.log('Widget script loaded via Next.js Script component');
            console.log('Script ID:', scriptId);
            console.log('Custom Fields:', customFields);
            console.log(
              'Script URL:',
              `${widgetBaseUrl}/widget.js?id=${scriptId}&aa=${encodeURIComponent(customFields.aa)}&ddd=${encodeURIComponent(customFields.ddd)}`
            );
            console.log('Current scriptId state:', scriptId);
          }}
          onError={(error) => {
            console.error('Failed to load widget script:', error);
            console.error('Script ID:', scriptId);
            console.error('Custom Fields:', customFields);
            console.error(
              'Script URL:',
              `${widgetBaseUrl}/widget.js?id=${scriptId}&aa=${encodeURIComponent(customFields.aa)}&ddd=${encodeURIComponent(customFields.ddd)}`
            );
          }}
        />
      )}

      <div className="font-sans min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-auto h-screen">
        <main className="max-w-6xl mx-auto p-8">
          {/* ヘッダー部分 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-green-600">
              Okamai Demo
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              チャット機能付きウェブサイト
            </p>
          </div>

          {/* チャット情報カード */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              📋 チャット情報
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-blue-600 text-xl mb-1">🏢</div>
                <h3 className="font-medium text-gray-800 text-sm mb-1">
                  会社名
                </h3>
                <p className="text-gray-600 text-sm">
                  {chatPlusInfo.companyName}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-green-600 text-xl mb-1">📞</div>
                <h3 className="font-medium text-gray-800 text-sm mb-1">
                  電話番号
                </h3>
                <p className="text-gray-600 text-sm">{chatPlusInfo.tel}</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-purple-600 text-xl mb-1">💬</div>
                <h3 className="font-medium text-gray-800 text-sm mb-1">
                  チャットID
                </h3>
                <p className="text-gray-600 text-xs font-mono">
                  {scriptId || chatPlusInfo.chatId}
                </p>
              </div>
            </div>
          </div>

          {/* カスタムフィールド情報カード */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              🔧 カスタムフィールド
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-yellow-600 text-xl mb-1">🔧</div>
                <h3 className="font-medium text-gray-800 text-sm mb-1">aa</h3>
                <p className="text-gray-600 text-sm">{customFields.aa}</p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-red-600 text-xl mb-1">🔧</div>
                <h3 className="font-medium text-gray-800 text-sm mb-1">ddd</h3>
                <p className="text-gray-600 text-sm">{customFields.ddd}</p>
              </div>
            </div>
          </div>

          {/* 設定読み込み状態表示 */}
          {!configLoaded && (
            <div className="bg-blue-50 rounded-lg shadow-sm p-6 mb-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">設定を読み込み中...</p>
                <p className="text-sm text-gray-500 mt-2">
                  最新の環境変数を取得しています
                </p>
              </div>
            </div>
          )}

          {/* Okamai Web の動的読み込み状態表示 */}
          {configLoaded && !isIframeLoaded && scriptId && (
            <div className="bg-blue-50 rounded-lg shadow-sm p-6 mb-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">
                  チャットウィジェットを読み込み中...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  スクリプトが自動的にiframeを作成しています
                </p>
              </div>
            </div>
          )}

          {/* ドメイン検証状態表示 */}
          {domainVerificationStatus === 'pending' && (
            <div className="bg-blue-50 rounded-lg shadow-sm p-6 mb-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-gray-800 font-medium">ドメイン検証中...</p>
                <p className="text-sm text-gray-600 mt-1">
                  スクリプトIDとドメイン設定を確認しています
                </p>
              </div>
            </div>
          )}

          {domainVerificationStatus === 'success' && (
            <div className="bg-green-50 rounded-lg shadow-sm p-6 mb-6">
              <div className="text-center">
                <div className="text-green-600 text-2xl mb-2">✅</div>
                <p className="text-gray-800 font-medium">ドメイン検証成功</p>
                <p className="text-sm text-gray-600 mt-1">
                  {verificationMessage}
                </p>
              </div>
            </div>
          )}

          {domainVerificationStatus === 'failed' && (
            <div className="bg-red-50 rounded-lg shadow-sm p-6 mb-6">
              <div className="text-center">
                <div className="text-red-600 text-2xl mb-2">❌</div>
                <p className="text-gray-800 font-medium">ドメイン検証失敗</p>
                <p className="text-sm text-gray-600 mt-1">
                  {verificationMessage}
                </p>
                <div className="mt-4 p-3 bg-white rounded border">
                  <h4 className="font-medium text-gray-800 mb-2">解決方法:</h4>
                  <ul className="text-sm text-gray-600 space-y-1 text-left">
                    <li>• スクリプトIDが正しいか確認してください</li>
                    <li>
                      • 管理画面でこのドメインが許可されているか確認してください
                    </li>
                    <li>
                      • 管理画面:
                      <a
                        href="https://client-console"
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        https://client-console.local
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 動的に作成されるiframeの状態表示 */}
          {isIframeLoaded && domainVerificationStatus === 'success' && (
            <div className="bg-green-50 rounded-lg shadow-sm p-6 mb-6">
              <div className="text-center">
                <div className="text-green-600 text-2xl mb-2">✅</div>
                <p className="text-gray-800 font-medium">
                  チャットウィジェットが読み込まれました
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  iframeが動的に作成され、チャット機能が利用可能です
                </p>
              </div>
            </div>
          )}

          {/* デバッグ情報（開発環境のみ） */}
          {process.env.NODE_ENV === 'development' && isClient && (
            <div className="bg-gray-50 rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                🔧 デバッグ情報
              </h2>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Config Loaded:</strong> {configLoaded ? '✅' : '❌'}
                </p>
                <p>
                  <strong>Script ID:</strong> {scriptId || '未設定'}
                </p>
                <p>
                  <strong>Widget Base URL:</strong> {widgetBaseUrl}
                </p>
                <p>
                  <strong>Iframe Loaded:</strong> {isIframeLoaded ? '✅' : '❌'}
                </p>
                <p>
                  <strong>Domain Verification:</strong>{' '}
                  {domainVerificationStatus}
                </p>
                <p>
                  <strong>Iframe Element:</strong>{' '}
                  {document.getElementById('okamai-web-iframe')
                    ? '存在'
                    : '未発見'}
                </p>
                <p>
                  <strong>Iframe ContentWindow:</strong>{' '}
                  {(
                    document.getElementById(
                      'okamai-web-iframe'
                    ) as HTMLIFrameElement
                  )?.contentWindow
                    ? '利用可能'
                    : '未準備'}
                </p>
              </div>
            </div>
          )}

          {/* チャットボタン要素（elementタイプ用） */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              🔘 チャットボタン要素
            </h2>
            <div className="text-center">
              <div
                id="okamai-web-button"
                className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg cursor-pointer transition-colors duration-200"
                style={{ minWidth: '200px', minHeight: '60px' }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span className="font-medium">チャットを開く</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                このボタンは「element」タイプのボタン配置で使用されます
              </p>
            </div>
          </div>

          {/* 新しい表示形式の説明 */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              🎨 新しい表示形式オプション (デフォルト: widget)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ボタン表示形式 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-3">
                  🔘 ボタン表示形式
                </h3>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li>
                    <strong>auto:</strong> 画面右下に自動配置（従来通り）
                  </li>
                  <li>
                    <strong>element:</strong> 指定した要素内に配置
                  </li>
                </ul>
              </div>

              {/* チャット表示形式 */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-3">
                  💬 チャット表示形式
                </h3>
                <ul className="text-sm text-green-700 space-y-2">
                  <li>
                    <strong>widget:</strong> 従来のウィジェット形式
                  </li>
                  <li>
                    <strong>modal:</strong> 全画面モーダル表示
                  </li>
                  <li>
                    <strong>tab:</strong> 別タブで開く
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>💡 設定方法:</strong>{' '}
                クライアントコンソールの管理画面でスクリプト作成時に表示形式を選択できます
              </p>
            </div>
          </div>

          {/* スクリプト埋め込み例 */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              🔧 スクリプト埋め込み例
            </h2>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-gray-800 mb-2">
                管理画面で生成された埋め込みコード:
              </h3>
              <pre className="text-sm text-gray-700 bg-white p-3 rounded border overflow-x-auto">
                {`<script>
                (function() {
                  var script = document.createElement('script');
                  script.src = 'https://demo-site.local/widget.js?id=YOUR_SCRIPT_ID&companyName=companyName&email=email&inquiryType=inquiryType&message=message';
                  script.async = true;
                  document.head.appendChild(script);
                })();
                </script>`}
              </pre>
            </div>

            <div className="text-sm text-gray-600">
              <p className="mb-2">
                •
                管理画面でエージェント設定を作成すると、埋め込みコードが生成されます
              </p>
              <p className="mb-2">
                • 生成されたコードをHTMLの&lt;head&gt;タグ内に配置してください
              </p>
              <p className="mb-2">
                • スクリプトIDは管理画面で発行される一意のIDです
              </p>
              <p>
                • カスタムフィールド（会社名、メールアドレスなど）も設定可能です
              </p>
            </div>
          </div>

          {/* チャット使用方法説明 */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              💡 チャットの使用方法
            </h2>

            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="text-green-600 text-lg">✅</div>
                <div>
                  <h3 className="font-medium text-gray-800 text-sm">
                    チャットウィンドウ
                  </h3>
                  <p className="text-gray-600 text-sm">
                    スクリプトが自動的にiframeを作成し、チャットウィンドウが表示されます
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="text-blue-600 text-lg">💬</div>
                <div>
                  <h3 className="font-medium text-gray-800 text-sm">
                    メッセージ送信
                  </h3>
                  <p className="text-gray-600 text-sm">
                    入力欄にメッセージを入力し、Enterキーまたは「送信」ボタンで送信
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                <div className="text-purple-600 text-lg">🤖</div>
                <div>
                  <h3 className="font-medium text-gray-800 text-sm">
                    自動応答
                  </h3>
                  <p className="text-gray-600 text-sm">
                    モックオペレーターが自動で応答します
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="text-yellow-600 text-lg">⚡</div>
                <div>
                  <h3 className="font-medium text-gray-800 text-sm">
                    リアルタイム
                  </h3>
                  <p className="text-gray-600 text-sm">
                    メッセージはリアルタイムで更新されます
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-indigo-50 rounded-lg">
                <div className="text-indigo-600 text-lg">🔗</div>
                <div>
                  <h3 className="font-medium text-gray-800 text-sm">
                    動的読み込み
                  </h3>
                  <p className="text-gray-600 text-sm">
                    管理画面で生成されたスクリプトが自動的にウィジェットを作成
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="text-center py-4 text-gray-500">
          <p>© 2024 Okamai - ChatPlus Demo</p>
        </footer>
      </div>
    </>
  );
}
