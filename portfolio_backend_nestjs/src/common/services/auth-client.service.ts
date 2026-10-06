import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Auth Client Service (Portfolio Monolith)
 *
 * Communicates with the standalone Auth Service over internal HTTP.
 * Ensures the monolith does not directly mutate the User database collection.
 */
@Injectable()
export class AuthClientService {
  private readonly logger = new Logger(AuthClientService.name);
  private readonly authUrl: string;
  private readonly internalSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.authUrl =
      this.configService.get<string>('AUTH_SERVICE_URL') ||
      process.env.AUTH_SERVICE_URL ||
      'http://localhost:5001';
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

  async updateUserRole(
    adminId: string,
    userId: string,
    role: string,
    correlationId?: string,
  ): Promise<any> {
    const url = `${this.authUrl}/api/auth/internal/users/${userId}/role`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(correlationId),
      body: JSON.stringify({ adminId, role }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        err.message || `Failed to update user role (HTTP ${response.status})`,
      );
    }

    return response.json();
  }

  async deleteUserAccount(
    adminId: string,
    userId: string,
    correlationId?: string,
  ): Promise<any> {
    const url = `${this.authUrl}/api/auth/internal/users/${userId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(correlationId),
      body: JSON.stringify({ adminId }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        err.message || `Failed to delete user account (HTTP ${response.status})`,
      );
    }

    return response.json();
  }
}
