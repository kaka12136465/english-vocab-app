import { WordBook } from "@/types";
import { useState } from "react";
import { getAllWordBooks } from "../services/vocabularyService";

export const useWordBook = (userId: string) => {
    const [wordBooks, setWordBooks] = useState<WordBook[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadAllWordBooks = async (userId: string) => {
        setLoading(true);
        setError(null);
        try {
            const fetchedWordBooks: WordBook[] = await getAllWordBooks(userId);
            setWordBooks(fetchedWordBooks);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        wordBooks,
        loading,
        error,
        loadAllWordBooks,
    };
}