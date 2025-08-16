import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTheme } from '@/contexts/ThemeContext';
import { TradingSignal, TradingMode } from '@/types/trading';
import { binanceApi } from '@/services/binanceApi';
import { tradingAnalysis } from '@/utils/tradingAnalysis';
import { aiService } from '@/services/aiService';
import { tradingSignalsService } from '@/services/tradingSignalsService';
import { SignalCard } from './SignalCard';
import { AIInsightPanel } from './AIInsightPanel';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

export const TradingWidget: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { toast } = useToast();
  
  const [symbol, setSymbol] = useState('');
  const [mode, setMode] = useState<TradingMode>('3');
  const [isLoading, setIsLoading] = useState(false);
  const [signal, setSignal] = useState<TradingSignal | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('');

  const handleGenerateSignal = async () => {
    if (!symbol.trim()) {
      toast({
        title: "Symbol Required",
        description: "Please enter a symbol (e.g., BTC, ETH)",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setSignal(null);
    setAiInsight('');

    try {
      const symbolUpper = symbol.trim().toUpperCase();
      
      // Fetch data from Binance API
      const [price, klines, orderBook] = await Promise.all([
        binanceApi.getCurrentPrice(symbolUpper),
        binanceApi.getKlines(symbolUpper),
        binanceApi.getOrderBook(symbolUpper)
      ]);

      // Generate trading signal
      const tradingSignal = tradingAnalysis.generateSignal(symbolUpper, price, klines, orderBook);
      setSignal(tradingSignal);

      // Generate AI insight for Elite mode
      if (mode === '3') {
        try {
          const insight = await aiService.generateEliteInsight(tradingSignal);
          setAiInsight(insight.analysis);
        } catch (error) {
          console.error('AI insight generation failed:', error);
          // AI insight will remain empty, component will handle gracefully
        }
      }

      toast({
        title: "Signal Generated",
        description: `${symbolUpper} signal analysis complete`,
        variant: "default"
      });

      // Save signal to database if user is authenticated
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const confidenceLevel = tradingSignal.confluenceFactors.length >= 6 ? 'very_high' :
                                  tradingSignal.confluenceFactors.length >= 4 ? 'high' :
                                  tradingSignal.confluenceFactors.length >= 2 ? 'medium' : 'low';

          await tradingSignalsService.saveSignal({
            symbol: symbolUpper,
            signal_type: tradingSignal.action.includes('Buy') ? 'bullish' : 'bearish',
            entry_price: tradingSignal.entry,
            stop_loss: tradingSignal.stopLoss,
            take_profit_1: tradingSignal.takeProfit.tp1,
            take_profit_2: tradingSignal.takeProfit.tp2,
            take_profit_3: tradingSignal.takeProfit.tp3,
            confidence_level: confidenceLevel,
            confluence_count: tradingSignal.confluenceFactors.length,
            ai_insight: aiInsight,
            technical_data: {
              swingHigh: tradingSignal.levels.swingHigh,
              swingLow: tradingSignal.levels.swingLow,
              pivot: tradingSignal.levels.pivot,
              supports: [tradingSignal.levels.support.s1, tradingSignal.levels.support.s2],
              resistances: [tradingSignal.levels.resistance.r1, tradingSignal.levels.resistance.r2],
              demandZone: tradingSignal.zones.demandZone,
              supplyZone: tradingSignal.zones.supplyZone,
              fvgZone: tradingSignal.zones.fvgZone,
              volumeProfile: tradingSignal.volumeProfile,
              liquidityPool: tradingSignal.liquidityPool,
              marketStructure: tradingSignal.marketStructure,
              mtfa: tradingSignal.mtfa
            },
            market_data: {
              price: tradingSignal.price,
              buyVolume: tradingSignal.volume.buyVolume,
              sellVolume: tradingSignal.volume.sellVolume,
              volumeImbalance: tradingSignal.volume.imbalance
            }
          });
        }
      } catch (error) {
        console.error('Failed to save signal:', error);
        // Don't show error to user as signal generation was successful
      }

    } catch (error) {
      console.error('Signal generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate signal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Main Widget Container */}
        <div className={cn(
          "trading-card rounded-xl overflow-hidden relative",
          "backdrop-blur-sm"
        )}>
          <ThemeToggle />
          
          {/* Header */}
          <div className={cn(
            "relative overflow-hidden px-6 py-4",
            "bg-gradient-to-r from-primary to-trading-accent",
            "text-primary-foreground text-center"
          )}>
            <div className="shine-effect">
              <h1 className="text-2xl font-bold font-headers tracking-wider">
                🚀 SmartSignal Pro v2 - Elite AI Edition
              </h1>
            </div>
          </div>

          {/* Controls */}
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                <strong>Enter asset:</strong> BTC, ETH, SOL, XRP, etc. (Binance symbols)
              </label>
              <Input
                type="text"
                placeholder="e.g. BTC"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className={cn(
                  "font-trading text-lg",
                  "border-trading-primary/30 focus:border-trading-primary",
                  "bg-background/50"
                )}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Analysis Mode
              </label>
              <Select value={mode} onValueChange={(value: TradingMode) => setMode(value)}>
                <SelectTrigger className={cn(
                  "font-trading",
                  "border-trading-primary/30 focus:border-trading-primary",
                  "bg-background/50"
                )}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Quick Pulse</SelectItem>
                  <SelectItem value="2">2 - Pro Signal</SelectItem>
                  <SelectItem value="3">3 - Elite Mode (AI-Powered)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerateSignal}
              disabled={isLoading}
              className={cn(
                "w-full trading-button text-lg py-6",
                "relative overflow-hidden"
              )}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                  Scanning Markets...
                </div>
              ) : (
                "Generate Signal"
              )}
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="px-6 pb-4">
              <div className="trading-card p-4 text-center">
                <div className="text-trading-accent font-trading italic">
                  🧠 Scanning Swing Points, Volume, and Smart Money Zones...
                </div>
              </div>
            </div>
          )}

          {/* Signal Results */}
          {signal && (
            <div className="px-6 pb-6 space-y-4">
              <SignalCard signal={signal} />
              
              {/* AI Insight Panel for Elite Mode */}
              {mode === '3' && (
                <AIInsightPanel 
                  insight={aiInsight}
                  isLoading={isLoading && !aiInsight}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};