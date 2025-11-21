
export enum VerdictType {
  VERIFIED = 'VERIFIED',
  EXAGGERATED = 'EXAGGERATED',
  MISSING = 'MISSING',
  UNCERTAIN = 'UNCERTAIN'
}

export interface AnalysisItem {
  topic: string;
  resumeClaim: string;
  codeObservation: string;
  questionBasis: string; // Why we are asking this? (Link to JD or specific code logic)
  verdict: VerdictType;
  interviewQuestion: string;
  score: number; // 0 to 100 confidence of mismatch
}

export interface AnalysisResponse {
  items: AnalysisItem[]; // Fact Check (Resume vs Code + JD Context)
  summary: string;
  overallTrustScore: number;
}

export interface InputData {
  jobDescription: string;
  resumeText: string;
  codeSnippet: string;
  githubUrl: string;
  githubToken?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface InterviewFeedbackResponse {
  defenseScore: number; // Total 0 to 100
  
  // Detailed Scoring
  logicScore: number; // Max 40
  logicReasoning: string; // Why they got points
  logicImprovement: string; // Why they lost points
  
  honestyScore: number; // Max 30
  honestyReasoning: string;
  honestyImprovement: string;
  
  solutionScore: number; // Max 30
  solutionReasoning: string;
  solutionImprovement: string;

  feedbackSummary: string;
  
  // Categorized Feedback
  positiveFeedback: string[];    // 3 strengths
  constructiveFeedback: string[]; // 3 weaknesses
  actionItems: string[];         // 3 concrete actions
}
