/**
 * SUPABASE CLIENT CONFIGURATION
 * 
 * Centralized Supabase client configuration
 * - Single source of truth for Supabase connection
 * - Environment-agnostic (uses environment variables)
 * - Type-safe with TypeScript
 * - Secure (no hardcoded credentials)
 * 
 * @module config/supabase
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

/**
 * Validates required environment variables
 * Fails fast if critical configuration is missing
 */
function validateEnvironment(): void {
  const requiredVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };

  const missing = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n\n` +
      `Please check your .env.local file and ensure all required variables are set.\n` +
      `See .env.example for reference.`
    );
  }

  // Validate URL format
  const url = requiredVars.VITE_SUPABASE_URL;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error(
      `Invalid VITE_SUPABASE_URL format: ${url}\n` +
      `Expected: https://<project-ref>.supabase.co`
    );
  }

  // Validate anon key format (should be a JWT)
  const anonKey = requiredVars.VITE_SUPABASE_ANON_KEY;
  if (!anonKey.startsWith('eyJ')) {
    console.warn(
      '⚠️  VITE_SUPABASE_ANON_KEY does not appear to be a valid JWT token.\n' +
      'Please verify you copied the correct key from Supabase dashboard.'
    );
  }
}

// Run validation
validateEnvironment();

// ============================================================================
// SUPABASE CLIENT CONFIGURATION
// ============================================================================

/**
 * Supabase client options
 * 
 * Configuration:
 * - auth.persistSession: Keep user logged in across page refreshes
 * - auth.autoRefreshToken: Automatically refresh expired tokens
 * - auth.detectSessionInUrl: Handle OAuth callbacks
 * - db.schema: Default schema (public)
 * - global.headers: Custom headers for all requests
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage, // Use localStorage for session persistence
    storageKey: 'scrap-management-auth', // Custom storage key
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': `scrap-management/${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
    },
  },
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get current authenticated user
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
  
  return user;
}

/**
 * Get current session
 * @returns Session object or null if no active session
 */
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error fetching session:', error);
    return null;
  }
  
  return session;
}

/**
 * Check if user is authenticated
 * @returns boolean indicating authentication status
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return session !== null;
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Upload file to Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path within bucket
 * @param file - File to upload
 * @returns Public URL of uploaded file
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading file:', error);
    throw error;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Delete file from Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path within bucket
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Get signed URL for private file
 * @param bucket - Storage bucket name
 * @param path - File path within bucket
 * @param expiresIn - URL expiration time in seconds (default: 3600)
 * @returns Signed URL
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error('Error creating signed URL:', error);
    throw error;
  }

  return data.signedUrl;
}

// ============================================================================
// REALTIME SUBSCRIPTIONS
// ============================================================================

/**
 * Subscribe to table changes
 * @param table - Table name
 * @param callback - Callback function for changes
 * @returns Subscription object
 * 
 * @example
 * const subscription = subscribeToTable('cutting_jobs', (payload) => {
 *   console.log('Change received!', payload);
 * });
 * 
 * // Unsubscribe when done
 * subscription.unsubscribe();
 */
export function subscribeToTable(
  table: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel(`public:${table}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
      },
      callback
    )
    .subscribe();
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Parse Supabase error and return user-friendly message
 * @param error - Supabase error object
 * @returns User-friendly error message
 */
export function parseSupabaseError(error: any): string {
  if (!error) return 'An unknown error occurred';

  // PostgreSQL error codes
  const pgErrorMessages: Record<string, string> = {
    '23505': 'A record with this value already exists',
    '23503': 'Referenced record does not exist',
    '23502': 'Required field is missing',
    '23514': 'Value does not meet requirements',
    '42501': 'You do not have permission to perform this action',
  };

  // Check for PostgreSQL error code
  if (error.code && pgErrorMessages[error.code]) {
    return pgErrorMessages[error.code];
  }

  // Check for Supabase error message
  if (error.message) {
    // Remove technical details from error message
    const message = error.message.replace(/^.*?:\s*/, '');
    return message;
  }

  return 'An error occurred while processing your request';
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * Check Supabase connection health
 * @returns boolean indicating if connection is healthy
 */
export async function healthCheck(): Promise<boolean> {
  try {
    // Try a simple query
    const { error } = await supabase.from('system_config').select('key').limit(1);
    return !error;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

// ============================================================================
// LOGGING (Development Only)
// ============================================================================

if (import.meta.env.DEV) {
  console.log('🚀 Supabase Client Initialized');
  console.log('📍 URL:', supabaseUrl);
  console.log('🔑 Anon Key:', supabaseAnonKey.substring(0, 20) + '...');
  console.log('🌍 Environment:', import.meta.env.MODE);
  
  // Test connection
  healthCheck().then((healthy) => {
    if (healthy) {
      console.log('✅ Supabase connection healthy');
    } else {
      console.error('❌ Supabase connection failed');
    }
  });
}

// ============================================================================
// EXPORT
// ============================================================================

export default supabase;

/**
 * USAGE EXAMPLES:
 * 
 * // 1. Query data
 * const { data, error } = await supabase
 *   .from('cutting_jobs')
 *   .select('*')
 *   .eq('status', 'COMPLETED');
 * 
 * // 2. Insert data
 * const { data, error } = await supabase
 *   .from('cutting_jobs')
 *   .insert({ job_order_no: 'WO-001', ... });
 * 
 * // 3. Update data
 * const { data, error } = await supabase
 *   .from('cutting_jobs')
 *   .update({ status: 'COMPLETED' })
 *   .eq('id', jobId);
 * 
 * // 4. Delete data (soft delete)
 * const { data, error } = await supabase
 *   .from('cutting_jobs')
 *   .update({ deleted_at: new Date().toISOString() })
 *   .eq('id', jobId);
 * 
 * // 5. Upload file
 * const url = await uploadFile('scrap-photos', 'user-id/photo.jpg', file);
 * 
 * // 6. Subscribe to changes
 * const subscription = subscribeToTable('cutting_jobs', (payload) => {
 *   console.log('Job updated:', payload);
 * });
 */
