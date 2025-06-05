import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { ColabService } from "./colab/core.colab";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, emails } = body;

    if (!projectId || !emails) {
      return NextResponse.json({ error: "Project ID and email are required" }, { status: 400 });
    }


    const colabService = new ColabService();
    const result = await colabService.inviteCollaborator(projectId, emails, session.user?.name || "i18nForge Team");

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error inviting collaborator:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
