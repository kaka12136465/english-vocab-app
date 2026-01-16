import { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { HomePage } from './components/HomePage';
import { QuizPage } from './components/QuizPage';
import { WordsPage } from './components/WordsPage';
import { useAuth } from './features/auth/hooks/useAuth';
import { QuizMode} from './types';
import { LoginFormData } from './features/auth/types/auth.types';
import { WordBooksPage } from './components/BookshelfPage';
import { Header } from './components/Header';

type AppPage = 'auth' | 'home' | 'quiz' | 'wordBooks' | 'words';

function App() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<AppPage>('auth');
  const [quizMode, setQuizMode] = useState<QuizMode>('english-to-japanese');
  const [wordCount, setWordCount] = useState<number>(10);
  const [isLoadingWords, setIsLoadingWords] = useState(false);
  const [selectedWordBookIdForWords, setSelectedWordBookIdForWords] = useState<string>('');
  const [selectedWordBookIdForQuiz, setSelectedWordBookIdForQuiz] = useState<string>('');

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
  const handleStartQuiz = async (mode: QuizMode, wordCount: number, wordBookId: string) => {
    setIsLoadingWords(true);
    try {
      setQuizMode(mode);
      setWordCount(wordCount);
      setCurrentPage('quiz');
      setSelectedWordBookIdForQuiz(wordBookId);
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('クイズの開始に失敗しました');
    } finally {
      setIsLoadingWords(false);
    }
  };

  // マイ単語帳一覧を開く
  const handleOpenWordBooks = () => {
    setCurrentPage('wordBooks');
  };

  // 単語帳を開く
  const handleOpenWords = (wordBookId: string) => {
    setSelectedWordBookIdForWords(wordBookId);
    setCurrentPage('words');
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
      return (
        <div>
          <AuthPage onLogin={handleLogin} onSignup={handleSignup} />
        </div>
      );
    
    case 'home':
      return (
        <div>
          <Header 
            userName={user?.email || ''}
            onLogout={handleLogout}
            onOpenWordBooks={handleOpenWordBooks}
            setCurrentPage={setCurrentPage}
          />
          <HomePage onStartQuiz={handleStartQuiz}/>
        </div>
      );
    
    case 'quiz':
      return (
        <div>
          <Header 
              userName={user?.email || ''}
              onLogout={handleLogout}
              onOpenWordBooks={handleOpenWordBooks}
              setCurrentPage={setCurrentPage}
            />
          <QuizPage userId={user?.uid || null} onBackToHome={handleBackToHome} mode={quizMode} wordCount={wordCount} wordBookId={selectedWordBookIdForQuiz}/>;
        </div>
      );
    case 'wordBooks':
      return user ? (
        <div>
          <Header 
            userName={user?.email || ''}
            onLogout={handleLogout}
            onOpenWordBooks={handleOpenWordBooks}
            setCurrentPage={setCurrentPage}
          />
          <WordBooksPage userId={user.uid} onBack={handleBackToHome} onOpenWords={handleOpenWords} />
        </div>
      ) : null;

    case 'words':
      return user ? (
        <div>
          <Header 
            userName={user?.email || ''}
            onLogout={handleLogout}
            onOpenWordBooks={handleOpenWordBooks}
            setCurrentPage={setCurrentPage}
          />
          <WordsPage wordBookId={selectedWordBookIdForWords} onBack={handleOpenWordBooks} />
        </div>
      ) : null;
    
    default:
      return null;
  }
}

export default App;
