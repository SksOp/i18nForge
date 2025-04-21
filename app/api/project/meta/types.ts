
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