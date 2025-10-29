"use server";

import { getDateRange, validateArticle, formatArticle } from "@/lib/utils";

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const NEXT_PUBLIC_FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY!;

/**
 * Fetches JSON data from a URL with optional caching
 */
async function fetchJSON<T>(
  url: string,
  revalidateSeconds?: number
): Promise<T> {
  const options: RequestInit = revalidateSeconds
    ? {
        cache: "force-cache",
        next: { revalidate: revalidateSeconds },
      }
    : {
        cache: "no-store",
      };

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetches news articles - either personalized for watchlist symbols or general market news
 * @param symbols - Optional array of stock symbols to fetch news for
 * @returns Array of formatted news articles (max 6)
 */
export const getNews = async (
  symbols?: string[]
): Promise<MarketNewsArticle[]> => {
  try {
    // Get date range for last 5 days
    const { from, to } = getDateRange(5);

    // If symbols exist, fetch company news
    if (symbols && symbols.length > 0) {
      // Clean and uppercase symbols
      const cleanSymbols = symbols
        .map((s) => s.trim().toUpperCase())
        .filter((s) => s.length > 0);

      if (cleanSymbols.length === 0) {
        // Fallback to general news if no valid symbols
        return await fetchGeneralNews(from, to);
      }

      const newsArticles: MarketNewsArticle[] = [];
      const maxRounds = 6; // Maximum 6 articles total
      let round = 0;

      // Round-robin through symbols to collect news
      while (newsArticles.length < maxRounds && round < maxRounds) {
        const symbolIndex = round % cleanSymbols.length;
        const symbol = cleanSymbols[symbolIndex];

        try {
          // Fetch company news for this symbol
          const url = `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`;
          const articles = await fetchJSON<RawNewsArticle[]>(url);

          // Find the first valid article from this symbol's news
          const validArticle = articles?.find((article) =>
            validateArticle(article)
          );

          if (validArticle) {
            newsArticles.push(
              formatArticle(validArticle, true, symbol, newsArticles.length)
            );
          }
        } catch (error) {
          console.error(`Error fetching news for symbol ${symbol}:`, error);
        }

        round++;
      }

      // Sort by datetime (newest first) and return
      return newsArticles.sort((a, b) => b.datetime - a.datetime);
    }

    // No symbols - fetch general market news
    return await fetchGeneralNews(from, to);
  } catch (error) {
    console.error("Error in getNews:", error);
    throw new Error("Failed to fetch news");
  }
};

/**
 * Fetches general market news
 */
async function fetchGeneralNews(
  from: string,
  to: string
): Promise<MarketNewsArticle[]> {
  const url = `${FINNHUB_BASE_URL}/news?category=general&from=${from}&to=${to}&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`;
  const articles = await fetchJSON<RawNewsArticle[]>(url);

  if (!articles || articles.length === 0) {
    return [];
  }

  // Filter valid articles
  const validArticles = articles.filter((article) => validateArticle(article));

  // Deduplicate by id, url, and headline
  const seen = new Set<string>();
  const uniqueArticles: RawNewsArticle[] = [];

  for (const article of validArticles) {
    const key = `${article.id}-${article.url}-${article.headline}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueArticles.push(article);
    }
  }

  // Take top 6 and format them
  return uniqueArticles
    .slice(0, 6)
    .map((article, index) => formatArticle(article, false, undefined, index));
}
