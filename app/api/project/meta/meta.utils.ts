import { th } from 'date-fns/locale';
import { gql, request } from 'graphql-request';

import prisma from '@/lib/prisma';

export interface FileContentForCommit {
  path: string;
  content: string;
}

export class MetaUtils {
  private static readonly GITHUB_API_URL = 'https://api.github.com/graphql';

  public static async getFileContent(
    paths: string[],
    token: string,
    name: string,
  ): Promise<{ path: string; content: string }[] | null> {
    const repo = name.split('/')[1];
    const owner = name.split('/')[0];

    const query = gql`
            query {
                repository(owner: "${owner}", name: "${repo}") {
                    ${this.queryBuilder(paths)}
                }
            }`;
    try {
      const data = await this._queryRunner(token, query);
      if (!data) return null;
      const repository = (data as any).repository;
      if (!repository) return null;

      const contents: { path: string; content: string }[] = [];
      for (let i = 0; i < paths.length; i++) {
        const fileKey = `file${i}`;
        const fileData = repository[fileKey];
        contents.push({
          path: paths[i],
          content: fileData?.text ?? '',
        });
      }
      return contents;
    } catch (error) {
      throw error;
    }
  }
  public static async createBranch(token: string, owner: string, repo: string, branch: string) {
    try {
      const mainOID = await this.getOID(token, owner, repo, 'main');
      if (!mainOID) {
        throw new Error('Failed to get main branch OID');
      }
      const repoQuery = gql`
                query {
                    repository(owner: "${owner}", name: "${repo}") {
                        id
                    }
                }`;

      const repoData = await this._queryRunner(token, repoQuery);
      if (!repoData?.repository?.id) {
        throw new Error('Failed to get repository ID');
      }

      const query = gql`
                mutation {
                    createRef(input: {
                        repositoryId: "${repoData.repository.id}",
                        name: "refs/heads/${branch}",
                        oid: "${mainOID}"
                    }) {
                        ref {
                            name
                            id
                        }
                    }
                }`;

      const data = await this._queryRunner(token, query);
      if (!data) return null;
      return data.createRef.ref;
    } catch (error) {
      throw new Error(`Failed to create branch: ${error.message}`);
    }
  }
  public static async commitContent(
    token: string,
    owner: string,
    repo: string,
    branch: string,
    fileContent: FileContentForCommit[],
    message: string,
  ) {
    try {
      const oid = await this.getOID(token, owner, repo, branch);
      if (!oid) throw new Error('Failed to get OID for the branch');

      const additions = fileContent
        .map((file) => {
          const actualPath = this.extractPathFromUrl(file.path);
          const encodedContent = Buffer.from(file.content).toString('base64');
          return `{path: "${actualPath}", contents: "${encodedContent}"}`;
        })
        .join(',');

      const query = gql`
                mutation {
                    createCommitOnBranch(input: {
                        branch: {
                            repositoryNameWithOwner: "${owner}/${repo}",
                            branchName: "${branch}"
                        },
                        message: {
                            headline: "${message}"
                        },
                        fileChanges: {
                            additions: [${additions}]
                        },
                        expectedHeadOid: "${oid}"
                    }) {
                        commit {
                            url
                            oid
                        }
                    }
                }`;
      const data = await MetaUtils._queryRunner(token, query);
      if (!data) throw new Error('Failed to commit file contents');
      return data;
    } catch (error) {
      throw new Error(`Failed to commit content: ${error.message}`);
    }
  }
  public static async createPullRequest(
    token: string,
    owner: string,
    repo: string,
    branch: string,
    title: string,
    body: string,
  ) {
    try {
      const repoQuery = gql`
                query {
                    repository(owner: "${owner}", name: "${repo}") {
                        id
                    }
                }`;

      const repoData = await this._queryRunner(token, repoQuery);
      if (!repoData?.repository?.id) {
        throw new Error('Failed to get repository ID');
      }

      const query = gql`
                mutation {
                    createPullRequest(input: {
                        repositoryId: "${repoData.repository.id}",
                        headRefName: "${branch}",
                        baseRefName: "main",
                        title: "${title}",
                        body: "${body}"
                    }) {
                        pullRequest {
                            url
                            number
                        }
                    }
                }`;
      const data = await MetaUtils._queryRunner(token, query);
      if (!data) return null;
      return data;
    } catch (error) {
      throw new Error(`Failed to create pull request: ${error.message}`);
    }
  }
  public static async getFileList(
    token: string,
    owner: string,
    repo: string,
    branch: string,
    path: string,
  ) {
    try {
      const query = gql`
                query {
                    repository(owner: "${owner}", name: "${repo}") {
                        ref(qualifiedName: "refs/heads/${branch}") {
                            target {
                                ... on Commit {
                                    history(path: "${path}") {
                                        nodes {
                                            oid
                                        }
                                    }
                                }
                            }
                        }
                    }
                }`;
      const data = await MetaUtils._queryRunner(token, query);
      if (!data) return null;
      return data;
    } catch (error) {
      throw new Error(`Failed to get file list: ${error.message}`);
    }
  }
  public static async getRepositoryBranches(token: string, owner: string, repo: string) {
    const data = await this.fetchRepositoryBranches(token, owner, repo);
    try {
      const project = await prisma.project.findFirst({
        where: {
          repoName: repo,
          owner: owner,
        },
      });
      return this.parseRepositoryBranches(data, project?.defaultBranch || '');
    } catch (error) {
      return this.parseRepositoryBranches(data, '');
    }
  }
  public static async getRepositoryTree(
    token: string,
    owner: string,
    repo: string,
    branch: string,
    path = '',
  ) {
    const data = await this.fetchRepositoryTree(token, owner, repo, branch, path);
    return this.parseRepositoryTree(data);
  }
  private static async fetchRepositoryTree(
    token: string,
    owner: string,
    repo: string,
    branch: string,
    path = '',
  ) {
    try {
      const query = gql`
                query {
                    repository(owner: "${owner}", name: "${repo}") {
                        object(expression: "${branch}:${path}") {
                            ... on Tree {
                                entries {
                                    name
                                    type
                                    mode
                                }
                            }
                        }
                    }
                }`;
      const data = await MetaUtils._queryRunner(token, query);
      if (!data) return null;
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch repository tree: ${error.message}`);
    }
  }
  private static async parseRepositoryTree(data: any) {
    if (!data) return null;
    const entries = data.repository.object.entries;
    const tree = entries.map((entry: any) => ({
      name: entry.name,
      type: entry.type,
      mode: entry.mode,
    }));
    return tree;
  }
  private static async fetchRepositoryBranches(token: string, owner: string, repo: string) {
    try {
      const query = gql`
                   query GetDefaultBranch {
                        repository(owner: "${owner}", name: "${repo}") {
                            defaultBranchRef {
                                name
                            }
                            refs(refPrefix: "refs/heads/", first: 100) {
                                nodes {
                                    name
                                }
                            }
                        }   
                    }`;
      const data = await MetaUtils._queryRunner(token, query);
      if (!data) return null;
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch repository branches: ${error.message}`);
    }
  }
  private static async parseRepositoryBranches(data: any, _defaultBranch: string) {
    if (!data) return null;
    const defaultBranch =
      _defaultBranch != '' ? _defaultBranch : data.repository.defaultBranchRef.name;
    const branches = data.repository.refs.nodes.map((node: any) => node.name);
    return {
      defaultBranch,
      branches,
    };
  }
  private static async _queryRunner(token: string, query: string): Promise<any> {
    try {
      if (!token || !this.GITHUB_API_URL || !query) {
        throw new Error('Missing required parameters in _queryRunner');
      }
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const data = await request(this.GITHUB_API_URL, query, {}, headers);
      return data;
    } catch (error) {
      throw new Error(`Failed to execute GraphQL query: ${error.message}`);
    }
  }
  private static extractPathFromUrl(url: string): string {
    if (url.includes('github.com')) {
      const urlParts = url.split('/');
      const blobIndex = urlParts.indexOf('blob');
      if (blobIndex !== -1 && blobIndex + 2 < urlParts.length) {
        return urlParts.slice(blobIndex + 2).join('/');
      }
    }
    return url;
  }
  private static queryBuilder(paths: string[]): string {
    const processedPaths = paths.map((path) => {
      if (path.includes('github.com')) {
        const urlParts = path.split('/');
        const blobIndex = urlParts.indexOf('blob');

        if (blobIndex !== -1 && blobIndex + 1 < urlParts.length) {
          const branch = urlParts[blobIndex + 1];
          const actualPath = urlParts.slice(blobIndex + 2).join('/');
          return { branch, path: actualPath };
        }
      } else if (path.includes('/blob/')) {
        const parts = path.split('/blob/');
        if (parts.length === 2) {
          const branchAndPath = parts[1].split('/', 1);
          const branch = branchAndPath[0];
          const actualPath = parts[1].substring(branch.length + 1);
          return { branch, path: actualPath };
        }
      } else if (path.startsWith('blob/')) {
        const parts = path.split('/');
        if (parts.length >= 3) {
          const branch = parts[1];
          const actualPath = parts.slice(2).join('/');
          return { branch, path: actualPath };
        }
      }

      return { branch: 'main', path };
    });

    return processedPaths
      .map(
        (item, index) => `
          file${index}: object(expression: "${item.branch}:${item.path}") {
            ... on Blob {
              text
            }
          }
        `,
      )
      .join('\n');
  }
  private static async getOID(token: string, owner: string, repo: string, branch: string) {
    try {
      const query = gql`
                query {
                    repository(owner: "${owner}", name: "${repo}") {
                        ref(qualifiedName: "refs/heads/${branch}") {
                            target {
                                ... on Commit {
                                    oid
                                }
                            }
                        }
                    }
                }`;
      const data = await MetaUtils._queryRunner(token, query);
      if (!data) return null;
      const repository = (data as any).repository;
      if (!repository) return null;
      return repository.ref.target.oid;
    } catch (error) {
      throw new Error(`Failed to get OID: ${error.message}`);
    }
  }
}
