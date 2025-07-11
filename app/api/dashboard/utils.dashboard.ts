//https://api.github.com/search/commits?q=repo:nginH/lang-test+author:i18-githubapp[bot]&per_page=10&page=1

export const GetComitsHistory = async (
    token: string,
    repo: string,
    userName: string,
    per_page = 10,
    page = 1,
) => {
    const requestURI = `https://api.github.com/search/commits?q=repo:${repo}+author:${userName}&per_page=${per_page}&page=${page}`;

    const response = await fetch(requestURI, {
        headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
        },
    });
    const data = await response.json();
    if (data.message === 'Validation Failed') {
        throw new Error('Invalid repository or user name');
    }
    const items = data.items;
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