import { NextResponse } from "next/server";
import { verifyRepoAccess } from "@/app/api/github/utils";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
type Params = Promise<{
  installationId: string;
  owner: string;
  repo: string;
}>;
export async function GET(request: Request, data: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);
    const params = await data.params;
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await verifyRepoAccess(
      params.installationId,
      params.owner,
      params.repo,
      session.username!
    );
    return NextResponse.json({ hasAccess: response });
  } catch (error) {
    console.error("Error verifying repository:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
