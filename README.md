# English Vocabulary Learning App

TypeScript、React、Firebase を使用した英単語学習アプリケーション

## 🎯 機能

- **ユーザー認証**: Firebase Authentication による登録・ログイン
- **クイズ機能**: 
  - 英単語 → 和訳
  - 和訳 → 英単語
  - 音声 → 和訳（音声再生機能付き）
- **音声再生**: Web Speech API による英単語の発音再生
- **学習進捗管理**: 個別の習熟度データ保存
- **マイ単語帳**: ユーザーが独自の単語を追加・管理できる機能

## 🏗 技術スタック

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Firebase
  - Authentication: ユーザー認証
  - Firestore: データベース
  - Storage: 音声ファイル保存
  - Hosting: デプロイ先
- **UI**: TailwindCSS
- **State Management**: React Hooks

## 🗄 データベース選定理由

### Firestore を選択した理由:

1. **リアルタイム同期**: ユーザーの学習進捗をリアルタイムで同期
2. **柔軟なスキーマ**: NoSQLの利点を活かし、単語データの配列フィールド（類義語、対義語など）を自然に扱える
3. **セキュリティルール**: きめ細かいアクセス制御が可能
4. **スケーラビリティ**: 自動スケーリングによる高可用性
5. **オフライン対応**: ローカルキャッシュによるオフライン学習が可能

### コレクション設計:

```
words (共通・読み取り専用)
  ├─ wordId
      ├─ english: string
      ├─ japanese: string[]
      ├─ synonyms: string[]
      ├─ antonyms: string[]
      ├─ exampleSentence: string
      ├─ pronunciation: string
      └─ audioUrl: string

userWords (ユーザー個別・読み書き可能)
  ├─ wordId
      ├─ userId: string
      ├─ english: string
      ├─ japanese: string[]
      ├─ synonyms: string[]
      ├─ antonyms: string[]
      ├─ exampleSentence: string
      ├─ pronunciation: string
      ├─ audioUrl: string
      ├─ isPublic: boolean
      └─ createdAt: timestamp

userProgress (ユーザー個別)
  ├─ userId_wordId (複合キー)
      ├─ userId: string
      ├─ wordId: string
      ├─ status: 'weak' | 'normal' | 'strong'
      ├─ correctCount: number
      ├─ totalAttempts: number
      └─ lastAttempted: timestamp
```

## 📦 プロジェクト構造

```
src/
├── assets/           # 静的リソース
├── lib/
│   └── firebase.ts   # Firebase初期化
├── config/
│   └── env.ts        # 環境変数
├── features/
│   ├── auth/         # 認証機能
│   ├── quiz/         # クイズ機能
│   ├── vocabulary/   # 単語管理
│   └── userProgress/ # 進捗管理
├── types/            # 共通型定義
└── utils/            # ユーティリティ
```

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Firebase プロジェクトの設定

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成
2. Firestore Database を有効化
3. Firebase Authentication で Email/Password を有効化
4. `.env` ファイルを作成:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Firestore セキュリティルール

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 単語データ: 全ユーザー読み取り専用
    match /words/{wordId} {
      allow read: if request.auth != null;
      allow write: if false; // 管理者のみ（コンソールから）
    }
    
    // ユーザー進捗: 自分のデータのみ読み書き可能
    match /userProgress/{progressId} {
      allow read, write: if request.auth != null && 
                            request.auth.uid == resource.data.userId;
    }
  }
}
```

### 4. 開発サーバー起動

```bash
npm run dev
```

## 📱 使用方法

1. アカウント登録/ログイン
2. **マイ単語帳で単語を追加**（または既存のサンプルデータを使用）
3. クイズモードを選択（英→和、和→英、音声→和）
4. 問題に回答
5. 結果を確認し、学習進捗が自動保存される

## 🚢 デプロイ

### Firebase Hosting へのデプロイ

```bash
# ビルド
npm run build

# Firebase CLI インストール（初回のみ）
npm install -g firebase-tools

# ログイン
firebase login

# プロジェクト初期化（初回のみ）
firebase init hosting

# デプロイ
firebase deploy
```

## 📝 ライセンス

MIT
