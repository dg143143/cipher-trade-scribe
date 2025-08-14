import axios from 'axios';
import { BinanceKline, OrderBook } from '@/types/trading';

const BINANCE_BASE_URL = 'https://api.binance.com/api/v3';

export const binanceApi = {
  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      const response = await axios.get(`${BINANCE_BASE_URL}/ticker/price?symbol=${symbol}USDT`);
      return parseFloat(response.data.price);
    } catch (error) {
      console.error('Binance price API error:', error);
      // Return mock data as fallback
      return Math.random() * 50000;
    }
  },

  async getKlines(symbol: string, interval: string = '15m', limit: number = 50): Promise<BinanceKline[]> {
    try {
      const response = await axios.get(
        `${BINANCE_BASE_URL}/klines?symbol=${symbol}USDT&interval=${interval}&limit=${limit}`
      );
      
      return response.data.map((kline: any[]) => ({
        timestamp: kline[0],
        open: kline[1],
        high: kline[2],
        low: kline[3],
        close: kline[4],
        volume: kline[5]
      }));
    } catch (error) {
      console.error('Binance klines API error:', error);
      // Return mock data as fallback
      return this.generateMockKlines();
    }
  },

  async getOrderBook(symbol: string, limit: number = 100): Promise<OrderBook> {
    try {
      const response = await axios.get(
        `${BINANCE_BASE_URL}/depth?symbol=${symbol}USDT&limit=${limit}`
      );
      
      return {
        bids: response.data.bids,
        asks: response.data.asks
      };
    } catch (error) {
      console.error('Binance order book API error:', error);
      // Return mock data as fallback
      return this.generateMockOrderBook();
    }
  },

  generateMockKlines(): BinanceKline[] {
    const klines: BinanceKline[] = [];
    let currentPrice = Math.random() * 50000;
    
    for (let i = 0; i < 50; i++) {
      const open = currentPrice;
      const high = open * (1 + Math.random() * 0.02);
      const low = open * (1 - Math.random() * 0.02);
      const close = open * (0.99 + Math.random() * 0.02);
      currentPrice = close;
      
      klines.push({
        timestamp: Date.now() - (50 - i) * 15 * 60 * 1000,
        open: open.toFixed(2),
        high: high.toFixed(2),
        low: low.toFixed(2),
        close: close.toFixed(2),
        volume: (Math.random() * 10000).toFixed(2)
      });
    }
    
    return klines;
  },

  generateMockOrderBook(): OrderBook {
    const bids: [string, string][] = [];
    const asks: [string, string][] = [];
    const basePrice = Math.random() * 50000;
    
    for (let i = 0; i < 10; i++) {
      const bidPrice = (basePrice * (1 - 0.001 * i)).toFixed(2);
      const askPrice = (basePrice * (1 + 0.001 * i)).toFixed(2);
      bids.push([bidPrice, (Math.random() * 1000).toFixed(2)]);
      asks.push([askPrice, (Math.random() * 1000).toFixed(2)]);
    }
    
    return { bids, asks };
  }
};