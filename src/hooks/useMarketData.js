import { useState, useEffect } from 'react';

const useMarketData = () => {
  const [marketData, setMarketData] = useState({
    XRP: { price: 0, change24h: 0, previousPrice: 0 },
    XLM: { price: 0, change24h: 0, previousPrice: 0 },
    USDT: { price: 1, change24h: 0, previousPrice: 1 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMarketData = async () => {
    try {
      // Fetch data from CoinGecko API
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ripple,stellar,tether&vs_currencies=usd&include_24hr_change=true'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }

      const data = await response.json();

      setMarketData(prevData => ({
        XRP: {
          price: data.ripple?.usd || 0,
          change24h: data.ripple?.usd_24h_change || 0,
          previousPrice: prevData.XRP.price
        },
        XLM: {
          price: data.stellar?.usd || 0,
          change24h: data.stellar?.usd_24h_change || 0,
          previousPrice: prevData.XLM.price
        },
        USDT: {
          price: data.tether?.usd || 1,
          change24h: data.tether?.usd_24h_change || 0,
          previousPrice: prevData.USDT.price
        }
      }));

      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching market data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchMarketData();

    // Set up interval for real-time updates (every 30 seconds)
    const interval = setInterval(fetchMarketData, 30000);

    return () => clearInterval(interval);
  }, []);

  const getPriceDirection = (symbol) => {
    const currentPrice = marketData[symbol].price;
    const previousPrice = marketData[symbol].previousPrice;

    if (currentPrice > previousPrice) return 'up';
    if (currentPrice < previousPrice) return 'down';
    return 'neutral';
  };

  const getPriceEmoji = (symbol) => {
    const direction = getPriceDirection(symbol);
    const changePercent = marketData[symbol].change24h;

    if (direction === 'up' || changePercent > 0) return '📈';
    if (direction === 'down' || changePercent < 0) return '📉';
    return '➡️';
  };

  return {
    marketData,
    loading,
    error,
    getPriceDirection,
    getPriceEmoji,
    refetch: fetchMarketData
  };
};

export default useMarketData;
