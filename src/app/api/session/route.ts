/**
 * 💬 Session API Route
 *
 * Handles session creation and management.
 *
 * POST /api/session - Create a new session
 * GET /api/session?id=xxx - Get session details
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { log } from '@/lib/utils';

// ============================================
// 🔧 Route Configuration
// ============================================

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================
// 📨 POST Handler - Create Session
// ============================================

export async function POST(request: NextRequest) {
  log.info('🆕 Creating new session');

  try {
    const body = await request.json();
    const { businessName = 'My Business' } = body;

    const supabase = await createServerSupabase();

    // Check if user is authenticated
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;

    // Determine which client to use:
    // - If authenticated, use server client (respects RLS)
    // - If demo mode, use admin client (bypasses RLS)
    const isDemoMode = !userId;
    
    if (isDemoMode) {
      log.info('📋 No authenticated user - using demo mode with admin client');
    }

    // Use admin client for demo mode to bypass RLS
    // In production with auth, this would use the regular server client
    const dbClient = isDemoMode ? createAdminClient() : supabase;
    
    let effectiveUserId = userId;

    // For demo mode, create a demo user first (required due to FK constraint)
    if (isDemoMode) {
      const demoEmail = `demo-${crypto.randomUUID()}@demo.local`;
      const { data: demoUser, error: userError } = await dbClient
        .from('users')
        .insert({ email: demoEmail })
        .select()
        .single();

      if (userError) {
        log.error('❌ Failed to create demo user', { error: userError });
        return NextResponse.json(
          { error: 'Failed to create demo user', details: userError.message },
          { status: 500 }
        );
      }

      effectiveUserId = demoUser.id;
      log.info('👤 Demo user created', { userId: effectiveUserId });
    }

    // Create business
    const { data: business, error: businessError } = await dbClient
      .from('businesses')
      .insert({
        user_id: effectiveUserId,
        name: businessName,
        status: 'active',
      })
      .select()
      .single();

    if (businessError) {
      log.error('❌ Failed to create business', { error: businessError });
      return NextResponse.json(
        { error: 'Failed to create business', details: businessError.message },
        { status: 500 }
      );
    }

    log.info('🏢 Business created', { businessId: business.id });

    // Create session
    const { data: session, error: sessionError } = await dbClient
      .from('onboarding_sessions')
      .insert({
        business_id: business.id,
        status: 'active',
        current_focus_bucket: 'basics',
      })
      .select()
      .single();

    if (sessionError) {
      log.error('❌ Failed to create session', { error: sessionError });
      return NextResponse.json(
        { error: 'Failed to create session', details: sessionError.message },
        { status: 500 }
      );
    }

    log.info('✅ Session created', {
      sessionId: session.id,
      businessId: business.id,
      demoMode: isDemoMode,
    });

    return NextResponse.json({
      session,
      business,
    });

  } catch (error) {
    log.error('❌ Session creation error', { error });
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create session', details: message },
      { status: 500 }
    );
  }
}

// ============================================
// 📥 GET Handler - Get Session
// ============================================

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('id');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID required' },
      { status: 400 }
    );
  }

  log.info('📂 Fetching session', { sessionId });

  try {
    const supabase = await createServerSupabase();

    // Check if user is authenticated
    const { data: authData } = await supabase.auth.getUser();
    const isAuthenticated = !!authData?.user?.id;

    // Use admin client for demo mode to bypass RLS
    const dbClient = isAuthenticated ? supabase : createAdminClient();

    // Fetch session with business
    const { data: session, error: sessionError } = await dbClient
      .from('onboarding_sessions')
      .select(`
        *,
        business:businesses(*)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      log.error('❌ Session not found', { sessionId, error: sessionError });
      return NextResponse.json(
        { error: 'Session not found', details: sessionError?.message },
        { status: 404 }
      );
    }

    // Fetch messages
    const { data: messages } = await dbClient
      .from('conversation_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('sequence', { ascending: true });

    log.info('✅ Session fetched', {
      sessionId,
      messageCount: messages?.length || 0,
    });

    return NextResponse.json({
      session,
      business: session.business,
      messages: messages || [],
    });

  } catch (error) {
    log.error('❌ Session fetch error', { error });
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch session', details: message },
      { status: 500 }
    );
  }
}
