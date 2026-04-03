import React, { useEffect, useState } from 'react';
import { Word } from '@/types';
import { QuizSetting, QuizState, UserQuizData } from '../types/quiz.types';
import { useQuiz } from '../hooks/useQuiz';
import { MemorizationCard } from './MemorizationCard';
import { QuizCard } from './QuizCard';
import { QuizResult } from './QuizResult';
import * as quizService from '../services/quizService';
import { getWordsInWordBook } from '@/features/vocabulary/services/wordBookService';
import { useNavigate } from 'react-router-dom';

type LearningPhase = 'loading' | 'memorize' | 'quiz' | 'group-complete' | 'final-review' | 'complete';

const GROUP_SIZE = 10;

const emptyQuizState: QuizState = {
  config: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  isComplete: false,
};

interface LearningPageProps {
  quizSetting: QuizSetting;
  initialUserQuizData: UserQuizData;
}

export const LearningPage: React.FC<LearningPageProps> = ({ quizSetting, initialUserQuizData }) => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<LearningPhase>('loading');
  const [groups, setGroups] = useState<Word[][]>([]);
  const [groupIndex, setGroupIndex] = useState(0);
  const [memWordIndex, setMemWordIndex] = useState(0);
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [targetWords, setTargetWords] = useState<Word[]>([]);
  const [userQuizData, setUserQuizData] = useState<UserQuizData>(initialUserQuizData);
  const [quizState, setQuizState] = useState<QuizState>(emptyQuizState);

  // useQuiz には 'learning' 以外のモードを渡す（resetQuiz/generateQuestion で使われるため）
  const learningQuizSetting: QuizSetting = { ...quizSetting, quizMode: 'english-to-japanese' };

  const {
    submitAnswer,
    nextQuestion,
    checkUserAnswer,
    addJpToEnWord,
    resisterWordWeakness,
    getQuizSummary,
  } = useQuiz({
    userQuizData,
    quizSetting: learningQuizSetting,
    quizState,
    setTargetWords,
    setQuizState,
    setUserQuizData,
  });

  // 初期化：単語取得・グループ分割
  useEffect(() => {
    const init = async () => {
      const words = await getWordsInWordBook(quizSetting.wordBookId);
      let range: [number, number] = [quizSetting.quizRange[0], quizSetting.quizRange[1]];
      if (range[0] <= 0) range[0] = 1;
      if (range[1] <= 0) range[1] = words.length;
      range = [Math.max(1, range[0]), Math.min(words.length, range[1])];

      const filtered = words.filter((w) => {
        if (w.index < range[0] || w.index > range[1]) return false;
        const weakness = userQuizData.wordWeaknesses[w.id];
        return (
          (quizSetting.includeNotLearning && weakness == undefined) ||
          (quizSetting.includeWeak && weakness === true) ||
          (quizSetting.includeNotWeak && weakness === false)
        );
      });

      if (filtered.length === 0) {
        alert('指定された範囲に単語が存在しません');
        navigate('/quizSetting');
        return;
      }

      // numberOfQuiz 分だけランダムに選出
      const shuffled = [...filtered].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, Math.min(quizSetting.numberOfQuiz, shuffled.length));

      const newGroups: Word[][] = [];
      for (let i = 0; i < selected.length; i += GROUP_SIZE) {
        newGroups.push(selected.slice(i, i + GROUP_SIZE));
      }
      setAllWords(selected);
      setGroups(newGroups);
      setPhase('memorize');
    };
    init();
  }, []);

  // グループクイズ開始
  const startGroupQuiz = (group: Word[]) => {
    const questions = group.map((w) => quizService.generateQuestion(w, 'english-to-japanese'));
    setQuizState({
      config: { mode: 'english-to-japanese', wordCount: group.length },
      questions,
      currentQuestionIndex: 0,
      answers: [],
      isComplete: false,
    });
    setPhase('quiz');
  };

  // 総復習開始
  const startFinalReview = (words: Word[]) => {
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    const questions = shuffled.map((w) => quizService.generateQuestion(w, 'english-to-japanese'));
    setTargetWords(shuffled);
    setQuizState({
      config: { mode: 'english-to-japanese', wordCount: shuffled.length },
      questions,
      currentQuestionIndex: 0,
      answers: [],
      isComplete: false,
    });
    setPhase('final-review');
  };

  // クイズ完了を検知してフェーズ遷移
  useEffect(() => {
    if (!quizState.isComplete) return;
    if (phase === 'quiz') {
      setPhase('group-complete');
    } else if (phase === 'final-review') {
      setPhase('complete');
    }
  }, [quizState.isComplete, phase]);

  // グループ完了後の「次へ」
  const handleGroupCompleteNext = () => {
    const nextIndex = groupIndex + 1;
    if (nextIndex < groups.length) {
      setGroupIndex(nextIndex);
      setMemWordIndex(0);
      setPhase('memorize');
    } else {
      startFinalReview(allWords);
    }
  };

  // 暗記フェーズの「次の単語へ」
  const handleMemorizeNext = () => {
    const group = groups[groupIndex];
    if (memWordIndex + 1 < group.length) {
      setMemWordIndex((m) => m + 1);
    } else {
      startGroupQuiz(group);
    }
  };

  const backButton = (
    <button
      onClick={() => navigate('/quizSetting')}
      className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
          clipRule="evenodd"
        />
      </svg>
      設定に戻る
    </button>
  );

  // --- ローディング ---
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <p className="text-xl text-gray-600">読み込み中...</p>
      </div>
    );
  }

  // --- 暗記フェーズ ---
  if (phase === 'memorize' && groups[groupIndex]) {
    const group = groups[groupIndex];
    const word = group[memWordIndex];
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 pt-16">
        <div className="max-w-2xl mx-auto mb-4 flex items-center justify-between">
          {backButton}
          <span className="text-sm text-gray-500 font-medium">学習モード - 暗記</span>
        </div>
        <MemorizationCard
          word={word}
          wordIndex={memWordIndex}
          groupSize={group.length}
          groupIndex={groupIndex}
          totalGroups={groups.length}
          isLastInGroup={memWordIndex === group.length - 1}
          onNext={handleMemorizeNext}
        />
      </div>
    );
  }

  // --- グループクイズ / 総復習クイズ ---
  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
  if ((phase === 'quiz' || phase === 'final-review') && currentQuestion && quizState.config) {
    const phaseLabel =
      phase === 'final-review'
        ? '学習モード - 総復習'
        : `学習モード - グループ ${groupIndex + 1}/${groups.length} クイズ`;

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 pt-16">
        <div className="max-w-2xl mx-auto mb-4 flex items-center justify-between">
          {backButton}
          <span className="text-sm text-gray-500 font-medium">{phaseLabel}</span>
        </div>
        <QuizCard
          question={currentQuestion}
          questionNumber={quizState.currentQuestionIndex + 1}
          totalQuestions={quizState.questions.length}
          onSubmit={submitAnswer}
          onNext={nextQuestion}
          isAudioMode={false}
          onCheckAnswer={checkUserAnswer}
          onAddJpToEnWord={addJpToEnWord}
          resisterWordWeakness={resisterWordWeakness}
          userQuizData={userQuizData}
        />
      </div>
    );
  }

  // --- グループ完了画面 ---
  if (phase === 'group-complete') {
    const summary = getQuizSummary();
    const isLastGroup = groupIndex + 1 >= groups.length;
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 pt-16">
        <div className="w-full max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            グループ {groupIndex + 1} 完了！
          </h2>
          <p className="text-gray-500 mb-4">
            {quizState.questions.length}問中 {summary.correctAnswers}問正解
          </p>
          <p
            className={`text-5xl font-bold mb-8 ${
              summary.accuracy >= 70 ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {Math.round(summary.accuracy)}%
          </p>
          <button
            onClick={handleGroupCompleteNext}
            autoFocus
            className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            {isLastGroup
              ? '総復習を始める'
              : `次のグループへ (${groupIndex + 2}/${groups.length})`}
          </button>
        </div>
      </div>
    );
  }

  // --- 総復習完了（最終結果） ---
  if (phase === 'complete') {
    const summary = getQuizSummary();
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 pt-16">
        <QuizResult
          summary={summary}
          answers={quizState.answers}
          onRestart={(words) => startFinalReview(words)}
          targetWords={targetWords}
          setTargetWords={setTargetWords}
        />
      </div>
    );
  }

  return null;
};
