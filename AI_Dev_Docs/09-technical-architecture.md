# Business Onboarder — Technical Architecture

## Overview

A Next.js application with Supabase backend, using GPT-4o-mini for analysis and parsing. Real-time chat interface with background async processing.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14 (App Router) | React framework, SSR/SSG |
| Styling | Tailwind CSS | Utility-first styling |
| State | Zustand | Lightweight client state |
| Backend | Supabase | Auth, DB, Realtime, Edge Functions |
| AI | OpenAI GPT-4o-mini | Analyzers and parsers |
| Hosting | Vercel | Frontend hosting, Edge functions |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Next.js)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │
│  │    Chat     │  │  Progress   │  │ Foundation  │  │  Session  │  │
│  │    View     │  │   Panel     │  │  Dashboard  │  │  Manager  │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬─────┘  │
│         │                │                │                │        │
│         └────────────────┴────────────────┴────────────────┘        │
│                                   │                                  │
│                          ┌───────┴───────┐                          │
│                          │  Zustand      │                          │
│                          │  Store        │                          │
│                          └───────┬───────┘                          │
└──────────────────────────────────┼──────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
┌───────────────────────────────┐  ┌────────────────────────────────┐
│      SUPABASE REALTIME        │  │     API ROUTES (Next.js)       │
│  - Message subscriptions      │  │  /api/chat      → process msg  │
│  - Field update notifications │  │  /api/analyze   → trigger batch│
│  - Progress sync              │  │  /api/generate  → create output│
└───────────────────────────────┘  └───────────────┬────────────────┘
                                                   │
┌──────────────────────────────────────────────────┼──────────────────┐
│                         SUPABASE                 │                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┴───────┐         │
│  │   Auth      │  │  Database   │  │   Edge Functions    │         │
│  │             │  │  (Postgres) │  │   - Analyzer queue  │         │
│  │             │  │             │  │   - Parser queue    │         │
│  └─────────────┘  └─────────────┘  └──────────┬──────────┘         │
└───────────────────────────────────────────────┼────────────────────┘
                                                │
                                                ▼
                                   ┌────────────────────────┐
                                   │     OPENAI API         │
                                   │  - GPT-4o-mini         │
                                   │  - Analysis calls      │
                                   │  - Function calling    │
                                   └────────────────────────┘
```

---

## Directory Structure

```
business-onboarder/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Welcome page
│   │   ├── chat/
│   │   │   └── [sessionId]/
│   │   │       └── page.tsx      # Main conversation interface
│   │   ├── dashboard/
│   │   │   └── [businessId]/
│   │   │       └── page.tsx      # Foundation dashboard
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts      # Chat message handling
│   │   │   ├── analyze/
│   │   │   │   └── route.ts      # Trigger analysis batch
│   │   │   └── generate/
│   │   │       └── route.ts      # Generate outputs
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── InputBar.tsx
│   │   │   ├── TypingIndicator.tsx
│   │   │   └── interactions/
│   │   │       ├── WordBank.tsx
│   │   │       ├── SliderSet.tsx
│   │   │       ├── BinaryChoice.tsx
│   │   │       └── InferenceReveal.tsx
│   │   ├── progress/
│   │   │   ├── ProgressPanel.tsx
│   │   │   ├── BucketProgress.tsx
│   │   │   └── FieldStatus.tsx
│   │   └── dashboard/
│   │       ├── BucketCard.tsx
│   │       ├── FieldDisplay.tsx
│   │       └── OutputsSection.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # Browser client
│   │   │   ├── server.ts         # Server client
│   │   │   └── types.ts          # Generated types
│   │   ├── openai/
│   │   │   ├── client.ts
│   │   │   ├── analyzers/
│   │   │   │   ├── index.ts      # Analyzer registry
│   │   │   │   ├── customerEmpathy.ts
│   │   │   │   ├── valuesInferrer.ts
│   │   │   │   ├── voiceDetector.ts
│   │   │   │   └── completenessChecker.ts
│   │   │   └── parsers/
│   │   │       ├── index.ts      # Parser registry
│   │   │       ├── customerFields.ts
│   │   │       ├── valuesFields.ts
│   │   │       └── voiceFields.ts
│   │   └── flow/
│   │       ├── classifier.ts     # Message classification
│   │       ├── decider.ts        # Response decision logic
│   │       └── generator.ts      # Response generation
│   │
│   ├── store/
│   │   ├── sessionStore.ts       # Current session state
│   │   ├── chatStore.ts          # Messages, UI state
│   │   └── foundationStore.ts    # Field values, progress
│   │
│   ├── hooks/
│   │   ├── useChat.ts
│   │   ├── useSession.ts
│   │   ├── useFoundation.ts
│   │   └── useRealtimeSync.ts
│   │
│   └── config/
│       ├── buckets.ts            # Bucket definitions
│       ├── fields.ts             # Field definitions
│       ├── interactions.ts       # Interaction configs
│       └── prompts.ts            # System prompts
│
├── supabase/
│   ├── migrations/               # Database migrations
│   └── functions/
│       ├── process-analysis/     # Edge function: run analyzers
│       └── process-parsing/      # Edge function: parse to fields
│
└── public/
    └── ...
```

---

## Data Flow: Send Message

```
1. User types message, hits send
              │
              ▼
2. Client: Add message to local state (optimistic)
   Store: chatStore.addMessage(message)
              │
              ▼
3. Client: POST /api/chat
   Body: { sessionId, message, context }
              │
              ▼
4. API Route: 
   a. Save message to DB
   b. Run classifier (lightweight)
   c. Run response decider
   d. Generate response
   e. Check if analysis should trigger
              │
              ├─────────────────────────┐
              │                         │
              ▼                         ▼ (async)
5. Return response to client      6. Queue analysis job
   - Assistant message               Insert into analysis_jobs
   - Any interaction elements        with status: 'pending'
   - Progress updates
              │
              ▼
7. Client: Update UI
   - Display assistant message
   - Show interactions if any
   - Update progress panel
```

---

## Data Flow: Analysis Pipeline

```
1. Analysis job queued (from chat API)
              │
              ▼
2. Supabase Edge Function: process-analysis
   Triggered by: DB insert or cron (every 30s)
              │
              ▼
3. Fetch pending jobs
   Select from analysis_jobs WHERE status = 'pending'
              │
              ▼
4. For each job:
   a. Load conversation chunk (input_message_ids)
   b. Load analyzer prompt (by analyzer_type)
   c. Call OpenAI GPT-4o-mini
   d. Save prose output to analysis_jobs.output_analysis
   e. Update status: 'completed'
              │
              ▼
5. Trigger parsing job
   Insert into parsing_jobs
              │
              ▼
6. Supabase Edge Function: process-parsing
              │
              ▼
7. For each parsing job:
   a. Load analysis output
   b. Load parser schema (by analyzer_type)
   c. Call OpenAI with function calling
   d. Extract structured fields
   e. Update foundation_fields (if confidence > existing)
   f. Queue inference reveals (if confidence >= 7)
              │
              ▼
8. Realtime notification
   Client subscribed to foundation_fields changes
   UI updates progress panel
```

---

## Client State Management

### Zustand Stores

**sessionStore.ts**
```typescript
interface SessionState {
  sessionId: string | null;
  businessId: string | null;
  status: 'active' | 'paused' | 'completed';
  currentFocusBucket: string | null;
  
  // Actions
  initSession: (businessId: string) => Promise<void>;
  resumeSession: (sessionId: string) => Promise<void>;
  pauseSession: () => Promise<void>;
  setFocusBucket: (bucket: string) => void;
}
```

**chatStore.ts**
```typescript
interface ChatState {
  messages: Message[];
  isTyping: boolean;
  pendingInteraction: Interaction | null;
  
  // Actions
  addMessage: (message: Message) => void;
  setTyping: (typing: boolean) => void;
  setPendingInteraction: (interaction: Interaction | null) => void;
  sendMessage: (content: string, type?: MessageType) => Promise<void>;
}
```

**foundationStore.ts**
```typescript
interface FoundationState {
  fields: Record<string, FieldValue>;
  bucketCompletion: Record<string, number>;
  pendingInferences: InferenceReveal[];
  
  // Actions
  updateField: (fieldId: string, value: FieldValue) => void;
  processInference: (inferenceId: string, action: 'confirm' | 'reject' | 'edit', editedValue?: string) => void;
  calculateCompletion: () => void;
}
```

---

## Real-time Sync

```typescript
// hooks/useRealtimeSync.ts

export function useRealtimeSync(sessionId: string) {
  const updateField = useFoundationStore(s => s.updateField);
  const addInference = useFoundationStore(s => s.addInference);
  
  useEffect(() => {
    const supabase = createClient();
    
    // Subscribe to field updates
    const fieldChannel = supabase
      .channel('field-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'foundation_fields',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          updateField(payload.new.field_id, {
            value: payload.new.value,
            confidence: payload.new.confidence
          });
        }
      )
      .subscribe();
      
    // Subscribe to inference reveals
    const inferenceChannel = supabase
      .channel('inference-reveals')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'inference_reveals',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          addInference(payload.new);
        }
      )
      .subscribe();
      
    return () => {
      fieldChannel.unsubscribe();
      inferenceChannel.unsubscribe();
    };
  }, [sessionId, businessId]);
}
```

---

## API Route: Chat Handler

```typescript
// app/api/chat/route.ts

export async function POST(req: Request) {
  const { sessionId, message, interactionData } = await req.json();
  
  // 1. Save message
  const savedMessage = await saveMessage(sessionId, {
    role: 'user',
    content: message,
    interaction_data: interactionData
  });
  
  // 2. Classify message
  const classification = await classifyMessage(message, {
    sessionId,
    recentMessages: await getRecentMessages(sessionId, 5)
  });
  
  // 3. Extract direct fields (if any)
  if (classification.direct_extractions.length > 0) {
    await updateFields(sessionId, classification.direct_extractions);
  }
  
  // 4. Decide response
  const context = await buildContext(sessionId);
  const decision = await decideNextAction(classification, context);
  
  // 5. Generate response
  const response = await generateResponse(decision, context);
  
  // 6. Save assistant message
  await saveMessage(sessionId, {
    role: 'assistant',
    content: response.message,
    interaction_data: response.interaction
  });
  
  // 7. Maybe trigger analysis
  if (classification.should_trigger_analysis) {
    await queueAnalysis(sessionId, classification.buckets_touched);
  }
  
  // 8. Return response
  return Response.json({
    message: response.message,
    interaction: response.interaction,
    progress: await getProgress(sessionId)
  });
}
```

---

## Analyzer Registry Pattern

```typescript
// lib/openai/analyzers/index.ts

import { customerEmpathyAnalyzer } from './customerEmpathy';
import { valuesInferrerAnalyzer } from './valuesInferrer';
import { voiceDetectorAnalyzer } from './voiceDetector';
import { completenessCheckerAnalyzer } from './completenessChecker';

export const analyzers: Record<string, Analyzer> = {
  'customer_empathy': customerEmpathyAnalyzer,
  'values_inferrer': valuesInferrerAnalyzer,
  'voice_detector': voiceDetectorAnalyzer,
  'completeness_checker': completenessCheckerAnalyzer,
};

export interface Analyzer {
  id: string;
  name: string;
  triggerBuckets: string[];  // Which buckets trigger this analyzer
  prompt: (context: AnalyzerContext) => string;
  parser: string;  // Which parser to use for output
}

// Adding a new analyzer:
// 1. Create file in analyzers/
// 2. Export Analyzer object
// 3. Add to registry above
// 4. Add corresponding parser in parsers/
```

---

## Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# OpenAI
OPENAI_API_KEY=your-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Error Handling Strategy

**API Routes:**
- Wrap in try/catch
- Return consistent error shape: `{ error: string, code: string }`
- Log to monitoring (Sentry, etc.)

**Analysis Pipeline:**
- Jobs have `error_message` field
- Failed jobs can be retried
- Don't block chat on analysis failure

**Client:**
- Optimistic updates with rollback
- Toast notifications for errors
- Graceful degradation (progress panel works even if analysis fails)

---

## Performance Considerations

**Chat Response Time:**
- Target: < 2 seconds for response
- Classifier: lightweight, < 500ms
- Response generation: stream if possible

**Analysis Pipeline:**
- Batched, not per-message
- Edge functions for parallel processing
- Queue prevents overwhelming OpenAI API

**Database:**
- Indexes on hot paths (see schema doc)
- RLS for security without perf penalty
- Connection pooling via Supabase

---

*Document version: 1.0*
