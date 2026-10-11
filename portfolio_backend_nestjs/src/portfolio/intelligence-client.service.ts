import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface IntelligenceEvaluationDto {
  ats_score: number;
  grade: string;
  readability_index: number;
  metric_density: number;
  action_verb_ratio: number;
  shap_explanations: Array<{
    feature: string;
    impact: number;
    direction: string;
    advice: string;
  }>;
  skill_gap_recommendations: Array<{
    skill: string;
    relevance_score: number;
    category: string;
  }>;
  evaluated_at: string;
}

export interface LayoutPolicyDto {
  action_id: string;
  template_id: string;
  section_order: string[];
  spotlight_project_index: number;
  action_description: string;
  context_vector: number[];
  predicted_ucb: number;
  exploration_mode: boolean;
  decided_at: string;
}

export interface TelemetryRewardDto {
  status: string;
  action_id: string;
  reward_value: number;
  updates_count: number;
  updated_at: string;
}

/**
 * Resilient HTTP Client for Portfolio Intelligence (ML/DRL) Service (Port 8001)
 *
 * Enterprise Capabilities:
 * - Automatic injection of X-Internal-Secret and X-Correlation-Id
 * - Timeout guardrails using AbortController (15s limit)
 * - Exponential backoff retry logic for transient network failures
 * - Graceful degradation (returns safe defaults on failure to prevent user-facing crashes)
 */
@Injectable()
export class IntelligenceClientService {
  private readonly logger = new Logger(IntelligenceClientService.name);
  private readonly intelligenceUrl: string;
  private readonly internalSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.intelligenceUrl =
      this.configService.get<string>('INTELLIGENCE_SERVICE_URL') ||
      process.env.INTELLIGENCE_SERVICE_URL ||
      'http://localhost:8001';

    const rawSecret =
      this.configService.get<string>('INTERNAL_SECRET') ||
      process.env.INTERNAL_SECRET ||
      '';
    this.internalSecret = rawSecret.trim().replace(/^["']|["']$/g, '');
  }

  private getHeaders(correlationId?: string): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.internalSecret) {
      headers['x-internal-secret'] = this.internalSecret;
    }
    if (correlationId) {
      headers['x-correlation-id'] = correlationId;
    }
    return headers;
  }

  /**
   * Evaluates candidate portfolio using XGBoost + SHAP TreeExplainer
   */
  async evaluatePortfolio(
    portfolioData: any,
    correlationId?: string,
  ): Promise<IntelligenceEvaluationDto | null> {
    const url = `${this.intelligenceUrl}/api/intelligence/evaluate`;
    return this.executeWithRetry<IntelligenceEvaluationDto>(
      url,
      {
        method: 'POST',
        headers: this.getHeaders(correlationId),
        body: JSON.stringify(portfolioData),
      },
      correlationId,
      15_000,
    );
  }

  /**
   * Queries the LinUCB DRL Bandit to select the optimal layout and section order
   */
  async getLayoutPolicy(
    candidateProfile: any,
    visitorContext: any,
    correlationId?: string,
  ): Promise<LayoutPolicyDto | null> {
    const url = `${this.intelligenceUrl}/api/intelligence/layout-policy`;
    return this.executeWithRetry<LayoutPolicyDto>(
      url,
      {
        method: 'POST',
        headers: this.getHeaders(correlationId),
        body: JSON.stringify({
          candidateProfile,
          visitorContext,
        }),
      },
      correlationId,
      8_000,
    );
  }

  /**
   * Submits visitor interaction telemetry reward to the LinUCB online learning engine
   */
  async submitTelemetryReward(
    payload: {
      action_id: string;
      context_vector: number[];
      dwell_seconds: number;
      contact_clicked: boolean;
      resume_downloaded: boolean;
      github_clicked: boolean;
      bounce: boolean;
    },
    correlationId?: string,
  ): Promise<TelemetryRewardDto | null> {
    const url = `${this.intelligenceUrl}/api/intelligence/reward`;
    return this.executeWithRetry<TelemetryRewardDto>(
      url,
      {
        method: 'POST',
        headers: this.getHeaders(correlationId),
        body: JSON.stringify(payload),
      },
      correlationId,
      5_000,
    );
  }

  /**
   * Fault-tolerant HTTP execution with timeout and single retry
   */
  private async executeWithRetry<T>(
    url: string,
    options: RequestInit,
    correlationId?: string,
    timeoutMs: number = 10_000,
  ): Promise<T | null> {
    const maxRetries = 1;
    let attempt = 0;

    while (attempt <= maxRetries) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errBody = await response.text().catch(() => '');
          this.logger.warn(
            `[IntelligenceClient] Upstream HTTP ${response.status} from ${url}: ${errBody} (corrId: ${correlationId})`,
          );
          if (response.status >= 400 && response.status < 500) {
            return null; // Client error, do not retry
          }
          throw new Error(`Upstream returned ${response.status}`);
        }

        return (await response.json()) as T;
      } catch (err: any) {
        clearTimeout(timeoutId);
        attempt++;
        if (attempt > maxRetries) {
          this.logger.error(
            `[IntelligenceClient] Final failure requesting ${url}: ${err.message} (corrId: ${correlationId})`,
          );
          return null; // Graceful degradation: return null instead of throwing unhandled 500
        }
        await new Promise((res) => setTimeout(res, 300));
      }
    }

    return null;
  }
}
