import { NextResponse } from "next/server";
import { verifyRepoAccess } from "@/app/api/github/utils";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
export async function GET(
  request: Request,
  {
    params,
  }: { params: { installationId: string; owner: string; repo: string } }
) {
  try {
    const session = await getServerSession(authOptions);

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
