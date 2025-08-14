import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { exportUtils } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AIInsightPanelProps {
  insight: string;
  isLoading?: boolean;
}

export const AIInsightPanel: React.FC<AIInsightPanelProps> = ({ insight, isLoading }) => {
  const { toast } = useToast();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleCopyInsight = async () => {
    if (!insight) return;
    
    try {
      await exportUtils.copyToClipboard(insight);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
      
      toast({
        title: "Copied to Clipboard",
        description: "Elite AI Insight copied successfully",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy insight to clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className={cn(
      "ai-container ai-glow relative overflow-hidden",
      "border-2 border-ai-border"
    )}>
      <CardContent className="p-6">
        {/* AI Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">🤖</span>
            <div>
              <h3 className="font-headers font-bold text-ai-header text-lg">
                Elite AI Insight
              </h3>
              <span className="elite-badge px-2 py-1 rounded text-xs">
                Level 5 Analysis
              </span>
            </div>
          </div>
        </div>

        {/* AI Content */}
        <div className="space-y-4">
          <div className={cn(
            "font-trading text-sm leading-relaxed",
            "text-ai-content min-h-[100px] p-4 rounded",
            "bg-background/10 border border-ai-border/30"
          )}>
            {isLoading ? (
              <div className="flex items-center gap-2 text-ai-header">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                🧠 Initializing quantum trading matrix...
              </div>
            ) : insight ? (
              <div className="whitespace-pre-wrap">{insight}</div>
            ) : (
              <div className="text-ai-header/70 italic">
                Elite AI analysis will appear here...
              </div>
            )}
          </div>

          {/* Confidence Meter */}
          <div className="space-y-2">
            <div className="text-sm text-ai-header/80">
              Confidence: Ultra-High (95%)
            </div>
            <div className="confidence-bar h-2 rounded-full overflow-hidden">
              <div className="confidence-fill h-full w-[95%] rounded-full"></div>
            </div>
          </div>

          {/* Copy Button */}
          {insight && (
            <Button
              onClick={handleCopyInsight}
              variant="outline"
              size="sm"
              className={cn(
                "border-ai-border text-ai-header",
                "hover:bg-ai-border/10 hover:border-ai-header",
                "transition-all duration-300 font-trading",
                isAnimating && "scale-95 bg-ai-border/20"
              )}
            >
              📋 Copy Insight
            </Button>
          )}
        </div>

        {/* Animated Border Effect */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-ai-border to-transparent animate-pulse"></div>
      </CardContent>
    </Card>
  );
};