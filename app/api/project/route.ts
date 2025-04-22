import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { getUser } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, owner, ownerType, paths, repoName, branch } = body;

    if (!name || !owner || !ownerType || !paths || !repoName || !branch) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingProject = await prisma.project.findFirst({
      where: {
        name,
        userId: session.githubId,
      },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: "A project with this name already exists" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        githubId: session.githubId,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        owner,
        ownerType,
        paths,
        userId: user?.id,
        repoName,
        defaultBranch: branch,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUser(session.githubId);
    const projects = await prisma.project.findMany({
      where: {
        userId: user?.id,
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
