-- Fix admin login and ensure proper role assignment

-- Create or update the handle_new_user function to properly handle admin users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, status)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    CASE 
      WHEN new.email = 'admin@smartsignal.pro' THEN 'approved'
      ELSE 'pending'
    END
  );
  
  -- Assign roles based on email
  IF new.email = 'admin@smartsignal.pro' THEN
    -- Admin user gets both admin and user roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'admin');
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'user');
  ELSE
    -- Regular users get user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'user');
  END IF;
  
  RETURN new;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Make sure all existing functions have proper search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.toggle_user_access(_user_id uuid, _active boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can call this function
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Update user role based on active status
  IF _active THEN
    -- Ensure user has user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Remove user role (deactivate)
    DELETE FROM public.user_roles 
    WHERE user_id = _user_id AND role = 'user';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.make_user_admin(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can call this function
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Add admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_admin_role(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can call this function
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Remove admin role
  DELETE FROM public.user_roles 
  WHERE user_id = _user_id AND role = 'admin';
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_user(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.reject_user(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.remove_user(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.create_user_account(_email text, _password text, _full_name text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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