import { Injectable, inject } from '@angular/core';
import { Observable, interval, switchMap, takeWhile, startWith, map } from 'rxjs';
import { GraphqlService } from '../../../core/services/graphql.service';
import { AnalysisJob, AnalyzeRequest, HistoryItem } from '../models/incident.model';

const ANALYZE_MUTATION = `
  mutation AnalyzeIncident($podName: String!, $namespace: String!) {
    analyzeIncident(podName: $podName, namespace: $namespace) {
      jobId status createdAt
    }
  }
`;

const POLL_QUERY = `
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

const HISTORY_QUERY = `
  query History($podName: String!, $namespace: String!, $limit: Int) {
    analysisHistory(podName: $podName, namespace: $namespace, limit: $limit) {
      id podName namespace errorType rootCause solution
      confidence isRecurring recurrenceCount createdAt
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class IncidentService {
  private readonly gql = inject(GraphqlService);

  analyze(req: AnalyzeRequest): Observable<{ analyzeIncident: AnalysisJob }> {
    return this.gql.mutate<{ analyzeIncident: AnalysisJob }>(ANALYZE_MUTATION, req);
  }

  pollJob(jobId: string): Observable<AnalysisJob> {
    return interval(3000).pipe(
      startWith(0),
      switchMap(() =>
        this.gql.query<{ analysisJob: AnalysisJob }>(POLL_QUERY, { jobId }, 0)
      ),
      map(res => res.analysisJob),
      takeWhile(job => job.status === 'pending' || job.status === 'running', true)
    );
  }

  getJob(jobId: string): Observable<AnalysisJob> {
    return this.gql
      .query<{ analysisJob: AnalysisJob }>(POLL_QUERY, { jobId })
      .pipe(map(res => res.analysisJob));
  }

  getHistory(podName: string, namespace: string, limit = 10): Observable<HistoryItem[]> {
    return this.gql
      .query<{ analysisHistory: HistoryItem[] }>(HISTORY_QUERY, { podName, namespace, limit })
      .pipe(map(res => res.analysisHistory));
  }
}
