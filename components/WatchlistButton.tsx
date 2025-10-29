"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function WatchlistButton({
  symbol,
  isInWatchlist: initialIsInWatchlist,
  showTrashIcon = false,
  type = "button",
  onWatchlistChange,
}: WatchlistButtonProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(initialIsInWatchlist);

  const handleClick = () => {
    const newState = !isInWatchlist;
    setIsInWatchlist(newState);
    onWatchlistChange?.(symbol, newState);
  };

  if (type === "icon") {
    return (
      <button onClick={handleClick} className="text-gray-400 hover:text-white">
        {isInWatchlist ? "★" : "☆"}
      </button>
    );
  }

  return (
    <Button onClick={handleClick} variant={isInWatchlist ? "default" : "outline"}>
      {isInWatchlist ? (showTrashIcon ? "Remove" : "In Watchlist") : "Add to Watchlist"}
    </Button>
  );
}
