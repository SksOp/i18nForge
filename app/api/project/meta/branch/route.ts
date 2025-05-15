import { NextRequest, NextResponse } from "next/server";
import { MetaAPI } from "../meta.expose";
import prisma from "@/lib/prisma";
import { getOwnerAndRepo } from "../meta.comman";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = session.accessToken;
    const repo = request.nextUrl.searchParams.get("repo");
    const userName = request.nextUrl.searchParams.get("userName");
    if (!repo || repo === "" || userName === null || token === null) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const branches = await MetaAPI.getBranchList(token, userName, repo);
    return NextResponse.json(branches);
  } catch (error) {
    console.error("Error fetching branches:", error);
    return NextResponse.json(
      { error: "Failed to fetch branches" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = session.accessToken;
    const branch = searchParams.get("branch");
    const id = searchParams.get("id");
    if (!token || !id || id === "" || branch === null) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }
    const { owner, repo } = await getOwnerAndRepo(id);
    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }
    const newBranch = await MetaAPI.createBranch(token, owner, repo, branch);
    return NextResponse.json(newBranch);
  } catch (error) {
    console.error("Error creating branch:", error);
    return NextResponse.json(
      { error: "Failed to create branch" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = session.accessToken;
    const branch = searchParams.get("branch");
    const id = searchParams.get("id");
    if (!token || !id || id === "" || branch === null) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }
    const project = await prisma.project.findUnique({
      where: {
        id: id,
      },
    });
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }
    const updatedProject = await prisma.project.update({
      where: { id: id },
      data: { defaultBranch: branch },
    });
    return NextResponse.json({
      message: "Branch updated successfully",
    });
  } catch (error) {
    console.error("Error updating branch:", error);
    return NextResponse.json(
      { error: "Failed to update branch" },
      { status: 500 }
    );
  }
}
