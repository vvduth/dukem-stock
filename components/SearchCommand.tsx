"use client";

import { useState, useEffect } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import { Button } from "./ui/button";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import { useDebounce } from "@/hooks/useDebounce";

export default function SearchCommand({
  renderAs = "button",
  label = "Add stock",
  initialStocks = [],
}: SearchCommandProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] =
    useState<StockWithWatchlistStatus[]>(initialStocks);

  const isSearchMode = !!searchTerm.trim();
  const displayStocks = isSearchMode ? stocks : stocks.slice(0, 10);

  const handleSearch = async () => {
    if (!isSearchMode) {
      return setStocks(initialStocks);
    }
    setLoading(true);

    try {
      const result = await searchStocks(searchTerm.trim());
      setStocks(result);
    } catch (error) {
      setStocks([]);
      console.error("Error searching stocks:", error);
    } finally {
      setLoading(false);
    }
  };

  const debounceSearch = useDebounce(handleSearch, 300);

  useEffect(() => {
    debounceSearch();
  }, [searchTerm]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelectStock = () => {
    setOpen(false);
    setSearchTerm("");
    setStocks(initialStocks);
  };

  return (
    <>
      {renderAs === "text" ? (
        <span onClick={() => setOpen(true)} className="search-text">
          {label}
        </span>
      ) : (
        <Button onClick={() => setOpen(true)} className="search-btn">
          {label}
        </Button>
      )}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="search-dialog"
      >
        <div className="search-field">
          <CommandInput
            placeholder="Search stocks..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="search-input"
          />
        </div>

        <CommandList className="search-list">
          {loading ? (
            <CommandEmpty className="search-list-empty">
              Loading stocks...
            </CommandEmpty>
          ) : displayStocks.length === 0 ? (
            <div className="search-list-indicator">
              {isSearchMode ? "Searching..." : "Type to search stocks"}
            </div>
          ) : (
            <ul>
              <div className="search-count">
                {isSearchMode ? "Search Results" : "Popular Stocks"}(
                {displayStocks?.length || 0})
              </div>
              {displayStocks.map((stock, index) => {
                return (
                  <li key={index} className="search-item">
                  <Link
                    href={`/stocks/${stock.symbol}`}
                    onClick={handleSelectStock}
                    className="search-item-link"
                  >
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <div className="flex-1">
                      <div className="search-item-name">{stock.name}</div>
                      <div className="text-sm text-gray-500">
                        {stock.symbol} | {stock.exchange} | {stock.type}
                      </div>
                    </div>
                  </Link>
                </li>
                )
              })}
            </ul>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
