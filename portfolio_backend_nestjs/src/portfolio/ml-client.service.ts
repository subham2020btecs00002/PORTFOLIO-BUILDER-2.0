import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EnhanceTextResponse {
  enhanced: string;
}

export interface ThemeRecommendationResponse {
  template: string;
  themeColor: string;
  fontFamily: string;
  borderRadius: string;
  sectionOrder: string[];
}

export interface ParsedResumeResponse {
  fullName?: string;
  title?: string;
  description?: string;
  skills: Array<{ name: string; level: string; category: string }>;
  education: Array<any>;
  experience?: Array<any>;
  professionalHistory?: Array<any>;
  projects: Array<any>;
  portfolioLinks?: any;
}

/**
 * Resilient HTTP Client for ML Service
 *
 * Enterprise Safeguards:
 *  - Automatic propagation of X-Internal-Secret and X-Correlation-Id
 *  - Timeout safeguards via AbortSignal (30s standard, 45s for PDF parsing)
 *  - Exponential backoff retry for transient network hiccups
 *  - Clean error mapping to domain exceptions
 */
@Injectable()
export class MlClientService {
  private readonly logger = new Logger(MlClientService.name);
  private readonly mlUrl: string;
  private readonly internalSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.mlUrl =
      this.configService.get<string>('ML_SERVICE_URL') ||
      process.env.ML_SERVICE_URL ||
      'http://localhost:8000';
    const rawSecret =
      this.configService.get<string>('INTERNAL_SECRET') ||
      process.env.INTERNAL_SECRET ||
      '';
    this.internalSecret = rawSecret.trim().replace(/^["']|["']$/g, '');
  }

  private getHeaders(correlationId?: string, isJson: boolean = true): HeadersInit {
    const headers: Record<string, string> = {};
    if (isJson) {
      headers['Content-Type'] = 'application/json';
    }
    if (this.internalSecret) {
      headers['x-internal-secret'] = this.internalSecret;
    }
    if (correlationId) {
      headers['x-correlation-id'] = correlationId;
    }
    return headers;
  }

  async enhanceText(text: string, correlationId?: string): Promise<EnhanceTextResponse> {
    const url = `${this.mlUrl}/api/ml/enhance`;
    return this.executeWithRetry<EnhanceTextResponse>(
      url,
      {
        method: 'POST',
        headers: this.getHeaders(correlationId, true),
        body: JSON.stringify({ text }),
      },
      correlationId,
      30_000,
    );
  }

  async recommendTheme(
    industry: string,
    skills: string[],
    correlationId?: string,
  ): Promise<ThemeRecommendationResponse> {
    const url = `${this.mlUrl}/api/ml/recommend-theme`;
    return this.executeWithRetry<ThemeRecommendationResponse>(
      url,
      {
        method: 'POST',
        headers: this.getHeaders(correlationId, true),
        body: JSON.stringify({ industry, skills }),
      },
      correlationId,
      30_000,
    );
  }

  async parseResume(
    fileBuffer: Buffer,
    mimetype: string,
    originalname: string,
    correlationId?: string,
  ): Promise<ParsedResumeResponse> {
    const url = `${this.mlUrl}/api/ml/parse-resume`;
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(fileBuffer)], { type: mimetype });
    formData.append('file', blob, originalname);

    return this.executeWithRetry<ParsedResumeResponse>(
      url,
      {
        method: 'POST',
        headers: this.getHeaders(correlationId, false),
        body: formData,
      },
      correlationId,
      45_000,
    );
  }

  private async executeWithRetry<T>(
    url: string,
    options: RequestInit,
    correlationId?: string,
    timeoutMs: number = 30_000,
    maxRetries: number = 2,
  ): Promise<T> {
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorBody}`);
        }

        return (await response.json()) as T;
      } catch (err: any) {
        lastError = err;
        this.logger.warn(
          `[MlClientService] Attempt ${attempt}/${maxRetries} failed for ${url}: ${err.message} [correlationId: ${correlationId || '-'}]`,
        );
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
        }
      }
    }

    this.logger.error(
      `[MlClientService] All attempts failed for ${url}: ${lastError?.message} [correlationId: ${correlationId || '-'}]`,
    );
    throw new BadRequestException('Failed to communicate with AI ML service. Please try again.');
  }
}
