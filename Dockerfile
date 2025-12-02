# Demo Site - 埋め込まれるサイト
# ビルドステージ
FROM node:24-alpine AS builder

WORKDIR /var/www/demo-site

# システムパッケージの更新とタイムゾーン設定
RUN apk --no-cache update && \
    apk --no-cache upgrade && \
    apk --no-cache add tzdata curl bash && \
    cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && \
    apk del tzdata

# bunのインストール
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

# 依存関係のコピーとインストール
COPY package*.json ./
RUN bun install --frozen-lockfile

# ソースコードのコピー
COPY . .

# ビルド
RUN bun run build

# 実行ステージ
FROM node:24-alpine

WORKDIR /var/www/demo-site

# システムパッケージの更新とタイムゾーン設定
RUN apk --no-cache update && \
    apk --no-cache upgrade && \
    apk --no-cache add tzdata curl bash && \
    cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && \
    apk del tzdata

# bunのインストール
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 本番用の依存関係のみをインストール
RUN bun install --frozen-lockfile --production

# ビルドしたアプリケーションをコピー
COPY --from=builder /var/www/demo-site/.next ./.next
COPY --from=builder /var/www/demo-site/public ./public

# ポート3000を公開
EXPOSE 3000

# 起動コマンド
CMD ["bun", "start"] 