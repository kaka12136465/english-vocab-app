import { useState, useEffect } from 'react';
import { AuthState, mapFirebaseUser } from '../types/auth.types';
import * as authService from '../services/authService';
import { fetchUserData, resisterNewUserData } from '../services/authService';
import { UserData } from '@/types';

/**
 * 認証状態を管理するカスタムフック
 */
export const useAuth = () => {
    const emptyUserData: UserData ={
    userId: "",
    lastPlayQuizSetting: {
      quizMode: 'english-to-japanese',
      wordBookId: '',
      quizRange: [0,0],
      numberOfQuiz: 0
    },
    weakWordIds: [],
    notWeakWordIds: []
  }

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userData: emptyUserData,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // 認証状態の変更を監視
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      const user = mapFirebaseUser(firebaseUser);
      let userData = user ? await fetchUserData(user.uid) : null;
      if(!userData && user){
        userData = await resisterNewUserData(user.uid);
      }
      setAuthState({
        user: user,
        userData: userData,
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
    userData: authState.userData ?? emptyUserData,
    loading: authState.loading,
    error: authState.error,
    signUp,
    signIn,
    signOut,
  };
};
