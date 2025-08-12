export const cleanupAuthState = () => {
  try {
    // Remove standard Supabase auth tokens
    localStorage.removeItem('supabase.auth.token');
    // Remove any Supabase-related keys
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    // Session storage cleanup as well
    try {
      Object.keys(sessionStorage || {}).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch {}
  } catch {}
};
