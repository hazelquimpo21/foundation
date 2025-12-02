# Business Onboarder — Conversation Flow Specification

## Overview

This document defines how the conversation progresses—what triggers what, how we decide what to ask next, and how the various system components interact.

This is **not a state machine**. It's a priority-based flow controller that responds to context.

---

## Flow Controller Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     USER SENDS MESSAGE                        │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                  1. MESSAGE CLASSIFIER                        │
│  - Which buckets does this touch?                            │
│  - Any direct field values to extract?                       │
│  - Message type (open response, interaction response, etc.)  │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                  2. RESPONSE DECIDER                          │
│  - What's the highest priority next action?                  │
│  - Should we show an inference reveal?                       │
│  - Should we continue current thread or transition?          │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                  3. RESPONSE GENERATOR                        │
│  - Generate conversational response                          │
│  - Include any interactive elements                          │
│  - Update UI state (progress, focus)                         │
└─────────────────────────────┬────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼ (async)
┌──────────────────────────┐    ┌──────────────────────────┐
│   RETURN TO USER         │    │   BACKGROUND PIPELINE    │
│   (immediate)            │    │   - Queue for analysis   │
└──────────────────────────┘    │   - Run analyzers        │
                                │   - Parse to fields      │
                                │   - Queue inferences     │
                                └──────────────────────────┘
```

---

## 1. Message Classifier

Runs on every user message to understand what we received.

### Classification Output

```typescript
interface MessageClassification {
  // Which buckets does this message provide signal for?
  buckets_touched: string[];  // ['customers', 'values']
  
  // Can we extract direct field values?
  direct_extractions: {
    field_id: string;
    value: string;
    confidence: number;
  }[];
  
  // What type of response is this?
  response_type: 
    | 'open_response'        // Free text answer
    | 'word_bank_selection'  // Selected from word bank
    | 'slider_response'      // Adjusted sliders
    | 'binary_choice'        // Picked A or B
    | 'inference_confirm'    // Confirmed an inference
    | 'inference_reject'     // Rejected an inference
    | 'inference_edit'       // Edited an inference
    | 'question'             // User asking us something
    | 'tangent'              // Off-topic but potentially relevant
    | 'meta';                // About the process itself
    
  // Sentiment/energy
  engagement_signal: 'high' | 'medium' | 'low' | 'frustrated';
  
  // Is this a substantial response worth analyzing?
  should_trigger_analysis: boolean;
}
```

### Classifier Prompt (Lightweight)

```
Classify this user message in the context of a brand foundation conversation.

Current context:
- Business: {business_name}
- Current focus: {current_bucket}
- Last question asked: {last_question}

User message: "{message}"

Respond with JSON classification only.
```

---

## 2. Response Decider

Priority-based decision tree for what to do next.

### Priority Order

```typescript
const decideNextAction = (context: ConversationContext): NextAction => {
  
  // PRIORITY 1: Handle user questions
  if (classification.response_type === 'question') {
    return { type: 'answer_question', question: message };
  }
  
  // PRIORITY 2: Acknowledge inference responses
  if (classification.response_type.startsWith('inference_')) {
    return { 
      type: 'process_inference_response',
      action: classification.response_type 
    };
  }
  
  // PRIORITY 3: Show ready inference reveals
  if (pendingInferences.length > 0 && shouldShowInference(context)) {
    return {
      type: 'show_inference',
      inference: selectBestInference(pendingInferences)
    };
  }
  
  // PRIORITY 4: Follow current thread
  if (currentThreadNeedsFollowUp(context)) {
    return {
      type: 'follow_up',
      topic: context.current_focus_bucket
    };
  }
  
  // PRIORITY 5: Transition when current bucket is sufficient
  if (shouldTransitionBucket(context)) {
    return {
      type: 'transition',
      from: context.current_focus_bucket,
      to: selectNextBucket(context)
    };
  }
  
  // PRIORITY 6: Fill highest-value gap
  return {
    type: 'fill_gap',
    target: selectHighestValueGap(context)
  };
};
```

### Decision Helpers

**shouldShowInference()**
```typescript
const shouldShowInference = (context) => {
  // Don't interrupt flow too frequently
  if (context.messages_since_last_inference < 3) return false;
  
  // Don't show if user seems frustrated
  if (context.recent_engagement === 'frustrated') return false;
  
  // Show if we have high-confidence inference
  if (pendingInferences.some(i => i.confidence >= 7)) return true;
  
  // Show at natural pause points
  if (context.at_bucket_transition) return true;
  
  return false;
};
```

**shouldTransitionBucket()**
```typescript
const shouldTransitionBucket = (context) => {
  const currentCompletion = getBucketCompletion(context.current_focus_bucket);
  
  // Bucket is complete enough
  if (currentCompletion >= 70) return true;
  
  // User is losing engagement on this topic
  if (context.consecutive_short_responses >= 3) return true;
  
  // User explicitly wants to move on
  if (context.user_requested_skip) return true;
  
  return false;
};
```

**selectNextBucket()**
```typescript
const selectNextBucket = (context) => {
  const incomplete = getIncompleteBuckets(context);
  
  // Respect tier order for required buckets
  const nextRequired = incomplete
    .filter(b => b.is_required && b.completion < 50)
    .sort((a, b) => a.tier - b.tier)[0];
    
  if (nextRequired) return nextRequired.id;
  
  // Otherwise, pick highest value gap
  return incomplete.sort((a, b) => b.value_score - a.value_score)[0]?.id;
};
```

---

## 3. Response Generator

Generates the actual message based on decided action.

### Response Types

**follow_up**
```typescript
// Continue exploring current topic
const prompt = `
You're having a warm, conversational discussion about ${bucket} with a founder.

They just said: "${lastUserMessage}"

Context:
- Business: ${businessName}
- What we know so far: ${bucketSummary}
- What we still need: ${bucketGaps}

Generate a natural follow-up that:
1. Acknowledges what they shared (briefly, don't parrot)
2. Either digs deeper OR moves to the next aspect of this topic
3. Feels like a conversation, not an interview

If appropriate, include ONE of these interaction types:
- Word bank (only if asking about personality/values/preferences)
- Slider (only if asking about spectrums)
- Binary choice (only for quick gut checks)

Respond with JSON: { "message": "...", "interaction": null | {...} }
`;
```

**transition**
```typescript
// Move to new bucket with natural bridge
const prompt = `
You're transitioning a brand foundation conversation from ${fromBucket} to ${toBucket}.

What we established in ${fromBucket}:
${bucketSummary}

Generate a brief transition that:
1. Summarizes/validates what we learned (1 sentence)
2. Naturally bridges to the new topic
3. Opens with an easy first question for the new bucket

Keep it warm and conversational. Don't make it feel like a form section change.
`;
```

**show_inference**
```typescript
// Present an inference for confirmation
// This is structured, not generated—use templates
const inferenceReveal = {
  message: `Based on what you've shared, here's what I'm picking up about ${field.display_name}:`,
  card: {
    type: 'inference_reveal',
    field: inference.field_id,
    content: inference.display_text,
    actions: ['confirm', 'close_but', 'not_quite']
  }
};
```

**fill_gap**
```typescript
// Ask about a specific gap
const prompt = `
You need to learn about ${gap.field_display_name} for a brand foundation.

Context:
- Business: ${businessName}
- Related info we have: ${relatedFields}
- Previous conversation: ${recentMessages}

Generate a conversational question that:
1. Flows naturally from the conversation
2. Makes this easy to answer (not blank-page intimidating)
3. Could include an interaction element if appropriate

Don't be abrupt. Bridge from what they said or acknowledge the topic shift.
`;
```

---

## Interaction Flow Examples

### Example: Word Bank Flow

```
SYSTEM: What words describe your ideal customer's mindset?
        [Word Bank: Ambitious, Overwhelmed, Skeptical, ...]

USER:   [Selects: Ambitious, Overwhelmed, Skeptical, Action-oriented]

CLASSIFIER:
  - response_type: 'word_bank_selection'
  - buckets_touched: ['customers']
  - direct_extractions: [{ field: 'customer_who_psychographic', value: 'ambitious, overwhelmed...' }]

DECIDER:
  - Process selection → store in field
  - Follow up on this bucket
  
GENERATOR:
  "Interesting mix—ambitious but overwhelmed. That tension is real. 
   Tell me more: what specifically overwhelms them?"
```

### Example: Inference Flow

```
[After several messages about customers, analyzer runs and produces high-confidence inference]

INFERENCE QUEUED:
  field: 'customer_pain_deep'
  value: 'Fear of being seen as unprofessional or not legitimate'
  confidence: 8

DECIDER (on next response cycle):
  - Pending inference with confidence >= 7
  - 4 messages since last inference
  - Current engagement: 'high'
  → show_inference

RESPONSE:
  "Here's what I'm picking up about what your customers are really feeling underneath:
   
   [CARD]
   'They're afraid of being seen as unprofessional—like they're not 
    a "real" business because they can't articulate their value.'
   
   [ That's it exactly ]  [ Close, but... ]  [ Not quite ]"

USER: [Clicks "That's it exactly"]

CLASSIFIER:
  - response_type: 'inference_confirm'

ACTION:
  - Update field with high confidence
  - Mark inference as confirmed
  - Continue conversation
  
RESPONSE:
  "I thought so. That's a powerful insight to design your messaging around.
   Let's talk about how you help them overcome that..."
```

### Example: Tangent Handling

```
USER: "Oh that reminds me, we also do consulting for larger companies, 
       but that's kind of a separate thing..."

CLASSIFIER:
  - response_type: 'open_response'
  - buckets_touched: ['basics']  // business model signal
  - tangent_detected: true

DECIDER:
  - Note the tangent information
  - Acknowledge but redirect

RESPONSE:
  "Good to know—I'll note that as part of your business model. 
   For now, let's focus on [primary offering]. We can circle back 
   to the consulting side later if it's relevant to your brand.
   
   So for [primary offering], who's your main customer?"
```

---

## Session Management

### Pause/Resume

**On Pause (inactivity or explicit):**
1. Run Session Summarizer analyzer
2. Store summary in `onboarding_sessions.conversation_summary`
3. Ensure all pending analyses complete
4. Mark session as 'paused'

**On Resume:**
1. Load conversation history
2. Load session summary
3. Generate warm re-entry:
```
"Welcome back! Last time we were talking about ${lastTopic}. 
 Here's where we got to: ${briefSummary}
 
 Ready to pick up where we left off, or would you like to focus 
 on something specific?"
```

### Completion Detection

```typescript
const isSessionComplete = (context) => {
  const requiredBuckets = buckets.filter(b => b.is_required);
  const allRequiredComplete = requiredBuckets.every(
    b => getBucketCompletion(b.id) >= b.min_completion_percent
  );
  
  if (!allRequiredComplete) return false;
  
  // Check if user has indicated completion
  if (context.user_said_done) return true;
  
  // Or if we've covered everything and reached natural end
  if (context.all_buckets_above_70 && context.at_natural_endpoint) return true;
  
  return false;
};
```

**Completion Flow:**
```
SYSTEM: "We've covered a lot of ground! Your brand foundation is looking solid.
        
        [Progress summary card]
        
        Would you like to:
        [ Review & refine specific sections ]
        [ Generate your brand outputs ]
        [ Keep going to fill more detail ]"
```

---

## Error Recovery

**If response generation fails:**
- Fall back to simple follow-up
- Never show error state to user
- Log for debugging

**If analysis pipeline fails:**
- Continue conversation normally
- Retry analysis in background
- Don't block user interaction

**If user seems stuck:**
- Offer to skip after 2 short responses
- Provide easier interaction (word bank instead of open question)
- Offer to show what we have so far

---

## Configuration

```typescript
const FLOW_CONFIG = {
  // How many messages between inference reveals
  min_messages_between_inferences: 3,
  
  // Completion threshold to consider bucket "done enough"
  bucket_completion_threshold: 70,
  
  // Messages before offering skip
  stuck_threshold: 3,
  
  // How often to run completeness check
  completeness_check_interval: 5, // messages
  
  // Analysis batching
  messages_per_analysis_batch: 3,
  
  // Max conversation before suggesting break
  max_messages_before_break_suggestion: 50
};
```

---

*Document version: 1.0*
