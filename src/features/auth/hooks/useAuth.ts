import { useState, useEffect } from 'react';
import { AuthState, DataForLogin, DataForSignup } from '../types/auth.types';
import * as authService from '../services/authService';
import { User } from 'firebase/auth';

/**
 * 認証状態を管理するカスタムフック
 */
export const useAuth = (user: User | null, setUser: (user:User | null) => void) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: user,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // 認証状態の変更を監視
    const unsubscribe = authService.onAuthStateChange((user: User | null) => {
      setUser(user);
      setAuthState({
        user: user,
        loading: false,
        error: null,
      });
    });

    // クリーンアップ
    return () => unsubscribe();
  }, [setUser]);

  /**
   * サインアップ
   */
  const signup = async (data: DataForSignup): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.signup(data);
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      throw error;
    }
  };

  /**
   * ログイン
   */
  const login = async (data: DataForLogin): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.login(data);
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      throw error;
    }
  };

  /**
   * ログアウト
   */
  const logout = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      authService.logout();
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      throw error;
    }
  };



  return {
    signup,
    login,
    logout,
    authState
  };
};
