import { useState } from 'react';
import { AuthPage } from './features/auth/components/AuthPage';
import { HomePage } from './components/HomePage';
import { QuizPage } from './components/QuizPage';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { User } from 'firebase/auth';
import { Header } from './components/Header';
import { auth } from './lib/firebase';
import { useAuth } from './features/auth/hooks/useAuth';
import { WordBooksPage } from './components/BookshelfPage';
import { WordsPage } from './components/WordsPage';
import { QuizSettingPage } from './components/QuizSettingPage';

function App() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const {signup, login, logout} = useAuth(user, setUser);

  return(
    <BrowserRouter>
      <Header user={user} onLogout={logout}/>
      <Routes>
        <Route path="/" element={ user ? <Navigate to="/home" replace /> : <Navigate to="/auth" replace />} />
        <Route path="/auth" element={ <AuthPage user={user} signup={signup} login={login} /> } />
        <Route path="/home" element={ <HomePage user={user}/>} />
        <Route path="/quizSetting" element={ <QuizSettingPage user={user} /> } />
        <Route path="/quiz" element={ <QuizPage user={user}/> } />
        <Route path="/wordBooks" element={ <WordBooksPage user={user} />} />
        <Route  path="/wordBooks/words" element={ <WordsPage user={user}/> } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
