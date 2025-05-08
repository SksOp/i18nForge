import { NextRequest, NextResponse } from "next/server";
import { MetaAPI } from "../meta.expose";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { FileContentForCommit } from "../meta.utils";

export async function POST(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const session = await getServerSession(authOptions);

        if (!session?.accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = searchParams.get("id");
        const message = searchParams.get("message");
        if (!id || !message) {
            return NextResponse.json(
                { error: "Missing required parameters" },
                { status: 400 }
            );
        }
        const project = await prisma.project.findUnique({
            where: {
                id: id ?? ""
            }
        });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }


        const requestBody = await request.json();
        const { branch, content } = requestBody;
        const fileContent: FileContentForCommit[] = content.map((file: any) => ({
            path: file.path,
            content: file.content,
            branch: branch,
        }));
        console.log("fileContent", fileContent);
        if (!branch || !content) {
            return NextResponse.json(
                { error: "Missing content in request body" },
                { status: 400 }
            );
        }

        // return NextResponse.json({
        //     status: 200,
        //     message: "Commit successful"
        // });

        const result = await MetaAPI.commitContent(session.accessToken, project.owner, project.repoName, branch, fileContent, message);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error committing changes:", error);
        return NextResponse.json(
            { error: "Failed to commit changes" },
            { status: 500 }
        );
    }
}
