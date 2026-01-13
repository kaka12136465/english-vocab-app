import { WordBook } from "@/types";
import { useState } from "react";
import { getAllWordBooks } from "../services/vocabularyService";

export const useWordBook = () => {
    const [wordBooks, setWordBooks] = useState<WordBook[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function loadAllWordBooks(): Promise<void>{
        setLoading(true);
        setError(null);
        try {
            const fetchedWordBooks: WordBook[] = await getAllWordBooks();
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