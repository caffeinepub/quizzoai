// Legacy hook - use utils/wikipedia.ts directly instead
import { useState } from "react";
import { fetchWikipediaContent } from "../utils/wikipedia";

export function useWikipedia() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchContent(chapter: string): Promise<string> {
    setIsLoading(true);
    setError(null);
    try {
      const content = await fetchWikipediaContent(chapter);
      return content;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to fetch content.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return { fetchContent, isLoading, error, setError };
}
