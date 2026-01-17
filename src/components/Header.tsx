
type AppPage = 'auth' | 'home' | 'quiz' | 'wordBooks' | 'words';

interface HeaderProps {
  userName: string | null;
  onLogout: () => void;
  onOpenWordBooks: () => void;
  setCurrentPage: (page: AppPage) => void;
}

export const Header: React.FC<HeaderProps> = ({userName, onLogout, onOpenWordBooks, setCurrentPage}) => {
    return (
      <header className="fixed top-0 right-0 left-0 bg-white shadow-sm z-50">
        <div className="h-14 md:h-16 px-3 md:px-6 lg:px-8">
          <div className="h-full flex justify-between items-center gap-2">
            {/* タイトル */}
            <h1 
              onClick={() => setCurrentPage('home')} 
              className="cursor-pointer text-base md:text-xl font-bold text-gray-800 whitespace-nowrap"
            >
              英単語学習アプリ
            </h1>
            
            {/* 右側のボタン群 */}
            <div className="flex items-center gap-1 md:gap-4 flex-shrink-0">
              {/* ユーザー名（スマホでは非表示） */}
              {userName && (
                <span className="hidden md:block text-sm text-gray-600">
                  ようこそ、<span className="font-medium">{userName}</span>さん
                </span>
              )}
              
              {/* 単語帳ボタン */}
              <button
                onClick={onOpenWordBooks}
                className="px-2 py-1.5 md:px-4 md:py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1 md:gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                <span className="text-xs md:text-sm">単語帳</span>
              </button>
              
              {/* ログアウトボタン */}
              <button
                onClick={onLogout}
                className="px-2 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>);
}