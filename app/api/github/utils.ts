import prisma from "@/lib/prisma";
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import { GitHubRepo } from "./types";

export const githubAppAuth = createAppAuth({
  appId: process.env.GITHUB_APP_ID!,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
  clientId: process.env.GITHUB_ID,
  clientSecret: process.env.GITHUB_SECRET,
});

export const getUserOrgs = async (accessToken: string) => {
  const octokit = new Octokit({
    auth: accessToken,
  });

  const response = await octokit.request("GET /user/orgs", {
    headers: { "X-GitHub-Api-Version": "2022-11-28" },
  });

  return response.data;
};

// export const
export const getAllOrgInstallations = async (
  orgs: {
    login: string;
    id: number;
  }[]
) => {
  const installations = await prisma.installation.findMany({
    where: {
      githubId: {
        in: orgs.map((org) => org.id.toString()),
      },
      type: "Organization",
    },
  });

  return installations;
};

export const getUserSelfInstallation = async (githubId: string) => {
  // console.log("githubId", githubId);
  const installation = await prisma.installation.findUnique({
    where: {
      githubId,
      type: "User",
    },
  });

  return installation;
};

export const getUserRepos = async (
  pageOptions: { per_page: number; page: number; search: string },
  accessToken: string
) => {
  const octokit = new Octokit({
    auth: accessToken,
  });

  const response = await octokit.request("GET /search/repositories", {
    headers: { "X-GitHub-Api-Version": "2022-11-28" },
    q: `${pageOptions.search} user:@me`,
    per_page: pageOptions.per_page,
    page: pageOptions.page,
    sort: "updated",
    order: "desc",
  });

  return response.data.items as GitHubRepo[];
};

export const getOrgRepos = async (
  org: string,
  pageOptions: { per_page: number; page: number; search: string },
  accessToken: string
) => {
  const octokit = new Octokit({
    auth: accessToken,
  });

  const response = await octokit.request("GET /search/repositories", {
    headers: { "X-GitHub-Api-Version": "2022-11-28" },
    q: `${pageOptions.search} org:${org}`,
    per_page: pageOptions.per_page,
    page: pageOptions.page,
    sort: "updated",
    order: "desc",
  });

  return response.data.items as GitHubRepo[];
};

export const verifyRepoAccess = async (
  installationId: string,
  owner: string,
  repo: string,
  username: string
) => {
  const installationAuth = await githubAppAuth({
    type: "installation",
    installationId,
  });

  const octokit = new Octokit({
    auth: installationAuth.token,
  });

  try {
    const resp = await octokit.request(
      "GET /repos/{owner}/{repo}/collaborators/{username}/permission",
      {
        owner,
        repo,
        username,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    return resp.data.permission === "admin" || resp.data.permission === "write";
  } catch (error: any) {
    if (error.status === 404) {
      return false;
    }
    throw error;
  }
};
