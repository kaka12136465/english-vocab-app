import { fetchUserQuizData } from "@/features/quiz/services/quizService";
import { emptyUserQuizData, QuizMode, QuizSetting, UserQuizData } from "@/features/quiz/types/quiz.types";
import { getAllWordBooks } from "@/features/vocabulary/services/vocabularyService";
import { WordBook } from "@/types";
import { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface QuizSettingPageProps {
  user: User | null;
}
  
export const QuizSettingPage: React.FC<QuizSettingPageProps> = ({user}) => {  
  const [userQuizData, setUserQuizData] = useState<UserQuizData>(emptyUserQuizData);
  const [quizSetting, setQuizSetting] = useState<QuizSetting>(userQuizData.lastPlayQuizSetting);
  const [wordBooksDict, setWordBooksDict] = useState<Record<string, string>>({}); // key=単語帳のID, value=単語帳の名前
  const [quizRange, setQuizRange] = useState<[string, string]>([quizSetting.quizRange[0].toString(), quizSetting.quizRange[1].toString()]);

  const quizModes: { value: QuizMode; label: string; description: string; icon: string }[] = [
    {
      value: 'english-to-japanese',
      label: '英語 → 日本語', 
      description: '英 → 和',
      icon: '🇬🇧 → 🇯🇵',
    },
    {
      value: 'japanese-to-english',
      label: '日本語 → 英語',
      description: '和 → 英',
      icon: '🇯🇵 → 🇬🇧',
    },
    {
      value: 'audio-to-japanese',
      label: '音声 → 日本語',
      description: '英音声 → 和',
      icon: '🔊 → 🇯🇵',
    },
  ];

  const modeMap = new Map<string, string>();
  quizModes.map((value) => {
    modeMap.set(value.description, value.value);
  });

	const navigate = useNavigate();

  useEffect (() => {
    const fetchWordBooks = async () => {
      const wordBooks: WordBook[] = await getAllWordBooks();
      const dict: Record<string, string> = wordBooks.reduce((acc, word) => {
        acc[word.id] = word.name;
        return acc;
      }, {} as Record<string, string>);
      setWordBooksDict(dict);
    }

		const fetchUserQuizDataAndSetQuizSetting = async () => {
			if(!user){throw new Error("ユーザー情報がありません");}
			const userQuizData = await fetchUserQuizData(user.uid);
			setUserQuizData(userQuizData);
			setQuizSetting(userQuizData.lastPlayQuizSetting);
		}
		fetchUserQuizDataAndSetQuizSetting();
    fetchWordBooks();
  }, [user]);

	useEffect(() => {
		setQuizRange([quizSetting.quizRange[0].toString(), quizSetting.quizRange[1].toString()]);
	}, [quizSetting])

  const handleStartQuiz = async () => {
    if (quizSetting.numberOfQuiz < 1 || quizSetting.numberOfQuiz > 100) {
      alert('出題数は1〜100の範囲で設定してください');
      return;
    }
    if(Object.keys(wordBooksDict).length === 0){
      console.error("単語帳が存在しません");
      return;
    }
		
		navigate("/quiz", {state: {quizSetting: quizSetting, userQuizData: userQuizData}});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 pt-16">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              戻る
            </button>
            <h1 className="text-2xl font-bold text-gray-800">クイズ設定</h1>
          </div>
        </div>
      </header>
			<main className="bg-white rounded-2xl shadow-xl p-10">
				{/* 単語帳選択 */}
				<div className="space-y-4 mb-8">
					<select 
					value={quizSetting.wordBookId} 
					onChange={(e) => {
						setQuizSetting({...quizSetting, wordBookId: e.target.value});
					}}
					className="px-4 py-2 border rounded"
					>
					{Object.keys(wordBooksDict).map((key: string) => (
						<option key={key} value={key}>
						{wordBooksDict[key]}
						</option>
						))}
					</select>
				</div>

				{/* クイズモード */}
				<select 
					value={quizSetting.quizMode} 
					onChange={(e) => {setQuizSetting({...quizSetting, quizMode: modeMap.get(e.target.value ?? "英 → 和") as QuizMode});}}
					className="px-4 py-2 border rounded"
			>
					{Array.from(modeMap.keys()).map((item, index) => (
					<option key={index} value={item}>
							{item}
					</option>
					))}
				</select>

				{/* 出題範囲設定 */}
				<div className="my-6">
					<input
					type="text"
					inputMode="numeric"
					pattern="[0-9]*"
					value={quizRange[0]}
					placeholder="1"
					onChange={(e) => {
							e.preventDefault();
							if(e.target.value.match(/^[0-9]*$/)){
								setQuizRange([e.target.value, quizRange[1]]);
								setQuizSetting({...quizSetting, quizRange: [Number(e.target.value), Number(quizRange[1])]});
							}
					}}
					className="w-20 px-2 py-1 ml-4 mr-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
					/>
					〜
					<input
					type="text"
					inputMode="numeric"
					pattern="[0-9]*"
					value={quizRange[1]}
					placeholder="100"
					onChange={(e) => {
							e.preventDefault();
							if(e.target.value.match(/^[0-9]*$/)){
							setQuizRange([quizRange[0], e.target.value]);
							setQuizSetting({...quizSetting, quizRange: [Number(quizRange[1]), Number(e.target.value)]})
							}
					}}
					className="w-20 px-2 py-1 ml-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
					/>
					<p/>
					<p>*未入力または0以下の入力は全範囲</p>
				</div>

				{/* 出題数設定 */}
				<div className="flex flex-row mb-8">
					<label className="block pt-1 text-sm font-medium text-gray-700 mb-2">
					出題数：
					</label>
					<select
					value={quizSetting.numberOfQuiz}
					onChange={(e) => setQuizSetting({...quizSetting, numberOfQuiz:Number(e.target.value)})}
					className="p-1 mb-2 border rounded "
					>
					{[...Array(20)].map((_, i) => (
							<option key={(i+1)*5} value={(i+1)*5}>
							{(i+1)*5}問
							</option>
					))}
					</select>
				</div>

				{/* スタートボタン */}
				<button
					onClick={handleStartQuiz}
					className="w-full py-4 px-6 bg-primary-600 text-white text-lg font-bold rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 transition-all shadow-lg hover:shadow-xl"
			>
					クイズを開始
				</button>
			
				{/* 統計情報（将来的に実装） */}
				<div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="bg-white rounded-lg shadow p-6 text-center">
						<p className="text-sm text-gray-600 mb-1">学習済み単語</p>
						<p className="text-3xl font-bold text-primary-600">-</p>
					</div>
					<div className="bg-white rounded-lg shadow p-6 text-center">
						<p className="text-sm text-gray-600 mb-1">平均正答率</p>
						<p className="text-3xl font-bold text-green-600">-</p>
					</div>
					<div className="bg-white rounded-lg shadow p-6 text-center">
						<p className="text-sm text-gray-600 mb-1">総出題数</p>
						<p className="text-3xl font-bold text-gray-800">-</p>
					</div>
				</div>
			</main>
    </div>
  )
}