import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }
        const project = await prisma.project.findUnique({
            where: {
                id: id,
            },
        });
        return NextResponse.json({ defaultBranch: project?.defaultBranch });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch default branch" }, { status: 500 });
    }
}