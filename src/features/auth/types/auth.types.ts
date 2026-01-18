import { User as FirebaseUser } from 'firebase/auth';

// ユーザー型
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// 認証状態の型
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// ログインフォームの型
export interface LoginFormData {
  email: string;
  password: string;
}

// サインアップフォームの型
export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

// Firebase User を アプリ用 User に変換
export const mapFirebaseUser = (firebaseUser: FirebaseUser | null): User | null => {
  if (!firebaseUser) return null;
  
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
  };
};
