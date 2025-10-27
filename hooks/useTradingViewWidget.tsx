"use client";
import React, { useRef } from "react";
import { useEffect } from "react";

const useTradingViewWidget = (
  scriptUrl: string,
  config: Record<string, unknown>,
  height = 600
) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (containerRef.current.dataset.loaded) return;
    containerRef.current.innerHTML = `<div class="tradingview-widget-container__widget" 
     style="height: ${height}px; width: 100%;"></div>`;
    const script = document.createElement("script");
    script.src = scriptUrl;
    //  "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify(config);
    containerRef.current.appendChild(script);

    return () => {
        if (containerRef.current) {
            containerRef.current.innerHTML = "";
            delete containerRef.current.dataset.loaded;
        }
    }
  }, [scriptUrl, config, height]);

  return containerRef;
};

export default useTradingViewWidget;
