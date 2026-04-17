import React from 'react';
import { User } from 'firebase/auth';
import { Navigate, useNavigate } from 'react-router-dom';

interface HomePageProps {
  user: User | null;
}

export const HomePage: React.FC<HomePageProps> = ({user}) => {
  const navigate = useNavigate();

  if(!user){
    return <Navigate to="/auth" state={{from: "/home"}}/>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 pt-16">
      {/* メインコンテンツ */}
      <main className="flex gap-4 flex-col max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate("/wordBooks")}
          className="w-full py-4 px-6 bg-primary-600 text-white text-lg font-bold rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 transition-all shadow-lg hover:shadow-xl"
        >単語帳</button>
        <button
          onClick={() => navigate("/quizSetting")}
          className="w-full py-4 px-6 bg-primary-600 text-white text-lg font-bold rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 transition-all shadow-lg hover:shadow-xl"
        >クイズ</button>
        <button
          onClick={() => navigate("/translation")}
          className="w-full py-4 px-6 bg-primary-600 text-white text-lg font-bold rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 transition-all shadow-lg hover:shadow-xl"
        >英文翻訳</button>
      </main>
    </div>
  );
};
