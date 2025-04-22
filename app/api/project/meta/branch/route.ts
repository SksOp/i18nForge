import { NextRequest, NextResponse } from "next/server";
import { MetaAPI } from "../meta.expose";
import prisma from "@/lib/prisma";
import { getOwnerAndRepo } from "../meta.comman";



export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('x-user-accessToken');
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
        const token = request.headers.get('x-user-accessToken');
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
