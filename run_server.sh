#!/bin/bash

# FastAPIサーバーをバックグラウンドで起動
cd python/app/
uvicorn main:app --reload --host 0.0.0.0 --port 5000 &

# Reactアプリの開発サーバーを起動
cd ../../
npm start