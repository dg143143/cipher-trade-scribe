-- Create trading signals table for central storage
CREATE TABLE public.trading_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  signal_type TEXT NOT NULL, -- 'bullish' or 'bearish'
  entry_price DECIMAL(18,8) NOT NULL,
  stop_loss DECIMAL(18,8) NOT NULL,
  take_profit_1 DECIMAL(18,8) NOT NULL,
  take_profit_2 DECIMAL(18,8),
  take_profit_3 DECIMAL(18,8),
  confidence_level TEXT NOT NULL, -- 'low', 'medium', 'high', 'very_high'
  confluence_count INTEGER NOT NULL DEFAULT 0,
  ai_insight TEXT,
  technical_data JSONB DEFAULT '{}',
  market_data JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'closed', 'stopped'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trading_signals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trading signals
CREATE POLICY "Users can view their own signals" 
ON public.trading_signals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own signals" 
ON public.trading_signals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own signals" 
ON public.trading_signals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own signals" 
ON public.trading_signals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admin policies for trading signals
CREATE POLICY "Admins can view all signals" 
ON public.trading_signals 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all signals" 
ON public.trading_signals 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all signals" 
ON public.trading_signals 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Create user sessions table for tracking active sessions
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_token TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions
CREATE POLICY "Users can view their own sessions" 
ON public.user_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions" 
ON public.user_sessions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Add status column to profiles table for user approval system
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approved_by UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trading_signals_updated_at
BEFORE UPDATE ON public.trading_signals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create admin functions for user management
CREATE OR REPLACE FUNCTION public.create_user_account(_email TEXT, _password TEXT, _full_name TEXT DEFAULT NULL)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Only admins can call this function
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- This would typically integrate with auth.users but we'll handle it through the application
  -- Return a placeholder for now
  RETURN gen_random_uuid();
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_user(_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only admins can call this function
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Update profile status to approved
  UPDATE public.profiles 
  SET status = 'approved',
      approved_by = auth.uid(),
      approved_at = now()
  WHERE id = _user_id;
  
  -- Ensure user has user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_user(_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only admins can call this function
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Update profile status to rejected
  UPDATE public.profiles 
  SET status = 'rejected',
      approved_by = auth.uid(),
      approved_at = now()
  WHERE id = _user_id;
  
  -- Remove user role
  DELETE FROM public.user_roles 
  WHERE user_id = _user_id AND role = 'user';
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_user(_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only admins can call this function
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Remove all user roles
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  
  -- Delete user sessions
  DELETE FROM public.user_sessions WHERE user_id = _user_id;
  
  -- Delete user signals
  DELETE FROM public.trading_signals WHERE user_id = _user_id;
  
  -- Delete profile
  DELETE FROM public.profiles WHERE id = _user_id;
END;
$$;