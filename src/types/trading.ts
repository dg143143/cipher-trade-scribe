export interface TradingSignal {
  symbol: string;
  price: number;
  action: 'Buy on Pullback' | 'Sell on Rally';
  entry: number;
  stopLoss: number;
  takeProfit: {
    tp1: number;
    tp2: number;
    tp3: number;
  };
  confidence: 'Low' | 'Medium' | 'High' | 'Very High';
  confluenceFactors: string[];
  levels: {
    swingHigh: number;
    swingLow: number;
    pivot: number;
    support: { s1: number; s2: number };
    resistance: { r1: number; r2: number };
  };
  volume: {
    buyVolume: number;
    sellVolume: number;
    imbalance: string;
  };
  zones: {
    demandZone: [number, number];
    supplyZone: [number, number];
    fvgZone: [number, number];
  };
  volumeProfile: {
    vah: number;
    val: number;
    poc: number;
  };
  liquidityPool: number;
  marketStructure: string;
  mtfa: string[];
  timestamp: string;
}

export interface BinanceKline {
  timestamp: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export interface OrderBook {
  bids: [string, string][];
  asks: [string, string][];
}

export interface AIInsight {
  analysis: string;
  confidence: number;
}

export type TradingMode = '1' | '2' | '3';