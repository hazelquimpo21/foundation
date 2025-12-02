# Business Onboarder — Session & State Management

## Overview

How we manage conversation sessions, persist state, handle pause/resume, and maintain data consistency across the application.

---

## Session Lifecycle

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   CREATE    │────▶│   ACTIVE    │────▶│   PAUSED    │────▶│  COMPLETED  │
│             │     │             │     │             │     │             │
└─────────────┘     └──────┬──────┘     └──────┬──────┘     └─────────────┘
                           │                   │
                           │    ┌──────────────┘
                           │    │
                           ▼    ▼
                    ┌─────────────┐
                    │  ABANDONED  │
                    │  (30 days)  │
                    └─────────────┘
```

### Status Definitions

| Status | Description | Transition Triggers |
|--------|-------------|---------------------|
| `active` | Currently in use | Created, resumed |
| `paused` | Temporarily inactive | Inactivity timeout, explicit pause |
| `completed` | Foundation finished | User marks done, all required fields filled |
| `abandoned` | Inactive for 30+ days | Cron job cleanup |

---

## Session Creation

```typescript
// lib/session/create.ts

interface CreateSessionParams {
  userId: string;
  businessId?: string;  // Existing business, or create new
  businessName?: string;  // If creating new business
}

async function createSession(params: CreateSessionParams): Promise<Session> {
  const supabase = createServerClient();
  
  // Create or get business
  let businessId = params.businessId;
  if (!businessId) {
    const { data: business } = await supabase
      .from('businesses')
      .insert({
        user_id: params.userId,
        name: params.businessName || 'Untitled Business',
        status: 'active'
      })
      .select()
      .single();
    businessId = business.id;
  }
  
  // Create session
  const { data: session } = await supabase
    .from('onboarding_sessions')
    .insert({
      business_id: businessId,
      status: 'active',
      current_focus_bucket: 'basics'
    })
    .select()
    .single();
  
  // Initialize first message
  await supabase
    .from('conversation_messages')
    .insert({
      session_id: session.id,
      sequence: 1,
      role: 'assistant',
      content: OPENING_MESSAGE,
      message_type: 'text'
    });
  
  return session;
}
```

---

## Session Resume

### Resume Flow

```
1. User returns to app
          │
          ▼
2. Check for existing sessions
   - Same business? Resume most recent
   - Multiple paused? Show picker
          │
          ▼
3. Load session context
   - Conversation history
   - Field states
   - Session summary
          │
          ▼
4. Generate re-entry message
   - Acknowledge return
   - Summarize where we were
   - Offer to continue or redirect
          │
          ▼
5. Update session status: 'active'
   Update last_active_at
```

### Resume Implementation

```typescript
// lib/session/resume.ts

async function resumeSession(sessionId: string): Promise<ResumeContext> {
  const supabase = createServerClient();
  
  // Load session
  const { data: session } = await supabase
    .from('onboarding_sessions')
    .select(`
      *,
      business:businesses(*),
      messages:conversation_messages(*)
    `)
    .eq('id', sessionId)
    .single();
  
  // Load field states
  const { data: fields } = await supabase
    .from('foundation_fields')
    .select('*')
    .eq('business_id', session.business_id);
  
  // Generate re-entry context
  const reentryMessage = await generateReentryMessage({
    businessName: session.business.name,
    lastTopic: session.current_focus_bucket,
    summary: session.conversation_summary,
    timeSinceActive: Date.now() - new Date(session.last_active_at).getTime()
  });
  
  // Update session
  await supabase
    .from('onboarding_sessions')
    .update({
      status: 'active',
      last_active_at: new Date().toISOString()
    })
    .eq('id', sessionId);
  
  // Add re-entry message
  await addMessage(sessionId, {
    role: 'assistant',
    content: reentryMessage,
    message_type: 'text'
  });
  
  return {
    session,
    fields,
    messages: session.messages,
    reentryMessage
  };
}
```

### Re-entry Message Generation

```typescript
// lib/session/reentry.ts

async function generateReentryMessage(context: ReentryContext): Promise<string> {
  const timeSince = formatTimeSince(context.timeSinceActive);
  
  // Short absence (< 1 hour): minimal acknowledgment
  if (context.timeSinceActive < 60 * 60 * 1000) {
    return `Welcome back! Ready to continue?`;
  }
  
  // Medium absence (< 24 hours): brief summary
  if (context.timeSinceActive < 24 * 60 * 60 * 1000) {
    return `Welcome back! We were working on your ${context.lastTopic}. 
            ${context.summary || 'Ready to pick up where we left off?'}`;
  }
  
  // Long absence (> 24 hours): fuller context restoration
  const prompt = `
    Generate a warm re-entry message for someone returning to their brand 
    foundation conversation after ${timeSince}.
    
    Business: ${context.businessName}
    Last topic: ${context.lastTopic}
    Summary: ${context.summary}
    
    The message should:
    1. Welcome them back warmly
    2. Briefly remind them where they were
    3. Offer to continue OR start fresh
    
    Keep it under 3 sentences.
  `;
  
  return await generateWithGPT(prompt);
}
```

---

## Session Pause

### Automatic Pause

Triggers:
- 15 minutes of inactivity
- Browser tab closed (detected via beforeunload + server heartbeat)
- Explicit "Save & Exit" button

```typescript
// lib/session/pause.ts

async function pauseSession(sessionId: string, reason: 'inactivity' | 'explicit' | 'disconnect'): Promise<void> {
  const supabase = createServerClient();
  
  // Generate summary before pausing
  const summary = await generateSessionSummary(sessionId);
  
  // Update session
  await supabase
    .from('onboarding_sessions')
    .update({
      status: 'paused',
      conversation_summary: summary,
      session_metadata: {
        pause_reason: reason,
        paused_at: new Date().toISOString()
      }
    })
    .eq('id', sessionId);
  
  // Ensure any pending analysis completes
  await flushAnalysisQueue(sessionId);
}
```

### Session Summary Generation

```typescript
async function generateSessionSummary(sessionId: string): Promise<string> {
  const messages = await getMessages(sessionId);
  const fields = await getFieldStates(sessionId);
  
  const prompt = `
    Summarize this brand foundation conversation for context restoration.
    
    Business: ${businessName}
    
    Conversation (last 10 messages):
    ${formatMessages(messages.slice(-10))}
    
    Current field states:
    ${formatFieldStates(fields)}
    
    Write a 2-3 sentence summary covering:
    1. What's been established
    2. What we were just discussing
    3. Natural next step
    
    Keep it concise—this is for the AI to restore context, not for the user to read.
  `;
  
  return await generateWithGPT(prompt);
}
```

---

## Session Completion

### Completion Triggers

```typescript
function isSessionComplete(fields: FieldState[], context: SessionContext): boolean {
  // All required buckets above threshold
  const requiredComplete = REQUIRED_BUCKETS.every(bucket => {
    const completion = calculateBucketCompletion(bucket, fields);
    return completion >= bucket.minCompletionPercent;
  });
  
  if (!requiredComplete) return false;
  
  // User explicitly marked done
  if (context.userMarkedComplete) return true;
  
  // Natural endpoint reached
  if (context.allBucketsAbove70 && context.reachedNaturalEnd) return true;
  
  return false;
}
```

### Completion Flow

```typescript
async function completeSession(sessionId: string): Promise<void> {
  const supabase = createServerClient();
  
  // Generate all outputs
  const businessId = await getBusinessId(sessionId);
  await generateAllOutputs(businessId);
  
  // Generate final summary
  const summary = await generateCompletionSummary(sessionId);
  
  // Update session
  await supabase
    .from('onboarding_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      conversation_summary: summary
    })
    .eq('id', sessionId);
  
  // Update business
  await supabase
    .from('businesses')
    .update({
      status: 'active',  // Foundation complete
      updated_at: new Date().toISOString()
    })
    .eq('id', businessId);
}
```

---

## Client-Side State Sync

### Heartbeat System

```typescript
// hooks/useSessionHeartbeat.ts

export function useSessionHeartbeat(sessionId: string) {
  useEffect(() => {
    // Update last_active_at every 60 seconds
    const interval = setInterval(async () => {
      await fetch('/api/session/heartbeat', {
        method: 'POST',
        body: JSON.stringify({ sessionId })
      });
    }, 60 * 1000);
    
    // Handle page close
    const handleBeforeUnload = () => {
      navigator.sendBeacon('/api/session/pause', 
        JSON.stringify({ sessionId, reason: 'disconnect' })
      );
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionId]);
}
```

### Optimistic Updates

```typescript
// store/chatStore.ts

const sendMessage = async (content: string) => {
  // Optimistic: add message immediately
  const tempId = `temp-${Date.now()}`;
  set(state => ({
    messages: [...state.messages, {
      id: tempId,
      role: 'user',
      content,
      pending: true
    }]
  }));
  
  try {
    // Send to server
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ sessionId, content })
    });
    
    const data = await response.json();
    
    // Replace temp message with real one
    set(state => ({
      messages: state.messages.map(m => 
        m.id === tempId ? { ...data.userMessage, pending: false } : m
      )
    }));
    
    // Add assistant response
    set(state => ({
      messages: [...state.messages, data.assistantMessage]
    }));
    
  } catch (error) {
    // Rollback on failure
    set(state => ({
      messages: state.messages.filter(m => m.id !== tempId)
    }));
    throw error;
  }
};
```

---

## Data Consistency

### Field Update Rules

```typescript
// lib/fields/update.ts

async function updateField(
  businessId: string, 
  fieldId: string, 
  newValue: FieldValue
): Promise<void> {
  const supabase = createServerClient();
  
  // Get existing field
  const { data: existing } = await supabase
    .from('foundation_fields')
    .select('*')
    .eq('business_id', businessId)
    .eq('field_id', fieldId)
    .single();
  
  // Decide whether to update
  const shouldUpdate = 
    !existing ||  // No existing value
    newValue.confidence > existing.confidence ||  // Higher confidence
    newValue.source_type === 'direct_input' ||  // User input always wins
    newValue.source_type === 'confirmed_inference';  // Confirmed > inferred
  
  if (!shouldUpdate) return;
  
  // Upsert field
  await supabase
    .from('foundation_fields')
    .upsert({
      business_id: businessId,
      field_id: fieldId,
      value: newValue.value,
      confidence: newValue.confidence,
      source_type: newValue.source_type,
      source_message_ids: newValue.source_message_ids,
      updated_at: new Date().toISOString()
    });
}
```

### Conflict Resolution

| Scenario | Resolution |
|----------|------------|
| Two analyzers update same field | Higher confidence wins |
| User edits inferred value | User edit always wins |
| Old inference vs new inference | More recent wins if same confidence |
| Direct input vs inference | Direct input wins |

---

## Session Cleanup

### Abandoned Session Handling

```sql
-- Cron job: runs daily

-- Mark sessions as abandoned
UPDATE onboarding_sessions
SET status = 'abandoned'
WHERE status = 'paused'
  AND last_active_at < NOW() - INTERVAL '30 days';

-- Optionally: archive old abandoned sessions
-- (Move to archive table, delete from main)
```

### Data Retention Policy

| Data Type | Retention | Notes |
|-----------|-----------|-------|
| Active sessions | Indefinite | Until completed or abandoned |
| Completed sessions | Indefinite | User's foundation |
| Abandoned sessions | 90 days | Then archived |
| Conversation history | With session | Deleted when session archived |
| Analysis jobs | 30 days | Can be regenerated |

---

## Multi-Device Considerations

### Concurrent Session Prevention

```typescript
// middleware.ts or API route

async function checkConcurrentSession(sessionId: string, deviceId: string) {
  const session = await getSession(sessionId);
  
  if (session.active_device_id && session.active_device_id !== deviceId) {
    // Another device is active
    const lastActive = new Date(session.last_active_at);
    const now = new Date();
    
    if (now.getTime() - lastActive.getTime() < 60 * 1000) {
      // Active within last minute - block
      throw new Error('SESSION_IN_USE_ELSEWHERE');
    }
    
    // Inactive - allow takeover
  }
  
  // Claim session for this device
  await updateSession(sessionId, { active_device_id: deviceId });
}
```

### Sync on Return

When user returns to a session that was modified elsewhere:

1. Fetch latest messages
2. Fetch latest field states  
3. Highlight what changed ("Since you were last here, we captured...")
4. Resume from current state

---

## Error Recovery

### Partial Message Failure

```typescript
// If message saves but response fails:
// - Message is saved with 'pending_response' flag
// - On next load, detect and regenerate response
// - Or show "Something went wrong, let me try again"

async function recoverPendingMessages(sessionId: string) {
  const pending = await getMessages(sessionId, { pending_response: true });
  
  for (const message of pending) {
    try {
      await regenerateResponse(sessionId, message.id);
    } catch {
      await markMessageFailed(message.id);
    }
  }
}
```

### Analysis Pipeline Recovery

```typescript
// Analysis jobs have retry logic built in
// See Technical Architecture doc for details

async function retryFailedAnalysis(sessionId: string) {
  const failed = await supabase
    .from('analysis_jobs')
    .select('*')
    .eq('session_id', sessionId)
    .eq('status', 'failed')
    .lt('retry_count', 3);
  
  for (const job of failed.data) {
    await requeueAnalysis(job.id);
  }
}
```

---

*Document version: 1.0*
