// ─────────────────────────────────────────────────────────────────────────────
// Incidents — GraphQL operations
// Centralise toutes les queries et mutations liées à l'analyse d'incidents.
// ─────────────────────────────────────────────────────────────────────────────

// ── Mutations ─────────────────────────────────────────────────────────────────

export const ANALYZE_INCIDENT_MUTATION = `
  mutation AnalyzeIncident($podName: String!, $namespace: String!) {
    analyzeIncident(podName: $podName, namespace: $namespace) {
      jobId status createdAt
    }
  }
`;

// ── Queries ───────────────────────────────────────────────────────────────────

export const POLL_JOB_QUERY = `
  query PollJob($jobId: String!) {
    analysisJob(jobId: $jobId) {
      jobId status error createdAt
      result {
        errorType rootCause explanation solution confidence
        isRecurring recurrenceCount correlatedService correlationExplanation
      }
    }
  }
`;

export const ANALYSIS_HISTORY_QUERY = `
  query History($podName: String!, $namespace: String!, $limit: Int) {
    analysisHistory(podName: $podName, namespace: $namespace, limit: $limit) {
      id podName namespace errorType rootCause solution
      confidence isRecurring recurrenceCount createdAt
    }
  }
`;
