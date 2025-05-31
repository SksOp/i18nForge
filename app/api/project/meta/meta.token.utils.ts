import * as jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { AccessTokenResponse, GitHubAppConfig, JWTPayload } from './types';

class GitHubTokenGenerator {
    private config: GitHubAppConfig;
    private cachedToken: string | null = null;
    private tokenExpirationTime: Date | null = null;
    private privateKey: string;
    private appId: string;
    constructor(config: GitHubAppConfig) {
        this.config = config;
        this.validateConfig();
        this.privateKey = process.env.GITHUB_APP_PRIVATE_KEY!;
        this.appId = process.env.GITHUB_APP_ID!;
    }

    private validateConfig(): void {
        const { installationId: installationId, githubId: githubId } = this.config;
        if (!this.privateKey || !this.appId || !installationId || !githubId) {
            throw new Error('Missing required GitHub App configuration parameters');
        }
        if (!this.privateKey.includes('BEGIN') || !this.privateKey.includes('PRIVATE KEY')) {
            throw new Error('Invalid private key format. Expected PEM format.');
        }
    }

    private generateJWT(): string {
        const now = Math.floor(Date.now() / 1000);
        const payload: JWTPayload = {
            iat: now - 60,
            exp: now + (10 * 60),
            iss: this.appId
        };
        try {
            return jwt.sign(payload, this.privateKey, { algorithm: 'RS256' });
        } catch (error) {
            throw new Error(`Failed to generate JWT: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async fetchInstallationToken(jwtToken: string): Promise<AccessTokenResponse> {
        const url = `https://api.github.com/app/installations/${this.config.installationId}/access_tokens`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
                'User-Agent': 'GitHubTokenGenerator/1.0'
            }
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to fetch installation token: ${response.status} ${response.statusText} - ${errorBody}`);
        }
        return response.json() as Promise<AccessTokenResponse>;
    }

    private isTokenValid(): boolean {
        if (!this.cachedToken || !this.tokenExpirationTime) {
            return false;
        }
        const bufferTime = new Date(this.tokenExpirationTime.getTime() - (5 * 60 * 1000));
        return new Date() < bufferTime;
    }

    private async generateFreshToken(): Promise<string> {
        try {
            const jwtToken = this.generateJWT();
            const tokenResponse = await this.fetchInstallationToken(jwtToken);

            this.cachedToken = tokenResponse.token;
            this.tokenExpirationTime = new Date(tokenResponse.expires_at);

            return tokenResponse.token;
        } catch (error) {
            throw new Error(`Token generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public async getAccessToken(): Promise<string> {
        if (this.isTokenValid() && this.cachedToken) {
            return this.cachedToken;
        }

        return this.generateFreshToken();
    }

    public async refreshToken(): Promise<string> {
        this.cachedToken = null;
        this.tokenExpirationTime = null;
        return this.generateFreshToken();
    }

    public getTokenInfo(): { token: string | null; expiresAt: Date | null; isValid: boolean } {
        return {
            token: this.cachedToken,
            expiresAt: this.tokenExpirationTime,
            isValid: this.isTokenValid()
        };
    }

    public clearCache(): void {
        this.cachedToken = null;
        this.tokenExpirationTime = null;
    }
}

export async function getAccessToken(installationId: string, githubId: string) {
    const tokenGenerator = new GitHubTokenGenerator({
        installationId: installationId,
        githubId: githubId
    });
    const accessToken = await tokenGenerator.getAccessToken();
}

