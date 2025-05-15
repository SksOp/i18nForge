import { NextRequest, NextResponse } from "next/server";
import { MetaAPI } from "../meta.expose";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { FileContentForCommit } from "../meta.utils";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

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
        id: id ?? "",
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const requestBody = await request.json();
    const { branch, content } = requestBody;

    if (!branch || !content) {
      return NextResponse.json(
        { error: "Missing content in request body" },
        { status: 400 }
      );
    }

    const paths = project.paths as {
      path: string;
      projectPath: string;
      language: string;
    }[];
    const fileContent: FileContentForCommit[] = content.map(
      (file: { path: string; language: string; content: string }) => {
        const matchedPath = paths.find(
          (p) => p.language.toLowerCase() === file.path.toLowerCase()
        );
        if (!matchedPath) {
          throw new Error(
            `No matching path found for language: ${file.language}`
          );
        }
        return {
          path: matchedPath.path.startsWith("/")
            ? matchedPath.path.slice(1)
            : matchedPath.path,
          content: JSON.stringify(JSON.parse(file.content), null, 2),
          branch: branch,
        };
      }
    );
    const result = await MetaAPI.commitContent(
      session.accessToken,
      project.owner,
      project.repoName,
      branch,
      fileContent,
      message
    );
    return NextResponse.json({
      status: 200,
      message: "Commit successful",
      result,
    });
  } catch (error) {
    console.error("Error committing changes:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to commit changes",
      },
      { status: 500 }
    );
  }
}
