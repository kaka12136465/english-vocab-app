import React, { useEffect, useRef, useState } from 'react';
import { AddWordFormData } from '../types/vocabulary.types';
import { scrapeWord, translateEnToJp, translateEnToJpIfNotFound } from '../services/wordSearchingService';

interface AddWordFormProps {
  onSubmit: (formData: AddWordFormData) => Promise<boolean>; // handleAddWord関数を受け取る
  onCancel: () => void;
  wordsCnt: number;
  setWordsCnt: (cnt: number) => void;
}


// WordsPageから呼ばれる
export const AddWordForm: React.FC<AddWordFormProps> = ({ onSubmit, onCancel, wordsCnt, setWordsCnt }) => {
  const [formData, setFormData] = useState<AddWordFormData>({
    english: '',
    japanese: [''],
    synonyms: [],
    antonyms: [],
    exampleSentence: '',
    pronunciation: '',
    index: 0,
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isSearched, setIsSearched] = useState(false);
  const [wordsFile, setWordsFile] = useState<File | null>(null);
  const [addingWordsForm, setAddingWordsForm] = useState<string>("");
  const [addingWords, setAddingWords] = useState<[string, number][]>([]); // [英単語, 番号]の配列
  const [isSingleAddition, setIsSingleAddition] = useState<boolean>(true);
  const [isParallelAddition, setIsParallelAddition] = useState<boolean>(false);

  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const inputEnRef = useRef<HTMLInputElement>(null);

  // ショートカットキー追加
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === ";") {
        event.preventDefault();
        handleSubmit();
      } 
    }

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [formData])

  // 日本語訳の追加
  const addJapaneseField = () => {
    setFormData(prev => ({
      ...prev,
      japanese: [...prev.japanese, ''],
    }));
  };

  // 日本語訳の削除
  const removeJapaneseField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      japanese: prev.japanese.filter((_, i) => i !== index),
    }));
  };

  // 日本語訳の更新
  const updateJapanese = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      japanese: prev.japanese.map((j, i) => (i === index ? value : j)),
    }));
  };

  // 類義語の追加
  const addSynonym = () => {
    setFormData(prev => ({
      ...prev,
      synonyms: [...prev.synonyms, ''],
    }));
  };

  // 対義語の追加
  const addAntonym = () => {
    setFormData(prev => ({
      ...prev,
      antonyms: [...prev.antonyms, ''],
    }));
  };

  const handleSubmit = async () => {
    if(formData.japanese.length === 0 || formData.english.length === 0 ){
      setError("英単語と日本語訳は必須です")
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const success = await onSubmit(formData);
      if (success) {
        // フォームをリセット
        setFormData({
          english: '',
          japanese: [''],
          synonyms: [],
          antonyms: [],
          exampleSentence: '',
          pronunciation: '',
          index: 0,
          description: '',
        });
        setError("");
        setWordsCnt(wordsCnt + 1);
      }
      setIsSearched(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setTimeout(()=>{
        inputEnRef.current?.focus();
      }, 1);
    }
  };

  // formData.englishの類義語、対義語、例文をスクレイピングし、
  const handleSearch = async () => {
    if(formData.english.length === 0){
      setError("英単語は必須です");
      return;
    }
    setIsSearchLoading(true);
    try{
      console.log('searching "' + formData.english + '"');
      const scrapedData = await scrapeWord(formData.english);
      let newFormData: AddWordFormData;
      const index = wordsCnt + 1;
      if(scrapedData.isFound){
        const japaneses:string = await translateEnToJp(formData.english);
        newFormData = {
          english: scrapedData.english,
          japanese: japaneses.split(/[,、\n]/),
          antonyms: Array.from(scrapedData.antonyms),
          synonyms: Array.from(scrapedData.synonyms),
          exampleSentence: scrapedData.exampleSentence,
          pronunciation: scrapedData.pronunciation,
          index: index,
          description: '',
        }
      }else{
        const translateResponse:string = await translateEnToJpIfNotFound(formData.english);
        const translateResponseMatch = translateResponse.match(/\{([^}]+)\}/);
        if(!translateResponseMatch){
          setError("AIから不適切なレスポンスを受け取りました");
          setIsSearchLoading(false);
          return;
        }
        const translateResult = JSON.parse("{" + translateResponseMatch[1] + "}");
        newFormData = {
          english: formData.english,
          japanese: translateResult.japanese,
          antonyms: translateResult.antonyms,
          synonyms: translateResult.synonyms,
          exampleSentence: translateResult.exampleSentence,
          pronunciation: translateResult.pronunciation,
          index: index,
          description: '',
        }
      }
      console.log("result", newFormData);
      setFormData(newFormData);
    }catch(err){
      console.error("検索に失敗しました");
      throw new Error();
    }finally{
      setIsSearchLoading(false);
      setIsSearched(true);
    }
  }

  // ファイルの内容を読み込み、ファイルに書いてる単語をすべてデータベースへ追加する
  const handleAddWordsInFile = async () => {
    setLoading(true);
    try{
      if (wordsFile) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const input = e.target?.result as string;
          console.log("ファイルを読み込みました" + input);
          const wordsData = JSON.parse(input);
          const addingWords: string[] = wordsData.words;
          console.log(wordsData);
          console.log(addingWords);

          let index = wordsCnt + 1;
          for(const word of addingWords){
            console.log("searching", word);
            const scrapedData = await scrapeWord(word);
            console.log("scraping result", word);
            if(!scrapedData.isFound){
              setError("英単語が見つかりません");
              setIsSearchLoading(false);
              return;
            }

            const translateResponse:string = await translateEnToJp(word);
            console.log("translate result", translateResponse);

            
            const newFormData: AddWordFormData = {
              english: word,
              japanese: translateResponse.split(/[,、\n]/),
              antonyms: Array.from(scrapedData.antonyms),
              synonyms: Array.from(scrapedData.synonyms),
              exampleSentence: scrapedData.exampleSentence,
              pronunciation: scrapedData.pronunciation,
              index: index,
              description: '',
            }
            index += 1;
            const success = await onSubmit(newFormData);
            if(!success){
              throw new Error("データベースへ単語を追加できませんでした" + newFormData);
            }
          }
        };
        reader.readAsText(wordsFile);
      } else {
        console.error("ファイルが読み込めません");
        throw new Error("ファイルが読み込めません" + wordsFile);
      }
      
    } catch (err: any) {
      throw new Error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleAddmultipleWords = async () => {
    setLoading(true);
    let addingWordsCopy: [string, number][] = [...addingWords];
    if(addingWordsCopy.length === 0){
      setError("追加する単語がありません");
      setLoading(false);
      return;
    }
    try{
      for(let i = 0; addingWordsCopy.length != 0; i++){
        console.log("チェック", addingWords);
        const [word, index] = addingWordsCopy[0];
        const scrapedData = await scrapeWord(word);
        if(!scrapedData.isFound){
          setError("英単語が見つかりません: " + word);
          setIsSearchLoading(false);
          setLoading(false);
          return;
        }
        const translateResponse:string = "てすと"//await translateEnToJp(word);
        const newFormData: AddWordFormData = {
          english: word,
          japanese: translateResponse.split(/[,、\n]/),
          antonyms: Array.from(scrapedData.antonyms),
          synonyms: Array.from(scrapedData.synonyms),
          exampleSentence: scrapedData.exampleSentence,
          pronunciation: scrapedData.pronunciation,
          index: index,
          description: '',
        }
        const success = await onSubmit(newFormData);
        if(!success){
          throw new Error("データベースへ単語を追加できませんでした" + newFormData);
        }
        setAddingWords(prev => prev.filter((w) => w[0] !== word));
        addingWordsCopy = addingWordsCopy.filter((w) => w[0] !== word);
        
        setWordsCnt(wordsCnt + 1);
      }
      setError("");
    }catch(err){
      console.error("まとめて単語追加に失敗しました");
      throw new Error(err instanceof Error ? err.message : String(err));
    }finally{
      setLoading(false);
    }
  }

  const addWord = async (wordData: [string, number]) => {
    setLoading(true);
    const [word, index] = wordData;
    try{
      const scrapedData = await scrapeWord(word);
      if(!scrapedData.isFound){
        setError("英単語が見つかりません: " + word);
        setIsSearchLoading(false);
        setLoading(false);
        return;
      }
      const translateResponse:string = "test"//await translateEnToJp(word);
      const newFormData: AddWordFormData = {
        english: word,
        japanese: translateResponse.split(/[,、\n]/),
        antonyms: Array.from(scrapedData.antonyms),
        synonyms: Array.from(scrapedData.synonyms),
        exampleSentence: scrapedData.exampleSentence,
        pronunciation: scrapedData.pronunciation,
        index: index,
        description: '',
      }
      const success = await onSubmit(newFormData);
      if(!success){
        throw new Error("データベースへ単語を追加できませんでした" + newFormData);
      }
      setAddingWords(prev => prev.filter((w) => w[0] !== word));
      setWordsCnt(wordsCnt + 1);
      setError("");
    }catch(err){
      console.error("単語追加に失敗しました");
    }finally{
      setLoading(false);
    }
  }

  return (
    <form 
      onSubmit={(e) => {e.preventDefault();handleSubmit()}} 
      className="bg-white rounded-lg shadow-md p-6"
    >
      <div className="flex justify-between items-start mb-2">
        <span>
            <h2 className="w-full flex text-2xl font-bold text-gray-800 mb-6">単語を追加</h2>
        </span>
        <div className="flex flex-row gap-2">
            <button
                type="submit"
                disabled={loading}
                className="py-2 px-4 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {loading ? '追加中...' : '追加'}
            </button>
            <button
                type="button"
                onClick={onCancel}
                className="py-2 px-4 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
            >
                キャンセル
            </button>
        </div>
      </div>
      {/* ファイルから単語データを追加 */}
      {false && 
      <div aria-disabled={false} className="flex gap-2 items-center mb-3">
        <input
          type='file'
          onChange={(e) => {setWordsFile(e.target.files?.[0] || null)}}
          className="px-3 py-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-500 file:text-white file:cursor-pointer hover:file:bg-blue-600"
        />
        <button
          onClick={handleAddWordsInFile}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          ファイルから追加
        </button>
      </div>}
      <button 
        onClick={(e) => {e.preventDefault(); setIsSingleAddition(true);}}
        className={!isSingleAddition ? "px-4 pt-2 pb-2 bg-gray-100 text-gray-700 border border-gray-100 hover:bg-gray-200" 
        : "px-4 pt-2 pb-2 bg-white"}
        disabled={isSingleAddition}>
          1つずつ単語を追加
      </button>
      <button 
        onClick={(e) => {e.preventDefault(); setIsSingleAddition(false);}}
        className={isSingleAddition ? "px-4 pt-2 pb-2 bg-gray-100 text-gray-700 border border-gray-100 hover:bg-gray-200" 
        : "px-4 pt-2 pb-2 bg-white"}
        disabled={!isSingleAddition}>
          まとめて単語を追加
      </button>

      {/* まとめて単語追加フォーム */}
      {!isSingleAddition ? (
        <div className="flex bg-white px-4 flex-col">
          {error && (
            <div className="p-3 mt-4 mb-3 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}
          {addingWords.map((word, index) => (
            <div className="flex justify-between items-center gap-2 mb-1" key={index}>
              <div className="flex flex-1 mt-3 px-3 py-2 w-full border border-gray-300 rounded-md items-center gap-2 mb-1">
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={word[1] || wordsCnt + 1 + index}
                  className="[field-sizing:content] focus:outline-none underline"
                  onChange={(e) => {e.preventDefault(); setAddingWords(prev => prev.map((w, i) => i === index ? [w[0], Number(e.target.value)] : w))}}
                />
                ：
                <input
                  type="text"
                  className="font-bold"
                  value={word[0]}
                  onChange={(e) => {setAddingWords(prev => prev.map((w, i) => i === index ? [e.target.value, w[1]] : w))}}
                  onKeyDown={(e) => {
                    e.preventDefault();
                    if(e.key === "Enter"){
                      addWord(word);
                    }
                  }}
                  placeholder="単語を入力してください"
                />
              </div>
              <button
                  onClick={(e) => {
                    e.preventDefault(); 
                    setAddingWords(prev => prev.filter((_, i) => i !== index).map((w, i) => i >= index ? [w[0], w[1] - 1] : w));
                  }}
                  disabled={loading}
                  className="shrink-0 px-3 py-1 text-red-600 hover:bg-red-700 rounded-md font-bold border border-red-600 bg-red-600 text-white"
              >削除</button>
            </div>
          ))}
          <input
            value={addingWordsForm}
            type="text"
            className="flex-1 mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3"
            onChange={(e) => setAddingWordsForm(e.target.value)}
            placeholder="まとめて単語を追加したい場合は、ここに単語を改行区切りで入力してください。"
            onKeyDown={(e) => {
              if(e.key === "Enter"){
                e.preventDefault();
                setAddingWords(prev => [...prev, [addingWordsForm, wordsCnt + prev.length + 1]]);
                setAddingWordsForm("");
                console.log(addingWords);
                if(isParallelAddition){
                  addWord([addingWordsForm, wordsCnt + addingWords.length + 1]);
                }
                e.currentTarget.focus();
              }
            }}
          />
          <div className="flex items-center mb-3">
            {loading ? <span className="text-sm text-gray-500">追加中...</span> : 
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  await handleAddmultipleWords();
                }}
                className="mb-2 w-fit px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={addingWords.length === 0 || isParallelAddition}
              >
              まとめて追加
            </button>}
            <span className="ml-4">入力後すぐに追加</span>
            <input type="checkbox" checked={isParallelAddition} 
              onChange={(e) => {
                setIsParallelAddition(e.target.checked);
                if(e.target.checked){                   
                  addingWords.forEach((word) => {
                    addWord(word);
                  })
              }}}
              className="ml-2 mr-1 size-5" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-6 bg-white px-4">
          {error && (
            <div className="p-3 mt-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          {/* 英単語 */}
          <div>
            <label className="block mt-4 text-sm font-medium text-gray-700 mb-2">
              英単語 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.english}
              onChange={(e) => {setFormData(prev => ({ ...prev, english: e.target.value })); setIsSearchLoading(false);}}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
              placeholder="例: apple"
              required
              ref={inputEnRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if(isSearched) setIsSearched(false);
                  e.preventDefault();
                  setTimeout(()=>{
                    searchButtonRef.current?.focus();
                  }, 1);
                }
              }}
            />
          </div>
          
          <div className='flex flex-row justify-start items-center gap-x-3'>
            {isSearched ? 
              <button
                type="submit"
                disabled={loading}
                className="mr-4 py-2 px-4 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                ref={addButtonRef}
              >
                {loading ? '追加中...' : '追加'}
              </button> :
              <button
                type='button' 
                onClick={handleSearch}
                disabled={isSearchLoading}
                ref={searchButtonRef}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    await handleSearch();
                    setTimeout(() => {
                      addButtonRef.current?.focus();
                    }, 1);
                  }
                }}
                className='mr-4 py-2 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {isSearchLoading ? "待機中..." : "検索"}
              </button> 
            }
            <div className="flex flex-none w-fit px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500">
              <p className='text-center'>番号：</p>
              <input
                type="number"
                value={formData.index > 0 ? formData.index : ""}
                onChange={(e) => setFormData(prev => ({ ...prev, index: Number(e.target.value) }))}
                className='focus:outline-none w-16'
                required
              />
            </div>
          </div>

          {/* 日本語訳 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              日本語訳 <span className="text-red-500">*</span>
            </label>
            {formData.japanese.map((jp, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={jp}
                  onChange={(e) => updateJapanese(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="例: りんご"
                  required={index === 0}
                />
                {formData.japanese.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeJapaneseField(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    削除
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addJapaneseField}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              + 日本語訳を追加
            </button>
          </div>

          {/* 発音記号 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              発音記号
            </label>
            <input
              type="text"
              value={formData.pronunciation}
              onChange={(e) => setFormData(prev => ({ ...prev, pronunciation: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="例: ˈæp.əl"
            />
          </div>

          {/* 類義語 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              類義語（任意）
            </label>
            {formData.synonyms.map((syn, index) => (
              <input
                key={index}
                type="text"
                value={syn}
                onChange={(e) => {
                  const newSynonyms = [...formData.synonyms];
                  newSynonyms[index] = e.target.value;
                  setFormData(prev => ({ ...prev, synonyms: newSynonyms }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
                placeholder="例: fruit"
              />
            ))}
            <button
              type="button"
              onClick={addSynonym}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              + 類義語を追加
            </button>
          </div>

          {/* 対義語 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              対義語（任意）
            </label>
            {formData.antonyms.map((ant, index) => (
              <input
                key={index}
                type="text"
                value={ant}
                onChange={(e) => {
                  const newAntonyms = [...formData.antonyms];
                  newAntonyms[index] = e.target.value;
                  setFormData(prev => ({ ...prev, antonyms: newAntonyms }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
                placeholder="例: vegetable"
              />
            ))}
            <button
              type="button"
              onClick={addAntonym}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              + 対義語を追加
            </button>
          </div>

          {/* 例文 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              例文（任意）
            </label>
            <textarea
              value={formData.exampleSentence}
              onChange={(e) => setFormData(prev => ({ ...prev, exampleSentence: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="例: I eat an apple every day."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              説明文（任意）
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="例: 「瞳のリンゴ」=「目に入れても痛くないほど可愛い存在」という意味のイディオム「The apple of one's eye」としても使われます"
              rows={3}
            />
          </div>

          {/* ボタン */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '追加中...' : '追加 (Ctrl + ; )'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </form>
  );
};
