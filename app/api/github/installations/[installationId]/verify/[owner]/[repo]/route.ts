import { NextResponse } from "next/server";
import { verifyRepoAccess } from "@/app/api/github/utils";

export async function GET(
  request: Request,
  {
    params,
  }: { params: { installationId: string; owner: string; repo: string } }
) {
  try {
    const response = await verifyRepoAccess(
      params.installationId,
      params.owner,
      params.repo
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
