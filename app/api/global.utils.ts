import * as jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

import prisma from '@/lib/prisma';

import { AccessTokenResponse, GitHubAppConfig, JWTPayload } from './project/meta/types';

class GitHubTokenGenerator {
  private config: GitHubAppConfig;
  private cachedToken: string | null = null;
  private tokenExpirationTime: Date | null = null;
  private privateKey: string;
  private appId: string;
  private readonly GITHUB_API_URL = 'https://api.github.com';

  constructor(config: GitHubAppConfig) {
    this.privateKey = process.env.GITHUB_APP_PRIVATE_KEY!;
    this.appId = process.env.GITHUB_APP_ID!;
    this.config = config;
    this.validateConfig();
  }

  private validateConfig(): void {
    const { installationId } = this.config;
    if (!this.privateKey || !this.appId || !installationId) {
      throw new Error('Missing required GitHub App configuration parameters');
    }
    if (!this.privateKey.includes('BEGIN') || !this.privateKey.includes('PRIVATE KEY')) {
      throw new Error('Invalid private key format. Expected PEM format.');
    }
  }

  private async validateInstallation(): Promise<void> {
    try {
      const jwtToken = this.generateJWT();
      const response = await fetch(
        `${this.GITHUB_API_URL}/app/installations/${this.config.installationId}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        },
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            'GitHub App installation not found. Please ensure the app is installed in your repository.',
          );
        }
        if (response.status === 403) {
          throw new Error('GitHub App installation access denied. Please check app permissions.');
        }
        throw new Error(
          `Failed to validate installation: ${response.status} ${response.statusText}`,
        );
      }
    } catch (error) {
      throw new Error(
        `Installation validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private generateJWT(): string {
    const now = Math.floor(Date.now() / 1000);
    const payload: JWTPayload = {
      iat: now - 60,
      exp: now + 10 * 60,
      iss: this.appId,
    };
    try {
      return jwt.sign(payload, this.privateKey, { algorithm: 'RS256' });
    } catch (error) {
      throw new Error(
        `Failed to generate JWT: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async fetchInstallationToken(jwtToken: string): Promise<AccessTokenResponse> {
    const url = `${this.GITHUB_API_URL}/app/installations/${this.config.installationId}/access_tokens`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'GitHubTokenGenerator/1.0',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      if (response.status === 404) {
        throw new Error(
          'GitHub App installation not found. Please ensure the app is installed in your repository.',
        );
      }
      if (response.status === 403) {
        throw new Error('GitHub App installation access denied. Please check app permissions.');
      }
      throw new Error(
        `Failed to fetch installation token: ${response.status} ${response.statusText} - ${errorBody}`,
      );
    }
    return response.json() as Promise<AccessTokenResponse>;
  }

  private isTokenValid(): boolean {
    if (!this.cachedToken || !this.tokenExpirationTime) {
      return false;
    }
    const bufferTime = new Date(this.tokenExpirationTime.getTime() - 5 * 60 * 1000);
    return new Date() < bufferTime;
  }

  private async generateFreshToken(): Promise<string> {
    try {
      await this.validateInstallation();
      const jwtToken = this.generateJWT();
      const tokenResponse = await this.fetchInstallationToken(jwtToken);

      this.cachedToken = tokenResponse.token;
      this.tokenExpirationTime = new Date(tokenResponse.expires_at);

      return tokenResponse.token;
    } catch (error) {
      throw new Error(
        `Token generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
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
      isValid: this.isTokenValid(),
    };
  }

  public clearCache(): void {
    this.cachedToken = null;
    this.tokenExpirationTime = null;
  }
}

export async function GetGitHubAccessTokenViaApp(installationId: string): Promise<string> {
  try {
    const tokenGenerator = new GitHubTokenGenerator({
      installationId: installationId,
    });

    const data = await tokenGenerator.getAccessToken();
    console.log('data', data);
    return data;
  } catch (error) {
    throw new Error(
      `Failed to get GitHub access token: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export async function GetGithubAccessTokenViaProjectId(params: { installationId: string }) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.installationId },
    });
    if (!project) {
      throw new Error('Project not found');
    }
    return await GetGitHubAccessTokenViaApp(project.installationId);
  } catch (error) {
    throw new Error(
      `Failed to get GitHub access token via project ID: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export async function haveOwnerAccessToProject(
  projectId: string,
  userEmail: string,
): Promise<boolean> {
  if (!projectId || !userEmail) {
    throw new Error('Project ID and user email are required');
  }
  try {
    const [projectResult, userResult] = await Promise.allSettled([
      prisma.project.findUnique({
        where: { id: projectId },
      }),
      prisma.user.findFirst({
        where: { email: userEmail },
      }),
    ]);

    if (projectResult.status === 'fulfilled' && projectResult.value) {
      const userObj = userResult.status === 'fulfilled' ? userResult.value : null;
      return userObj ? projectResult.value.userId === userObj.id : false;
    }
    return false;
  } catch (error) {
    throw new Error(
      `Failed to check access to project: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export async function haveAccessToProject(projectId: string, userEmail: string): Promise<boolean> {
  if (!projectId || !userEmail) {
    throw new Error('Project ID and user email are required');
  }
  try {
    const [projectResult, userResult, contributorResult] = await Promise.allSettled([
      prisma.project.findUnique({
        where: { id: projectId },
      }),
      prisma.user.findFirst({
        //
        where: { email: userEmail },
      }),
      prisma.contributorToProject.findFirst({
        where: {
          projectId: projectId,
          email: userEmail,
        },
      }),
    ]);

    if (projectResult.status === 'fulfilled' && projectResult.value) {
      const userObj = userResult.status === 'fulfilled' ? userResult.value : null;
      const contributorObj =
        contributorResult.status === 'fulfilled' ? contributorResult.value : null;
      return userObj ? projectResult.value.userId === userObj.id || contributorObj !== null : false;
    }
    return false;
  } catch (error) {
    throw new Error(
      `Failed to check access to project: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
