# CLAUDE.md

## プロジェクト概要

React Router v7 (SSR) + Prisma + PostgreSQL
Docker Compose (OrbStack) でローカル開発環境を構築する。

## 技術スタック

- **Runtime**: Node.js 22 (Alpine, Docker コンテナ内)
- **Framework**: React Router v7 (SSR mode)
- **ORM**: Prisma 7 (PostgreSQL adapter: `@prisma/adapter-pg`)
- **DB**: PostgreSQL 16
- **CSS**: Tailwind CSS v4
- **Package Manager**: pnpm (コンテナ内), npm scripts で実行
- **Validation**: Zod v4

## コマンド

### 最優先: Makefile コマンド

| コマンド                  | 用途                                                                                   |
| ------------------------- | -------------------------------------------------------------------------------------- |
| `make middleware.up`      | Docker Compose で DB + App 起動                                                        |
| `make middleware.down`    | Docker Compose 停止                                                                    |
| `make middleware.restart` | **停止 → 起動（.env 反映、schema.sql 適用、prisma:pull、prisma generate すべて実行）** |
| `make middleware.psql`    | PostgreSQL に直接接続                                                                  |

### package.json scripts

| コマンド              | 用途                                       |
| --------------------- | ------------------------------------------ |
| `npm run typecheck`   | 型チェック (`react-router typegen && tsc`) |
| `npm run prisma:pull` | DB スキーマ → Prisma クライアント再生成    |
| `npm run build`       | 本番ビルド                                 |
| `npm run dev`         | 開発サーバー起動（コンテナ内で自動実行）   |

## 開発フロー

### スキーマ変更時

1. `schema.sql` を編集
2. `make middleware.restart` を実行（DB 再作成 + prisma:pull + generate が一括で走る）
3. 生成された `app/.server/infra/db/gen/` のコードが自動更新される

### .env 変更時

`make middleware.restart` で反映される。

### 動作確認

- `make middleware.up` で起動後、`http://app.rrs.local` でアクセス（OrbStack のローカルドメイン）
- App コンテナ (`rrs-app`) 内で `npm run dev` が実行される（port 5173 → OrbStack 経由でアクセス）
- ヘルスチェック: `http://localhost:3000/api/v1/health/ready`（コンテナ内部）
- コンテナログ確認: `docker logs -f rrs-app`

## プロジェクト構造

```
app/
├── .server/infra/
│   ├── config.ts          # 環境変数バリデーション (Zod)
│   └── db/
│       ├── index.ts        # Prisma クライアント初期化 + エラーヘルパー
│       └── gen/            # Prisma 自動生成（編集不可）
├── routes.ts               # ルート定義
├── routes/                 # 各ルートファイル
├── root.tsx                # ルートレイアウト（initConfig/initDatabase 呼び出し）
└── app.css                 # グローバル CSS
docker/
├── docker-compose.yaml     # メインの compose 設定
├── middleware/postgres.yaml # PostgreSQL 設定
└── server/app.yaml         # App コンテナ設定
schema.sql                  # DB スキーマ定義（PostgreSQL DDL）
.env                        # 環境変数
```

## コーディング規約

- サーバー専用コードは `app/.server/` 配下に配置
- Prisma クライアントは `~/.server/infra/db` からインポート（`prisma`, `isNotFoundError`, `isAlreadyExistError` 等）
- `app/.server/infra/db/gen/` は自動生成のため手動編集禁止
- ルートファイルでは React Router の `Form`, `useLoaderData`, `useActionData` を使用
- スタイリングは Tailwind CSS を使用
- DB 初期化は `root.tsx` でモジュールロード時に `initConfig()` → `initDatabase()` の順で実行
