/**
 * 💬 Session Store
 *
 * Manages the current onboarding session state.
 * Handles session lifecycle (start, pause, resume, complete).
 *
 * NOTE: In demo mode, the store fetches data from API routes
 * which bypass RLS using the admin client.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { OnboardingSession, Business, SessionStatus } from '@/lib/types';
import { log } from '@/lib/utils';

// ============================================
// 📦 Store Types
// ============================================

interface SessionState {
  // Data
  business: Business | null;
  session: OnboardingSession | null;
  currentBucket: string;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  initializeSession: (userId: string, businessName?: string) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  resumeOrCreateSession: (businessId: string) => Promise<void>;
  updateBucket: (bucketId: string) => void;
  pauseSession: () => Promise<void>;
  completeSession: () => Promise<void>;
  reset: () => void;
}

// ============================================
// 🏗️ Store Implementation
// ============================================

export const useSessionStore = create<SessionState>()(
  devtools(
    (set, get) => ({
      // Initial state
      business: null,
      session: null,
      currentBucket: 'basics',
      isLoading: false,
      error: null,

      /**
       * Initialize a new session with a new business.
       * NOTE: In demo mode, use the home page flow which calls the API.
       * This function is kept for future authenticated flow.
       */
      initializeSession: async (_userId: string, _businessName?: string) => {
        // In demo mode, sessions are created via the API from the home page.
        // This function would be used when we add proper authentication.
        log.warn('initializeSession should use API route in demo mode');
        throw new Error('Use home page to create sessions in demo mode');
      },

      /**
       * Load an existing session by ID.
       * Fetches from API to bypass RLS in demo mode.
       */
      loadSession: async (sessionId: string) => {
        log.info('📂 Loading session', { sessionId });
        set({ isLoading: true, error: null });

        try {
          // Fetch session from API (bypasses RLS)
          const response = await fetch(`/api/session?id=${sessionId}`);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Session not found');
          }

          const data = await response.json();
          const { session, business } = data;

          if (!session) {
            throw new Error('Session not found');
          }

          if (!business) {
            throw new Error('Business not found');
          }

          set({
            session,
            business,
            currentBucket: session.current_focus_bucket || 'basics',
            isLoading: false,
          });

          log.info('✅ Session loaded', {
            sessionId: session.id,
            status: session.status,
            bucket: session.current_focus_bucket,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load session';
          log.error('❌ Session load failed', { error });
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      /**
       * Resume an existing session or create a new one for a business.
       * NOTE: In demo mode, use loadSession instead.
       */
      resumeOrCreateSession: async (_businessId: string) => {
        // In demo mode, sessions are loaded via loadSession.
        // This function would be used when we add proper authentication.
        log.warn('resumeOrCreateSession should use loadSession in demo mode');
        throw new Error('Use loadSession in demo mode');
      },

      /**
       * Update the current focus bucket.
       * Updates local state only - persistence would go through API.
       */
      updateBucket: (bucketId: string) => {
        log.info('📦 Bucket updated', { from: get().currentBucket, to: bucketId });
        set({ currentBucket: bucketId });
        // TODO: Add API call to persist bucket update when needed
      },

      /**
       * Pause the current session.
       * Updates local state only - persistence would go through API.
       */
      pauseSession: async () => {
        const { session } = get();
        if (!session) {
          log.warn('No session to pause');
          return;
        }

        log.info('⏸️ Pausing session', { sessionId: session.id });
        set({
          session: { ...session, status: 'paused' },
        });
        // TODO: Add API call to persist status when needed
      },

      /**
       * Mark the session as complete.
       * Updates local state only - persistence would go through API.
       */
      completeSession: async () => {
        const { session } = get();
        if (!session) {
          log.warn('No session to complete');
          return;
        }

        log.info('✅ Completing session', { sessionId: session.id });
        set({
          session: { ...session, status: 'completed' },
        });
        // TODO: Add API call to persist status when needed
      },

      /**
       * Reset the store to initial state.
       */
      reset: () => {
        log.info('🔄 Resetting session store');
        set({
          business: null,
          session: null,
          currentBucket: 'basics',
          isLoading: false,
          error: null,
        });
      },
    }),
    { name: 'session-store' }
  )
);

// ============================================
// 🎣 Selector Hooks
// ============================================

/** Get just the session ID */
export const useSessionId = () => useSessionStore((s) => s.session?.id);

/** Get just the business ID */
export const useBusinessId = () => useSessionStore((s) => s.business?.id);

/** Get the business name */
export const useBusinessName = () =>
  useSessionStore((s) => s.business?.name || 'Your Business');

/** Check if session is active */
export const useIsSessionActive = () =>
  useSessionStore((s) => s.session?.status === 'active');
