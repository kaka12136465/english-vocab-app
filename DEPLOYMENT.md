# デプロイ手順書

## 前提条件

- Node.js 18以上がインストールされている
- npm または yarn がインストールされている
- Firebase CLI がインストールされている（`npm install -g firebase-tools`）
- Firebaseプロジェクトが作成されている

## 1. Firebase プロジェクトのセットアップ

### 1.1 Firebase Console でプロジェクトを作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. "プロジェクトを追加" をクリック
3. プロジェクト名を入力（例: "english-vocab-app"）
4. Google Analytics の設定（任意）
5. プロジェクトを作成

### 1.2 Firebase Authentication の設定

1. Firebase Console でプロジェクトを選択
2. 左メニューから "Authentication" を選択
3. "始める" をクリック
4. "Sign-in method" タブを選択
5. "メール/パスワード" を有効化

### 1.3 Cloud Firestore の設定

1. Firebase Console でプロジェクトを選択
2. 左メニューから "Firestore Database" を選択
3. "データベースの作成" をクリック
4. セキュリティルールモード: "テストモードで開始" を選択
5. ロケーション: "asia-northeast1" (東京) を推奨
6. "有効にする" をクリック

### 1.4 セキュリティルールの適用

1. Firestore Database の "ルール" タブを選択
2. `firestore.rules` ファイルの内容をコピー
3. ルールエディタに貼り付け
4. "公開" をクリック

## 2. ローカル環境のセットアップ

### 2.1 依存関係のインストール

```bash
cd english-vocab-app
npm install
```

### 2.2 環境変数の設定

1. `.env.example` を `.env` にコピー

```bash
cp .env.example .env
```

2. Firebase Console から設定値を取得

- プロジェクト設定 → 全般 → マイアプリ
- "ウェブアプリに Firebase を追加" をクリック
- 表示された設定値を `.env` にコピー

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 2.3 サンプルデータの追加

1. Firebase Console → Firestore Database
2. "コレクションを開始" をクリック
3. コレクションID: `words`
4. `src/data/sampleData.ts` のデータを手動で追加

または、Firebase Admin SDK を使用してバッチ追加

## 3. ローカル開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:5173 にアクセス

## 4. ビルド

```bash
npm run build
```

ビルド成果物は `dist/` ディレクトリに生成されます。

## 5. Firebase Hosting へのデプロイ

### 5.1 Firebase CLI のインストール（初回のみ）

```bash
npm install -g firebase-tools
```

### 5.2 Firebase へのログイン

```bash
firebase login
```

### 5.3 Firebase プロジェクトの初期化

```bash
firebase init
```

以下の項目を選択:

- **Hosting: Configure files for Firebase Hosting**
- プロジェクト: 既存のプロジェクトを選択
- Public directory: `dist`
- Single-page app: `Yes`
- GitHub自動デプロイ: `No`

### 5.4 firebase.json の設定

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 5.5 デプロイ

```bash
# ビルド
npm run build

# デプロイ
firebase deploy
```

デプロイが完了すると、Hosting URL が表示されます。

例: `https://your-project.web.app`

## 6. デプロイ後の確認

1. 表示された URL にアクセス
2. ユーザー登録が正常に動作するか確認
3. ログイン後、クイズ機能が正常に動作するか確認

## 7. トラブルシューティング

### 環境変数が読み込まれない

- `.env` ファイルが正しい場所にあるか確認
- `VITE_` プレフィックスがついているか確認
- 開発サーバーを再起動

### Firestore の権限エラー

- セキュリティルールが正しく設定されているか確認
- ユーザーが認証済みか確認

### ビルドエラー

```bash
# node_modules を削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### デプロイエラー

```bash
# Firebase CLI を最新版に更新
npm install -g firebase-tools@latest

# ログイン状態を確認
firebase login --reauth
```

## 8. 継続的デプロイメント（オプション）

### GitHub Actions を使用した自動デプロイ

`.github/workflows/firebase-hosting.yml` を作成:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

GitHub Secrets に環境変数を設定してください。

## 9. 監視とメンテナンス

### Firebase Console での監視

1. Authentication → Users: 登録ユーザー数の確認
2. Firestore Database → Data: データの確認
3. Hosting → Dashboard: トラフィック統計の確認

### コスト管理

- Firebase の無料枠を確認
- 使用量が増えた場合は Blaze プラン（従量課金）へのアップグレードを検討

## まとめ

これで英単語学習アプリのデプロイが完了しました！

ユーザーは以下の URL からアプリにアクセスできます:
`https://your-project.web.app`
