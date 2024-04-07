# ベースイメージをNode.jsのものに指定
FROM node:14

# コンテナ内での作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコンテナ内にコピー
COPY package.json package-lock.json ./

# 依存関係をインストール
RUN npm install

# アプリケーションのソースコードをコンテナ内にコピー
COPY . .

# アプリケーションをビルド
RUN npm run build

# アプリケーションがリッスンするポートを指定
EXPOSE 3000

# アプリケーションの起動コマンドを指定
CMD ["npm", "start"]
