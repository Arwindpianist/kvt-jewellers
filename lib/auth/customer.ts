import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type UserRole = Database['public']['Enums']['user_role']

export interface CustomerUser {
  id: string
  email: string
  name: string
  role: UserRole
}

/**
 * Get current customer user from Supabase session
 */
export async function getCustomerUser(): Promise<CustomerUser | null> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return null
  }

  // Get user profile from public.users table
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return null
  }

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role,
  }
}

interface RegisterCustomerData {
  email: string;
  password: string;
  name: string;
  phone: string;
  country: string;
  idType: string;
  idNumber: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
}

/**
 * Register a new customer
 */
export async function registerCustomer(
  data: RegisterCustomerData
): Promise<{ user: CustomerUser | null; error: string | null; requiresEmailConfirmation?: boolean }> {
  const supabase = await createClient()

  // Sign up with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email.toLowerCase(),
    password: data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?verified=true`,
      data: {
        name: data.name,
      },
    },
  })

  if (authError || !authData.user) {
    return { user: null, error: authError?.message || 'Registration failed', requiresEmailConfirmation: false }
  }

  // Check if email confirmation is required
  const requiresEmailConfirmation = authData.user && !authData.session

  const userId = authData.user.id
  const userEmail = data.email.toLowerCase()

  // Retry mechanism with exponential backoff to ensure profile is created
  const maxRetries = 5
  let retryCount = 0
  let profile = null
  let lastError = null

  while (retryCount < maxRetries && !profile) {
    // Wait with exponential backoff (100ms, 200ms, 400ms, 800ms, 1600ms)
    if (retryCount > 0) {
      await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, retryCount - 1)))
    }

    // Try to upsert/create the profile with all fields
    // This will work whether the trigger has run or not
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: userEmail,
        name: data.name,
        phone: data.phone,
        country: data.country,
        id_type: data.idType,
        id_number: data.idNumber,
        address_line1: data.addressLine1,
        address_line2: data.addressLine2,
        city: data.city,
        state: data.state,
        postal_code: data.postalCode,
        role: 'customer',
      }, {
        onConflict: 'id'
      })

    if (upsertError) {
      console.error(`Profile upsert error (attempt ${retryCount + 1}):`, upsertError)
      lastError = upsertError
      retryCount++
      continue
    }

    // Try to fetch the profile
    const { data: fetchedProfile, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error(`Profile fetch error (attempt ${retryCount + 1}):`, fetchError)
      lastError = fetchError
      retryCount++
      continue
    }

    if (fetchedProfile) {
      profile = fetchedProfile
      break
    }

    retryCount++
  }

  // If we still don't have a profile after all retries, try one more direct insert
  if (!profile) {
    console.warn('Profile not found after retries, attempting direct insert...')
    
    // Use service role client for direct insert as fallback
    const { createServiceRoleClient } = await import('@/lib/supabase/server')
    const serviceSupabase = createServiceRoleClient()
    
    const { data: insertedProfile, error: insertError } = await serviceSupabase
      .from('users')
      .insert({
        id: userId,
        email: userEmail,
        name: data.name,
        phone: data.phone,
        country: data.country,
        id_type: data.idType,
        id_number: data.idNumber,
        address_line1: data.addressLine1,
        address_line2: data.addressLine2,
        city: data.city,
        state: data.state,
        postal_code: data.postalCode,
        role: 'customer',
      })
      .select()
      .single()

    if (insertError) {
      // Check if it's a conflict error (profile already exists)
      if (insertError.code === '23505') {
        // Profile exists, try fetching again
        const { data: fetchedProfile } = await serviceSupabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (fetchedProfile) {
          profile = fetchedProfile
        }
      } else {
        console.error('Direct insert error:', insertError)
        return { 
          user: null, 
          error: 'Failed to create user profile. Please contact support or try logging in.' 
        }
      }
    } else if (insertedProfile) {
      profile = insertedProfile
    }
  }

  if (!profile) {
    console.error('Failed to create/fetch user profile after all attempts')
    return { 
      user: null, 
      error: 'User account created but profile setup failed. Please try logging in - your profile will be created automatically.',
      requiresEmailConfirmation: false,
    }
  }

  return {
    user: {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
    },
    error: null,
    requiresEmailConfirmation: requiresEmailConfirmation || false,
  }
}

/**
 * Sign in a customer
 */
export async function signInCustomer(
  email: string,
  password: string
): Promise<{ user: CustomerUser | null; error: string | null }> {
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError || !authData.user) {
    return { user: null, error: authError?.message || 'Invalid credentials' }
  }

  const userId = authData.user.id
  const userEmail = authData.user.email || email

  // Get user profile
  let { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  // If profile doesn't exist, create it automatically using service role client
  // (bypasses RLS to avoid recursion issues)
  if (profileError || !profile) {
    console.warn('User profile not found during login, creating profile...')
    
    // Use service role client directly to bypass RLS
    try {
      const { createServiceRoleClient } = await import('@/lib/supabase/server')
      const serviceSupabase = createServiceRoleClient()
      
      // Try to create profile with basic info from auth user
      const userName = authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'User'
      
      const { error: createError } = await serviceSupabase
        .from('users')
        .upsert({
          id: userId,
          email: userEmail,
          name: userName,
          role: 'customer',
          country: 'MY', // Default country
        }, {
          onConflict: 'id'
        })

      if (createError) {
        console.error('Failed to create user profile during login:', createError)
        return { user: null, error: 'User profile not found and could not be created. Please contact support.' }
      }

      // Fetch the newly created profile using service role client
      const { data: newProfile, error: fetchError } = await serviceSupabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (fetchError || !newProfile) {
        return { user: null, error: 'User profile not found. Please try registering again or contact support.' }
      }

      profile = newProfile
    } catch (importError) {
      console.error('Failed to import service role client:', importError)
      return { user: null, error: 'User profile not found. Please contact support.' }
    }
  }

  return {
    user: {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
    },
    error: null,
  }
}

/**
 * Sign out customer
 */
export async function signOutCustomer(): Promise<{ error: string | null }> {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  return { error: error?.message || null }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  })
  
  return { error: error?.message || null }
}

/**
 * Update password (after reset)
 */
export async function updatePassword(password: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.updateUser({
    password,
  })
  
  return { error: error?.message || null }
}