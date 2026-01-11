import { useState, useEffect } from 'react';
import { AuthState, mapFirebaseUser } from '../types/auth.types';
import * as authService from '../services/authService';

/**
 * 認証状態を管理するカスタムフック
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // 認証状態の変更を監視
    const unsubscribe = authService.onAuthStateChange((firebaseUser) => {
      const user = mapFirebaseUser(firebaseUser);
      setAuthState({
        user,
        loading: false,
        error: null,
      });
    });

    // クリーンアップ
    return () => unsubscribe();
  }, []);

  /**
   * サインアップ
   */
  const signUp = async (email: string, password: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.signUp(email, password);
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
   * サインイン
   */
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.signIn(email, password);
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
   * サインアウト
   */
  const signOut = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.signOut();
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
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signUp,
    signIn,
    signOut,
  };
};
