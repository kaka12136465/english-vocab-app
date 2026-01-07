import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProgress, ProgressStatus } from '@/types';

const PROGRESS_COLLECTION = 'userProgress';

/**
 * 進捗IDを生成（userId_wordId の形式）
 */
const generateProgressId = (userId: string, wordId: string): string => {
  return `${userId}_${wordId}`;
};

/**
 * ユーザーの特定の単語の進捗を取得
 */
export const getUserProgress = async (
  userId: string,
  wordId: string
): Promise<UserProgress | null> => {
  try {
    const progressId = generateProgressId(userId, wordId);
    const docRef = doc(db, PROGRESS_COLLECTION, progressId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        lastAttempted: data.lastAttempted?.toDate(),
      } as UserProgress;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw new Error('進捗データの取得に失敗しました');
  }
};

/**
 * ユーザーの全進捗データを取得
 */
export const getAllUserProgress = async (userId: string): Promise<UserProgress[]> => {
  try {
    const q = query(
      collection(db, PROGRESS_COLLECTION),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        lastAttempted: data.lastAttempted?.toDate(),
      } as UserProgress;
    });
  } catch (error) {
    console.error('Error fetching all user progress:', error);
    throw new Error('進捗データの取得に失敗しました');
  }
};

/**
 * 進捗ステータスを計算
 */
const calculateStatus = (correctCount: number, totalAttempts: number): ProgressStatus => {
  if (totalAttempts === 0) return 'normal';
  
  const accuracy = correctCount / totalAttempts;
  
  if (accuracy >= 0.8) return 'strong';
  if (accuracy >= 0.5) return 'normal';
  return 'weak';
};

/**
 * クイズ結果を記録して進捗を更新
 */
export const updateUserProgress = async (
  userId: string,
  wordId: string,
  isCorrect: boolean
): Promise<void> => {
  try {
    const progressId = generateProgressId(userId, wordId);
    const docRef = doc(db, PROGRESS_COLLECTION, progressId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // 既存の進捗データを更新
      const data = docSnap.data() as UserProgress;
      const newCorrectCount = data.correctCount + (isCorrect ? 1 : 0);
      const newTotalAttempts = data.totalAttempts + 1;
      const newStatus = calculateStatus(newCorrectCount, newTotalAttempts);
      
      await updateDoc(docRef, {
        correctCount: newCorrectCount,
        totalAttempts: newTotalAttempts,
        status: newStatus,
        lastAttempted: serverTimestamp(),
      });
    } else {
      // 新規進捗データを作成
      const newProgress: Omit<UserProgress, 'id' | 'lastAttempted'> = {
        userId,
        wordId,
        correctCount: isCorrect ? 1 : 0,
        totalAttempts: 1,
        status: calculateStatus(isCorrect ? 1 : 0, 1),
      };
      
      await setDoc(docRef, {
        ...newProgress,
        lastAttempted: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error updating user progress:', error);
    throw new Error('進捗データの更新に失敗しました');
  }
};

/**
 * ステータス別に単語IDリストを取得
 */
export const getWordIdsByStatus = async (
  userId: string,
  status: ProgressStatus
): Promise<string[]> => {
  try {
    const q = query(
      collection(db, PROGRESS_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', status)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data().wordId);
  } catch (error) {
    console.error('Error fetching words by status:', error);
    throw new Error('ステータス別単語の取得に失敗しました');
  }
};

/**
 * 進捗統計を取得
 */
export interface ProgressStats {
  totalWords: number;
  weakWords: number;
  normalWords: number;
  strongWords: number;
  totalAttempts: number;
  totalCorrect: number;
  accuracy: number;
}

export const getProgressStats = async (userId: string): Promise<ProgressStats> => {
  try {
    const allProgress = await getAllUserProgress(userId);
    
    const stats: ProgressStats = {
      totalWords: allProgress.length,
      weakWords: 0,
      normalWords: 0,
      strongWords: 0,
      totalAttempts: 0,
      totalCorrect: 0,
      accuracy: 0,
    };
    
    allProgress.forEach(progress => {
      stats.totalAttempts += progress.totalAttempts;
      stats.totalCorrect += progress.correctCount;
      
      switch (progress.status) {
        case 'weak':
          stats.weakWords++;
          break;
        case 'normal':
          stats.normalWords++;
          break;
        case 'strong':
          stats.strongWords++;
          break;
      }
    });
    
    if (stats.totalAttempts > 0) {
      stats.accuracy = (stats.totalCorrect / stats.totalAttempts) * 100;
    }
    
    return stats;
  } catch (error) {
    console.error('Error fetching progress stats:', error);
    throw new Error('統計データの取得に失敗しました');
  }
};
