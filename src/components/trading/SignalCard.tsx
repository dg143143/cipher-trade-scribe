import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TradingSignal } from '@/types/trading';
import { tradingAnalysis } from '@/utils/tradingAnalysis';
import { exportUtils } from '@/utils/exportUtils';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SignalCardProps {
  signal: TradingSignal;
}

export const SignalCard: React.FC<SignalCardProps> = ({ signal }) => {
  const { isDarkMode } = useTheme();
  const { toast } = useToast();
  const riskReward = tradingAnalysis.calculateRiskReward(signal);

  const handleDownloadPNG = async () => {
    try {
      await exportUtils.downloadSignalCard('signal-card', signal.symbol, isDarkMode);
      toast({
        title: "Export Complete",
        description: "Signal card downloaded successfully",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to download signal card",
        variant: "destructive"
      });
    }
  };

  const isBullish = signal.action.includes('Buy');

  return (
    <Card id="signal-card" className="trading-card">
      <CardContent className="p-6 space-y-4">
        {/* Signal Header */}
        <div className="signal-header text-center">
          <h2 className="text-xl font-bold font-headers">
            🎯 Elite Signal: {signal.symbol} ({isBullish ? 'Bullish' : 'Bearish'})
          </h2>
        </div>

        {/* Core Signal Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-trading text-sm">
          <div className="space-y-2">
            <div><strong>💰 Price:</strong> ${signal.price.toFixed(2)}</div>
            <div><strong>📌 Action:</strong> 
              <span className={cn(
                "ml-1 font-semibold",
                isBullish ? "text-trading-accent" : "text-trading-danger"
              )}>
                {signal.action}
              </span>
            </div>
            <div><strong>🚪 Entry:</strong> ${signal.entry.toFixed(2)}</div>
            <div><strong>🛑 Stop-Loss:</strong> ${signal.stopLoss.toFixed(2)}</div>
          </div>
          
          <div className="space-y-2">
            <div><strong>🎯 Take-Profit:</strong></div>
            <div className="ml-4 text-xs space-y-1">
              <div>TP1: ${signal.takeProfit.tp1.toFixed(2)}</div>
              <div>TP2: ${signal.takeProfit.tp2.toFixed(2)}</div>
              <div>TP3: ${signal.takeProfit.tp3.toFixed(2)}</div>
            </div>
            <div><strong>📊 Risk-Reward:</strong> 1 : {riskReward.toFixed(1)}</div>
            <div><strong>🛡️ Confidence:</strong> 
              <span className={cn(
                "ml-1 font-semibold",
                signal.confidence === 'Very High' ? "text-trading-accent" :
                signal.confidence === 'High' ? "text-blue-500" :
                "text-trading-warning"
              )}>
                {signal.confidence}
              </span>
            </div>
          </div>
        </div>

        {/* Confluence Factors */}
        <div className="space-y-2">
          <h3 className="section-header neon-text">🔍 Signals Detected:</h3>
          <div className="space-y-1">
            {signal.confluenceFactors.map((factor, index) => (
              <div key={index} className="confluence-item text-sm">
                • {factor}
              </div>
            ))}
          </div>
        </div>

        {/* Key Levels */}
        <div className="space-y-2">
          <h3 className="section-header neon-text">📌 Key Levels</h3>
          <div className="font-trading text-sm space-y-1">
            <div>• <strong>Swing High:</strong> ${signal.levels.swingHigh.toFixed(2)}</div>
            <div>• <strong>Swing Low:</strong> ${signal.levels.swingLow.toFixed(2)}</div>
            <div>• <strong>Daily Pivot:</strong> ${signal.levels.pivot.toFixed(2)}</div>
            <div>• <strong>Support:</strong> S1: ${signal.levels.support.s1.toFixed(2)}, S2: ${signal.levels.support.s2.toFixed(2)}</div>
            <div>• <strong>Resistance:</strong> R1: ${signal.levels.resistance.r1.toFixed(2)}, R2: ${signal.levels.resistance.r2.toFixed(2)}</div>
          </div>
        </div>

        {/* Volume Analysis */}
        <div className="space-y-2">
          <h3 className="section-header neon-text">📊 Volume Analysis</h3>
          <div className="font-trading text-sm space-y-1">
            <div>• <strong>Buyer Volume:</strong> {signal.volume.buyVolume.toLocaleString()} units</div>
            <div>• <strong>Seller Volume:</strong> {signal.volume.sellVolume.toLocaleString()} units</div>
            <div>• <strong>Net Flow:</strong> {signal.volume.imbalance}</div>
          </div>
        </div>

        {/* Supply & Demand Zones */}
        <div className="space-y-2">
          <h3 className="section-header neon-text">🟦 Supply & Demand Zones</h3>
          <div className="font-trading text-sm space-y-1">
            <div>• <strong>Demand Zone:</strong> ${signal.zones.demandZone[0].toFixed(2)} – ${signal.zones.demandZone[1].toFixed(2)}</div>
            <div>• <strong>Supply Zone:</strong> ${signal.zones.supplyZone[0].toFixed(2)} – ${signal.zones.supplyZone[1].toFixed(2)}</div>
            <div>• <strong>Fair Value Gap (FVG):</strong> ${signal.zones.fvgZone[0].toFixed(2)} – ${signal.zones.fvgZone[1].toFixed(2)}</div>
          </div>
        </div>

        {/* Volume Profile */}
        <div className="space-y-2">
          <h3 className="section-header neon-text">📈 Volume Profile</h3>
          <div className="font-trading text-sm space-y-1">
            <div>• <strong>VAH (Value Area High):</strong> ${signal.volumeProfile.vah.toFixed(2)}</div>
            <div>• <strong>VAL (Value Area Low):</strong> ${signal.volumeProfile.val.toFixed(2)}</div>
            <div>• <strong>POC (Point of Control):</strong> ${signal.volumeProfile.poc.toFixed(2)}</div>
          </div>
        </div>

        {/* Multi-Timeframe Alignment */}
        <div className="space-y-2">
          <h3 className="section-header neon-text">🔁 Multi-Timeframe Alignment (5M → 1D)</h3>
          <div className="font-trading text-xs space-y-1">
            {signal.mtfa.map((tf, index) => (
              <div key={index}>• {tf}</div>
            ))}
          </div>
        </div>

        {/* Liquidity & Structure */}
        <div className="space-y-2">
          <h3 className="section-header neon-text">💧 Liquidity & Structure</h3>
          <div className="font-trading text-sm space-y-1">
            <div>• <strong>Liquidity Pool:</strong> ${signal.liquidityPool.toFixed(2)} (potential wick trap)</div>
            <div>• <strong>Market Structure:</strong> {signal.marketStructure}</div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-xs text-muted-foreground font-trading">
          Generated: {signal.timestamp}
        </div>

        {/* Download Button */}
        <Button
          onClick={handleDownloadPNG}
          className={cn(
            "w-full mt-4",
            "bg-gradient-to-r from-purple-600 to-blue-600",
            "hover:from-purple-700 hover:to-blue-700",
            "font-headers text-sm font-semibold",
            "shadow-glow-primary"
          )}
        >
          📷 Download Signal Card
        </Button>
      </CardContent>
    </Card>
  );
};