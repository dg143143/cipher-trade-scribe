import axios from 'axios';
import { TradingSignal, AIInsight } from '@/types/trading';

const OPENROUTER_API_KEY = "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";

export const aiService = {
  async generateEliteInsight(signal: TradingSignal): Promise<AIInsight> {
    const prompt = `
You are ELITE-AI, a world-class trading strategist with 20 years of institutional experience.
Analyze this ${signal.symbol} setup and deliver a single, powerful paragraph that sounds like a Bloomberg Pro Terminal alert.

Structure:
- Start with: "Strong ${signal.action.includes('Buy') ? 'bullish' : 'bearish'} setup presents itself..."
- Mention price, entry, SL, TP, confluence count
- Highlight demand/supply zones and FVG
- Note volume bias
- End with a sharp, confident conclusion

Tone: Professional, urgent, elite. No markdown. Max 180 tokens.

Data:
Price: $${signal.price}
Trend: ${signal.action.includes('Buy') ? 'Bullish' : 'Bearish'}
Action: ${signal.action}
Entry: $${signal.entry}, SL: $${signal.stopLoss}, TP1: $${signal.takeProfit.tp1}
Confluence: ${signal.confluenceFactors.length} factors
Demand Zone: $${signal.zones.demandZone[0]}–${signal.zones.demandZone[1]}
FVG: $${signal.zones.fvgZone[0]}–${signal.zones.fvgZone[1]}
Volume: ${signal.volume.imbalance}
    `;

    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "mistralai/mistral-7b-instruct:free",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 200,
          temperature: 0.6,
        },
        {
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "SmartSignal Pro AI",
            "Content-Type": "application/json"
          }
        }
      );

      return {
        analysis: response.data.choices[0].message.content.trim(),
        confidence: 95
      };
    } catch (error) {
      console.error("AI service error:", error);
      return this.generateFallbackAnalysis(signal);
    }
  },

  generateFallbackAnalysis(signal: TradingSignal): AIInsight {
    const confidenceLevel = signal.confluenceFactors.length >= 6 ? "very high" :
                            signal.confluenceFactors.length >= 4 ? "high" :
                            signal.confluenceFactors.length >= 2 ? "moderate" : "low";
    
    const sentiment = signal.action.includes('Buy') ? "bullish" : "bearish";
    const sentimentDirection = signal.action.includes('Buy') ? "higher" : "lower";
    
    const volumeAnalysis = signal.volume.imbalance.includes("Net Buying Pressure") ?
      "significant institutional accumulation" :
      "distribution by large market participants";
      
    const fvgAnalysis = `The Fair Value Gap at $${signal.zones.fvgZone[0]}-${signal.zones.fvgZone[1]} represents an unfilled liquidity zone that price is likely to revisit, creating a high-probability entry opportunity`;
    
    const zoneAnalysis = signal.action.includes('Buy') ?
      `Price is approaching a strong demand zone between $${signal.zones.demandZone[0]} and $${signal.zones.demandZone[1]}, where institutional buyers have historically entered the market` :
      `Price is approaching a significant supply zone between $${signal.zones.supplyZone[0]} and $${signal.zones.supplyZone[1]}, where institutional sellers have historically entered the market`;
      
    const riskReward = signal.action.includes('Buy') ? 
      (signal.takeProfit.tp1 - signal.entry) / (signal.entry - signal.stopLoss) : 
      (signal.entry - signal.takeProfit.tp1) / (signal.stopLoss - signal.entry);
    
    const rrAssessment = riskReward > 2 ? 
      "offering an exceptional risk-reward profile" : 
      riskReward > 1.5 ? 
      "providing a solid risk-reward opportunity" :
      "presenting a marginal risk-reward setup that requires tight risk management";
      
    const conclusion = signal.action.includes('Buy') ?
      `This ${signal.symbol} setup presents a high-conviction opportunity for institutional-grade long exposure with defined risk parameters. Monitor price action as it approaches the entry zone for confirmation.` :
      `This ${signal.symbol} setup presents a high-conviction opportunity for institutional-grade short exposure with defined risk parameters. Monitor price action as it approaches the entry zone for confirmation.`;
      
    const analysis = `Strong ${sentiment} setup presents itself in ${signal.symbol} at $${signal.price.toFixed(2)}. The market structure shows ${confidenceLevel} confidence with ${signal.confluenceFactors.length} confluence factors aligning. ${zoneAnalysis}. ${fvgAnalysis}. Volume analysis reveals ${volumeAnalysis}, confirming the directional bias. ${rrAssessment}. ${conclusion}`;

    return {
      analysis,
      confidence: 95
    };
  }
};