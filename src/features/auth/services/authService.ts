import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { UserData } from '@/types';
import { doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * メールアドレスとパスワードでユーザーを登録
 */
export const signUp = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * メールアドレスとパスワードでログイン
 */
export const signIn = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * ログアウト
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw new Error('ログアウトに失敗しました');
  }
};

/**
 * 認証状態の変更を監視
 */
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * ユーザーデータを新規追加
 */
export const resisterNewUserData = async (userId: string): Promise<UserData> => {
  const newUserData: UserData ={
    userId: userId,
    lastPlayQuizSetting: {
      quizMode: 'english-to-japanese',
      wordBookId: '',
      quizRange: [1,100],
      numberOfQuiz: 10,
    },
    weakWordIds: [],
    notWeakWordIds: []
  }
  await setDoc(doc(db, 'userDatas', userId), 
    newUserData
  );
  return newUserData;
}

/**
 * ユーザーデータを取得
 */
export const fetchUserData = async (userId: string): Promise<UserData | null> => {
  const docRef = doc(db, "userDatas", userId);
  const docSnap = await getDoc(docRef);
  if(docSnap.exists()){
    const userData = docSnap.data();
    return userData as UserData;
  }else{
    return null
  }
}

/**
 * Firebase Auth のエラーコードを日本語メッセージに変換
 */
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'このメールアドレスは既に使用されています';
    case 'auth/invalid-email':
      return 'メールアドレスの形式が正しくありません';
    case 'auth/operation-not-allowed':
      return 'この操作は許可されていません';
    case 'auth/weak-password':
      return 'パスワードは6文字以上で設定してください';
    case 'auth/user-disabled':
      return 'このアカウントは無効化されています';
    case 'auth/user-not-found':
      return 'ユーザーが見つかりません';
    case 'auth/wrong-password':
      return 'パスワードが正しくありません';
    case 'auth/too-many-requests':
      return '試行回数が多すぎます。しばらく待ってから再度お試しください';
    default:
      return '認証エラーが発生しました';
  }
};



