# ベースイメージの指定
FROM node:14

# アプリケーションディレクトリを作成
WORKDIR /usr/src/app

# アプリケーションの依存関係ファイルをコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm install

# アプリケーションのソースをコピー
COPY . .

# アプリをビルドするためのポートを公開
EXPOSE 3000

# アプリケーションの実行
CMD ["npm", "start"]
