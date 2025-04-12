import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { mapInstallation } from "../route";

export async function GET(
  request: Request,
  { params }: { params: { installationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const installation = await prisma.installation.findUnique({
      where: {
        installationId: params.installationId,
      },
    });

    if (!installation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(mapInstallation(installation));
  } catch (error) {
    console.error("Error fetching installation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
