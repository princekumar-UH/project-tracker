import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const setAdminSecret = (secret: string | null) => {
  const restClient = (supabase as any).rest;
  if (restClient && restClient.headers) {
    if (secret) {
      restClient.headers.set('x-admin-secret', secret);
    } else {
      restClient.headers.delete('x-admin-secret');
    }
  }
};

// Initialize on load if secret exists
if (typeof window !== 'undefined') {
  const savedSecret = localStorage.getItem('admin_secret');
  if (savedSecret) {
    setAdminSecret(savedSecret);
  }
}
