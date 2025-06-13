//https://api.github.com/search/commits?q=repo:nginH/lang-test+author:i18-githubapp[bot]&per_page=10&page=1

export const GetComitsHistory = async (
  token: string,
  repo: string,
  userName: string,
  per_page = 10,
  page = 1,
) => {
  console.log('token', token);
  console.log('repo', repo);
  console.log('userName', userName);
  console.log('per_page', per_page);
  console.log('page', page);
  const requestURI = `https://api.github.com/search/commits?q=repo:${repo}+author:${userName}&per_page=${per_page}&page=${page}`;

  const response = await fetch(requestURI, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  const data = await response.json();
  console.log('response', data);
  if (data.message === 'Validation Failed') {
    throw new Error('Invalid repository or user name');
  }
  const items = data.items;
  console.log('items', items);
  const commits = items.map((item: any) => ({
    author: item.commit.author.name,
    date: item.commit.committer.date,
    message: item.commit.message,
    comment: {
      directCommentUri: item.comments_url,
      count: item.commit.comment_count,
    },
    githubPreviewUri: item.html_url,
    sha: item.sha,
  }));

  return commits;
};

/**
 * 
 *    {
    "total_count": 2,
    "incomplete_results": false,
    "items": [
        {
            "url": "https://api.github.com/repos/nginH/lang-test/commits/52ed9427902d67dcb4705d1f2b37d20c7ee0cf76",
            "sha": "52ed9427902d67dcb4705d1f2b37d20c7ee0cf76",
            "node_id": "MDY6Q29tbWl0OTcwNTkzNjA4OjUyZWQ5NDI3OTAyZDY3ZGNiNDcwNWQxZjJiMzdkMjBjN2VlMGNmNzY=",
            "html_url": "https://github.com/nginH/lang-test/commit/52ed9427902d67dcb4705d1f2b37d20c7ee0cf76",
            "comments_url": "https://api.github.com/repos/nginH/lang-test/commits/52ed9427902d67dcb4705d1f2b37d20c7ee0cf76/comments",
            "commit": {
                "url": "https://api.github.com/repos/nginH/lang-test/git/commits/52ed9427902d67dcb4705d1f2b37d20c7ee0cf76",
                "author": {
                    "date": "2025-06-05T18:36:06.000Z",
                    "name": "i18-githubapp[bot]",
                    "email": "212762589+i18-githubapp[bot]@users.noreply.github.com"
                },
                "committer": {
                    "date": "2025-06-05T18:36:06.000Z",
                    "name": "GitHub",
                    "email": "noreply@github.com"
                },
                "message": "jbkjjk",
                "tree": {
                    "url": "https://api.github.com/repos/nginH/lang-test/git/trees/13d991b14d93f60b2bf89c0071903e7f213e24b5",
                    "sha": "13d991b14d93f60b2bf89c0071903e7f213e24b5"
                },
                "comment_count": 0
            },
            "author": {
                "login": "i18-githubapp[bot]",
                "id": 212762589,
                "node_id": "BOT_kgDODK5_3Q",
                "avatar_url": "https://avatars.githubusercontent.com/u/80211435?v=4",
                "gravatar_id": "",
                "url": "https://api.github.com/users/i18-githubapp%5Bbot%5D",
                "html_url": "https://github.com/apps/i18-githubapp",
                "followers_url": "https://api.github.com/users/i18-githubapp%5Bbot%5D/followers",
                "following_url": "https://api.github.com/users/i18-githubapp%5Bbot%5D/following{/other_user}",
                "gists_url": "https://api.github.com/users/i18-githubapp%5Bbot%5D/gists{/gist_id}",
                "starred_url": "https://api.github.com/users/i18-githubapp%5Bbot%5D/starred{/owner}{/repo}",
                "subscriptions_url": "https://api.github.com/users/i18-githubapp%5Bbot%5D/subscriptions",
                "organizations_url": "https://api.github.com/users/i18-githubapp%5Bbot%5D/orgs",
                "repos_url": "https://api.github.com/users/i18-githubapp%5Bbot%5D/repos",
                "events_url": "https://api.github.com/users/i18-githubapp%5Bbot%5D/events{/privacy}",
                "received_events_url": "https://api.github.com/users/i18-githubapp%5Bbot%5D/received_events",
                "type": "Bot",
                "user_view_type": "public",
                "site_admin": false
            },
            "committer": {
                "login": "web-flow",
                "id": 19864447,
                "node_id": "MDQ6VXNlcjE5ODY0NDQ3",
                "avatar_url": "https://avatars.githubusercontent.com/u/19864447?v=4",
                "gravatar_id": "",
                "url": "https://api.github.com/users/web-flow",
                "html_url": "https://github.com/web-flow",
                "followers_url": "https://api.github.com/users/web-flow/followers",
                "following_url": "https://api.github.com/users/web-flow/following{/other_user}",
                "gists_url": "https://api.github.com/users/web-flow/gists{/gist_id}",
                "starred_url": "https://api.github.com/users/web-flow/starred{/owner}{/repo}",
                "subscriptions_url": "https://api.github.com/users/web-flow/subscriptions",
                "organizations_url": "https://api.github.com/users/web-flow/orgs",
                "repos_url": "https://api.github.com/users/web-flow/repos",
                "events_url": "https://api.github.com/users/web-flow/events{/privacy}",
                "received_events_url": "https://api.github.com/users/web-flow/received_events",
                "type": "User",
                "user_view_type": "public",
                "site_admin": false
            },
            "parents": [
                {
                    "url": "https://api.github.com/repos/nginH/lang-test/commits/dda0565016a3eca65da766727cb0a2f3ee46d922",
                    "html_url": "https://github.com/nginH/lang-test/commit/dda0565016a3eca65da766727cb0a2f3ee46d922",
                    "sha": "dda0565016a3eca65da766727cb0a2f3ee46d922"
                }
            ],
            "repository": {
                "id": 970593608,
                "node_id": "R_kgDOOdoVSA",
                "name": "lang-test",
                "full_name": "nginH/lang-test",
                "private": true,
                "owner": {
                    "login": "nginH",
                    "id": 80211435,
                    "node_id": "MDQ6VXNlcjgwMjExNDM1",
                    "avatar_url": "https://avatars.githubusercontent.com/u/80211435?v=4",
                    "gravatar_id": "",
                    "url": "https://api.github.com/users/nginH",
                    "html_url": "https://github.com/nginH",
                    "followers_url": "https://api.github.com/users/nginH/followers",
                    "following_url": "https://api.github.com/users/nginH/following{/other_user}",
                    "gists_url": "https://api.github.com/users/nginH/gists{/gist_id}",
                    "starred_url": "https://api.github.com/users/nginH/starred{/owner}{/repo}",
                    "subscriptions_url": "https://api.github.com/users/nginH/subscriptions",
                    "organizations_url": "https://api.github.com/users/nginH/orgs",
                    "repos_url": "https://api.github.com/users/nginH/repos",
                    "events_url": "https://api.github.com/users/nginH/events{/privacy}",
                    "received_events_url": "https://api.github.com/users/nginH/received_events",
                    "type": "User",
                    "user_view_type": "public",
                    "site_admin": false
                },
                "html_url": "https://github.com/nginH/lang-test",
                "description": null,
                "fork": false,
                "url": "https://api.github.com/repos/nginH/lang-test",
                "forks_url": "https://api.github.com/repos/nginH/lang-test/forks",
                "keys_url": "https://api.github.com/repos/nginH/lang-test/keys{/key_id}",
                "collaborators_url": "https://api.github.com/repos/nginH/lang-test/collaborators{/collaborator}",
                "teams_url": "https://api.github.com/repos/nginH/lang-test/teams",
                "hooks_url": "https://api.github.com/repos/nginH/lang-test/hooks",
                "issue_events_url": "https://api.github.com/repos/nginH/lang-test/issues/events{/number}",
                "events_url": "https://api.github.com/repos/nginH/lang-test/events",
                "assignees_url": "https://api.github.com/repos/nginH/lang-test/assignees{/user}",
                "branches_url": "https://api.github.com/repos/nginH/lang-test/branches{/branch}",
                "tags_url": "https://api.github.com/repos/nginH/lang-test/tags",
                "blobs_url": "https://api.github.com/repos/nginH/lang-test/git/blobs{/sha}",
                "git_tags_url": "https://api.github.com/repos/nginH/lang-test/git/tags{/sha}",
                "git_refs_url": "https://api.github.com/repos/nginH/lang-test/git/refs{/sha}",
                "trees_url": "https://api.github.com/repos/nginH/lang-test/git/trees{/sha}",
                "statuses_url": "https://api.github.com/repos/nginH/lang-test/statuses/{sha}",
                "languages_url": "https://api.github.com/repos/nginH/lang-test/languages",
                "stargazers_url": "https://api.github.com/repos/nginH/lang-test/stargazers",
                "contributors_url": "https://api.github.com/repos/nginH/lang-test/contributors",
                "subscribers_url": "https://api.github.com/repos/nginH/lang-test/subscribers",
                "subscription_url": "https://api.github.com/repos/nginH/lang-test/subscription",
                "commits_url": "https://api.github.com/repos/nginH/lang-test/commits{/sha}",
                "git_commits_url": "https://api.github.com/repos/nginH/lang-test/git/commits{/sha}",
                "comments_url": "https://api.github.com/repos/nginH/lang-test/comments{/number}",
                "issue_comment_url": "https://api.github.com/repos/nginH/lang-test/issues/comments{/number}",
                "contents_url": "https://api.github.com/repos/nginH/lang-test/contents/{+path}",
                "compare_url": "https://api.github.com/repos/nginH/lang-test/compare/{base}...{head}",
                "merges_url": "https://api.github.com/repos/nginH/lang-test/merges",
                "archive_url": "https://api.github.com/repos/nginH/lang-test/{archive_format}{/ref}",
                "downloads_url": "https://api.github.com/repos/nginH/lang-test/downloads",
                "issues_url": "https://api.github.com/repos/nginH/lang-test/issues{/number}",
                "pulls_url": "https://api.github.com/repos/nginH/lang-test/pulls{/number}",
                "milestones_url": "https://api.github.com/repos/nginH/lang-test/milestones{/number}",
                "notifications_url": "https://api.github.com/repos/nginH/lang-test/notifications{?since,all,participating}",
                "labels_url": "https://api.github.com/repos/nginH/lang-test/labels{/name}",
                "releases_url": "https://api.github.com/repos/nginH/lang-test/releases{/id}",
                "deployments_url": "https://api.github.com/repos/nginH/lang-test/deployments"
            },
            "score": 1.0
        },
        {
            "url": "https://api.github.com/repos/nginH/lang-test/commits/fb21caf3c066a11fd68cc064a3c10f9f8d0a35c6",
            "sha": "fb21caf3c066a11fd68cc064a3c10f9f8d0a35c6",
            "node_id": "MDY6Q29tbWl0OTcwNTkzNjA4OmZiMjFjYWYzYzA2NmExMWZkNjhjYzA2NGEzYzEwZjlmOGQwYTM1YzY=",
            "html_url": "https://github.com/nginH/lang-test/commit/fb21caf3c066a11fd68cc064a3c10f9f8d0a35c6",
            "comments_url": "https://api.github.com/repos/nginH/lang-test/commits/fb21caf3c066a11fd68cc064a3c10f9f8d0a35c6/comments",
            "commit": {
                "url": "https://api.github.com/repos/nginH/lang-test/git/commits/fb21caf3c066a11fd68cc064a3c10f9f8d0a35c6",
                "author": {
                    "date": "2025-06-06T16:14:52.000Z",
                    "name": "i18-githubapp[bot]",
                    "email": "212762589+i18-githubapp[bot]@users.noreply.github.com"
                },
                "committer": {
                    "date": "2025-06-06T16:14:52.000Z",
                    "name": "GitHub",
                    "email": "noreply@github.com"
                },
                "message": "this is  a test message",
                "tree": {
                    "url": "https://api.github.com/repos/nginH/lang-test/git/trees/023226d025d157472d663b5ce4d3d7690f46ab4f",
                    "sha": "023226d025d157472d663b5ce4d3d7690f46ab4f"
                },
                "comment_count": 0
            },
            "author": {
                "login": "i18-githubapp[bot]",
                "id": 212762589,
                "node_id": "BOT_kgDODK5_3Q",
                "avatar_url": "https://avatars.githubusercontent.com/u/80211435?v=4",
                "gravatar_id": "",
                "url": "https://api.github.com/users/i18-githubapp%5Bbot%5D",
                "html_url": "https://github.com/apps/i18-githubapp",
                "followers_url": "https://api.github.com/users/i18-githubapp%5Bbot%5D/followers",
                "following_url": "https://api.github.com/users/i18-githubapp%5Bbot%5D/following{/other_user}",
                "gists_url": "https://api.github.com/users/i18-githubapp%5Bbot%5D/gists{/gist_id}",
                "starred_url": "https://api.github.com/users/i18-githubapp%5Bbot%5D/starred{/owner}{/repo}",
                "subscriptions_url": "https://api.github.com/users/i18-githubapp%5Bbot%5D/subscriptions",
                "organizations_url": "https://api.github.com/users/i18-githubapp%5Bbot%5D/orgs",
                "repos_url": "https://api.github.com/users/i18-githubapp%5Bbot%5D/repos",
                "events_url": "https://api.github.com/users/i18-githubapp%5Bbot%5D/events{/privacy}",
                "received_events_url": "https://api.github.com/users/i18-githubapp%5Bbot%5D/received_events",
                "type": "Bot",
                "user_view_type": "public",
                "site_admin": false
            },
            "committer": {
                "login": "web-flow",
                "id": 19864447,
                "node_id": "MDQ6VXNlcjE5ODY0NDQ3",
                "avatar_url": "https://avatars.githubusercontent.com/u/19864447?v=4",
                "gravatar_id": "",
                "url": "https://api.github.com/users/web-flow",
                "html_url": "https://github.com/web-flow",
                "followers_url": "https://api.github.com/users/web-flow/followers",
                "following_url": "https://api.github.com/users/web-flow/following{/other_user}",
                "gists_url": "https://api.github.com/users/web-flow/gists{/gist_id}",
                "starred_url": "https://api.github.com/users/web-flow/starred{/owner}{/repo}",
                "subscriptions_url": "https://api.github.com/users/web-flow/subscriptions",
                "organizations_url": "https://api.github.com/users/web-flow/orgs",
                "repos_url": "https://api.github.com/users/web-flow/repos",
                "events_url": "https://api.github.com/users/web-flow/events{/privacy}",
                "received_events_url": "https://api.github.com/users/web-flow/received_events",
                "type": "User",
                "user_view_type": "public",
                "site_admin": false
            },
            "parents": [
                {
                    "url": "https://api.github.com/repos/nginH/lang-test/commits/52ed9427902d67dcb4705d1f2b37d20c7ee0cf76",
                    "html_url": "https://github.com/nginH/lang-test/commit/52ed9427902d67dcb4705d1f2b37d20c7ee0cf76",
                    "sha": "52ed9427902d67dcb4705d1f2b37d20c7ee0cf76"
                }
            ],
            "repository": {
                "id": 970593608,
                "node_id": "R_kgDOOdoVSA",
                "name": "lang-test",
                "full_name": "nginH/lang-test",
                "private": true,
                "owner": {
                    "login": "nginH",
                    "id": 80211435,
                    "node_id": "MDQ6VXNlcjgwMjExNDM1",
                    "avatar_url": "https://avatars.githubusercontent.com/u/80211435?v=4",
                    "gravatar_id": "",
                    "url": "https://api.github.com/users/nginH",
                    "html_url": "https://github.com/nginH",
                    "followers_url": "https://api.github.com/users/nginH/followers",
                    "following_url": "https://api.github.com/users/nginH/following{/other_user}",
                    "gists_url": "https://api.github.com/users/nginH/gists{/gist_id}",
                    "starred_url": "https://api.github.com/users/nginH/starred{/owner}{/repo}",
                    "subscriptions_url": "https://api.github.com/users/nginH/subscriptions",
                    "organizations_url": "https://api.github.com/users/nginH/orgs",
                    "repos_url": "https://api.github.com/users/nginH/repos",
                    "events_url": "https://api.github.com/users/nginH/events{/privacy}",
                    "received_events_url": "https://api.github.com/users/nginH/received_events",
                    "type": "User",
                    "user_view_type": "public",
                    "site_admin": false
                },
                "html_url": "https://github.com/nginH/lang-test",
                "description": null,
                "fork": false,
                "url": "https://api.github.com/repos/nginH/lang-test",
                "forks_url": "https://api.github.com/repos/nginH/lang-test/forks",
                "keys_url": "https://api.github.com/repos/nginH/lang-test/keys{/key_id}",
                "collaborators_url": "https://api.github.com/repos/nginH/lang-test/collaborators{/collaborator}",
                "teams_url": "https://api.github.com/repos/nginH/lang-test/teams",
                "hooks_url": "https://api.github.com/repos/nginH/lang-test/hooks",
                "issue_events_url": "https://api.github.com/repos/nginH/lang-test/issues/events{/number}",
                "events_url": "https://api.github.com/repos/nginH/lang-test/events",
                "assignees_url": "https://api.github.com/repos/nginH/lang-test/assignees{/user}",
                "branches_url": "https://api.github.com/repos/nginH/lang-test/branches{/branch}",
                "tags_url": "https://api.github.com/repos/nginH/lang-test/tags",
                "blobs_url": "https://api.github.com/repos/nginH/lang-test/git/blobs{/sha}",
                "git_tags_url": "https://api.github.com/repos/nginH/lang-test/git/tags{/sha}",
                "git_refs_url": "https://api.github.com/repos/nginH/lang-test/git/refs{/sha}",
                "trees_url": "https://api.github.com/repos/nginH/lang-test/git/trees{/sha}",
                "statuses_url": "https://api.github.com/repos/nginH/lang-test/statuses/{sha}",
                "languages_url": "https://api.github.com/repos/nginH/lang-test/languages",
                "stargazers_url": "https://api.github.com/repos/nginH/lang-test/stargazers",
                "contributors_url": "https://api.github.com/repos/nginH/lang-test/contributors",
                "subscribers_url": "https://api.github.com/repos/nginH/lang-test/subscribers",
                "subscription_url": "https://api.github.com/repos/nginH/lang-test/subscription",
                "commits_url": "https://api.github.com/repos/nginH/lang-test/commits{/sha}",
                "git_commits_url": "https://api.github.com/repos/nginH/lang-test/git/commits{/sha}",
                "comments_url": "https://api.github.com/repos/nginH/lang-test/comments{/number}",
                "issue_comment_url": "https://api.github.com/repos/nginH/lang-test/issues/comments{/number}",
                "contents_url": "https://api.github.com/repos/nginH/lang-test/contents/{+path}",
                "compare_url": "https://api.github.com/repos/nginH/lang-test/compare/{base}...{head}",
                "merges_url": "https://api.github.com/repos/nginH/lang-test/merges",
                "archive_url": "https://api.github.com/repos/nginH/lang-test/{archive_format}{/ref}",
                "downloads_url": "https://api.github.com/repos/nginH/lang-test/downloads",
                "issues_url": "https://api.github.com/repos/nginH/lang-test/issues{/number}",
                "pulls_url": "https://api.github.com/repos/nginH/lang-test/pulls{/number}",
                "milestones_url": "https://api.github.com/repos/nginH/lang-test/milestones{/number}",
                "notifications_url": "https://api.github.com/repos/nginH/lang-test/notifications{?since,all,participating}",
                "labels_url": "https://api.github.com/repos/nginH/lang-test/labels{/name}",
                "releases_url": "https://api.github.com/repos/nginH/lang-test/releases{/id}",
                "deployments_url": "https://api.github.com/repos/nginH/lang-test/deployments"
            },
            "score": 1.0
        }
    ]
}
 */
