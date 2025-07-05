export interface MetaOperationRequest {
  operation: 'commit' | 'pr';
  owner: string;
  repo: string;
  branch?: string;
  path?: string;
  content?: string;
  message?: string;
  title?: string;
  body?: string;
}

export interface CommitResponse {
  commit: {
    url: string;
    oid: string;
  };
}

export interface PullRequestResponse {
  pullRequest: {
    url: string;
    number: number;
  };
}
export interface GitHubAppConfig {
  installationId: string;
}
export interface AccessTokenResponse {
  token: string;
  expires_at: string;
  permissions: Record<string, string>;
  repository_selection: string;
}

export interface JWTPayload {
  iat: number;
  exp: number;
  iss: string;
}
