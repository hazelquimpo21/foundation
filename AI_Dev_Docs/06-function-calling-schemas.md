# Business Onboarder — Function Calling Schemas

## Overview

Function calling schemas define how analyzer prose gets parsed into structured fields. The parser's job is **extraction only**—all thinking happened in the analyzer.

**Key principle:** The parser reads pre-analyzed text and slots insights into the right fields. It doesn't interpret, infer, or think creatively.

---

## Parser Architecture

```
┌─────────────────────────────────────────────┐
│         ANALYZER OUTPUT (prose)             │
│  "The founder shows deep empathy for        │
│   customers who feel like frauds..."        │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│         PARSER PROMPT + SCHEMA              │
│  "Extract structured data from this         │
│   analysis into the following fields..."    │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│         STRUCTURED OUTPUT                   │
│  {                                          │
│    "customer_pain_deep": "feeling like...", │
│    "confidence": 8,                         │
│    ...                                      │
│  }                                          │
└─────────────────────────────────────────────┘
```

---

## Parser: Customer Fields

**Input:** Output from Customer Empathy Analyzer

### System Prompt

```
You are a precise data extractor. Your job is to read an analysis about a 
business's customers and extract structured information into specific fields.

ONLY extract what is clearly stated or strongly implied in the analysis.
If information isn't present, use null—don't invent.
Keep extractions concise and quotable where possible.
```

### Function Schema

```json
{
  "name": "extract_customer_fields",
  "description": "Extract customer-related fields from empathy analysis",
  "parameters": {
    "type": "object",
    "properties": {
      "customer_who_demographic": {
        "type": "string",
        "description": "Observable customer characteristics: age, profession, life stage, location. Factual descriptors only."
      },
      "customer_who_psychographic": {
        "type": "string", 
        "description": "Customer mindset: attitudes, beliefs, how they think. Include emotional descriptors."
      },
      "customer_pain_surface": {
        "type": "string",
        "description": "The problem customers would articulate themselves. Use their language if quoted."
      },
      "customer_pain_deep": {
        "type": "string",
        "description": "Underlying emotional/psychological pain. Fears, identity concerns, feelings."
      },
      "customer_desire_stated": {
        "type": "string",
        "description": "What customers explicitly say they want. The outcome they'd ask for."
      },
      "customer_desire_true": {
        "type": "string",
        "description": "Deeper desire beneath the stated one. Status, feeling, identity outcomes."
      },
      "customer_journey_awareness": {
        "type": "string",
        "description": "When/how customers realize they have this problem. Trigger moments."
      },
      "confidence_scores": {
        "type": "object",
        "description": "Confidence level (1-10) for each extracted field",
        "properties": {
          "customer_who_demographic": { "type": "integer", "minimum": 1, "maximum": 10 },
          "customer_who_psychographic": { "type": "integer", "minimum": 1, "maximum": 10 },
          "customer_pain_surface": { "type": "integer", "minimum": 1, "maximum": 10 },
          "customer_pain_deep": { "type": "integer", "minimum": 1, "maximum": 10 },
          "customer_desire_stated": { "type": "integer", "minimum": 1, "maximum": 10 },
          "customer_desire_true": { "type": "integer", "minimum": 1, "maximum": 10 }
        }
      },
      "gaps_identified": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Information explicitly noted as missing or uncertain in the analysis"
      },
      "inference_ready": {
        "type": "array",
        "description": "Insights strong enough to show user for confirmation",
        "items": {
          "type": "object",
          "properties": {
            "field": { "type": "string" },
            "value": { "type": "string" },
            "display_text": { "type": "string", "description": "User-friendly phrasing for reveal card" }
          }
        }
      }
    },
    "required": ["confidence_scores"]
  }
}
```

---

## Parser: Values Fields

**Input:** Output from Values Inferrer Analyzer

### Function Schema

```json
{
  "name": "extract_values_fields",
  "description": "Extract values-related fields from values analysis",
  "parameters": {
    "type": "object",
    "properties": {
      "values_core": {
        "type": "array",
        "items": { "type": "string" },
        "description": "3-7 core value words/phrases that emerged strongly",
        "maxItems": 7
      },
      "values_beliefs": {
        "type": "string",
        "description": "Core beliefs about the world/industry. 'We believe...' statements."
      },
      "values_stands_against": {
        "type": "string",
        "description": "What the brand opposes or rejects. Negative positions."
      },
      "values_aspirational": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Values they're working toward but haven't fully embodied"
      },
      "values_tension": {
        "type": "string",
        "description": "Any tension or contradiction between stated values, if noted"
      },
      "confidence_scores": {
        "type": "object",
        "properties": {
          "values_core": { "type": "integer", "minimum": 1, "maximum": 10 },
          "values_beliefs": { "type": "integer", "minimum": 1, "maximum": 10 },
          "values_stands_against": { "type": "integer", "minimum": 1, "maximum": 10 }
        }
      },
      "inference_ready": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "field": { "type": "string" },
            "value": { "type": "string" },
            "display_text": { "type": "string" }
          }
        }
      }
    },
    "required": ["confidence_scores"]
  }
}
```

---

## Parser: Voice Fields

**Input:** Output from Voice Detector Analyzer

### Function Schema

```json
{
  "name": "extract_voice_fields",
  "description": "Extract voice and personality fields from voice analysis",
  "parameters": {
    "type": "object",
    "properties": {
      "personality_tags": {
        "type": "array",
        "items": { "type": "string" },
        "description": "4-6 personality adjectives that describe the brand",
        "maxItems": 6
      },
      "voice_spectrum_formal": {
        "type": "integer",
        "minimum": 1,
        "maximum": 10,
        "description": "1 = very casual, 10 = very formal"
      },
      "voice_spectrum_playful": {
        "type": "integer",
        "minimum": 1,
        "maximum": 10,
        "description": "1 = serious, 10 = playful"
      },
      "voice_spectrum_bold": {
        "type": "integer",
        "minimum": 1,
        "maximum": 10,
        "description": "1 = understated, 10 = bold"
      },
      "voice_spectrum_technical": {
        "type": "integer",
        "minimum": 1,
        "maximum": 10,
        "description": "1 = accessible, 10 = expert/technical"
      },
      "voice_donts": {
        "type": "string",
        "description": "What the brand should never sound like"
      },
      "unique_patterns": {
        "type": "string",
        "description": "Distinctive phrases, patterns, or stylistic choices noted"
      },
      "confidence_scores": {
        "type": "object",
        "properties": {
          "personality_tags": { "type": "integer", "minimum": 1, "maximum": 10 },
          "voice_spectrums": { "type": "integer", "minimum": 1, "maximum": 10 },
          "voice_donts": { "type": "integer", "minimum": 1, "maximum": 10 }
        }
      }
    },
    "required": ["confidence_scores"]
  }
}
```

---

## Parser: Positioning Fields

**Input:** Output from Differentiation Detector Analyzer

### Function Schema

```json
{
  "name": "extract_positioning_fields",
  "description": "Extract positioning and differentiation fields",
  "parameters": {
    "type": "object",
    "properties": {
      "differentiator_primary": {
        "type": "string",
        "description": "The main, specific thing that makes this business different"
      },
      "differentiator_secondary": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Other meaningful differentiators"
      },
      "competitive_landscape": {
        "type": "string",
        "description": "How they relate to alternatives: competitors, DIY, status quo"
      },
      "category_owned": {
        "type": "string",
        "description": "The category or space they want to own/define"
      },
      "positioning_strength": {
        "type": "string",
        "enum": ["strong", "moderate", "weak", "generic"],
        "description": "Assessment of how differentiated they actually are"
      },
      "positioning_notes": {
        "type": "string",
        "description": "Notes on how to strengthen positioning, if weak"
      },
      "confidence_scores": {
        "type": "object",
        "properties": {
          "differentiator_primary": { "type": "integer", "minimum": 1, "maximum": 10 },
          "competitive_landscape": { "type": "integer", "minimum": 1, "maximum": 10 },
          "category_owned": { "type": "integer", "minimum": 1, "maximum": 10 }
        }
      }
    },
    "required": ["confidence_scores", "positioning_strength"]
  }
}
```

---

## Parser: Basics Fields (Direct Extraction)

**Input:** Conversation messages directly (no analyzer needed for factual info)

### Function Schema

```json
{
  "name": "extract_basics_fields",
  "description": "Extract basic factual business information from conversation",
  "parameters": {
    "type": "object",
    "properties": {
      "business_name": {
        "type": "string",
        "description": "The name of the business"
      },
      "business_stage": {
        "type": "string",
        "enum": ["idea", "pre-launch", "launched", "growing", "established", "pivoting"],
        "description": "Current lifecycle stage"
      },
      "industry": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Industry or category tags"
      },
      "business_model": {
        "type": "string",
        "enum": ["product", "service", "saas", "marketplace", "agency", "consulting", "content", "hybrid"],
        "description": "How the business makes money"
      },
      "founder_background": {
        "type": "string",
        "description": "Relevant founder experience and story"
      },
      "location": {
        "type": "string",
        "description": "Where the business operates"
      },
      "team_size": {
        "type": "string",
        "description": "Size of the team"
      }
    }
  }
}
```

---

## Parser: Gap Analysis

**Input:** Output from Completeness Checker Analyzer

### Function Schema

```json
{
  "name": "extract_completeness_assessment",
  "description": "Extract completeness assessment and next steps",
  "parameters": {
    "type": "object",
    "properties": {
      "bucket_completion": {
        "type": "object",
        "description": "Estimated completion percentage per bucket",
        "properties": {
          "basics": { "type": "integer", "minimum": 0, "maximum": 100 },
          "customers": { "type": "integer", "minimum": 0, "maximum": 100 },
          "values": { "type": "integer", "minimum": 0, "maximum": 100 },
          "voice": { "type": "integer", "minimum": 0, "maximum": 100 },
          "positioning": { "type": "integer", "minimum": 0, "maximum": 100 },
          "vision": { "type": "integer", "minimum": 0, "maximum": 100 }
        }
      },
      "critical_gaps": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Most important missing information"
      },
      "recommended_next_questions": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "question": { "type": "string" },
            "target_field": { "type": "string" },
            "priority": { "type": "integer", "minimum": 1, "maximum": 5 }
          }
        },
        "description": "Suggested next questions in priority order"
      },
      "inference_opportunities": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "field": { "type": "string" },
            "possible_inference": { "type": "string" },
            "basis": { "type": "string" }
          }
        },
        "description": "Fields that could be inferred from existing information"
      },
      "contradictions": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Noted inconsistencies to potentially address"
      }
    },
    "required": ["bucket_completion", "critical_gaps"]
  }
}
```

---

## Confidence Score Mapping

Parser confidence scores map to database confidence levels:

| Score | Confidence Level | Meaning |
|-------|------------------|---------|
| 1-3   | `low`            | Weak signal, single data point |
| 4-6   | `medium`         | Reasonable inference, would benefit from confirmation |
| 7-10  | `high`           | Strong signal, multiple supporting points |

---

## Usage Notes

**Calling the parser:**
```javascript
const parseAnalysis = async (analysisText, parserType) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: PARSER_SYSTEM_PROMPTS[parserType] },
      { role: "user", content: `Extract structured data from this analysis:\n\n${analysisText}` }
    ],
    functions: [PARSER_SCHEMAS[parserType]],
    function_call: { name: PARSER_SCHEMAS[parserType].name }
  });
  
  return JSON.parse(response.choices[0].message.function_call.arguments);
};
```

**Handling partial extractions:**
- Fields with `null` values are not updated in the database
- Only fields with actual extracted content are written
- Confidence scores determine whether to update existing values

---

## Adding New Parser Schemas

1. **Define the fields:** What structured data needs extraction?
2. **Write clear descriptions:** Parser relies on field descriptions to know what to extract
3. **Set appropriate types:** Use enums for constrained values, arrays for multi-values
4. **Include confidence scores:** Every parser should assess extraction confidence
5. **Add to registry:** Register in the parser configuration

---

*Document version: 1.0*
