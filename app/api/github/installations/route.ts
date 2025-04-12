import { NextResponse } from "next/server";
import {
  getAllOrgInstallations,
  getUserOrgs,
  getUserSelfInstallation,
} from "../utils";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { Installation as DBInstallation } from "@prisma/client";

export type Installation = {
  id: string;
  installationId: string;
  type: "Organization" | "User";
  name: string;
};

export const mapInstallation = (installation: DBInstallation): Installation => {
  return {
    id: installation.id,
    installationId: installation.installationId,
    type: installation.type as "Organization" | "User",
    name: installation.githubName,
  };
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgs = await getUserOrgs(session.accessToken);
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
