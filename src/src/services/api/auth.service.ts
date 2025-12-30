/**
 * AUTHENTICATION SERVICE
 * 
 * Handles all authentication operations
 * - Sign in / Sign out
 * - Session management
 * - User profile
 * - Password reset
 * 
 * @module services/api/auth.service
 */

import { supabase, parseSupabaseError } from '../../config/supabase';
import type { User } from '../../types/index';

// ============================================================================
// TYPES
// ============================================================================

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  full_name: string;
  employee_id: string;
  department: string;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

export interface SessionInfo {
  user: User | null;
  expiresAt: string | null;
  isAuthenticated: boolean;
}

// ============================================================================
// AUTHENTICATION SERVICE CLASS
// ============================================================================

class AuthService {
  /**
   * Sign in with email and password
   * @param credentials - Email and password
   * @returns User object or error
   */
  async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    try {
      // Step 1: Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        return {
          user: null,
          error: parseSupabaseError(authError),
        };
      }

      if (!authData.user) {
        return {
          user: null,
          error: 'Authentication failed',
        };
      }

      // Step 2: Fetch user profile from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .eq('is_active', true)
        .is('deleted_at', null)
        .single();

      if (userError) {
        // Sign out if user profile fetch fails
        await supabase.auth.signOut();
        return {
          user: null,
          error: 'User profile not found or inactive',
        };
      }

      // Step 3: Update last_login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', authData.user.id);

      return {
        user: userData as User,
        error: null,
      };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return {
        user: null,
        error: parseSupabaseError(error),
      };
    }
  }

  /**
   * Sign out current user
   * @returns Error if any
   */
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { error: parseSupabaseError(error) };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { error: parseSupabaseError(error) };
    }
  }

  /**
   * Get current session information
   * @returns Session info including user and expiration
   */
  async getSession(): Promise<SessionInfo> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        return {
          user: null,
          expiresAt: null,
          isAuthenticated: false,
        };
      }

      // Fetch user profile
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .eq('is_active', true)
        .is('deleted_at', null)
        .single();

      return {
        user: userData as User,
        expiresAt: session.expires_at || null,
        isAuthenticated: true,
      };
    } catch (error: any) {
      console.error('Get session error:', error);
      return {
        user: null,
        expiresAt: null,
        isAuthenticated: false,
      };
    }
  }

  /**
   * Get current authenticated user
   * @returns User object or null
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        return null;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .eq('is_active', true)
        .is('deleted_at', null)
        .single();

      if (userError) {
        return null;
      }

      return userData as User;
    } catch (error: any) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   * @param userId - User ID
   * @param updates - Fields to update
   * @returns Updated user or error
   */
  async updateProfile(
    userId: string,
    updates: Partial<Pick<User, 'full_name' | 'email' | 'department' | 'shift'>>
  ): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return {
          user: null,
          error: parseSupabaseError(error),
        };
      }

      return {
        user: data as User,
        error: null,
      };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return {
        user: null,
        error: parseSupabaseError(error),
      };
    }
  }

  /**
   * Request password reset email
   * @param email - User email
   * @returns Error if any
   */
  async requestPasswordReset(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { error: parseSupabaseError(error) };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Password reset request error:', error);
      return { error: parseSupabaseError(error) };
    }
  }

  /**
   * Update password
   * @param newPassword - New password
   * @returns Error if any
   */
  async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error: parseSupabaseError(error) };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Update password error:', error);
      return { error: parseSupabaseError(error) };
    }
  }

  /**
   * Check if user has minimum role level
   * @param user - User object
   * @param minRole - Minimum required role
   * @returns boolean
   */
  hasMinRole(user: User | null, minRole: 'OPERATOR' | 'SUPERVISOR' | 'MANAGER' | 'ADMIN'): boolean {
    if (!user) return false;

    const roleHierarchy = {
      OPERATOR: 1,
      SUPERVISOR: 2,
      MANAGER: 3,
      ADMIN: 4,
    };

    const userLevel = roleHierarchy[user.role];
    const minLevel = roleHierarchy[minRole];

    return userLevel >= minLevel;
  }

  /**
   * Subscribe to authentication state changes
   * @param callback - Callback function
   * @returns Unsubscribe function
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Fetch full user profile
          const user = await this.getCurrentUser();
          callback(user);
        } else {
          callback(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const authService = new AuthService();
export default authService;

/**
 * USAGE EXAMPLES:
 * 
 * // 1. Sign in
 * const { user, error } = await authService.signIn({
 *   email: 'user@example.com',
 *   password: 'password123'
 * });
 * 
 * // 2. Sign out
 * const { error } = await authService.signOut();
 * 
 * // 3. Get current user
 * const user = await authService.getCurrentUser();
 * 
 * // 4. Check permissions
 * const canApprove = authService.hasMinRole(user, 'SUPERVISOR');
 * 
 * // 5. Subscribe to auth changes
 * const unsubscribe = authService.onAuthStateChange((user) => {
 *   console.log('User changed:', user);
 * });
 * 
 * // Clean up
 * unsubscribe();
 */
