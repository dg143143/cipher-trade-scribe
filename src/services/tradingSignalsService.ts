import { supabase } from '@/integrations/supabase/client';

export interface TradingSignal {
  id?: string;
  user_id?: string;
  symbol: string;
  signal_type: 'bullish' | 'bearish';
  entry_price: number;
  stop_loss: number;
  take_profit_1: number;
  take_profit_2?: number;
  take_profit_3?: number;
  confidence_level: 'low' | 'medium' | 'high' | 'very_high';
  confluence_count: number;
  ai_insight?: string;
  technical_data?: any;
  market_data?: any;
  status?: 'active' | 'closed' | 'stopped';
  created_at?: string;
  updated_at?: string;
}

export const tradingSignalsService = {
  async saveSignal(signal: TradingSignal) {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('trading_signals')
        .insert({
          user_id: session.user.id,
          symbol: signal.symbol,
          signal_type: signal.signal_type,
          entry_price: signal.entry_price,
          stop_loss: signal.stop_loss,
          take_profit_1: signal.take_profit_1,
          take_profit_2: signal.take_profit_2,
          take_profit_3: signal.take_profit_3,
          confidence_level: signal.confidence_level,
          confluence_count: signal.confluence_count,
          ai_insight: signal.ai_insight,
          technical_data: signal.technical_data,
          market_data: signal.market_data,
          status: signal.status || 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async getUserSignals(userId?: string) {
    try {
      let query = supabase
        .from('trading_signals')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async getAllSignals() {
    try {
      const { data, error } = await supabase
        .from('trading_signals')
        .select(`
          *,
          profiles!trading_signals_user_id_fkey (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async updateSignalStatus(signalId: string, status: 'active' | 'closed' | 'stopped') {
    try {
      const { data, error } = await supabase
        .from('trading_signals')
        .update({ status })
        .eq('id', signalId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async deleteSignal(signalId: string) {
    try {
      const { error } = await supabase
        .from('trading_signals')
        .delete()
        .eq('id', signalId);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }
};