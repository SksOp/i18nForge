import { FileContentForCommit, MetaUtils } from './meta.utils';




export const MetaAPI = {
  getBranchList: (token: string, owner: string, repo: string) => {
    return MetaUtils.getRepositoryBranches(token, owner, repo);
  },
  getTree: (token: string, owner: string, repo: string, branch: string, path = '') => {
    return MetaUtils.getRepositoryTree(token, owner, repo, branch, path);
  },
  createBranch: (token: string, owner: string, repo: string, branch: string) => {
    return MetaUtils.createBranch(token, owner, repo, branch);
  },
  commitContent: (
    token: string,
    owner: string,
    repo: string,
    branch: string,
    fileContent: FileContentForCommit[],
    message: string,
  ) => {
    return MetaUtils.commitContent(token, owner, repo, branch, fileContent, message);
  },
  createPullRequest: (
    token: string,
    owner: string,
    repo: string,
    branch: string,
    title: string,
    body: string,
  ) => {
    return MetaUtils.createPullRequest(token, owner, repo, branch, title, body);
  },
  getFileList: (token: string, owner: string, repo: string, branch: string, path: string) => {
    return MetaUtils.getFileList(token, owner, repo, branch, path);
  },
  getFilesContent: (paths: string[], token: string, name: string) => {
    return MetaUtils.getFileContent(paths, token, name);
  },
};
