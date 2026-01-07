# プロジェクトアーキテクチャ

## 📋 目次

1. [概要](#概要)
2. [技術スタック](#技術スタック)
3. [アーキテクチャ設計](#アーキテクチャ設計)
4. [ディレクトリ構造](#ディレクトリ構造)
5. [主要機能の実装](#主要機能の実装)
6. [状態管理](#状態管理)
7. [セキュリティ](#セキュリティ)
8. [パフォーマンス最適化](#パフォーマンス最適化)

---

## 概要

本プロジェクトは、TypeScript、React、Firebase を使用した英単語学習アプリケーションです。ユーザーは3種類のクイズモード（英→和、和→英、音声→和）で学習し、個別の習熟度データが自動的に記録されます。

### 主な特徴

- **完全型安全**: TypeScript を全面採用し、型安全性を確保
- **モダンなアーキテクチャ**: Feature-based フォルダ構造による保守性の高い設計
- **リアルタイムデータ同期**: Firestore によるリアルタイム学習進捗管理
- **レスポンシブデザイン**: Tailwind CSS によるモバイルフレンドリーな UI
- **音声機能**: Web Speech API による英単語の発音再生

---

## 技術スタック

### フロントエンド

| 技術 | バージョン | 用途 |
|-----|-----------|-----|
| React | 18.x | UI ライブラリ |
| TypeScript | 5.x | 型安全性の確保 |
| Vite | 5.x | ビルドツール |
| Tailwind CSS | 3.x | スタイリング |
| React Hooks | - | 状態管理 |

### バックエンド（Firebase）

| サービス | 用途 |
|---------|-----|
| Firebase Authentication | ユーザー認証（メール/パスワード） |
| Cloud Firestore | NoSQL データベース |
| Firebase Hosting | 静的サイトホスティング |
| Firebase Storage | 音声ファイル保存（将来拡張） |

### 開発ツール

| ツール | 用途 |
|-------|-----|
| ESLint | コード品質チェック |
| PostCSS | CSS 処理 |
| Autoprefixer | CSS ベンダープレフィックス自動追加 |

---

## アーキテクチャ設計

### レイヤー構造

```
┌─────────────────────────────────────┐
│      Presentation Layer             │
│  (Components / Pages)               │
├─────────────────────────────────────┤
│      Business Logic Layer           │
│  (Hooks / Services)                 │
├─────────────────────────────────────┤
│      Data Access Layer              │
│  (Firebase SDK / API Clients)       │
├─────────────────────────────────────┤
│      External Services              │
│  (Firebase / Web Speech API)        │
└─────────────────────────────────────┘
```

### Feature-based フォルダ構造

各機能（Feature）ごとにフォルダを分割し、関連するファイルを集約しています。

```
features/
  ├── auth/             # 認証機能
  │   ├── components/   # UI コンポーネント
  │   ├── hooks/        # カスタムフック
  │   ├── services/     # ビジネスロジック
  │   └── types/        # 型定義
  ├── quiz/             # クイズ機能
  ├── vocabulary/       # 単語管理
  └── userProgress/     # 進捗管理
```

### 責務分離の原則

| レイヤー | 責務 | 例 |
|---------|-----|---|
| **Components** | UI の描画とユーザー操作 | `LoginForm.tsx` |
| **Hooks** | 状態管理とコンポーネントロジック | `useAuth.ts` |
| **Services** | ビジネスロジックとデータアクセス | `authService.ts` |
| **Types** | 型定義 | `auth.types.ts` |

---

## ディレクトリ構造

```
english-vocab-app/
├── public/                   # 静的アセット
├── src/
│   ├── assets/               # 画像、フォントなど
│   ├── components/           # 共通コンポーネント
│   │   ├── AuthPage.tsx
│   │   ├── HomePage.tsx
│   │   └── QuizPage.tsx
│   ├── config/               # 設定ファイル
│   │   └── env.ts            # 環境変数管理
│   ├── data/                 # サンプルデータ
│   │   └── sampleData.ts
│   ├── features/             # 機能別モジュール
│   │   ├── auth/             # 認証機能
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── SignupForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── services/
│   │   │   │   └── authService.ts
│   │   │   └── types/
│   │   │       └── auth.types.ts
│   │   ├── quiz/             # クイズ機能
│   │   │   ├── components/
│   │   │   │   ├── QuizCard.tsx
│   │   │   │   └── QuizResult.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useQuiz.ts
│   │   │   ├── services/
│   │   │   │   └── quizService.ts
│   │   │   └── types/
│   │   │       └── quiz.types.ts
│   │   ├── vocabulary/       # 単語管理
│   │   │   └── services/
│   │   │       └── vocabularyService.ts
│   │   └── userProgress/     # 進捗管理
│   │       └── services/
│   │           └── progressService.ts
│   ├── lib/                  # 外部ライブラリ初期化
│   │   └── firebase.ts
│   ├── types/                # グローバル型定義
│   │   └── index.ts
│   ├── utils/                # ユーティリティ関数
│   ├── App.tsx               # ルートコンポーネント
│   ├── main.tsx              # エントリーポイント
│   └── index.css             # グローバルCSS
├── .env.example              # 環境変数テンプレート
├── .gitignore
├── DATABASE_SCHEMA.md        # データベース設計書
├── DEPLOYMENT.md             # デプロイ手順書
├── README.md
├── firebase.json             # Firebase 設定
├── firestore.rules           # Firestore セキュリティルール
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 主要機能の実装

### 1. 認証機能（auth）

**使用技術**: Firebase Authentication

**実装パターン**:
```typescript
// カスタムフック (useAuth.ts)
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({...});
  
  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState({ user, loading: false });
    });
    return () => unsubscribe();
  }, []);
  
  return { user, signIn, signUp, signOut };
};
```

**特徴**:
- リアルタイム認証状態管理
- エラーハンドリングの日本語化
- 型安全な状態管理

### 2. クイズ機能（quiz）

**実装パターン**:
```typescript
// クイズステート管理 (useQuiz.ts)
export const useQuiz = (userId: string | null) => {
  const [quizState, setQuizState] = useState<QuizState>({...});
  
  const submitAnswer = async (userAnswer: string) => {
    const isCorrect = checkAnswer(userAnswer, correctAnswers);
    
    // 進捗を Firestore に保存
    if (userId) {
      await updateUserProgress(userId, wordId, isCorrect);
    }
    
    return isCorrect;
  };
  
  return { currentQuestion, submitAnswer, ... };
};
```

**特徴**:
- 3種類のクイズモード対応
- Web Speech API による音声再生
- 進捗の自動保存

### 3. 進捗管理（userProgress）

**データフロー**:
```
クイズ回答 → useQuiz → progressService → Firestore
                ↓
            習熟度計算
            (weak/normal/strong)
```

**習熟度計算ロジック**:
```typescript
const calculateStatus = (correctCount: number, totalAttempts: number) => {
  const accuracy = correctCount / totalAttempts;
  
  if (accuracy >= 0.8) return 'strong';
  if (accuracy >= 0.5) return 'normal';
  return 'weak';
};
```

---

## 状態管理

### React Hooks ベースの状態管理

本プロジェクトでは、外部の状態管理ライブラリ（Redux、Zustand など）を使用せず、React Hooks による状態管理を採用しています。

**理由**:
- アプリケーションの規模が小〜中規模
- グローバルな状態が少ない（主にユーザー認証のみ）
- 学習コストの削減
- バンドルサイズの最小化

### 状態管理パターン

```typescript
// 1. ローカル状態（useState）
const [formData, setFormData] = useState<FormData>({...});

// 2. グローバル状態（Context + useAuth）
const { user, loading } = useAuth();

// 3. サーバー状態（Firestore）
const words = await getRandomWords(10);
```

---

## セキュリティ

### 1. Firestore セキュリティルール

```javascript
// 単語データ: 認証済みユーザーのみ読み取り可能
match /words/{wordId} {
  allow read: if request.auth != null;
  allow write: if false; // 管理者のみ
}

// 進捗データ: 自分のデータのみアクセス可能
match /userProgress/{progressId} {
  allow read, write: if request.auth != null && 
                        request.auth.uid == resource.data.userId;
}
```

### 2. 環境変数の管理

- `.env` ファイルを `.gitignore` に追加
- API キーなどの機密情報を環境変数として管理
- `VITE_` プレフィックスによる公開変数の明示

### 3. XSS 対策

- React の自動エスケープ機能を活用
- `dangerouslySetInnerHTML` の使用を避ける
- ユーザー入力のサニタイズ

---

## パフォーマンス最適化

### 1. バンドルサイズの最適化

- Vite による Tree Shaking
- 動的インポートの活用（将来拡張）
- 不要な依存関係の削減

### 2. レンダリング最適化

- `React.memo` による不要な再レンダリング防止（必要に応じて）
- `useCallback` / `useMemo` の適切な使用
- コンポーネントの適切な分割

### 3. Firestore 最適化

- オフライン永続化の有効化
- バッチ処理による書き込み回数の削減
- インデックスの適切な設定

### 4. 画像最適化

- 適切な画像フォーマットの選択（WebP）
- 遅延読み込み（Lazy Loading）
- CDN の活用

---

## 今後の拡張予定

### Phase 2（中期）

- [ ] ダッシュボード機能（学習統計の可視化）
- [ ] 単語帳機能（お気に入り単語の管理）
- [ ] フラッシュカード機能
- [ ] PWA 対応（オフライン学習）

### Phase 3（長期）

- [ ] SNS ログイン（Google、Twitter）
- [ ] 学習リマインダー通知
- [ ] 単語のカテゴリー分類
- [ ] ランキング機能
- [ ] 管理画面の実装

---

## まとめ

本プロジェクトは、以下の設計原則に基づいて構築されています:

1. **型安全性**: TypeScript による厳密な型チェック
2. **保守性**: Feature-based 構造による関心の分離
3. **スケーラビリティ**: Firebase による自動スケーリング
4. **ユーザビリティ**: レスポンシブでモダンな UI/UX
5. **セキュリティ**: Firebase セキュリティルールによる堅牢なアクセス制御

これらの設計により、拡張性と保守性の高いアプリケーションを実現しています。
