import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResponse, VerdictType, AnalysisItem, ChatMessage, InterviewFeedbackResponse } from '../types';

// --- SCHEMAS ---

// 1. Analysis Schema
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      description: "List of claims found in the Resume that need to be fact-checked against the Code and JD.",
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING, description: "The specific technical topic (e.g., Redis, TDD)." },
          resumeClaim: { type: Type.STRING, description: "What the candidate claimed in the resume." },
          codeObservation: { type: Type.STRING, description: "What was actually found (or missing) in the code." },
          questionBasis: { 
            type: Type.STRING, 
            description: "Structured text strictly following this format: '[JD 요건]: ... [코드 현황]: ... [면접관의 의도]: ...'" 
          },
          verdict: { 
            type: Type.STRING, 
            enum: [VerdictType.VERIFIED, VerdictType.EXAGGERATED, VerdictType.MISSING, VerdictType.UNCERTAIN] 
          },
          interviewQuestion: { type: Type.STRING, description: "A sharp, pressure interview question." },
          score: { type: Type.NUMBER, description: "Confidence score of the mismatch (0-100)." },
        },
        required: ["topic", "resumeClaim", "codeObservation", "questionBasis", "verdict", "interviewQuestion", "score"],
      },
    },
    summary: { type: Type.STRING, description: "Overall summary of the analysis." },
    overallTrustScore: { type: Type.NUMBER, description: "Calculated trust score based on deductions." },
  },
  required: ["items", "summary", "overallTrustScore"],
};

// 2. Feedback Schema
const feedbackSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    defenseScore: { type: Type.NUMBER, description: "Total score out of 100." },
    logicScore: { type: Type.NUMBER, description: "Score out of 40." },
    logicReasoning: { type: Type.STRING, description: "Reason for points awarded (Praise)." },
    logicImprovement: { type: Type.STRING, description: "Reason for points deducted (Critique). Mandatory if score < 40." },
    
    honestyScore: { type: Type.NUMBER, description: "Score out of 30." },
    honestyReasoning: { type: Type.STRING },
    honestyImprovement: { type: Type.STRING, description: "Mandatory if score < 30." },
    
    solutionScore: { type: Type.NUMBER, description: "Score out of 30." },
    solutionReasoning: { type: Type.STRING },
    solutionImprovement: { type: Type.STRING, description: "Mandatory if score < 30." },

    feedbackSummary: { type: Type.STRING, description: "One-line summary of the performance." },
    
    positiveFeedback: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of 3 specific strengths." 
    },
    constructiveFeedback: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of 3 specific areas for improvement." 
    },
    actionItems: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of 3 concrete next steps for the candidate." 
    },
  },
  required: [
    "defenseScore", 
    "logicScore", "logicReasoning", "logicImprovement",
    "honestyScore", "honestyReasoning", "honestyImprovement",
    "solutionScore", "solutionReasoning", "solutionImprovement",
    "feedbackSummary", "positiveFeedback", "constructiveFeedback", "actionItems"
  ],
};

// --- API CLIENT & UTILS ---

const getAiClient = () => {
  const apiKey = import.meta.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || "";
  if (!apiKey) {
    console.error("API Key Error: 키를 찾을 수 없습니다. Vercel 설정을 확인하세요.");
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry Logic for 429/503 Errors
const callWithRetry = async <T>(
  operation: () => Promise<T>, 
  maxRetries: number = 3, 
  baseDelay: number = 2000
): Promise<T> => {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Check for Rate Limit (429) or Service Unavailable (503)
      // The SDK might throw standard Error objects with status properties or message content
      const isRateLimit = 
        error?.status === 429 || 
        error?.code === 429 || 
        (error?.message && error.message.includes('RESOURCE_EXHAUSTED')) ||
        error?.status === 503;

      if (isRateLimit && i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i); // Exponential backoff: 2s, 4s, 8s...
        console.warn(`API Quota/Rate Limit hit. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await wait(delay);
        continue;
      }
      
      // If it's not a retryable error, or we ran out of retries, break loop
      break;
    }
  }
  
  // Enhance error message for user clarity
  if (lastError?.status === 429 || (lastError?.message && lastError.message.includes('RESOURCE_EXHAUSTED'))) {
    throw new Error("현재 사용자가 많아 API 요청 한도를 초과했습니다. 잠시 후(약 1분 뒤) 다시 시도해주세요.");
  }

  throw lastError;
};

// --- FUNCTIONS ---

export const analyzeCandidate = async (
  jd: string, 
  resume: string, 
  codeContext: string
): Promise<AnalysisResponse> => {
  const ai = getAiClient();
  
  const prompt = `
    You are a strict Technical Lead Interviewer (Fact Check AI).
    Your goal is to cross-reference the Candidate's Resume against their actual Codebase and the Job Description (JD).

    **CRITICAL TERMINOLOGY**: 
    - When referring to the person in analysis text, use "지원자님".
    - **HOWEVER**, when generating the 'interviewQuestion', **DO NOT start with "지원자님" or any greeting.**
    - Start the question DIRECTLY. (e.g., "Redis를 사용했다고 하셨는데..." NOT "지원자님, Redis를...")

    **Task**:
    1. Identify claims in the Resume (e.g., "Used Redis for caching").
    2. Check the Code Context. Does the code support this? (e.g., Is there a Redis config? Is it actually used in logic?).
    3. Check the Job Description. Is this skill relevant?
    4. Determine a Verdict:
       - VERIFIED: Code clearly supports the claim.
       - EXAGGERATED: Code exists but is shallow (e.g., copied config, no business logic).
       - MISSING: Claimed feature is completely absent in code.
       - UNCERTAIN: Cannot determine from file structure alone.
    5. Generate a "Pressure Question" to expose lies or test depth.
       - **Style Rule**: Direct, sharp, and concise. No pleasantries.
       - Example: "자소서에는 Redis로 캐싱을 구현했다고 되어있는데, 코드에는 설정 파일만 있고 실제 호출 로직이 없습니다. 어디에 구현되어 있나요?"
    6. **Question Basis Construction**:
       You MUST format the 'questionBasis' field exactly as follows:
       "[JD 요건]: (Cite specific JD line) [코드 현황]: (Describe what is seen/missing in code) [면접관의 의도]: (Why is this important?)"
    
    **Trust Score Calculation (Rubric)**:
    Start at 100.
    - MISSING: -20 points each.
    - EXAGGERATED: -10 points each.
    - UNCERTAIN: -5 points each.
    - VERIFIED: 0 deduction.
    (Min score 0).

    **Input Data**:
    [JD]: ${jd}
    [Resume]: ${resume}
    [Code Context]: ${codeContext}
  `;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.4, // Low temperature for factual analysis
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResponse;
    }
    throw new Error("Failed to generate analysis");
  });
};

export const chatWithInterviewer = async (
  history: ChatMessage[], 
  item: AnalysisItem
): Promise<string> => {
  const ai = getAiClient();

  const systemPrompt = `
    You are a sharp, skeptical Technical Interviewer. 
    You are currently vetting a specific claim: "${item.resumeClaim}".
    
    **Context**:
    - Topic: ${item.topic}
    - Code Observation: ${item.codeObservation}
    - Verdict: ${item.verdict}
    
    **Rules**:
    1. **STYLE**: Be polite but direct. **DO NOT start your sentences with "지원자님,".** 
       - Incorrect: "지원자님, 답변 감사합니다. 하지만..."
       - Correct: "답변 감사합니다. 하지만 코드에서는..."
       - Correct: "말씀하신 부분은 이해했으나, 실제 구현체가 보이지 않습니다."
    2. **NO HALLUCINATIONS**: Do NOT invent claims. Only ask about what is in the [Context] or what the user just said.
       - If the user claims "I did X", and you don't see it in the code, ask "I don't see X in the code, where is it?"
       - Do NOT say "You wrote X in your resume" if they didn't write X.
    3. **GOAL**: Verify if the candidate actually understands the tech or just copied the code.
    4. **ENDING THE INTERVIEW**:
       - If the user provides a logical explanation that resolves your doubt (even if code is missing), OR if they admit their mistake honestly:
       - You MUST say exactly: "알겠습니다. 충분히 소명되었습니다. 면접을 종료하겠습니다."
       - Do not continue asking questions after this phrase.
  `;

  // Convert history to Gemini format
  const contents = [
    { role: 'user', parts: [{ text: systemPrompt }] }, // System instruction as first user message context
    ...history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }))
  ];

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
    });

    return response.text || "오류가 발생했습니다.";
  });
};

export const getInterviewFeedback = async (
  history: ChatMessage[], 
  item: AnalysisItem
): Promise<InterviewFeedbackResponse> => {
  const ai = getAiClient();

  const conversationText = history.map(m => `${m.role}: ${m.text}`).join('\n');

  const prompt = `
    Analyze the following interview transcript and generate a detailed Feedback Report for the candidate ("지원자님").

    **Interview Context**:
    - Topic: ${item.topic}
    - Verdict: ${item.verdict}
    - Conversation:
    ${conversationText}

    **Scoring Rubric (Total 100)**:
    1. **Logic (40pts)**: Was the explanation technically sound? Did it make sense given the code absence?
    2. **Honesty (30pts)**: Did they admit checking/copying code? Or did they keep lying? Admitting lack of implementation is better than lying.
    3. **Solution (30pts)**: Did they propose a valid alternative or fix?

    **Critical Instructions**:
    - Terminology: Use "지원자님" when referring to the user in the report.
    - **Deductions**: If a score is NOT perfect (e.g., 30/40), you **MUST** fill the corresponding 'Improvement' field explaining EXACTLY why points were deducted, quoting the candidate's weak response.
    - **Feedback Lists**:
      - 'positiveFeedback': 3 bullet points of what they did well.
      - 'constructiveFeedback': 3 bullet points of weak spots.
      - 'actionItems': 3 concrete technical tasks to improve (e.g., "Implement Redis TTL strategy in the config").
  `;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: feedbackSchema,
        temperature: 0.5,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as InterviewFeedbackResponse;
    }
    throw new Error("Failed to generate feedback");
  });
};
