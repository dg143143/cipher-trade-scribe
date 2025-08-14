import React from 'react';
import { TradingWidget } from '@/components/trading/TradingWidget';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4 font-headers">
            SmartSignal Pro v2 - Elite AI Edition
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Advanced AI-Powered Trading Signals
          </p>
          <Button 
            onClick={() => navigate('/auth')} 
            className="trading-button text-lg px-8 py-3"
          >
            Access Trading Dashboard
          </Button>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <TradingWidget />
        </div>
      </div>
    </div>
  );
};

export default Index;
