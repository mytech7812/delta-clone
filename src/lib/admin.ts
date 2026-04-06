import { supabase } from './supabase';

// Hardcoded admin emails as backup (never fails)
const HARDCODED_ADMIN_EMAILS = [
  'fck7812@gmail.com',  // Replace with your email
  // Add more admin emails here if needed
];

// Cache admin status to avoid repeated DB calls
let adminCache: Map<string, boolean> = new Map();

export async function isUserAdmin(userId: string, userEmail: string): Promise<boolean> {
  // Check cache first
  if (adminCache.has(userId)) {
    return adminCache.get(userId)!;
  }
  
  // Method 1: Check database (primary)
  try {
    const { data, error } = await supabase
      .rpc('is_admin', { user_id: userId });
    
    if (!error && data === true) {
      adminCache.set(userId, true);
      return true;
    }
  } catch (err) {
    console.log('DB admin check failed, using fallback');
  }
  
  // Method 2: Check hardcoded list (fallback - never breaks)
  const isHardcodedAdmin = HARDCODED_ADMIN_EMAILS.includes(userEmail);
  if (isHardcodedAdmin) {
    adminCache.set(userId, true);
    return true;
  }
  
  // Method 3: Direct profile check (second fallback)
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('user_id', userId)
      .single();
    
    if (profile?.is_admin === true) {
      adminCache.set(userId, true);
      return true;
    }
  } catch (err) {
    // Silent fail
  }
  
  adminCache.set(userId, false);
  return false;
}

// Check if current logged in user is admin
export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  return isUserAdmin(user.id, user.email || '');
}

// Clear cache (call this when admin status might change)
export function clearAdminCache() {
  adminCache.clear();
}