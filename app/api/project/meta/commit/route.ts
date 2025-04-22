import { NextRequest, NextResponse } from "next/server";
import { MetaAPI } from "../meta.expose";

export async function POST(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const token = request.headers.get('x-user-accessToken');
        const owner = searchParams.get("owner");
        const repo = searchParams.get("repo");
        const branch = searchParams.get("branch");
        const path = searchParams.get("path");
        const message = searchParams.get("message");

        if (!token || !owner || !repo || !branch || !path || !message) {
            return NextResponse.json(
                { error: "Missing required parameters" },
                { status: 400 }
            );
        }

        const requestBody = await request.json();
        const { content } = requestBody;

        if (!content) {
            return NextResponse.json(
                { error: "Missing content in request body" },
                { status: 400 }
            );
        }

        const result = await MetaAPI.commitContent(token, owner, repo, branch, path, content, message);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error committing changes:", error);
        return NextResponse.json(
            { error: "Failed to commit changes" },
            { status: 500 }
        );
    }
}
