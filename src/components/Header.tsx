import { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({user, onLogout}) => {
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 right-0 left-0 bg-white shadow-sm z-50">
      <div className="h-14 md:h-16 px-3 md:px-6 lg:px-8">
        <div className="h-full flex justify-between items-center gap-2">
          {/* タイトル */}
          <h1 
            onClick={() => navigate("/home")} 
            className="cursor-pointer text-base md:text-xl font-bold text-gray-800 whitespace-nowrap"
          >
            英単語学習アプリ
          </h1>
          {/* ユーザー名とログアウトボタン*/}
          {user && (
            <div className="flex items-center gap-1 md:gap-4 flex-shrink-0">
              <span className="hidden md:block text-sm text-gray-600">
                ようこそ、<span className="font-medium">{user.email}</span>さん
              </span>
              <button
                onClick={onLogout}
                className="px-2 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ログアウト
              </button>
            </div>
          )}
        </div>
      </div>
    </header>);
}