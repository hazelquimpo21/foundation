/**
 * 🔍 Supabase Query Functions (Server-side)
 *
 * Server-side queries that bypass RLS using the admin client.
 * Use these ONLY in API routes and server actions.
 *
 * ⚠️ WARNING: Never import this file in client-side code!
 */

import { createAdminClient } from './admin';
import {
  OnboardingSession,
  ConversationMessage,
} from '@/lib/types';
import { log } from '@/lib/utils';

// ============================================
// 💬 Session Queries (Server)
// ============================================

/**
 * Get a session by ID (bypasses RLS).
 */
export async function getSessionServer(sessionId: string): Promise<OnboardingSession | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('onboarding_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) {
    log.error('Failed to fetch session', { sessionId, error });
    return null;
  }

  return data;
}

// ============================================
// 📝 Message Queries (Server)
// ============================================

/**
 * Get messages for a session (bypasses RLS).
 */
export async function getSessionMessagesServer(
  sessionId: string,
  limit: number = 50
): Promise<ConversationMessage[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('conversation_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('sequence', { ascending: true })
    .limit(limit);

  if (error) {
    log.error('Failed to fetch messages', error);
    throw error;
  }

  return data || [];
}

/**
 * Get recent messages for analysis (bypasses RLS).
 */
export async function getRecentMessagesServer(
  sessionId: string,
  count: number = 5
): Promise<ConversationMessage[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('conversation_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('sequence', { ascending: false })
    .limit(count);

  if (error) {
    log.error('Failed to fetch recent messages', error);
    throw error;
  }

  return (data || []).reverse();
}

/**
 * Save a new message (bypasses RLS).
 */
export async function saveMessageServer(
  sessionId: string,
  message: Omit<ConversationMessage, 'id' | 'session_id' | 'created_at' | 'sequence'>
): Promise<ConversationMessage> {
  const supabase = createAdminClient();

  // Get the next sequence number
  const { data: lastMessage } = await supabase
    .from('conversation_messages')
    .select('sequence')
    .eq('session_id', sessionId)
    .order('sequence', { ascending: false })
    .limit(1)
    .single();

  const nextSequence = (lastMessage?.sequence || 0) + 1;

  const { data, error } = await supabase
    .from('conversation_messages')
    .insert({
      ...message,
      session_id: sessionId,
      sequence: nextSequence,
    })
    .select()
    .single();

  if (error) {
    log.error('Failed to save message', error);
    throw error;
  }

  return data;
}

