import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name } = body;
        console.log("name", name);
        if (!name) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }
        const existingProject = await prisma.project.findFirst({
            where: {
                name,
            },
        });
        return NextResponse.json({
            isExisting: existingProject ? true : false,
            projectId: existingProject?.id || null,
        });
    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json(
            { error: "Failed to create project" },
            { status: 500 }
        );
    }
}