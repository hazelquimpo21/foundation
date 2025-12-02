/**
 * 🔑 Supabase Admin Client
 *
 * Admin client that bypasses RLS.
 * Used for server-side operations without user authentication.
 *
 * ⚠️ WARNING: This client bypasses RLS - use only in API routes!
 */

import { createClient } from '@supabase/supabase-js';
import { log } from '@/lib/utils';

// ============================================
// 🔧 Environment Variables
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ============================================
// 🔑 Admin Client (bypasses RLS)
// ============================================

/**
 * Create an admin Supabase client that bypasses RLS.
 *
 * ⚠️ WARNING: Only use this for:
 * - API routes (server-side only)
 * - Background jobs
 * - Admin operations
 *
 * NEVER import this module in client-side code!
 *
 * @example
 * // In an API route
 * const supabase = createAdminClient();
 * await supabase.from('businesses').insert({ ... });
 */
export function createAdminClient() {
  if (!supabaseUrl) {
    throw new Error(
      '❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable.\n' +
      '   Please add it to your .env.local file.\n' +
      '   Get it from: Supabase Dashboard > Settings > API'
    );
  }

  if (!supabaseServiceKey) {
    throw new Error(
      '❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable.\n' +
      '   This is required for admin/server operations.\n' +
      '   Get it from: Supabase Dashboard > Settings > API'
    );
  }

  log.debug('Creating Supabase admin client (bypasses RLS)');

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

