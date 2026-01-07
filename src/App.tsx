import React, { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { HomePage } from './components/HomePage';
import { QuizPage } from './components/QuizPage';
import { MyWordsPage } from './components/MyWordsPage';
import { useAuth } from './features/auth/hooks/useAuth';
import { QuizMode} from './types';
import { LoginFormData } from './features/auth/types/auth.types';

type AppPage = 'auth' | 'home' | 'quiz' | 'mywords';

function App() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<AppPage>('auth');
  const [quizMode, setQuizMode] = useState<QuizMode>('english-to-japanese');
  const [wordCount, setWordCount] = useState<number>(10);
  const [isLoadingWords, setIsLoadingWords] = useState(false);

  // ユーザーの認証状態に応じてページを切り替え
  useEffect(() => {
    if (!loading) {
      if (user) {
        setCurrentPage('home');
      } else {
        setCurrentPage('auth');
      }
    }
  }, [user, loading]);

  // ログイン処理
  const handleLogin = async (data: LoginFormData) => {
    await signIn(data.email, data.password);
  };

  // サインアップ処理
  const handleSignup = async (email: string, password: string) => {
    await signUp(email, password);
  };

  // ログアウト処理
  const handleLogout = async () => {
    await signOut();
    setCurrentPage('auth');
  };

  // クイズ開始処理
  const handleStartQuiz = async (mode: QuizMode, wordCount: number) => {
    setIsLoadingWords(true);
    try {
      setQuizMode(mode);
      setWordCount(wordCount);
      setCurrentPage('quiz');
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('クイズの開始に失敗しました');
    } finally {
      setIsLoadingWords(false);
    }
  };

  // マイ単語帳を開く
  const handleOpenMyWords = () => {
    setCurrentPage('mywords');
  };

  // ホームに戻る
  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  // ローディング画面
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-lg text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 単語読み込み中
  if (isLoadingWords) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-lg text-gray-600">問題を準備しています...</p>
        </div>
      </div>
    );
  }

  // ページ表示
  switch (currentPage) {
    case 'auth':
      return <AuthPage onLogin={handleLogin} onSignup={handleSignup} />;
    
    case 'home':
      return (
        <HomePage
          userName={user?.email || ''}
          onStartQuiz={handleStartQuiz}
          onLogout={handleLogout}
          onOpenMyWords={handleOpenMyWords}
        />
      );
    
    case 'quiz':
      return <QuizPage userId={user?.uid || null} onBackToHome={handleBackToHome} mode={quizMode} wordCount={wordCount} />;
    
    case 'mywords':
      return user ? (
        <MyWordsPage userId={user.uid} onBack={handleBackToHome} />
      ) : null;
    
    default:
      return null;
  }
}

export default App;
