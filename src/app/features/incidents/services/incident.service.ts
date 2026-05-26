import { Injectable, inject } from '@angular/core';
import { Observable, interval, switchMap, takeWhile, startWith, map } from 'rxjs';
import { GraphqlService } from '../../../core/services/graphql.service';
import { AnalysisJob, AnalyzeRequest, HistoryItem } from '../models/incident.model';
import {
  ANALYZE_INCIDENT_MUTATION,
  POLL_JOB_QUERY,
  ANALYSIS_HISTORY_QUERY,
} from '../graphql/incident.operations';

@Injectable({ providedIn: 'root' })
export class IncidentService {
  private readonly gql = inject(GraphqlService);

  analyze(req: AnalyzeRequest): Observable<{ analyzeIncident: AnalysisJob }> {
    return this.gql.mutate<{ analyzeIncident: AnalysisJob }>(ANALYZE_INCIDENT_MUTATION, req);
  }

  pollJob(jobId: string): Observable<AnalysisJob> {
    return interval(3000).pipe(
      startWith(0),
      switchMap(() =>
        this.gql.query<{ analysisJob: AnalysisJob }>(POLL_JOB_QUERY, { jobId }, 0)
      ),
      map(res => res.analysisJob),
      takeWhile(job => job.status === 'pending' || job.status === 'running', true)
    );
  }

  getJob(jobId: string): Observable<AnalysisJob> {
    return this.gql
      .query<{ analysisJob: AnalysisJob }>(POLL_JOB_QUERY, { jobId })
      .pipe(map(res => res.analysisJob));
  }

  getHistory(podName: string, namespace: string, limit = 10): Observable<HistoryItem[]> {
    return this.gql
      .query<{ analysisHistory: HistoryItem[] }>(ANALYSIS_HISTORY_QUERY, { podName, namespace, limit })
      .pipe(map(res => res.analysisHistory));
  }
}
