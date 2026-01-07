# データベーススキーマ設計書

## 概要

このアプリケーションでは、Cloud Firestore を NoSQL データベースとして使用します。

### Firestore を選択した理由

1. **リアルタイム同期**: ユーザーの学習進捗をリアルタイムで同期できる
2. **柔軟なスキーマ**: NoSQL の利点を活かし、配列フィールド（類義語、対義語など）を自然に扱える
3. **セキュリティルール**: きめ細かいアクセス制御が可能
4. **スケーラビリティ**: 自動スケーリングによる高可用性
5. **オフライン対応**: ローカルキャッシュによるオフライン学習が可能
6. **Firebase エコシステム**: Authentication、Hosting など他の Firebase サービスとの統合が容易

### RDB（PostgreSQL、MySQL）と比較した利点

| 項目 | Firestore | RDB |
|-----|-----------|-----|
| スキーマの柔軟性 | 高い（配列、ネストが容易） | 低い（正規化が必要） |
| スケーラビリティ | 自動（水平スケーリング） | 手動（垂直スケーリング） |
| リアルタイム更新 | ネイティブサポート | 追加実装が必要 |
| クエリの複雑さ | シンプルなクエリに最適 | 複雑な JOIN に対応 |
| トランザクション | 制限あり | 完全なACID対応 |

## コレクション構造

Firestore には3つの主要コレクションがあります:

```
english-vocab-app (root)
├── words (コレクション)
│   └── {wordId} (ドキュメント)
├── userWords (コレクション)
│   └── {wordId} (ドキュメント)
└── userProgress (コレクション)
    └── {userId}_{wordId} (ドキュメント)
```

---

## 1. words コレクション（共通単語データ）

### 概要
- **アクセス**: 全ユーザー読み取り専用
- **用途**: 共通の英単語データベース
- **更新**: 管理者のみ（Firebase Console から）

### スキーマ

| フィールド名 | 型 | 必須 | 説明 | 例 |
|------------|---|-----|-----|---|
| english | string | ✓ | 英単語 | "apple" |
| japanese | array of string | ✓ | 日本語訳（複数可） | ["りんご", "リンゴ"] |
| synonyms | array of string |  | 類義語 | ["fruit"] |
| antonyms | array of string |  | 対義語 | [] |
| exampleSentence | string |  | 例文 | "I eat an apple every day." |
| pronunciation | string |  | 発音記号 | "ˈæp.əl" |
| audioUrl | string |  | 音声データURL | "" |
| createdAt | timestamp |  | 作成日時 | 2025-01-06T00:00:00Z |

### インデックス

基本的なクエリのみなので、デフォルトのインデックスで十分です。

### サンプルドキュメント

```json
{
  "english": "apple",
  "japanese": ["りんご", "リンゴ"],
  "synonyms": [],
  "antonyms": [],
  "exampleSentence": "I eat an apple every day.",
  "pronunciation": "ˈæp.əl",
  "audioUrl": "",
  "createdAt": "2025-01-06T00:00:00Z"
}
```

---

## 2. userWords コレクション（ユーザー個別単語データ）

### 概要
- **アクセス**: 各ユーザーは自分のデータを読み書き可能、公開設定された単語は全ユーザーが閲覧可能
- **用途**: ユーザーが独自に追加した単語データ（マイ単語帳）
- **更新**: ユーザー自身が追加・編集・削除可能

### スキーマ

| フィールド名 | 型 | 必須 | 説明 | 例 |
|------------|---|-----|-----|---|
| userId | string | ✓ | 作成したユーザーのID | "abc123xyz" |
| english | string | ✓ | 英単語 | "study" |
| japanese | array of string | ✓ | 日本語訳（複数可） | ["勉強する", "学習する"] |
| synonyms | array of string |  | 類義語 | ["learn"] |
| antonyms | array of string |  | 対義語 | [] |
| exampleSentence | string |  | 例文 | "I study English every day." |
| pronunciation | string |  | 発音記号 | "ˈstʌd.i" |
| audioUrl | string |  | 音声データURL | "" |
| isPublic | boolean | ✓ | 他のユーザーと共有するか | false |
| createdAt | timestamp | ✓ | 作成日時 | 2025-01-06T10:00:00Z |

### インデックス

以下の複合インデックスを作成することを推奨します:

1. `userId` (昇順) + `createdAt` (降順)
   - 用途: ユーザーの単語リストを新しい順に取得

2. `isPublic` (昇順) + `createdAt` (降順)
   - 用途: 公開単語の一覧取得（将来の共有機能用）

### サンプルドキュメント

```json
{
  "userId": "abc123xyz",
  "english": "study",
  "japanese": ["勉強する", "学習する"],
  "synonyms": ["learn"],
  "antonyms": [],
  "exampleSentence": "I study English every day.",
  "pronunciation": "ˈstʌd.i",
  "audioUrl": "",
  "isPublic": false,
  "createdAt": "2025-01-06T10:00:00Z"
}
```

---

## 3. userProgress コレクション（ユーザー進捗データ）

### 概要
- **アクセス**: 各ユーザーは自分のデータのみ読み書き可能
- **用途**: ユーザー個別の学習進捗を記録
- **更新**: クイズ回答時に自動更新

### スキーマ

| フィールド名 | 型 | 必須 | 説明 | 例 |
|------------|---|-----|-----|---|
| userId | string | ✓ | ユーザーID | "abc123xyz" |
| wordId | string | ✓ | 単語ID（words コレクションの ID） | "word_001" |
| status | string | ✓ | 習熟度: "weak", "normal", "strong" | "normal" |
| correctCount | number | ✓ | 正解数 | 8 |
| totalAttempts | number | ✓ | 総出題数 | 10 |
| lastAttempted | timestamp | ✓ | 最終学習日時 | 2025-01-06T10:30:00Z |

### ドキュメントID

ドキュメントIDは `{userId}_{wordId}` の形式で生成します。

例: `abc123xyz_word_001`

これにより、ユーザーと単語の組み合わせで一意なデータが保証されます。

### 習熟度の判定ロジック

```typescript
const accuracy = correctCount / totalAttempts;

if (accuracy >= 0.8) {
  status = "strong";  // 得意
} else if (accuracy >= 0.5) {
  status = "normal";  // 普通
} else {
  status = "weak";    // 苦手
}
```

### インデックス

以下の複合インデックスを作成することを推奨します:

1. `userId` (昇順) + `status` (昇順)
   - 用途: ユーザーの習熟度別単語リスト取得

2. `userId` (昇順) + `lastAttempted` (降順)
   - 用途: 最近学習した単語の取得

### サンプルドキュメント

```json
{
  "userId": "abc123xyz",
  "wordId": "word_001",
  "status": "normal",
  "correctCount": 8,
  "totalAttempts": 10,
  "lastAttempted": "2025-01-06T10:30:00Z"
}
```

---

## クエリ例

### 1. 全単語を取得

```typescript
const wordsRef = collection(db, 'words');
const querySnapshot = await getDocs(wordsRef);
```

### 2. ユーザーの単語を取得

```typescript
const userWordsRef = collection(db, 'userWords');
const q = query(
  userWordsRef,
  where('userId', '==', userId),
  orderBy('createdAt', 'desc')
);
const querySnapshot = await getDocs(q);
```

### 3. ユーザーの単語と共通単語を統合

```typescript
const [commonWords, userWords] = await Promise.all([
  getAllWords(),
  getUserWords(userId)
]);
const allWords = [...commonWords, ...userWords];
```

### 4. 単語を追加

```typescript
await addDoc(collection(db, 'userWords'), {
  userId: userId,
  english: 'study',
  japanese: ['勉強する'],
  synonyms: [],
  antonyms: [],
  exampleSentence: 'I study English.',
  pronunciation: 'ˈstʌd.i',
  audioUrl: '',
  isPublic: false,
  createdAt: serverTimestamp()
});
```

### 5. ランダムに10単語を取得

```typescript
const allWords = await getAllWords();
const shuffled = allWords.sort(() => 0.5 - Math.random());
const randomWords = shuffled.slice(0, 10);
```

### 6. ユーザーの苦手な単語を取得

```typescript
const progressRef = collection(db, 'userProgress');
const q = query(
  progressRef,
  where('userId', '==', userId),
  where('status', '==', 'weak')
);
const querySnapshot = await getDocs(q);
```

### 4. 特定単語の進捗を更新

```typescript
const progressId = `${userId}_${wordId}`;
const docRef = doc(db, 'userProgress', progressId);
await updateDoc(docRef, {
  correctCount: increment(1),
  totalAttempts: increment(1),
  status: 'normal',
  lastAttempted: serverTimestamp()
});
```

---

## セキュリティルール

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 単語データ: 認証済みユーザーのみ読み取り可能
    match /words/{wordId} {
      allow read: if request.auth != null;
      allow write: if false; // 管理者のみ
    }
    
    // ユーザー個別の単語: 自分のデータまたは公開データを読み取り可能
    match /userWords/{wordId} {
      allow read: if request.auth != null && 
                     (resource.data.userId == request.auth.uid || 
                      resource.data.isPublic == true);
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                              resource.data.userId == request.auth.uid;
    }
    
    // ユーザー進捗: 自分のデータのみ読み書き可能
    match /userProgress/{progressId} {
      allow read, write: if request.auth != null && 
                            request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## データ移行・バックアップ

### エクスポート

```bash
gcloud firestore export gs://[BUCKET_NAME]
```

### インポート

```bash
gcloud firestore import gs://[BUCKET_NAME]/[EXPORT_PREFIX]
```

---

## パフォーマンス最適化

### 1. キャッシュ戦略

- Firestore のオフライン永続化を有効化
- 頻繁にアクセスするデータをローカルストレージに保存

### 2. バッチ処理

- 複数の進捗更新を batch で実行

```typescript
const batch = writeBatch(db);
results.forEach(result => {
  const docRef = doc(db, 'userProgress', `${userId}_${result.wordId}`);
  batch.update(docRef, { /* ... */ });
});
await batch.commit();
```

### 3. ページネーション

- 単語リストが増えた場合、ページネーション実装を検討

```typescript
const first = query(collection(db, 'words'), limit(25));
const documentSnapshots = await getDocs(first);

// 次のページ
const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length-1];
const next = query(
  collection(db, 'words'),
  startAfter(lastVisible),
  limit(25)
);
```

---

## 将来的な拡張

### 1. ユーザー設定コレクション

```typescript
users/
  {userId}/
    settings: {
      dailyGoal: number,
      notificationsEnabled: boolean,
      preferredQuizMode: string
    }
```

### 2. 学習履歴コレクション

```typescript
quizSessions/
  {sessionId}/
    userId: string,
    startedAt: timestamp,
    completedAt: timestamp,
    mode: string,
    results: array
```

### 3. カテゴリー分類

```typescript
words/
  {wordId}/
    category: string  // "食べ物", "動物", "動詞" など
    level: string     // "初級", "中級", "上級"
```

---

## まとめ

このスキーマ設計により、以下の要件を満たします:

- ✅ ユーザー個別の学習進捗管理
- ✅ リアルタイム同期
- ✅ 柔軟なデータ構造（配列フィールド）
- ✅ セキュアなアクセス制御
- ✅ スケーラビリティ
- ✅ オフライン対応
