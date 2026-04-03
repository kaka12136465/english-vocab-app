# English Vocabulary Learning App

TypeScript、React、Firebase を使用した英単語学習アプリケーション

## 機能

- **ユーザー認証**: Firebase Authentication による登録・ログイン
- **単語帳管理**: 単語帳の作成・管理、単語の追加・編集
- **クイズ機能**:
  - 英語 → 日本語
  - 日本語 → 英語
  - 音声 → 日本語（Web Speech API による発音再生）
  - **学習モード**: 暗記カード → グループクイズ → 総復習の3ステップ構成
- **クイズ設定**:
  - 単語帳・出題範囲・出題数の指定
  - 苦手単語・得意単語・未学習単語の絞り込み
  - 前回のクイズ設定を自動保存・復元
  - 単語帳ごとの統計（総単語数・苦手・得意・未学習）をリアルタイム表示
- **パフォーマンス最適化**: sessionStorage による単語データのキャッシュでFirebase クエリを節約
- **習熟度管理**: 単語ごとの苦手/得意フラグを記録し、次回以降の出題に反映

## 技術スタック

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Firebase
  - Authentication: ユーザー認証
  - Firestore: データベース
  - Hosting: デプロイ先
- **UI**: TailwindCSS
- **Routing**: React Router v6
- **State Management**: React Hooks

## データ構造

### 単語データ型 (`Word`)

```
Word
  ├─ id: string
  ├─ english: string
  ├─ japanese: string[]
  ├─ synonyms: string[]
  ├─ antonyms: string[]
  ├─ exampleEnSentence: string
  ├─ exampleJaSentence: string
  ├─ partOfSpeech: string[]
  ├─ pronunciation: string
  ├─ index: number
  ├─ description: string
  ├─ wordBookId: string
  └─ createdAt?: Timestamp
```

### Firestore コレクション設計

```
wordBooks (単語帳)
  ├─ id
      ├─ name: string
      ├─ description?: string
      ├─ ownerId: string
      ├─ wordsCnt: number
      └─ createdAt: Timestamp

words (単語)
  ├─ id
      ├─ (Word のフィールド全て)
      └─ wordBookId: string

userQuizData (ユーザーごとのクイズデータ)
  ├─ userId
      ├─ userId: string
      ├─ userName: string
      ├─ lastAccessedAt: Timestamp
      ├─ lastPlayQuizSetting: QuizSetting
      └─ wordWeaknesses: Record<wordId, boolean>  // true=苦手, false=得意, 未登録=未学習
```

## プロジェクト構造

```
src/
├── components/       # 共通コンポーネント（Header, HomePage）
├── lib/
│   └── firebase.ts   # Firebase 初期化
├── config/
│   └── env.ts        # 環境変数
├── features/
│   ├── auth/         # 認証機能
│   ├── quiz/         # クイズ・学習機能
│   └── vocabulary/   # 単語帳・単語管理
└── types/            # 共通型定義
```

## セットアップ

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
    match /wordBooks/{wordBookId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }

    match /words/{wordId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    match /userQuizData/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. 開発サーバー起動

```bash
npm run dev
```

## 使用方法

1. アカウント登録 / ログイン
2. **単語帳を作成**し、単語を追加
3. クイズ設定画面で単語帳・モード・出題範囲を選択
4. クイズを開始して回答
5. 結果確認 — 苦手フラグが自動更新され、次回以降の出題に反映される

### 学習モードの流れ

```
暗記フェーズ（10単語ずつカードで確認）
    ↓
グループクイズ（同じ10単語をクイズ形式で）
    ↓ （全グループ完了後）
総復習クイズ（全選択単語をシャッフルして出題）
    ↓
最終結果
```

- 学習する単語数はクイズ設定の「出題数」に従います

## デプロイ

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

## ライセンス

MIT
