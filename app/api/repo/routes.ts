import { useSession } from "next-auth/react";


// REF: https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#get-a-repository
/*
curl -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <YOUR-TOKEN>" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/OWNER/REPO
*/
export async function GET(request: Request) {
    const { data: session } = useSession();

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }
    const accessToken = session.accessToken;
    const response = await fetch("https://api.github.com/repos/OWNER/REPO", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-GitHub-Api-Version": "2022-11-28",
            "Accept": "application/vnd.github+json",
        },
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
}