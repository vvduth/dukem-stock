"use server";

import { cache } from "react";
import { getDateRange, validateArticle, formatArticle } from "@/lib/utils";
import { POPULAR_STOCK_SYMBOLS } from "../constants";
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

export const searchStocks = cache(
  async (query?: string): Promise<StockWithWatchlistStatus[]> => {
    try {
      let results: FinnhubSearchResult[] = [];

      if (!query) {
        const profilePromises = POPULAR_STOCK_SYMBOLS.slice(0, 10).map(
          async (symbol) => {
            try {
              const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`;
              const profile = await fetchJSON<{
                name?: string;
                ticker?: string;
                exchange?: string;
              }>(url, 3600);

              return {
                symbol: symbol,
                description: profile.name || symbol,
                displaySymbol: symbol,
                type: "Common Stock",
                exchange: profile.exchange || "US",
              } as FinnhubSearchResult;
            } catch (error) {
              console.error(`Error fetching profile for ${symbol}:`, error);
              return null;
            }
          }
        );

        const profiles = await Promise.all(profilePromises);
        results = profiles.filter(
          (p): p is FinnhubSearchResult => p !== null
        );
      } else {
        const trimmedQuery = query.trim();
        if (trimmedQuery) {
          const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(trimmedQuery)}&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`;
          const response = await fetchJSON<FinnhubSearchResponse>(url, 1800);
          results = response.result || [];
        }
      }

      const stocks: StockWithWatchlistStatus[] = results
        .map((result) => ({
          symbol: result.symbol.toUpperCase(),
          name: result.description,
          exchange: result.displaySymbol || "US",
          type: result.type || "Stock",
          isInWatchlist: false,
        }))
        .slice(0, 15);

      return stocks;
    } catch (error) {
      console.error("Error in stock search:", error);
      return [];
    }
  }
);
