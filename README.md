# pomo-dashboard

ポモドーロ + TODO + 活動時間の可視化を行うダッシュボード（Next.js + Supabase）。

## 技術スタック

- Next.js (App Router)
- TypeScript
- Supabase（Auth）

## セットアップ

依存関係をインストールします。

```bash
npm install
```

`.env.local` を作成して、Supabaseの `Project URL` と `anon public key` を設定します。

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

開発サーバーを起動します。

```bash
npm run dev
```

ブラウザでアクセス：

- http://localhost:3000/signin （ゲストモードあり）
- http://localhost:3000/main （未ログインは /signin にリダイレクト）

## 動作

- `/signin` の「ゲストモード」ボタンで匿名ログイン
- `/main` でログイン状態をチェックし、未ログイン時は `/signin` へリダイレクト
