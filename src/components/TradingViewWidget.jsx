import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget() {
  const container = useRef();

  useEffect(() => {
    // Check if the script is already present to avoid duplicates
    if (container.current && !container.current.querySelector('script')) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        {
          "colorTheme": "dark",
          "dateRange": "12M",
          "showChart": true,
          "locale": "en",
          "largeChartUrl": "",
          "isTransparent": true,
          "showSymbolLogo": true,
          "showFloatingTooltip": false,
          "width": "100%",
          "height": "100%",
          "plotLineColorGrowing": "rgba(0, 225, 255, 1)",
          "plotLineColorFalling": "rgba(255, 75, 141, 1)",
          "gridLineColor": "rgba(240, 243, 250, 0)",
          "scaleFontColor": "rgba(180, 180, 180, 1)",
          "belowLineFillColorGrowing": "rgba(0, 225, 255, 0.12)",
          "belowLineFillColorFalling": "rgba(255, 75, 141, 0.12)",
          "belowLineFillColorGrowingBottom": "rgba(41, 98, 255, 0)",
          "belowLineFillColorFallingBottom": "rgba(41, 98, 255, 0)",
          "symbolActiveColor": "rgba(0, 225, 255, 0.12)",
          "tabs": [
            {
              "title": "Cryptocurrencies",
              "symbols": [
                { "s": "BITSTAMP:BTCUSD", "d": "Bitcoin" },
                { "s": "BITSTAMP:ETHUSD", "d": "Ethereum" },
                { "s": "COINBASE:SOLUSD", "d": "Solana" },
                { "s": "COINBASE:XRPUSD", "d": "XRP" },
                { "s": "COINBASE:DOGEUSD", "d": "Dogecoin" },
                { "s": "COINBASE:ADAUSD", "d": "Cardano" }
              ],
              "originalTitle": "Cryptocurrencies"
            }
          ]
        }`;
      container.current.appendChild(script);
    }
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
    </div>
  );
}

export default memo(TradingViewWidget);