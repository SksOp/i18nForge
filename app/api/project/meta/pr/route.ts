import { NextRequest, NextResponse } from "next/server";
import { MetaAPI } from "../meta.expose";

export async function POST(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const token = request.headers.get('x-user-accessToken');
        const owner = searchParams.get("owner");
        const repo = searchParams.get("repo");
        const branch = searchParams.get("branch");

        if (!token || !owner || !repo || !branch) {
            return NextResponse.json(
                { error: "Missing required parameters" },
                { status: 400 }
            );
        }

        const requestBody = await request.json();
        const { title, description } = requestBody;

        if (!title || !description) {
            return NextResponse.json(
                { error: "Missing title or description in request body" },
                { status: 400 }
            );
        }

        const pr = await MetaAPI.createPullRequest(token, owner, repo, branch, title, description);
        return NextResponse.json(pr);
    } catch (error) {
        console.error("Error creating pull request:", error);
        return NextResponse.json(
            { error: "Failed to create pull request" },
            { status: 500 }
        );
    }
}
