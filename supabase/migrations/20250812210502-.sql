-- Fix Function Search Path Security Issue
-- Set search_path for the existing function to prevent security vulnerabilities
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- Configure Auth Settings for Production Security
-- Reduce OTP expiration time from default (1 hour) to 10 minutes for better security
UPDATE auth.config 
SET 
  otp_expiry = 600,  -- 10 minutes in seconds (production recommended)
  password_min_length = 8,  -- Ensure strong passwords
  refresh_token_rotation_enabled = true,  -- Enable token rotation for better security
  security_update_password_require_reauthentication = true  -- Require re-auth for password changes
WHERE TRUE;