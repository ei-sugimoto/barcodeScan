# ベースイメージを指定
FROM node:20

# 作業ディレクトリを作成
WORKDIR /workspace

COPY . .


# ポートを公開
EXPOSE 3000
