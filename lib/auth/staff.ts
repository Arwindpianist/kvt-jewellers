import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
}

/**
 * Sign in a staff user using Supabase Auth
 */
export async function signInStaff(
  email: string,
  password: string
): Promise<{ user: StaffUser | null; error: string | null }> {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { user: null, error: authError?.message || 'Invalid credentials' };
  }

  const userId = authData.user.id;
  const userEmail = authData.user.email || email;

  // Get user profile - must have staff or admin role
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .in('role', ['admin', 'staff'])
    .single();

  if (profileError || !profile) {
    return { 
      user: null, 
      error: 'Access denied. Staff/admin role required.' 
    };
  }

  return {
    user: {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role as 'admin' | 'staff',
    },
    error: null,
  };
}

/**
 * Get current staff user from Supabase session
 */
export async function getStaffUser(): Promise<StaffUser | null> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return null;
  }

  // Get user profile - must have staff or admin role
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .in('role', ['admin', 'staff'])
    .single();

  if (profileError || !profile) {
    return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role as 'admin' | 'staff',
  };
}

/**
 * Sign out staff user
 */
export async function signOutStaff(): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Create a staff/admin user (for seeding/admin operations)
 */
export async function createStaffUser(
  email: string,
  password: string,
  name: string,
  role: 'admin' | 'staff' = 'staff'
): Promise<{ user: StaffUser | null; error: string | null }> {
  const serviceSupabase = createServiceRoleClient();

  // Create auth user
  const { data: authData, error: authError } = await serviceSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email for staff users
    user_metadata: {
      name,
    },
  });

  if (authError || !authData.user) {
    return { user: null, error: authError?.message || 'Failed to create user' };
  }

  const userId = authData.user.id;

  // Create profile in users table
  const { data: profile, error: profileError } = await serviceSupabase
    .from('users')
    .insert({
      id: userId,
      email,
      name,
      role,
    })
    .select()
    .single();

  if (profileError || !profile) {
    // Clean up auth user if profile creation fails
    await serviceSupabase.auth.admin.deleteUser(userId);
    return { user: null, error: 'Failed to create user profile' };
  }

  return {
    user: {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role as 'admin' | 'staff',
    },
    error: null,
  };
}
