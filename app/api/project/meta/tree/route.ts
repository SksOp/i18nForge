import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { MetaAPI } from "../meta.expose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { GetGitHubAccessTokenViaApp } from "@/app/api/global.utils";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const accessToken = await GetGitHubAccessTokenViaApp(session.githubId);
  if (!accessToken) {
    return NextResponse.json(
      { error: "Missing access token" },
      { status: 400 }
    );
  }

  const body = await request.json();
  let { repo, userName, branch, path } = body;

  if (path) {
    path = path.startsWith("/") ? path.slice(1) : path;
  }

  if (!repo || !userName || !branch) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  const data = await MetaAPI.getTree(
    accessToken,
    userName,
    repo,
    branch,
    path ?? ""
  );
  return NextResponse.json(data);
}
