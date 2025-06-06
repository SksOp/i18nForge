import { NextResponse } from "next/server";
import {
  getAllOrgInstallations,
  getUserOrgs,
  getUserSelfInstallation,
} from "../utils";
import { authOptions } from "../../auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { mapInstallation } from "./utils";
import { GetGitHubAccessTokenViaApp } from "../../global.utils";

export type Installation = {
  id: string;
  installationId: string;
  type: "Organization" | "User";
  name: string;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    // console.log(session);

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgs = await getUserOrgs(
      await GetGitHubAccessTokenViaApp(session.githubId)
    );
    // console.log(session);
    const installations = await getAllOrgInstallations(orgs);
    const userInstallation = await getUserSelfInstallation(session.githubId);

    return NextResponse.json(
      [userInstallation, ...installations]
        .filter((installation) => installation !== null)
        .map(mapInstallation)
    );
  } catch (error) {
    console.error("Error fetching installations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
