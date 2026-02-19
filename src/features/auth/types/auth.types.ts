import { User } from 'firebase/auth';

// 認証状態の型
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// ログインフォームの型
export interface DataForLogin {
  email: string;
  password: string;
}

// サインアップフォームの型
export interface DataForSignup {
  email: string;
  password: string;
  confirmPassword: string;
}