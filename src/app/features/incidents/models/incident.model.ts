export type JobStatus = 'pending' | 'running' | 'complete' | 'failed';
export type Confidence = 'high' | 'medium' | 'low';

export interface AnalysisResult {
  errorType: string;
  rootCause: string;
  explanation: string;
  solution: string;
  confidence: Confidence;
  isRecurring: boolean;
  recurrenceCount: number;
  correlatedService: string | null;
  correlationExplanation: string | null;
}

export interface AnalysisJob {
  jobId: string;
  status: JobStatus;
  result: AnalysisResult | null;
  error: string | null;
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  podName: string;
  namespace: string;
  errorType: string;
  rootCause: string;
  solution: string;
  confidence: Confidence;
  isRecurring: boolean;
  recurrenceCount: number;
  createdAt: string;
}

export interface AnalyzeRequest {
  podName: string;
  namespace: string;
}
