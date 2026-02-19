import React, { useEffect, useState } from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { SignupForm } from '@/features/auth/components/SignupForm';
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { DataForLogin, DataForSignup } from '../types/auth.types';

interface AuthPageProps {
  user: User | null;
  signup: (data: DataForSignup) => Promise<void>;
  login: (data: DataForLogin) => Promise<void>;
}

export const AuthPage: React.FC<AuthPageProps> = ({user, signup, login}) => {
  const [isLogin, setIsLogin] = useState(user !== null);
  
  const navigate = useNavigate();

  useEffect(() => {
    if(user){
      navigate("/home");
    }
  }, [user])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            英単語学習アプリ
          </h1>
          <p className="text-gray-600">
            効率的に英単語を学習しましょう
          </p>
        </div>

        {/* フォーム */}
        {isLogin ? (
          <LoginForm
            onSubmit={login}
            onSwitchToSignup={() => setIsLogin(false)}
          />
        ) : (
          <SignupForm
            onSubmit={signup}
            onSwitchToLogin={() => setIsLogin(true)}
          />
        )}

        {/* フッター */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>© 2025 English Vocabulary Learning App</p>
        </div>
      </div>
    </div>
  );
};
